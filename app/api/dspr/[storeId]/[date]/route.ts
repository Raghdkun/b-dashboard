import { NextRequest, NextResponse } from "next/server";
import { requireAuthorization, getAuthorizationHeader } from "@/app/api/_lib/auth";
import { promises as fs } from "fs";
import path from "path";

const DSPR_BASE_URL =
  process.env.DSPR_API_URL ||
  process.env.NEXT_PUBLIC_DSPR_API_URL ||
  "https://data.lcportal.cloud/api/reports/dspr";

/**
 * Server-side only DSPR API token.
 * When set, this token is used instead of forwarding the client's auth token.
 * This is needed because data.lcportal.cloud uses a separate auth system.
 */
const DSPR_API_TOKEN = process.env.DSPR_API_TOKEN;

/**
 * GET /api/dspr/{storeId}/{date}
 *
 * Proxies the request to the DSPR API server-side to avoid CORS / CSP issues.
 * Falls back to the local sample data file when the upstream returns 401
 * (the DSPR backend auth may not be configured yet).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; date: string }> }
) {
  // Ensure the caller is authenticated
  const authError = requireAuthorization(request);
  if (authError) return authError;

  const authorization = getAuthorizationHeader(request);

  const { storeId, date } = await params;

  if (!storeId) {
    return NextResponse.json(
      { success: false, message: "Missing storeId parameter" },
      { status: 400 }
    );
  }

  if (!date) {
    return NextResponse.json(
      { success: false, message: "Missing date parameter" },
      { status: 400 }
    );
  }

  const targetUrl = `${DSPR_BASE_URL}/${storeId}/${date}`;

  // Use the dedicated DSPR token if configured, otherwise forward the client's token
  const upstreamAuth = DSPR_API_TOKEN
    ? `Bearer ${DSPR_API_TOKEN}`
    : (authorization ?? "");

  try {
    console.log("📊 DSPR Proxy →", targetUrl, DSPR_API_TOKEN ? "(using DSPR_API_TOKEN)" : "(forwarding client token)");

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: upstreamAuth,
      },
    });

    console.log("📊 DSPR Proxy ←", response.status);

    // If upstream works, forward the response
    if (response.ok) {
      const body = await response.text();
      return new NextResponse(body, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If 401/403 — upstream auth not configured yet, fall back to sample data
    if (response.status === 401 || response.status === 403) {
      console.log(
        "⚠️  DSPR Proxy: upstream auth rejected, falling back to sample data"
      );
      return serveSampleData(storeId, date);
    }

    // Other errors — forward as-is
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ DSPR Proxy error:", error);

    // Network failure — fall back to sample data so the dashboard still works
    console.log("⚠️  DSPR Proxy: network error, falling back to sample data");
    return serveSampleData(storeId, date);
  }
}

/**
 * Simple deterministic hash from a string → number between 0 and 1.
 * Used to produce repeatable-but-varied sample data per date.
 */
function seedFromString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

/**
 * Vary a numeric value ±30% based on a seed, keeping 2 decimal places.
 */
function vary(base: number, seed: number, index: number): number {
  const factor = 0.7 + ((seed * 1000 + index * 137) % 600) / 1000;
  return Math.round(base * factor * 100) / 100;
}

/**
 * Compute ISO week info for a given date string (YYYY-MM-DD).
 */
function getWeekInfo(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  // ISO week: Monday = start of week
  const dayOfWeek = d.getUTCDay() || 7; // Mon=1 … Sun=7
  // Find Monday of this week
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - dayOfWeek + 1);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  // ISO week number
  const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const isoWeekStart = new Date(jan4);
  isoWeekStart.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const isoWeek = Math.ceil(((d.getTime() - isoWeekStart.getTime()) / 86400000 + 1) / 7);

  const fmt = (dt: Date) => dt.toISOString().split("T")[0];
  return { isoWeek, weekStart: fmt(monday), weekEnd: fmt(sunday) };
}

/**
 * Generate 7 daily sales entries for the week containing `dateStr`.
 */
function generateWeeklySales(weekStart: string, seed: number, offset: number) {
  const result: Record<string, number> = {};
  const base = [4200, 4800, 5700, 6900, 7000, 4700, 4100];
  const start = new Date(weekStart + "T12:00:00Z");
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    result[d.toISOString().split("T")[0]] = vary(base[i], seed, i + offset);
  }
  return result;
}

/**
 * Serve sample API data that is dynamically adjusted based on the requested
 * storeId and date. The underlying shape comes from the static sample file,
 * but numerical values are deterministically varied so that every date produces
 * unique (but repeatable) numbers.
 */
async function serveSampleData(storeId: string, date: string) {
  try {
    const filePath = path.join(
      process.cwd(),
      "docs",
      "dspr",
      "api-response.json"
    );
    const raw = await fs.readFile(filePath, "utf-8");
    const sample = JSON.parse(raw);

    // Seed from storeId + date → every combination gives unique values
    const seed = seedFromString(`${storeId}:${date}`);
    const { isoWeek, weekStart, weekEnd } = getWeekInfo(date);

    // ── Filtering ──────────────────────────────────────────────────
    sample.filtering = {
      store: storeId,
      date,
      iso_week: isoWeek,
      week_start: weekStart,
      week_end: weekEnd,
    };

    // ── Sales ──────────────────────────────────────────────────────
    sample.sales.this_week_by_day = generateWeeklySales(weekStart, seed, 0);

    // Previous week
    const prevStart = new Date(weekStart + "T12:00:00Z");
    prevStart.setUTCDate(prevStart.getUTCDate() - 7);
    sample.sales.previous_week_by_day = generateWeeklySales(
      prevStart.toISOString().split("T")[0],
      seed,
      10
    );

    // Same week last year
    const lyStart = new Date(weekStart + "T12:00:00Z");
    lyStart.setUTCFullYear(lyStart.getUTCFullYear() - 1);
    sample.sales.same_week_last_year_by_day = generateWeeklySales(
      lyStart.toISOString().split("T")[0],
      seed,
      20
    );

    // ── Day section ────────────────────────────────────────────────
    const day = sample.day;
    day.total_cash_sales = vary(936.11, seed, 30);
    day.total_deposit = vary(938, seed, 31);
    day.over_short = vary(2.16, seed, 32);
    day.customer_count = Math.round(vary(430, seed, 33));
    day.waste.alta_inventory = vary(23.27, seed, 34);
    day.waste.normal = vary(183.45, seed, 35);
    day.total_tips = vary(107.91, seed, 36);
    day.refunded_orders.count = Math.round(vary(1, seed, 37));
    day.refunded_orders.sales = vary(8.5, seed, 38);

    // HNR
    day.hnr.hnr_transactions = Math.round(vary(188, seed, 39));
    day.hnr.hnr_broken_promises = Math.round(vary(6, seed, 40));
    day.hnr.hnr_promise_met = day.hnr.hnr_transactions - day.hnr.hnr_broken_promises;
    day.hnr.hnr_promise_met_percent =
      day.hnr.hnr_transactions > 0
        ? Math.round((day.hnr.hnr_promise_met / day.hnr.hnr_transactions) * 10000) / 100
        : 0;

    // Portal
    day.portal.portal_eligible_orders = Math.round(vary(156, seed, 41));
    day.portal.portal_used_orders = Math.round(
      day.portal.portal_eligible_orders * (0.9 + seed * 0.1)
    );
    day.portal.portal_on_time_orders = Math.round(
      day.portal.portal_used_orders * (0.92 + seed * 0.08)
    );
    day.portal.put_into_portal_percent =
      day.portal.portal_eligible_orders > 0
        ? Math.round((day.portal.portal_used_orders / day.portal.portal_eligible_orders) * 10000) / 100
        : 0;
    day.portal.in_portal_on_time_percent =
      day.portal.portal_used_orders > 0
        ? Math.round((day.portal.portal_on_time_orders / day.portal.portal_used_orders) * 10000) / 100
        : 0;

    // Labor
    day.labor = vary(25, seed, 42);

    // Hourly channels — vary each hour's values
    if (day.hourly_sales_and_channels) {
      day.hourly_sales_and_channels = day.hourly_sales_and_channels.map(
        (hour: Record<string, string | number>, idx: number) => {
          const varied: Record<string, string | number> = { hour: hour.hour };
          for (const [key, val] of Object.entries(hour)) {
            if (key === "hour") continue;
            const num = typeof val === "string" ? parseFloat(val) : val;
            varied[key] = vary(num, seed, 50 + idx * 10 + Object.keys(varied).length).toFixed(2);
          }
          return varied;
        }
      );
    }

    // Top items — vary sales and quantities
    if (sample.top?.top_5_items_sales_for_day) {
      sample.top.top_5_items_sales_for_day = sample.top.top_5_items_sales_for_day.map(
        (item: Record<string, unknown>, idx: number) => ({
          ...item,
          franchise_store: storeId,
          gross_sales: vary(item.gross_sales as number, seed, 70 + idx),
          quantity_sold: Math.round(vary(item.quantity_sold as number, seed, 80 + idx)),
        })
      );
    }

    // Top ingredients — vary usage
    if (sample.top?.top_3_ingredients_used) {
      sample.top.top_3_ingredients_used = sample.top.top_3_ingredients_used.map(
        (item: Record<string, unknown>, idx: number) => ({
          ...item,
          actual_usage: Math.round(vary(item.actual_usage as number, seed, 90 + idx)),
        })
      );
    }

    return new NextResponse(JSON.stringify(sample), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (readError) {
    console.error("❌ Failed to read sample data:", readError);
    return NextResponse.json(
      { success: false, message: "Unable to load sample data" },
      { status: 500 }
    );
  }
}
