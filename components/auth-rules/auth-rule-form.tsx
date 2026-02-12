"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, X, Plus } from "lucide-react";
import { useCreateAuthRule, useUpdateAuthRule } from "@/lib/hooks/use-auth-rules";
import { useRoles } from "@/lib/hooks/use-roles";
import type { AuthRule, HttpMethod, CreateAuthRulePayload, UpdateAuthRulePayload } from "@/types/auth-rule.types";

const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "ANY",
];

// Local form state type that allows both pathDsl and routeName
interface AuthRuleFormData {
  service: string;
  method: HttpMethod;
  pathDsl: string;
  routeName: string;
  rolesAny: string[];
  permissionsAny: string[];
  permissionsAll: string[];
  priority: number;
  isActive: boolean;
}

interface AuthRuleFormProps {
  /** Existing rule data for edit mode */
  rule?: AuthRule;
  /** If true, form operates in edit mode */
  mode?: "create" | "edit";
  onSuccess?: (rule: AuthRule) => void;
}

export function AuthRuleForm({ rule, mode = "create", onSuccess }: AuthRuleFormProps) {
  const t = useTranslations("authRules");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const { createRule, isCreating, error: createError } = useCreateAuthRule();
  const { updateRule, isUpdating, updateError } = useUpdateAuthRule(
    mode === "edit" && rule ? String(rule.id) : null
  );
  const { roles } = useRoles();

  const isEditMode = mode === "edit" && !!rule;
  const isBusy = isEditMode ? isUpdating : isCreating;
  const error = isEditMode ? updateError : createError;

  const [formData, setFormData] = useState<AuthRuleFormData>({
    service: rule?.service || "",
    method: rule?.method || "GET",
    pathDsl: rule?.pathDsl || rule?.path_dsl || "",
    routeName: rule?.routeName || rule?.route_name || "",
    rolesAny: rule?.rolesAny || rule?.roles_any || [],
    permissionsAny: rule?.permissionsAny || rule?.permissions_any || [],
    permissionsAll: rule?.permissionsAll || rule?.permissions_all || [],
    priority: rule?.priority || 1,
    isActive: rule?.isActive ?? rule?.is_active ?? true,
  });

  const [newPermission, setNewPermission] = useState("");

  const handleChange = (field: keyof AuthRuleFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRole = (roleName: string) => {
    if (!formData.rolesAny?.includes(roleName)) {
      setFormData((prev) => ({
        ...prev,
        rolesAny: [...(prev.rolesAny || []), roleName],
      }));
    }
  };

  const handleRemoveRole = (roleName: string) => {
    setFormData((prev) => ({
      ...prev,
      rolesAny: prev.rolesAny?.filter((name) => name !== roleName) || [],
    }));
  };

  const handleAddPermission = (type: "permissionsAny" | "permissionsAll") => {
    if (newPermission && !formData[type]?.includes(newPermission)) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...(prev[type] || []), newPermission],
      }));
      setNewPermission("");
    }
  };

  const handleRemovePermission = (
    type: "permissionsAny" | "permissionsAll",
    permission: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type]?.filter((p) => p !== permission) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result: AuthRule;

      if (isEditMode) {
        // Edit mode — send update payload
        const updatePayload: UpdateAuthRulePayload = {
          service: formData.service,
          method: formData.method,
          pathDsl: formData.pathDsl || undefined,
          routeName: formData.routeName || undefined,
          rolesAny: formData.rolesAny,
          permissionsAny: formData.permissionsAny,
          permissionsAll: formData.permissionsAll,
          priority: formData.priority,
          isActive: formData.isActive,
        };
        result = await updateRule(updatePayload);
      } else {
        // Create mode
        const payload: CreateAuthRulePayload = formData.pathDsl
          ? {
              service: formData.service,
              method: formData.method,
              pathDsl: formData.pathDsl,
              rolesAny: formData.rolesAny,
              permissionsAny: formData.permissionsAny,
              permissionsAll: formData.permissionsAll,
              priority: formData.priority,
              isActive: formData.isActive,
            }
          : formData.routeName
          ? {
              service: formData.service,
              method: formData.method,
              routeName: formData.routeName,
              rolesAny: formData.rolesAny,
              permissionsAny: formData.permissionsAny,
              permissionsAll: formData.permissionsAll,
              priority: formData.priority,
              isActive: formData.isActive,
            }
          : {
              service: formData.service,
              method: formData.method,
              pathDsl: "",
              rolesAny: formData.rolesAny,
              permissionsAny: formData.permissionsAny,
              permissionsAll: formData.permissionsAll,
              priority: formData.priority,
              isActive: formData.isActive,
            };
        result = await createRule(payload);
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/${locale}/dashboard/auth-rules`);
      }
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("form.routeInfo")}</CardTitle>
          <CardDescription>{t("form.routeInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="service">{t("form.service")}</Label>
              <Input
                id="service"
                value={formData.service}
                onChange={(e) => handleChange("service", e.target.value)}
                placeholder={t("form.servicePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">{t("form.method")}</Label>
              <Select
                value={formData.method}
                onValueChange={(value: HttpMethod) =>
                  handleChange("method", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pathDsl">{t("form.pathDsl")}</Label>
            <Input
              id="pathDsl"
              value={formData.pathDsl || ""}
              onChange={(e) => handleChange("pathDsl", e.target.value)}
              placeholder={t("form.pathDslPlaceholder")}
            />
            <p className="text-sm text-muted-foreground">
              {t("form.pathDslHint")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="routeName">{t("form.routeName")}</Label>
            <Input
              id="routeName"
              value={formData.routeName || ""}
              onChange={(e) => handleChange("routeName", e.target.value)}
              placeholder={t("form.routeNamePlaceholder")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">{t("form.priority")}</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  handleChange("priority", parseInt(e.target.value, 10))
                }
              />
            </div>

            <div className="flex items-center justify-between pt-6">
              <div className="space-y-0.5">
                <Label>{t("form.status")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("form.statusDescription")}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("form.authorization")}</CardTitle>
          <CardDescription>
            {t("form.authorizationDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>{t("form.rolesAny")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("form.rolesAnyHint")}
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.rolesAny?.map((roleName) => (
                  <Badge key={roleName} variant="secondary">
                    {roleName}
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(roleName)}
                      className="ms-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
              ))}
            </div>
            <Select onValueChange={handleAddRole}>
              <SelectTrigger className="w-50">
                <SelectValue placeholder={t("form.addRole")} />
              </SelectTrigger>
              <SelectContent>
                {roles
                  .filter((r) => !formData.rolesAny?.includes(r.name))
                  .map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>{t("form.permissionsAny")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("form.permissionsAnyHint")}
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.permissionsAny?.map((permission) => (
                <Badge key={permission} variant="secondary">
                  {permission}
                  <button
                    type="button"
                    onClick={() =>
                      handleRemovePermission("permissionsAny", permission)
                    }
                    className="ms-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                placeholder={t("form.permissionPlaceholder")}
                className="w-50"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleAddPermission("permissionsAny")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t("form.permissionsAll")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("form.permissionsAllHint")}
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.permissionsAll?.map((permission) => (
                <Badge key={permission} variant="secondary">
                  {permission}
                  <button
                    type="button"
                    onClick={() =>
                      handleRemovePermission("permissionsAll", permission)
                    }
                    className="ms-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                placeholder={t("form.permissionPlaceholder")}
                className="w-50"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleAddPermission("permissionsAll")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/auth-rules`)}
        >
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isBusy}>
          {isBusy && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {isEditMode ? tCommon("save") : t("form.create")}
        </Button>
      </div>
    </form>
  );
}
