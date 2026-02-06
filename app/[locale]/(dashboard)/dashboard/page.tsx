"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { DsprDashboard } from "@/components/dspr";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("welcome")}
      />

      {/* DSPR Dashboard — real data from the API */}
      <DsprDashboard />
    </div>
  );
}
