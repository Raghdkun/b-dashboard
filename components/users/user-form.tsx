"use client";

import { useState } from "react";
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
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useCreateUser } from "@/lib/hooks/use-users";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<CreateUserPayload>({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    passwordConfirmation: "",
    roles: user?.roles?.map((r) => r.id) || [],
    permissions: user?.permissions?.map((p) => p.id) || [],
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

      if (formData.password !== formData.passwordConfirmation) {
        errors.passwordConfirmation = t("form.validation.passwordMismatch");
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof CreateUserPayload, value: unknown) => {
    setFormData((prev: CreateUserPayload) => ({ ...prev, [field]: value }));
    // Clear validation error when field is modified
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
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
