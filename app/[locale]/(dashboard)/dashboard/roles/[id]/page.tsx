"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        title={t("details.title")}
        description={`${t("details.description")} ${role.name}`}
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              {t("form.basicInfo")}
            </CardTitle>
            <CardDescription>{t("form.basicInfoDescription") || "Core information about this role"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t("columns.name")}
              </span>
              <p className="text-sm font-medium">{role.name}</p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t("columns.guardName")}
              </span>
              <div>
                <Badge variant="outline" className="font-medium">{role.guardName}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t("columns.users")}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{role.usersCount || 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t("columns.createdAt")}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {role.createdAt
                    ? new Date(role.createdAt).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5" />
              {t("form.permissions")}
            </CardTitle>
            <CardDescription>{t("form.permissionsDescription") || "All permissions assigned to this role"}</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(permissionsByCategory).length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Object.entries(permissionsByCategory).map(
                  ([category, permissions]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-sm font-semibold capitalize flex items-center gap-2 text-foreground">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((permission: string) => (
                          <Badge
                            key={permission}
                            variant="secondary"
                            className="text-xs font-medium px-2 py-1"
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
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">{t("noPermissions") || "No permissions assigned"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
