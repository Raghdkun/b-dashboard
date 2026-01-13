/**
 * i18n Intelligence System - Store Types
 */

import type { SupportedLocale, IssueStatus } from "./enums";
import type { TranslationUsageEvent, TranslationKeyUsage } from "./usage.types";
import type {
  TranslationIssue,
  IssueFilters,
  IssueSortOptions,
} from "./issues.types";
import type { TranslationHealthSummary } from "./health.types";

/**
 * Detection engine configuration
 */
export interface DetectionConfig {
  /** Enable runtime detection */
  enabled: boolean;

  /** Enable missing key detection */
  detectMissingKeys: boolean;

  /** Enable fallback usage detection */
  detectFallbackUsage: boolean;

  /** Enable hardcoded string detection (requires build-time analysis) */
  detectHardcodedStrings: boolean;

  /** Enable overflow detection */
  detectOverflow: boolean;

  /** Enable RTL layout detection */
  detectRTLIssues: boolean;

  /** Minimum confidence level to report */
  minConfidence: "low" | "medium" | "high";

  /** Routes to exclude from detection */
  excludedRoutes: string[];

  /** Components to exclude from detection */
  excludedComponents: string[];

  /** Namespaces to exclude */
  excludedNamespaces: string[];

  /** Maximum issues to store */
  maxIssues: number;

  /** Auto-clear resolved issues after (ms) */
  autoClearResolvedAfter: number;
}

/**
 * UI state for the dashboard
 */
export interface DashboardUIState {
  /** Active filters */
  filters: IssueFilters;

  /** Current sort */
  sort: IssueSortOptions;

  /** Selected issue IDs */
  selectedIssues: string[];

  /** Expanded issue ID (detail view) */
  expandedIssue: string | null;

  /** Active view tab */
  activeTab: "overview" | "issues" | "routes" | "locales" | "settings";

  /** Sidebar collapsed state */
  sidebarCollapsed: boolean;

  /** Show resolved issues */
  showResolved: boolean;
}

/**
 * Main store state
 */
export interface I18nIntelligenceState {
  /** Detection configuration */
  config: DetectionConfig;

  /** Current locale being tracked */
  activeLocale: SupportedLocale;

  /** All recorded issues */
  issues: Record<string, TranslationIssue>;

  /** Translation key usage tracking */
  keyUsage: Record<string, TranslationKeyUsage>;

  /** Health summary */
  healthSummary: TranslationHealthSummary;

  /** Dashboard UI state */
  ui: DashboardUIState;

  /** Last sync timestamp */
  lastSyncTimestamp: number;

  /** Is detection currently active */
  isDetecting: boolean;

  /** Is processing events */
  isProcessing: boolean;

  /** Error state */
  error: string | null;
}

/**
 * Store actions
 */
export interface I18nIntelligenceActions {
  // === Configuration ===

  /** Update detection config */
  updateConfig: (config: Partial<DetectionConfig>) => void;

  /** Toggle detection on/off */
  toggleDetection: (enabled?: boolean) => void;

  /** Reset config to defaults */
  resetConfig: () => void;

  // === Detection & Tracking ===

  /** Set the active locale */
  setActiveLocale: (locale: SupportedLocale) => void;

  /** Record a translation usage event */
  recordUsage: (event: TranslationUsageEvent) => void;

  /** Record multiple usage events (batch) */
  recordUsageBatch: (events: TranslationUsageEvent[]) => void;

  /** Record a detected issue */
  recordIssue: (issue: TranslationIssue) => void;

  /** Update an existing issue */
  updateIssue: (id: string, updates: Partial<TranslationIssue>) => void;

  // === Issue Management ===

  /** Change issue status */
  setIssueStatus: (id: string, status: IssueStatus) => void;

  /** Bulk update issue statuses */
  bulkSetIssueStatus: (ids: string[], status: IssueStatus) => void;

  /** Delete an issue */
  deleteIssue: (id: string) => void;

  /** Bulk delete issues */
  bulkDeleteIssues: (ids: string[]) => void;

  /** Clear all resolved issues */
  clearResolvedIssues: () => void;

  /** Clear all issues */
  clearAllIssues: () => void;

  // === Health & Analytics ===

  /** Recalculate health summary */
  recalculateHealth: () => void;

  /** Get filtered issues */
  getFilteredIssues: () => TranslationIssue[];

  /** Get issues by route */
  getIssuesByRoute: (route: string) => TranslationIssue[];

  /** Get issues by locale */
  getIssuesByLocale: (locale: SupportedLocale) => TranslationIssue[];

  /** Get issues by namespace */
  getIssuesByNamespace: (namespace: string) => TranslationIssue[];

  // === UI State ===

  /** Update filters */
  setFilters: (filters: Partial<IssueFilters>) => void;

  /** Reset filters */
  resetFilters: () => void;

  /** Update sort */
  setSort: (sort: IssueSortOptions) => void;

  /** Select issues */
  selectIssues: (ids: string[]) => void;

  /** Toggle issue selection */
  toggleIssueSelection: (id: string) => void;

  /** Clear selection */
  clearSelection: () => void;

  /** Expand issue detail */
  expandIssue: (id: string | null) => void;

  /** Set active tab */
  setActiveTab: (tab: DashboardUIState["activeTab"]) => void;

  /** Toggle sidebar */
  toggleSidebar: () => void;

  /** Toggle show resolved */
  toggleShowResolved: () => void;

  // === Data Management ===

  /** Export data as JSON */
  exportData: () => string;

  /** Import data from JSON */
  importData: (json: string) => void;

  /** Clear all data and reset */
  reset: () => void;

  /** Set error state */
  setError: (error: string | null) => void;
}

/**
 * Full store type
 */
export type I18nIntelligenceStore = I18nIntelligenceState & I18nIntelligenceActions;

/**
 * Default detection configuration
 */
export const DEFAULT_DETECTION_CONFIG: DetectionConfig = {
  enabled: true,
  detectMissingKeys: true,
  detectFallbackUsage: true,
  detectHardcodedStrings: false, // Requires build-time analysis
  detectOverflow: false, // Requires additional setup
  detectRTLIssues: true,
  minConfidence: "medium",
  excludedRoutes: [],
  excludedComponents: [],
  excludedNamespaces: [],
  maxIssues: 1000,
  autoClearResolvedAfter: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Default UI state
 */
export const DEFAULT_UI_STATE: DashboardUIState = {
  filters: {
    statuses: ["open", "acknowledged", "in-progress"],
  },
  sort: {
    field: "severity",
    direction: "desc",
  },
  selectedIssues: [],
  expandedIssue: null,
  activeTab: "overview",
  sidebarCollapsed: false,
  showResolved: false,
};
