import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/lib/i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files (/_next, /favicon.ico, etc.)
  // - Public files
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
