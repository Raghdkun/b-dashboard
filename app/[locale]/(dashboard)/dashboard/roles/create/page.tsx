"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { RoleForm } from "@/components/roles";

export default function CreateRolePage() {
  const t = useTranslations("roles");

  return (
    <div className="space-y-6">
      <PageHeader title={t("create.title")} description={t("create.description")} />
      <RoleForm />
    </div>
  );
}
