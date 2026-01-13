import { useMemo } from "react";
import { useDashboardStore } from "./dashboard.store";
import type { WidgetRegistry, UserRole } from "../types";

/**
 * Get visible widgets only
 */
export const useVisibleWidgets = () =>
  useDashboardStore((s) => s.currentLayout.widgets.filter((w) => w.visible));

/**
 * Get widget by instance ID
 */
export const useWidget = (instanceId: string) =>
  useDashboardStore((s) =>
    s.currentLayout.widgets.find((w) => w.instanceId === instanceId)
  );

/**
 * Get sorted widgets by position (for rendering)
 */
export const useSortedWidgets = () => {
  const widgets = useDashboardStore((s) => s.currentLayout.widgets);
  return useMemo(
    () =>
      [...widgets]
        .filter((w) => w.visible)
        .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x),
    [widgets]
  );
};

/**
 * Check if layout has unsaved changes
 */
export const useHasUnsavedChanges = () => useDashboardStore((s) => s.isDirty);

/**
 * Check if in edit mode
 */
export const useIsEditMode = () => useDashboardStore((s) => s.isEditMode);

/**
 * Get available widgets (not already in layout) filtered by role
 */
export const useAvailableWidgets = (registry: WidgetRegistry, userRole: UserRole) => {
  const widgets = useDashboardStore((s) => s.currentLayout.widgets);
  return useMemo(() => {
    const usedIds = new Set(widgets.map((w) => w.widgetId));
    return Object.values(registry).filter(
      (def) => !usedIds.has(def.id) && def.allowedRoles.includes(userRole)
    );
  }, [widgets, registry, userRole]);
};

/**
 * Get all saved views
 */
export const useViews = () => useDashboardStore((s) => s.views);

/**
 * Get active view
 */
export const useActiveView = () => {
  const views = useDashboardStore((s) => s.views);
  const activeViewId = useDashboardStore((s) => s.activeViewId);
  return useMemo(
    () => views.find((v) => v.id === activeViewId),
    [views, activeViewId]
  );
};

/**
 * Get default view
 */
export const useDefaultView = () => {
  const views = useDashboardStore((s) => s.views);
  return useMemo(() => views.find((v) => v.isDefault), [views]);
};

/**
 * Get widget count
 */
export const useWidgetCount = () =>
  useDashboardStore((s) => s.currentLayout.widgets.filter((w) => w.visible).length);

/**
 * Get layout grid config
 */
export const useGridConfig = () =>
  useDashboardStore((s) => ({
    columns: s.currentLayout.gridColumns,
    rowHeight: s.currentLayout.rowHeight,
    gap: s.currentLayout.gap,
  }));
