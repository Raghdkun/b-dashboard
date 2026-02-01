"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Shield,
  TestTube,
} from "lucide-react";
import { useAuthRules } from "@/lib/hooks/use-auth-rules";
import type { AuthRule, HttpMethod } from "@/types/auth-rule.types";

const methodColors: Record<HttpMethod, string> = {
  GET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  PATCH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  OPTIONS: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  HEAD: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export default function AuthRulesPage() {
  const t = useTranslations("authRules");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const {
    rules,
    services,
    isLoading,
    filters,
    handleSearch,
    handleServiceFilter,
    refetch,
  } = useAuthRules();

  const columns = [
    {
      key: "service",
      header: t("columns.service"),
      cell: (rule: AuthRule) => (
        <Badge variant="outline">{rule.service}</Badge>
      ),
    },
    {
      key: "method",
      header: t("columns.method"),
      cell: (rule: AuthRule) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
            methodColors[rule.method]
          }`}
        >
          {rule.method}
        </span>
      ),
    },
    {
      key: "path",
      header: t("columns.path"),
      cell: (rule: AuthRule) => (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {rule.pathDsl || rule.routeName || "-"}
        </code>
      ),
    },
    {
      key: "authorization",
      header: t("columns.authorization"),
      cell: (rule: AuthRule) => (
        <div className="flex flex-wrap gap-1">
          {rule.rolesAny && rule.rolesAny.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {t("rolesAny", { count: rule.rolesAny.length })}
            </Badge>
          )}
          {rule.permissionsAny && rule.permissionsAny.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {t("permissionsAny", { count: rule.permissionsAny.length })}
            </Badge>
          )}
          {rule.permissionsAll && rule.permissionsAll.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {t("permissionsAll", { count: rule.permissionsAll.length })}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      header: t("columns.priority"),
      cell: (rule: AuthRule) => (
        <span className="text-muted-foreground">{rule.priority}</span>
      ),
    },
    {
      key: "status",
      header: t("columns.status"),
      cell: (rule: AuthRule) => (
        <Badge variant={rule.isActive ? "default" : "secondary"}>
          {rule.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (rule: AuthRule) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.push(`/${locale}/dashboard/auth-rules/${rule.id}`)
              }
            >
              <Eye className="me-2 h-4 w-4" />
              {t("actions.view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/${locale}/dashboard/auth-rules/${rule.id}/test`)
              }
            >
              <TestTube className="me-2 h-4 w-4" />
              {t("actions.test")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/${locale}/dashboard/auth-rules/${rule.id}/edit`)
              }
            >
              <Pencil className="me-2 h-4 w-4" />
              {t("actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="me-2 h-4 w-4" />
              {t("actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")}>
        <Button
          onClick={() => router.push(`/${locale}/dashboard/auth-rules/create`)}
        >
          <Plus className="me-2 h-4 w-4" />
          {t("addRule")}
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          {/* Search is handled by DataTable */}
        </div>
        <Select
          value={filters.service || "all"}
          onValueChange={(value) =>
            handleServiceFilter(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-50">
            <SelectValue placeholder={t("filterByService")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allServices")}</SelectItem>
            {services.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={rules}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder={t("searchPlaceholder")}
        onSearchChange={handleSearch}
        emptyMessage={t("noRules")}
      />
    </div>
  );
}
