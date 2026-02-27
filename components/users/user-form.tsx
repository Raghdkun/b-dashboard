"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, Eye, EyeOff, Shield, Lock } from "lucide-react";
import { useCreateUser } from "@/lib/hooks/use-users";
import { useRoles } from "@/lib/hooks/use-roles";
import { usePermissions } from "@/lib/hooks/use-permissions";
import type { User, CreateUserPayload } from "@/types/user.types";

interface UserFormProps {
  user?: User;
  onSuccess?: (user: User) => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const { createUser, isCreating, error } = useCreateUser();

  // Fetch all roles and permissions (use large perPage to get all in one page)
  const rolesParams = useMemo(() => ({ perPage: 100 }), []);
  const { roles, isLoading: isLoadingRoles } = useRoles(rolesParams);
  const { permissions, isLoading: isLoadingPermissions } = usePermissions({ perPage: 100 });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<CreateUserPayload>({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    passwordConfirmation: "",
    roles: user?.roles?.map((r) => r.name) || [],
    permissions: user?.permissions?.map((p) => p.name) || [],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = t("form.validation.nameRequired");
    }

    if (!formData.email.trim()) {
      errors.email = t("form.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t("form.validation.emailInvalid");
    }

    if (!user) {
      // Only validate password for new users
      if (!formData.password) {
        errors.password = t("form.validation.passwordRequired");
      } else if (formData.password.length < 8) {
        errors.password = t("form.validation.passwordMinLength");
      }

      if (!formData.passwordConfirmation) {
        errors.passwordConfirmation = t("form.validation.passwordMismatch");
      } else if (formData.password !== formData.passwordConfirmation) {
        errors.passwordConfirmation = t("form.validation.passwordMismatch");
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof CreateUserPayload, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when field is modified
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleRoleChange = (checked: boolean, roleName: string) => {
    const currentRoles = formData.roles ?? [];
    let newRoles: string[];

    if (checked) {
      newRoles = [...currentRoles, roleName];
    } else {
      newRoles = currentRoles.filter((name) => name !== roleName);
    }

    // Check if it's super-admin
    const isSuperAdmin =
      roleName.toLowerCase() === "super-admin" ||
      roleName.toLowerCase() === "super admin";

    let newPermissions = formData.permissions ?? [];

    if (checked && isSuperAdmin && permissions) {
      // If super-admin is being added, check all permissions
      newPermissions = permissions.map((p) => p.name);
    } else if (!checked && isSuperAdmin) {
      // If super-admin is being removed, uncheck all permissions
      newPermissions = [];
    }

    setFormData((prev) => ({
      ...prev,
      roles: newRoles,
      permissions: newPermissions,
    }));
  };

  const handlePermissionChange = (checked: boolean, permissionName: string) => {
    const currentPermissions = formData.permissions ?? [];
    const newPermissions = checked
      ? [...currentPermissions, permissionName]
      : currentPermissions.filter((name) => name !== permissionName);

    handleChange("permissions", newPermissions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await createUser(formData);
      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/${locale}/dashboard/users`);
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
          <CardTitle>{t("form.basicInfo")}</CardTitle>
          <CardDescription>{t("form.basicInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("name", e.target.value)
              }
              placeholder={t("form.namePlaceholder")}
              className={validationErrors.name ? "border-destructive" : ""}
            />
            {validationErrors.name && (
              <p className="text-sm text-destructive">{validationErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("form.email")}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("email", e.target.value)
              }
              placeholder={t("form.emailPlaceholder")}
              className={validationErrors.email ? "border-destructive" : ""}
            />
            {validationErrors.email && (
              <p className="text-sm text-destructive">{validationErrors.email}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("form.security")}</CardTitle>
          <CardDescription>{t("form.securityDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("form.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("password", e.target.value)
                }
                placeholder={t("form.passwordPlaceholder")}
                className={validationErrors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-destructive">{validationErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirmation">{t("form.confirmPassword")}</Label>
            <div className="relative">
              <Input
                id="passwordConfirmation"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.passwordConfirmation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("passwordConfirmation", e.target.value)
                }
                placeholder={t("form.confirmPasswordPlaceholder")}
                className={
                  validationErrors.passwordConfirmation
                    ? "border-destructive pr-10"
                    : "pr-10"
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {validationErrors.passwordConfirmation && (
              <p className="text-sm text-destructive">
                {validationErrors.passwordConfirmation}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("form.assignRoles")}
          </CardTitle>
          <CardDescription>
            {t("form.assignRolesDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRoles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : roles && roles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-input hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={(formData.roles ?? []).includes(role.name)}
                    onCheckedChange={(checked) => {
                      handleRoleChange(checked as boolean, role.name);
                    }}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`role-${role.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <p className="font-medium text-sm">{role.name}</p>
                    {role.permissions && role.permissions.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {role.permissions.length} permission
                        {role.permissions.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              {t("form.noRolesAvailable") || "No roles available"}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("form.additionalPermissions")}
          </CardTitle>
          <CardDescription>
            {t("form.additionalPermissionsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPermissions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : permissions && permissions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={(formData.permissions ?? []).includes(permission.name)}
                    onCheckedChange={(checked) => {
                      handlePermissionChange(checked as boolean, permission.name);
                    }}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={`permission-${permission.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <p className="text-sm font-medium leading-tight">
                      {permission.name}
                    </p>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              {t("form.noPermissionsAvailable") || "No permissions available"}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/users`)}
        >
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isCreating}>
          {isCreating && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {user ? tCommon("save") : t("createUser")}
        </Button>
      </div>
    </form>
  );
}
