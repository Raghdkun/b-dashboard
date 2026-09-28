"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import axios from "axios";
import { toast } from "sonner";
import { qaService, QAError } from "@/lib/api/services/qa.service";
import type {
  QAEntityWithCategory,
  QAEntityListCategory,
  UpdateQAEntityPayload,
} from "@/types/qa.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

function isCanceledError(err: unknown): boolean {
  if (axios.isCancel(err)) return true;
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error && err.name === "CanceledError") return true;
  return false;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Edit Entity Dialog                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

interface EditEntityDialogProps {
  entity: QAEntityWithCategory;
  categories: QAEntityListCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function EditEntityDialog({
  entity,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: EditEntityDialogProps) {
  const t = useTranslations("qaEntitiesAndCategories");

  const [entityLabel, setEntityLabel] = useState(entity.entityLabel);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    entity.categoryId
  );
  const [dateRangeType, setDateRangeType] = useState<"daily" | "weekly">(
    entity.dateRangeType as "daily" | "weekly"
  );
  const [reportType, setReportType] = useState(entity.reportType || "");
  const [sortOrder, setSortOrder] = useState(entity.sortOrder);
  const [active, setActive] = useState(entity.active);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const resetForm = useCallback(() => {
    setEntityLabel(entity.entityLabel);
    setCategoryId(entity.categoryId);
    setDateRangeType(entity.dateRangeType as "daily" | "weekly");
    setReportType(entity.reportType || "");
    setSortOrder(entity.sortOrder);
    setActive(entity.active);
    setValidationErrors({});
  }, [entity]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!entityLabel.trim()) {
      errors.entityLabel = t("editDialog.validation.labelRequired");
    } else if (entityLabel.length > 255) {
      errors.entityLabel = t("editDialog.validation.labelMaxLength");
    }

    if (!dateRangeType) {
      errors.dateRangeType = t("editDialog.validation.dateRangeRequired");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: UpdateQAEntityPayload = {
        entity_label: entityLabel.trim(),
        date_range_type: dateRangeType,
        active,
        ...(categoryId !== undefined && { category_id: categoryId }),
        ...(reportType.trim() && { report_type: reportType.trim() }),
        sort_order: sortOrder,
      };

      await qaService.updateEntity(entity.id, payload);
      toast.success(t("editDialog.success"));
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (isCanceledError(err)) return;
      const message =
        err instanceof QAError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("editDialog.error");
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>{t("editDialog.title")}</DialogTitle>
          <DialogDescription>{t("editDialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Entity Label */}
          <div className="grid gap-2">
            <Label htmlFor="edit-entity-label">
              {t("editDialog.entityLabel")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-entity-label"
              value={entityLabel}
              onChange={(e) => {
                setEntityLabel(e.target.value);
                if (validationErrors.entityLabel) {
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next.entityLabel;
                    return next;
                  });
                }
              }}
              placeholder={t("editDialog.entityLabelPlaceholder")}
              maxLength={255}
              className={cn(validationErrors.entityLabel && "border-destructive")}
            />
            {validationErrors.entityLabel && (
              <p className="text-xs text-destructive">
                {validationErrors.entityLabel}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="edit-category">
              {t("editDialog.category")}
            </Label>
            <Select
              value={categoryId !== undefined ? String(categoryId) : "none"}
              onValueChange={(val) =>
                setCategoryId(val === "none" ? undefined : Number(val))
              }
            >
              <SelectTrigger id="edit-category">
                <SelectValue placeholder={t("editDialog.categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t("editDialog.noCategory")}
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Type */}
          <div className="grid gap-2">
            <Label htmlFor="edit-date-range">
              {t("editDialog.dateRangeType")} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={dateRangeType}
              onValueChange={(val) =>
                setDateRangeType(val as "daily" | "weekly")
              }
            >
              <SelectTrigger
                id="edit-date-range"
                className={cn(
                  validationErrors.dateRangeType && "border-destructive"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.dateRangeType && (
              <p className="text-xs text-destructive">
                {validationErrors.dateRangeType}
              </p>
            )}
          </div>

          {/* Report Type & Sort Order — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-report-type">
                {t("editDialog.reportType")}
              </Label>
              <Select
                value={reportType || "none"}
                onValueChange={(val) =>
                  setReportType(val === "none" ? "" : val)
                }
              >
                <SelectTrigger id="edit-report-type">
                  <SelectValue placeholder={t("editDialog.reportTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="main">Main</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sort-order">
                {t("editDialog.sortOrder")}
              </Label>
              <Input
                id="edit-sort-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="edit-active" className="cursor-pointer">
              {t("editDialog.active")}
            </Label>
            <Switch
              id="edit-active"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            {t("editDialog.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {isSaving ? t("editDialog.saving") : t("editDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Delete Entity Dialog                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

interface DeleteEntityDialogProps {
  entity: QAEntityWithCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function DeleteEntityDialog({
  entity,
  open,
  onOpenChange,
  onSuccess,
}: DeleteEntityDialogProps) {
  const t = useTranslations("qaEntitiesAndCategories");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await qaService.deleteEntity(entity.id);
      toast.success(t("deleteDialog.success"));
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (isCanceledError(err)) return;
      const message =
        err instanceof QAError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("deleteDialog.error");
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDialog.description", { name: entity.entityLabel })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("deleteDialog.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            )}
            {isDeleting
              ? t("deleteDialog.deleting")
              : t("deleteDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Entity Actions Dropdown                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

interface EntityActionsProps {
  entity: QAEntityWithCategory;
  categories: QAEntityListCategory[];
  onSuccess: () => void;
}

export function EntityActions({
  entity,
  categories,
  onSuccess,
}: EntityActionsProps) {
  const t = useTranslations("qaEntitiesAndCategories");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={t("actions.openMenu")}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="me-2 h-4 w-4" />
            {t("actions.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="me-2 h-4 w-4" />
            {t("actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditEntityDialog
        entity={entity}
        categories={categories}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onSuccess}
      />

      <DeleteEntityDialog
        entity={entity}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
