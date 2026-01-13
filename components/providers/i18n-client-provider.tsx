/**
 * i18n Client Provider with Intelligence Integration
 *
 * Wraps NextIntlClientProvider with error handling that feeds into
 * the i18n Intelligence system for tracking missing translations
 */

"use client";

import { NextIntlClientProvider, IntlErrorCode } from "next-intl";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useI18nIntelligenceStore } from "@/lib/i18n-intelligence";
import { createMissingTranslationIssue } from "@/lib/i18n-intelligence/analyzers/issue-factories";
import type { SupportedLocale } from "@/lib/i18n-intelligence/types";

interface I18nClientProviderProps {
  children: ReactNode;
  messages: Record<string, unknown>;
  locale: string;
}

export function I18nClientProvider({
  children,
  messages,
  locale,
}: I18nClientProviderProps) {
  const recordIssue = useI18nIntelligenceStore((s) => s.recordIssue);
  const isDetecting = useI18nIntelligenceStore((s) => s.config.enabled);
  const detectMissing = useI18nIntelligenceStore(
    (s) => s.config.detectMissingKeys
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle translation errors
  const handleError = useCallback(
    (error: { code: IntlErrorCode; message: string }) => {
      // Only process in development and when detection is enabled
      if (process.env.NODE_ENV !== "development" || !mounted) {
        return;
      }

      // Only handle missing message errors
      if (error.code === IntlErrorCode.MISSING_MESSAGE && detectMissing) {
        // Extract key info from error message
        // Error message format: "Could not resolve `key` in messages for locale `locale`"
        const keyMatch = error.message.match(/`([^`]+)`/);
        const fullKey = keyMatch?.[1] || "unknown";

        // Parse namespace from key (e.g., "common.save" -> namespace: "common", key: "save")
        const parts = fullKey.split(".");
        const namespace = parts.length > 1 ? parts[0] : "default";
        const shortKey = parts.length > 1 ? parts.slice(1).join(".") : fullKey;

        // Get current route from window if available
        const route =
          typeof window !== "undefined" ? window.location.pathname : "/";

        // Create the issue
        const issue = createMissingTranslationIssue({
          key: shortKey,
          namespace,
          fullKey,
          locale: locale as SupportedLocale,
          location: {
            route,
            componentName: "Unknown",
            componentType: "other",
          },
        });

        // Record in store
        recordIssue(issue);

        console.debug(
          `[i18n-intelligence] Missing translation detected: ${fullKey} for locale ${locale}`
        );
      }
    },
    [mounted, detectMissing, locale, recordIssue]
  );

  // Fallback handler for missing messages
  const handleGetMessageFallback = useCallback(
    ({
      namespace,
      key,
      error,
    }: {
      namespace?: string;
      key: string;
      error: { code: IntlErrorCode; message: string };
    }) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;

      // In development, show a visual indicator
      if (process.env.NODE_ENV === "development") {
        return fullKey; // Return just the key as fallback
      }

      // In production, just return the key
      return fullKey;
    },
    []
  );

  return (
    <NextIntlClientProvider
      messages={messages}
      locale={locale}
      onError={handleError}
      getMessageFallback={handleGetMessageFallback}
    >
      {children}
    </NextIntlClientProvider>
  );
}
