"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, Monitor, Moon, Sun } from "lucide-react";

// Hydration-safe hook for client-side only rendering
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function AppearancePage() {
  const t = useTranslations("settings.appearance");
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  const themes = [
    {
      value: "light",
      label: t("light"),
      icon: Sun,
      description: t("lightDescription"),
    },
    {
      value: "dark",
      label: t("dark"),
      icon: Moon,
      description: t("darkDescription"),
    },
    {
      value: "system",
      label: t("system"),
      icon: Monitor,
      description: t("systemDescription"),
    },
  ];

  if (!isMounted) {
    return null;
  }

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
          <CardTitle>{t("theme")}</CardTitle>
          <CardDescription>
            {t("themeDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {themes.map((item) => {
              const isSelected = theme === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setTheme(item.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors hover:bg-muted",
                    isSelected
                      ? "border-primary bg-muted"
                      : "border-muted-foreground/20"
                  )}
                >
                  {isSelected && (
                    <div className="absolute end-2 top-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
