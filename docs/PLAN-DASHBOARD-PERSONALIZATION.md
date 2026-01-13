# Dashboard Personalization - Planning Overview

## Executive Summary

This feature enables intelligent dashboard personalization where users can customize widget layouts, visibility, and settings while maintaining role-based defaults and consistent loading experiences through a shimmer/skeleton system.

**Documents:**
| Document | Purpose |
|----------|---------|
| [ADR/0006-dashboard-personalization.md](ADR/0006-dashboard-personalization.md) | Architecture decisions |
| [SPEC-DASHBOARD-PERSONALIZATION.md](SPEC-DASHBOARD-PERSONALIZATION.md) | Product specification |
| [MODEL-DASHBOARD-PERSONALIZATION.md](MODEL-DASHBOARD-PERSONALIZATION.md) | Data model & storage |
| [DESIGN-DASHBOARD-PERSONALIZATION.md](DESIGN-DASHBOARD-PERSONALIZATION.md) | Technical design |
| [TASKS-DASHBOARD-PERSONALIZATION.md](TASKS-DASHBOARD-PERSONALIZATION.md) | Implementation tasks |

---

## Core Features

### 1. Widget Layout Customization
- Drag-and-drop reordering (MVP)
- Add/remove widgets from dashboard
- Widget resize (v2)

### 2. Widget Configuration
- Per-widget settings (filters, date ranges, display modes)
- Validated via Zod schemas
- Reset individual widgets to defaults

### 3. Dashboard Views
- Save named presets ("Operations", "Finance")
- Quick switch between views
- One default view per user

### 4. Role-Based Defaults
- Admin, Manager, Analyst, Viewer defaults
- Applied to new users automatically
- User overrides never blocked

### 5. Shimmer/Skeleton Loading
- Consistent loading UX across all pages
- Widget-type-specific skeletons
- RTL and reduced motion support

---

## Architecture Decisions

### Storage: Client-First with Backend Sync
```
User Action → Zustand → localStorage (instant) → Backend API (debounced 2s)
```

### Drag/Drop: @dnd-kit/core
- Tree-shakeable, accessible, React 18+, RTL support
- Alternative considered: react-beautiful-dnd (deprecated)

### Skeleton System: Component Registry
- Primitives: `Skeleton`, `SkeletonText`, `SkeletonChart`, `SkeletonTable`
- Widget mapping: `WidgetType → SkeletonComponent`
- Page templates: `DashboardPageSkeleton`, `UsersPageSkeleton`

---

## Key Interfaces (Summary)

```typescript
interface WidgetDefinition {
  id: string;
  type: WidgetType;
  titleKey: string;              // i18n
  allowedRoles: UserRole[];
  sizeConfig: WidgetSizeConfig;
  defaultConfig: Record<string, unknown>;
}

interface UserWidgetInstance {
  instanceId: string;
  widgetId: string;
  position: WidgetPosition;
  visible: boolean;
  config: Record<string, unknown>;
}

interface DashboardView {
  id: string;
  name: string;
  layout: DashboardLayout;
  isDefault: boolean;
}
```

---

## Implementation Timeline

### Week 1-2: MVP
- [ ] Skeleton primitives and CSS variables
- [ ] Widget-type skeletons
- [ ] Page skeleton templates
- [ ] Data model types and Zod schemas
- [ ] Widget registry (5 initial widgets)
- [ ] Basic Zustand store with persistence
- [ ] Drag/drop reorder with @dnd-kit
- [ ] Edit mode UI

### Week 3-4: v1
- [ ] Widget add/remove panel
- [ ] Widget configuration UI
- [ ] Saved views CRUD
- [ ] Reset to role defaults
- [ ] Backend API integration
- [ ] Migration system
- [ ] Full i18n (en/ar)

### Week 5-6: v2 (Optional)
- [ ] Widget resize
- [ ] Undo/redo
- [ ] Admin role defaults management
- [ ] View sharing

---

## Critical Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Layout Stability (CLS) | < 0.1 | web-vitals |
| Skeleton → Content transition | < 500ms | Performance timing |
| Accessibility score | 100% | axe-core audit |
| RTL correctness | 100% | Manual QA |
| Offline resilience | Works | E2E test |

---

## Assumptions Made

1. **No real-time collaboration** - Single user edits their own dashboard
2. **12-column grid** - Standard responsive grid, no custom column counts
3. **No widget marketplace** - Widgets are system-defined, not user-uploaded
4. **localStorage sufficient** - Backend sync is enhancement, not requirement
5. **5 initial widgets** - stats, chart-line, chart-bar, table, list
6. **Debounced sync** - 2 second delay acceptable for UX

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Schema breaking changes | Version field + migration system |
| Performance degradation | Selective subscriptions, memoization, lazy loading |
| Config injection | Zod validation on all user inputs |
| CLS issues | Fixed skeleton dimensions matching content |
| Accessibility gaps | Keyboard nav + screen reader testing |

---

## Dependencies

### NPM Packages (to install)
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Existing Infrastructure Used
- Zustand (state management)
- Zod (validation)
- next-intl (i18n)
- Theme System v2 (CSS variables)
- Tailwind CSS (styling)

---

## File Structure (Proposed)

```
lib/dashboard/
├── types/
│   ├── widget.types.ts
│   ├── user-widget.types.ts
│   ├── layout.types.ts
│   ├── view.types.ts
│   ├── config.types.ts
│   └── index.ts
├── store/
│   ├── dashboard.store.ts
│   └── selectors.ts
├── registry/
│   ├── widget-registry.ts
│   └── skeleton-registry.ts
├── services/
│   └── dashboard.service.ts
├── migrations/
│   └── index.ts
├── validation/
│   └── index.ts
└── index.ts

components/dashboard/
├── widget-grid.tsx
├── draggable-widget.tsx
├── widget-wrapper.tsx
├── add-widget-panel.tsx
├── view-selector.tsx
├── edit-mode-toolbar.tsx
└── skeletons/
    ├── stats-widget-skeleton.tsx
    ├── chart-widget-skeleton.tsx
    ├── table-widget-skeleton.tsx
    ├── list-widget-skeleton.tsx
    ├── dashboard-page-skeleton.tsx
    └── users-page-skeleton.tsx

components/ui/
├── skeleton.tsx (enhanced)
└── skeleton-primitives.tsx

app/api/dashboard/
├── config/route.ts
├── views/route.ts
├── views/[id]/route.ts
└── defaults/[role]/route.ts
```

---

## Next Steps

1. Review and approve this plan
2. Begin MVP Phase: Task MVP-1 (Skeleton Primitives)
3. Weekly progress check against task list
