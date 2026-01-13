"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { WidgetGrid, EditModeToolbar } from "@/components/dashboard";
import { useIsEditMode } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const isEditMode = useIsEditMode();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={isEditMode ? t("editMode") : t("welcome")}
      >
        <EditModeToolbar />
      </PageHeader>

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm text-primary">
          <strong>{t("editMode")}:</strong> {t("customizeDescription")}
        </div>
      )}

      {/* Widget Grid */}
      <div className={cn(
        "transition-all duration-200",
        isEditMode && "ring-2 ring-primary/20 rounded-lg p-4 -m-4"
      )}>
        <WidgetGrid />
      </div>
    </div>
  );
}
