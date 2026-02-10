"use client";

import { useTranslations } from "next-intl";
import { useMaintenance } from "@/lib/hooks/use-maintenance";
import { PageHeader } from "@/components/layout/page-header";
import { MaintenanceRequestsTable } from "@/components/maintenance/maintenance-requests-table";
import { MaintenanceEmptyState } from "@/components/maintenance/maintenance-empty-state";
import { MaintenanceErrorCard } from "@/components/maintenance/maintenance-error";
import { MaintenanceSkeleton } from "@/components/maintenance/maintenance-skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LIMIT_OPTIONS = [5, 10, 25, 50];

export default function MaintenancePage() {
  const t = useTranslations("maintenance");
  const [limit, setLimit] = useState(10);
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch,
    clearError,
    selectedStore,
  } = useMaintenance(limit);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
      >
        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(v) => setLimit(Number(v))}
          >
            <SelectTrigger className="w-25">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt} {t("rows")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw
              className={cn(
                "me-2 h-4 w-4",
                isRefreshing && "animate-spin"
              )}
            />
            {t("refresh")}
          </Button>
        </div>
      </PageHeader>

      {/* No store selected */}
      {!selectedStore && (
        <MaintenanceEmptyState type="no-store" />
      )}

      {/* Loading skeleton */}
      {selectedStore && isLoading && !data && <MaintenanceSkeleton />}

      {/* Error state */}
      {selectedStore && error && !data && (
        <MaintenanceErrorCard
          error={error}
          onRetry={() => refetch()}
          onClearError={clearError}
        />
      )}

      {/* Empty data */}
      {selectedStore && !isLoading && !error && data && data.data.length === 0 && (
        <MaintenanceEmptyState type="no-data" />
      )}

      {/* Data table */}
      {selectedStore && data && data.data.length > 0 && (
        <MaintenanceRequestsTable
          data={data}
          isRefreshing={isRefreshing}
        />
      )}
    </div>
  );
}
