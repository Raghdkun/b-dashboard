import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  // Mock token validation
  if (token && token.startsWith("mock-jwt-token-")) {
    return NextResponse.json({
      success: true,
      data: {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        avatar: null,
      },
    });
  }

  return NextResponse.json(
    { success: false, message: "Invalid token" },
    { status: 401 }
  );
}
