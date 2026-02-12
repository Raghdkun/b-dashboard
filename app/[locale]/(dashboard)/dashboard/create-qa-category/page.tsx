"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { QACategoryForm } from "@/components/qa/qa-category-form";

export default function CreateQACategoryPage() {
  const t = useTranslations("qaCategories");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="mx-auto max-w-2xl">
        <QACategoryForm />
      </div>
    </div>
  );
}
