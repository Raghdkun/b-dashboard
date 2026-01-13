/**
 * i18n Intelligence Dashboard - Health Score Card
 */

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18nIntelligenceStore } from "@/lib/i18n-intelligence";

export function HealthScoreCard() {
  const healthSummary = useI18nIntelligenceStore((s) => s.healthSummary);

  const scoreColor = useMemo(() => {
    if (healthSummary.overallScore >= 90) return "text-green-500";
    if (healthSummary.overallScore >= 70) return "text-yellow-500";
    if (healthSummary.overallScore >= 50) return "text-orange-500";
    return "text-red-500";
  }, [healthSummary.overallScore]);

  const progressColor = useMemo(() => {
    if (healthSummary.overallScore >= 90) return "bg-green-500";
    if (healthSummary.overallScore >= 70) return "bg-yellow-500";
    if (healthSummary.overallScore >= 50) return "bg-orange-500";
    return "bg-red-500";
  }, [healthSummary.overallScore]);

  const TrendIcon = useMemo(() => {
    switch (healthSummary.trend) {
      case "improving":
        return TrendingUp;
      case "declining":
        return TrendingDown;
      default:
        return Minus;
    }
  }, [healthSummary.trend]);

  const trendColor = useMemo(() => {
    switch (healthSummary.trend) {
      case "improving":
        return "text-green-500";
      case "declining":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  }, [healthSummary.trend]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Translation Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={cn("text-4xl font-bold", scoreColor)}>
              {healthSummary.overallScore}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <TrendIcon className={cn("h-3 w-3", trendColor)} />
              <span className={trendColor}>
                {healthSummary.trend === "stable"
                  ? "Stable"
                  : `${healthSummary.trendPercentage > 0 ? "+" : ""}${healthSummary.trendPercentage}%`}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2">
              {healthSummary.criticalIssues > 0 ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : healthSummary.totalIssues > 0 ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm font-medium">
                {healthSummary.totalIssues} issues
              </span>
            </div>
            {healthSummary.criticalIssues > 0 && (
              <Badge variant="destructive" className="text-xs">
                {healthSummary.criticalIssues} critical
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Progress
            value={healthSummary.overallScore}
            className={cn("h-2", progressColor)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
