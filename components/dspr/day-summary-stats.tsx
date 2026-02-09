"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ClipboardList,
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
  iconBg: string;
  tooltip: string;
  isNegative?: boolean;
};

export function DaySummaryStats({ day, className }: DaySummaryStatsProps) {
  const stats: StatConfig[] = [
    {
      label: "Total Cash Sales",
      value: fmt(day.total_cash_sales),
      rawValue: day.total_cash_sales,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
      tooltip: "Total cash sales for the day",
    },
    {
      label: "Total Deposit",
      value: fmt(day.total_deposit),
      rawValue: day.total_deposit,
      icon: Banknote,
      color: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/15 dark:bg-blue-500/20",
      tooltip: "Total bank deposit for the day",
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
      iconBg:
        day.over_short >= 0
          ? "bg-emerald-500/15 dark:bg-emerald-500/20"
          : "bg-red-500/15 dark:bg-red-500/20",
      tooltip: day.over_short >= 0 ? "Cash register is over" : "Cash register is short",
      isNegative: day.over_short < 0,
    },
    {
      label: "Refunded Orders",
      value: `${day.refunded_orders.count} / ${fmt(day.refunded_orders.sales)}`,
      rawValue: day.refunded_orders.sales,
      icon: RotateCcw,
      color: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-500/15 dark:bg-orange-500/20",
      tooltip: `${day.refunded_orders.count} order(s) refunded totaling ${fmt(day.refunded_orders.sales)}`,
      isNegative: day.refunded_orders.count > 0,
    },
    {
      label: "Customer Count",
      value: day.customer_count.toLocaleString(),
      rawValue: day.customer_count,
      icon: Users,
      color: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-500/15 dark:bg-violet-500/20",
      tooltip: "Total number of customers served",
    },
    {
      label: "Waste (Alta)",
      value: fmt(day.waste.alta_inventory),
      rawValue: day.waste.alta_inventory,
      icon: Trash2,
      color: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-500/15 dark:bg-red-500/20",
      tooltip: "Alta inventory waste value",
      isNegative: true,
    },
    {
      label: "Waste (Normal)",
      value: fmt(day.waste.normal),
      rawValue: day.waste.normal,
      icon: Trash2,
      color: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/15 dark:bg-amber-500/20",
      tooltip: "Normal waste value",
      isNegative: true,
    },
    {
      label: "Total Tips",
      value: fmt(day.total_tips),
      rawValue: day.total_tips,
      icon: HandCoins,
      color: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-500/15 dark:bg-teal-500/20",
      tooltip: "Total tips collected for the day",
    },
  ];

  return (
    <Card className={cn("hover:shadow-md transition-shadow h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="rounded-lg p-1.5 bg-primary/10">
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          Day Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Tooltip key={stat.label}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 group/stat cursor-default rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors">
                    <div className={cn("rounded-lg p-2 shrink-0", stat.iconBg)}>
                      <Icon className={cn("h-4.5 w-4.5", stat.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground truncate">
                        {stat.label}
                      </p>
                      <p className={cn(
                        "text-base font-bold tabular-nums tracking-tight truncate",
                        stat.isNegative && "text-red-600 dark:text-red-400"
                      )}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">{stat.tooltip}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
