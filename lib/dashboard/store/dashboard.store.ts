import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** SSR-safe no-op storage — avoids Node.js `--localstorage-file` warning */
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
import { immer } from "zustand/middleware/immer";
import type {
  DashboardLayout,
  DashboardView,
  UserWidgetInstance,
  WidgetPosition,
} from "../types";
import { createDefaultLayout, LAYOUT_SCHEMA_VERSION, createView } from "../types";
import { getWidgetDefinition } from "../registry";

// Storage key
const STORAGE_KEY = "b-dashboard:dashboard-config";

/**
 * Dashboard store state
 */
interface DashboardState {
  // Layout data
  currentLayout: DashboardLayout;
  views: DashboardView[];
  activeViewId: string | null;

  // UI State
  isEditMode: boolean;
  isDirty: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;

  // Drag state (not persisted)
  draggedWidgetId: string | null;
  
  // Backup for cancel
  layoutBackup: DashboardLayout | null;
}

/**
 * Dashboard store actions
 */
interface DashboardActions {
  // Layout Actions
  setLayout: (layout: DashboardLayout) => void;
  moveWidget: (instanceId: string, newPosition: Partial<WidgetPosition>) => void;
  reorderWidgets: (activeId: string, overId: string) => void;
  addWidget: (widgetId: string, position?: Partial<WidgetPosition>) => void;
  removeWidget: (instanceId: string) => void;
  updateWidgetConfig: (instanceId: string, config: Record<string, unknown>) => void;
  toggleWidgetVisibility: (instanceId: string) => void;

  // View Actions
  saveCurrentAsView: (name: string, description?: string) => DashboardView;
  loadView: (viewId: string) => void;
  updateView: (viewId: string, updates: Partial<Omit<DashboardView, "id">>) => void;
  deleteView: (viewId: string) => void;
  setDefaultView: (viewId: string) => void;

  // Edit Mode
  enterEditMode: () => void;
  exitEditMode: (save?: boolean) => void;
  
  // Reset
  resetLayout: () => void;
  resetWidget: (instanceId: string) => void;

  // Drag
  setDraggedWidget: (instanceId: string | null) => void;

  // Sync
  markDirty: () => void;
  markClean: () => void;
}

type DashboardStore = DashboardState & DashboardActions;

/**
 * Get next available Y position for new widget
 */
function getNextRowY(widgets: UserWidgetInstance[]): number {
  if (widgets.length === 0) return 0;
  const maxY = Math.max(...widgets.map((w) => w.position.y + w.position.height));
  return maxY;
}

/**
 * Create initial layout with default widgets
 */
function createInitialLayout(): DashboardLayout {
  const layout = createDefaultLayout();
  
  // Add default widgets for initial experience
  const defaultWidgets = [
    { widgetId: "total-revenue", x: 0, y: 0, width: 3, height: 2 },
    { widgetId: "total-users", x: 3, y: 0, width: 3, height: 2 },
    { widgetId: "active-sessions", x: 6, y: 0, width: 3, height: 2 },
    { widgetId: "conversion-rate", x: 9, y: 0, width: 3, height: 2 },
    { widgetId: "revenue-chart", x: 0, y: 2, width: 6, height: 4 },
    { widgetId: "sales-by-category", x: 6, y: 2, width: 6, height: 4 },
    { widgetId: "recent-orders", x: 0, y: 6, width: 8, height: 4 },
    { widgetId: "top-products", x: 8, y: 6, width: 4, height: 4 },
  ];

  for (const w of defaultWidgets) {
    const def = getWidgetDefinition(w.widgetId);
    if (def) {
      layout.widgets.push({
        instanceId: crypto.randomUUID(),
        widgetId: w.widgetId,
        position: { x: w.x, y: w.y, width: w.width, height: w.height },
        visible: true,
        config: { ...def.defaultConfig },
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  return layout;
}

/**
 * Dashboard Zustand store
 */
export const useDashboardStore = create<DashboardStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      currentLayout: createInitialLayout(),
      views: [],
      activeViewId: null,
      isEditMode: false,
      isDirty: false,
      isSyncing: false,
      lastSyncedAt: null,
      draggedWidgetId: null,
      layoutBackup: null,

      // Layout Actions
      setLayout: (layout) => {
        set((state) => {
          state.currentLayout = layout;
          state.isDirty = true;
        });
      },

      moveWidget: (instanceId, newPosition) => {
        set((state) => {
          const widget = state.currentLayout.widgets.find(
            (w: { instanceId: string; }) => w.instanceId === instanceId
          );
          if (widget) {
            widget.position = { ...widget.position, ...newPosition };
            widget.lastUpdated = new Date().toISOString();
            state.isDirty = true;
          }
        });
      },

      reorderWidgets: (activeId, overId) => {
        set((state) => {
          const widgets = state.currentLayout.widgets;
          const activeIndex = widgets.findIndex((w: { instanceId: string; }) => w.instanceId === activeId);
          const overIndex = widgets.findIndex((w: { instanceId: string; }) => w.instanceId === overId);

          if (activeIndex !== -1 && overIndex !== -1) {
            // Remove active item and insert at new position
            const [removed] = widgets.splice(activeIndex, 1);
            widgets.splice(overIndex, 0, removed);
            
            // Update Y positions based on new order
            let currentY = 0;
            for (const widget of widgets) {
              if (widget.visible) {
                widget.position.y = currentY;
                currentY += widget.position.height;
              }
            }
            
            state.isDirty = true;
          }
        });
      },

      addWidget: (widgetId, position) => {
        const definition = getWidgetDefinition(widgetId);
        if (!definition) return;

        set((state) => {
          const newWidget: UserWidgetInstance = {
            instanceId: crypto.randomUUID(),
            widgetId,
            position: {
              x: position?.x ?? 0,
              y: position?.y ?? getNextRowY(state.currentLayout.widgets),
              width: position?.width ?? definition.sizeConfig.defaultWidth * 3,
              height: position?.height ?? 2,
            },
            visible: true,
            config: { ...definition.defaultConfig },
            lastUpdated: new Date().toISOString(),
          };
          state.currentLayout.widgets.push(newWidget);
          state.isDirty = true;
        });
      },

      removeWidget: (instanceId) => {
        set((state) => {
          state.currentLayout.widgets = state.currentLayout.widgets.filter(
            (w: { instanceId: string; }) => w.instanceId !== instanceId
          );
          state.isDirty = true;
        });
      },

      updateWidgetConfig: (instanceId, config) => {
        set((state) => {
          const widget = state.currentLayout.widgets.find(
            (w: { instanceId: string; }) => w.instanceId === instanceId
          );
          if (widget) {
            widget.config = { ...widget.config, ...config };
            widget.lastUpdated = new Date().toISOString();
            state.isDirty = true;
          }
        });
      },

      toggleWidgetVisibility: (instanceId) => {
        set((state) => {
          const widget = state.currentLayout.widgets.find(
            (w: { instanceId: string; }) => w.instanceId === instanceId
          );
          if (widget) {
            widget.visible = !widget.visible;
            widget.lastUpdated = new Date().toISOString();
            state.isDirty = true;
          }
        });
      },

      // View Actions
      saveCurrentAsView: (name, description) => {
        const view = createView(name, get().currentLayout, { description });
        set((state) => {
          state.views.push(view);
          state.activeViewId = view.id;
          state.isDirty = false;
        });
        return view;
      },

      loadView: (viewId) => {
        set((state) => {
          const view = state.views.find((v: { id: string; }) => v.id === viewId);
          if (view) {
            state.currentLayout = JSON.parse(JSON.stringify(view.layout));
            state.activeViewId = viewId;
            state.isDirty = false;
          }
        });
      },

      updateView: (viewId, updates) => {
        set((state) => {
          const view = state.views.find((v: { id: string; }) => v.id === viewId);
          if (view) {
            Object.assign(view, updates);
            view.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteView: (viewId) => {
        set((state) => {
          state.views = state.views.filter((v: { id: string; }) => v.id !== viewId);
          if (state.activeViewId === viewId) {
            state.activeViewId = null;
          }
        });
      },

      setDefaultView: (viewId) => {
        set((state) => {
          for (const view of state.views) {
            view.isDefault = view.id === viewId;
          }
        });
      },

      // Edit Mode
      enterEditMode: () => {
        set((state) => {
          state.isEditMode = true;
          state.layoutBackup = JSON.parse(JSON.stringify(state.currentLayout));
        });
      },

      exitEditMode: (save = true) => {
        set((state) => {
          if (!save && state.layoutBackup) {
            state.currentLayout = state.layoutBackup;
            state.isDirty = false;
          }
          state.isEditMode = false;
          state.layoutBackup = null;
        });
      },

      // Reset
      resetLayout: () => {
        set((state) => {
          state.currentLayout = createInitialLayout();
          state.isDirty = true;
        });
      },

      resetWidget: (instanceId) => {
        set((state) => {
          const widget = state.currentLayout.widgets.find(
            (w: { instanceId: string; }) => w.instanceId === instanceId
          );
          if (widget) {
            const def = getWidgetDefinition(widget.widgetId);
            if (def) {
              widget.config = { ...def.defaultConfig };
              widget.lastUpdated = new Date().toISOString();
              state.isDirty = true;
            }
          }
        });
      },

      // Drag
      setDraggedWidget: (instanceId) => {
        set((state) => {
          state.draggedWidgetId = instanceId;
        });
      },

      // Sync helpers
      markDirty: () => {
        set((state) => {
          state.isDirty = true;
        });
      },

      markClean: () => {
        set((state) => {
          state.isDirty = false;
          state.lastSyncedAt = new Date().toISOString();
        });
      },
    })),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
      partialize: (state) => ({
        currentLayout: state.currentLayout,
        views: state.views,
        activeViewId: state.activeViewId,
        lastSyncedAt: state.lastSyncedAt,
      }),
      version: LAYOUT_SCHEMA_VERSION,
    }
  )
);
