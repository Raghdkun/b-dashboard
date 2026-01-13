/**
 * i18n Intelligence System - Type Exports
 */

// Enums and constants
export {
  type IssueSeverity,
  type IssueType,
  type ConfidenceLevel,
  type ComponentType,
  type SupportedLocale,
  type IssueStatus,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  SEVERITY_THRESHOLDS,
  ROUTE_IMPORTANCE,
  COMPONENT_IMPORTANCE,
} from "./enums";

// Usage tracking types
export {
  type TranslationLocation,
  type TranslationUsageEvent,
  type TranslationKeyUsage,
  createKeyUsage,
} from "./usage.types";

// Issue types
export {
  type BaseTranslationIssue,
  type MissingTranslationIssue,
  type FallbackUsageIssue,
  type HardcodedStringIssue,
  type OverflowIssue,
  type RTLLayoutIssue,
  type TranslationIssue,
  type IssueFilters,
  type IssueSortOptions,
  createIssueId,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
} from "./issues.types";

// Health metrics types
export {
  type LocaleHealthMetrics,
  type RouteHealthMetrics,
  type NamespaceHealthMetrics,
  type TranslationHealthSummary,
  type HealthDataPoint,
  type TrendData,
  createEmptyLocaleMetrics,
  createEmptyRouteMetrics,
  createEmptyHealthSummary,
} from "./health.types";

// Store types
export {
  type DetectionConfig,
  type DashboardUIState,
  type I18nIntelligenceState,
  type I18nIntelligenceActions,
  type I18nIntelligenceStore,
  DEFAULT_DETECTION_CONFIG,
  DEFAULT_UI_STATE,
} from "./store.types";
