/**
 * i18n Intelligence System - Analyzers Export
 */

export {
  createMissingTranslationIssue,
  createFallbackUsageIssue,
  createDefaultLocation,
} from "./issue-factories";

export {
  TranslationTrackingProvider,
  useTranslationLocation,
  withTranslationTracking,
  TranslationTrackingCtx,
} from "./translation-context";

export {
  createOnErrorHandler,
  createGetMessageFallbackHandler,
  createI18nIntelligenceConfig,
  processMissingTranslation,
  processFallbackUsage,
  getPendingServerIssues,
} from "./error-interceptor";

export {
  useTranslationsWithTracking,
  useTranslations,
  useTranslationsOriginal,
} from "./use-translations-with-tracking";
