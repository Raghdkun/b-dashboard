/**
 * Feature Flags Store
 *
 * Zustand store for managing runtime feature overrides.
 * Combines static config, environment variables, and runtime state.
 *
 * @module lib/config/features.store
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { featuresConfig } from "./features.config";

/** SSR-safe no-op storage — avoids Node.js `--localstorage-file` warning */
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
import type {
  FeatureId,
  FeatureDetails,
  FeaturesRuntimeState,
  FeatureConfig,
} from "./features.types";

const isDev = process.env.NODE_ENV === "development";

/**
 * Static mapping of environment variables
 * Next.js requires static access to process.env.NEXT_PUBLIC_* at build time
 */
const ENV_OVERRIDES: Record<string, string | undefined> = {
  NEXT_PUBLIC_FEATURE_LOCALIZATION: process.env.NEXT_PUBLIC_FEATURE_LOCALIZATION,
  NEXT_PUBLIC_FEATURE_DARK_MODE: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE,
  NEXT_PUBLIC_FEATURE_THEME_SYSTEM: process.env.NEXT_PUBLIC_FEATURE_THEME_SYSTEM,
  NEXT_PUBLIC_FEATURE_DASHBOARD_PERSONALIZATION: process.env.NEXT_PUBLIC_FEATURE_DASHBOARD_PERSONALIZATION,
  NEXT_PUBLIC_FEATURE_I18N_INTELLIGENCE: process.env.NEXT_PUBLIC_FEATURE_I18N_INTELLIGENCE,
  NEXT_PUBLIC_FEATURE_SECURITY_MONITOR: process.env.NEXT_PUBLIC_FEATURE_SECURITY_MONITOR,
  NEXT_PUBLIC_FEATURE_RTL_SUPPORT: process.env.NEXT_PUBLIC_FEATURE_RTL_SUPPORT,
  NEXT_PUBLIC_FEATURE_DEV_TOOLS: process.env.NEXT_PUBLIC_FEATURE_DEV_TOOLS,
  NEXT_PUBLIC_FEATURE_USER_MENU: process.env.NEXT_PUBLIC_FEATURE_USER_MENU,
  NEXT_PUBLIC_FEATURE_SIDEBAR: process.env.NEXT_PUBLIC_FEATURE_SIDEBAR,
  NEXT_PUBLIC_FEATURE_BREADCRUMBS: process.env.NEXT_PUBLIC_FEATURE_BREADCRUMBS,
  NEXT_PUBLIC_FEATURE_SEARCH: process.env.NEXT_PUBLIC_FEATURE_SEARCH,
};

/**
 * Parse environment variable to boolean
 */
function parseEnvBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined || value === "") return undefined;
  return value.toLowerCase() === "true" || value === "1";
}

/**
 * Get environment override for a feature
 */
function getEnvOverride(config: FeatureConfig): boolean | undefined {
  if (!config.envOverride) return undefined;

  // Use static mapping for Next.js compatibility
  const envValue = ENV_OVERRIDES[config.envOverride];

  return parseEnvBoolean(envValue);
}

/**
 * Check if all dependencies are enabled
 */
function areDependenciesEnabled(
  featureId: FeatureId,
  overrides: Partial<Record<FeatureId, boolean>>
): { enabled: boolean; disabledBy?: FeatureId } {
  const config = featuresConfig[featureId];
  if (!config.dependencies || config.dependencies.length === 0) {
    return { enabled: true };
  }

  for (const depId of config.dependencies) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const depEnabled = resolveFeatureEnabled(depId, overrides);
    if (!depEnabled) {
      return { enabled: false, disabledBy: depId };
    }
  }

  return { enabled: true };
}

/**
 * Resolve the final enabled state for a feature
 */
function resolveFeatureEnabled(
  featureId: FeatureId,
  overrides: Partial<Record<FeatureId, boolean>>
): boolean {
  const config = featuresConfig[featureId];

  // 1. Check devOnly first - disabled in production
  if (config.devOnly && !isDev) {
    return false;
  }

  // 2. Check dependencies
  const deps = areDependenciesEnabled(featureId, overrides);
  if (!deps.enabled) {
    return false;
  }

  // 3. Check runtime override (only if runtimeToggle is enabled)
  if (config.runtimeToggle && overrides[featureId] !== undefined) {
    return overrides[featureId]!;
  }

  // 4. Check environment variable override
  const envOverride = getEnvOverride(config);
  if (envOverride !== undefined) {
    return envOverride;
  }

  // 5. Return config default
  return config.enabled;
}

/**
 * Get detailed feature resolution info
 */
function resolveFeatureDetails(
  featureId: FeatureId,
  overrides: Partial<Record<FeatureId, boolean>>
): FeatureDetails {
  const config = featuresConfig[featureId];

  // 1. Check devOnly first
  if (config.devOnly && !isDev) {
    return {
      enabled: false,
      source: "devOnly",
      config,
    };
  }

  // 2. Check dependencies
  const deps = areDependenciesEnabled(featureId, overrides);
  if (!deps.enabled) {
    return {
      enabled: false,
      source: "dependency",
      config,
      disabledBy: deps.disabledBy,
    };
  }

  // 3. Check runtime override
  if (config.runtimeToggle && overrides[featureId] !== undefined) {
    return {
      enabled: overrides[featureId]!,
      source: "runtime",
      config,
    };
  }

  // 4. Check environment variable override
  const envOverride = getEnvOverride(config);
  if (envOverride !== undefined) {
    return {
      enabled: envOverride,
      source: "env",
      config,
    };
  }

  // 5. Return config default
  return {
    enabled: config.enabled,
    source: "config",
    config,
  };
}

/**
 * Feature Flags Runtime Store
 *
 * Manages runtime overrides for features that support runtime toggling.
 */
export const useFeaturesStore = create<FeaturesRuntimeState>()(
  persist(
    (set) => ({
      overrides: {},

      setOverride: (featureId: FeatureId, enabled: boolean) => {
        const config = featuresConfig[featureId];
        if (!config.runtimeToggle) {
          console.warn(
            `[features] Cannot set runtime override for '${featureId}' - runtimeToggle is not enabled`
          );
          return;
        }

        set((state) => ({
          overrides: { ...state.overrides, [featureId]: enabled },
        }));
      },

      clearOverride: (featureId: FeatureId) => {
        set((state) => {
          const { [featureId]: _, ...rest } = state.overrides;
          return { overrides: rest };
        });
      },

      clearAllOverrides: () => {
        set({ overrides: {} });
      },
    }),
    {
      name: "feature-flags-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
    }
  )
);

/**
 * Check if a feature is enabled
 *
 * This is the primary function for checking feature state.
 * It combines static config, env vars, and runtime overrides.
 *
 * @example
 * ```ts
 * if (isFeatureEnabled('darkMode')) {
 *   // Show theme toggle
 * }
 * ```
 */
export function isFeatureEnabled(featureId: FeatureId): boolean {
  const overrides = useFeaturesStore.getState().overrides;
  return resolveFeatureEnabled(featureId, overrides);
}

/**
 * Get detailed feature information
 *
 * @example
 * ```ts
 * const { enabled, source, config } = getFeatureDetails('darkMode');
 * console.log(`Dark mode is ${enabled ? 'on' : 'off'} (source: ${source})`);
 * ```
 */
export function getFeatureDetails(featureId: FeatureId): FeatureDetails {
  const overrides = useFeaturesStore.getState().overrides;
  return resolveFeatureDetails(featureId, overrides);
}

/**
 * Check multiple features at once (AND logic)
 *
 * @example
 * ```ts
 * if (areFeaturesEnabled(['darkMode', 'themeSystem'])) {
 *   // Show advanced theme settings
 * }
 * ```
 */
export function areFeaturesEnabled(featureIds: FeatureId[]): boolean {
  return featureIds.every((id) => isFeatureEnabled(id));
}

/**
 * Check if any of the features are enabled (OR logic)
 *
 * @example
 * ```ts
 * if (isAnyFeatureEnabled(['i18nIntelligence', 'securityMonitor'])) {
 *   // Show dev tools section
 * }
 * ```
 */
export function isAnyFeatureEnabled(featureIds: FeatureId[]): boolean {
  return featureIds.some((id) => isFeatureEnabled(id));
}
