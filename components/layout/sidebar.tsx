"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Languages,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "./user-menu";
import { useUIStore } from "@/lib/store/ui.store";

interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isRtl = locale === "ar";
  const t = useTranslations("nav");
  const { toggleSidebar } = useUIStore();

  const navItems = [
    {
      title: t("dashboard"),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: t("users"),
      href: `/${locale}/dashboard/users`,
      icon: Users,
    },
    {
      title: t("settings"),
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
    },
  ];

  // Dev tools navigation (only visible in development)
  const devToolsItems =
    process.env.NODE_ENV === "development"
      ? [
          {
            title: t("devTools.i18n"),
            href: `/${locale}/dashboard/dev-tools/i18n`,
            icon: Languages,
          },
        ]
      : [];

  // For RTL, swap chevron icons
  const CollapseIcon = collapsed
    ? isRtl ? ChevronLeft : ChevronRight
    : isRtl ? ChevronRight : ChevronLeft;

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 items-center border-b px-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">B</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">
              {t("dashboard")}
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">B</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const basePath = `/${locale}/dashboard`;
          const isActive =
            pathname === item.href ||
            (item.href !== basePath && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}

        {/* Dev Tools Section */}
        {devToolsItems.length > 0 && (
          <>
            <Separator className="my-2" />
            {!collapsed && (
              <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Wrench className="h-3 w-3" />
                <span>{t("devTools.title")}</span>
              </div>
            )}
            {devToolsItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <Separator />

      {/* User Menu */}
      <div className={cn("p-2", collapsed && "flex justify-center")}>
        <UserMenu collapsed={collapsed} />
      </div>

      {/* Collapse Toggle (desktop only) */}
      <div className="hidden border-t p-2 md:block">
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full", collapsed && "px-2")}
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <CollapseIcon className="h-4 w-4" />
          ) : (
            <>
              <CollapseIcon className="me-2 h-4 w-4" />
              {t("collapse")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
