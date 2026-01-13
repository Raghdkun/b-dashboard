"use client";

import { useTranslations } from "next-intl";
import { useDashboardStore, useIsEditMode, useHasUnsavedChanges } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Settings2, Check, X, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function EditModeToolbar() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const isEditMode = useIsEditMode();
  const hasChanges = useHasUnsavedChanges();
  const { enterEditMode, exitEditMode, resetLayout } = useDashboardStore();

  if (!isEditMode) {
    return (
      <Button variant="outline" size="sm" onClick={enterEditMode}>
        <Settings2 className="h-4 w-4 me-2" />
        {t("customize")}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Reset button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 me-2" />
            {t("resetLayout")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("resetConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("resetConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={resetLayout}>{tCommon("reset")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel button */}
      {hasChanges ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <X className="h-4 w-4 me-2" />
              {t("cancelEdit")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("discardChanges.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("discardChanges.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon("keepEditing")}</AlertDialogCancel>
              <AlertDialogAction onClick={() => exitEditMode(false)}>
                {tCommon("discard")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => exitEditMode(false)}>
          <X className="h-4 w-4 me-2" />
          {t("cancelEdit")}
        </Button>
      )}

      {/* Save button */}
      <Button size="sm" onClick={() => exitEditMode(true)}>
        <Check className="h-4 w-4 me-2" />
        {t("saveLayout")}
      </Button>
    </div>
  );
}
