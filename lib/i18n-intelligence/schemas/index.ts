/**
 * i18n Intelligence System - Zod Validation Schemas
 */

import { z } from "zod";

// ============================================================
// Enum Schemas
// ============================================================

export const IssueSeveritySchema = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "info",
]);

export const IssueTypeSchema = z.enum([
  "missing",
  "fallback",
  "hardcoded",
  "overflow",
  "rtl-alignment",
  "rtl-direction",
]);

export const ConfidenceLevelSchema = z.enum(["low", "medium", "high"]);

export const ComponentTypeSchema = z.enum([
  "page",
  "widget",
  "modal",
  "navigation",
  "form",
  "table",
  "card",
  "button",
  "label",
  "tooltip",
  "notification",
  "error",
  "other",
]);

export const SupportedLocaleSchema = z.enum(["en", "ar"]);

export const IssueStatusSchema = z.enum([
  "open",
  "acknowledged",
  "in-progress",
  "resolved",
  "wont-fix",
  "false-positive",
]);

// ============================================================
// Location & Usage Schemas
// ============================================================

export const TranslationLocationSchema = z.object({
  route: z.string(),
  componentName: z.string(),
  componentType: ComponentTypeSchema,
  widgetId: z.string().optional(),
  fileHint: z.string().optional(),
  lineHint: z.number().optional(),
});

export const TranslationUsageEventSchema = z.object({
  timestamp: z.number(),
  fullKey: z.string(),
  namespace: z.string(),
  key: z.string(),
  locale: SupportedLocaleSchema,
  location: TranslationLocationSchema,
  resolved: z.boolean(),
  value: z.string().optional(),
  fallbackUsed: z.boolean(),
  fallbackLocale: SupportedLocaleSchema.optional(),
  errorMessage: z.string().optional(),
});

export const TranslationKeyUsageSchema = z.object({
  fullKey: z.string(),
  namespace: z.string(),
  key: z.string(),
  firstSeen: z.number(),
  lastSeen: z.number(),
  totalUsages: z.number(),
  usagesByLocale: z.record(SupportedLocaleSchema, z.number()),
  usagesByRoute: z.record(z.string(), z.number()),
  locations: z.array(TranslationLocationSchema),
  hasIssues: z.boolean(),
  issueIds: z.array(z.string()),
});

// ============================================================
// Issue Schemas
// ============================================================

const BaseIssueSchema = z.object({
  id: z.string(),
  severity: IssueSeveritySchema,
  severityScore: z.number().min(0).max(100),
  confidence: ConfidenceLevelSchema,
  status: IssueStatusSchema,
  firstDetected: z.number(),
  lastSeen: z.number(),
  occurrenceCount: z.number().min(1),
  location: TranslationLocationSchema,
  allLocations: z.array(TranslationLocationSchema),
  description: z.string(),
  suggestedFix: z.string().optional(),
  docsUrl: z.string().url().optional(),
});

export const MissingTranslationIssueSchema = BaseIssueSchema.extend({
  type: z.literal("missing"),
  key: z.string(),
  namespace: z.string(),
  fullKey: z.string(),
  missingInLocales: z.array(SupportedLocaleSchema),
  existsInLocales: z.array(SupportedLocaleSchema),
  fallbackValue: z.string().optional(),
  componentType: ComponentTypeSchema,
});

export const FallbackUsageIssueSchema = BaseIssueSchema.extend({
  type: z.literal("fallback"),
  key: z.string(),
  fullKey: z.string(),
  requestedLocale: SupportedLocaleSchema,
  fallbackLocale: SupportedLocaleSchema,
  shownValue: z.string(),
  expectedValue: z.string().optional(),
  componentType: ComponentTypeSchema,
});

export const HardcodedStringIssueSchema = BaseIssueSchema.extend({
  type: z.literal("hardcoded"),
  detectedString: z.string(),
  wordCount: z.number().min(1),
  filePath: z.string(),
  lineNumber: z.number().min(1),
  columnNumber: z.number().min(1).optional(),
  codeContext: z.string().optional(),
  suggestedKey: z.string().optional(),
  suggestedNamespace: z.string().optional(),
  likelyBrandName: z.boolean(),
});

export const OverflowIssueSchema = BaseIssueSchema.extend({
  type: z.literal("overflow"),
  key: z.string(),
  fullKey: z.string(),
  locale: SupportedLocaleSchema,
  containerWidth: z.number().min(0),
  textWidth: z.number().min(0),
  overflowAmount: z.number().min(0),
  characterCount: z.number().min(1),
  recommendedMaxChars: z.number().min(1).optional(),
  text: z.string(),
});

export const RTLLayoutIssueSchema = BaseIssueSchema.extend({
  type: z.enum(["rtl-alignment", "rtl-direction"]),
  componentName: z.string(),
  cssProperty: z.string().optional(),
  currentValue: z.string().optional(),
  recommendedValue: z.string().optional(),
  screenshotLtr: z.string().optional(),
  screenshotRtl: z.string().optional(),
  explanation: z.string(),
});

export const TranslationIssueSchema = z.discriminatedUnion("type", [
  MissingTranslationIssueSchema,
  FallbackUsageIssueSchema,
  HardcodedStringIssueSchema,
  OverflowIssueSchema,
  RTLLayoutIssueSchema,
]);

// ============================================================
// Filter & Sort Schemas
// ============================================================

export const IssueFiltersSchema = z.object({
  types: z.array(IssueTypeSchema).optional(),
  severities: z.array(IssueSeveritySchema).optional(),
  statuses: z.array(IssueStatusSchema).optional(),
  locales: z.array(SupportedLocaleSchema).optional(),
  routes: z.array(z.string()).optional(),
  components: z.array(z.string()).optional(),
  namespaces: z.array(z.string()).optional(),
  searchQuery: z.string().optional(),
  dateRange: z
    .object({
      start: z.number(),
      end: z.number(),
    })
    .optional(),
});

export const IssueSortOptionsSchema = z.object({
  field: z.enum(["severity", "lastSeen", "occurrenceCount", "firstDetected"]),
  direction: z.enum(["asc", "desc"]),
});

// ============================================================
// Health Metrics Schemas
// ============================================================

export const LocaleHealthMetricsSchema = z.object({
  locale: SupportedLocaleSchema,
  totalKeysUsed: z.number().min(0),
  keysWithIssues: z.number().min(0),
  missingKeys: z.number().min(0),
  fallbackUsages: z.number().min(0),
  coveragePercentage: z.number().min(0).max(100),
  healthScore: z.number().min(0).max(100),
  issuesBySeverity: z.record(IssueSeveritySchema, z.number()),
  lastUpdated: z.number(),
});

export const RouteHealthMetricsSchema = z.object({
  route: z.string(),
  displayName: z.string(),
  totalUsages: z.number().min(0),
  uniqueKeys: z.number().min(0),
  issueCount: z.number().min(0),
  healthScore: z.number().min(0).max(100),
  issuesByType: z.record(IssueTypeSchema, z.number()),
  namespacesUsed: z.array(z.string()),
  lastVisited: z.number(),
});

export const NamespaceHealthMetricsSchema = z.object({
  namespace: z.string(),
  totalKeysDefined: z.number().min(0),
  keysInUse: z.number().min(0),
  unusedKeys: z.number().min(0),
  missingKeys: z.number().min(0),
  healthScore: z.number().min(0).max(100),
  usageByRoute: z.record(z.string(), z.number()),
  lastUsed: z.number(),
});

export const TranslationHealthSummarySchema = z.object({
  overallScore: z.number().min(0).max(100),
  trend: z.enum(["improving", "stable", "declining"]),
  trendPercentage: z.number(),
  totalIssues: z.number().min(0),
  criticalIssues: z.number().min(0),
  issuesBySeverity: z.record(IssueSeveritySchema, z.number()),
  issuesByType: z.record(IssueTypeSchema, z.number()),
  localeMetrics: z.record(SupportedLocaleSchema, LocaleHealthMetricsSchema),
  problematicRoutes: z.array(RouteHealthMetricsSchema),
  problematicNamespaces: z.array(NamespaceHealthMetricsSchema),
  totalUsagesTracked: z.number().min(0),
  uniqueKeysTracked: z.number().min(0),
  dataFreshnessTimestamp: z.number(),
  sessionStartTimestamp: z.number(),
});

// ============================================================
// Config Schema
// ============================================================

export const DetectionConfigSchema = z.object({
  enabled: z.boolean(),
  detectMissingKeys: z.boolean(),
  detectFallbackUsage: z.boolean(),
  detectHardcodedStrings: z.boolean(),
  detectOverflow: z.boolean(),
  detectRTLIssues: z.boolean(),
  minConfidence: ConfidenceLevelSchema,
  excludedRoutes: z.array(z.string()),
  excludedComponents: z.array(z.string()),
  excludedNamespaces: z.array(z.string()),
  maxIssues: z.number().min(1).max(10000),
  autoClearResolvedAfter: z.number().min(0),
});

// ============================================================
// Export/Import Schema
// ============================================================

export const ExportDataSchema = z.object({
  version: z.literal(1),
  exportedAt: z.number(),
  config: DetectionConfigSchema,
  issues: z.record(z.string(), TranslationIssueSchema),
  keyUsage: z.record(z.string(), TranslationKeyUsageSchema),
  healthSummary: TranslationHealthSummarySchema,
});

// ============================================================
// Type Exports
// ============================================================

export type IssueSeverityInput = z.input<typeof IssueSeveritySchema>;
export type IssueTypeInput = z.input<typeof IssueTypeSchema>;
export type TranslationUsageEventInput = z.input<typeof TranslationUsageEventSchema>;
export type TranslationIssueInput = z.input<typeof TranslationIssueSchema>;
export type ExportDataInput = z.input<typeof ExportDataSchema>;
