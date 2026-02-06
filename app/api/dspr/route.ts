import { NextRequest, NextResponse } from "next/server";
import { requireAuthorization, getAuthorizationHeader } from "@/app/api/_lib/auth";
import { promises as fs } from "fs";
import path from "path";

const DSPR_BASE_URL =
  process.env.NEXT_PUBLIC_DSPR_API_URL ||
  "https://data.lcportal.cloud/api/reports/dspr";

/**
 * GET /api/dspr?storeId=xxx&date=YYYY-MM-DD
 *
 * Proxies the request to the DSPR API server-side to avoid CORS / CSP issues.
 * Falls back to the local sample data file when the upstream returns 401
 * (the DSPR backend auth may not be configured yet).
 */
export async function GET(request: NextRequest) {
  // Ensure the caller is authenticated
  const authError = requireAuthorization(request);
  if (authError) return authError;

  const authorization = getAuthorizationHeader(request);

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");
  const date = searchParams.get("date");

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

  try {
    console.log("📊 DSPR Proxy →", targetUrl);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authorization ?? "",
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
      return serveSampleData();
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
    return serveSampleData();
  }
}

/**
 * Serve the local sample API response from docs/dspr/api-response.json
 */
async function serveSampleData() {
  try {
    const filePath = path.join(
      process.cwd(),
      "docs",
      "dspr",
      "api-response.json"
    );
    const raw = await fs.readFile(filePath, "utf-8");
    return new NextResponse(raw, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Sample data not available" },
      { status: 500 }
    );
  }
}
