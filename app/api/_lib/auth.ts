import { NextRequest, NextResponse } from "next/server";

export function getAuthorizationHeader(request: NextRequest) {
  return request.headers.get("authorization");
}

export function requireAuthorization(request: NextRequest) {
  const authorization = getAuthorizationHeader(request);

  if (!authorization || !authorization.trim()) {
    return NextResponse.json(
      { success: false, message: "Missing authorization token" },
      { status: 401 }
    );
  }

  return null;
}
