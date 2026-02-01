"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { AssignmentForm } from "@/components/assignments";

export default function CreateAssignmentPage() {
  const t = useTranslations("assignments");

  return (
    <div className="space-y-6">
      <PageHeader title={t("create.title")} description={t("create.description")} />
      <AssignmentForm />
    </div>
  );
}
