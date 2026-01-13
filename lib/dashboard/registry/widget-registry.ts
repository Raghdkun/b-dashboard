import type { WidgetDefinition, WidgetRegistry } from "../types";

/**
 * Default widget definitions - system-provided widgets
 */
const defaultWidgets: WidgetDefinition[] = [
  // Stats widgets
  {
    id: "total-revenue",
    type: "stats",
    titleKey: "dashboard.widgets.totalRevenue.title",
    descriptionKey: "dashboard.widgets.totalRevenue.description",
    icon: "DollarSign",
    allowedRoles: ["admin", "manager", "analyst"],
    sizeConfig: {
      minWidth: 1,
      maxWidth: 2,
      defaultWidth: 1,
      minHeight: 120,
    },
    defaultConfig: {
      compareMode: "previousPeriod",
      showTrend: true,
    },
  },
  {
    id: "total-users",
    type: "stats",
    titleKey: "dashboard.widgets.totalUsers.title",
    descriptionKey: "dashboard.widgets.totalUsers.description",
    icon: "Users",
    allowedRoles: ["admin", "manager"],
    sizeConfig: {
      minWidth: 1,
      maxWidth: 2,
      defaultWidth: 1,
      minHeight: 120,
    },
    defaultConfig: {
      compareMode: "previousPeriod",
      showTrend: true,
    },
  },
  {
    id: "active-sessions",
    type: "stats",
    titleKey: "dashboard.widgets.activeSessions.title",
    descriptionKey: "dashboard.widgets.activeSessions.description",
    icon: "Activity",
    allowedRoles: ["admin", "manager", "analyst"],
    sizeConfig: {
      minWidth: 1,
      maxWidth: 2,
      defaultWidth: 1,
      minHeight: 120,
    },
    defaultConfig: {
      showTrend: true,
    },
  },
  {
    id: "conversion-rate",
    type: "stats",
    titleKey: "dashboard.widgets.conversionRate.title",
    descriptionKey: "dashboard.widgets.conversionRate.description",
    icon: "TrendingUp",
    allowedRoles: ["admin", "manager", "analyst"],
    sizeConfig: {
      minWidth: 1,
      maxWidth: 2,
      defaultWidth: 1,
      minHeight: 120,
    },
    defaultConfig: {
      showTrend: true,
      format: "percentage",
    },
  },

  // Chart widgets
  {
    id: "revenue-chart",
    type: "chart-line",
    titleKey: "dashboard.widgets.revenueChart.title",
    descriptionKey: "dashboard.widgets.revenueChart.description",
    icon: "LineChart",
    allowedRoles: ["admin", "manager", "analyst"],
    sizeConfig: {
      minWidth: 2,
      maxWidth: 4,
      defaultWidth: 2,
      minHeight: 300,
    },
    defaultConfig: {
      dateRange: "30d",
      showLegend: true,
      smoothLine: true,
    },
  },
  {
    id: "sales-by-category",
    type: "chart-bar",
    titleKey: "dashboard.widgets.salesByCategory.title",
    descriptionKey: "dashboard.widgets.salesByCategory.description",
    icon: "BarChart3",
    allowedRoles: ["admin", "manager", "analyst"],
    sizeConfig: {
      minWidth: 2,
      maxWidth: 4,
      defaultWidth: 2,
      minHeight: 300,
    },
    defaultConfig: {
      dateRange: "30d",
      showLegend: true,
      orientation: "vertical",
    },
  },
  {
    id: "traffic-sources",
    type: "chart-pie",
    titleKey: "dashboard.widgets.trafficSources.title",
    descriptionKey: "dashboard.widgets.trafficSources.description",
    icon: "PieChart",
    allowedRoles: ["admin", "manager", "analyst"],
    sizeConfig: {
      minWidth: 2,
      maxWidth: 3,
      defaultWidth: 2,
      minHeight: 300,
    },
    defaultConfig: {
      showLabels: true,
      showLegend: true,
    },
  },

  // Table widget
  {
    id: "recent-orders",
    type: "table",
    titleKey: "dashboard.widgets.recentOrders.title",
    descriptionKey: "dashboard.widgets.recentOrders.description",
    icon: "Table",
    allowedRoles: ["admin", "manager", "analyst", "viewer"],
    sizeConfig: {
      minWidth: 2,
      maxWidth: 4,
      defaultWidth: 3,
      minHeight: 350,
    },
    defaultConfig: {
      limit: 10,
      showStatus: true,
      sortBy: "date",
      sortOrder: "desc",
    },
  },

  // List widget
  {
    id: "top-products",
    type: "list",
    titleKey: "dashboard.widgets.topProducts.title",
    descriptionKey: "dashboard.widgets.topProducts.description",
    icon: "List",
    allowedRoles: ["admin", "manager", "analyst"],
    sizeConfig: {
      minWidth: 1,
      maxWidth: 2,
      defaultWidth: 1,
      minHeight: 300,
    },
    defaultConfig: {
      limit: 5,
      showThumbnail: true,
      metric: "revenue",
    },
  },

  // Activity feed
  {
    id: "activity-feed",
    type: "activity-feed",
    titleKey: "dashboard.widgets.activityFeed.title",
    descriptionKey: "dashboard.widgets.activityFeed.description",
    icon: "Activity",
    allowedRoles: ["admin", "manager"],
    sizeConfig: {
      minWidth: 1,
      maxWidth: 2,
      defaultWidth: 1,
      minHeight: 300,
    },
    defaultConfig: {
      limit: 10,
      filterTypes: ["all"],
    },
  },

  // Quick actions
  {
    id: "quick-actions",
    type: "quick-actions",
    titleKey: "dashboard.widgets.quickActions.title",
    descriptionKey: "dashboard.widgets.quickActions.description",
    icon: "Zap",
    allowedRoles: ["admin", "manager"],
    sizeConfig: {
      minWidth: 1,
      maxWidth: 2,
      defaultWidth: 1,
      minHeight: 200,
    },
    defaultConfig: {
      actions: ["newOrder", "addUser", "generateReport", "settings"],
    },
  },
];

/**
 * Widget registry instance
 */
let widgetRegistry: WidgetRegistry | null = null;

/**
 * Get the widget registry (singleton)
 */
export function getWidgetRegistry(): WidgetRegistry {
  if (!widgetRegistry) {
    widgetRegistry = {};
    for (const widget of defaultWidgets) {
      widgetRegistry[widget.id] = widget;
    }
  }
  return widgetRegistry;
}

/**
 * Get a specific widget definition by ID
 */
export function getWidgetDefinition(id: string): WidgetDefinition | undefined {
  return getWidgetRegistry()[id];
}

/**
 * Get all widgets available to a specific role
 */
export function getWidgetsForRole(role: string): WidgetDefinition[] {
  const registry = getWidgetRegistry();
  return Object.values(registry).filter((w) =>
    w.allowedRoles.includes(role as WidgetDefinition["allowedRoles"][number])
  );
}

/**
 * Get all widget IDs
 */
export function getAllWidgetIds(): string[] {
  return Object.keys(getWidgetRegistry());
}
