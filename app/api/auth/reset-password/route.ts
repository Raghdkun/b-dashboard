import { NextRequest, NextResponse } from "next/server";
import {
  errorResponse,
  fetchWithTimeout,
} from "@/app/api/_lib/auth";

const API_BASE_URL = "https://api.lcportal.cloud/api/v1";
const TIMEOUT_MS = 15_000;

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string; password_confirmation?: string; otp?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "Request body must be valid JSON.", 400);
  }

  const { email, password, password_confirmation, otp } = body;

  if (!email || typeof email !== "string") {
    return errorResponse("VALIDATION_ERROR", "Email is required.", 422);
  }
  if (!password || typeof password !== "string") {
    return errorResponse("VALIDATION_ERROR", "Password is required.", 422);
  }
  if (!password_confirmation || typeof password_confirmation !== "string") {
    return errorResponse("VALIDATION_ERROR", "Password confirmation is required.", 422);
  }
  if (password !== password_confirmation) {
    return errorResponse("VALIDATION_ERROR", "Passwords do not match.", 422);
  }
  if (!otp || typeof otp !== "string") {
    return errorResponse("VALIDATION_ERROR", "OTP is required.", 422);
  }

  const targetUrl = `${API_BASE_URL}/auth/reset-password`;

  try {
    const response = await fetchWithTimeout(
      targetUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password, password_confirmation, otp }),
      },
      TIMEOUT_MS
    );

    const responseBody = await response.text();

    if (response.ok) {
      return new NextResponse(responseBody, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    if (response.status === 422) {
      let parsed;
      try {
        parsed = JSON.parse(responseBody);
      } catch {
        parsed = {};
      }
      return errorResponse(
        "VALIDATION_ERROR",
        parsed?.message || "Validation failed.",
        422,
        parsed?.errors ? { errors: parsed.errors } : undefined
      );
    }

    if (response.status === 401) {
      return errorResponse("INVALID_CREDENTIALS", "Invalid OTP or credentials.", 401);
    }

    return errorResponse(
      "UPSTREAM_ERROR",
      `Password reset failed (${response.status}).`,
      response.status >= 500 ? 502 : response.status
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("timed out") || message.includes("abort")) {
      return errorResponse("TIMEOUT", "Request timed out. Please try again.", 504);
    }
    return errorResponse("NETWORK_ERROR", "Unable to reach the server.", 503);
  }
}
