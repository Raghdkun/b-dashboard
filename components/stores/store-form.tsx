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
import { Loader2, AlertCircle, Plus, X } from "lucide-react";
import { useCreateStore, useUpdateStore, useStoreDetails } from "@/lib/hooks/use-stores";
import type { Store, CreateStorePayload, UpdateStorePayload } from "@/types/store.types";

interface StoreFormProps {
  storeId?: string;
  onSuccess?: (store: Store) => void;
}

interface MetadataItem {
  key: string;
  value: string;
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
    metadata: {},
  });

  const [metadataItems, setMetadataItems] = useState<MetadataItem[]>([]);
  const [metadataError, setMetadataError] = useState<string>("");

  // Load store data when in edit mode
  useEffect(() => {
    if (storeId) {
      fetchStore();
    }
  }, [storeId, fetchStore]);

  // Populate form when store data is loaded
  useEffect(() => {
    if (existingStore && isEditMode) {
      const existingMetadata = existingStore.metadata || {};
      const metadataArray = Object.entries(existingMetadata).map(([key, value]) => ({
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
      }));

      setFormData({
        id: existingStore.id,
        name: existingStore.name,
        isActive: existingStore.isActive,
        metadata: existingMetadata,
      });
      setMetadataItems(metadataArray);
    }
  }, [existingStore, isEditMode]);

  const error = isEditMode ? updateError : createError;
  const isSubmitting = isEditMode ? isUpdating : isCreating;

  const handleChange = (field: keyof CreateStorePayload, value: unknown) => {
    setFormData((prev: CreateStorePayload) => ({ ...prev, [field]: value }));
  };

  const addMetadataItem = () => {
    setMetadataError("");
    setMetadataItems((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateMetadataItem = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updatedItems = [...metadataItems];
    updatedItems[index][field] = value;
    
    // Check for duplicate keys
    const keys = updatedItems.map((item) => item.key).filter((k) => k);
    const hasDuplicates = keys.length !== new Set(keys).size;
    
    if (hasDuplicates && field === "key") {
      setMetadataError("Duplicate keys are not allowed");
    } else {
      setMetadataError("");
    }
    
    setMetadataItems(updatedItems);
  };

  const removeMetadataItem = (index: number) => {
    setMetadataItems((prev) => prev.filter((_, i) => i !== index));
    setMetadataError("");
  };

  const buildMetadataObject = () => {
    const metadata: Record<string, string> = {};
    for (const item of metadataItems) {
      if (item.key && item.value) {
        metadata[item.key] = item.value;
      }
    }
    return metadata;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate keys before submitting
    const keys = metadataItems.map((item) => item.key).filter((k) => k);
    const hasDuplicates = keys.length !== new Set(keys).size;
    
    if (hasDuplicates) {
      setMetadataError("Duplicate keys are not allowed");
      return;
    }

    const metadataObject = buildMetadataObject();
    
    try {
      let result: Store;
      
      if (isEditMode && storeId) {
        // Update existing store
        const updatePayload: UpdateStorePayload = {
          name: formData.name,
          isActive: formData.isActive,
          metadata: metadataObject,
        };
        result = await updateStore(storeId, updatePayload);
      } else {
        // Create new store
        result = await createStore({
          ...formData,
          metadata: metadataObject,
        });
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
      {/* Metadata Section */}
      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>{t("form.metadata") || "Metadata"}</CardTitle>
            <CardDescription>{t("form.metadataDescription") || "Add custom key-value pairs for store metadata"}</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMetadataItem}
            className="w-full sm:w-auto"
          >
            <Plus className="me-2 h-4 w-4" />
            {t("form.addMetadata") || "Add Metadata"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {metadataError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{metadataError}</AlertDescription>
            </Alert>
          )}

          {metadataItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-muted-foreground p-4 sm:p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("form.noMetadata") || "No metadata items yet. Click 'Add Metadata' to create one."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {metadataItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2 items-start">
                    <div className="space-y-2">
                      <Label htmlFor={`metadata-key-${index}`} className="text-xs sm:text-sm">
                        Key
                      </Label>
                      <Input
                        id={`metadata-key-${index}`}
                        value={item.key}
                        onChange={(e) =>
                          updateMetadataItem(index, "key", e.target.value)
                        }
                        placeholder="e.g., timezone"
                        className="text-xs sm:text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`metadata-value-${index}`} className="text-xs sm:text-sm">
                        Value
                      </Label>
                      <Input
                        id={`metadata-value-${index}`}
                        value={item.value}
                        onChange={(e) =>
                          updateMetadataItem(index, "value", e.target.value)
                        }
                        placeholder="e.g., UTC+3"
                        className="text-xs sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMetadataItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="me-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/stores`)}
          className="w-full sm:w-auto"
        >
          {tCommon("cancel")}
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || metadataError.length > 0}
          className="w-full sm:w-auto"
        >
          {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {isEditMode ? tCommon("save") : t("form.create")}
        </Button>
      </div>
    </form>
  );
}
