"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import axios from "axios";
import { toast } from "sonner";
import { qaService, QAError } from "@/lib/api/services/qa.service";
import type {
  QAEntityListCategory,
  UpdateQACategoryPayload,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
/*  Edit Category Dialog                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

interface EditCategoryDialogProps {
  category: QAEntityListCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function EditCategoryDialog({
  category,
  open,
  onOpenChange,
  onSuccess,
}: EditCategoryDialogProps) {
  const t = useTranslations("qaEntitiesAndCategories");

  const [label, setLabel] = useState(category.label);
  const [sortOrder, setSortOrder] = useState(category.sortOrder);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const resetForm = useCallback(() => {
    setLabel(category.label);
    setSortOrder(category.sortOrder);
    setValidationErrors({});
  }, [category]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!label.trim()) {
      errors.label = t("editCategoryDialog.validation.labelRequired");
    } else if (label.length > 255) {
      errors.label = t("editCategoryDialog.validation.labelMaxLength");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: UpdateQACategoryPayload = {
        label: label.trim(),
        sort_order: sortOrder,
      };

      await qaService.updateCategory(category.id, payload);
      toast.success(t("editCategoryDialog.success"));
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (isCanceledError(err)) return;
      const message =
        err instanceof QAError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("editCategoryDialog.error");
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
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>{t("editCategoryDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("editCategoryDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Label */}
          <div className="grid gap-2">
            <Label htmlFor="edit-category-label">
              {t("editCategoryDialog.label")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-category-label"
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
              placeholder={t("editCategoryDialog.labelPlaceholder")}
              maxLength={255}
              className={cn(
                validationErrors.label && "border-destructive"
              )}
            />
            {validationErrors.label && (
              <p className="text-xs text-destructive">
                {validationErrors.label}
              </p>
            )}
          </div>

          {/* Sort Order */}
          <div className="grid gap-2">
            <Label htmlFor="edit-category-sort-order">
              {t("editCategoryDialog.sortOrder")}
            </Label>
            <Input
              id="edit-category-sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            {t("editCategoryDialog.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {isSaving
              ? t("editCategoryDialog.saving")
              : t("editCategoryDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Delete Category Dialog                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

interface DeleteCategoryDialogProps {
  category: QAEntityListCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const t = useTranslations("qaEntitiesAndCategories");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await qaService.deleteCategory(category.id);
      toast.success(t("deleteCategoryDialog.success"));
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (isCanceledError(err)) return;
      const message =
        err instanceof QAError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("deleteCategoryDialog.error");
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("deleteCategoryDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteCategoryDialog.description", { name: category.label })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("deleteCategoryDialog.cancel")}
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
              ? t("deleteCategoryDialog.deleting")
              : t("deleteCategoryDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Category Actions Dropdown                                               */
/* ────────────────────────────────────────────────────────────────────────── */

interface CategoryActionsProps {
  category: QAEntityListCategory;
  onSuccess: () => void;
}

export function CategoryActions({
  category,
  onSuccess,
}: CategoryActionsProps) {
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
            aria-label={t("categoryActions.openMenu")}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="me-2 h-4 w-4" />
            {t("categoryActions.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="me-2 h-4 w-4" />
            {t("categoryActions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCategoryDialog
        category={category}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onSuccess}
      />

      <DeleteCategoryDialog
        category={category}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
