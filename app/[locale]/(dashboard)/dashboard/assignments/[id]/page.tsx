"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignmentDetails } from "@/lib/hooks/use-assignments";
import {
  Users,
  Building2,
  Shield,
  Calendar,
  Pencil,
  ArrowLeft,
  User,
} from "lucide-react";

export default function AssignmentDetailsPage() {
  const t = useTranslations("assignments");
  const tCommon = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const assignmentId = params?.id as string;

  const { assignment, isLoading, fetchAssignment } =
    useAssignmentDetails(assignmentId);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId, fetchAssignment]);

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
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Users className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">{t("noAssignments")}</p>
        <Button onClick={() => router.push(`/${locale}/dashboard/assignments`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("cancel")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${assignment.user?.name || "User"} - ${assignment.store?.name || "Store"}`}
        description={`ID: ${assignment.id}`}
      >
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/assignments`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("cancel")}
        </Button>
        <Button
          onClick={() =>
            router.push(
              `/${locale}/dashboard/assignments/${assignment.id}/edit`
            )
          }
        >
          <Pencil className="h-4 w-4 mr-2" />
          {tCommon("edit")}
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("columns.user")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{assignment.user?.name || "-"}</p>
                <p className="text-sm text-muted-foreground">
                  {assignment.user?.email || "-"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(
                  `/${locale}/dashboard/users/${assignment.userId}`
                )
              }
            >
              {t("actions.viewUser")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("columns.store")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{assignment.store?.name || "-"}</p>
                <p className="text-sm text-muted-foreground">
                  ID: {assignment.storeId}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(
                  `/${locale}/dashboard/stores/${assignment.storeId}`
                )
              }
            >
              {t("actions.viewStore")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("columns.role")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{assignment.role?.name || "-"}</p>
                <Badge variant="outline" className="mt-1">
                  {assignment.role?.guardName || "web"}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(`/${locale}/dashboard/roles/${assignment.roleId}`)
              }
            >
              View Role
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Assignment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("columns.assignedAt")}
              </span>
              <span className="font-medium">
                {(assignment.assignedAt || assignment.createdAt)
                  ? new Date(assignment.assignedAt || assignment.createdAt).toLocaleString()
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Assignment ID
              </span>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {assignment.id}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
