"use client";

import { useTranslations } from "next-intl";
import { useQA } from "@/lib/hooks/use-qa";
import { PageHeader } from "@/components/layout/page-header";
import { QAAuditsTable } from "@/components/qa/qa-audits-table";
import { QAEmptyState } from "@/components/qa/qa-empty-state";
import { QAErrorCard } from "@/components/qa/qa-error";
import { QASkeleton } from "@/components/qa/qa-skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QualityAssurancePage() {
  const t = useTranslations("qa");
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    currentPage,
    refetch,
    clearError,
    goToPage,
  } = useQA();

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")}>
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
      </PageHeader>

      {isLoading && !data && <QASkeleton />}

      {error && !data && (
        <QAErrorCard
          error={error}
          onRetry={() => refetch()}
          onClearError={clearError}
        />
      )}

      {!isLoading && !error && data && data.audits.length === 0 && (
        <QAEmptyState />
      )}

      {data && data.audits.length > 0 && (
        <QAAuditsTable
          data={data}
          isRefreshing={isRefreshing}
          currentPage={currentPage}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}
