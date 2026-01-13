# Dashboard Personalization - Data Model & Storage

## A. TypeScript Interfaces

### Widget Definition (System-defined)
```typescript
// lib/dashboard/types/widget.types.ts

import { z } from "zod";

/** Supported widget types */
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

/** Widget size constraints */
export interface WidgetSizeConfig {
  minWidth: 1 | 2 | 3 | 4;  // Grid columns (12-col grid)
  maxWidth: 1 | 2 | 3 | 4;
  defaultWidth: 1 | 2 | 3 | 4;
  minHeight: number;  // px - for skeleton stability
}

/** User roles for permission filtering */
export type UserRole = "admin" | "manager" | "analyst" | "viewer";

/** System widget definition - registered at app level */
export interface WidgetDefinition {
  id: string;                          // Unique stable ID: "revenue-chart"
  type: WidgetType;                    // Determines skeleton + renderer
  titleKey: string;                    // i18n key: "dashboard.widgets.revenueChart.title"
  descriptionKey: string;              // i18n key for tooltip/add panel
  icon: string;                        // Lucide icon name
  allowedRoles: UserRole[];            // Who can see this widget
  sizeConfig: WidgetSizeConfig;
  defaultConfig: Record<string, unknown>;  // Widget-specific defaults
  configSchema?: z.ZodSchema;          // Zod schema for validating user config
  component: string;                   // Component path for dynamic import
  skeletonComponent: string;           // Skeleton component path
}

/** Widget registry - all available widgets */
export type WidgetRegistry = Record<string, WidgetDefinition>;
```

### User Widget Instance (User-configured)
```typescript
// lib/dashboard/types/user-widget.types.ts

import { z } from "zod";

/** Position in grid layout */
export interface WidgetPosition {
  x: number;      // Column (0-11 in 12-col grid)
  y: number;      // Row
  width: number;  // Columns span
  height: number; // Rows span
}

/** User's instance of a widget with custom config */
export interface UserWidgetInstance {
  instanceId: string;           // UUID - unique per user instance
  widgetId: string;             // References WidgetDefinition.id
  position: WidgetPosition;
  visible: boolean;
  config: Record<string, unknown>;  // User's custom settings
  lastUpdated: string;          // ISO timestamp
}

/** Zod schema for validation */
export const userWidgetInstanceSchema = z.object({
  instanceId: z.string().uuid(),
  widgetId: z.string().min(1),
  position: z.object({
    x: z.number().min(0).max(11),
    y: z.number().min(0),
    width: z.number().min(1).max(12),
    height: z.number().min(1),
  }),
  visible: z.boolean(),
  config: z.record(z.unknown()),
  lastUpdated: z.string().datetime(),
});
```

### Dashboard Layout
```typescript
// lib/dashboard/types/layout.types.ts

import { z } from "zod";
import { UserWidgetInstance, userWidgetInstanceSchema } from "./user-widget.types";

/** Complete dashboard layout for a user */
export interface DashboardLayout {
  version: number;                    // Schema version for migrations
  widgets: UserWidgetInstance[];      // All widget instances
  gridColumns: 12;                    // Fixed 12-column grid
  rowHeight: number;                  // px per row unit
  gap: number;                        // px gap between widgets
}

/** Zod schema */
export const dashboardLayoutSchema = z.object({
  version: z.number().int().positive(),
  widgets: z.array(userWidgetInstanceSchema),
  gridColumns: z.literal(12),
  rowHeight: z.number().positive(),
  gap: z.number().min(0),
});

/** Current schema version */
export const LAYOUT_SCHEMA_VERSION = 1;
```

### Dashboard View (Saved Preset)
```typescript
// lib/dashboard/types/view.types.ts

import { z } from "zod";
import { DashboardLayout, dashboardLayoutSchema } from "./layout.types";

/** Saved dashboard view/preset */
export interface DashboardView {
  id: string;                 // UUID
  name: string;               // User-defined name
  description?: string;
  layout: DashboardLayout;
  isDefault: boolean;         // User's default view
  isRoleDefault: boolean;     // System role default (admin only)
  roleId?: UserRole;          // Which role this is default for
  createdAt: string;          // ISO timestamp
  updatedAt: string;
}

/** Zod schema */
export const dashboardViewSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  layout: dashboardLayoutSchema,
  isDefault: z.boolean(),
  isRoleDefault: z.boolean(),
  roleId: z.enum(["admin", "manager", "analyst", "viewer"]).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

### Complete User Dashboard Config
```typescript
// lib/dashboard/types/config.types.ts

import { z } from "zod";
import { DashboardLayout, dashboardLayoutSchema } from "./layout.types";
import { DashboardView, dashboardViewSchema } from "./view.types";

/** Complete user dashboard configuration */
export interface UserDashboardConfig {
  userId: string;
  activeViewId: string | null;     // Currently active view (null = default)
  currentLayout: DashboardLayout;  // Working layout (may differ from saved view)
  views: DashboardView[];          // User's saved views
  lastSyncedAt: string | null;     // Backend sync timestamp
  isDirty: boolean;                // Has unsaved changes
}

/** Zod schema for API validation */
export const userDashboardConfigSchema = z.object({
  userId: z.string(),
  activeViewId: z.string().uuid().nullable(),
  currentLayout: dashboardLayoutSchema,
  views: z.array(dashboardViewSchema),
  lastSyncedAt: z.string().datetime().nullable(),
  isDirty: z.boolean(),
});
```

---

## B. Storage Strategy

### What Lives Where

| Data | Zustand (Memory) | Zustand Persist (localStorage) | Backend API |
|------|------------------|-------------------------------|-------------|
| Widget Registry | ✅ | ❌ | ❌ (static) |
| Current Layout | ✅ | ✅ | ✅ (sync) |
| Saved Views | ✅ | ✅ | ✅ (sync) |
| Active View ID | ✅ | ✅ | ✅ (sync) |
| Edit Mode State | ✅ | ❌ | ❌ |
| Drag State | ✅ | ❌ | ❌ |
| Role Defaults | ✅ (loaded) | ❌ | ✅ (source) |

### Sync Strategy
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  User Edit  │────▶│   Zustand   │────▶│ localStorage│
└─────────────┘     │   Store     │     │  (instant)  │
                    └──────┬──────┘     └─────────────┘
                           │
                           │ debounced (2s)
                           ▼
                    ┌─────────────┐
                    │  Backend    │
                    │  API Sync   │
                    └─────────────┘
```

1. **Immediate**: Changes saved to Zustand + localStorage instantly
2. **Debounced**: Backend sync after 2s of inactivity
3. **On Focus**: Sync on window focus if stale (> 5 min)
4. **Manual**: "Sync Now" button for immediate backend save

### localStorage Keys
```typescript
const STORAGE_KEYS = {
  dashboardConfig: "b-dashboard:dashboard-config",
  dashboardViews: "b-dashboard:dashboard-views",
} as const;
```

---

## C. Versioning & Migration

### Schema Version History
| Version | Changes | Migration |
|---------|---------|-----------|
| 1 | Initial schema | N/A |
| 2 (future) | Add widget resize | Add default height to existing widgets |

### Migration System
```typescript
// lib/dashboard/migrations/index.ts

type MigrationFn = (layout: unknown) => DashboardLayout;

const migrations: Record<number, MigrationFn> = {
  // Version 1 -> 2 migration
  2: (layout: unknown) => {
    const v1 = layout as DashboardLayoutV1;
    return {
      ...v1,
      version: 2,
      widgets: v1.widgets.map(w => ({
        ...w,
        position: { ...w.position, height: w.position.height ?? 2 }
      }))
    };
  },
};

export function migrateLayout(layout: unknown): DashboardLayout {
  let current = layout as { version: number };
  
  while (current.version < LAYOUT_SCHEMA_VERSION) {
    const nextVersion = current.version + 1;
    const migrate = migrations[nextVersion];
    if (!migrate) {
      console.error(`Missing migration for version ${nextVersion}`);
      return createDefaultLayout(); // Fallback
    }
    current = migrate(current) as { version: number };
  }
  
  return current as DashboardLayout;
}
```

### Handling Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Widget removed from registry | Filter out from layout, log warning |
| New widget in registry | Not auto-added; available in "Add Widget" |
| Config validation fails | Reset widget config to defaults, keep position |
| Layout completely invalid | Reset to role default, show toast |
| Version too new (downgrade) | Show error, suggest update |

---

## D. Sample Data

### Widget Registry Example
```json
{
  "revenue-stats": {
    "id": "revenue-stats",
    "type": "stats",
    "titleKey": "dashboard.widgets.revenueStats.title",
    "descriptionKey": "dashboard.widgets.revenueStats.description",
    "icon": "DollarSign",
    "allowedRoles": ["admin", "manager", "analyst"],
    "sizeConfig": {
      "minWidth": 1,
      "maxWidth": 2,
      "defaultWidth": 1,
      "minHeight": 120
    },
    "defaultConfig": {
      "compareMode": "previousPeriod",
      "showTrend": true
    },
    "component": "widgets/stats/RevenueStatsWidget",
    "skeletonComponent": "widgets/skeletons/StatsWidgetSkeleton"
  }
}
```

### User Config Example (3 widgets, 2 views)
```json
{
  "userId": "user-123",
  "activeViewId": "view-abc",
  "currentLayout": {
    "version": 1,
    "gridColumns": 12,
    "rowHeight": 80,
    "gap": 16,
    "widgets": [
      {
        "instanceId": "inst-001",
        "widgetId": "revenue-stats",
        "position": { "x": 0, "y": 0, "width": 3, "height": 2 },
        "visible": true,
        "config": { "compareMode": "lastYear", "showTrend": true },
        "lastUpdated": "2026-01-13T10:00:00Z"
      },
      {
        "instanceId": "inst-002",
        "widgetId": "sales-chart",
        "position": { "x": 3, "y": 0, "width": 6, "height": 4 },
        "visible": true,
        "config": { "chartType": "line", "dateRange": "30d" },
        "lastUpdated": "2026-01-13T10:00:00Z"
      },
      {
        "instanceId": "inst-003",
        "widgetId": "recent-orders",
        "position": { "x": 9, "y": 0, "width": 3, "height": 4 },
        "visible": true,
        "config": { "limit": 10, "showStatus": true },
        "lastUpdated": "2026-01-13T10:00:00Z"
      }
    ]
  },
  "views": [
    {
      "id": "view-abc",
      "name": "Operations View",
      "description": "Daily operations monitoring",
      "layout": { "...same structure as currentLayout..." },
      "isDefault": true,
      "isRoleDefault": false,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-13T10:00:00Z"
    },
    {
      "id": "view-def",
      "name": "Finance View",
      "description": "Financial metrics focus",
      "layout": { "...different widget arrangement..." },
      "isDefault": false,
      "isRoleDefault": false,
      "createdAt": "2026-01-05T00:00:00Z",
      "updatedAt": "2026-01-10T14:30:00Z"
    }
  ],
  "lastSyncedAt": "2026-01-13T10:05:00Z",
  "isDirty": false
}
```
