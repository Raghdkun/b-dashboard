"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCreateQACategory } from "@/lib/hooks/use-qa-categories";
import type { CreateQACategoryPayload } from "@/types/qa.types";

const LABEL_MAX_LENGTH = 255;

export function QACategoryForm() {
  const t = useTranslations("qaCategories");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const { createCategory, isCreating, error, clearError } =
    useCreateQACategory();

  const [label, setLabel] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!label.trim()) {
      errors.label = t("validation.labelRequired");
    } else if (label.trim().length > LABEL_MAX_LENGTH) {
      errors.label = t("validation.labelMaxLength", {
        max: LABEL_MAX_LENGTH,
      });
    }

    if (sortOrder && isNaN(Number(sortOrder))) {
      errors.sortOrder = t("validation.sortOrderNumber");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    clearError();

    if (!validate()) return;

    const payload: CreateQACategoryPayload = {
      label: label.trim(),
      ...(sortOrder && { sort_order: Number(sortOrder) }),
    };

    const result = await createCategory(payload);

    if (result) {
      setSuccessMessage(
        t("success", { label: result.label })
      );
      setLabel("");
      setSortOrder("");
      setValidationErrors({});
    }
  };

  const handleReset = () => {
    setLabel("");
    setSortOrder("");
    setValidationErrors({});
    setSuccessMessage(null);
    clearError();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Alert */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("formTitle")}</CardTitle>
          <CardDescription>{t("formDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Label Field */}
          <div className="space-y-2">
            <Label htmlFor="label">
              {t("fields.label")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="label"
              type="text"
              placeholder={t("fields.labelPlaceholder")}
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (validationErrors.label) {
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next.label;
                    return next;
                  });
                }
              }}
              maxLength={LABEL_MAX_LENGTH}
              disabled={isCreating}
              aria-invalid={!!validationErrors.label}
              aria-describedby={
                validationErrors.label ? "label-error" : undefined
              }
              className={validationErrors.label ? "border-destructive" : ""}
            />
            <div className="flex items-center justify-between">
              {validationErrors.label ? (
                <p
                  id="label-error"
                  className="text-sm text-destructive"
                >
                  {validationErrors.label}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("fields.labelHint")}
                </p>
              )}
              <span className="text-xs text-muted-foreground">
                {label.length}/{LABEL_MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* Sort Order Field */}
          <div className="space-y-2">
            <Label htmlFor="sort_order">{t("fields.sortOrder")}</Label>
            <Input
              id="sort_order"
              type="number"
              placeholder={t("fields.sortOrderPlaceholder")}
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                if (validationErrors.sortOrder) {
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next.sortOrder;
                    return next;
                  });
                }
              }}
              min={0}
              disabled={isCreating}
              aria-invalid={!!validationErrors.sortOrder}
              aria-describedby={
                validationErrors.sortOrder ? "sort-order-error" : undefined
              }
              className={
                validationErrors.sortOrder ? "border-destructive" : ""
              }
            />
            {validationErrors.sortOrder ? (
              <p
                id="sort-order-error"
                className="text-sm text-destructive"
              >
                {validationErrors.sortOrder}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("fields.sortOrderHint")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isCreating}
        >
          {tCommon("reset")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            router.push(`/${locale}/dashboard/quality-assurance`)
          }
          disabled={isCreating}
        >
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isCreating || !label.trim()}>
          {isCreating && (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          )}
          {isCreating ? t("creating") : t("create")}
        </Button>
      </div>
    </form>
  );
}
