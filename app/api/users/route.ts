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
/*  GET /api/users                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Production proxy — returns paginated list of users.
 *
 * Features:
 *  - Forwards the client's Bearer token to the upstream auth API
 *  - Forwards all query parameters (page, per_page, search, role, status)
 *  - Structured error responses
 *  - Timeout handling
 *  - Short cache to reduce repeated list calls during navigation
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // ── Auth check ───────────────────────────────────────────────────────
  const authError = requireAuthorization(request);
  if (authError) return authError;

  const authorization = getAuthorizationHeader(request)!;

  // ── Build upstream URL with forwarded query params ───────────────────
  const targetUrl = new URL(`${AUTH_API_URL}/users`);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  console.log(`👥 Users Proxy → GET ${targetUrl}`);

  // ── Forward to upstream ──────────────────────────────────────────────
  try {
    const response = await fetchWithTimeout(
      targetUrl.toString(),
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
    console.log(`👥 Users Proxy ← ${response.status} (${elapsed}ms)`);

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
          // Short private cache — avoid hammering /users on rapid navigation
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
          "X-Response-Time": `${elapsed}ms`,
        },
      });
    }

    // ── Upstream error ───────────────────────────────────────────────
    return await mapUpstreamError(
      response,
      "Failed to fetch users.",
    );
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(
      `❌ Users Proxy error (${elapsed}ms):`,
      error instanceof Error ? error.message : error,
    );
    return mapFetchError(error);
  }
}
