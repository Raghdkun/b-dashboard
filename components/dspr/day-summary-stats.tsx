"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DollarSign,
  Banknote,
  ArrowUpDown,
  RotateCcw,
  Users,
  Trash2,
  HandCoins,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { DsprDay } from "@/types/dspr.types";
import { cn } from "@/lib/utils";

interface DaySummaryStatsProps {
  day: DsprDay;
  className?: string;
}

const fmt = (v: number, decimals = 2) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

type StatConfig = {
  label: string;
  value: string;
  rawValue: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  iconBg: string;
  tooltip: string;
  trend?: "positive" | "negative" | "neutral";
};

export function DaySummaryStats({ day, className }: DaySummaryStatsProps) {
  const stats: StatConfig[] = [
    {
      label: "Total Cash Sales",
      value: fmt(day.total_cash_sales),
      rawValue: day.total_cash_sales,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      iconBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
      tooltip: "Total cash sales for the day",
      trend: "positive",
    },
    {
      label: "Total Deposit",
      value: fmt(day.total_deposit),
      rawValue: day.total_deposit,
      icon: Banknote,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      iconBg: "bg-blue-500/15 dark:bg-blue-500/20",
      tooltip: "Total bank deposit for the day",
      trend: "neutral",
    },
    {
      label: "Over/Short",
      value: fmt(day.over_short),
      rawValue: day.over_short,
      icon: ArrowUpDown,
      color:
        day.over_short >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
      bg:
        day.over_short >= 0
          ? "bg-emerald-500/10"
          : "bg-red-500/10",
      iconBg:
        day.over_short >= 0
          ? "bg-emerald-500/15 dark:bg-emerald-500/20"
          : "bg-red-500/15 dark:bg-red-500/20",
      tooltip: day.over_short >= 0 ? "Cash register is over" : "Cash register is short",
      trend: day.over_short >= 0 ? "positive" : "negative",
    },
    {
      label: "Refunded Orders",
      value: `${day.refunded_orders.count} / ${fmt(day.refunded_orders.sales)}`,
      rawValue: day.refunded_orders.sales,
      icon: RotateCcw,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
      iconBg: "bg-orange-500/15 dark:bg-orange-500/20",
      tooltip: `${day.refunded_orders.count} order(s) refunded totaling ${fmt(day.refunded_orders.sales)}`,
      trend: day.refunded_orders.count > 0 ? "negative" : "positive",
    },
    {
      label: "Customer Count",
      value: day.customer_count.toLocaleString(),
      rawValue: day.customer_count,
      icon: Users,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
      iconBg: "bg-violet-500/15 dark:bg-violet-500/20",
      tooltip: "Total number of customers served",
      trend: "positive",
    },
    {
      label: "Waste (Alta)",
      value: fmt(day.waste.alta_inventory),
      rawValue: day.waste.alta_inventory,
      icon: Trash2,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10",
      iconBg: "bg-red-500/15 dark:bg-red-500/20",
      tooltip: "Alta inventory waste value",
      trend: "negative",
    },
    {
      label: "Waste (Normal)",
      value: fmt(day.waste.normal),
      rawValue: day.waste.normal,
      icon: Trash2,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      iconBg: "bg-amber-500/15 dark:bg-amber-500/20",
      tooltip: "Normal waste value",
      trend: "negative",
    },
    {
      label: "Total Tips",
      value: fmt(day.total_tips),
      rawValue: day.total_tips,
      icon: HandCoins,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-500/10",
      iconBg: "bg-teal-500/15 dark:bg-teal-500/20",
      tooltip: "Total tips collected for the day",
      trend: "positive",
    },
  ];

  return (
    <div className={cn("grid gap-3 grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon =
          stat.trend === "positive"
            ? TrendingUp
            : stat.trend === "negative"
              ? TrendingDown
              : null;

        return (
          <Tooltip key={stat.label}>
            <TooltipTrigger asChild>
              <Card className="group relative overflow-hidden border-transparent hover:border-border/50 hover:shadow-md transition-all duration-200 cursor-default">
                {/* Subtle gradient accent at the top */}
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                    stat.bg
                  )}
                />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground truncate">
                        {stat.label}
                      </p>
                      <p className="text-xl font-bold tabular-nums tracking-tight truncate">
                        {stat.value}
                      </p>
                    </div>
                    <div className={cn("rounded-lg p-2 shrink-0", stat.iconBg)}>
                      <Icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                  </div>
                  {TrendIcon && (
                    <div className="mt-2 flex items-center gap-1">
                      <TrendIcon
                        className={cn(
                          "h-3 w-3",
                          stat.trend === "positive"
                            ? "text-emerald-500"
                            : "text-red-500"
                        )}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        vs. previous
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom">{stat.tooltip}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
