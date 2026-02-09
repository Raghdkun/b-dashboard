import { NextRequest } from "next/server";
import {
  AUTH_API_URL,
  AUTH_TIMEOUT_MS,
  getAuthorizationHeader,
  fetchWithTimeout,
} from "@/app/api/_lib/auth";

/* ────────────────────────────────────────────────────────────────────────── */
/*  POST /api/auth/logout                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Production proxy — invalidates the user's token on the upstream server.
 *
 * Always returns 200 to the client so the frontend can reliably clear
 * local state. Upstream failures are logged but not surfaced.
 */
export async function POST(request: NextRequest) {
  const authorization = getAuthorizationHeader(request);

  // Even without a token, acknowledge the logout so the client clears state
  if (!authorization) {
    return Response.json(
      { success: true, message: "Logged out successfully." },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const targetUrl = `${AUTH_API_URL}/auth/logout`;

  console.log(`🚪 Auth Proxy → POST ${targetUrl}`);

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
      },
      AUTH_TIMEOUT_MS,
      request.signal,
    );

    console.log(`🚪 Auth Proxy ← ${response.status}`);

    // Regardless of upstream result, return success to client
    // The important thing is that the client clears its token
    return Response.json(
      { success: true, message: "Logged out successfully." },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    // Log but don't fail — client should always be able to "log out" locally
    console.warn(
      "⚠️ Auth Proxy: upstream logout failed (client will clear state anyway):",
      error instanceof Error ? error.message : error,
    );

    return Response.json(
      { success: true, message: "Logged out successfully." },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
