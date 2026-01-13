import { z } from "zod";

/**
 * Supported widget types - determines which skeleton and component to use
 */
export type WidgetType =
  | "stats"
  | "chart-line"
  | "chart-bar"
  | "chart-pie"
  | "table"
  | "list"
  | "calendar"
  | "activity-feed"
  | "quick-actions";

/**
 * Widget size configuration for grid layout
 */
export interface WidgetSizeConfig {
  /** Minimum columns span (1-4 in a 12-col grid = 3-12 actual columns) */
  minWidth: 1 | 2 | 3 | 4;
  /** Maximum columns span */
  maxWidth: 1 | 2 | 3 | 4;
  /** Default columns span */
  defaultWidth: 1 | 2 | 3 | 4;
  /** Minimum height in pixels - used for skeleton stability */
  minHeight: number;
}

/**
 * User roles for permission filtering
 */
export type UserRole = "admin" | "manager" | "analyst" | "viewer";

export const userRoleSchema = z.enum(["admin", "manager", "analyst", "viewer"]);

/**
 * System widget definition - registered at app level
 * These are the available widgets users can add to their dashboard
 */
export interface WidgetDefinition {
  /** Unique stable ID: "revenue-chart", "recent-orders" */
  id: string;
  /** Widget type - determines skeleton and renderer */
  type: WidgetType;
  /** i18n key for title: "dashboard.widgets.revenueChart.title" */
  titleKey: string;
  /** i18n key for description (used in add widget panel) */
  descriptionKey: string;
  /** Lucide icon name */
  icon: string;
  /** Which roles can see this widget */
  allowedRoles: UserRole[];
  /** Size constraints */
  sizeConfig: WidgetSizeConfig;
  /** Default widget-specific configuration */
  defaultConfig: Record<string, unknown>;
  /** Optional Zod schema for validating user config */
  configSchema?: z.ZodSchema;
}

/**
 * Widget registry - all available system widgets
 */
export type WidgetRegistry = Record<string, WidgetDefinition>;

// Zod schemas for validation
export const widgetTypeSchema = z.enum([
  "stats",
  "chart-line",
  "chart-bar",
  "chart-pie",
  "table",
  "list",
  "calendar",
  "activity-feed",
  "quick-actions",
]);

export const widgetSizeConfigSchema = z.object({
  minWidth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  maxWidth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  defaultWidth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  minHeight: z.number().positive(),
});

export const widgetDefinitionSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/i, "Widget ID must be alphanumeric with hyphens"),
  type: widgetTypeSchema,
  titleKey: z.string().min(1),
  descriptionKey: z.string().min(1),
  icon: z.string().min(1),
  allowedRoles: z.array(userRoleSchema).min(1),
  sizeConfig: widgetSizeConfigSchema,
  defaultConfig: z.record(z.string(), z.unknown()),
});
