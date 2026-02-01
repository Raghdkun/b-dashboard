"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoleDetails } from "@/lib/hooks/use-roles";
import {
  Shield,
  Key,
  Calendar,
  Pencil,
  ArrowLeft,
  Users,
  Lock,
} from "lucide-react";

export default function RoleDetailsPage() {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const roleId = params?.id as string;

  const { role, isLoading, fetchRole } = useRoleDetails(roleId);

  useEffect(() => {
    if (roleId) {
      fetchRole();
    }
  }, [roleId, fetchRole]);

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
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">{t("noRoles")}</p>
        <Button onClick={() => router.push(`/${locale}/dashboard/roles`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("cancel")}
        </Button>
      </div>
    );
  }

  // Group permissions by category
  const permissionsByCategory = (role.permissions || []).reduce(
    (acc: Record<string, string[]>, permission) => {
      const permName = permission.name;
      const [category] = permName.split(".");
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permName);
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.name}
        description={`ID: ${role.id}`}
      >
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/roles`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("cancel")}
        </Button>
        <Button
          onClick={() =>
            router.push(`/${locale}/dashboard/roles/${role.id}/edit`)
          }
        >
          <Pencil className="h-4 w-4 mr-2" />
          {t("actions.edit")}
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("form.basicInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("columns.name")}
              </span>
              <span className="font-medium">{role.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("columns.guardName")}
              </span>
              <Badge variant="outline">{role.guardName}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("columns.users")}
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {role.usersCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("columns.createdAt")}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {role.createdAt
                  ? new Date(role.createdAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t("form.permissions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(permissionsByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(
                  ([category, permissions]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium mb-2 capitalize flex items-center gap-2">
                        <Lock className="h-3 w-3" />
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {permissions.map((permission: string) => (
                          <Badge
                            key={permission}
                            variant="secondary"
                            className="text-xs"
                          >
                            {permission.split(".")[1] || permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No permissions assigned</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
