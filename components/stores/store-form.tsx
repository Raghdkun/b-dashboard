"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle } from "lucide-react";
import { useCreateStore, useUpdateStore, useStoreDetails } from "@/lib/hooks/use-stores";
import type { Store, CreateStorePayload, UpdateStorePayload } from "@/types/store.types";

interface StoreFormProps {
  storeId?: string;
  onSuccess?: (store: Store) => void;
}

export function StoreForm({ storeId, onSuccess }: StoreFormProps) {
  const t = useTranslations("stores");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const isEditMode = Boolean(storeId);
  
  // Hooks for create and update
  const { createStore, isCreating, error: createError } = useCreateStore();
  const { updateStore, isUpdating, error: updateError } = useUpdateStore();
  const { store: existingStore, isLoading: isLoadingStore, fetchStore } = useStoreDetails(storeId || "");

  const [formData, setFormData] = useState<CreateStorePayload>({
    id: "",
    name: "",
    isActive: true,
    metadata: {
      address: "",
      phone: "",
      email: "",
      managerId: "",
    },
  });

  // Load store data when in edit mode
  useEffect(() => {
    if (storeId) {
      fetchStore();
    }
  }, [storeId, fetchStore]);

  // Populate form when store data is loaded
  useEffect(() => {
    if (existingStore && isEditMode) {
      setFormData({
        id: existingStore.id,
        name: existingStore.name,
        isActive: existingStore.isActive,
        metadata: {
          address: existingStore.metadata?.address || "",
          phone: existingStore.metadata?.phone || "",
          email: existingStore.metadata?.email || "",
          managerId: existingStore.metadata?.managerId || "",
        },
      });
    }
  }, [existingStore, isEditMode]);

  const error = isEditMode ? updateError : createError;
  const isSubmitting = isEditMode ? isUpdating : isCreating;

  const handleChange = (field: keyof CreateStorePayload, value: unknown) => {
    setFormData((prev: CreateStorePayload) => ({ ...prev, [field]: value }));
  };

  const handleMetadataChange = (
    field: keyof NonNullable<CreateStorePayload["metadata"]>,
    value: string
  ) => {
    setFormData((prev: CreateStorePayload) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result: Store;
      
      if (isEditMode && storeId) {
        // Update existing store
        const updatePayload: UpdateStorePayload = {
          name: formData.name,
          isActive: formData.isActive,
          metadata: formData.metadata,
        };
        result = await updateStore(storeId, updatePayload);
      } else {
        // Create new store
        result = await createStore(formData);
      }
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/${locale}/dashboard/stores`);
      }
    } catch {
      // Error is handled by the hooks
    }
  };

  // Show loading skeleton while fetching store data in edit mode
  if (isEditMode && isLoadingStore) {
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
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="id">{t("form.storeId")}</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("id", e.target.value)}
                placeholder={t("form.storeIdPlaceholder")}
                required
              />
              <p className="text-sm text-muted-foreground">
                {t("form.storeIdDescription")}
              </p>
            </div>
          )}
          
          {isEditMode && (
            <div className="space-y-2">
              <Label>{t("form.storeId")}</Label>
              <p className="text-sm font-medium">{formData.id}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}
              placeholder={t("form.namePlaceholder")}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("form.status")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("form.statusDescription")}
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked: boolean) => handleChange("isActive", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("form.contactInfo")}</CardTitle>
          <CardDescription>{t("form.contactInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">{t("form.address")}</Label>
            <Input
              id="address"
              value={formData.metadata?.address || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMetadataChange("address", e.target.value)}
              placeholder={t("form.addressPlaceholder")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("form.phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.metadata?.phone || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMetadataChange("phone", e.target.value)}
                placeholder={t("form.phonePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("form.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.metadata?.email || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMetadataChange("email", e.target.value)}
                placeholder={t("form.emailPlaceholder")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/stores`)}
        >
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {isEditMode ? tCommon("save") : t("form.create")}
        </Button>
      </div>
    </form>
  );
}
