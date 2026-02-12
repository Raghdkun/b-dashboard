"use client";

import { useTranslations } from "next-intl";
import { useQAEntitiesAndCategories } from "@/lib/hooks/use-qa-entities-and-categories";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  WifiOff,
  Clock,
  XCircle,
  Layers,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Skeleton                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function EntitiesAndCategoriesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Tabs skeleton */}
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:block space-y-4">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-full" />
              ))}
            </div>
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="space-y-3 md:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Error Card                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

const errorIcons: Record<string, typeof AlertTriangle> = {
  NOT_AUTHENTICATED: ShieldAlert,
  UNAUTHORIZED: ShieldAlert,
  FORBIDDEN: ShieldAlert,
  NETWORK_ERROR: WifiOff,
  TIMEOUT: Clock,
};

function ErrorCard({
  message,
  errorCode,
  onRetry,
  onDismiss,
}: {
  message: string;
  errorCode: string | null;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const t = useTranslations("qaEntitiesAndCategories");
  const Icon = errorIcons[errorCode ?? ""] ?? XCircle;
  const retryable = ["TIMEOUT", "NETWORK_ERROR", "SERVER_ERROR"].includes(
    errorCode ?? ""
  );

  return (
    <Card className="border-destructive/50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <Icon className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-destructive">
          {t("error.title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardHeader>
      <CardContent className="flex justify-center gap-2">
        {retryable && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="me-2 h-4 w-4" />
            {t("error.retry")}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          {t("error.dismiss")}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Empty State                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

function EmptyState({
  message,
  icon: Icon,
}: {
  message: string;
  icon: typeof Layers;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Page                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export default function EntitiesAndCategoriesPage() {
  const t = useTranslations("qaEntitiesAndCategories");
  const {
    entities,
    categories,
    isLoading,
    isRefreshing,
    error,
    errorCode,
    refetch,
    clearError,
  } = useQAEntitiesAndCategories();

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")}>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw
            className={cn(
              "me-2 h-4 w-4",
              isRefreshing && "animate-spin"
            )}
          />
          {isRefreshing ? t("refreshing") : t("refresh")}
        </Button>
      </PageHeader>

      {/* Loading */}
      {isLoading && <EntitiesAndCategoriesSkeleton />}

      {/* Error */}
      {error && !isLoading && (
        <ErrorCard
          message={error}
          errorCode={errorCode}
          onRetry={refetch}
          onDismiss={clearError}
        />
      )}

      {/* Data */}
      {!isLoading && !error && (
        <Tabs defaultValue="entities" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
            <TabsTrigger value="entities" className="gap-2">
              <Layers className="h-4 w-4" />
              <span>
                {t("tabs.entities")} ({entities.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              <span>
                {t("tabs.categories")} ({categories.length})
              </span>
            </TabsTrigger>
          </TabsList>

          {/* ──── Entities Tab ──── */}
          <TabsContent value="entities">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("entitiesTable.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entities.length === 0 ? (
                  <EmptyState
                    message={t("entitiesTable.noData")}
                    icon={Layers}
                  />
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("entitiesTable.columns.id")}</TableHead>
                            <TableHead>{t("entitiesTable.columns.entityLabel")}</TableHead>
                            <TableHead>{t("entitiesTable.columns.category")}</TableHead>
                            <TableHead>{t("entitiesTable.columns.dateRange")}</TableHead>
                            <TableHead>{t("entitiesTable.columns.reportType")}</TableHead>
                            <TableHead>{t("entitiesTable.columns.sortOrder")}</TableHead>
                            <TableHead>{t("entitiesTable.columns.active")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entities.map((entity) => (
                            <TableRow key={entity.id}>
                              <TableCell className="font-mono text-xs">
                                {entity.id}
                              </TableCell>
                              <TableCell className="font-medium max-w-[200px] truncate">
                                {entity.entityLabel}
                              </TableCell>
                              <TableCell>
                                {entity.categoryLabel ? (
                                  <Badge variant="outline">
                                    {entity.categoryLabel}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="capitalize">
                                  {entity.dateRangeType}
                                </Badge>
                              </TableCell>
                              <TableCell className="capitalize">
                                {entity.reportType || "—"}
                              </TableCell>
                              <TableCell>{entity.sortOrder}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={entity.active ? "default" : "destructive"}
                                >
                                  {entity.active
                                    ? t("entitiesTable.active")
                                    : t("entitiesTable.inactive")}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                      {entities.map((entity) => (
                        <div
                          key={entity.id}
                          className="rounded-lg border p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate max-w-[60%]">
                              {entity.entityLabel}
                            </span>
                            <Badge
                              variant={entity.active ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {entity.active
                                ? t("entitiesTable.active")
                                : t("entitiesTable.inactive")}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>{t("entitiesTable.columns.id")}: {entity.id}</span>
                            <span>
                              {t("entitiesTable.columns.category")}:{" "}
                              {entity.categoryLabel || "—"}
                            </span>
                            <span>
                              {t("entitiesTable.columns.dateRange")}:{" "}
                              <span className="capitalize">{entity.dateRangeType}</span>
                            </span>
                            <span>
                              {t("entitiesTable.columns.reportType")}:{" "}
                              <span className="capitalize">{entity.reportType || "—"}</span>
                            </span>
                            <span>
                              {t("entitiesTable.columns.sortOrder")}: {entity.sortOrder}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Count summary */}
                    <div className="mt-4 text-xs text-muted-foreground">
                      {t("showing", { count: entities.length })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ──── Categories Tab ──── */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("categoriesTable.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <EmptyState
                    message={t("categoriesTable.noData")}
                    icon={FolderOpen}
                  />
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("categoriesTable.columns.id")}</TableHead>
                            <TableHead>{t("categoriesTable.columns.label")}</TableHead>
                            <TableHead>{t("categoriesTable.columns.entitiesCount")}</TableHead>
                            <TableHead>{t("categoriesTable.columns.sortOrder")}</TableHead>
                            <TableHead>{t("categoriesTable.columns.createdAt")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categories.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell className="font-mono text-xs">
                                {category.id}
                              </TableCell>
                              <TableCell className="font-medium">
                                {category.label}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {category.entitiesCount}
                                </Badge>
                              </TableCell>
                              <TableCell>{category.sortOrder}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(category.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="rounded-lg border p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {category.label}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {category.entitiesCount}{" "}
                              {t("categoriesTable.columns.entitiesCount")}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              {t("categoriesTable.columns.id")}: {category.id}
                            </span>
                            <span>
                              {t("categoriesTable.columns.sortOrder")}:{" "}
                              {category.sortOrder}
                            </span>
                            <span>
                              {t("categoriesTable.columns.createdAt")}:{" "}
                              {new Date(category.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Count summary */}
                    <div className="mt-4 text-xs text-muted-foreground">
                      {t("showing", { count: categories.length })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
