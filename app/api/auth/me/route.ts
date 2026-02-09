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
/*  GET /api/auth/me                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Production proxy — returns the authenticated user's profile.
 *
 * Features:
 *  - Forwards the client's Bearer token to the upstream auth API
 *  - Structured error responses
 *  - Timeout handling
 *  - Short cache to reduce repeated /me calls during navigation
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // ── Auth check ───────────────────────────────────────────────────────
  const authError = requireAuthorization(request);
  if (authError) return authError;

  const authorization = getAuthorizationHeader(request)!;
  const targetUrl = `${AUTH_API_URL}/auth/me`;

  console.log(`👤 Auth Proxy → GET ${targetUrl}`);

  // ── Forward to upstream ──────────────────────────────────────────────
  try {
    const response = await fetchWithTimeout(
      targetUrl,
      {
        method: "GET",
        headers: {
          Authorization: authorization,
          Accept: "application/json",
        },
      },
      AUTH_TIMEOUT_MS,
      request.signal,
    );

    const elapsed = Date.now() - startTime;
    console.log(`👤 Auth Proxy ← ${response.status} (${elapsed}ms)`);

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
          // Short private cache — avoids hammering /me on every navigation
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
          "X-Response-Time": `${elapsed}ms`,
        },
      });
    }

    // ── Upstream error ───────────────────────────────────────────────
    return await mapUpstreamError(
      response,
      "Failed to retrieve user profile.",
    );
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(
      `❌ Auth Proxy /me error (${elapsed}ms):`,
      error instanceof Error ? error.message : error,
    );
    return mapFetchError(error);
  }
}
