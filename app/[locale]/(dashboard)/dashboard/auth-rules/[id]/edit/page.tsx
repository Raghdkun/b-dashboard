"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { AuthRuleForm } from "@/components/auth-rules";
import { useAuthRuleDetails } from "@/lib/hooks/use-auth-rules";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck } from "lucide-react";

export default function EditAuthRulePage() {
  const t = useTranslations("authRules");
  const params = useParams();
  const ruleId = params?.id as string;

  const { authRule, isLoading, fetchAuthRule } = useAuthRuleDetails(ruleId);

  useEffect(() => {
    if (ruleId) {
      fetchAuthRule();
    }
  }, [ruleId, fetchAuthRule]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!authRule) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <ShieldCheck className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">{t("noRules")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("edit.title")}
        description={t("edit.description")}
      />
      <AuthRuleForm rule={authRule} mode="edit" />
    </div>
  );
}
