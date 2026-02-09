import { NextRequest } from "next/server";
import { requireAuthorization, errorResponse } from "../_lib/auth";

/* ────────────────────────────────────────────────────────────────────────── */
/*  GET  /api/themes   — List user themes                                   */
/*  POST /api/themes   — Create a new theme                                 */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Theme CRUD is not yet backed by an upstream API.
 * Themes are currently managed entirely client-side (localStorage).
 *
 * These endpoints return 501 so consumers know the feature isn't available
 * on the server yet, and can gracefully fall back to local storage.
 *
 * When a backend is ready, replace with proxy calls like the auth routes.
 */

export async function GET(request: NextRequest) {
  const authError = requireAuthorization(request);
  if (authError) return authError;

  return errorResponse(
    "UPSTREAM_ERROR",
    "Server-side theme storage is not yet available. Themes are managed locally.",
    501,
  );
}

export async function POST(request: NextRequest) {
  const authError = requireAuthorization(request);
  if (authError) return authError;

  return errorResponse(
    "UPSTREAM_ERROR",
    "Server-side theme creation is not yet available. Themes are saved locally.",
    501,
  );
}
