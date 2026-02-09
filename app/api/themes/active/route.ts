import { NextRequest } from "next/server";
import { requireAuthorization, errorResponse } from "../../_lib/auth";

/* ────────────────────────────────────────────────────────────────────────── */
/*  /api/themes/active  — Active theme preference                           */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Active theme preference is not yet backed by an upstream API.
 * The preference is currently stored in localStorage via the theme store.
 *
 * Returns 501 so consumers can fall back to local storage.
 */

export async function GET(request: NextRequest) {
  const authError = requireAuthorization(request);
  if (authError) return authError;

  return errorResponse(
    "UPSTREAM_ERROR",
    "Server-side theme preferences are not yet available. The active theme is stored locally.",
    501,
  );
}

export async function PUT(request: NextRequest) {
  const authError = requireAuthorization(request);
  if (authError) return authError;

  return errorResponse(
    "UPSTREAM_ERROR",
    "Server-side theme preferences are not yet available. The active theme is stored locally.",
    501,
  );
}
