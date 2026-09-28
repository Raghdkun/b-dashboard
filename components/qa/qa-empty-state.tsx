"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export function QAEmptyState() {
  const t = useTranslations("qa");

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle>{t("noData.title")}</CardTitle>
        <CardDescription>{t("noData.description")}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("noData.hint")}
        </p>
      </CardContent>
    </Card>
  );
}
