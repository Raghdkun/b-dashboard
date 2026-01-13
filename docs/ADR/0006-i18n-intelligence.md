# Multilingual Content Intelligence System

## Architecture Decision Record (ADR-0006)

**Status:** Proposed  
**Date:** 2026-01-13  
**Author:** AI Agent  
**Supersedes:** None

---

## Context

B-Dashboard uses next-intl for internationalization with:
- Locale-prefixed routing (`/en`, `/ar`)
- RTL support for Arabic
- JSON-based translation files
- Client and server component support

Current limitations:
1. **No visibility** into missing translations until runtime
2. **No tracking** of fallback usage (Arabic silently showing English)
3. **No detection** of hardcoded strings bypassing `t()`
4. **No awareness** of where translation issues occur (route, widget, component)
5. **No RTL validation** for layout/alignment issues
6. **No quality scoring** or prioritization of issues

## Decision

We will build a **Multilingual Content Intelligence System** that provides:

1. **Runtime Detection** - Intercept next-intl to capture issues without crashing
2. **Location Awareness** - Track route, layout, widget, component context
3. **Severity Scoring** - Prioritize issues by user impact
4. **RTL Validation** - Detect alignment and overflow issues
5. **Developer Dashboard** - Visual exploration of translation health

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    TRANSLATION INTELLIGENCE                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │  Detection  │    │  Analysis   │    │  Dashboard  │          │
│  │   Engine    │───▶│   Engine    │───▶│     UI      │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│        │                   │                  │                  │
│        ▼                   ▼                  ▼                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │  Collector  │    │   Scorer    │    │   Charts    │          │
│  │  - Missing  │    │  - Blocker  │    │  - Heatmap  │          │
│  │  - Fallback │    │  - High     │    │  - Trends   │          │
│  │  - Hardcode │    │  - Medium   │    │  - Drilldown│          │
│  │  - RTL      │    │  - Low      │    │  - Export   │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                      DATA LAYER (Zustand)                         │
│  - Translation key usage tracking                                 │
│  - Issue records with timestamps                                  │
│  - Historical trends                                              │
│  - Export/import capability                                       │
└──────────────────────────────────────────────────────────────────┘
```

## Consequences

### Positive
- Proactive translation issue detection
- Faster debugging with location context
- Quality metrics for localization health
- RTL validation built-in
- Works in development and production

### Negative
- Runtime overhead (mitigated by sampling in production)
- Additional storage for tracking data
- Complexity in next-intl interception

### Mitigations
- Development-only detailed tracking
- Production sampling mode
- Local storage with TTL cleanup
- Lazy-loaded dashboard components

## Implementation Phases

1. **Phase 1 (MVP)**: Detection engine + basic store
2. **Phase 2**: Dashboard UI with heatmap
3. **Phase 3**: RTL validation + visual diff
4. **Phase 4**: CI/CD integration + alerts

---

## Related Documents

- [Product Specification](./i18n-intelligence/PRODUCT-SPEC.md)
- [Data Model](./i18n-intelligence/DATA-MODEL.md)
- [Detection Engine](./i18n-intelligence/DETECTION-ENGINE.md)
- [Dashboard UI Design](./i18n-intelligence/DASHBOARD-UI.md)
