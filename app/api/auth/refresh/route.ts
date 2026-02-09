import { NextRequest } from "next/server";
import {
  AUTH_API_URL,
  AUTH_TIMEOUT_MS,
  requireAuthorization,
  getAuthorizationHeader,
  errorResponse,
  fetchWithTimeout,
  mapUpstreamError,
  mapFetchError,
} from "@/app/api/_lib/auth";

/* ────────────────────────────────────────────────────────────────────────── */
/*  POST /api/auth/refresh-token                                            */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Production proxy — refreshes the user's auth token.
 *
 * Forwards the current Bearer token (and optional refresh token from body)
 * to the upstream auth API and returns the new token.
 *
 * Features:
 *  - Structured error responses
 *  - Timeout handling
 *  - No mock data
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // ── Auth check ───────────────────────────────────────────────────────
  const authError = requireAuthorization(request);
  if (authError) return authError;

  const authorization = getAuthorizationHeader(request)!;

  // ── Parse optional body (may contain refresh token) ──────────────────
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional for refresh — some APIs use only the Bearer token
  }

  const targetUrl = `${AUTH_API_URL}/auth/refresh-token`;

  console.log(`🔄 Auth Proxy → POST ${targetUrl}`);

  // ── Forward to upstream ──────────────────────────────────────────────
  try {
    const response = await fetchWithTimeout(
      targetUrl,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      AUTH_TIMEOUT_MS,
      request.signal,
    );

    const elapsed = Date.now() - startTime;
    console.log(`🔄 Auth Proxy ← ${response.status} (${elapsed}ms)`);

    // ── Success ──────────────────────────────────────────────────────
    if (response.ok) {
      const data = await response.text();

      try {
        JSON.parse(data);
      } catch {
        return errorResponse(
          "UPSTREAM_ERROR",
          "Authentication server returned invalid data.",
          502,
        );
      }

      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "X-Response-Time": `${elapsed}ms`,
        },
      });
    }

    // ── Upstream error ───────────────────────────────────────────────
    return await mapUpstreamError(
      response,
      "Token refresh failed. Please log in again.",
    );
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(
      `❌ Auth Proxy refresh error (${elapsed}ms):`,
      error instanceof Error ? error.message : error,
    );
    return mapFetchError(error);
  }
}
