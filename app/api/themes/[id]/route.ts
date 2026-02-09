import { NextRequest } from "next/server";
import { requireAuthorization, errorResponse } from "../../_lib/auth";

/* ────────────────────────────────────────────────────────────────────────── */
/*  /api/themes/[id]  — Single theme CRUD                                   */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Theme CRUD is not yet backed by an upstream API.
 * These endpoints return 501 so consumers know the feature isn't available
 * on the server yet and can gracefully fall back to local storage.
 */

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const authError = requireAuthorization(request);
  if (authError) return authError;

  const { id } = await params;

  return errorResponse(
    "UPSTREAM_ERROR",
    `Server-side theme storage is not yet available. Theme "${id}" is managed locally.`,
    501,
  );
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const authError = requireAuthorization(request);
  if (authError) return authError;

  const { id } = await params;

  return errorResponse(
    "UPSTREAM_ERROR",
    `Server-side theme updates are not yet available. Theme "${id}" is managed locally.`,
    501,
  );
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const authError = requireAuthorization(request);
  if (authError) return authError;

  const { id } = await params;

  return errorResponse(
    "UPSTREAM_ERROR",
    `Server-side theme deletion is not yet available. Theme "${id}" is managed locally.`,
    501,
  );
}
