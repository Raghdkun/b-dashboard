/**
 * i18n Intelligence System - Usage Tracking Types
 */

import type { SupportedLocale, ComponentType } from "./enums";

/**
 * Location context where a translation key is used
 */
export interface TranslationLocation {
  /** Route path where the key is used */
  route: string;

  /** Component name where t() was called */
  componentName: string;

  /** Component type for severity scoring */
  componentType: ComponentType;

  /** Widget ID if inside a widget */
  widgetId?: string;

  /** File path (for dev mode only) */
  fileHint?: string;

  /** Line number (for dev mode only) */
  lineHint?: number;
}

/**
 * Single usage event of a translation key
 */
export interface TranslationUsageEvent {
  /** Timestamp of usage */
  timestamp: number;

  /** Full key path (namespace.key) */
  fullKey: string;

  /** Namespace (e.g., "dashboard", "common") */
  namespace: string;

  /** Translation key within namespace */
  key: string;

  /** Locale that was requested */
  locale: SupportedLocale;

  /** Location context */
  location: TranslationLocation;

  /** Whether the translation was resolved successfully */
  resolved: boolean;

  /** Resolved value (the actual string shown) */
  value?: string;

  /** Whether a fallback was used */
  fallbackUsed: boolean;

  /** Fallback locale if used */
  fallbackLocale?: SupportedLocale;

  /** Error message if any */
  errorMessage?: string;
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

  /** First seen timestamp */
  firstSeen: number;

  /** Last seen timestamp */
  lastSeen: number;

  /** Total usage count */
  totalUsages: number;

  /** Usage count per locale */
  usagesByLocale: Partial<Record<SupportedLocale, number>>;

  /** Usage count per route */
  usagesByRoute: Record<string, number>;

  /** All locations where this key is used */
  locations: TranslationLocation[];

  /** Whether this key has any issues */
  hasIssues: boolean;

  /** IDs of associated issues */
  issueIds: string[];
}

/**
 * Factory to create a new key usage record
 */
export function createKeyUsage(
  fullKey: string,
  namespace: string,
  key: string
): TranslationKeyUsage {
  return {
    fullKey,
    namespace,
    key,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    totalUsages: 0,
    usagesByLocale: {},
    usagesByRoute: {},
    locations: [],
    hasIssues: false,
    issueIds: [],
  };
}
