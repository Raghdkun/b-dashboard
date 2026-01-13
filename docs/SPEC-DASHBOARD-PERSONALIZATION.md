# Dashboard Personalization - Product Specification

## Overview
Enable users to customize their dashboard layout, widgets, and settings while maintaining role-based defaults and consistent loading experiences.

---

## A. User Stories

### Core Personalization
| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-01 | User | drag and drop widgets to reorder them | I can arrange my dashboard to match my workflow | P0 |
| US-02 | User | show/hide specific widgets | I only see relevant information | P0 |
| US-03 | User | configure individual widget settings (filters, date range) | each widget shows exactly what I need | P0 |
| US-04 | User | save my layout as a named view (e.g., "Morning Report") | I can quickly switch between different workflows | P1 |
| US-05 | User | reset to default layout | I can start fresh if I mess up my customization | P0 |
| US-06 | Admin | define role-based default layouts | new users of each role see relevant widgets immediately | P1 |
| US-07 | User | see my dashboard in my preferred language with correct RTL alignment | the interface is natural in Arabic or English | P0 |
| US-08 | User | see consistent loading skeletons while data loads | I know the page is working and where content will appear | P0 |

### Advanced (v2)
| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-09 | User | resize widgets (small/medium/large) | I can emphasize important metrics | P2 |
| US-10 | User | undo/redo layout changes | I can recover from mistakes | P2 |
| US-11 | User | duplicate a saved view | I can create variations without starting over | P2 |
| US-12 | Manager | share a view with my team | everyone sees the same dashboard setup | P2 |

---

## B. UX Behaviors

### Empty States
| Scenario | Behavior |
|----------|----------|
| No widgets visible | Show illustration + "Your dashboard is empty. Add widgets to get started." + CTA button |
| Widget has no data | Show widget frame + "No data available" message (distinct from loading) |
| No saved views | Show "Create your first view" prompt in view selector |
| New user (no config) | Apply role default layout automatically |

### Reset Behavior
- **Reset Widget**: Restores single widget to default config (position unchanged)
- **Reset Layout**: Restores all widgets to role default positions
- **Reset All**: Restores layout + all widget configs to role defaults
- Confirmation modal required for Reset Layout and Reset All

### Conflict Resolution
| Conflict | Resolution |
|----------|------------|
| Widget removed from system | Hide from layout, show toast "Widget X is no longer available" |
| New widget added to system | Do NOT auto-add; user discovers in "Add Widget" panel |
| Role changed | Prompt: "Your role changed. Apply new defaults or keep current layout?" |
| Config version mismatch | Run migration function; fallback to role default if migration fails |

### Edit Mode
- Toggle button: "Customize Dashboard" enters edit mode
- In edit mode: widgets show drag handles, settings gear, remove button
- Exit edit mode: auto-saves changes, shows success toast
- Cancel: discards unsaved changes (with confirmation if changes exist)

---

## C. Loading UX Specification

### Loading State Hierarchy
```
Page Load
├── 1. Shell (instant) - Sidebar, header rendered from layout
├── 2. Page Skeleton (0-100ms) - Full page skeleton if data not cached
├── 3. Widget Skeletons (100ms+) - Individual widget skeletons
└── 4. Content - Real data replaces skeletons
```

### When to Use Each Loading Pattern
| Pattern | When to Use | Duration |
|---------|-------------|----------|
| **Skeleton** | Initial page load, widget data fetch, predictable content shape | > 200ms |
| **Spinner** | Inline actions (save, delete), button loading states | < 2s |
| **Progress Bar** | File uploads, long operations with known progress | > 2s |
| **No Data** | Fetch completed but returned empty results | N/A |

### Skeleton Guidelines
1. **Shape Matching**: Skeleton must match final content dimensions (avoid CLS)
2. **Shimmer Animation**: Subtle left-to-right gradient animation (respects `prefers-reduced-motion`)
3. **Consistent Spacing**: Use same padding/margins as real content
4. **Border Radius**: Match Theme System v2 radius tokens (`--radius-sm`, `--radius-md`)
5. **Colors**: Use `--skeleton-base` and `--skeleton-highlight` CSS variables

### Layout Stability Requirements
| Requirement | Implementation |
|-------------|----------------|
| Fixed widget heights | Each widget type defines min-height |
| No reflow on load | Skeleton occupies exact same space as content |
| Staggered reveal | Widgets animate in with 50ms stagger (optional, respects reduced motion) |
| Placeholder counts | Tables show fixed row count skeleton (e.g., 5 rows) |

### Skeleton Component Mapping
| Widget Type | Skeleton Component | Elements |
|-------------|-------------------|----------|
| `stats` | `StatsWidgetSkeleton` | Icon circle + 2 text lines |
| `chart-line` | `ChartWidgetSkeleton` | Title + axis lines + wave shape |
| `chart-bar` | `ChartWidgetSkeleton` | Title + 5 vertical bars |
| `chart-pie` | `ChartWidgetSkeleton` | Title + circle + legend lines |
| `table` | `TableWidgetSkeleton` | Header row + 5 body rows |
| `list` | `ListWidgetSkeleton` | 5 list items with avatar + text |
| `calendar` | `CalendarWidgetSkeleton` | Month header + 35 day cells |

---

## D. Permissions & Roles

### Role Capabilities
| Capability | Admin | Manager | Analyst | Viewer |
|------------|-------|---------|---------|--------|
| Customize own layout | ✅ | ✅ | ✅ | ✅ |
| Save personal views | ✅ | ✅ | ✅ | ❌ |
| Define role defaults | ✅ | ❌ | ❌ | ❌ |
| Share views (v2) | ✅ | ✅ | ❌ | ❌ |
| Access all widgets | ✅ | Subset | Subset | Subset |

### Widget Visibility by Role
Widgets define `allowedRoles: Role[]`. Users only see widgets their role permits.

---

## E. Accessibility

### Keyboard Navigation
| Key | Action |
|-----|--------|
| Tab | Move between widgets in edit mode |
| Space/Enter | Activate widget (open settings or start drag) |
| Arrow keys | Move widget position when dragging |
| Escape | Cancel drag / exit edit mode |

### Screen Reader Support
- Widgets announce: "{Widget title}, position {n} of {total}"
- Drag announces: "Grabbed {widget}. Use arrow keys to move, Enter to drop, Escape to cancel"
- Drop announces: "{Widget} dropped at position {n}"
- Loading announces: "Loading {widget title}" → "{Widget title} loaded"

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer { animation: none; }
  .widget-transition { transition: none; }
}
```

---

## F. Localization & RTL

### Translation Keys Structure
```
dashboard.widgets.{widgetId}.title
dashboard.widgets.{widgetId}.description
dashboard.actions.customize
dashboard.actions.addWidget
dashboard.actions.removeWidget
dashboard.actions.resetLayout
dashboard.views.save
dashboard.views.delete
dashboard.empty.title
dashboard.empty.description
dashboard.loading.widget
```

### RTL Considerations
| Element | LTR | RTL |
|---------|-----|-----|
| Widget grid flow | left-to-right | right-to-left |
| Drag handle position | left side | right side |
| Skeleton shimmer direction | left→right | right→left |
| Settings panel | right drawer | left drawer |
| Toast notifications | bottom-right | bottom-left |

### Implementation
- Use CSS logical properties (`margin-inline-start` not `margin-left`)
- Skeleton shimmer uses CSS variable for direction
- Grid uses `dir` attribute inheritance
