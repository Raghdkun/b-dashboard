/**
 * i18n Intelligence System - Issue Factories
 *
 * Creates standardized issue objects for different issue types
 */

import type {
  MissingTranslationIssue,
  FallbackUsageIssue,
  TranslationLocation,
  SupportedLocale,
  ComponentType,
} from "../types";
import { createIssueId } from "../types";
import { calculateIssueSeverity } from "../utils/severity-scorer";

/**
 * Create a missing translation issue
 */
export function createMissingTranslationIssue(params: {
  key: string;
  namespace: string;
  fullKey: string;
  locale: SupportedLocale;
  location: TranslationLocation;
  fallbackValue?: string;
}): MissingTranslationIssue {
  const { key, namespace, fullKey, locale, location, fallbackValue } = params;
  const { score, severity } = calculateIssueSeverity("missing", location, 1);

  return {
    id: createIssueId("missing", fullKey, locale),
    type: "missing",
    severity,
    severityScore: score,
    confidence: "high",
    status: "open",
    firstDetected: Date.now(),
    lastSeen: Date.now(),
    occurrenceCount: 1,
    location,
    allLocations: [location],
    description: `Translation key "${fullKey}" is missing for locale "${locale}"`,
    suggestedFix: `Add the key "${key}" to the "${namespace}" namespace in ${locale}.json`,
    key,
    namespace,
    fullKey,
    missingInLocales: [locale],
    existsInLocales: locale === "ar" ? ["en"] : [],
    fallbackValue,
    componentType: location.componentType,
  };
}

/**
 * Create a fallback usage issue
 */
export function createFallbackUsageIssue(params: {
  key: string;
  fullKey: string;
  requestedLocale: SupportedLocale;
  fallbackLocale: SupportedLocale;
  shownValue: string;
  location: TranslationLocation;
}): FallbackUsageIssue {
  const { key, fullKey, requestedLocale, fallbackLocale, shownValue, location } =
    params;
  const { score, severity } = calculateIssueSeverity("fallback", location, 1);

  return {
    id: createIssueId("fallback", fullKey, requestedLocale),
    type: "fallback",
    severity,
    severityScore: score,
    confidence: "high",
    status: "open",
    firstDetected: Date.now(),
    lastSeen: Date.now(),
    occurrenceCount: 1,
    location,
    allLocations: [location],
    description: `Translation "${fullKey}" for "${requestedLocale}" is showing "${fallbackLocale}" fallback: "${shownValue}"`,
    suggestedFix: `Add translation for "${key}" in ${requestedLocale}.json`,
    key,
    fullKey,
    requestedLocale,
    fallbackLocale,
    shownValue,
    componentType: location.componentType,
  };
}

/**
 * Create a default location when context is unknown
 */
export function createDefaultLocation(
  route?: string,
  componentName?: string,
  componentType?: ComponentType
): TranslationLocation {
  return {
    route: route || "/unknown",
    componentName: componentName || "Unknown",
    componentType: componentType || "other",
  };
}
