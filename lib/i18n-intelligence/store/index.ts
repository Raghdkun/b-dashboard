/**
 * i18n Intelligence System - Zustand Store
 *
 * Central state management for translation intelligence tracking
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  I18nIntelligenceStore,
  I18nIntelligenceState,
  DetectionConfig,
  DashboardUIState,
  TranslationUsageEvent,
  TranslationIssue,
  TranslationKeyUsage,
  TranslationHealthSummary,
  TranslationLocation,
  IssueFilters,
  IssueSortOptions,
  IssueStatus,
  SupportedLocale,
} from "../types";
import {
  DEFAULT_DETECTION_CONFIG,
  DEFAULT_UI_STATE,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  createKeyUsage,
  createEmptyHealthSummary,
  createEmptyLocaleMetrics,
  createEmptyRouteMetrics,
} from "../types";
import {
  calculateIssueSeverity,
  recalculateSeverity,
} from "../utils/severity-scorer";
import { ExportDataSchema } from "../schemas";

// ============================================================
// Initial State
// ============================================================

const initialState: I18nIntelligenceState = {
  config: DEFAULT_DETECTION_CONFIG,
  activeLocale: "en",
  issues: {},
  keyUsage: {},
  healthSummary: createEmptyHealthSummary(),
  ui: DEFAULT_UI_STATE,
  lastSyncTimestamp: Date.now(),
  isDetecting: false,
  isProcessing: false,
  error: null,
};

// ============================================================
// Store Implementation
// ============================================================

export const useI18nIntelligenceStore = create<I18nIntelligenceStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // =======================================================
      // Configuration Actions
      // =======================================================

      updateConfig: (config: Partial<DetectionConfig>) => {
        set((state) => {
          state.config = { ...state.config, ...config };
        });
      },

      toggleDetection: (enabled?: boolean) => {
        set((state) => {
          state.config.enabled = enabled ?? !state.config.enabled;
          state.isDetecting = state.config.enabled;
        });
      },

      resetConfig: () => {
        set((state) => {
          state.config = DEFAULT_DETECTION_CONFIG;
        });
      },

      // =======================================================
      // Detection & Tracking Actions
      // =======================================================

      setActiveLocale: (locale: SupportedLocale) => {
        set((state) => {
          state.activeLocale = locale;
        });
      },

      recordUsage: (event: TranslationUsageEvent) => {
        const state = get();

        // Skip if detection is disabled
        if (!state.config.enabled) return;

        // Skip excluded routes/components/namespaces
        if (state.config.excludedRoutes.includes(event.location.route)) return;
        if (state.config.excludedComponents.includes(event.location.componentName))
          return;
        if (state.config.excludedNamespaces.includes(event.namespace)) return;

        set((draft) => {
          const { fullKey, namespace, key, locale, location, resolved, fallbackUsed } =
            event;

          // Update or create key usage record
          if (!draft.keyUsage[fullKey]) {
            draft.keyUsage[fullKey] = createKeyUsage(fullKey, namespace, key);
          }

          const usage = draft.keyUsage[fullKey];
          usage.lastSeen = event.timestamp;
          usage.totalUsages += 1;

          // Track by locale
          if (!usage.usagesByLocale[locale]) {
            usage.usagesByLocale[locale] = 0;
          }
          usage.usagesByLocale[locale] += 1;

          // Track by route
          if (!usage.usagesByRoute[location.route]) {
            usage.usagesByRoute[location.route] = 0;
          }
          usage.usagesByRoute[location.route] += 1;

          // Track unique locations
          const locationExists = usage.locations.some(
            (loc: TranslationLocation) =>
              loc.route === location.route &&
              loc.componentName === location.componentName
          );
          if (!locationExists) {
            usage.locations.push(location);
          }

          // Track issues if needed
          if (!resolved && draft.config.detectMissingKeys) {
            // Will be handled by issue recording
          }

          if (fallbackUsed && draft.config.detectFallbackUsage) {
            // Will be handled by issue recording
          }

          draft.lastSyncTimestamp = Date.now();
        });
      },

      recordUsageBatch: (events: TranslationUsageEvent[]) => {
        const state = get();
        if (!state.config.enabled) return;

        set((draft) => {
          draft.isProcessing = true;
        });

        // Process each event
        for (const event of events) {
          get().recordUsage(event);
        }

        set((draft) => {
          draft.isProcessing = false;
        });
      },

      recordIssue: (issue: TranslationIssue) => {
        const state = get();

        // Check max issues limit
        const issueCount = Object.keys(state.issues).length;
        if (issueCount >= state.config.maxIssues) {
          // Remove oldest resolved issue if at limit
          const resolvedIssues = Object.values(state.issues)
            .filter((i) => i.status === "resolved")
            .sort((a, b) => a.lastSeen - b.lastSeen);

          if (resolvedIssues.length > 0) {
            set((draft) => {
              delete draft.issues[resolvedIssues[0].id];
            });
          } else {
            // Can't add more issues
            return;
          }
        }

        set((draft) => {
          const existingIssue = draft.issues[issue.id];

          if (existingIssue) {
            // Update existing issue
            existingIssue.lastSeen = issue.lastSeen;
            existingIssue.occurrenceCount += 1;

            // Recalculate severity based on new occurrence count
            const { score, severity } = recalculateSeverity(
              existingIssue.severityScore,
              existingIssue.occurrenceCount,
              existingIssue.occurrenceCount - 1
            );
            existingIssue.severityScore = score;
            existingIssue.severity = severity;

            // Add new location if unique
            const locationExists = existingIssue.allLocations.some(
              (loc) =>
                loc.route === issue.location.route &&
                loc.componentName === issue.location.componentName
            );
            if (!locationExists) {
              existingIssue.allLocations.push(issue.location);
            }

            // Reopen if it was resolved
            if (existingIssue.status === "resolved") {
              existingIssue.status = "open";
            }
          } else {
            // Add new issue
            draft.issues[issue.id] = issue;
          }

          // Update key usage to track issue
          if ("fullKey" in issue && issue.fullKey) {
            const keyUsage = draft.keyUsage[issue.fullKey];
            if (keyUsage) {
              keyUsage.hasIssues = true;
              if (!keyUsage.issueIds.includes(issue.id)) {
                keyUsage.issueIds.push(issue.id);
              }
            }
          }

          draft.lastSyncTimestamp = Date.now();
        });
      },

      updateIssue: (id: string, updates: Partial<TranslationIssue>) => {
        set((state) => {
          if (state.issues[id]) {
            Object.assign(state.issues[id], updates);
          }
        });
      },

      // =======================================================
      // Issue Management Actions
      // =======================================================

      setIssueStatus: (id: string, status: IssueStatus) => {
        set((state) => {
          if (state.issues[id]) {
            state.issues[id].status = status;
          }
        });
      },

      bulkSetIssueStatus: (ids: string[], status: IssueStatus) => {
        set((state) => {
          for (const id of ids) {
            if (state.issues[id]) {
              state.issues[id].status = status;
            }
          }
        });
      },

      deleteIssue: (id: string) => {
        set((state) => {
          delete state.issues[id];
        });
      },

      bulkDeleteIssues: (ids: string[]) => {
        set((state) => {
          for (const id of ids) {
            delete state.issues[id];
          }
        });
      },

      clearResolvedIssues: () => {
        set((state) => {
          for (const id of Object.keys(state.issues)) {
            if (state.issues[id].status === "resolved") {
              delete state.issues[id];
            }
          }
        });
      },

      clearAllIssues: () => {
        set((state) => {
          state.issues = {};
        });
      },

      // =======================================================
      // Health & Analytics Actions
      // =======================================================

      recalculateHealth: () => {
        set((state) => {
          const issues = Object.values(state.issues);
          const activeIssues = issues.filter(
            (i) => i.status !== "resolved" && i.status !== "wont-fix"
          );

          // Reset counts
          const summary: TranslationHealthSummary = createEmptyHealthSummary();
          summary.sessionStartTimestamp = state.healthSummary.sessionStartTimestamp;

          // Count issues by severity and type
          for (const issue of activeIssues) {
            summary.totalIssues += 1;
            summary.issuesBySeverity[issue.severity] += 1;
            summary.issuesByType[issue.type] += 1;

            if (issue.severity === "critical") {
              summary.criticalIssues += 1;
            }
          }

          // Calculate overall score (inverse of issue impact)
          const severityWeights = {
            critical: 25,
            high: 15,
            medium: 8,
            low: 3,
            info: 1,
          };

          let totalPenalty = 0;
          for (const issue of activeIssues) {
            totalPenalty += severityWeights[issue.severity];
          }

          // Score starts at 100 and decreases based on issues
          summary.overallScore = Math.max(0, Math.min(100, 100 - totalPenalty));

          // Calculate locale metrics
          for (const [key, usage] of Object.entries(state.keyUsage)) {
            summary.totalUsagesTracked += usage.totalUsages;

            for (const locale of Object.keys(usage.usagesByLocale) as SupportedLocale[]) {
              if (!summary.localeMetrics[locale]) {
                summary.localeMetrics[locale] = createEmptyLocaleMetrics(locale);
              }
              summary.localeMetrics[locale]!.totalKeysUsed += 1;
            }
          }

          summary.uniqueKeysTracked = Object.keys(state.keyUsage).length;

          // Update locale metrics with issues
          for (const issue of activeIssues) {
            if ("missingInLocales" in issue) {
              for (const locale of issue.missingInLocales) {
                if (!summary.localeMetrics[locale]) {
                  summary.localeMetrics[locale] = createEmptyLocaleMetrics(locale);
                }
                summary.localeMetrics[locale]!.missingKeys += 1;
                summary.localeMetrics[locale]!.keysWithIssues += 1;
                summary.localeMetrics[locale]!.issuesBySeverity[issue.severity] += 1;
              }
            }

            if ("requestedLocale" in issue) {
              const locale = issue.requestedLocale;
              if (!summary.localeMetrics[locale]) {
                summary.localeMetrics[locale] = createEmptyLocaleMetrics(locale);
              }
              summary.localeMetrics[locale]!.fallbackUsages += 1;
              summary.localeMetrics[locale]!.issuesBySeverity[issue.severity] += 1;
            }
          }

          // Calculate locale health scores
          for (const locale of Object.keys(summary.localeMetrics) as SupportedLocale[]) {
            const metrics = summary.localeMetrics[locale];
            if (!metrics) continue;
            
            const totalKeys = metrics.totalKeysUsed || 1;
            const issueKeys = metrics.keysWithIssues;

            metrics.coveragePercentage = Math.round(
              ((totalKeys - issueKeys) / totalKeys) * 100
            );
            metrics.healthScore = metrics.coveragePercentage;
            metrics.lastUpdated = Date.now();
          }

          // Find problematic routes
          const routeIssues: Record<string, number> = {};
          for (const issue of activeIssues) {
            const route = issue.location.route;
            routeIssues[route] = (routeIssues[route] || 0) + 1;
          }

          summary.problematicRoutes = Object.entries(routeIssues)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([route, count]) => ({
              ...createEmptyRouteMetrics(route),
              issueCount: count,
              healthScore: Math.max(0, 100 - count * 10),
            }));

          summary.dataFreshnessTimestamp = Date.now();

          // Determine trend (simplified - would need history for real trend)
          summary.trend = "stable";
          summary.trendPercentage = 0;

          state.healthSummary = summary;
        });
      },

      getFilteredIssues: () => {
        const state = get();
        const { filters, sort, showResolved } = state.ui;
        let issues = Object.values(state.issues);

        // Filter by status (show/hide resolved)
        if (!showResolved) {
          issues = issues.filter(
            (i) => i.status !== "resolved" && i.status !== "wont-fix"
          );
        }

        // Apply filters
        if (filters.types?.length) {
          issues = issues.filter((i) => filters.types!.includes(i.type));
        }

        if (filters.severities?.length) {
          issues = issues.filter((i) => filters.severities!.includes(i.severity));
        }

        if (filters.statuses?.length) {
          issues = issues.filter((i) => filters.statuses!.includes(i.status));
        }

        if (filters.routes?.length) {
          issues = issues.filter((i) => filters.routes!.includes(i.location.route));
        }

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          issues = issues.filter(
            (i) =>
              i.description.toLowerCase().includes(query) ||
              ("key" in i && i.key.toLowerCase().includes(query)) ||
              i.location.route.toLowerCase().includes(query) ||
              i.location.componentName.toLowerCase().includes(query)
          );
        }

        // Sort
        const sortMultiplier = sort.direction === "asc" ? 1 : -1;
        issues.sort((a, b) => {
          switch (sort.field) {
            case "severity":
              return (b.severityScore - a.severityScore) * sortMultiplier;
            case "lastSeen":
              return (b.lastSeen - a.lastSeen) * sortMultiplier;
            case "occurrenceCount":
              return (b.occurrenceCount - a.occurrenceCount) * sortMultiplier;
            case "firstDetected":
              return (b.firstDetected - a.firstDetected) * sortMultiplier;
            default:
              return 0;
          }
        });

        return issues;
      },

      getIssuesByRoute: (route: string) => {
        const state = get();
        return Object.values(state.issues).filter(
          (i) => i.location.route === route
        );
      },

      getIssuesByLocale: (locale: SupportedLocale) => {
        const state = get();
        return Object.values(state.issues).filter((i) => {
          if ("missingInLocales" in i) {
            return i.missingInLocales.includes(locale);
          }
          if ("requestedLocale" in i) {
            return i.requestedLocale === locale;
          }
          if ("locale" in i) {
            return i.locale === locale;
          }
          return false;
        });
      },

      getIssuesByNamespace: (namespace: string) => {
        const state = get();
        return Object.values(state.issues).filter(
          (i) => "namespace" in i && i.namespace === namespace
        );
      },

      // =======================================================
      // UI State Actions
      // =======================================================

      setFilters: (filters: Partial<IssueFilters>) => {
        set((state) => {
          state.ui.filters = { ...state.ui.filters, ...filters };
        });
      },

      resetFilters: () => {
        set((state) => {
          state.ui.filters = DEFAULT_FILTERS;
        });
      },

      setSort: (sort: IssueSortOptions) => {
        set((state) => {
          state.ui.sort = sort;
        });
      },

      selectIssues: (ids: string[]) => {
        set((state) => {
          state.ui.selectedIssues = ids;
        });
      },

      toggleIssueSelection: (id: string) => {
        set((state) => {
          const index = state.ui.selectedIssues.indexOf(id);
          if (index >= 0) {
            state.ui.selectedIssues.splice(index, 1);
          } else {
            state.ui.selectedIssues.push(id);
          }
        });
      },

      clearSelection: () => {
        set((state) => {
          state.ui.selectedIssues = [];
        });
      },

      expandIssue: (id: string | null) => {
        set((state) => {
          state.ui.expandedIssue = id;
        });
      },

      setActiveTab: (tab: DashboardUIState["activeTab"]) => {
        set((state) => {
          state.ui.activeTab = tab;
        });
      },

      toggleSidebar: () => {
        set((state) => {
          state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
        });
      },

      toggleShowResolved: () => {
        set((state) => {
          state.ui.showResolved = !state.ui.showResolved;
        });
      },

      // =======================================================
      // Data Management Actions
      // =======================================================

      exportData: () => {
        const state = get();
        const exportData = {
          version: 1 as const,
          exportedAt: Date.now(),
          config: state.config,
          issues: state.issues,
          keyUsage: state.keyUsage,
          healthSummary: state.healthSummary,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importData: (json: string) => {
        try {
          const parsed = JSON.parse(json);
          const validated = ExportDataSchema.parse(parsed);

          set((state) => {
            state.config = validated.config;
            state.issues = validated.issues;
            state.keyUsage = validated.keyUsage;
            state.healthSummary = validated.healthSummary;
            state.lastSyncTimestamp = Date.now();
            state.error = null;
          });
        } catch (error) {
          set((state) => {
            state.error = `Import failed: ${error instanceof Error ? error.message : "Invalid data"}`;
          });
        }
      },

      reset: () => {
        set(() => ({
          ...initialState,
          healthSummary: {
            ...createEmptyHealthSummary(),
            sessionStartTimestamp: Date.now(),
          },
        }));
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
        });
      },
    })),
    {
      name: "i18n-intelligence-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        issues: state.issues,
        keyUsage: state.keyUsage,
        healthSummary: state.healthSummary,
        lastSyncTimestamp: state.lastSyncTimestamp,
      }),
    }
  )
);

// ============================================================
// Selectors
// ============================================================

export const selectConfig = (state: I18nIntelligenceStore) => state.config;
export const selectIssues = (state: I18nIntelligenceStore) => state.issues;
export const selectHealthSummary = (state: I18nIntelligenceStore) =>
  state.healthSummary;
export const selectUI = (state: I18nIntelligenceStore) => state.ui;
export const selectIsDetecting = (state: I18nIntelligenceStore) =>
  state.isDetecting;
export const selectActiveLocale = (state: I18nIntelligenceStore) =>
  state.activeLocale;
export const selectError = (state: I18nIntelligenceStore) => state.error;

// Count selectors
export const selectTotalIssues = (state: I18nIntelligenceStore) =>
  Object.keys(state.issues).length;
export const selectCriticalIssues = (state: I18nIntelligenceStore) =>
  Object.values(state.issues).filter((i) => i.severity === "critical").length;
export const selectOpenIssues = (state: I18nIntelligenceStore) =>
  Object.values(state.issues).filter((i) => i.status === "open").length;

// Filtered issues selector - computes filtered and sorted issues
export const selectFilteredIssues = (state: I18nIntelligenceStore) => {
  const { filters, sort, showResolved } = state.ui;
  let issues = Object.values(state.issues);

  // Filter by status (show/hide resolved)
  if (!showResolved) {
    issues = issues.filter(
      (i) => i.status !== "resolved" && i.status !== "wont-fix"
    );
  }

  // Apply filters
  if (filters.types?.length) {
    issues = issues.filter((i) => filters.types!.includes(i.type));
  }

  if (filters.severities?.length) {
    issues = issues.filter((i) => filters.severities!.includes(i.severity));
  }

  if (filters.statuses?.length) {
    issues = issues.filter((i) => filters.statuses!.includes(i.status));
  }

  if (filters.routes?.length) {
    issues = issues.filter((i) => filters.routes!.includes(i.location.route));
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    issues = issues.filter(
      (i) =>
        i.description.toLowerCase().includes(query) ||
        ("key" in i && i.key.toLowerCase().includes(query)) ||
        i.location.route.toLowerCase().includes(query) ||
        i.location.componentName.toLowerCase().includes(query)
    );
  }

  // Sort
  const sortMultiplier = sort.direction === "asc" ? 1 : -1;
  issues.sort((a, b) => {
    switch (sort.field) {
      case "severity":
        return (b.severityScore - a.severityScore) * sortMultiplier;
      case "lastSeen":
        return (b.lastSeen - a.lastSeen) * sortMultiplier;
      case "occurrenceCount":
        return (b.occurrenceCount - a.occurrenceCount) * sortMultiplier;
      case "firstDetected":
        return (b.firstDetected - a.firstDetected) * sortMultiplier;
      default:
        return 0;
    }
  });

  return issues;
};
