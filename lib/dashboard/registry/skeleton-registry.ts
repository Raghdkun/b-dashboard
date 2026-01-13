import type { WidgetType } from "../types";

/**
 * Maps widget types to their skeleton component names
 * Used for dynamic loading of skeletons
 */
export const widgetSkeletonMap: Record<WidgetType, string> = {
  stats: "StatsWidgetSkeleton",
  "chart-line": "ChartWidgetSkeleton",
  "chart-bar": "ChartWidgetSkeleton",
  "chart-pie": "ChartWidgetSkeleton",
  table: "TableWidgetSkeleton",
  list: "ListWidgetSkeleton",
  calendar: "CalendarWidgetSkeleton",
  "activity-feed": "ActivityWidgetSkeleton",
  "quick-actions": "ActionsWidgetSkeleton",
};

/**
 * Get chart type from widget type for ChartWidgetSkeleton
 */
export function getChartType(widgetType: WidgetType): "bar" | "line" | "pie" {
  switch (widgetType) {
    case "chart-line":
      return "line";
    case "chart-bar":
      return "bar";
    case "chart-pie":
      return "pie";
    default:
      return "bar";
  }
}
