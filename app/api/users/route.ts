import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationHeader, requireAuthorization } from "../_lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getBackendUrl(path: string) {
  if (!API_BASE_URL || API_BASE_URL.startsWith("/")) {
    return null;
  }

  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL
    : `${API_BASE_URL}/`;

  return new URL(path, baseUrl);
}

export async function GET(request: NextRequest) {
  const targetUrl = getBackendUrl("users");

  if (!targetUrl) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Backend API URL not configured. Set NEXT_PUBLIC_API_URL to a full URL.",
      },
      { status: 501 }
    );
  }

  targetUrl.search = request.nextUrl.searchParams.toString();

  const authorization = getAuthorizationHeader(request);
  const authError = requireAuthorization(request);
  if (authError) {
    return authError;
  }

  const response = await fetch(targetUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: authorization ?? "",
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      data || { success: false, message: "Failed to fetch users" },
      { status: response.status }
    );
  }

  return NextResponse.json(data, { status: response.status });
}
