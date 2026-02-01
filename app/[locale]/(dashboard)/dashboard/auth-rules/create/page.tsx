"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { AuthRuleForm } from "@/components/auth-rules";

export default function CreateAuthRulePage() {
  const t = useTranslations("authRules");

  return (
    <div className="space-y-6">
      <PageHeader title={t("create.title")} description={t("create.description")} />
      <AuthRuleForm />
    </div>
  );
}
