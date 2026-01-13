# Dashboard Personalization - Implementation Tasks

## Phase Overview

| Phase | Focus | Timeline | Deliverables |
|-------|-------|----------|--------------|
| MVP | Skeleton system + basic reorder | Week 1-2 | Loading UX, drag/drop reorder |
| v1 | Full personalization | Week 3-4 | Widget add/remove, config, views |
| v2 | Advanced features | Week 5-6 | Resize, sharing, role defaults admin |

---

## Phase MVP: Foundation & Skeleton System

### MVP-1: Skeleton Primitives
- [ ] **MVP-1.1** Create base `Skeleton` component with shimmer animation
- [ ] **MVP-1.2** Add CSS variables for skeleton colors in `globals.css`
- [ ] **MVP-1.3** Create `SkeletonText` component (configurable lines)
- [ ] **MVP-1.4** Create `SkeletonCircle` component (avatars/icons)
- [ ] **MVP-1.5** Create `SkeletonChart` component (bar/line/pie variants)
- [ ] **MVP-1.6** Create `SkeletonTable` component (configurable rows/cols)
- [ ] **MVP-1.7** Add RTL shimmer direction support
- [ ] **MVP-1.8** Add `prefers-reduced-motion` support

**Acceptance Criteria:**
- All primitives render correctly in LTR and RTL
- Shimmer animation disabled when reduced motion preferred
- Components use theme CSS variables (radius, colors)

### MVP-2: Widget Skeletons
- [ ] **MVP-2.1** Create `StatsWidgetSkeleton` component
- [ ] **MVP-2.2** Create `ChartWidgetSkeleton` component (with type prop)
- [ ] **MVP-2.3** Create `TableWidgetSkeleton` component
- [ ] **MVP-2.4** Create `ListWidgetSkeleton` component
- [ ] **MVP-2.5** Create `ActivityWidgetSkeleton` component
- [ ] **MVP-2.6** Create skeleton registry mapping `WidgetType → Skeleton`
- [ ] **MVP-2.7** Ensure all skeletons have fixed min-height matching content

**Acceptance Criteria:**
- Each skeleton matches final widget dimensions (no CLS)
- Skeletons lazy-load to avoid bundle bloat

### MVP-3: Page Skeletons
- [ ] **MVP-3.1** Create `DashboardPageSkeleton` template
- [ ] **MVP-3.2** Create `UsersPageSkeleton` template
- [ ] **MVP-3.3** Create `SettingsPageSkeleton` template
- [ ] **MVP-3.4** Integrate page skeletons with Suspense boundaries
- [ ] **MVP-3.5** Add loading.tsx files using page skeletons

**Acceptance Criteria:**
- Page skeletons show instantly on navigation
- No flash of empty content before skeleton appears

### MVP-4: Data Model Types
- [ ] **MVP-4.1** Create `lib/dashboard/types/widget.types.ts`
- [ ] **MVP-4.2** Create `lib/dashboard/types/user-widget.types.ts`
- [ ] **MVP-4.3** Create `lib/dashboard/types/layout.types.ts`
- [ ] **MVP-4.4** Create `lib/dashboard/types/view.types.ts`
- [ ] **MVP-4.5** Create `lib/dashboard/types/config.types.ts`
- [ ] **MVP-4.6** Add Zod schemas for all types
- [ ] **MVP-4.7** Create `lib/dashboard/types/index.ts` barrel export

**Acceptance Criteria:**
- All types have corresponding Zod validation schemas
- Types are exported from single entry point

### MVP-5: Widget Registry
- [ ] **MVP-5.1** Create `lib/dashboard/registry/widget-registry.ts`
- [ ] **MVP-5.2** Define 5 initial widgets (stats, chart-bar, chart-line, table, list)
- [ ] **MVP-5.3** Add i18n keys for widget titles/descriptions
- [ ] **MVP-5.4** Create `getWidgetRegistry()` function
- [ ] **MVP-5.5** Create `getWidgetDefinition(id)` helper

**Acceptance Criteria:**
- Registry is type-safe and immutable
- All widgets have i18n keys (no hardcoded strings)

### MVP-6: Basic Store
- [ ] **MVP-6.1** Create `lib/dashboard/store/dashboard.store.ts`
- [ ] **MVP-6.2** Implement `currentLayout` state with persistence
- [ ] **MVP-6.3** Implement `moveWidget` action
- [ ] **MVP-6.4** Implement `toggleWidgetVisibility` action
- [ ] **MVP-6.5** Create basic selectors (`useVisibleWidgets`, `useSortedWidgets`)
- [ ] **MVP-6.6** Add `isDirty` tracking

**Acceptance Criteria:**
- Layout persists to localStorage
- Widget position changes reflect immediately

### MVP-7: Drag & Drop (Reorder Only)
- [ ] **MVP-7.1** Install `@dnd-kit/core` and `@dnd-kit/sortable`
- [ ] **MVP-7.2** Create `DraggableWidget` wrapper component
- [ ] **MVP-7.3** Create `WidgetGrid` with DndContext
- [ ] **MVP-7.4** Implement drag overlay for visual feedback
- [ ] **MVP-7.5** Add keyboard navigation for drag (arrow keys)
- [ ] **MVP-7.6** Add accessibility announcements
- [ ] **MVP-7.7** Test RTL drag behavior

**Acceptance Criteria:**
- Widgets can be reordered via drag/drop
- Keyboard-only users can reorder widgets
- Screen readers announce drag actions
- Works correctly in RTL mode

### MVP-8: Edit Mode UI
- [ ] **MVP-8.1** Create "Customize Dashboard" toggle button
- [ ] **MVP-8.2** Show drag handles only in edit mode
- [ ] **MVP-8.3** Show remove button on widgets in edit mode
- [ ] **MVP-8.4** Add "Save" and "Cancel" buttons in edit mode
- [ ] **MVP-8.5** Add confirmation modal for cancel with changes
- [ ] **MVP-8.6** Add success toast on save

**Acceptance Criteria:**
- Edit mode clearly distinguished from view mode
- Unsaved changes prompt before discard

---

## Phase v1: Full Personalization

### v1-1: Widget Add/Remove
- [ ] **v1-1.1** Create "Add Widget" panel/drawer
- [ ] **v1-1.2** Show available widgets filtered by user role
- [ ] **v1-1.3** Implement `addWidget` store action
- [ ] **v1-1.4** Implement `removeWidget` store action
- [ ] **v1-1.5** Add empty state when no widgets visible
- [ ] **v1-1.6** Add widget search/filter in add panel

**Acceptance Criteria:**
- Users can add any widget their role permits
- Users can remove any widget
- Empty dashboard shows helpful prompt

### v1-2: Widget Configuration
- [ ] **v1-2.1** Create widget settings popover/modal
- [ ] **v1-2.2** Generate settings form from widget config schema
- [ ] **v1-2.3** Implement `updateWidgetConfig` store action
- [ ] **v1-2.4** Implement `resetWidget` action (config only)
- [ ] **v1-2.5** Validate config with Zod before save

**Acceptance Criteria:**
- Each widget type shows relevant settings
- Invalid configs are rejected with clear error
- Reset restores widget defaults

### v1-3: Saved Views
- [ ] **v1-3.1** Create view selector dropdown in dashboard header
- [ ] **v1-3.2** Implement "Save as New View" modal
- [ ] **v1-3.3** Implement `saveCurrentAsView` store action
- [ ] **v1-3.4** Implement `loadView` store action
- [ ] **v1-3.5** Implement `deleteView` store action
- [ ] **v1-3.6** Implement `setDefaultView` action
- [ ] **v1-3.7** Show view list with edit/delete options

**Acceptance Criteria:**
- Users can save, load, and delete views
- One view can be marked as default
- Loading a view replaces current layout

### v1-4: Reset & Defaults
- [ ] **v1-4.1** Create role default layouts (admin, manager, analyst, viewer)
- [ ] **v1-4.2** Implement `resetToRoleDefault` action
- [ ] **v1-4.3** Add "Reset Layout" button with confirmation
- [ ] **v1-4.4** Auto-apply role default for new users (no saved config)

**Acceptance Criteria:**
- Each role has sensible default layout
- Reset fully restores role defaults
- New users see appropriate defaults

### v1-5: Backend Integration
- [ ] **v1-5.1** Create `dashboardService` with all API methods
- [ ] **v1-5.2** Create API routes: GET/PUT `/api/dashboard/config`
- [ ] **v1-5.3** Create API routes: CRUD `/api/dashboard/views`
- [ ] **v1-5.4** Implement debounced sync to backend (2s delay)
- [ ] **v1-5.5** Implement `loadFromBackend` action
- [ ] **v1-5.6** Add sync status indicator
- [ ] **v1-5.7** Handle offline gracefully (queue changes)

**Acceptance Criteria:**
- Changes sync to backend after 2s inactivity
- Sync failures show error toast
- Works offline (syncs when reconnected)

### v1-6: Migrations
- [ ] **v1-6.1** Create migration system in `lib/dashboard/migrations/`
- [ ] **v1-6.2** Implement `migrateLayout` function
- [ ] **v1-6.3** Handle unknown widget IDs (filter out)
- [ ] **v1-6.4** Handle config validation failures (reset to defaults)
- [ ] **v1-6.5** Add migration tests

**Acceptance Criteria:**
- Old layouts auto-migrate to new schema
- Invalid data gracefully handled

### v1-7: i18n Integration
- [ ] **v1-7.1** Add all dashboard translation keys (en.json, ar.json)
- [ ] **v1-7.2** Add widget title/description translations
- [ ] **v1-7.3** Add action translations (customize, save, reset, etc.)
- [ ] **v1-7.4** Add empty state translations
- [ ] **v1-7.5** Test full RTL layout

**Acceptance Criteria:**
- All UI text translated
- RTL layout correct for Arabic

---

## Phase v2: Advanced Features

### v2-1: Widget Resize
- [ ] **v2-1.1** Evaluate `react-grid-layout` vs custom resize
- [ ] **v2-1.2** Add resize handles to widgets
- [ ] **v2-1.3** Enforce min/max size constraints from registry
- [ ] **v2-1.4** Update skeletons to support size variants
- [ ] **v2-1.5** Add size presets (small/medium/large buttons)

### v2-2: Undo/Redo
- [ ] **v2-2.1** Implement layout history stack
- [ ] **v2-2.2** Add undo/redo store actions
- [ ] **v2-2.3** Add keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- [ ] **v2-2.4** Add undo/redo buttons in edit mode

### v2-3: Role Defaults Admin
- [ ] **v2-3.1** Create admin UI for managing role defaults
- [ ] **v2-3.2** Implement `setRoleDefault` API endpoint
- [ ] **v2-3.3** Add "Apply to Role" option when saving view

### v2-4: View Sharing (Optional)
- [ ] **v2-4.1** Add `sharedWith` field to views
- [ ] **v2-4.2** Create share modal with user/team selection
- [ ] **v2-4.3** Show shared views in view selector

---

## Testing Plan

### Unit Tests
| Area | Test File | Coverage |
|------|-----------|----------|
| Skeleton components | `__tests__/skeletons.test.tsx` | Render, RTL, reduced motion |
| Store actions | `__tests__/dashboard.store.test.ts` | All actions, edge cases |
| Validation | `__tests__/validation.test.ts` | Zod schemas, security |
| Migrations | `__tests__/migrations.test.ts` | Version upgrades |

### Integration Tests
| Scenario | Test File |
|----------|-----------|
| Add/remove widget flow | `__tests__/widget-crud.test.tsx` |
| Drag/drop reorder | `__tests__/drag-drop.test.tsx` |
| Save/load view | `__tests__/views.test.tsx` |
| Backend sync | `__tests__/sync.test.tsx` |

### E2E Tests (Playwright)
| Flow | File |
|------|------|
| New user sees defaults | `e2e/dashboard-defaults.spec.ts` |
| Customize and save | `e2e/dashboard-customize.spec.ts` |
| Switch views | `e2e/dashboard-views.spec.ts` |
| RTL behavior | `e2e/dashboard-rtl.spec.ts` |

---

## Performance Plan

### Optimization Strategies
| Issue | Solution |
|-------|----------|
| Too many rerenders | Selective Zustand subscriptions |
| Large widget list | Virtualization with `react-virtual` |
| Heavy widget components | `React.lazy` + Suspense |
| Drag performance | `transform` only, avoid layout shifts |
| Memory leaks | Cleanup observers, abort controllers |

### Monitoring
- Track CLS score with web-vitals
- Monitor skeleton → content transition time
- Track sync failures in error reporting

---

## Skeleton Rollout Plan

### Phase 1 (MVP)
1. Add skeleton CSS variables to theme
2. Create primitives (`Skeleton`, `SkeletonText`, etc.)
3. Create `DashboardPageSkeleton`
4. Add `loading.tsx` to dashboard route

### Phase 2 (v1)
1. Create all widget-specific skeletons
2. Integrate skeleton registry
3. Create `UsersPageSkeleton`, `SettingsPageSkeleton`
4. Add loading.tsx to all major routes

### Design Tokens
```css
/* Skeleton design tokens - aligned with Theme System v2 */
--skeleton-base: hsl(var(--muted));
--skeleton-highlight: hsl(var(--muted-foreground) / 0.1);
--skeleton-border-radius: var(--radius-md);
--skeleton-shimmer-duration: 1.5s;
```

### Spacing Consistency
- Use same `gap`, `padding` values as actual components
- Match Card component padding exactly
- Use grid system for layout (12-column)

---

## Checklist Summary

### MVP Completion Criteria
- [ ] All skeleton primitives created and working
- [ ] Dashboard page skeleton shows on load
- [ ] Widgets can be reordered via drag/drop
- [ ] Layout persists to localStorage
- [ ] Works in both LTR and RTL
- [ ] Accessible via keyboard
- [ ] Reduced motion respected

### v1 Completion Criteria
- [ ] Widgets can be added/removed
- [ ] Widget settings configurable
- [ ] Views can be saved/loaded/deleted
- [ ] Reset to role defaults works
- [ ] Backend sync implemented
- [ ] All text translated (en/ar)

### v2 Completion Criteria
- [ ] Widgets can be resized
- [ ] Undo/redo available
- [ ] Admin can set role defaults
- [ ] Views can be shared (optional)
