# ADR 0006: Dashboard Personalization System

## Status
Accepted

## Date
2026-01-13

## Context
Users need to customize their dashboard experience based on their role and workflow. Currently, the dashboard shows the same fixed layout for all users. We need a system that allows:
- Widget layout customization (position, visibility, order)
- Per-widget configuration (filters, time ranges, display modes)
- Saved views/presets for different workflows
- Role-based defaults with user override capability
- Consistent loading states with shimmer/skeleton patterns

## Decision

### Architecture Overview
We will implement a **client-first personalization system** with backend sync capability:

1. **Widget Registry** - System-defined widgets with metadata (type, default config, size constraints)
2. **User Dashboard Config** - User's layout, visible widgets, per-widget settings
3. **Dashboard Views** - Named presets users can save and switch between
4. **Skeleton System** - Reusable loading components mapped to widget types

### Storage Strategy
```
┌─────────────────────────────────────────────────────────┐
│                    Zustand Store                        │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  widgetRegistry │  │  userDashboardConfig        │  │
│  │  (static/memory)│  │  (persist + backend sync)   │  │
│  └─────────────────┘  └─────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  dashboardViews (persist + backend sync)        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Drag/Drop Library Selection
**Recommended: @dnd-kit/core**

| Library | Pros | Cons |
|---------|------|------|
| @dnd-kit/core | Tree-shakeable, accessible, React 18+, RTL support, touch support | Newer, smaller community |
| react-beautiful-dnd | Mature, well-documented | Deprecated, no React 18 support, larger bundle |
| react-grid-layout | Built-in grid system, resize support | Heavier, less flexible styling |

**Decision:** Use `@dnd-kit/core` with `@dnd-kit/sortable` for MVP (reorder only), evaluate `react-grid-layout` for v2 if resize is critical.

### Skeleton System Architecture
```
┌──────────────────────────────────────────────────────────┐
│                  Skeleton Primitives                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Skeleton │ │ Skeleton │ │ Skeleton │ │ Skeleton    │  │
│  │ Base     │ │ Text     │ │ Chart    │ │ Table       │  │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────┘  │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              Widget Skeleton Registry                     │
│  widgetType → SkeletonComponent mapping                  │
│  "stats" → StatsWidgetSkeleton                           │
│  "chart" → ChartWidgetSkeleton                           │
│  "table" → TableWidgetSkeleton                           │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              Page Skeleton Templates                      │
│  DashboardPageSkeleton, UsersPageSkeleton, etc.          │
└──────────────────────────────────────────────────────────┘
```

## Consequences

### Positive
- Users get personalized dashboard experience
- Role-based defaults reduce setup time
- Saved views support multiple workflows
- Consistent loading UX improves perceived performance
- Backend-ready architecture supports future sync
- RTL/i18n compatible from day one

### Negative
- Increased complexity in dashboard rendering
- Migration needed when widget schema changes
- More state to manage and persist

### Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Layout schema breaking changes | Version field + migration functions |
| Performance with many widgets | Virtualization, lazy loading, memoization |
| Config injection attacks | Zod validation on all user configs |
| CLS during loading | Fixed skeleton heights matching widget heights |

## Related ADRs
- ADR 0001: State Management (Zustand)
- ADR 0002: API Layer (Axios services)
- ADR 0005: Theme System v2 (CSS variables used by skeletons)
