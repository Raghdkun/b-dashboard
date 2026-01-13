# Multilingual Content Intelligence System
## Translation Intelligence Data Model

**Version:** 1.0.0  
**Date:** 2026-01-13  
**Status:** Draft

---

## Overview

This document defines the TypeScript interfaces for the Translation Intelligence system. The model captures:
- Translation key usage and context
- Missing/fallback/hardcoded issues
- RTL layout problems
- Health metrics and trends

---

## Core Types

### Base Enums & Constants

```typescript
// lib/i18n-intelligence/types/enums.ts

/**
 * Severity levels for translation issues
 */
export type IssueSeverity = 'blocker' | 'high' | 'medium' | 'low';

/**
 * Types of translation issues detected
 */
export type IssueType = 
  | 'missing'           // Key not found in locale file
  | 'fallback'          // Using fallback locale (e.g., ar showing en)
  | 'hardcoded'         // String not using t() function
  | 'overflow'          // Text too long for container
  | 'rtl-alignment'     // RTL layout issue
  | 'rtl-direction'     // Text direction issue
  | 'pluralization'     // Plural form missing
  | 'interpolation'     // Dynamic value issue
  | 'unused';           // Key exists but never used

/**
 * Confidence level in issue detection
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Component types for context
 */
export type ComponentType = 
  | 'button'
  | 'link'
  | 'heading'
  | 'label'
  | 'paragraph'
  | 'tooltip'
  | 'placeholder'
  | 'error-message'
  | 'success-message'
  | 'table-header'
  | 'table-cell'
  | 'menu-item'
  | 'badge'
  | 'widget-title'
  | 'widget-content'
  | 'unknown';

/**
 * Supported locales (from i18n config)
 */
export type SupportedLocale = 'en' | 'ar';

/**
 * Issue status for tracking
 */
export type IssueStatus = 
  | 'open'              // Newly detected, unresolved
  | 'acknowledged'      // Seen by developer
  | 'in-progress'       // Being worked on
  | 'resolved'          // Fixed
  | 'wont-fix'          // Intentional, ignored
  | 'false-positive';   // Incorrectly detected
```

---

## Translation Key Usage Tracking

```typescript
// lib/i18n-intelligence/types/usage.types.ts

import type { SupportedLocale, ComponentType } from './enums';

/**
 * Location context where a translation key is used
 */
export interface TranslationLocation {
  /** Route path where the key is used */
  route: string;
  
  /** Layout group (e.g., "(dashboard)", "(auth)") */
  layoutGroup?: string;
  
  /** Page component name */
  page?: string;
  
  /** Widget ID if inside a widget */
  widgetId?: string;
  
  /** Component name where t() was called */
  componentName: string;
  
  /** File path (for dev mode only) */
  filePath?: string;
  
  /** Line number (for dev mode only) */
  lineNumber?: number;
}

/**
 * Single usage event of a translation key
 */
export interface TranslationUsageEvent {
  /** Unique event ID */
  id: string;
  
  /** Translation key that was used */
  key: string;
  
  /** Namespace (e.g., "dashboard", "common") */
  namespace: string;
  
  /** Full key path (namespace.key) */
  fullKey: string;
  
  /** Locale that was requested */
  locale: SupportedLocale;
  
  /** Whether a fallback was used */
  usedFallback: boolean;
  
  /** Fallback locale if used */
  fallbackLocale?: SupportedLocale;
  
  /** Resolved value (the actual string shown) */
  resolvedValue: string;
  
  /** Location context */
  location: TranslationLocation;
  
  /** Component type for severity scoring */
  componentType: ComponentType;
  
  /** Timestamp of usage */
  timestamp: number;
  
  /** User role if available */
  userRole?: string;
}

/**
 * Aggregated usage statistics for a key
 */
export interface TranslationKeyUsage {
  /** Full key path */
  fullKey: string;
  
  /** Namespace */
  namespace: string;
  
  /** Key within namespace */
  key: string;
  
  /** Total render count */
  renderCount: number;
  
  /** Render count per locale */
  renderCountByLocale: Record<SupportedLocale, number>;
  
  /** Unique routes where used */
  routes: string[];
  
  /** Unique components where used */
  components: string[];
  
  /** Widget IDs where used */
  widgetIds: string[];
  
  /** First seen timestamp */
  firstSeen: number;
  
  /** Last seen timestamp */
  lastSeen: number;
  
  /** Component types where used */
  componentTypes: ComponentType[];
  
  /** Primary component type (most frequent) */
  primaryComponentType: ComponentType;
  
  /** User roles that have seen this key */
  seenByRoles: string[];
}
```

---

## Issue Records

```typescript
// lib/i18n-intelligence/types/issues.types.ts

import type { 
  IssueSeverity, 
  IssueType, 
  ConfidenceLevel, 
  IssueStatus,
  ComponentType,
  SupportedLocale 
} from './enums';
import type { TranslationLocation } from './usage.types';

/**
 * Base interface for all issue types
 */
export interface BaseTranslationIssue {
  /** Unique issue ID */
  id: string;
  
  /** Type of issue */
  type: IssueType;
  
  /** Calculated severity */
  severity: IssueSeverity;
  
  /** Severity score (0-100) */
  severityScore: number;
  
  /** Detection confidence */
  confidence: ConfidenceLevel;
  
  /** Current status */
  status: IssueStatus;
  
  /** First detection timestamp */
  firstDetected: number;
  
  /** Last occurrence timestamp */
  lastSeen: number;
  
  /** Occurrence count */
  occurrenceCount: number;
  
  /** Primary location where issue occurs */
  location: TranslationLocation;
  
  /** All locations where issue occurs */
  allLocations: TranslationLocation[];
  
  /** Human-readable description */
  description: string;
  
  /** Suggested fix */
  suggestedFix?: string;
  
  /** Related documentation link */
  docsUrl?: string;
}

/**
 * Missing translation key issue
 */
export interface MissingTranslationIssue extends BaseTranslationIssue {
  type: 'missing';
  
  /** The missing key */
  key: string;
  
  /** Namespace */
  namespace: string;
  
  /** Full key path */
  fullKey: string;
  
  /** Locales where the key is missing */
  missingInLocales: SupportedLocale[];
  
  /** Locales where the key exists */
  existsInLocales: SupportedLocale[];
  
  /** Value in fallback locale (if any) */
  fallbackValue?: string;
  
  /** Component type for context */
  componentType: ComponentType;
}

/**
 * Fallback usage issue (e.g., Arabic showing English)
 */
export interface FallbackUsageIssue extends BaseTranslationIssue {
  type: 'fallback';
  
  /** The key that fell back */
  key: string;
  
  /** Full key path */
  fullKey: string;
  
  /** Requested locale */
  requestedLocale: SupportedLocale;
  
  /** Actual locale used */
  fallbackLocale: SupportedLocale;
  
  /** Value shown (from fallback) */
  shownValue: string;
  
  /** Expected value (if known) */
  expectedValue?: string;
  
  /** Component type */
  componentType: ComponentType;
}

/**
 * Hardcoded string detection
 */
export interface HardcodedStringIssue extends BaseTranslationIssue {
  type: 'hardcoded';
  
  /** The hardcoded string detected */
  detectedString: string;
  
  /** Word count */
  wordCount: number;
  
  /** File path */
  filePath: string;
  
  /** Line number */
  lineNumber: number;
  
  /** Column number */
  columnNumber?: number;
  
  /** Surrounding code context */
  codeContext?: string;
  
  /** Suggested key name */
  suggestedKey?: string;
  
  /** Suggested namespace */
  suggestedNamespace?: string;
  
  /** Whether it's likely a brand name (lower confidence) */
  likelyBrandName: boolean;
}

/**
 * Text overflow/truncation issue
 */
export interface OverflowIssue extends BaseTranslationIssue {
  type: 'overflow';
  
  /** Key with overflow */
  key: string;
  
  /** Full key path */
  fullKey: string;
  
  /** Locale with overflow */
  locale: SupportedLocale;
  
  /** Container width (px) */
  containerWidth: number;
  
  /** Text width (px) */
  textWidth: number;
  
  /** Overflow amount (px) */
  overflowAmount: number;
  
  /** Character count */
  characterCount: number;
  
  /** Recommended max characters */
  recommendedMaxChars?: number;
  
  /** The overflowing text */
  text: string;
}

/**
 * RTL layout issue
 */
export interface RTLLayoutIssue extends BaseTranslationIssue {
  type: 'rtl-alignment' | 'rtl-direction';
  
  /** Component name with issue */
  componentName: string;
  
  /** CSS property causing issue */
  cssProperty?: string;
  
  /** Current value */
  currentValue?: string;
  
  /** Recommended value */
  recommendedValue?: string;
  
  /** Screenshot reference (for visual diff) */
  screenshotLtr?: string;
  
  /** Screenshot reference (for visual diff) */
  screenshotRtl?: string;
  
  /** Detailed explanation */
  explanation: string;
}

/**
 * Union type for all issues
 */
export type TranslationIssue = 
  | MissingTranslationIssue
  | FallbackUsageIssue
  | HardcodedStringIssue
  | OverflowIssue
  | RTLLayoutIssue;

/**
 * Issue filter options
 */
export interface IssueFilters {
  types?: IssueType[];
  severities?: IssueSeverity[];
  statuses?: IssueStatus[];
  locales?: SupportedLocale[];
  routes?: string[];
  components?: string[];
  namespaces?: string[];
  searchQuery?: string;
  dateRange?: {
    start: number;
    end: number;
  };
}

/**
 * Issue sorting options
 */
export interface IssueSortOptions {
  field: 'severity' | 'lastSeen' | 'occurrenceCount' | 'firstDetected';
  direction: 'asc' | 'desc';
}
```

---

## Health Metrics

```typescript
// lib/i18n-intelligence/types/health.types.ts

import type { SupportedLocale, IssueType, IssueSeverity } from './enums';

/**
 * Health metrics for a single locale
 */
export interface LocaleHealthMetrics {
  /** Locale code */
  locale: SupportedLocale;
  
  /** Total keys in this locale */
  totalKeys: number;
  
  /** Keys that are translated */
  translatedKeys: number;
  
  /** Coverage percentage (0-100) */
  coverage: number;
  
  /** Issue breakdown by type */
  issuesByType: Record<IssueType, number>;
  
  /** Issue breakdown by severity */
  issuesBySeverity: Record<IssueSeverity, number>;
  
  /** Total open issues */
  openIssues: number;
  
  /** Health score (0-100) */
  healthScore: number;
  
  /** Last full analysis timestamp */
  lastAnalysis: number;
}

/**
 * Health metrics for a route
 */
export interface RouteHealthMetrics {
  /** Route path */
  route: string;
  
  /** Total keys used on this route */
  totalKeys: number;
  
  /** Issues on this route */
  issues: number;
  
  /** Health score (0-100) */
  healthScore: number;
  
  /** Breakdown by locale */
  byLocale: Record<SupportedLocale, {
    issues: number;
    healthScore: number;
  }>;
}

/**
 * Health metrics for a widget
 */
export interface WidgetHealthMetrics {
  /** Widget ID */
  widgetId: string;
  
  /** Widget type */
  widgetType: string;
  
  /** Total keys used */
  totalKeys: number;
  
  /** Issues count */
  issues: number;
  
  /** Health score */
  healthScore: number;
}

/**
 * Overall translation health summary
 */
export interface TranslationHealthSummary {
  /** Overall health score (0-100) */
  overallScore: number;
  
  /** Score change from previous period */
  scoreChange: number;
  
  /** Total translation keys */
  totalKeys: number;
  
  /** Total issues */
  totalIssues: number;
  
  /** Issues by severity */
  issuesBySeverity: Record<IssueSeverity, number>;
  
  /** Issues by type */
  issuesByType: Record<IssueType, number>;
  
  /** Per-locale metrics */
  localeMetrics: Record<SupportedLocale, LocaleHealthMetrics>;
  
  /** Top problematic routes */
  topProblematicRoutes: RouteHealthMetrics[];
  
  /** Top problematic widgets */
  topProblematicWidgets: WidgetHealthMetrics[];
  
  /** Analysis metadata */
  analysis: {
    /** When analysis was performed */
    timestamp: number;
    
    /** Duration of analysis (ms) */
    duration: number;
    
    /** Routes analyzed */
    routesAnalyzed: number;
    
    /** Components analyzed */
    componentsAnalyzed: number;
    
    /** Analysis mode */
    mode: 'full' | 'incremental' | 'realtime';
  };
}

/**
 * Historical health data point
 */
export interface HealthHistoryPoint {
  timestamp: number;
  overallScore: number;
  totalIssues: number;
  issuesBySeverity: Record<IssueSeverity, number>;
  localeScores: Record<SupportedLocale, number>;
}

/**
 * Health trend data
 */
export interface HealthTrend {
  /** Time period */
  period: 'day' | 'week' | 'month';
  
  /** Data points */
  dataPoints: HealthHistoryPoint[];
  
  /** Trend direction */
  trend: 'improving' | 'stable' | 'declining';
  
  /** Change percentage */
  changePercent: number;
}
```

---

## Store State

```typescript
// lib/i18n-intelligence/types/store.types.ts

import type { 
  TranslationKeyUsage, 
  TranslationUsageEvent 
} from './usage.types';
import type { 
  TranslationIssue, 
  IssueFilters, 
  IssueSortOptions 
} from './issues.types';
import type { 
  TranslationHealthSummary, 
  HealthHistoryPoint 
} from './health.types';

/**
 * Analysis configuration
 */
export interface AnalysisConfig {
  /** Enable runtime tracking */
  enabled: boolean;
  
  /** Track in production (sampling) */
  productionMode: boolean;
  
  /** Sample rate in production (0-1) */
  sampleRate: number;
  
  /** Track file paths (dev only) */
  trackFilePaths: boolean;
  
  /** Track code context (dev only) */
  trackCodeContext: boolean;
  
  /** Maximum events to store */
  maxEvents: number;
  
  /** Event TTL (ms) */
  eventTtl: number;
  
  /** Minimum words for hardcoded detection */
  hardcodedMinWords: number;
  
  /** Auto-analyze on navigation */
  autoAnalyze: boolean;
}

/**
 * Main store state
 */
export interface TranslationIntelligenceState {
  /** Configuration */
  config: AnalysisConfig;
  
  /** Whether analysis is running */
  isAnalyzing: boolean;
  
  /** Analysis progress (0-100) */
  analysisProgress: number;
  
  /** Current analysis route */
  currentAnalysisRoute?: string;
  
  /** Usage tracking data */
  keyUsage: Record<string, TranslationKeyUsage>;
  
  /** Recent usage events (circular buffer) */
  recentEvents: TranslationUsageEvent[];
  
  /** Detected issues */
  issues: TranslationIssue[];
  
  /** Current filters */
  filters: IssueFilters;
  
  /** Current sort */
  sort: IssueSortOptions;
  
  /** Health summary */
  healthSummary: TranslationHealthSummary | null;
  
  /** Health history */
  healthHistory: HealthHistoryPoint[];
  
  /** Last full analysis */
  lastFullAnalysis: number | null;
  
  /** Error state */
  error: string | null;
}

/**
 * Store actions
 */
export interface TranslationIntelligenceActions {
  // Configuration
  setConfig: (config: Partial<AnalysisConfig>) => void;
  
  // Analysis
  startAnalysis: (mode: 'full' | 'incremental') => Promise<void>;
  stopAnalysis: () => void;
  analyzeRoute: (route: string) => Promise<void>;
  
  // Event tracking
  trackUsage: (event: Omit<TranslationUsageEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  
  // Issue management
  updateIssueStatus: (id: string, status: TranslationIssue['status']) => void;
  dismissIssue: (id: string, reason: 'wont-fix' | 'false-positive') => void;
  resolveIssue: (id: string) => void;
  
  // Filtering
  setFilters: (filters: Partial<IssueFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: IssueSortOptions) => void;
  
  // Export
  exportIssues: (format: 'json' | 'csv' | 'markdown') => string;
  exportReport: () => TranslationHealthSummary;
  
  // Reset
  reset: () => void;
}
```

---

## Zod Validation Schemas

```typescript
// lib/i18n-intelligence/schemas/index.ts

import { z } from 'zod';

export const IssueSeveritySchema = z.enum(['blocker', 'high', 'medium', 'low']);

export const IssueTypeSchema = z.enum([
  'missing',
  'fallback',
  'hardcoded',
  'overflow',
  'rtl-alignment',
  'rtl-direction',
  'pluralization',
  'interpolation',
  'unused'
]);

export const ConfidenceLevelSchema = z.enum(['high', 'medium', 'low']);

export const IssueStatusSchema = z.enum([
  'open',
  'acknowledged',
  'in-progress',
  'resolved',
  'wont-fix',
  'false-positive'
]);

export const SupportedLocaleSchema = z.enum(['en', 'ar']);

export const TranslationLocationSchema = z.object({
  route: z.string(),
  layoutGroup: z.string().optional(),
  page: z.string().optional(),
  widgetId: z.string().optional(),
  componentName: z.string(),
  filePath: z.string().optional(),
  lineNumber: z.number().optional(),
});

export const AnalysisConfigSchema = z.object({
  enabled: z.boolean().default(true),
  productionMode: z.boolean().default(false),
  sampleRate: z.number().min(0).max(1).default(0.1),
  trackFilePaths: z.boolean().default(true),
  trackCodeContext: z.boolean().default(false),
  maxEvents: z.number().default(1000),
  eventTtl: z.number().default(24 * 60 * 60 * 1000), // 24 hours
  hardcodedMinWords: z.number().default(3),
  autoAnalyze: z.boolean().default(true),
});

export const IssueFiltersSchema = z.object({
  types: z.array(IssueTypeSchema).optional(),
  severities: z.array(IssueSeveritySchema).optional(),
  statuses: z.array(IssueStatusSchema).optional(),
  locales: z.array(SupportedLocaleSchema).optional(),
  routes: z.array(z.string()).optional(),
  components: z.array(z.string()).optional(),
  namespaces: z.array(z.string()).optional(),
  searchQuery: z.string().optional(),
  dateRange: z.object({
    start: z.number(),
    end: z.number(),
  }).optional(),
});
```

---

## Runtime Event Collection

### Client vs Server Collection

| Aspect | Client-Side | Server-Side |
|--------|-------------|-------------|
| **When** | Component render | RSC render |
| **Access** | Limited (no file paths) | Full (file paths, line numbers) |
| **Performance** | Must be lightweight | Can do more processing |
| **Storage** | localStorage + IndexedDB | API endpoint + database |
| **Privacy** | User session only | Aggregated, anonymized |

### Collection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT COMPONENT                             │
│                                                                  │
│  const t = useTranslations('dashboard');                        │
│  return <h1>{t('title')}</h1>                                   │
│                        │                                         │
│                        ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Intercepted useTranslations hook                          │   │
│  │ - Wraps original t() function                             │   │
│  │ - Tracks: key, locale, resolved value, fallback status    │   │
│  │ - Captures: route (from usePathname), component name      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                        │                                         │
│                        ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Event Collector                                           │   │
│  │ - Batches events (debounced)                              │   │
│  │ - Deduplicates by key+route                               │   │
│  │ - Samples in production mode                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                        │                                         │
│                        ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Zustand Store                                             │   │
│  │ - Persists to localStorage                                │   │
│  │ - Calculates aggregates                                   │   │
│  │ - Triggers issue detection                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Privacy & Performance Considerations

### Privacy

1. **No PII**: Never track user-entered content, only translation keys
2. **Anonymization**: User roles are generic ("admin", "user"), not user IDs
3. **Local-first**: Data stays in browser unless explicitly exported
4. **Opt-out**: Config flag to disable tracking entirely
5. **TTL cleanup**: Events expire after configurable period

### Performance

1. **Sampling**: Production mode uses 10% sampling by default
2. **Debouncing**: Events batched every 100ms
3. **Deduplication**: Same key+route tracked once per session
4. **Lazy loading**: Dashboard components code-split
5. **Virtual lists**: Large issue lists use virtualization
6. **Memory limits**: Circular buffer with max 1000 events
7. **Web Workers**: Heavy analysis offloaded to worker (optional)

### Storage Estimates

| Data Type | Approx Size | TTL |
|-----------|-------------|-----|
| Usage event | ~200 bytes | 24h |
| Key usage aggregate | ~500 bytes | 7d |
| Issue record | ~1 KB | Until resolved |
| Health summary | ~5 KB | 30d |

**Max storage**: ~10 MB in localStorage/IndexedDB

---

## Next Steps

1. **Detection Engine** → [DETECTION-ENGINE.md](./DETECTION-ENGINE.md)
2. **Implementation** → TypeScript files in `lib/i18n-intelligence/`
