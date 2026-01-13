/**
 * i18n Intelligence System - Issue Types
 */

import type {
  IssueSeverity,
  IssueType,
  ConfidenceLevel,
  IssueStatus,
  ComponentType,
  SupportedLocale,
} from "./enums";
import type { TranslationLocation } from "./usage.types";

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
  type: "missing";

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
  type: "fallback";

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
  type: "hardcoded";

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
  type: "overflow";

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
  type: "rtl-alignment" | "rtl-direction";

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
  field: "severity" | "lastSeen" | "occurrenceCount" | "firstDetected";
  direction: "asc" | "desc";
}

/**
 * Create a unique issue ID
 */
export function createIssueId(type: IssueType, key: string, locale?: string): string {
  const base = `${type}:${key}`;
  return locale ? `${base}:${locale}` : base;
}

/**
 * Default issue filters
 */
export const DEFAULT_FILTERS: IssueFilters = {
  types: undefined,
  severities: undefined,
  statuses: ["open", "acknowledged", "in-progress"],
  locales: undefined,
  routes: undefined,
  components: undefined,
  namespaces: undefined,
  searchQuery: undefined,
  dateRange: undefined,
};

/**
 * Default issue sort
 */
export const DEFAULT_SORT: IssueSortOptions = {
  field: "severity",
  direction: "desc",
};
