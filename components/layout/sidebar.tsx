"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Languages,
  Wrench,
  Shield,
  Building2,
  UserCog,
  Lock,
  UserPlus,
  GitBranch,
  Key,
  ShieldCheck,
  Check,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "./user-menu";
import { useUIStore } from "@/lib/store/ui.store";
import { useSelectedStoreStore } from "@/lib/store/selected-store.store";
import { useFeature, Feature } from "@/lib/config";
import { authService } from "@/lib/api/services/auth.service";
import type { Store } from "@/types/store.types";

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

  // Check feature flags
  const devToolsEnabled = useFeature("devTools");
  const i18nIntelligenceEnabled = useFeature("i18nIntelligence");
  const securityMonitorEnabled = useFeature("securityMonitor");

  const navItems = [
    {
      title: t("dashboard"),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: t("stores"),
      href: `/${locale}/dashboard/stores`,
      icon: Building2,
    },
    {
      title: t("employees"),
      href: `/${locale}/dashboard/employees`,
      icon: Briefcase,
    },
    {
      title: t("authRules"),
      href: `/${locale}/dashboard/auth-rules`,
      icon: Lock,
    },
    {
      title: t("assignments"),
      href: `/${locale}/dashboard/assignments`,
      icon: UserPlus,
    },
    {
      title: t("hierarchy"),
      href: `/${locale}/dashboard/hierarchy`,
      icon: GitBranch,
    },
    {
      title: t("serviceClients"),
      href: `/${locale}/dashboard/service-clients`,
      icon: Key,
    },
    {
      title: t("settings"),
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
    },
  ];

  // User Management dropdown items
  const userManagementItems = [
    {
      title: t("users"),
      href: `/${locale}/dashboard/users`,
      icon: Users,
    },
    {
      title: t("roles"),
      href: `/${locale}/dashboard/roles`,
      icon: UserCog,
    },
    {
      title: t("permissions"),
      href: `/${locale}/dashboard/permissions`,
      icon: ShieldCheck,
    },
  ];

  // Dev tools navigation (controlled by feature flags)
  const devToolsItems: Array<{
    title: string;
    href: string;
    icon: typeof Languages;
  }> = [];

  if (devToolsEnabled && process.env.NODE_ENV === "development") {
    if (i18nIntelligenceEnabled) {
      devToolsItems.push({
        title: t("devTools.i18n"),
        href: `/${locale}/dashboard/dev-tools/i18n`,
        icon: Languages,
      });
    }
    if (securityMonitorEnabled) {
      devToolsItems.push({
        title: t("devTools.security"),
        href: `/${locale}/dashboard/dev-tools/security`,
        icon: Shield,
      });
    }
  }

  // For RTL, swap chevron icons
  const CollapseIcon = collapsed
    ? isRtl ? ChevronLeft : ChevronRight
    : isRtl ? ChevronRight : ChevronLeft;

  // Store selection state
  const { selectedStore: zustandSelectedStore, setSelectedStore } = useSelectedStoreStore();
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedStore, setLocalSelectedStore] = useState<Store | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [userStores, setUserStores] = useState<Store[]>([]);

  // Initialize from Zustand store
  useEffect(() => {
    if (zustandSelectedStore) {
      setLocalSelectedStore(zustandSelectedStore);
      console.log("🔄 Sidebar: Synced with Zustand store:", zustandSelectedStore.name);
    }
    setIsMounted(true);
  }, [zustandSelectedStore]);

  useEffect(() => {
    let isActive = true;

    const loadStores = async () => {
      try {
        const response = await authService.me();
        if (!isActive || !response.success) {
          return;
        }

        const stores: Store[] = response.data.stores?.map((userStore) => ({
          id: userStore.store.id,
          name: userStore.store.name,
          metadata: (userStore.store.metadata || {}) as any,
          isActive: userStore.store.isActive ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })) || [];

        setUserStores(stores);
        // console.log(response)
      } catch {
        if (isActive) {
          setUserStores([]);
        }
      }
    };

    loadStores();

    return () => {
      isActive = false;
    };
  }, []);

  const currentStoreName = selectedStore?.name || "Select Store";


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
          "flex h-14 items-center border-b px-2 sm:px-3  sm:py-3",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="Pizza Dashboard Logo" 
              width={32} 
              height={32}
              className="h-8 w-8"
            />
            <span className="font-semibold text-sidebar-foreground">
              Pizza Dashboard
            </span>
          </Link>
        )}
        {collapsed && (
          <Image 
            src="/logo.svg" 
            alt="Pizza Dashboard Logo" 
            width={32} 
            height={32}
            className="h-8 w-8"
          />
        )}
      </div>
      {/* Store selection */}
      <div className="px-3 pt-2 pb-0">
        <Button
          variant="outline"
          className="w-full justify-start text-xs sm:text-sm"
          onClick={() => setIsStoreModalOpen(true)}
        >
          <Building2 className="me-2 h-4 w-4" />
          {!collapsed && <span className="truncate">{currentStoreName}</span>}
        </Button>
      </div>

      {/* Store Selection Modal */}
      <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
        <DialogContent className="w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>{t("selectStore") || "Select Store"}</DialogTitle>
            <DialogDescription>
              {t("selectStoreDescription") || "Choose a store to manage"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {userStores && userStores.length > 0 ? (
              <div className="space-y-2">
                {userStores.map((store) => (
                  <Button
                    key={store.id}
                    variant={selectedStore?.id === store.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => {
                      setLocalSelectedStore(store);
                      setSelectedStore(store); // Update Zustand store
                      console.log("✅ Store selected from sidebar:", store.name);
                      setIsStoreModalOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "me-2 h-4 w-4",
                        selectedStore?.id === store.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{store.name}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t("noStoresAvailable") || "No stores available"}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>


      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 sm:px-3 py-2 sm:py-3">
        {navItems.map((item, index) => {
          const basePath = `/${locale}/dashboard`;
          const isActive =
            pathname === item.href ||
            (item.href !== basePath && pathname.startsWith(item.href));

          return (
            <div key={item.href}>
              <Link
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

              {/* User Management Dropdown - Show after Stores */}
              {item.href === `/${locale}/dashboard/stores` && (
                <DropdownMenu open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        userManagementItems.some(item => 
                          pathname === item.href || pathname.startsWith(item.href)
                        )
                          ? "text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Users className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <>
                          <span>User Management</span>
                          <ChevronDown className={cn("h-4 w-4 ms-auto transition-transform", isUserManagementOpen && "rotate-180")} />
                        </>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRtl ? "end" : "start"} className="w-56">
                    <DropdownMenuLabel>User Management</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userManagementItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} onClick={onNavigate} className="cursor-pointer flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}

        {/* Dev Tools Section */}
        {/* {devToolsItems.length > 0 && (
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
        )} */}
      </nav>

      <Separator />

      {/* User Menu - conditionally rendered */}
      <Feature name="userMenu">
        <div className={cn("px-2 sm:px-3 py-2 sm:py-3", collapsed && "flex justify-center")}>
          <UserMenu collapsed={collapsed} />
        </div>
      </Feature>

      {/* Collapse Toggle (desktop only) */}
      <div className="hidden border-t px-2 sm:px-3 py-2 md:block">
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
