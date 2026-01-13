# Multilingual Content Intelligence System
## Product & UX Specification

**Version:** 1.0.0  
**Date:** 2026-01-13  
**Status:** Draft

---

## Executive Summary

The Multilingual Content Intelligence System provides deep visibility into translation quality, missing content, and localization issues across the B-Dashboard application. Unlike basic i18n tools that only provide build-time checks, this system offers **runtime intelligence** with location-aware issue detection, severity scoring, and actionable remediation guidance.

---

## User Stories

### For Developers

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| DEV-1 | As a developer, I want to see which translation keys are missing in each locale so I can add them before users see English fallbacks | Dashboard shows missing keys grouped by locale with file locations |
| DEV-2 | As a developer, I want to know which component triggered a missing translation so I can fix it quickly | Each issue shows route → component → key hierarchy |
| DEV-3 | As a developer, I want to see if Arabic text is using English fallbacks so I can provide proper translations | Fallback usage is highlighted with visual indicators |
| DEV-4 | As a developer, I want to detect hardcoded strings I forgot to wrap in `t()` so I can internationalize them | Static analysis + runtime detection for strings > 3 words |
| DEV-5 | As a developer, I want to see RTL layout issues so I can fix alignment problems | Visual diff mode shows LTR vs RTL rendering |
| DEV-6 | As a developer, I want to export a report of translation issues for tracking in our issue system | Export to JSON, CSV, or Markdown formats |

### For Content Editors

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| CE-1 | As a content editor, I want to see a list of all translations that need work so I can prioritize my efforts | Sortable/filterable table of issues with severity |
| CE-2 | As a content editor, I want to see where each translation appears in the UI so I can understand context | Preview mode shows translation in-situ |
| CE-3 | As a content editor, I want to compare translations between locales so I can ensure consistency | Side-by-side comparison view |
| CE-4 | As a content editor, I want to see which translations are too long and causing overflow so I can shorten them | Character count + overflow warnings |

### For Product Managers

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| PM-1 | As a PM, I want to see overall translation health scores per locale so I can track progress | Health score dashboard with trends |
| PM-2 | As a PM, I want to know which user flows have translation issues so I can prioritize fixes | Heatmap of issues by route/feature |
| PM-3 | As a PM, I want to see what changed after each deploy so I can catch regressions | Diff view between time periods |
| PM-4 | As a PM, I want to generate reports for stakeholders so I can communicate i18n status | Scheduled report generation |

---

## UX Flows

### Flow 1: "Find Missing Translations"

```
┌─────────────────────────────────────────────────────────────┐
│ Translation Intelligence Dashboard                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Health Score: 87%  ▲ +3% from last week                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ English │ │ Arabic  │ │ Missing │ │ Fallback│           │
│  │  100%   │ │   74%   │ │   23    │ │   12    │           │
│  │ ✓ Done  │ │ ⚠ Warn  │ │ ⊗ Error │ │ ⚠ Warn  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Missing Translations (23)                    [Export] │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ 🔴 HIGH  dashboard.widgets.analytics.title            │ │
│  │          Route: /dashboard/analytics                   │ │
│  │          Component: AnalyticsWidget                    │ │
│  │          Locales: ar (missing)                        │ │
│  │                                                        │ │
│  │ 🟠 MED   settings.notifications.emailLabel            │ │
│  │          Route: /dashboard/settings/notifications      │ │
│  │          Component: NotificationPrefs                  │ │
│  │          Locales: ar (missing)                        │ │
│  │                                                        │ │
│  │ 🟡 LOW   common.tooltips.refreshData                  │ │
│  │          Route: (multiple)                             │ │
│  │          Component: DataTable                          │ │
│  │          Locales: ar (missing)                        │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: "Why is this English in Arabic?"

```
┌─────────────────────────────────────────────────────────────┐
│ Fallback Usage Analysis                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚠ 12 keys are showing English text in Arabic locale       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Key: dashboard.widgets.revenueChart.title             │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │                                                        │ │
│  │  Expected (ar):  مخطط الإيرادات                        │ │
│  │  Showing:        Revenue Chart  ← English fallback    │ │
│  │                                                        │ │
│  │  Reason: Key exists in en.json but missing in ar.json │ │
│  │                                                        │ │
│  │  Seen on:                                              │ │
│  │  • /ar/dashboard (main dashboard)                      │ │
│  │  • /ar/dashboard/analytics (analytics page)            │ │
│  │                                                        │ │
│  │  Last occurrence: 2 minutes ago                        │ │
│  │  Frequency: 847 renders                                │ │
│  │                                                        │ │
│  │  [Copy Key] [Open en.json] [Open ar.json] [Mark Fixed]│ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Flow 3: "What Broke After Last Deploy?"

```
┌─────────────────────────────────────────────────────────────┐
│ Translation Regression Analysis                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Comparing: Jan 12 → Jan 13, 2026                           │
│                                                             │
│  Summary:                                                    │
│  • New issues: 5                                            │
│  • Resolved: 12                                             │
│  • Net change: -7 (improved)                                │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ NEW ISSUES (5)                              [Expand]  │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ 🆕 users.table.newColumn        ar missing            │ │
│  │ 🆕 users.table.exportAll        ar missing            │ │
│  │ 🆕 analytics.charts.title       ar missing            │ │
│  │ 🆕 analytics.filters.dateRange  ar, fr missing        │ │
│  │ 🆕 HARDCODED: "Loading data..." in DataLoader.tsx     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ RESOLVED (12)                               [Expand]  │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ ✓ dashboard.stats.totalUsers    ar added              │ │
│  │ ✓ dashboard.stats.revenue       ar added              │ │
│  │ ... 10 more                                           │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Dashboard UI Design

### Main Dashboard Layout

```
┌────────────────────────────────────────────────────────────────────┐
│ ← Settings    Translation Intelligence                    [?] [⚙]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ OVERALL HEALTH                                                │ │
│  │                                                                │ │
│  │    87%     ████████████░░░░                                   │ │
│  │  ▲ +3%     Coverage across all locales                        │ │
│  │                                                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ English  │ │ Arabic   │ │ Missing  │ │ Fallback │ │ Hardcode ││
│  │   100%   │ │   74%    │ │    23    │ │    12    │ │    3     ││
│  │  ✓ Done  │ │ ⚠ Issues │ │ 🔴 Error │ │ ⚠ Warn   │ │ ⚠ Warn   ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ PROBLEM HEATMAP                                     [Routes] │ │
│  │                                                                │ │
│  │  /dashboard          ░░░░░░░░░░ 0 issues                      │ │
│  │  /dashboard/users    ██░░░░░░░░ 3 issues                      │ │
│  │  /dashboard/settings ████░░░░░░ 8 issues                      │ │
│  │  /dashboard/analytics████████░░ 12 issues ← NEW PAGE          │ │
│  │                                                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ RECENT ISSUES                              [View All] [Export]│ │
│  │                                                                │ │
│  │  🔴 HIGH   analytics.filters.dateRange                        │ │
│  │            Missing in: ar                                      │ │
│  │            Route: /dashboard/analytics                         │ │
│  │            First seen: 2 hours ago                             │ │
│  │                                                    [Fix Guide] │ │
│  │                                                                │ │
│  │  🟠 MED    HARDCODED "Loading data..." detected               │ │
│  │            File: components/shared/DataLoader.tsx:45           │ │
│  │            Should use: t("common.loading")                     │ │
│  │                                                    [Fix Guide] │ │
│  │                                                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Drill-Down View: Locale → Route → Component → Key

```
┌────────────────────────────────────────────────────────────────────┐
│ Arabic (ar) Translation Issues                           ← Back    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Coverage: 74%  (185 / 250 keys)                                   │
│                                                                    │
│  Filter: [All] [Missing] [Fallback] [Overflow]   Search: [____]   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 📁 /dashboard/analytics (12 issues)                    [▼] │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │   📦 AnalyticsWidget (5 issues)                            │   │
│  │      ├─ analytics.title           MISSING                  │   │
│  │      ├─ analytics.description     MISSING                  │   │
│  │      ├─ analytics.filters.date    MISSING                  │   │
│  │      ├─ analytics.filters.range   MISSING                  │   │
│  │      └─ analytics.export          MISSING                  │   │
│  │                                                             │   │
│  │   📦 ChartLegend (3 issues)                                │   │
│  │      ├─ charts.legend.revenue     FALLBACK                 │   │
│  │      ├─ charts.legend.users       FALLBACK                 │   │
│  │      └─ charts.legend.growth      FALLBACK                 │   │
│  │                                                             │   │
│  │   📦 DataTable (4 issues)                                  │   │
│  │      ├─ table.columns.date        MISSING                  │   │
│  │      ├─ table.columns.value       MISSING                  │   │
│  │      ├─ table.empty               OVERFLOW (32 chars)      │   │
│  │      └─ HARDCODED: "No data"      line 156                 │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 📁 /dashboard/settings (8 issues)                      [▶] │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### RTL Validation View

```
┌────────────────────────────────────────────────────────────────────┐
│ RTL Layout Validation                                    ← Back    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Comparing: English (LTR) vs Arabic (RTL)                          │
│                                                                    │
│  ┌─────────────────────────┐  ┌─────────────────────────┐         │
│  │ English (LTR)           │  │ Arabic (RTL)            │         │
│  │                         │  │                         │         │
│  │ ┌───────────────────┐   │  │   ┌───────────────────┐ │         │
│  │ │ [Icon] Dashboard  │   │  │   │  لوحة القيادة [Icon]│ │         │
│  │ └───────────────────┘   │  │   └───────────────────┘ │         │
│  │                         │  │                         │         │
│  │ Total Users: 2,350      │  │      2,350 :إجمالي المستخدمين│         │
│  │ ▲ +12% from last month  │  │  من الشهر الماضي %12+ ▲ │         │
│  │                         │  │                         │         │
│  └─────────────────────────┘  └─────────────────────────┘         │
│                                                                    │
│  Issues Detected:                                                  │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ ⚠ ICON ALIGNMENT                                            │   │
│  │   Component: StatsCard                                      │   │
│  │   Issue: Icon should be on the right in RTL                 │   │
│  │   Fix: Use `me-2` instead of `mr-2` for icon margin         │   │
│  │                                                [Show Code]  │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ ⚠ TEXT OVERFLOW                                             │   │
│  │   Component: StatsCard                                      │   │
│  │   Issue: Arabic text "إجمالي المستخدمين" exceeds container  │   │
│  │   Fix: Increase container width or use text truncation      │   │
│  │                                            [Show Preview]   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Empty States & Warnings

### No Issues Found

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ✓                                        │
│               Translation                                   │
│               Health: 100%                                  │
│                                                             │
│     All translations are complete and working!              │
│                                                             │
│     Last checked: Just now                                  │
│     Keys analyzed: 250                                      │
│     Locales: English, Arabic                                │
│                                                             │
│     [Run Full Analysis] [View History]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Analysis In Progress

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ◐                                        │
│               Analyzing...                                  │
│                                                             │
│     Scanning translation usage across all routes            │
│                                                             │
│     Progress: 67% (168 / 250 keys)                          │
│     ████████████████░░░░░░░░                                │
│                                                             │
│     Current: /dashboard/settings/profile                    │
│                                                             │
│     [Cancel]                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### First-Time Setup

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    🌍                                       │
│           Translation Intelligence                          │
│                                                             │
│     Welcome! This tool helps you:                           │
│                                                             │
│     • Find missing translations                             │
│     • Detect English fallbacks in other locales             │
│     • Identify hardcoded strings                            │
│     • Validate RTL layouts                                  │
│                                                             │
│     Ready to start?                                         │
│                                                             │
│     [Start Analysis]                                        │
│                                                             │
│     ℹ This will scan all routes and components              │
│       Estimated time: ~30 seconds                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Confidence Indicators

| Level | Icon | Meaning |
|-------|------|---------|
| High Confidence | ✓ | Issue definitely exists, verified |
| Medium Confidence | ◐ | Likely issue, needs manual verification |
| Low Confidence | ? | Possible issue, may be false positive |

### When to Show Confidence

- **High**: Key definitely missing from JSON file
- **Medium**: Fallback detected but might be intentional
- **Low**: Hardcoded string detected but might be intentional (e.g., brand name)

---

## Accessibility Considerations

### Screen Reader Support

1. **Issue announcements**: "12 missing translations found. 5 high severity, 4 medium, 3 low."
2. **Progress updates**: "Analysis 67% complete. Currently scanning settings page."
3. **Action results**: "Issue marked as resolved. 11 issues remaining."

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between sections |
| `Enter` | Expand/collapse section |
| `E` | Export current view |
| `F` | Focus search |
| `?` | Show keyboard shortcuts |

### Color Contrast

- Use patterns + icons alongside colors for severity
- Ensure 4.5:1 contrast ratio for all text
- Provide high-contrast mode toggle

### RTL Support in Dashboard

The intelligence dashboard itself must work correctly in RTL:
- Tables flip column order
- Progress bars fill right-to-left
- Icons maintain correct position
- Text alignment respects direction

---

## Severity Scoring System

### Severity Levels

| Level | Score | Criteria | Examples |
|-------|-------|----------|----------|
| **Blocker** | 100 | Core user flow, no workaround | Login button, error messages |
| **High** | 75 | Primary navigation/actions | Menu items, form labels |
| **Medium** | 50 | Secondary UI elements | Table headers, badges |
| **Low** | 25 | Supplementary content | Tooltips, helper text |

### Automatic Scoring Factors

```typescript
function calculateSeverity(issue: TranslationIssue): number {
  let score = 0;
  
  // Route importance
  if (issue.route === '/dashboard') score += 30;
  else if (issue.route.includes('/settings')) score += 20;
  else score += 10;
  
  // Component type
  if (issue.componentType === 'button') score += 30;
  else if (issue.componentType === 'heading') score += 25;
  else if (issue.componentType === 'label') score += 20;
  else score += 10;
  
  // Usage frequency
  if (issue.renderCount > 1000) score += 20;
  else if (issue.renderCount > 100) score += 15;
  else score += 5;
  
  // Locale coverage
  const missingLocales = issue.missingInLocales.length;
  score += missingLocales * 10;
  
  return Math.min(100, score);
}
```

---

## Next Steps

1. **Data Model Design** → [DATA-MODEL.md](./DATA-MODEL.md)
2. **Detection Engine** → [DETECTION-ENGINE.md](./DETECTION-ENGINE.md)
3. **Implementation Tasks** → [TASKS.md](./TASKS.md)
