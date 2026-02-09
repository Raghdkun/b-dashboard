"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApexOptions } from "apexcharts";
import { cn } from "@/lib/utils";
import { Gauge } from "lucide-react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <Skeleton className="h-55 w-full" />,
});

interface LaborGaugeProps {
  /** Labor percentage value (0-100) */
  value: number;
  /** Max value on the gauge scale */
  max?: number;
  /** Target percentage line */
  target?: number;
  title?: string;
  height?: number;
  /** Colors for the gauge gradient [low, mid, high] */
  colors?: [string, string, string];
  className?: string;
}

export function LaborGauge({
  value,
  max = 100,
  target,
  title = "Labor",
  height = 220,
  colors = ["#00E396", "#FEB019", "#FF4560"],
  className,
}: LaborGaugeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const normalised = Math.min((value / max) * 100, 100);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "radialBar",
        offsetY: -10,
        fontFamily: "inherit",
        background: "transparent",
        foreColor: isDark ? "#a1a1aa" : "#71717a",
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: {
            size: "60%",
            margin: 0,
          },
          track: {
            background: isDark ? "#27272a" : "#e7e7e7",
            strokeWidth: "100%",
            margin: 0,
            dropShadow: {
              enabled: true,
              top: 1,
              left: 0,
              blur: 2,
              opacity: 0.15,
            },
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: "13px",
              color: isDark ? "#a1a1aa" : undefined,
              offsetY: -5,
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: 700,
              color: isDark ? "#fafafa" : undefined,
              offsetY: 5,
              formatter: () => `${value}%`,
            },
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "horizontal",
          shadeIntensity: 0.5,
          gradientToColors: [colors[2]],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 100],
          colorStops: [
            { offset: 0, color: colors[0], opacity: 1 },
            { offset: 50, color: colors[1], opacity: 1 },
            { offset: 100, color: colors[2], opacity: 1 },
          ],
        },
      },
      stroke: { lineCap: "round" },
      labels: ["Labor %"],
    }),
    [value, colors, isDark]
  );

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
      <CardContent className="flex items-center justify-center pb-2">
        <ReactApexChart
          options={options}
          series={[normalised]}
          type="radialBar"
          height={height}
        />
      </CardContent>
    </Card>
  );
}
