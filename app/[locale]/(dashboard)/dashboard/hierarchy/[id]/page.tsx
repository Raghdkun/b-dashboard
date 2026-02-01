"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHierarchyDetails } from "@/lib/hooks/use-hierarchy";
import {
  GitBranch,
  Building2,
  Shield,
  Calendar,
  Pencil,
  ArrowLeft,
  ArrowDown,
} from "lucide-react";

export default function HierarchyDetailsPage() {
  const t = useTranslations("hierarchy");
  const tCommon = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const hierarchyId = params?.id as string;

  const { hierarchy, isLoading, fetchHierarchy } =
    useHierarchyDetails(hierarchyId);

  useEffect(() => {
    if (hierarchyId) {
      fetchHierarchy();
    }
  }, [hierarchyId, fetchHierarchy]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!hierarchy) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <GitBranch className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">{t("noHierarchy")}</p>
        <Button onClick={() => router.push(`/${locale}/dashboard/hierarchy`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("cancel")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${hierarchy.higherRole?.name || hierarchy.parentRole?.name || "Parent"} → ${hierarchy.lowerRole?.name || hierarchy.childRole?.name || "Child"}`}
        description={`ID: ${hierarchy.id}`}
      >
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/hierarchy`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("cancel")}
        </Button>
        <Button
          onClick={() =>
            router.push(
              `/${locale}/dashboard/hierarchy/${hierarchy.id}/edit`
            )
          }
        >
          <Pencil className="h-4 w-4 mr-2" />
          {tCommon("edit")}
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("form.store")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{hierarchy.store?.name || "-"}</p>
                <p className="text-sm text-muted-foreground">
                  ID: {hierarchy.storeId}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(`/${locale}/dashboard/stores/${hierarchy.storeId}`)
              }
            >
              View Store
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              {t("form.details")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Created
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {hierarchy.createdAt
                  ? new Date(hierarchy.createdAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Relationship
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 py-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">{hierarchy.higherRole?.name || hierarchy.parentRole?.name || "-"}</p>
              <Badge variant="outline" className="mt-1">
                {t("form.parentRole")}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Guard: {hierarchy.higherRole?.guardName || hierarchy.parentRole?.guardName || "web"}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <ArrowDown className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">
                Inherits from
              </span>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-2">
                <Shield className="h-8 w-8 text-secondary-foreground" />
              </div>
              <p className="font-medium">{hierarchy.lowerRole?.name || hierarchy.childRole?.name || "-"}</p>
              <Badge variant="secondary" className="mt-1">
                {t("form.childRole")}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Guard: {hierarchy.lowerRole?.guardName || hierarchy.childRole?.guardName || "web"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
