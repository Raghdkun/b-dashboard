import { z } from "zod";
import { UserWidgetInstance, userWidgetInstanceSchema } from "./user-widget.types";

/** Current schema version - increment when making breaking changes */
export const LAYOUT_SCHEMA_VERSION = 1;

/**
 * Complete dashboard layout for a user
 */
export interface DashboardLayout {
  /** Schema version for migrations */
  version: number;
  /** All widget instances */
  widgets: UserWidgetInstance[];
  /** Grid column count (always 12) */
  gridColumns: 12;
  /** Pixels per row unit */
  rowHeight: number;
  /** Gap between widgets in pixels */
  gap: number;
}

// Zod schema
export const dashboardLayoutSchema = z.object({
  version: z.number().int().positive(),
  widgets: z.array(userWidgetInstanceSchema),
  gridColumns: z.literal(12),
  rowHeight: z.number().positive(),
  gap: z.number().min(0),
});

export type DashboardLayoutInput = z.infer<typeof dashboardLayoutSchema>;

/**
 * Create a default empty layout
 */
export function createDefaultLayout(): DashboardLayout {
  return {
    version: LAYOUT_SCHEMA_VERSION,
    widgets: [],
    gridColumns: 12,
    rowHeight: 80,
    gap: 16,
  };
}
