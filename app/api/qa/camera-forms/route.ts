import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthorization,
  getAuthorizationHeader,
} from "@/app/api/_lib/auth";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Configuration                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

const QA_BASE_URL =
  process.env.QA_API_URL ||
  process.env.NEXT_PUBLIC_QA_API_URL ||
  "https://qa.lcportal.cloud/api";

const QA_API_TOKEN = process.env.QA_API_TOKEN;
const UPSTREAM_TIMEOUT_MS = Number(process.env.QA_TIMEOUT_MS) || 15_000;
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 500;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Error helpers                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

type ErrorCode =
  | "MISSING_PARAM"
  | "INVALID_PARAM"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "UPSTREAM_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, ...(details && { details }) },
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Fetch utilities                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  retries: number
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, init, timeoutMs);
      if (res.ok || (res.status >= 400 && res.status < 500)) return res;
      lastError = new Error(`Upstream ${res.status}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.name === "AbortError")
        lastError = new Error("Upstream request timed out");
    }
    if (attempt < retries) {
      await new Promise((r) =>
        setTimeout(r, RETRY_BASE_MS * Math.pow(2, attempt))
      );
    }
  }
  throw lastError ?? new Error("All retries exhausted");
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  POST /api/qa/camera-forms                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Auth check
  const authError = requireAuthorization(request);
  if (authError) return authError;

  // Read multipart form data from incoming request
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      "INVALID_PARAM",
      "Invalid form data in request body.",
      400
    );
  }

  // Validate store_id (required, integer)
  const storeId = formData.get("store_id");
  if (!storeId) {
    return errorResponse(
      "VALIDATION_ERROR",
      "store_id is required.",
      422,
      { field: "store_id" }
    );
  }
  const storeIdNum = Number(storeId);
  if (!Number.isFinite(storeIdNum) || storeIdNum < 1 || !Number.isInteger(storeIdNum)) {
    return errorResponse(
      "VALIDATION_ERROR",
      "store_id must be a positive integer.",
      422,
      { field: "store_id" }
    );
  }

  // Validate date (required, YYYY-MM-DD)
  const date = formData.get("date");
  if (!date || typeof date !== "string") {
    return errorResponse(
      "VALIDATION_ERROR",
      "date is required.",
      422,
      { field: "date" }
    );
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date) || isNaN(Date.parse(date))) {
    return errorResponse(
      "VALIDATION_ERROR",
      "date must be a valid date in YYYY-MM-DD format.",
      422,
      { field: "date" }
    );
  }

  // Check that at least one entity field exists
  const allEntries = Array.from(formData.entries());
  const hasEntities = allEntries.some(([key]) => key.startsWith("entities"));
  if (!hasEntities) {
    return errorResponse(
      "VALIDATION_ERROR",
      "At least one entity is required.",
      422,
      { field: "entities" }
    );
  }

  // Forward the entire form data as-is to the upstream API
  // This preserves the Laravel-style indexed notation:
  //   entities[0][entity_id], entities[0][rating_id],
  //   entities[0][notes][0][note], entities[0][notes][0][attachments][]
  const upstreamFormData = new FormData();
  for (const [key, value] of allEntries) {
    upstreamFormData.append(key, value);
  }

  // Build upstream auth
  const authorization = getAuthorizationHeader(request);
  const upstreamAuth = QA_API_TOKEN
    ? `Bearer ${QA_API_TOKEN}`
    : authorization ?? "";

  const targetUrl = `${QA_BASE_URL}/camera-forms`;

  try {
    const response = await fetchWithRetry(
      targetUrl,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(upstreamAuth && { Authorization: upstreamAuth }),
        },
        body: upstreamFormData,
      },
      UPSTREAM_TIMEOUT_MS,
      MAX_RETRIES
    );

    const elapsed = Date.now() - startTime;

    if (response.ok) {
      const responseBody = await response.text();
      try {
        JSON.parse(responseBody);
      } catch {
        return errorResponse(
          "UPSTREAM_ERROR",
          "Upstream returned invalid JSON",
          502,
          { upstreamStatus: response.status }
        );
      }
      return new NextResponse(responseBody, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "X-Response-Time": `${elapsed}ms`,
        },
      });
    }

    if (response.status === 401) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authentication failed for the QA API.",
        401,
        { upstream: true, tokenConfigured: !!QA_API_TOKEN }
      );
    }
    if (response.status === 403) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to create camera forms.",
        403
      );
    }
    if (response.status === 422) {
      let upstreamBody: Record<string, unknown> = {};
      try {
        upstreamBody = await response.json();
      } catch {
        // ignore parse errors
      }
      // Surface the upstream validation message if available
      const upstreamMessage =
        (upstreamBody as { message?: string })?.message ||
        "Validation failed on the QA API. Please check your data.";
      return errorResponse(
        "VALIDATION_ERROR",
        upstreamMessage,
        422,
        { upstream: upstreamBody }
      );
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      return errorResponse(
        "RATE_LIMITED",
        "Too many requests. Please wait before trying again.",
        429,
        retryAfter
          ? { retryAfter: Number(retryAfter) || retryAfter }
          : undefined
      );
    }

    return errorResponse(
      "UPSTREAM_ERROR",
      `QA API returned an error (${response.status}).`,
      502,
      process.env.NODE_ENV === "development"
        ? { upstreamStatus: response.status }
        : undefined
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("timed out") || message.includes("abort")) {
      return errorResponse(
        "TIMEOUT",
        `The QA API did not respond within ${UPSTREAM_TIMEOUT_MS / 1_000}s. Please try again.`,
        504
      );
    }

    return errorResponse(
      "NETWORK_ERROR",
      "Unable to reach the QA API. Please check your connection and try again.",
      503
    );
  }
}
