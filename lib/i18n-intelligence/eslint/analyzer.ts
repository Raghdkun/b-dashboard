/**
 * i18n Intelligence - Hardcoded String Analyzer
 *
 * CLI tool to analyze codebase for hardcoded strings and report to the dashboard
 */

import { ESLint } from "eslint";
import * as fs from "fs";
import * as path from "path";
import plugin from "./plugin";

export interface HardcodedStringIssue {
  filePath: string;
  line: number;
  column: number;
  text: string;
  suggestedKey: string;
  attribute?: string;
  severity: "error" | "warning";
}

export interface AnalysisResult {
  issues: HardcodedStringIssue[];
  totalFiles: number;
  filesWithIssues: number;
  timestamp: number;
}

/**
 * Analyze files for hardcoded strings using ESLint
 */
export async function analyzeHardcodedStrings(
  targetPaths: string[] = ["app", "components"],
  options: {
    extensions?: string[];
    excludePatterns?: string[];
    severity?: "warn" | "error";
  } = {}
): Promise<AnalysisResult> {
  const {
    extensions = [".tsx", ".jsx"],
    excludePatterns = ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    severity = "warn",
  } = options;

  // Create ESLint instance with our plugin
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: extensions.map((ext) => `**/*${ext}`),
        plugins: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "@b-dashboard/i18n-intelligence": plugin as any,
        },
        rules: {
          "@b-dashboard/i18n-intelligence/no-hardcoded-strings": severity,
        },
        languageOptions: {
          parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            ecmaFeatures: {
              jsx: true,
            },
          },
        },
      },
    ],
    ignore: true,
    ignorePatterns: excludePatterns,
  });

  const issues: HardcodedStringIssue[] = [];
  const filesWithIssuesSet = new Set<string>();
  let totalFiles = 0;

  // Run ESLint on target paths
  const results = await eslint.lintFiles(
    targetPaths.map((p) => path.join(process.cwd(), p))
  );

  for (const result of results) {
    totalFiles++;

    for (const message of result.messages) {
      if (
        message.ruleId === "@b-dashboard/i18n-intelligence/no-hardcoded-strings"
      ) {
        filesWithIssuesSet.add(result.filePath);

        // Parse the message to extract details
        const textMatch = message.message.match(/Hardcoded string "([^"]+)"/);
        const keyMatch = message.message.match(/t\("([^"]+)"\)/);
        const attrMatch = message.message.match(/"([^"]+)" attribute/);

        issues.push({
          filePath: result.filePath,
          line: message.line,
          column: message.column,
          text: textMatch?.[1] || "unknown",
          suggestedKey: keyMatch?.[1] || "unknown_key",
          attribute: attrMatch?.[1],
          severity: message.severity === 2 ? "error" : "warning",
        });
      }
    }
  }

  return {
    issues,
    totalFiles,
    filesWithIssues: filesWithIssuesSet.size,
    timestamp: Date.now(),
  };
}

/**
 * Generate a report from analysis results
 */
export function generateReport(result: AnalysisResult): string {
  const lines: string[] = [];

  lines.push("# i18n Intelligence - Hardcoded String Analysis Report");
  lines.push("");
  lines.push(`**Generated:** ${new Date(result.timestamp).toISOString()}`);
  lines.push(`**Total Files Scanned:** ${result.totalFiles}`);
  lines.push(`**Files with Issues:** ${result.filesWithIssues}`);
  lines.push(`**Total Issues:** ${result.issues.length}`);
  lines.push("");

  if (result.issues.length === 0) {
    lines.push("✅ No hardcoded strings detected!");
    return lines.join("\n");
  }

  // Group by file
  const byFile = new Map<string, HardcodedStringIssue[]>();
  for (const issue of result.issues) {
    const existing = byFile.get(issue.filePath) || [];
    existing.push(issue);
    byFile.set(issue.filePath, existing);
  }

  lines.push("## Issues by File");
  lines.push("");

  for (const [filePath, fileIssues] of byFile) {
    const relativePath = path.relative(process.cwd(), filePath);
    lines.push(`### ${relativePath}`);
    lines.push("");

    for (const issue of fileIssues) {
      const severity = issue.severity === "error" ? "🔴" : "🟡";
      const location = `L${issue.line}:${issue.column}`;
      const attr = issue.attribute ? ` (in \`${issue.attribute}\`)` : "";

      lines.push(
        `- ${severity} **${location}**${attr}: "${issue.text}" → \`t("${issue.suggestedKey}")\``
      );
    }

    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Save analysis results to a JSON file
 */
export async function saveResults(
  result: AnalysisResult,
  outputPath: string
): Promise<void> {
  await fs.promises.writeFile(outputPath, JSON.stringify(result, null, 2));
}

/**
 * Load previous analysis results
 */
export async function loadResults(
  inputPath: string
): Promise<AnalysisResult | null> {
  try {
    const content = await fs.promises.readFile(inputPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// CLI entry point
if (require.main === module) {
  async function main() {
    console.log("🔍 Analyzing codebase for hardcoded strings...\n");

    const result = await analyzeHardcodedStrings(["app", "components"]);
    const report = generateReport(result);

    console.log(report);

    // Save results
    const outputPath = path.join(
      process.cwd(),
      ".i18n-intelligence",
      "hardcoded-strings.json"
    );
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await saveResults(result, outputPath);

    console.log(`\n📁 Results saved to: ${outputPath}`);

    // Exit with error code if there are issues
    if (result.issues.some((i) => i.severity === "error")) {
      process.exit(1);
    }
  }

  main().catch(console.error);
}
