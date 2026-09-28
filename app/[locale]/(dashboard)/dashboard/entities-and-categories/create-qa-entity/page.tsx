"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { QAEntityForm } from "@/components/qa/qa-entity-form";

export default function CreateQAEntityPage() {
  const t = useTranslations("qaEntities");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="mx-auto max-w-2xl">
        <QAEntityForm />
      </div>
    </div>
  );
}
