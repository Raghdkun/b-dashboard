/**
 * i18n Intelligence - Export Utilities
 *
 * Functions to export translation issues in various formats
 */

import type { TranslationIssue } from "../types";

/**
 * Export issues as JSON
 */
export function exportAsJSON(issues: TranslationIssue[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalIssues: issues.length,
      issues: issues.map((issue) => ({
        id: issue.id,
        type: issue.type,
        severity: issue.severity,
        severityScore: issue.severityScore,
        status: issue.status,
        description: issue.description,
        key: "key" in issue ? issue.key : undefined,
        namespace: "namespace" in issue ? issue.namespace : undefined,
        locale: "locale" in issue ? issue.locale : undefined,
        affectedLocales: "affectedLocales" in issue ? issue.affectedLocales : undefined,
        location: issue.location,
        occurrenceCount: issue.occurrenceCount,
        firstDetected: new Date(issue.firstDetected).toISOString(),
        lastSeen: new Date(issue.lastSeen).toISOString(),
        suggestedFix: issue.suggestedFix,
      })),
    },
    null,
    2
  );
}

/**
 * Export issues as CSV
 */
export function exportAsCSV(issues: TranslationIssue[]): string {
  const headers = [
    "ID",
    "Type",
    "Severity",
    "Status",
    "Key",
    "Namespace",
    "Locale",
    "Route",
    "Component",
    "Occurrences",
    "First Detected",
    "Last Seen",
    "Description",
    "Suggested Fix",
  ];

  const rows = issues.map((issue) => [
    issue.id,
    issue.type,
    issue.severity,
    issue.status,
    "key" in issue ? issue.key : "",
    "namespace" in issue ? issue.namespace : "",
    "locale" in issue ? issue.locale : "",
    issue.location.route,
    issue.location.componentName,
    issue.occurrenceCount.toString(),
    new Date(issue.firstDetected).toISOString(),
    new Date(issue.lastSeen).toISOString(),
    `"${issue.description.replace(/"/g, '""')}"`,
    issue.suggestedFix ? `"${issue.suggestedFix.replace(/"/g, '""')}"` : "",
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Export issues as Markdown report
 */
export function exportAsMarkdown(issues: TranslationIssue[]): string {
  const lines: string[] = [];

  lines.push("# Translation Issues Report");
  lines.push("");
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Total Issues:** ${issues.length}`);
  lines.push("");

  // Summary by severity
  const bySeverity = issues.reduce(
    (acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  lines.push("## Summary by Severity");
  lines.push("");
  lines.push("| Severity | Count |");
  lines.push("| -------- | ----- |");
  Object.entries(bySeverity)
    .sort((a, b) => b[1] - a[1])
    .forEach(([severity, count]) => {
      lines.push(`| ${severity} | ${count} |`);
    });
  lines.push("");

  // Summary by type
  const byType = issues.reduce(
    (acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  lines.push("## Summary by Type");
  lines.push("");
  lines.push("| Type | Count |");
  lines.push("| ---- | ----- |");
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      lines.push(`| ${type} | ${count} |`);
    });
  lines.push("");

  // Group by route
  const byRoute = issues.reduce(
    (acc, issue) => {
      const route = issue.location.route;
      if (!acc[route]) acc[route] = [];
      acc[route].push(issue);
      return acc;
    },
    {} as Record<string, TranslationIssue[]>
  );

  lines.push("## Issues by Route");
  lines.push("");

  Object.entries(byRoute)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([route, routeIssues]) => {
      lines.push(`### ${route}`);
      lines.push("");
      lines.push(`**${routeIssues.length} issue(s)**`);
      lines.push("");

      routeIssues.forEach((issue) => {
        const severity =
          issue.severity === "critical"
            ? "🔴"
            : issue.severity === "high"
              ? "🟠"
              : issue.severity === "medium"
                ? "🟡"
                : "🔵";
        const key = "key" in issue ? ` \`${issue.key}\`` : "";
        lines.push(`- ${severity} **${issue.type}**${key}`);
        lines.push(`  - ${issue.description}`);
        if (issue.suggestedFix) {
          lines.push(`  - 💡 ${issue.suggestedFix}`);
        }
      });
      lines.push("");
    });

  return lines.join("\n");
}

/**
 * Download a file with the given content
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export and download issues
 */
export function exportIssues(
  issues: TranslationIssue[],
  format: "json" | "csv" | "markdown"
): void {
  const timestamp = new Date().toISOString().split("T")[0];

  switch (format) {
    case "json":
      downloadFile(
        exportAsJSON(issues),
        `i18n-issues-${timestamp}.json`,
        "application/json"
      );
      break;
    case "csv":
      downloadFile(
        exportAsCSV(issues),
        `i18n-issues-${timestamp}.csv`,
        "text/csv"
      );
      break;
    case "markdown":
      downloadFile(
        exportAsMarkdown(issues),
        `i18n-issues-${timestamp}.md`,
        "text/markdown"
      );
      break;
  }
}
