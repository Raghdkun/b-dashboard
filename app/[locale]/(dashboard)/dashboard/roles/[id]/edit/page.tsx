"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { RoleForm } from "@/components/roles";

export default function EditRolePage() {
  const t = useTranslations("roles");
  const params = useParams();
  const roleId = params?.id as string;

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t("edit.title")} 
        description={t("edit.description")} 
      />
      <RoleForm roleId={roleId} />
    </div>
  );
}
