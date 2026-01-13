"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  pathname: string;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href: string;
  key: string;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentPath,
      key: segment,
    });
  }

  return breadcrumbs;
}

export function Breadcrumbs({ pathname, className }: BreadcrumbsProps) {
  const t = useTranslations("breadcrumbs");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const breadcrumbs = generateBreadcrumbs(pathname);

  // Get translated label for a breadcrumb key
  const getLabel = (key: string) => {
    try {
      return t(key);
    } catch {
      return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={tNav("breadcrumb")}
      className={cn("flex items-center text-sm", className)}
    >
      <ol className="flex items-center gap-1.5">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">{tCommon("home")}</span>
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const label = getLabel(crumb.key);
          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {isLast ? (
                <span className="font-medium text-foreground">{label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
