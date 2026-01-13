import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Mock validation
    if (email === "admin@example.com" && password === "password") {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            avatar: null,
          },
          token: "mock-jwt-token-" + Date.now(),
        },
        message: "Login successful",
      });
    }

    // Also accept any email/password for demo purposes
    if (email && password && password.length >= 6) {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: "2",
            name: email.split("@")[0],
            email: email,
            role: "user",
            avatar: null,
          },
          token: "mock-jwt-token-" + Date.now(),
        },
        message: "Login successful",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials. Try admin@example.com / password",
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }
}
