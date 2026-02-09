import { NextRequest } from "next/server";
import {
  AUTH_API_URL,
  AUTH_TIMEOUT_MS,
  errorResponse,
  fetchWithTimeout,
  mapUpstreamError,
  mapFetchError,
} from "@/app/api/_lib/auth";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Validation                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD_LENGTH = 256;

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

function validateLoginBody(
  body: LoginBody,
): { email: string; password: string } | string {
  const { email, password } = body;

  if (!email || typeof email !== "string") {
    return "Email is required.";
  }
  if (!EMAIL_RE.test(email)) {
    return "Please enter a valid email address.";
  }
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 1 || password.length > MAX_PASSWORD_LENGTH) {
    return "Password must be between 1 and 256 characters.";
  }

  return { email: email.trim().toLowerCase(), password };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  POST /api/auth/login                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Production proxy to the upstream auth API at auth.pnepizza.com.
 *
 * Features:
 *  - Input validation & sanitisation
 *  - Structured error responses with error codes
 *  - Timeout handling
 *  - No mock data — all requests forwarded upstream
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // ── Parse body ───────────────────────────────────────────────────────
  let body: LoginBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "INVALID_REQUEST",
      "Request body must be valid JSON.",
      400,
    );
  }

  // ── Validate ─────────────────────────────────────────────────────────
  const result = validateLoginBody(body);
  if (typeof result === "string") {
    return errorResponse("VALIDATION_ERROR", result, 422);
  }

  const { email, password } = result;
  const targetUrl = `${AUTH_API_URL}/auth/login`;

  console.log(`🔑 Auth Proxy → POST ${targetUrl} (${email})`);

  // ── Forward to upstream ──────────────────────────────────────────────
  try {
    const response = await fetchWithTimeout(
      targetUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
      AUTH_TIMEOUT_MS,
      request.signal,
    );

    const elapsed = Date.now() - startTime;
    console.log(`🔑 Auth Proxy ← ${response.status} (${elapsed}ms)`);

    // ── Success ──────────────────────────────────────────────────────
    if (response.ok) {
      const data = await response.text();

      // Validate upstream returned valid JSON
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
    return await mapUpstreamError(response, "Invalid email or password.");
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(
      `❌ Auth Proxy login error (${elapsed}ms):`,
      error instanceof Error ? error.message : error,
    );
    return mapFetchError(error);
  }
}
