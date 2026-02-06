import { NextRequest, NextResponse } from "next/server";
import { requireAuthorization } from "../_lib/auth";

// GET /api/themes - List all themes
export async function GET(request: NextRequest) {
  const authError = requireAuthorization(request);
  if (authError) return authError;

  // TODO: Implement database query for user's themes
  // For now, return empty array (built-in themes are stored client-side)
  return NextResponse.json({
    success: true,
    themes: [],
  });
}

// POST /api/themes - Create a new theme
export async function POST(request: NextRequest) {
  const authError = requireAuthorization(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    
    // TODO: Validate theme with themeSchema
    // TODO: Save to database
    // TODO: Associate with authenticated user
    
    // Mock response
    const newTheme = {
      ...body,
      id: `theme-${Date.now()}`,
    };
    
    return NextResponse.json({
      success: true,
      theme: newTheme,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create theme",
      },
      { status: 400 }
    );
  }
}
