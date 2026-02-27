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
/*  GET /api/service-clients                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const authError = requireAuthorization(request);
  if (authError) return authError;

  const authorization = getAuthorizationHeader(request)!;

  const targetUrl = new URL(`${AUTH_API_URL}/service-clients`);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  console.log(`🔑 ServiceClients Proxy → GET ${targetUrl}`);

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
    console.log(`🔑 ServiceClients Proxy ← ${response.status} (${elapsed}ms)`);

    if (response.ok) {
      const data = await response.text();
      try {
        JSON.parse(data);
      } catch {
        return errorResponse("UPSTREAM_ERROR", "Authentication server returned invalid data.", 502);
      }
      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "private, max-age=15, stale-while-revalidate=30",
          "X-Response-Time": `${elapsed}ms`,
        },
      });
    }

    return await mapUpstreamError(response, "Failed to fetch service clients.");
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ ServiceClients Proxy error (${elapsed}ms):`, error instanceof Error ? error.message : error);
    return mapFetchError(error);
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  POST /api/service-clients                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const authError = requireAuthorization(request);
  if (authError) return authError;

  const authorization = getAuthorizationHeader(request)!;

  let body: string;
  try {
    body = await request.text();
  } catch {
    return errorResponse("INVALID_REQUEST", "Invalid request body.", 400);
  }

  const targetUrl = `${AUTH_API_URL}/service-clients`;
  console.log(`🔑 ServiceClients Proxy → POST ${targetUrl}`);

  try {
    const response = await fetchWithTimeout(
      targetUrl,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body,
      },
      AUTH_TIMEOUT_MS,
      request.signal,
    );

    const elapsed = Date.now() - startTime;
    console.log(`🔑 ServiceClients Proxy ← ${response.status} (${elapsed}ms)`);

    if (response.ok) {
      const data = await response.text();
      return new Response(data, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "X-Response-Time": `${elapsed}ms`,
        },
      });
    }

    return await mapUpstreamError(response, "Failed to create service client.");
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ ServiceClients Proxy POST error (${elapsed}ms):`, error instanceof Error ? error.message : error);
    return mapFetchError(error);
  }
}
