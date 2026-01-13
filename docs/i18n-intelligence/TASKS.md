# Multilingual Content Intelligence System
## Implementation Tasks

**Version:** 1.1.0  
**Date:** 2026-01-13  
**Status:** Phase 1 Complete, Phase 2 In Progress

---

## Overview

This document outlines the implementation tasks for the Translation Intelligence system, organized by phase and priority.

---

## Phase 1: MVP (Core Detection + Basic UI) ✅ COMPLETE

### 1.1 Foundation Setup

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create `lib/i18n-intelligence/` directory structure | P0 | 0.5h | ✅ |
| Define TypeScript types in `types/` | P0 | 2h | ✅ |
| Create Zod validation schemas | P1 | 1h | ✅ |
| Set up Zustand store with persist | P0 | 2h | ✅ |
| Create barrel exports | P1 | 0.5h | ✅ |

### 1.2 Detection Engine

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Configure next-intl `onError` handler | P0 | 1h | ✅ |
| Configure `getMessageFallback` for graceful fallbacks | P0 | 1h | ✅ |
| Create `TranslationEventCollector` class | P0 | 2h | ✅ |
| Implement event batching and deduplication | P1 | 1h | ✅ |
| Create `useTranslationsWithTracking` hook wrapper | P0 | 2h | ✅ |

### 1.3 Missing Key Analyzer

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Implement `analyzeMissingKeys()` function | P0 | 2h | ✅ |
| Create key collection from locale files | P0 | 1h | ✅ |
| Implement cross-locale comparison | P0 | 1h | ✅ |
| Generate `MissingTranslationIssue` records | P0 | 1h | ✅ |

### 1.4 Severity Scoring

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Implement `calculateSeverity()` function | P0 | 1h | ✅ |
| Define route importance scoring | P1 | 0.5h | ✅ |
| Define component type scoring | P1 | 0.5h | ✅ |
| Implement usage frequency scoring | P1 | 0.5h | ✅ |

### 1.5 Basic Dashboard UI

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create route `/dev-tools/i18n/page.tsx` | P0 | 1h | ✅ |
| Create `HealthOverview` component | P0 | 2h | ✅ |
| Create `IssueList` component | P0 | 2h | ✅ |
| Create `SeverityBadge` component | P0 | 0.5h | ✅ |
| Create `StatusBadge` component | P0 | 0.5h | ✅ |
| Add loading skeleton | P1 | 1h | ✅ |

### 1.6 i18n Keys

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Add English translations for dashboard | P0 | 1h | ✅ |
| Add Arabic translations for dashboard | P1 | 1h | ✅ |

**Phase 1 Total: ~25 hours** ✅ COMPLETE

---

## Phase 2: Enhanced Analysis (IN PROGRESS)

### 2.1 Hardcoded String Detection

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create AST-based static analyzer | P1 | 4h | ✅ |
| Implement JSX text detection | P1 | 2h | ✅ |
| Implement string literal attribute detection | P1 | 1h | ✅ |
| Add exclusion patterns (URLs, codes, etc.) | P1 | 1h | ✅ |
| Add brand name detection (low confidence) | P2 | 1h | ⬜ |
| Create runtime MutationObserver detector | P2 | 3h | ⬜ |

### 2.2 RTL Analysis

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Implement RTL layout analyzer | P1 | 3h | ⬜ |
| Detect directional CSS issues | P1 | 2h | ⬜ |
| Detect icon position issues | P2 | 1h | ⬜ |
| Detect text overflow in RTL | P1 | 2h | ⬜ |

### 2.3 Health Metrics

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Implement `LocaleHealthMetrics` calculation | P0 | 2h | ⬜ |
| Implement `RouteHealthMetrics` calculation | P1 | 2h | ⬜ |
| Implement `TranslationHealthSummary` aggregation | P0 | 2h | ⬜ |
| Add health history tracking | P2 | 2h | ⬜ |

### 2.4 Dashboard Enhancements

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create `ProblemHeatmap` component | P1 | 3h | ⬜ |
| Create `LocaleCoverage` component | P1 | 2h | ⬜ |
| Create `IssueSummary` component | P1 | 2h | ⬜ |
| Create `RecentIssues` component | P0 | 1h | ⬜ |
| Implement issue filtering | P0 | 3h | ⬜ |

**Phase 2 Total: ~38 hours**

---

## Phase 3: Drill-Down & Actions

### 3.1 Issue Detail View

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create `/dev-tools/i18n/issues/[id]/page.tsx` | P0 | 2h | ⬜ |
| Build `IssueDetail` component | P0 | 3h | ⬜ |
| Add code context display | P1 | 2h | ⬜ |
| Add suggested fix display | P1 | 1h | ⬜ |
| Implement status update actions | P0 | 2h | ⬜ |

### 3.2 Locale Drilldown

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create `/dev-tools/i18n/locale/[locale]/page.tsx` | P1 | 2h | ⬜ |
| Build `LocaleDrilldown` component | P1 | 3h | ⬜ |
| Implement route → component → key hierarchy | P1 | 3h | ⬜ |

### 3.3 Route Analysis

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create `/dev-tools/i18n/routes/page.tsx` | P1 | 2h | ⬜ |
| Build `RouteAnalysis` component | P1 | 3h | ⬜ |
| Add route selector with preview | P2 | 2h | ⬜ |

### 3.4 RTL Validation View

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create `/dev-tools/i18n/rtl/page.tsx` | P1 | 2h | ⬜ |
| Build `VisualDiff` component | P1 | 4h | ⬜ |
| Implement side-by-side view | P1 | 1h | ⬜ |
| Implement overlay slider view | P2 | 2h | ⬜ |
| Implement difference highlighting | P2 | 3h | ⬜ |

**Phase 3 Total: ~37 hours**

---

## Phase 4: Export & Integration

### 4.1 Export Functionality

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Implement JSON export | P0 | 1h | ⬜ |
| Implement CSV export | P1 | 1h | ⬜ |
| Implement Markdown report export | P1 | 2h | ⬜ |
| Add download functionality | P0 | 1h | ⬜ |

### 4.2 Charts & Trends

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Add health trend line chart | P2 | 3h | ⬜ |
| Add severity donut chart | P2 | 2h | ⬜ |
| Add locale coverage bar chart | P2 | 2h | ⬜ |

### 4.3 Settings Page

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create `/dev-tools/i18n/settings/page.tsx` | P1 | 1h | ⬜ |
| Build settings form | P1 | 2h | ⬜ |
| Add tracking configuration options | P1 | 1h | ⬜ |
| Add exclusion patterns config | P2 | 2h | ⬜ |

### 4.4 Developer Integration

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create CLI command for analysis | P2 | 4h | ✅ |
| Add ESLint rule for hardcoded strings | P2 | 4h | ✅ |
| Document API for custom integrations | P1 | 2h | ⬜ |

**Phase 4 Total: ~28 hours**

---

## Phase 5: Production Hardening (Future)

### 5.1 Performance

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Implement sampling for production | P0 | 2h | ⬜ |
| Add Web Worker for heavy analysis | P2 | 4h | ⬜ |
| Implement virtual scrolling for large lists | P1 | 3h | ⬜ |
| Add lazy loading for charts | P2 | 2h | ⬜ |

### 5.2 Backend Integration

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create API endpoints for issue sync | P1 | 4h | ⬜ |
| Implement server-side analysis | P2 | 6h | ⬜ |
| Add issue notifications | P2 | 3h | ⬜ |

### 5.3 CI/CD Integration

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Create GitHub Action for analysis | P2 | 4h | ⬜ |
| Add PR comments for new issues | P2 | 3h | ⬜ |
| Implement regression detection | P2 | 4h | ⬜ |

**Phase 5 Total: ~35 hours**

---

## Directory Structure

```
lib/i18n-intelligence/
├── types/
│   ├── enums.ts
│   ├── usage.types.ts
│   ├── issues.types.ts
│   ├── health.types.ts
│   ├── store.types.ts
│   └── index.ts
├── schemas/
│   └── index.ts
├── store/
│   ├── intelligence.store.ts
│   ├── selectors.ts
│   └── index.ts
├── interceptors/
│   ├── intl-config.ts
│   ├── use-translations-wrapper.tsx
│   └── index.ts
├── analyzers/
│   ├── missing-key-analyzer.ts
│   ├── hardcoded-string-analyzer.ts
│   ├── rtl-analyzer.ts
│   ├── severity-scorer.ts
│   └── index.ts
├── collector/
│   ├── event-collector.ts
│   └── index.ts
├── utils/
│   ├── locale-loader.ts
│   └── index.ts
└── index.ts

components/i18n-intelligence/
├── dashboard/
│   ├── health-overview.tsx
│   ├── issue-summary.tsx
│   ├── locale-coverage.tsx
│   ├── problem-heatmap.tsx
│   └── recent-issues.tsx
├── issues/
│   ├── issue-list.tsx
│   ├── issue-card.tsx
│   ├── issue-detail.tsx
│   ├── issue-filters.tsx
│   └── issue-actions.tsx
├── analysis/
│   ├── locale-drilldown.tsx
│   ├── route-analysis.tsx
│   └── key-usage.tsx
├── rtl/
│   ├── visual-diff.tsx
│   ├── rtl-issues.tsx
│   └── rtl-validator.tsx
├── charts/
│   ├── health-trend.tsx
│   ├── severity-donut.tsx
│   └── coverage-bar.tsx
├── shared/
│   ├── severity-badge.tsx
│   ├── status-badge.tsx
│   ├── confidence-indicator.tsx
│   ├── locale-flag.tsx
│   └── empty-state.tsx
├── skeletons/
│   └── dashboard-skeleton.tsx
└── index.ts

app/[locale]/(dashboard)/dashboard/dev-tools/i18n/
├── page.tsx
├── loading.tsx
├── issues/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── locale/
│   └── [locale]/
│       └── page.tsx
├── routes/
│   └── page.tsx
├── rtl/
│   └── page.tsx
└── settings/
    └── page.tsx
```

---

## Acceptance Criteria

### MVP (Phase 1)

- [ ] Missing translation keys are detected without crashing the UI
- [ ] Fallback usage is tracked and reported
- [ ] Basic dashboard shows health score and issue list
- [ ] Issues have severity scores (blocker/high/medium/low)
- [ ] Works in development mode

### Production Ready (Phase 4+)

- [ ] Sampling reduces performance impact in production
- [ ] All charts render with real data
- [ ] Export produces valid JSON/CSV/Markdown
- [ ] Settings persist across sessions
- [ ] RTL validation shows visual diff

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance overhead from tracking | High | Sampling, batching, dev-only features |
| next-intl API changes | Medium | Abstract interceptor layer |
| False positives in hardcoded detection | Medium | Confidence scoring, dismiss action |
| Storage limits in localStorage | Low | TTL cleanup, pagination |

---

## Dependencies

### Required Packages (Already Installed)

- `next-intl` - i18n framework
- `zustand` - State management
- `zod` - Validation
- `date-fns` - Date formatting

### Optional Packages (For Full Feature Set)

- `@babel/parser` - AST analysis for hardcoded strings
- `@babel/traverse` - AST traversal
- `html2canvas` - Screenshot capture for visual diff
- `recharts` - Charts for trends and metrics

---

## Timeline Estimate

| Phase | Effort | Calendar Time |
|-------|--------|---------------|
| Phase 1 (MVP) | 25h | 1 week |
| Phase 2 | 38h | 1.5 weeks |
| Phase 3 | 37h | 1.5 weeks |
| Phase 4 | 28h | 1 week |
| Phase 5 | 35h | 1.5 weeks |
| **Total** | **163h** | **~6.5 weeks** |

---

## Next Steps

1. **Approve ADR** → Get stakeholder sign-off
2. **Phase 1 Sprint** → Start with foundation setup
3. **Regular Reviews** → Weekly progress check
