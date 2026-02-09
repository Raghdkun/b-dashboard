"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { StoreForm } from "@/components/stores";

export default function EditStorePage() {
  const t = useTranslations("stores");
  const params = useParams();
  const storeId = params?.id as string;

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t("edit.title")} 
        description={t("edit.description")} 
      />
      <StoreForm storeId={storeId} />
    </div>
  );
}
