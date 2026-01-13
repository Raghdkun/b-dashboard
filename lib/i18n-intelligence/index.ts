/**
 * i18n Intelligence System
 *
 * Runtime translation issue detection and tracking for B-Dashboard
 *
 * @module lib/i18n-intelligence
 */

// Types
export * from "./types";

// Schemas
export * from "./schemas";

// Store
export {
  useI18nIntelligenceStore,
  selectConfig,
  selectIssues,
  selectHealthSummary,
  selectUI,
  selectIsDetecting,
  selectActiveLocale,
  selectError,
  selectTotalIssues,
  selectCriticalIssues,
  selectOpenIssues,
  selectFilteredIssues,
} from "./store";

// Utils
export * from "./utils";

// Analyzers
export {
  // Issue factories
  createMissingTranslationIssue,
  createFallbackUsageIssue,
  createDefaultLocation,
  // Context
  TranslationTrackingProvider,
  useTranslationLocation,
  withTranslationTracking,
  // Error interceptors
  createOnErrorHandler,
  createGetMessageFallbackHandler,
  createI18nIntelligenceConfig,
  processMissingTranslation,
  processFallbackUsage,
  getPendingServerIssues,
  // Tracking hook
  useTranslationsWithTracking,
  useTranslations,
  useTranslationsOriginal,
} from "./analyzers";

// ESLint Integration is NOT exported here because it uses Node.js APIs (fs, path)
// that can't be bundled for the browser. Import directly from "./eslint" if needed:
// import { plugin, analyzeHardcodedStrings } from "@/lib/i18n-intelligence/eslint";
