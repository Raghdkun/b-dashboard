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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  GET /api/service-clients/[id]                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const startTime = Date.now();

  const authError = requireAuthorization(request);
  if (authError) return authError;

  const authorization = getAuthorizationHeader(request)!;
  const targetUrl = `${AUTH_API_URL}/service-clients/${id}`;

  console.log(`🔑 ServiceClient Proxy → GET ${targetUrl}`);

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
    console.log(`🔑 ServiceClient Proxy ← ${response.status} (${elapsed}ms)`);

    if (response.ok) {
      const data = await response.text();
      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Response-Time": `${elapsed}ms`,
        },
      });
    }

    return await mapUpstreamError(response, "Failed to fetch service client.");
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ ServiceClient GET error (${elapsed}ms):`, error instanceof Error ? error.message : error);
    return mapFetchError(error);
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  PUT /api/service-clients/[id]                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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

  const targetUrl = `${AUTH_API_URL}/service-clients/${id}`;
  console.log(`🔑 ServiceClient Proxy → PUT ${targetUrl}`);

  try {
    const response = await fetchWithTimeout(
      targetUrl,
      {
        method: "PUT",
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
    console.log(`🔑 ServiceClient Proxy ← ${response.status} (${elapsed}ms)`);

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

    return await mapUpstreamError(response, "Failed to update service client.");
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ ServiceClient PUT error (${elapsed}ms):`, error instanceof Error ? error.message : error);
    return mapFetchError(error);
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  DELETE /api/service-clients/[id]                                        */
/* ────────────────────────────────────────────────────────────────────────── */

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const startTime = Date.now();

  const authError = requireAuthorization(request);
  if (authError) return authError;

  const authorization = getAuthorizationHeader(request)!;
  const targetUrl = `${AUTH_API_URL}/service-clients/${id}`;

  console.log(`🔑 ServiceClient Proxy → DELETE ${targetUrl}`);

  try {
    const response = await fetchWithTimeout(
      targetUrl,
      {
        method: "DELETE",
        headers: {
          Authorization: authorization,
          Accept: "application/json",
        },
      },
      AUTH_TIMEOUT_MS,
      request.signal,
    );

    const elapsed = Date.now() - startTime;
    console.log(`🔑 ServiceClient Proxy ← ${response.status} (${elapsed}ms)`);

    if (response.ok) {
      return new Response(null, {
        status: 204,
        headers: { "X-Response-Time": `${elapsed}ms` },
      });
    }

    return await mapUpstreamError(response, "Failed to delete service client.");
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ ServiceClient DELETE error (${elapsed}ms):`, error instanceof Error ? error.message : error);
    return mapFetchError(error);
  }
}
