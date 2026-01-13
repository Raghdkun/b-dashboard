import { NextResponse } from "next/server";

// GET /api/themes/active - Get user's active theme ID
export async function GET() {
  // TODO: Get authenticated user
  // TODO: Query user's theme preference from database
  
  // Mock: return default
  return NextResponse.json({
    success: true,
    themeId: "default",
  });
}

// PUT /api/themes/active - Set user's active theme ID
export async function PUT(request: Request) {
  try {
    const { themeId } = await request.json();
    
    if (!themeId || typeof themeId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "themeId is required",
        },
        { status: 400 }
      );
    }
    
    // TODO: Get authenticated user
    // TODO: Validate that theme exists (either built-in or user's custom theme)
    // TODO: Update user's preference in database
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to set active theme",
      },
      { status: 400 }
    );
  }
}
