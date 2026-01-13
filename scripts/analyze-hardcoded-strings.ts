#!/usr/bin/env node
/**
 * i18n Intelligence CLI
 *
 * Analyze codebase for hardcoded strings
 *
 * Usage:
 *   npx ts-node scripts/analyze-hardcoded-strings.ts
 *   pnpm run analyze:i18n
 */

import * as path from "path";
import * as fs from "fs";

interface HardcodedStringIssue {
  filePath: string;
  line: number;
  column: number;
  text: string;
  suggestedKey: string;
  attribute?: string;
  severity: "error" | "warning";
}

interface AnalysisResult {
  issues: HardcodedStringIssue[];
  totalFiles: number;
  filesWithIssues: number;
  timestamp: number;
}

/**
 * Simple hardcoded string detector using regex patterns
 * This is a lightweight alternative when ESLint integration is complex
 */
async function analyzeFile(filePath: string): Promise<HardcodedStringIssue[]> {
  const issues: HardcodedStringIssue[] = [];
  const content = await fs.promises.readFile(filePath, "utf-8");
  const lines = content.split("\n");

  // Patterns to exclude
  const excludePatterns = [
    /^[A-Z][A-Z0-9_]+$/, // CONSTANTS
    /^https?:\/\//, // URLs
    /^#[0-9a-fA-F]{3,8}$/, // Colors
    /^\d+(\.\d+)?(px|rem|em|%|vh|vw|ms|s)?$/, // CSS values
    /^[a-z]+(-[a-z]+)*$/, // kebab-case (likely CSS classes)
    /^[\s.,;:!?'"()\[\]{}]+$/, // Punctuation only
    /^\s*$/, // Whitespace only
    /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+/, // Likely key paths like "nav.home"
  ];

  // JSX text pattern: >text content<
  const jsxTextRegex = />([^<>{]+)</g;

  // Translatable attributes
  const attrRegex =
    /(placeholder|title|alt|aria-label|aria-description)=["']([^"']+)["']/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip imports, comments, and className definitions
    if (
      line.trim().startsWith("import") ||
      line.trim().startsWith("//") ||
      line.trim().startsWith("*") ||
      line.includes("className") ||
      line.includes("console.") ||
      line.includes("throw new") ||
      line.includes("Error(")
    ) {
      continue;
    }

    // Check JSX text content
    let match;
    while ((match = jsxTextRegex.exec(line)) !== null) {
      const text = match[1].trim();

      // Skip if matches exclude patterns or is too short
      if (text.length < 2) continue;
      if (excludePatterns.some((p) => p.test(text))) continue;

      // Check if it looks like actual text content
      if (/[a-zA-Z]{2,}/.test(text)) {
        issues.push({
          filePath,
          line: lineNum,
          column: match.index + 1,
          text: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
          suggestedKey: generateKey(text),
          severity: "warning",
        });
      }
    }

    // Check translatable attributes
    while ((match = attrRegex.exec(line)) !== null) {
      const attr = match[1];
      const text = match[2].trim();

      // Skip if matches exclude patterns
      if (text.length < 2) continue;
      if (excludePatterns.some((p) => p.test(text))) continue;

      // Check if it looks like actual text content
      if (/[a-zA-Z]{2,}/.test(text)) {
        issues.push({
          filePath,
          line: lineNum,
          column: match.index + 1,
          text: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
          suggestedKey: generateKey(text),
          attribute: attr,
          severity: "warning",
        });
      }
    }
  }

  return issues;
}

function generateKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 30);
}

async function findFiles(
  dir: string,
  extensions: string[]
): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string) {
    const entries = await fs.promises.readdir(currentDir, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      // Skip node_modules, .next, etc.
      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules"
      ) {
        await walk(fullPath);
      } else if (
        entry.isFile() &&
        extensions.some((ext) => entry.name.endsWith(ext))
      ) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

async function main() {
  console.log("🔍 i18n Intelligence - Hardcoded String Analyzer\n");
  console.log("Scanning for hardcoded strings in JSX components...\n");

  const cwd = process.cwd();
  const targetDirs = ["app", "components"].map((d) => path.join(cwd, d));
  const extensions = [".tsx", ".jsx"];

  const allIssues: HardcodedStringIssue[] = [];
  const filesWithIssuesSet = new Set<string>();
  let totalFiles = 0;

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = await findFiles(dir, extensions);
    totalFiles += files.length;

    for (const file of files) {
      const issues = await analyzeFile(file);
      if (issues.length > 0) {
        filesWithIssuesSet.add(file);
        allIssues.push(...issues);
      }
    }
  }

  // Group by file for display
  const byFile = new Map<string, HardcodedStringIssue[]>();
  for (const issue of allIssues) {
    const existing = byFile.get(issue.filePath) || [];
    existing.push(issue);
    byFile.set(issue.filePath, existing);
  }

  // Print results
  console.log(`📊 Analysis Complete`);
  console.log(`   Files scanned: ${totalFiles}`);
  console.log(`   Files with issues: ${filesWithIssuesSet.size}`);
  console.log(`   Total issues: ${allIssues.length}\n`);

  if (allIssues.length > 0) {
    console.log("─".repeat(60));
    console.log("\n📝 Issues Found:\n");

    for (const [filePath, issues] of byFile) {
      const relativePath = path.relative(cwd, filePath);
      console.log(`\n📄 ${relativePath}`);

      for (const issue of issues) {
        const attr = issue.attribute ? ` [${issue.attribute}]` : "";
        console.log(
          `   L${issue.line}:${issue.column}${attr} "${issue.text}"`
        );
        console.log(`   └─ Suggested key: ${issue.suggestedKey}`);
      }
    }
  } else {
    console.log("✅ No hardcoded strings detected!");
  }

  // Save results to JSON
  const result: AnalysisResult = {
    issues: allIssues,
    totalFiles,
    filesWithIssues: filesWithIssuesSet.size,
    timestamp: Date.now(),
  };

  const outputDir = path.join(cwd, ".i18n-intelligence");
  await fs.promises.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "hardcoded-strings.json");
  await fs.promises.writeFile(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n📁 Results saved to: ${outputPath}`);

  // Add to .gitignore if not already present
  const gitignorePath = path.join(cwd, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignore = await fs.promises.readFile(gitignorePath, "utf-8");
    if (!gitignore.includes(".i18n-intelligence")) {
      await fs.promises.appendFile(gitignorePath, "\n.i18n-intelligence/\n");
      console.log("📝 Added .i18n-intelligence/ to .gitignore");
    }
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
