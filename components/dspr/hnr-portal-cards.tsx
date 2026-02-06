"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DsprHnr, DsprPortal } from "@/types/dspr.types";
import { Timer, ShieldCheck } from "lucide-react";
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
  const barColor =
    metPercent >= 95
      ? "bg-green-500"
      : metPercent >= 85
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Timer className="h-4 w-4 text-orange-500" />
          Hot-N-Ready
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Promise Met Percentage - prominent */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Promise Met</span>
            <span className="text-2xl font-bold tabular-nums">
              {metPercent.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", barColor)}
              style={{ width: `${Math.min(metPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatBlock label="Transactions" value={hnr.hnr_transactions} />
          <StatBlock label="Promise Met" value={hnr.hnr_promise_met} />
          <StatBlock
            label="Broken"
            value={hnr.hnr_broken_promises}
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
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-500" />
          Portal Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Two main percentages */}
        <div className="grid grid-cols-2 gap-3">
          <PercentBlock
            label="Put Into Portal"
            value={portal.put_into_portal_percent}
          />
          <PercentBlock
            label="On Time"
            value={portal.in_portal_on_time_percent}
          />
        </div>

        {/* Detailed stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatBlock label="Eligible" value={portal.portal_eligible_orders} />
          <StatBlock label="Used" value={portal.portal_used_orders} />
          <StatBlock label="On Time" value={portal.portal_on_time_orders} />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Shared helpers
// ============================================================================

function StatBlock({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className={cn("text-lg font-bold tabular-nums", valueClassName)}>
        {value.toLocaleString()}
      </p>
      <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

function PercentBlock({ label, value }: { label: string; value: number }) {
  const color =
    value >= 98
      ? "text-green-600 dark:text-green-400"
      : value >= 90
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="text-center space-y-1">
      <p className={cn("text-2xl font-bold tabular-nums", color)}>
        {value.toFixed(1)}%
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <Progress value={Math.min(value, 100)} className="h-1.5" />
    </div>
  );
}
