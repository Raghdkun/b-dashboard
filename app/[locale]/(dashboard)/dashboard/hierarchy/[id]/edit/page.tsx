"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { HierarchyForm } from "@/components/hierarchy";

export default function EditHierarchyPage() {
  const t = useTranslations("hierarchy");
  const params = useParams();
  const hierarchyId = params?.id as string;

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t("edit.title")} 
        description={t("edit.description")} 
      />
      <HierarchyForm hierarchyId={hierarchyId} />
    </div>
  );
}
