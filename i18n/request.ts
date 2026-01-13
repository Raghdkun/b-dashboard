import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";
import {
  createOnErrorHandler,
  createGetMessageFallbackHandler,
} from "@/lib/i18n-intelligence";

// Create i18n Intelligence handlers for issue detection
// These only run in development mode
const onError =
  process.env.NODE_ENV === "development" ? createOnErrorHandler() : undefined;
const getMessageFallback =
  process.env.NODE_ENV === "development"
    ? createGetMessageFallbackHandler()
    : undefined;

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from the request (set by middleware)
  let locale = await requestLocale;

  // Validate and fallback
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/lib/i18n/locales/${locale}.json`)).default,
    // i18n Intelligence: Enable issue detection in development
    ...(onError && { onError }),
    ...(getMessageFallback && { getMessageFallback }),
  };
});
