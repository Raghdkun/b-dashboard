# Multilingual Content Intelligence System
## Dashboard UI Technical Design

**Version:** 1.0.0  
**Date:** 2026-01-13  
**Status:** Draft

---

## Overview

This document provides the technical design for the Translation Intelligence Dashboard UI, including component architecture, routing structure, and implementation details.

---

## Routing Structure

```
app/[locale]/(dashboard)/dashboard/
├── dev-tools/
│   └── i18n/
│       ├── page.tsx                    # Main dashboard
│       ├── loading.tsx                 # Dashboard skeleton
│       ├── issues/
│       │   ├── page.tsx                # Issue list with filters
│       │   └── [id]/
│       │       └── page.tsx            # Issue detail view
│       ├── locale/
│       │   └── [locale]/
│       │       └── page.tsx            # Per-locale analysis
│       ├── routes/
│       │   └── page.tsx                # Route heatmap
│       ├── rtl/
│       │   └── page.tsx                # RTL validation
│       └── settings/
│           └── page.tsx                # Intelligence settings
```

---

## Component Architecture

```
components/
├── i18n-intelligence/
│   ├── dashboard/
│   │   ├── health-overview.tsx         # Health score cards
│   │   ├── issue-summary.tsx           # Issue type breakdown
│   │   ├── locale-coverage.tsx         # Per-locale coverage
│   │   ├── problem-heatmap.tsx         # Route/widget heatmap
│   │   └── recent-issues.tsx           # Latest issues list
│   ├── issues/
│   │   ├── issue-list.tsx              # Filterable issue table
│   │   ├── issue-card.tsx              # Single issue card
│   │   ├── issue-detail.tsx            # Full issue view
│   │   ├── issue-filters.tsx           # Filter controls
│   │   └── issue-actions.tsx           # Status update buttons
│   ├── analysis/
│   │   ├── locale-drilldown.tsx        # Locale → Route → Key
│   │   ├── route-analysis.tsx          # Route health view
│   │   ├── widget-analysis.tsx         # Widget health view
│   │   └── key-usage.tsx               # Key usage stats
│   ├── rtl/
│   │   ├── visual-diff.tsx             # LTR vs RTL comparison
│   │   ├── rtl-issues.tsx              # RTL-specific issues
│   │   └── rtl-validator.tsx           # Live RTL check
│   ├── charts/
│   │   ├── health-trend.tsx            # Health over time
│   │   ├── severity-donut.tsx          # Severity breakdown
│   │   └── coverage-bar.tsx            # Locale coverage
│   ├── shared/
│   │   ├── severity-badge.tsx          # Severity indicator
│   │   ├── status-badge.tsx            # Issue status badge
│   │   ├── confidence-indicator.tsx    # Detection confidence
│   │   ├── locale-flag.tsx             # Locale flag icon
│   │   └── empty-state.tsx             # No data states
│   └── index.ts                        # Barrel export
```

---

## Main Dashboard Page

```tsx
// app/[locale]/(dashboard)/dashboard/dev-tools/i18n/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { 
  HealthOverview,
  IssueSummary,
  LocaleCoverage,
  ProblemHeatmap,
  RecentIssues,
} from "@/components/i18n-intelligence";
import { useTranslationIntelligenceStore } from "@/lib/i18n-intelligence";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Settings } from "lucide-react";
import Link from "next/link";

export default function TranslationIntelligencePage() {
  const t = useTranslations("devTools.i18n");
  const { 
    healthSummary, 
    isAnalyzing, 
    startAnalysis,
    exportReport 
  } = useTranslationIntelligenceStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startAnalysis('full')}
            disabled={isAnalyzing}
          >
            <RefreshCw className={cn(
              "h-4 w-4 me-2",
              isAnalyzing && "animate-spin"
            )} />
            {isAnalyzing ? t("analyzing") : t("refresh")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport()}
          >
            <Download className="h-4 w-4 me-2" />
            {t("export")}
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="./i18n/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Health Overview */}
      <HealthOverview summary={healthSummary} />

      {/* Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issue Summary by Type */}
        <IssueSummary />
        
        {/* Locale Coverage */}
        <LocaleCoverage />
      </div>

      {/* Problem Heatmap */}
      <ProblemHeatmap />

      {/* Recent Issues */}
      <RecentIssues limit={10} />
    </div>
  );
}
```

---

## Key Components

### Health Overview

```tsx
// components/i18n-intelligence/dashboard/health-overview.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TranslationHealthSummary } from "@/lib/i18n-intelligence/types";
import { cn } from "@/lib/utils";

interface HealthOverviewProps {
  summary: TranslationHealthSummary | null;
}

export function HealthOverview({ summary }: HealthOverviewProps) {
  if (!summary) {
    return <HealthOverviewSkeleton />;
  }

  const { overallScore, scoreChange, totalIssues, issuesBySeverity } = summary;

  const TrendIcon = scoreChange > 0 
    ? TrendingUp 
    : scoreChange < 0 
    ? TrendingDown 
    : Minus;

  const trendColor = scoreChange > 0 
    ? "text-green-500" 
    : scoreChange < 0 
    ? "text-red-500" 
    : "text-muted-foreground";

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {/* Overall Health */}
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Overall Health
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {overallScore}%
                </span>
                <div className={cn("flex items-center gap-1", trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-sm">
                    {scoreChange > 0 && '+'}
                    {scoreChange}%
                  </span>
                </div>
              </div>
            </div>
            <div className="h-16 w-16">
              <HealthGauge value={overallScore} />
            </div>
          </div>
          <Progress 
            value={overallScore} 
            className="mt-4" 
          />
        </CardContent>
      </Card>

      {/* Severity Breakdown */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-muted-foreground">Blocker</p>
          <p className="text-2xl font-bold text-red-500">
            {issuesBySeverity.blocker}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-muted-foreground">High</p>
          <p className="text-2xl font-bold text-orange-500">
            {issuesBySeverity.high}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-muted-foreground">Medium/Low</p>
          <p className="text-2xl font-bold text-yellow-500">
            {issuesBySeverity.medium + issuesBySeverity.low}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function HealthGauge({ value }: { value: number }) {
  const color = value >= 90 
    ? "text-green-500" 
    : value >= 70 
    ? "text-yellow-500" 
    : "text-red-500";

  return (
    <svg viewBox="0 0 36 36" className={cn("transform -rotate-90", color)}>
      <path
        d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray={`${value}, 100`}
        strokeLinecap="round"
      />
    </svg>
  );
}
```

### Issue Card

```tsx
// components/i18n-intelligence/issues/issue-card.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Languages, 
  Code, 
  ArrowRight,
  Clock,
  MapPin
} from "lucide-react";
import type { TranslationIssue } from "@/lib/i18n-intelligence/types";
import { SeverityBadge } from "../shared/severity-badge";
import { StatusBadge } from "../shared/status-badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface IssueCardProps {
  issue: TranslationIssue;
  compact?: boolean;
}

const ISSUE_ICONS = {
  missing: AlertCircle,
  fallback: Languages,
  hardcoded: Code,
  overflow: ArrowRight,
  'rtl-alignment': ArrowRight,
  'rtl-direction': ArrowRight,
  pluralization: Languages,
  interpolation: Code,
  unused: AlertCircle,
};

export function IssueCard({ issue, compact = false }: IssueCardProps) {
  const Icon = ISSUE_ICONS[issue.type];

  if (compact) {
    return (
      <div className="flex items-center gap-4 py-3 px-4 hover:bg-muted/50 rounded-lg transition-colors">
        <SeverityBadge severity={issue.severity} />
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {issue.type === 'hardcoded' 
              ? (issue as any).detectedString 
              : (issue as any).fullKey || issue.description}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {issue.location.route} • {issue.location.componentName}
          </p>
        </div>
        <StatusBadge status={issue.status} />
        <Button variant="ghost" size="sm" asChild>
          <Link href={`./i18n/issues/${issue.id}`}>
            View
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={issue.severity} size="lg" />
          <Badge variant="outline" className="capitalize">
            {issue.type.replace('-', ' ')}
          </Badge>
        </div>
        <StatusBadge status={issue.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium text-lg">
            {issue.type === 'hardcoded' 
              ? `"${(issue as any).detectedString}"` 
              : (issue as any).fullKey}
          </p>
          <p className="text-muted-foreground mt-1">
            {issue.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{issue.location.route}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Code className="h-3 w-3" />
            <span>{issue.location.componentName}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(issue.lastSeen, { addSuffix: true })}</span>
          </div>
        </div>

        {issue.suggestedFix && (
          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-sm font-medium">Suggested Fix</p>
            <p className="text-sm text-muted-foreground mt-1">
              {issue.suggestedFix}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">
            Dismiss
          </Button>
          <Button size="sm" asChild>
            <Link href={`./i18n/issues/${issue.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Problem Heatmap

```tsx
// components/i18n-intelligence/dashboard/problem-heatmap.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslationIntelligenceStore } from "@/lib/i18n-intelligence";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RouteHeatmapData {
  route: string;
  issues: number;
  healthScore: number;
}

export function ProblemHeatmap() {
  const { healthSummary } = useTranslationIntelligenceStore();
  
  if (!healthSummary) {
    return <ProblemHeatmapSkeleton />;
  }

  const routes = healthSummary.topProblematicRoutes;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Problem Heatmap</span>
          <Link 
            href="./i18n/routes" 
            className="text-sm font-normal text-primary hover:underline"
          >
            View all routes
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {routes.map((route) => (
            <RouteHeatmapRow key={route.route} data={route} />
          ))}
          
          {routes.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No issues detected. Great job! 🎉
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RouteHeatmapRow({ data }: { data: RouteHeatmapData }) {
  const intensity = getHeatmapIntensity(data.issues);
  
  return (
    <Link 
      href={`./i18n/routes?route=${encodeURIComponent(data.route)}`}
      className="flex items-center gap-4 py-2 px-3 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <code className="flex-1 text-sm font-mono truncate">
        {data.route}
      </code>
      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "w-32 h-4 rounded-full overflow-hidden bg-muted",
          )}
        >
          <div 
            className={cn(
              "h-full transition-all",
              intensity.bgClass
            )}
            style={{ width: `${Math.min(100, data.issues * 10)}%` }}
          />
        </div>
        <span className={cn(
          "text-sm font-medium min-w-[4ch] text-right",
          intensity.textClass
        )}>
          {data.issues}
        </span>
      </div>
    </Link>
  );
}

function getHeatmapIntensity(issues: number): { bgClass: string; textClass: string } {
  if (issues === 0) {
    return { bgClass: "bg-green-500", textClass: "text-green-500" };
  }
  if (issues <= 2) {
    return { bgClass: "bg-yellow-500", textClass: "text-yellow-500" };
  }
  if (issues <= 5) {
    return { bgClass: "bg-orange-500", textClass: "text-orange-500" };
  }
  return { bgClass: "bg-red-500", textClass: "text-red-500" };
}
```

### RTL Visual Diff

```tsx
// components/i18n-intelligence/rtl/visual-diff.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RefreshCw, Maximize2 } from "lucide-react";

interface VisualDiffProps {
  route?: string;
}

export function VisualDiff({ route = "/dashboard" }: VisualDiffProps) {
  const [viewMode, setViewMode] = useState<"side-by-side" | "overlay" | "diff">("side-by-side");
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    setIsCapturing(true);
    // Capture screenshots using html2canvas or similar
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsCapturing(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>RTL Visual Comparison</CardTitle>
          <div className="flex items-center gap-4">
            <Select defaultValue={route}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/dashboard">Dashboard</SelectItem>
                <SelectItem value="/dashboard/users">Users</SelectItem>
                <SelectItem value="/dashboard/settings">Settings</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
                <TabsTrigger value="overlay">Overlay</TabsTrigger>
                <TabsTrigger value="diff">Diff</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCapture}
              disabled={isCapturing}
            >
              <RefreshCw className={cn("h-4 w-4 me-2", isCapturing && "animate-spin")} />
              Capture
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {viewMode === "side-by-side" && (
          <div className="grid grid-cols-2 divide-x">
            <div className="p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                English (LTR)
              </p>
              <div className="border rounded-lg aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">LTR Screenshot</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Arabic (RTL)
              </p>
              <div className="border rounded-lg aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">RTL Screenshot</p>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === "overlay" && (
          <div className="relative p-4">
            <div className="border rounded-lg aspect-video bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Overlay View (drag slider)</p>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="50"
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4"
            />
          </div>
        )}

        {viewMode === "diff" && (
          <div className="p-4">
            <div className="border rounded-lg aspect-video bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">
                Difference highlighting (red = differences)
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## i18n Keys for Dashboard

```json
// Add to lib/i18n/locales/en.json
{
  "devTools": {
    "i18n": {
      "title": "Translation Intelligence",
      "description": "Monitor and fix translation issues across your application",
      "refresh": "Refresh Analysis",
      "analyzing": "Analyzing...",
      "export": "Export Report",
      "settings": "Settings",
      
      "health": {
        "title": "Translation Health",
        "overall": "Overall Score",
        "improving": "Improving",
        "declining": "Declining",
        "stable": "Stable"
      },
      
      "issues": {
        "title": "Issues",
        "missing": "Missing Translations",
        "fallback": "Fallback Usage",
        "hardcoded": "Hardcoded Strings",
        "rtl": "RTL Issues",
        "overflow": "Text Overflow",
        "noIssues": "No issues found",
        "allResolved": "All issues resolved! 🎉"
      },
      
      "severity": {
        "blocker": "Blocker",
        "high": "High",
        "medium": "Medium",
        "low": "Low"
      },
      
      "status": {
        "open": "Open",
        "acknowledged": "Acknowledged",
        "inProgress": "In Progress",
        "resolved": "Resolved",
        "wontFix": "Won't Fix",
        "falsePositive": "False Positive"
      },
      
      "actions": {
        "viewDetails": "View Details",
        "markResolved": "Mark Resolved",
        "dismiss": "Dismiss",
        "openFile": "Open File",
        "copyKey": "Copy Key"
      },
      
      "filters": {
        "all": "All",
        "type": "Type",
        "severity": "Severity",
        "status": "Status",
        "locale": "Locale",
        "route": "Route",
        "search": "Search keys..."
      },
      
      "rtl": {
        "title": "RTL Validation",
        "sideBySide": "Side by Side",
        "overlay": "Overlay",
        "diff": "Difference",
        "capture": "Capture",
        "noIssues": "No RTL issues detected"
      },
      
      "empty": {
        "title": "No Data Yet",
        "description": "Run an analysis to detect translation issues",
        "action": "Start Analysis"
      }
    }
  }
}
```

---

## Navigation Integration

Add to sidebar navigation:

```tsx
// In sidebar.tsx navItems array (development only)
{
  title: "Dev Tools",
  icon: Code,
  href: `/${locale}/dashboard/dev-tools`,
  children: [
    {
      title: t("devTools.i18n.title"),
      href: `/${locale}/dashboard/dev-tools/i18n`,
      icon: Languages,
    }
  ],
  // Only show in development
  hidden: process.env.NODE_ENV === 'production',
}
```

---

## Loading States

```tsx
// app/[locale]/(dashboard)/dashboard/dev-tools/i18n/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TranslationIntelligenceLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Health Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-20 mb-4" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Implementation Tasks

### Phase 1: Core UI (MVP)

- [ ] Create route structure under `/dev-tools/i18n`
- [ ] Build `HealthOverview` component
- [ ] Build `IssueCard` and `IssueList` components
- [ ] Build `SeverityBadge` and `StatusBadge` shared components
- [ ] Create main dashboard page with mocked data

### Phase 2: Filtering & Navigation

- [ ] Implement issue filters (type, severity, status, locale)
- [ ] Create issue detail page with full context
- [ ] Add locale drilldown view
- [ ] Add route analysis view

### Phase 3: RTL & Visual

- [ ] Create RTL validation page
- [ ] Implement visual diff comparison
- [ ] Add screenshot capture functionality
- [ ] Build overlay comparison slider

### Phase 4: Charts & Trends

- [ ] Add health trend chart (line chart over time)
- [ ] Add severity breakdown chart (donut)
- [ ] Add locale coverage chart (bar)
- [ ] Implement data export (JSON, CSV, Markdown)

---

## Next Steps

1. **Implementation Tasks** → [TASKS.md](./TASKS.md)
2. **Begin Implementation** → Create `lib/i18n-intelligence/` structure
