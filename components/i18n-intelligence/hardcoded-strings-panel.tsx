"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RefreshCw,
  FileCode,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

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

export function HardcodedStringsPanel() {
  const t = useTranslations("devTools.i18n.hardcoded");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/i18n-intelligence/hardcoded-strings");
      if (!response.ok) {
        if (response.status === 404) {
          setError(t("noResults"));
          setResult(null);
          return;
        }
        throw new Error("Failed to load results");
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(`t("${key}")`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getRelativePath = (fullPath: string) => {
    // Extract relative path from full path
    const parts = fullPath.split(/[/\\]/);
    const appIndex = parts.findIndex((p) => p === "app" || p === "components");
    if (appIndex >= 0) {
      return parts.slice(appIndex).join("/");
    }
    return parts.slice(-3).join("/");
  };

  // Group issues by file
  const issuesByFile = result?.issues.reduce(
    (acc, issue) => {
      const path = getRelativePath(issue.filePath);
      if (!acc[path]) {
        acc[path] = [];
      }
      acc[path].push(issue);
      return acc;
    },
    {} as Record<string, HardcodedStringIssue[]>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileCode className="h-5 w-5 text-orange-500" />
          {t("title")}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={loadResults}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 bg-muted rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {t("runCommand")}{" "}
              <code className="bg-background px-1 py-0.5 rounded">
                pnpm analyze:i18n
              </code>{" "}
              {t("inTerminal")}
            </p>
          </div>
        )}

        {result && !error && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{result.totalFiles}</div>
                <div className="text-xs text-muted-foreground">
                  {t("filesScanned")}
                </div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{result.filesWithIssues}</div>
                <div className="text-xs text-muted-foreground">
                  {t("withIssues")}
                </div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-500">
                  {result.issues.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("totalIssues")}
                </div>
              </div>
            </div>

            {result.timestamp && (
              <p className="text-xs text-muted-foreground mb-3">
                {t("lastScan")}: {new Date(result.timestamp).toLocaleString()}
              </p>
            )}

            {result.issues.length === 0 ? (
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t("noIssues")}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-75">
                <div className="space-y-4">
                  {issuesByFile &&
                    Object.entries(issuesByFile).map(([filePath, issues]) => (
                      <div
                        key={filePath}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="bg-muted px-3 py-2 flex items-center justify-between">
                          <span className="text-sm font-mono truncate">
                            {filePath}
                          </span>
                          <Badge variant="secondary">{issues.length}</Badge>
                        </div>
                        <div className="divide-y">
                          {issues.map((issue, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 hover:bg-muted/50"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      variant={
                                        issue.severity === "error"
                                          ? "destructive"
                                          : "outline"
                                      }
                                      className="text-xs"
                                    >
                                      L{issue.line}:{issue.column}
                                    </Badge>
                                    {issue.attribute && (
                                      <Badge variant="secondary" className="text-xs">
                                        {issue.attribute}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm truncate">
                                    &quot;{issue.text}&quot;
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    →{" "}
                                    <code className="bg-muted px-1 rounded">
                                      t(&quot;{issue.suggestedKey}&quot;)
                                    </code>
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={() => copyKey(issue.suggestedKey)}
                                >
                                  {copiedKey === issue.suggestedKey ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
