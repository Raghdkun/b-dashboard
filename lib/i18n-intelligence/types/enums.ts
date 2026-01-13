/**
 * i18n Intelligence System - Enums and Constants
 */

/**
 * Severity levels for translation issues
 */
export type IssueSeverity = "critical" | "high" | "medium" | "low" | "info";

/**
 * Types of translation issues detected
 */
export type IssueType =
  | "missing" // Key not found in locale file
  | "fallback" // Using fallback locale (e.g., ar showing en)
  | "hardcoded" // String not using t() function
  | "overflow" // Text too long for container
  | "rtl-alignment" // RTL layout issue
  | "rtl-direction"; // Text direction issue

/**
 * Confidence level in issue detection
 */
export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * Component types for context and scoring
 */
export type ComponentType =
  | "page"
  | "widget"
  | "modal"
  | "navigation"
  | "form"
  | "table"
  | "card"
  | "button"
  | "label"
  | "tooltip"
  | "notification"
  | "error"
  | "other";

/**
 * Supported locales (matches i18n config)
 */
export type SupportedLocale = "en" | "ar";

/**
 * All supported locales array
 */
export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "ar"];

/**
 * Default locale for fallback
 */
export const DEFAULT_LOCALE: SupportedLocale = "en";

/**
 * Issue status for tracking
 */
export type IssueStatus =
  | "open" // Newly detected, unresolved
  | "acknowledged" // Seen by developer
  | "in-progress" // Being worked on
  | "resolved" // Fixed
  | "wont-fix" // Intentional, ignored
  | "false-positive"; // Incorrectly detected

/**
 * Severity score ranges
 */
export const SEVERITY_THRESHOLDS = {
  critical: 80,
  high: 60,
  medium: 40,
  low: 20,
  info: 0,
} as const;

/**
 * Route importance scores (higher = more important)
 */
export const ROUTE_IMPORTANCE: Record<string, number> = {
  "/": 1.5,
  "/dashboard": 1.5,
  "/auth/login": 1.8,
  "/auth/register": 1.7,
  "/dashboard/users": 1.3,
  "/dashboard/settings": 1.2,
  "/dashboard/settings/profile": 1.1,
  "/dashboard/settings/themes": 1.0,
};

/**
 * Component type importance scores (multipliers)
 */
export const COMPONENT_IMPORTANCE: Record<ComponentType, number> = {
  page: 1.5,
  widget: 1.3,
  modal: 1.4,
  navigation: 1.6,
  form: 1.3,
  table: 1.2,
  card: 1.1,
  button: 1.2,
  label: 1.0,
  tooltip: 0.8,
  notification: 1.5,
  error: 1.6,
  other: 1.0,
};
