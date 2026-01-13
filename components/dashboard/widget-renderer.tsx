"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import type { UserWidgetInstance } from "@/lib/dashboard";
import { getWidgetDefinition } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StatsWidgetSkeleton,
  ChartWidgetSkeleton,
  TableWidgetSkeleton,
  ListWidgetSkeleton,
  ActivityWidgetSkeleton,
  ActionsWidgetSkeleton,
  GenericWidgetSkeleton,
} from "./skeletons";
import {
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  LineChart,
  BarChart3,
  PieChart,
  Table,
  List,
  Zap,
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  LineChart,
  BarChart3,
  PieChart,
  Table,
  List,
  Zap,
};

interface WidgetRendererProps {
  widget: UserWidgetInstance;
}

/**
 * Renders a widget based on its type
 * For now, renders placeholder content - actual widget components will be added later
 */
export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const t = useTranslations("dashboard.widgets");
  const tDashboard = useTranslations("dashboard");
  const tPlaceholders = useTranslations("dashboard.placeholders");
  const definition = getWidgetDefinition(widget.widgetId);

  if (!definition) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          {tDashboard("widgetNotFound")}
        </CardContent>
      </Card>
    );
  }

  const Icon = iconMap[definition.icon] || Activity;
  
  // Get skeleton based on widget type
  const getSkeleton = () => {
    switch (definition.type) {
      case "stats":
        return <StatsWidgetSkeleton />;
      case "chart-line":
        return <ChartWidgetSkeleton type="line" />;
      case "chart-bar":
        return <ChartWidgetSkeleton type="bar" />;
      case "chart-pie":
        return <ChartWidgetSkeleton type="pie" />;
      case "table":
        return <TableWidgetSkeleton />;
      case "list":
        return <ListWidgetSkeleton />;
      case "activity-feed":
        return <ActivityWidgetSkeleton />;
      case "quick-actions":
        return <ActionsWidgetSkeleton />;
      default:
        return <GenericWidgetSkeleton />;
    }
  };

  // Get the title from i18n
  const titleParts = definition.titleKey.split(".");
  const widgetKey = titleParts[titleParts.length - 2]; // e.g., "totalRevenue"
  const title = t(`${widgetKey}.title`);

  // Render actual widget content based on type
  // For MVP, we render placeholder/demo content
  return (
    <Suspense fallback={getSkeleton()}>
      {definition.type === "stats" ? (
        <StatsWidget widget={widget} title={title} Icon={Icon} />
      ) : definition.type === "chart-line" || definition.type === "chart-bar" ? (
        <ChartWidget widget={widget} title={title} type={definition.type} placeholder={tPlaceholders(definition.type === "chart-line" ? "lineChart" : "barChart")} />
      ) : definition.type === "chart-pie" ? (
        <PieChartWidget widget={widget} title={title} placeholder={tPlaceholders("pieChart")} />
      ) : definition.type === "table" ? (
        <TableWidget widget={widget} title={title} placeholder={tPlaceholders("table")} />
      ) : definition.type === "list" ? (
        <ListWidget widget={widget} title={title} placeholder={tPlaceholders("list")} />
      ) : definition.type === "activity-feed" ? (
        <ActivityWidget widget={widget} title={title} placeholder={tPlaceholders("feed")} />
      ) : definition.type === "quick-actions" ? (
        <QuickActionsWidget widget={widget} title={title} placeholder={tPlaceholders("quickActions")} />
      ) : (
        <GenericWidget widget={widget} title={title} placeholder={tPlaceholders("widgetContent")} />
      )}
    </Suspense>
  );
}

// Placeholder widget components - will be replaced with real implementations

function StatsWidget({
  widget,
  title,
  Icon,
}: {
  widget: UserWidgetInstance;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  // Demo data based on widget ID
  const demoData: Record<string, { value: string; change: string; trend: "up" | "down" }> = {
    "total-revenue": { value: "$45,231.89", change: "+20.1%", trend: "up" },
    "total-users": { value: "2,350", change: "+180", trend: "up" },
    "active-sessions": { value: "573", change: "+201", trend: "up" },
    "conversion-rate": { value: "12.5%", change: "+2.4%", trend: "up" },
  };

  const data = demoData[widget.widgetId] || { value: "—", change: "0%", trend: "up" as const };

  return (
    <Card className="h-full min-h-30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.value}</div>
        <p className="text-xs text-muted-foreground">
          <span className={data.trend === "up" ? "text-green-600" : "text-red-600"}>
            {data.change}
          </span>{" "}
          from last month
        </p>
      </CardContent>
    </Card>
  );
}

function ChartWidget({
  widget: _widget,
  title,
  type,
  placeholder,
}: {
  widget: UserWidgetInstance;
  title: string;
  type: "chart-line" | "chart-bar";
  placeholder: string;
}) {
  return (
    <Card className="h-full min-h-75">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-55">
        <div className="text-muted-foreground text-sm">
          {placeholder}
        </div>
      </CardContent>
    </Card>
  );
}

function PieChartWidget({ widget: _widget, title, placeholder }: { widget: UserWidgetInstance; title: string; placeholder: string }) {
  return (
    <Card className="h-full min-h-75">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-55">
        <div className="text-muted-foreground text-sm">{placeholder}</div>
      </CardContent>
    </Card>
  );
}

function TableWidget({ widget: _widget, title, placeholder }: { widget: UserWidgetInstance; title: string; placeholder: string }) {
  return (
    <Card className="h-full min-h-87.5">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground text-sm">{placeholder}</div>
      </CardContent>
    </Card>
  );
}

function ListWidget({ widget: _widget, title, placeholder }: { widget: UserWidgetInstance; title: string; placeholder: string }) {
  return (
    <Card className="h-full min-h-75">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground text-sm">{placeholder}</div>
      </CardContent>
    </Card>
  );
}

function ActivityWidget({ widget: _widget, title, placeholder }: { widget: UserWidgetInstance; title: string; placeholder: string }) {
  return (
    <Card className="h-full min-h-75">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground text-sm">{placeholder}</div>
      </CardContent>
    </Card>
  );
}

function QuickActionsWidget({ widget: _widget, title, placeholder }: { widget: UserWidgetInstance; title: string; placeholder: string }) {
  return (
    <Card className="h-full min-h-50">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground text-sm">{placeholder}</div>
      </CardContent>
    </Card>
  );
}

function GenericWidget({ widget: _widget, title, placeholder }: { widget: UserWidgetInstance; title: string; placeholder: string }) {
  return (
    <Card className="h-full min-h-50">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground text-sm">{placeholder}</div>
      </CardContent>
    </Card>
  );
}
