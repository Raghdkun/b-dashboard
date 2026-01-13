// Widget types
export type {
  WidgetType,
  WidgetSizeConfig,
  UserRole,
  WidgetDefinition,
  WidgetRegistry,
} from "./widget.types";

export {
  widgetTypeSchema,
  widgetSizeConfigSchema,
  widgetDefinitionSchema,
  userRoleSchema,
} from "./widget.types";

// User widget instance types
export type {
  WidgetPosition,
  UserWidgetInstance,
  UserWidgetInstanceInput,
} from "./user-widget.types";

export {
  widgetPositionSchema,
  userWidgetInstanceSchema,
} from "./user-widget.types";

// Layout types
export type {
  DashboardLayout,
  DashboardLayoutInput,
} from "./layout.types";

export {
  LAYOUT_SCHEMA_VERSION,
  dashboardLayoutSchema,
  createDefaultLayout,
} from "./layout.types";

// View types
export type {
  DashboardView,
  DashboardViewInput,
} from "./view.types";

export {
  dashboardViewSchema,
  createView,
} from "./view.types";

// Config types
export type {
  UserDashboardConfig,
  UserDashboardConfigInput,
} from "./config.types";

export {
  userDashboardConfigSchema,
} from "./config.types";
