"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { StoreForm } from "@/components/stores";

export default function CreateStorePage() {
  const t = useTranslations("stores");

  return (
    <div className="space-y-6">
      <PageHeader title={t("create.title")} description={t("create.description")} />
      <StoreForm />
    </div>
  );
}
