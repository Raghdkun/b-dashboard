import { z } from "zod";
import { DashboardLayout, dashboardLayoutSchema } from "./layout.types";
import { UserRole, userRoleSchema } from "./widget.types";

/**
 * Saved dashboard view/preset
 */
export interface DashboardView {
  /** Unique ID (UUID) */
  id: string;
  /** User-defined name */
  name: string;
  /** Optional description */
  description?: string;
  /** Saved layout configuration */
  layout: DashboardLayout;
  /** Whether this is user's default view */
  isDefault: boolean;
  /** Whether this is a system role default (admin only) */
  isRoleDefault: boolean;
  /** Which role this is default for (if isRoleDefault) */
  roleId?: UserRole;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  updatedAt: string;
}

// Zod schema
export const dashboardViewSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  layout: dashboardLayoutSchema,
  isDefault: z.boolean(),
  isRoleDefault: z.boolean(),
  roleId: userRoleSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DashboardViewInput = z.infer<typeof dashboardViewSchema>;

/**
 * Create a new view from current layout
 */
export function createView(
  name: string,
  layout: DashboardLayout,
  options?: {
    description?: string;
    isDefault?: boolean;
  }
): DashboardView {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    description: options?.description,
    layout: JSON.parse(JSON.stringify(layout)), // Deep clone
    isDefault: options?.isDefault ?? false,
    isRoleDefault: false,
    createdAt: now,
    updatedAt: now,
  };
}
