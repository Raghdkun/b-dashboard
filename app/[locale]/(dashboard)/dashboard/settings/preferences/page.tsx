"use client";

import { useRouter, useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

export default function PreferencesPage() {
  const t = useTranslations("settings.preferences");
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = (params?.locale as Locale) || "en";

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie for middleware
    Cookies.set("NEXT_LOCALE", newLocale, { expires: 365 });
    
    // Also save to localStorage for client-side persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
    }

    // Navigate to same page with new locale
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t("language")}</CardTitle>
          <CardDescription>
            {t("languageDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t("selectLanguage")}</Label>
            <Select
              value={currentLocale}
              onValueChange={(value) => handleLocaleChange(value as Locale)}
            >
              <SelectTrigger id="language" className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((locale) => (
                  <SelectItem key={locale} value={locale}>
                    {localeNames[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
