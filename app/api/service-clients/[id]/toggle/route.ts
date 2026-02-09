import { NextRequest } from "next/server";
import {
  AUTH_API_URL,
  AUTH_TIMEOUT_MS,
  requireAuthorization,
  getAuthorizationHeader,
  fetchWithTimeout,
  mapUpstreamError,
  mapFetchError,
} from "@/app/api/_lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  POST /api/service-clients/[id]/toggle                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const startTime = Date.now();

  const authError = requireAuthorization(request);
  if (authError) return authError;

  const authorization = getAuthorizationHeader(request)!;
  const targetUrl = `${AUTH_API_URL}/service-clients/${id}/toggle`;

  console.log(`🔑 ServiceClient Proxy → POST ${targetUrl}`);

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
      },
      AUTH_TIMEOUT_MS,
      request.signal,
    );

    const elapsed = Date.now() - startTime;
    console.log(`🔑 ServiceClient Toggle Proxy ← ${response.status} (${elapsed}ms)`);

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

    return await mapUpstreamError(response, "Failed to toggle service client status.");
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ ServiceClient Toggle error (${elapsed}ms):`, error instanceof Error ? error.message : error);
    return mapFetchError(error);
  }
}
