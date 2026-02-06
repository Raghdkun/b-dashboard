"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Banknote,
  ArrowUpDown,
  RotateCcw,
  Users,
  Trash2,
  HandCoins,
} from "lucide-react";
import type { DsprDay } from "@/types/dspr.types";
import { cn } from "@/lib/utils";

interface DaySummaryStatsProps {
  day: DsprDay;
  className?: string;
}

const fmt = (v: number, decimals = 2) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

export function DaySummaryStats({ day, className }: DaySummaryStatsProps) {
  const stats = [
    {
      label: "Total Cash Sales",
      value: fmt(day.total_cash_sales),
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "Total Deposit",
      value: fmt(day.total_deposit),
      icon: Banknote,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Over/Short",
      value: fmt(day.over_short),
      icon: ArrowUpDown,
      color:
        day.over_short >= 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
      bg:
        day.over_short >= 0
          ? "bg-green-50 dark:bg-green-950/30"
          : "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Refunded Orders",
      value: `${day.refunded_orders.count} / ${fmt(day.refunded_orders.sales)}`,
      icon: RotateCcw,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      label: "Customer Count",
      value: day.customer_count.toLocaleString(),
      icon: Users,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      label: "Waste (Alta)",
      value: fmt(day.waste.alta_inventory),
      icon: Trash2,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Waste (Normal)",
      value: fmt(day.waste.normal),
      icon: Trash2,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Total Tips",
      value: fmt(day.total_tips),
      icon: HandCoins,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
  ];

  return (
    <div className={cn("grid gap-3 grid-cols-2 md:grid-cols-4", className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-1 pt-3 px-4">
              <div className={cn("rounded-md p-1.5", stat.bg)}>
                <Icon className={cn("h-3.5 w-3.5", stat.color)} />
              </div>
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-lg font-bold tabular-nums">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
