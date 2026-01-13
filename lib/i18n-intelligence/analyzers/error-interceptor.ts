/**
 * i18n Intelligence System - Next-Intl Error Interceptor
 *
 * Intercepts next-intl errors to capture missing translations
 * without crashing the UI
 */

import type { IntlErrorCode } from "next-intl";
import type { SupportedLocale, TranslationLocation } from "../types";
import {
  createMissingTranslationIssue,
  createFallbackUsageIssue,
  createDefaultLocation,
} from "./issue-factories";
import { useI18nIntelligenceStore } from "../store";

/**
 * Error event from next-intl
 * Extended with originalMessage for key extraction
 */
interface IntlError {
  code: IntlErrorCode;
  message: string;
  originalMessage?: string;
}

/**
 * Store reference for server-side error handling
 * Note: On server, we queue events to be processed client-side
 */
let pendingServerIssues: Array<{
  type: "missing" | "fallback";
  key: string;
  namespace: string;
  locale: SupportedLocale;
  fallbackValue?: string;
}> = [];

/**
 * Get pending server issues (for hydration)
 */
export function getPendingServerIssues() {
  const issues = [...pendingServerIssues];
  pendingServerIssues = [];
  return issues;
}

/**
 * Queue an issue for client-side processing
 */
function queueServerIssue(issue: (typeof pendingServerIssues)[0]) {
  // Limit queue size to prevent memory issues
  if (pendingServerIssues.length < 100) {
    pendingServerIssues.push(issue);
  }
}

/**
 * Create the onError handler for next-intl
 *
 * This function is called when next-intl encounters an error
 * like a missing translation key
 *
 * Note: next-intl onError only receives the error object.
 * We extract namespace and key from the error message.
 */
export function createOnErrorHandler() {
  return function onError(error: IntlError) {
    // Only handle missing message errors
    if (error.code !== "MISSING_MESSAGE") {
      // Log other errors normally
      console.error("[next-intl]", error.message);
      return;
    }

    // Extract namespace and key from error message
    // Message format: "MISSING_MESSAGE: Could not resolve `namespace.key` in ..."
    // or "MISSING_MESSAGE: Could not resolve `key` in messages for locale `locale`"
    const match = error.message.match(/Could not resolve `([^`]+)` in/);
    if (!match) {
      console.error("[next-intl]", error.message);
      return;
    }

    const fullKey = match[1];
    const parts = fullKey.split(".");
    const key = parts.pop() || fullKey;
    const namespace = parts.length > 0 ? parts.join(".") : "";

    // Extract locale from message
    const localeMatch = error.message.match(/for locale `([^`]+)`/);
    const locale = localeMatch ? localeMatch[1] : "unknown";

    // Queue for client-side processing (server-side can't access store directly)
    queueServerIssue({
      type: "missing",
      key: key || "unknown",
      namespace: namespace || "common",
      locale: locale as SupportedLocale,
    });

    // Don't throw - let next-intl fall back gracefully
  };
}

/**
 * Create the getMessageFallback handler for next-intl
 *
 * This is called when a message is missing and we need to show something
 * Note: namespace can be undefined in next-intl's type
 */
export function createGetMessageFallbackHandler() {
  return function getMessageFallback({
    namespace,
    key,
    error,
  }: {
    namespace?: string;
    key: string;
    error: IntlError;
  }): string {
    const fullKey = namespace ? `${namespace}.${key}` : key;

    // Return the key itself as a visual indicator
    // This makes missing translations obvious in the UI
    return `⚠️ ${fullKey}`;
  };
}

/**
 * Process a missing translation issue (client-side)
 */
export function processMissingTranslation(params: {
  key: string;
  namespace: string;
  locale: SupportedLocale;
  location?: TranslationLocation;
  fallbackValue?: string;
}) {
  const { key, namespace, locale, location, fallbackValue } = params;
  const fullKey = `${namespace}.${key}`;

  // Get store (only works client-side)
  if (typeof window === "undefined") {
    queueServerIssue({
      type: "missing",
      key,
      namespace,
      locale,
      fallbackValue,
    });
    return;
  }

  const store = useI18nIntelligenceStore.getState();

  // Check if detection is enabled
  if (!store.config.enabled || !store.config.detectMissingKeys) {
    return;
  }

  // Check exclusions
  if (store.config.excludedNamespaces.includes(namespace)) {
    return;
  }

  const loc = location || createDefaultLocation();

  if (store.config.excludedRoutes.includes(loc.route)) {
    return;
  }

  // Create and record the issue
  const issue = createMissingTranslationIssue({
    key,
    namespace,
    fullKey,
    locale,
    location: loc,
    fallbackValue,
  });

  store.recordIssue(issue);
}

/**
 * Process a fallback usage (client-side)
 */
export function processFallbackUsage(params: {
  key: string;
  namespace: string;
  requestedLocale: SupportedLocale;
  fallbackLocale: SupportedLocale;
  shownValue: string;
  location?: TranslationLocation;
}) {
  const {
    key,
    namespace,
    requestedLocale,
    fallbackLocale,
    shownValue,
    location,
  } = params;
  const fullKey = `${namespace}.${key}`;

  // Get store (only works client-side)
  if (typeof window === "undefined") {
    queueServerIssue({
      type: "fallback",
      key,
      namespace,
      locale: requestedLocale,
      fallbackValue: shownValue,
    });
    return;
  }

  const store = useI18nIntelligenceStore.getState();

  // Check if detection is enabled
  if (!store.config.enabled || !store.config.detectFallbackUsage) {
    return;
  }

  // Check exclusions
  if (store.config.excludedNamespaces.includes(namespace)) {
    return;
  }

  const loc = location || createDefaultLocation();

  if (store.config.excludedRoutes.includes(loc.route)) {
    return;
  }

  // Create and record the issue
  const issue = createFallbackUsageIssue({
    key,
    fullKey,
    requestedLocale,
    fallbackLocale,
    shownValue,
    location: loc,
  });

  store.recordIssue(issue);
}

/**
 * Create the enhanced next-intl configuration
 */
export function createI18nIntelligenceConfig() {
  return {
    onError: createOnErrorHandler(),
    getMessageFallback: createGetMessageFallbackHandler(),
  };
}
