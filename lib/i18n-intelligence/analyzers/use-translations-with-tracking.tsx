/**
 * i18n Intelligence System - Enhanced useTranslations Hook
 *
 * Wraps next-intl's useTranslations to track translation usage
 * and detect issues in real-time
 */

"use client";

import { useTranslations as useNextIntlTranslations, useLocale } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { TranslationLocation, SupportedLocale, ComponentType } from "../types";
import { useI18nIntelligenceStore } from "../store";
import { useTranslationLocation } from "./translation-context";
import { processMissingTranslation, processFallbackUsage } from "./error-interceptor";

/**
 * Options for the tracking hook
 */
interface UseTranslationsWithTrackingOptions {
  /** Override component name for tracking */
  componentName?: string;

  /** Override component type for tracking */
  componentType?: ComponentType;

  /** Disable tracking for this instance */
  disableTracking?: boolean;
}

/**
 * Enhanced useTranslations hook that tracks usage
 *
 * @param namespace - The translation namespace
 * @param options - Tracking options
 * @returns Translation function with tracking
 */
export function useTranslationsWithTracking(
  namespace: string,
  options: UseTranslationsWithTrackingOptions = {}
) {
  // Get the original translation function
  const t = useNextIntlTranslations(namespace);
  const locale = useLocale() as SupportedLocale;
  const pathname = usePathname();

  // Get location context (may be undefined if not in provider)
  const contextLocation = useTranslationLocation();

  // Get store state
  const store = useI18nIntelligenceStore();
  const { config, recordUsage, setActiveLocale } = store;

  // Track keys we've already recorded this render
  const recordedKeys = useRef<Set<string>>(new Set());

  // Build the location for tracking
  const location: TranslationLocation = {
    route: pathname || contextLocation.route,
    componentName: options.componentName || contextLocation.componentName,
    componentType: options.componentType || contextLocation.componentType,
    widgetId: contextLocation.widgetId,
  };

  // Update active locale
  useEffect(() => {
    if (locale !== store.activeLocale) {
      setActiveLocale(locale);
    }
  }, [locale, store.activeLocale, setActiveLocale]);

  // Create the tracked translation function
  const trackedT = useCallback(
    (key: string, values?: Record<string, unknown>): string => {
      const fullKey = `${namespace}.${key}`;

      // Get the translation
      let result: string;
      let resolved = true;
      let fallbackUsed = false;

      try {
        result = t(key, values as never);

        // Check if this is a fallback indicator
        if (result.startsWith("⚠️")) {
          resolved = false;
          // Extract the original key if it's our fallback format
          if (result === `⚠️ ${fullKey}`) {
            result = key; // Show just the key for cleaner output
          }
        }

        // Detect if showing wrong locale (fallback detection)
        // This is a heuristic - if locale is Arabic but text is clearly English
        if (locale === "ar" && resolved) {
          // Simple heuristic: if the result is ASCII-only and > 2 chars
          // it might be an English fallback
          const isAsciiOnly = /^[\x00-\x7F]+$/.test(result);
          const isLikelyEnglish = isAsciiOnly && result.length > 2 && /[a-zA-Z]{2,}/.test(result);

          if (isLikelyEnglish) {
            fallbackUsed = true;
          }
        }
      } catch (error) {
        // Translation error - mark as unresolved
        resolved = false;
        result = key;
      }

      // Record usage if tracking is enabled
      if (
        config.enabled &&
        !options.disableTracking &&
        !recordedKeys.current.has(fullKey)
      ) {
        // Mark as recorded to avoid duplicates in same render
        recordedKeys.current.add(fullKey);

        // Record the usage event
        recordUsage({
          timestamp: Date.now(),
          fullKey,
          namespace,
          key,
          locale,
          location,
          resolved,
          value: resolved ? result : undefined,
          fallbackUsed,
          fallbackLocale: fallbackUsed ? "en" : undefined,
        });

        // Process issues
        if (!resolved) {
          processMissingTranslation({
            key,
            namespace,
            locale,
            location,
          });
        }

        if (fallbackUsed) {
          processFallbackUsage({
            key,
            namespace,
            requestedLocale: locale,
            fallbackLocale: "en",
            shownValue: result,
            location,
          });
        }
      }

      return result;
    },
    [t, namespace, locale, location, config.enabled, options.disableTracking, recordUsage]
  );

  // Clear recorded keys on unmount or when namespace changes
  useEffect(() => {
    return () => {
      recordedKeys.current.clear();
    };
  }, [namespace]);

  // Return the tracked function with the same interface as useTranslations
  // Also attach raw and rich methods for compatibility
  return Object.assign(trackedT, {
    raw: (key: string) => t.raw(key),
    rich: (key: string, values?: Record<string, unknown>) =>
      t.rich(key, values as never),
    markup: (key: string, values?: Record<string, unknown>) =>
      t.markup(key, values as never),
  });
}

/**
 * Re-export original useTranslations for cases where tracking is not needed
 */
export { useTranslations as useTranslationsOriginal } from "next-intl";

/**
 * Alias for easier migration - drop-in replacement
 */
export const useTranslations = useTranslationsWithTracking;
