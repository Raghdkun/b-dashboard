"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
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

const themes = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Light mode with bright backgrounds",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Dark mode for reduced eye strain",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Follow your system preferences",
  },
];

// Hydration-safe hook for client-side only rendering
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how the dashboard looks and feels.
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Select your preferred color scheme for the interface.
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
                    <div className="absolute right-2 top-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your selected theme looks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary" />
              <div className="space-y-1">
                <div className="h-4 w-24 rounded bg-foreground/20" />
                <div className="h-3 w-32 rounded bg-muted-foreground/20" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
