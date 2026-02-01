"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { HierarchyForm } from "@/components/hierarchy";

export default function CreateHierarchyPage() {
  const t = useTranslations("hierarchy");

  return (
    <div className="space-y-6">
      <PageHeader title={t("create.title")} description={t("create.description")} />
      <HierarchyForm />
    </div>
  );
}
