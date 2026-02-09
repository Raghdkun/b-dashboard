import { NextRequest } from "next/server";
import { requireAuthorization, errorResponse } from "../../_lib/auth";

/* ────────────────────────────────────────────────────────────────────────── */
/*  /api/themes/sync  — Theme synchronisation                               */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Theme sync requires server-side storage that is not yet available.
 * The client theme store manages themes entirely in localStorage.
 *
 * Returns 501 so consumers can fall back gracefully.
 */

export async function POST(request: NextRequest) {
  const authError = requireAuthorization(request);
  if (authError) return authError;

  return errorResponse(
    "UPSTREAM_ERROR",
    "Server-side theme sync is not yet available. Themes are managed locally.",
    501,
  );
}
