import { z } from "zod";
import { DashboardLayout, dashboardLayoutSchema } from "./layout.types";
import { DashboardView, dashboardViewSchema } from "./view.types";

/**
 * Complete user dashboard configuration
 */
export interface UserDashboardConfig {
  /** User ID */
  userId: string;
  /** Currently active view ID (null = working on unsaved layout) */
  activeViewId: string | null;
  /** Working layout (may differ from saved view) */
  currentLayout: DashboardLayout;
  /** User's saved views */
  views: DashboardView[];
  /** Backend sync timestamp */
  lastSyncedAt: string | null;
  /** Has unsaved changes */
  isDirty: boolean;
}

// Zod schema for API validation
export const userDashboardConfigSchema = z.object({
  userId: z.string(),
  activeViewId: z.string().uuid().nullable(),
  currentLayout: dashboardLayoutSchema,
  views: z.array(dashboardViewSchema),
  lastSyncedAt: z.string().datetime().nullable(),
  isDirty: z.boolean(),
});

export type UserDashboardConfigInput = z.infer<typeof userDashboardConfigSchema>;
