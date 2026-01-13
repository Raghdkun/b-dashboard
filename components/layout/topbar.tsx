"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Breadcrumbs } from "./breadcrumbs";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const t = useTranslations("common");

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Breadcrumbs */}
      <div className="hidden md:block">
        <Breadcrumbs pathname={pathname} />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search (stub) */}
      <div className="hidden w-full max-w-sm md:block">
        <div className="relative">
          <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("search")}
            className="ps-8"
            disabled
          />
        </div>
      </div>

      {/* Theme toggle */}
      <ThemeToggle />
    </header>
  );
}
