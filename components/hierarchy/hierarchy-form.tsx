"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useCreateHierarchy, useUpdateHierarchy, useHierarchyDetails } from "@/lib/hooks/use-hierarchy";
import { useStores } from "@/lib/hooks/use-stores";
import { useRoles } from "@/lib/hooks/use-roles";
import { useAuthStore } from "@/lib/auth/auth.store";
import type { RoleHierarchy, CreateHierarchyPayload, UpdateHierarchyPayload, HierarchyMetadata } from "@/types/hierarchy.types";

interface HierarchyFormProps {
  hierarchyId?: string;
  preselectedStoreId?: string;
  onSuccess?: (hierarchy: RoleHierarchy) => void;
}

export function HierarchyForm({
  hierarchyId,
  preselectedStoreId,
  onSuccess,
}: HierarchyFormProps) {
  const t = useTranslations("hierarchy");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const isEditMode = Boolean(hierarchyId);

  // Hooks for CRUD operations
  const { createHierarchy, isCreating, error: createError } = useCreateHierarchy();
  const { updateHierarchy, isUpdating, error: updateError } = useUpdateHierarchy();
  const { hierarchy: existingHierarchy, isLoading: isLoadingHierarchy, fetchHierarchy } = useHierarchyDetails(hierarchyId || "");
  const { stores, isLoading: isLoadingStores } = useStores();
  const { roles, isLoading: isLoadingRoles } = useRoles();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<CreateHierarchyPayload>({
    storeId: preselectedStoreId || "",
    parentRoleId: "",
    childRoleId: "",
    metadata: {
      createdBy: user?.email || "",
      reason: "",
    },
  });

  // Load hierarchy data when in edit mode
  useEffect(() => {
    if (hierarchyId) {
      fetchHierarchy();
    }
  }, [hierarchyId, fetchHierarchy]);

  // Populate form when hierarchy data is loaded
  useEffect(() => {
    if (existingHierarchy && isEditMode) {
      setFormData({
        storeId: existingHierarchy.storeId || "",
        parentRoleId: existingHierarchy.parentRoleId || existingHierarchy.higherRoleId || "",
        childRoleId: existingHierarchy.childRoleId || existingHierarchy.lowerRoleId || "",
        metadata: {
          createdBy: (existingHierarchy.metadata as HierarchyMetadata)?.createdBy || user?.email || "",
          reason: (existingHierarchy.metadata as HierarchyMetadata)?.reason || "",
        },
      });
    }
  }, [existingHierarchy, isEditMode, user?.email]);

  const error = isEditMode ? updateError : createError;
  const isSubmitting = isEditMode ? isUpdating : isCreating;

  const handleChange = (field: keyof CreateHierarchyPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMetadataChange = (field: keyof HierarchyMetadata, value: string) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value } as HierarchyMetadata,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result: RoleHierarchy;
      
      if (isEditMode && hierarchyId) {
        // Update existing hierarchy
        const updatePayload: UpdateHierarchyPayload = {
          storeId: formData.storeId,
          parentRoleId: formData.parentRoleId,
          childRoleId: formData.childRoleId,
          metadata: formData.metadata,
        };
        result = await updateHierarchy(hierarchyId, updatePayload);
      } else {
        // Create new hierarchy
        result = await createHierarchy(formData);
      }
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/${locale}/dashboard/hierarchy`);
      }
    } catch {
      // Error is handled by the hooks
    }
  };

  // Show loading skeleton while fetching hierarchy data in edit mode
  if (isEditMode && isLoadingHierarchy) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedParentRole = roles.find((r) => r.id === formData.parentRoleId);
  const selectedChildRole = roles.find((r) => r.id === formData.childRoleId);

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
          <CardTitle>{t("form.hierarchyDetails")}</CardTitle>
          <CardDescription>{t("form.hierarchyDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeId">{t("form.store")}</Label>
            <Select
              value={formData.storeId}
              onValueChange={(value: string) => handleChange("storeId", value)}
              disabled={!!preselectedStoreId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectStore")} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingStores ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  stores.map((store: { id: string; name: string }) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t("form.storeHint")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("form.roleRelationship")}</CardTitle>
          <CardDescription>
            {t("form.roleRelationshipDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr] items-end">
            <div className="space-y-2">
              <Label htmlFor="parentRoleId">{t("form.parentRole")}</Label>
              <Select
                value={formData.parentRoleId}
                onValueChange={(value: string) =>
                  handleChange("parentRoleId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectParentRole")} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingRoles ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    roles
                      .filter((r) => r.id !== formData.childRoleId)
                      .map((role: { id: string; name: string }) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t("form.parentRoleHint")}
              </p>
            </div>

            <div className="flex items-center justify-center pb-6">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="childRoleId">{t("form.childRole")}</Label>
              <Select
                value={formData.childRoleId}
                onValueChange={(value: string) =>
                  handleChange("childRoleId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectChildRole")} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingRoles ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    roles
                      .filter((r) => r.id !== formData.parentRoleId)
                      .map((role: { id: string; name: string }) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t("form.childRoleHint")}
              </p>
            </div>
          </div>

          {selectedParentRole && selectedChildRole && (
            <Alert>
              <AlertDescription>
                {t("form.previewRelationship", {
                  parent: selectedParentRole.name,
                  child: selectedChildRole.name,
                })}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("form.metadata")}</CardTitle>
          <CardDescription>{t("form.metadataDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="createdBy">{t("form.createdBy")}</Label>
            <Input
              id="createdBy"
              value={formData.metadata?.createdBy || ""}
              onChange={(e) => handleMetadataChange("createdBy", e.target.value)}
              placeholder={t("form.createdByPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t("form.reason")}</Label>
            <Textarea
              id="reason"
              value={formData.metadata?.reason || ""}
              onChange={(e) => handleMetadataChange("reason", e.target.value)}
              placeholder={t("form.reasonPlaceholder")}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              {t("form.reasonHint")}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/hierarchy`)}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !formData.storeId ||
            !formData.parentRoleId ||
            !formData.childRoleId
          }
        >
          {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {isEditMode ? tCommon("save") : t("form.create")}
        </Button>
      </div>
    </form>
  );
}
