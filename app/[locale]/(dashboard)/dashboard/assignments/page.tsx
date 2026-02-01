"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Building2,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AssignmentsPage() {
  const t = useTranslations("assignments");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")}>
        <Button
          onClick={() => router.push(`/${locale}/dashboard/assignments/create`)}
        >
          <UserPlus className="me-2 h-4 w-4" />
          {t("createAssignment")}
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <Link href={`/${locale}/dashboard/assignments/by-user`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>{t("byUser.title")}</CardTitle>
              </div>
              <CardDescription>{t("byUser.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t("byUser.hint")}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <Link href={`/${locale}/dashboard/assignments/by-store`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>{t("byStore.title")}</CardTitle>
              </div>
              <CardDescription>{t("byStore.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t("byStore.hint")}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("bulkAssignment.title")}</CardTitle>
          <CardDescription>{t("bulkAssignment.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/dashboard/assignments/bulk`)}
          >
            {t("bulkAssignment.start")}
            <ArrowRight className="ms-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
