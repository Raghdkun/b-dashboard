/**
 * i18n Intelligence Dashboard - Locale Health Cards
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useI18nIntelligenceStore,
  type SupportedLocale,
} from "@/lib/i18n-intelligence";

const localeNames: Record<SupportedLocale, string> = {
  en: "English",
  ar: "العربية (Arabic)",
};

const localeFlags: Record<SupportedLocale, string> = {
  en: "🇺🇸",
  ar: "🇸🇦",
};

interface LocaleHealthCardProps {
  locale: SupportedLocale;
}

export function LocaleHealthCard({ locale }: LocaleHealthCardProps) {
  const healthSummary = useI18nIntelligenceStore((s) => s.healthSummary);
  const activeLocale = useI18nIntelligenceStore((s) => s.activeLocale);
  const metrics = healthSummary.localeMetrics[locale];

  const healthScore = metrics?.healthScore ?? 100;
  const totalKeys = metrics?.totalKeysUsed ?? 0;
  const missingKeys = metrics?.missingKeys ?? 0;
  const fallbackUsages = metrics?.fallbackUsages ?? 0;

  const scoreColor =
    healthScore >= 90
      ? "text-green-500"
      : healthScore >= 70
        ? "text-yellow-500"
        : healthScore >= 50
          ? "text-orange-500"
          : "text-red-500";

  const progressColor =
    healthScore >= 90
      ? "bg-green-500"
      : healthScore >= 70
        ? "bg-yellow-500"
        : healthScore >= 50
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <Card className={cn(activeLocale === locale && "ring-2 ring-primary")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{localeFlags[locale]}</span>
            <CardTitle className="text-sm font-medium">
              {localeNames[locale]}
            </CardTitle>
          </div>
          {activeLocale === locale && (
            <Badge variant="outline" className="text-xs">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Health Score</span>
          <span className={cn("text-2xl font-bold", scoreColor)}>
            {healthScore}%
          </span>
        </div>

        <Progress value={healthScore} className={cn("h-2", progressColor)} />

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-semibold">{totalKeys}</p>
            <p className="text-xs text-muted-foreground">Keys Used</p>
          </div>
          <div>
            <p
              className={cn(
                "text-lg font-semibold",
                missingKeys > 0 ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {missingKeys}
            </p>
            <p className="text-xs text-muted-foreground">Missing</p>
          </div>
          <div>
            <p
              className={cn(
                "text-lg font-semibold",
                fallbackUsages > 0 ? "text-orange-500" : "text-muted-foreground"
              )}
            >
              {fallbackUsages}
            </p>
            <p className="text-xs text-muted-foreground">Fallbacks</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LocaleHealthGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <LocaleHealthCard locale="en" />
      <LocaleHealthCard locale="ar" />
    </div>
  );
}
