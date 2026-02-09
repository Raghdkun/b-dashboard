"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DsprSales } from "@/types/dspr.types";
import type { ApexOptions } from "apexcharts";
import { cn } from "@/lib/utils";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <Skeleton className="h-87.5 w-full" />,
});

/** Day-name labels for the x-axis (Mon → Sun) */
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface SalesChartProps {
  sales: DsprSales;
  /** Show/hide individual series – default all visible */
  showThisWeek?: boolean;
  showPreviousWeek?: boolean;
  showLastYear?: boolean;
  /** Chart height in px */
  height?: number;
  /** Card title override */
  title?: string;
  /** Enable/disable data labels */
  dataLabels?: boolean;
  /** Column border-radius */
  columnBorderRadius?: number;
  /** Column width percentage */
  columnWidth?: string;
  /** Line stroke width */
  lineStrokeWidth?: number;
  /** Custom colors [thisWeek, prevWeek, lastYear] */
  colors?: [string, string, string];
  /** Enable/disable chart toolbar (download, zoom, etc.) */
  toolbar?: boolean;
  /** Enable/disable chart animations */
  animations?: boolean;
  /** Legend position */
  legendPosition?: "top" | "bottom" | "left" | "right";
  /** Legend horizontal align */
  legendAlign?: "left" | "center" | "right";
  /** Enable/disable tooltip */
  tooltip?: boolean;
  /** Currency prefix for values (default "$") */
  currencyPrefix?: string;
  /** Grid show/hide */
  grid?: boolean;
  className?: string;
}

export function SalesChart({
  sales,
  showThisWeek = true,
  showPreviousWeek = true,
  showLastYear = true,
  height = 350,
  title = "Weekly Sales Comparison",
  dataLabels = false,
  columnBorderRadius = 4,
  columnWidth = "50%",
  lineStrokeWidth = 4,
  colors = ["#008FFB", "#00E396", "#FEB019"],
  toolbar = true,
  animations = true,
  legendPosition = "top",
  legendAlign = "left",
  tooltip = true,
  currencyPrefix = "$",
  grid = true,
  className,
}: SalesChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { series, categories } = useMemo(() => {
    const thisWeekValues = Object.values(sales.this_week_by_day);
    const prevWeekValues = Object.values(sales.previous_week_by_day);
    const lastYearValues = Object.values(sales.same_week_last_year_by_day);

    // Build categories from actual day names (use index → DAY_NAMES)
    const cats = thisWeekValues.map((_, i) => DAY_NAMES[i] || `Day ${i + 1}`);

    const s: ApexAxisChartSeries = [];
    if (showThisWeek) {
      s.push({ name: "This Week", type: "column", data: thisWeekValues });
    }
    if (showPreviousWeek) {
      s.push({ name: "Previous Week", type: "column", data: prevWeekValues });
    }
    if (showLastYear) {
      s.push({ name: "Same Week Last Year", type: "line", data: lastYearValues });
    }

    return { series: s, categories: cats };
  }, [sales, showThisWeek, showPreviousWeek, showLastYear]);

  /** Map active series to their colours */
  const activeColors = useMemo(() => {
    const c: string[] = [];
    if (showThisWeek) c.push(colors[0]);
    if (showPreviousWeek) c.push(colors[1]);
    if (showLastYear) c.push(colors[2]);
    return c;
  }, [showThisWeek, showPreviousWeek, showLastYear, colors]);

  /** Build stroke widths per series (columns get 0, line gets user width) */
  const strokeWidths = useMemo(() => {
    const w: number[] = [];
    if (showThisWeek) w.push(0);
    if (showPreviousWeek) w.push(0);
    if (showLastYear) w.push(lineStrokeWidth);
    return w;
  }, [showThisWeek, showPreviousWeek, showLastYear, lineStrokeWidth]);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        height,
        stacked: false,
        toolbar: { show: toolbar },
        animations: { enabled: animations },
        fontFamily: "inherit",
        background: "transparent",
        foreColor: isDark ? "#a1a1aa" : "#71717a",
      },
      theme: { mode: isDark ? "dark" : "light" },
      colors: activeColors,
      plotOptions: {
        bar: {
          borderRadius: columnBorderRadius,
          columnWidth,
        },
      },
      dataLabels: { enabled: dataLabels },
      stroke: { width: strokeWidths, curve: "smooth" },
      xaxis: {
        categories,
        labels: {
          style: { fontSize: "12px", colors: isDark ? "#a1a1aa" : "#71717a" },
        },
        axisBorder: { color: isDark ? "#3f3f46" : "#e4e4e7" },
        axisTicks: { color: isDark ? "#3f3f46" : "#e4e4e7" },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `${currencyPrefix}${val.toLocaleString()}`,
          style: { fontSize: "12px", colors: isDark ? "#a1a1aa" : "#71717a" },
        },
        title: { text: "Sales", style: { color: isDark ? "#a1a1aa" : "#71717a" } },
      },
      tooltip: {
        enabled: tooltip,
        shared: true,
        intersect: false,
        theme: isDark ? "dark" : "light",
        y: {
          formatter: (val: number) =>
            `${currencyPrefix}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        },
      },
      legend: {
        position: legendPosition,
        horizontalAlign: legendAlign,
        offsetX: 0,
        fontSize: "13px",
        labels: { colors: isDark ? "#a1a1aa" : "#71717a" },
      },
      grid: {
        show: grid,
        borderColor: isDark ? "#27272a" : "#e4e4e7",
      },
      fill: { opacity: [0.85, 0.85, 1] },
    }),
    [
      height,
      toolbar,
      animations,
      activeColors,
      columnBorderRadius,
      columnWidth,
      dataLabels,
      strokeWidths,
      categories,
      currencyPrefix,
      tooltip,
      legendPosition,
      legendAlign,
      grid,
      isDark,
    ]
  );

  if (series.length === 0) return null;

  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="rounded-lg p-1.5 bg-blue-500/15 dark:bg-blue-500/20">
            <svg className="h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={height}
        />
      </CardContent>
    </Card>
  );
}
