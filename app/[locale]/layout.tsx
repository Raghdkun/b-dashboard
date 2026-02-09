import type { Metadata } from "next";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { FeatureProviders } from "@/components/providers/feature-providers";
import { Toaster } from "@/components/ui/sonner";
import { locales, localeDirections, type Locale } from "@/lib/i18n/config";
import { createFOUCPreventionScript } from "@/lib/theme";
import { isFeatureEnabled } from "@/lib/config";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "B-Dashboard",
  description: "Enterprise-grade dashboard foundation",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();

  const dir = localeDirections[locale as Locale];
  const isRtl = dir === "rtl";

  // Check if RTL support is enabled
  const rtlEnabled = isFeatureEnabled("rtlSupport");
  const effectiveDir = rtlEnabled ? dir : "ltr";
  const effectiveIsRtl = rtlEnabled && isRtl;

  return (
    <html lang={locale} dir={effectiveDir} suppressHydrationWarning>
      <head>
        {/* Theme FOUC prevention script - runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{ __html: createFOUCPreventionScript() }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} ${effectiveIsRtl ? "font-(family-name:--font-noto-arabic)" : ""} antialiased`}
        suppressHydrationWarning
      >
        <FeatureProviders messages={messages} locale={locale}>
          {children}
          <Toaster />
        </FeatureProviders>
      </body>
    </html>
  );
}
