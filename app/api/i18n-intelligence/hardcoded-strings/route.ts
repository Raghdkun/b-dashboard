import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    const resultsPath = path.join(
      process.cwd(),
      ".i18n-intelligence",
      "hardcoded-strings.json"
    );

    if (!fs.existsSync(resultsPath)) {
      return NextResponse.json(
        { error: "No analysis results found" },
        { status: 404 }
      );
    }

    const content = await fs.promises.readFile(resultsPath, "utf-8");
    const data = JSON.parse(content);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading hardcoded strings analysis:", error);
    return NextResponse.json(
      { error: "Failed to load analysis results" },
      { status: 500 }
    );
  }
}
