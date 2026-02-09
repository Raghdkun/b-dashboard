"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DsprHnr, DsprPortal } from "@/types/dspr.types";
import { Timer, ShieldCheck, CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// HNR (Hot-N-Ready) Card
// ============================================================================

interface HnrCardProps {
  hnr: DsprHnr;
  className?: string;
}

export function HnrCard({ hnr, className }: HnrCardProps) {
  const metPercent = hnr.hnr_promise_met_percent;
  const status =
    metPercent >= 95 ? "excellent" : metPercent >= 85 ? "warning" : "critical";

  const statusConfig = {
    excellent: {
      barColor: "bg-emerald-500",
      trackColor: "bg-emerald-100 dark:bg-emerald-950/40",
      textColor: "text-emerald-600 dark:text-emerald-400",
      label: "Excellent",
    },
    warning: {
      barColor: "bg-amber-500",
      trackColor: "bg-amber-100 dark:bg-amber-950/40",
      textColor: "text-amber-600 dark:text-amber-400",
      label: "Needs Attention",
    },
    critical: {
      barColor: "bg-red-500",
      trackColor: "bg-red-100 dark:bg-red-950/40",
      textColor: "text-red-600 dark:text-red-400",
      label: "Critical",
    },
  }[status];

  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="rounded-lg p-1.5 bg-orange-500/15 dark:bg-orange-500/20">
            <Timer className="h-4 w-4 text-orange-500" />
          </div>
          Hot-N-Ready
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground ms-auto cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-50">
              Tracks how well HNR promises are being met for customers
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Promise Met % — Hero metric */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Promise Met
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-2xl font-bold tabular-nums", statusConfig.textColor)}>
                {metPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          <div
            className={cn("relative h-2.5 w-full overflow-hidden rounded-full", statusConfig.trackColor)}
            role="progressbar"
            aria-valuenow={Math.round(metPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`HNR Promise Met: ${metPercent.toFixed(1)}%`}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                statusConfig.barColor
              )}
              style={{ width: `${Math.min(metPercent, 100)}%` }}
            />
          </div>
          <p className={cn("text-[11px] font-medium", statusConfig.textColor)}>
            {statusConfig.label}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <MetricBlock
            label="Transactions"
            value={hnr.hnr_transactions}
            icon={<Timer className="h-3 w-3 text-muted-foreground" />}
          />
          <MetricBlock
            label="Kept"
            value={hnr.hnr_promise_met}
            icon={<CheckCircle2 className="h-3 w-3 text-emerald-500" />}
          />
          <MetricBlock
            label="Broken"
            value={hnr.hnr_broken_promises}
            icon={<XCircle className="h-3 w-3 text-red-500" />}
            valueClassName={
              hnr.hnr_broken_promises > 0
                ? "text-red-600 dark:text-red-400"
                : undefined
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Portal Performance Card
// ============================================================================

interface PortalCardProps {
  portal: DsprPortal;
  className?: string;
}

export function PortalCard({ portal, className }: PortalCardProps) {
  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="rounded-lg p-1.5 bg-blue-500/15 dark:bg-blue-500/20">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </div>
          Portal Performance
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground ms-auto cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-50">
              Measures portal usage and on-time order completion rates
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Two main percentages with ring indicators */}
        <div className="grid grid-cols-2 gap-4">
          <RingMetric
            label="Put Into Portal"
            value={portal.put_into_portal_percent}
            color={
              portal.put_into_portal_percent >= 98
                ? "stroke-emerald-500"
                : portal.put_into_portal_percent >= 90
                  ? "stroke-amber-500"
                  : "stroke-red-500"
            }
          />
          <RingMetric
            label="On Time"
            value={portal.in_portal_on_time_percent}
            color={
              portal.in_portal_on_time_percent >= 98
                ? "stroke-emerald-500"
                : portal.in_portal_on_time_percent >= 90
                  ? "stroke-amber-500"
                  : "stroke-red-500"
            }
          />
        </div>

        {/* Detailed stats */}
        <div className="grid grid-cols-3 gap-3">
          <MetricBlock
            label="Eligible"
            value={portal.portal_eligible_orders}
          />
          <MetricBlock
            label="Used"
            value={portal.portal_used_orders}
          />
          <MetricBlock
            label="On Time"
            value={portal.portal_on_time_orders}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Shared helpers
// ============================================================================

function MetricBlock({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="text-center space-y-0.5">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <p className={cn("text-lg font-bold tabular-nums", valueClassName)}>
          {value.toLocaleString()}
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground leading-tight font-medium uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

/** Compact ring/donut metric */
function RingMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  const textColor =
    value >= 98
      ? "text-emerald-600 dark:text-emerald-400"
      : value >= 90
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-19 h-19">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 76 76"
          role="img"
          aria-label={`${label}: ${value.toFixed(1)}%`}
        >
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted/30"
            strokeWidth="5"
          />
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            className={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-sm font-bold tabular-nums", textColor)}>
            {value.toFixed(1)}%
          </span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide text-center">
        {label}
      </p>
    </div>
  );
}
