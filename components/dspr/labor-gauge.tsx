"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeedometerGauge, type SpeedZone } from "./speedometer-gauge";
import { cn } from "@/lib/utils";
import { Gauge } from "lucide-react";

// ============================================================================
// Labor zones — symmetric around 19-24% green target
// ============================================================================

const LABOR_ZONES: SpeedZone[] = [
  { from: 0, to: 10, color: "#EF4444" },  // red – critical low
  { from: 10, to: 15, color: "#EAB308" }, // yellow – low
  { from: 15, to: 18, color: "#F97316" }, // orange – below target
  { from: 18, to: 24, color: "#22C55E" }, // green – on target
  { from: 24, to: 29, color: "#F97316" }, // orange – above target
  { from: 29, to: 39, color: "#EAB308" }, // yellow – high
  { from: 39, to: 50, color: "#EF4444" }, // red – critical high
];

function getLaborColor(value: number): string {
  if (value <= 10) return "#EF4444";
  if (value <= 15) return "#EAB308";
  if (value <= 18) return "#F97316";
  if (value <= 24) return "#22C55E";
  if (value <= 29) return "#F97316";
  if (value <= 39) return "#EAB308";
  return "#EF4444";
}

function getLaborLabel(value: number): string {
  if (value <= 10) return "Critical Low";
  if (value <= 15) return "Low";
  if (value <= 18) return "Below Target";
  if (value <= 24) return "On Target";
  if (value <= 29) return "Above Target";
  if (value <= 39) return "High";
  return "Critical High";
}

// ============================================================================
// Component
// ============================================================================

interface LaborGaugeProps {
  /** Labor percentage value (0-100) */
  value: number;
  /** Target percentage line */
  target?: number;
  title?: string;
  className?: string;
}

export function LaborGauge({
  value,
  target,
  title = "Labor",
  className,
}: LaborGaugeProps) {
  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="rounded-lg p-1.5 bg-violet-500/15 dark:bg-violet-500/20">
            <Gauge className="h-4 w-4 text-violet-500" />
          </div>
          {title}
          {target !== undefined && (
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              Target: {target}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <SpeedometerGauge
          value={value}
          max={50}
          zones={LABOR_ZONES}
          statusLabel={getLaborLabel(value)}
          statusColor={getLaborColor(value)}
          valueDisplay={`${value}%`}
        />
        <div className="text-center mt-1">
          <p className="text-[10px] text-muted-foreground font-medium">
            Target range:{" "}
            <span className="text-emerald-500 font-semibold">19–24%</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
