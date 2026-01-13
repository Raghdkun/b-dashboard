/**
 * i18n Intelligence Dashboard - Issue Summary Cards
 */

"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileQuestion,
  Languages,
  Type,
  AlignLeft,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18nIntelligenceStore, type IssueType } from "@/lib/i18n-intelligence";

interface IssueSummaryCardProps {
  type: IssueType;
  className?: string;
}

const issueTypeConfig: Record<
  IssueType,
  {
    labelKey: string;
    descKey: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  missing: {
    labelKey: "missing",
    descKey: "missingDesc",
    icon: FileQuestion,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  fallback: {
    labelKey: "fallback",
    descKey: "fallbackDesc",
    icon: Languages,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  hardcoded: {
    labelKey: "hardcoded",
    descKey: "hardcodedDesc",
    icon: Type,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  overflow: {
    labelKey: "overflow",
    descKey: "overflowDesc",
    icon: AlignLeft,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  "rtl-alignment": {
    labelKey: "rtlAlignment",
    descKey: "rtlAlignmentDesc",
    icon: ArrowLeftRight,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  "rtl-direction": {
    labelKey: "rtlDirection",
    descKey: "rtlDirectionDesc",
    icon: ArrowLeftRight,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
};

export function IssueSummaryCard({ type, className }: IssueSummaryCardProps) {
  const t = useTranslations("devTools.i18n.issueTypes");
  const healthSummary = useI18nIntelligenceStore((s) => s.healthSummary);
  const count = healthSummary.issuesByType[type] || 0;
  const config = issueTypeConfig[type];
  const Icon = config.icon;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={cn("rounded-md p-2", config.bgColor)}>
            <Icon className={cn("h-4 w-4", config.color)} />
          </div>
          <CardTitle className="text-sm font-medium">{t(config.labelKey)}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn("text-3xl font-bold", count > 0 ? config.color : "text-muted-foreground")}>
          {count}
        </p>
        <p className="text-xs text-muted-foreground">{t(config.descKey)}</p>
      </CardContent>
    </Card>
  );
}

export function IssueSummaryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <IssueSummaryCard type="missing" />
      <IssueSummaryCard type="fallback" />
      <IssueSummaryCard type="hardcoded" />
      <IssueSummaryCard type="rtl-alignment" />
    </div>
  );
}
