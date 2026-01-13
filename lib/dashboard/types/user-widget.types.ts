import { z } from "zod";

/**
 * Widget position in grid layout
 */
export interface WidgetPosition {
  /** Column position (0-11 in 12-col grid) */
  x: number;
  /** Row position */
  y: number;
  /** Columns span (1-12) */
  width: number;
  /** Rows span */
  height: number;
}

/**
 * User's instance of a widget with custom configuration
 */
export interface UserWidgetInstance {
  /** Unique ID for this instance (UUID) */
  instanceId: string;
  /** References WidgetDefinition.id */
  widgetId: string;
  /** Grid position and size */
  position: WidgetPosition;
  /** Whether widget is visible */
  visible: boolean;
  /** User's custom settings for this widget */
  config: Record<string, unknown>;
  /** ISO timestamp of last update */
  lastUpdated: string;
}

// Zod schemas
export const widgetPositionSchema = z.object({
  x: z.number().min(0).max(11),
  y: z.number().min(0),
  width: z.number().min(1).max(12),
  height: z.number().min(1),
});

export const userWidgetInstanceSchema = z.object({
  instanceId: z.string().uuid(),
  widgetId: z.string().min(1),
  position: widgetPositionSchema,
  visible: z.boolean(),
  config: z.record(z.string(), z.unknown()),
  lastUpdated: z.string().datetime(),
});

export type UserWidgetInstanceInput = z.infer<typeof userWidgetInstanceSchema>;
