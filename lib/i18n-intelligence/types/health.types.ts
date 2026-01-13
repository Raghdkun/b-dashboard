/**
 * i18n Intelligence System - Health Metrics Types
 */

import type { IssueSeverity, IssueType, SupportedLocale } from "./enums";

/**
 * Metrics for a single locale
 */
export interface LocaleHealthMetrics {
  /** Locale code */
  locale: SupportedLocale;

  /** Total keys in use */
  totalKeysUsed: number;

  /** Keys with issues */
  keysWithIssues: number;

  /** Missing keys count */
  missingKeys: number;

  /** Fallback usages count */
  fallbackUsages: number;

  /** Coverage percentage (0-100) */
  coveragePercentage: number;

  /** Health score (0-100) */
  healthScore: number;

  /** Issues by severity */
  issuesBySeverity: Record<IssueSeverity, number>;

  /** Last updated timestamp */
  lastUpdated: number;
}

/**
 * Metrics for a specific route
 */
export interface RouteHealthMetrics {
  /** Route path */
  route: string;

  /** Route display name */
  displayName: string;

  /** Total translation usages */
  totalUsages: number;

  /** Unique keys used */
  uniqueKeys: number;

  /** Issue count */
  issueCount: number;

  /** Health score (0-100) */
  healthScore: number;

  /** Issues by type */
  issuesByType: Record<IssueType, number>;

  /** Namespaces used on this route */
  namespacesUsed: string[];

  /** Last visited timestamp */
  lastVisited: number;
}

/**
 * Metrics for a namespace
 */
export interface NamespaceHealthMetrics {
  /** Namespace name */
  namespace: string;

  /** Total keys defined */
  totalKeysDefined: number;

  /** Keys in use */
  keysInUse: number;

  /** Unused keys count */
  unusedKeys: number;

  /** Missing keys count */
  missingKeys: number;

  /** Health score (0-100) */
  healthScore: number;

  /** Usage by route */
  usageByRoute: Record<string, number>;

  /** Last usage timestamp */
  lastUsed: number;
}

/**
 * Overall translation health summary
 */
export interface TranslationHealthSummary {
  /** Overall health score (0-100) */
  overallScore: number;

  /** Health trend direction */
  trend: "improving" | "stable" | "declining";

  /** Trend percentage change */
  trendPercentage: number;

  /** Total issues */
  totalIssues: number;

  /** Critical issues */
  criticalIssues: number;

  /** Issues by severity */
  issuesBySeverity: Record<IssueSeverity, number>;

  /** Issues by type */
  issuesByType: Record<IssueType, number>;

  /** Locale metrics */
  localeMetrics: Partial<Record<SupportedLocale, LocaleHealthMetrics>>;

  /** Top problematic routes */
  problematicRoutes: RouteHealthMetrics[];

  /** Top problematic namespaces */
  problematicNamespaces: NamespaceHealthMetrics[];

  /** Total translation usages tracked */
  totalUsagesTracked: number;

  /** Unique keys tracked */
  uniqueKeysTracked: number;

  /** Data freshness timestamp */
  dataFreshnessTimestamp: number;

  /** Session start timestamp */
  sessionStartTimestamp: number;
}

/**
 * Time series data point for trend charts
 */
export interface HealthDataPoint {
  timestamp: number;
  score: number;
  issueCount: number;
  criticalCount: number;
}

/**
 * Trend data for a metric
 */
export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  direction: "up" | "down" | "stable";
  dataPoints: HealthDataPoint[];
}

/**
 * Create empty locale metrics
 */
export function createEmptyLocaleMetrics(locale: SupportedLocale): LocaleHealthMetrics {
  return {
    locale,
    totalKeysUsed: 0,
    keysWithIssues: 0,
    missingKeys: 0,
    fallbackUsages: 0,
    coveragePercentage: 100,
    healthScore: 100,
    issuesBySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    },
    lastUpdated: Date.now(),
  };
}

/**
 * Create empty route metrics
 */
export function createEmptyRouteMetrics(route: string): RouteHealthMetrics {
  return {
    route,
    displayName: route,
    totalUsages: 0,
    uniqueKeys: 0,
    issueCount: 0,
    healthScore: 100,
    issuesByType: {
      missing: 0,
      fallback: 0,
      hardcoded: 0,
      overflow: 0,
      "rtl-alignment": 0,
      "rtl-direction": 0,
    },
    namespacesUsed: [],
    lastVisited: Date.now(),
  };
}

/**
 * Create empty health summary
 */
export function createEmptyHealthSummary(): TranslationHealthSummary {
  return {
    overallScore: 100,
    trend: "stable",
    trendPercentage: 0,
    totalIssues: 0,
    criticalIssues: 0,
    issuesBySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    },
    issuesByType: {
      missing: 0,
      fallback: 0,
      hardcoded: 0,
      overflow: 0,
      "rtl-alignment": 0,
      "rtl-direction": 0,
    },
    localeMetrics: {},
    problematicRoutes: [],
    problematicNamespaces: [],
    totalUsagesTracked: 0,
    uniqueKeysTracked: 0,
    dataFreshnessTimestamp: Date.now(),
    sessionStartTimestamp: Date.now(),
  };
}
