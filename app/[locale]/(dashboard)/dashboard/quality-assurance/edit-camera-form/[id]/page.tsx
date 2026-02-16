"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle, ArrowLeft, Paperclip, X } from "lucide-react";
import { qaService } from "@/lib/api/services/qa.service";
import {
  useStoresForCameraForm,
  useEntitiesForCameraForm,
} from "@/lib/hooks/use-camera-form";
import type {
  CameraFormAttachment,
  CameraFormEntityEntry,
} from "@/types/qa.types";

const RATINGS = [
  { id: 1, label: "Pass" },
  { id: 2, label: "Fail" },
  { id: 3, label: "Not Done" },
  { id: 4, label: "Camera Fail" },
  { id: 5, label: "Auto Fail" },
  { id: 6, label: "Urgent" },
] as const;


export default function EditCameraFormPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const formId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [storeId, setStoreId] = useState("");
  const [date, setDate] = useState("");
  const [entityRatings, setEntityRatings] = useState<
    Record<number, string>
  >({});
  const [entityNotes, setEntityNotes] = useState<Record<number, string>>({});
  const [entityFiles, setEntityFiles] = useState<Record<number, File[]>>({});
  const [existingAttachments, setExistingAttachments] = useState<
    Record<number, CameraFormAttachment[]>
  >({});

  const {
    stores,
    isLoading: isStoresLoading,
  } = useStoresForCameraForm();

  const {
    entities,
    categories,
    isLoading: isEntitiesLoading,
  } = useEntitiesForCameraForm();

  // Load existing form data
  useEffect(() => {
    async function loadFormData() {
      try {
        setIsLoading(true);
        // Fetch camera forms list and find the specific one
        const response = await qaService.getCameraForms({ page: 1 });
        const audit = response.audits.find((a) => a.id === Number(formId));

        if (audit) {
          setStoreId(String(audit.storeId));
          // Convert ISO datetime to yyyy-MM-dd format
          const dateOnly = audit.date.split('T')[0];
          setDate(dateOnly);

          // Set entity ratings from existing data
          const ratings: Record<number, string> = {};
          const notes: Record<number, string> = {};
          const attachments: Record<number, CameraFormAttachment[]> = {};
          for (const cf of audit.cameraForms) {
            ratings[cf.entityId] = String(cf.ratingId);
            const firstNote = cf.notes?.[0];
            if (firstNote?.note) {
              notes[cf.entityId] = firstNote.note;
            }
            if (firstNote?.attachments?.length) {
              attachments[cf.entityId] = firstNote.attachments;
            }
          }
          setEntityRatings(ratings);
          setEntityNotes(notes);
          setExistingAttachments(attachments);
        } else {
          setError("Camera form not found.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load camera form."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (formId) {
      loadFormData();
    }
  }, [formId]);

  const handleRatingChange = (entityId: number, ratingId: string) => {
    setEntityRatings((prev) => ({
      ...prev,
      [entityId]: ratingId,
    }));
  };

  const handleNoteChange = useCallback((entityId: number, note: string) => {
    setEntityNotes((prev) => ({ ...prev, [entityId]: note }));
  }, []);

  const handleFilesChange = useCallback(
    (entityId: number, files: FileList | null) => {
      if (!files || files.length === 0) return;
      setEntityFiles((prev) => ({
        ...prev,
        [entityId]: [...(prev[entityId] || []), ...Array.from(files)],
      }));
    },
    []
  );

  const handleRemoveFile = useCallback(
    (entityId: number, fileIndex: number) => {
      setEntityFiles((prev) => ({
        ...prev,
        [entityId]: (prev[entityId] || []).filter((_, i) => i !== fileIndex),
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const entityEntries: CameraFormEntityEntry[] = Object.entries(
        entityRatings
      ).map(([entityId, ratingId]) => {
        const note = entityNotes[Number(entityId)]?.trim();
        const attachments = entityFiles[Number(entityId)];
        return {
          entity_id: Number(entityId),
          rating_id: Number(ratingId),
          ...(note ? { note } : {}),
          ...(attachments?.length ? { attachments } : {}),
        };
      });

      if (entityEntries.length === 0) {
        setError("Please rate at least one entity.");
        setIsSubmitting(false);
        return;
      }

      await qaService.updateCameraForm(
        Number(formId),
        Number(storeId),
        date,
        entityEntries
      );

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/dashboard/quality-assurance`);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update camera form."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Camera Form"
        description={`Editing camera form #${formId}`}
      >
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/${locale}/dashboard/quality-assurance`)
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-4xl">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 text-green-700">
            <AlertDescription>
              Camera form updated successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
              <CardDescription>
                Update the store and date for this camera form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Store</Label>
                  <Select
                    value={storeId}
                    onValueChange={setStoreId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {isStoresLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        stores.map((store) => (
                          <SelectItem
                            key={store.id}
                            value={String(store.id)}
                          >
                            {store.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entity Details</CardTitle>
              <CardDescription>
                Update the rating, notes, and attachments for each entity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEntitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {categories.map((category) => {
                    const categoryEntities = entities.filter(
                      (e) => e.categoryId === category.id
                    );
                    if (categoryEntities.length === 0) return null;

                    return (
                      <div key={category.id} className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          {category.label}
                        </h4>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                          {categoryEntities.map((entity) => (
                            <div
                              key={entity.id}
                              className="rounded-lg border p-4"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                  {entity.entityLabel}
                                </Label>
                              </div>

                              <div className="mb-3 space-y-1.5">
                                <Label
                                  htmlFor={`rating-${entity.id}`}
                                  className="text-xs text-muted-foreground"
                                >
                                  Rating
                                </Label>
                                <Select
                                  value={entityRatings[entity.id] || ""}
                                  onValueChange={(value) =>
                                    handleRatingChange(entity.id, value)
                                  }
                                  disabled={isSubmitting}
                                >
                                  <SelectTrigger id={`rating-${entity.id}`}>
                                    <SelectValue placeholder="Select a rating" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {RATINGS.map((rating) => (
                                      <SelectItem
                                        key={rating.id}
                                        value={String(rating.id)}
                                      >
                                        {rating.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1.5">
                                <Label
                                  htmlFor={`note-${entity.id}`}
                                  className="text-xs text-muted-foreground"
                                >
                                  Note
                                </Label>
                                <Textarea
                                  id={`note-${entity.id}`}
                                  placeholder="Add a note"
                                  value={entityNotes[entity.id] || ""}
                                  onChange={(e) =>
                                    handleNoteChange(entity.id, e.target.value)
                                  }
                                  disabled={isSubmitting}
                                  rows={2}
                                  className="resize-none text-sm"
                                />
                              </div>

                              <div className="mt-3 space-y-1.5">
                                <Label
                                  htmlFor={`file-${entity.id}`}
                                  className="text-xs text-muted-foreground"
                                >
                                  Attachment
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                      document
                                        .getElementById(`file-${entity.id}`)
                                        ?.click();
                                    }}
                                  >
                                    <Paperclip className="me-1.5 h-3.5 w-3.5" />
                                    Attachment
                                  </Button>
                                  <Input
                                    id={`file-${entity.id}`}
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx"
                                    className="hidden"
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                      handleFilesChange(
                                        entity.id,
                                        e.target.files
                                      )
                                    }
                                  />
                                </div>

                                {existingAttachments[entity.id]?.length ? (
                                  <div className="mt-2 space-y-1">
                                    {existingAttachments[entity.id].map(
                                      (attachment) => (
                                        <a
                                          key={attachment.id}
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex items-center gap-2 rounded bg-muted/50 px-2 py-1 text-xs"
                                        >
                                          <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                                          <span className="min-w-0 flex-1 truncate">
                                            {attachment.path}
                                          </span>
                                        </a>
                                      )
                                    )}
                                  </div>
                                ) : null}

                                {entityFiles[entity.id]?.length ? (
                                  <div className="mt-2 space-y-1">
                                    {entityFiles[entity.id].map(
                                      (file, fileIdx) => (
                                        <div
                                          key={`${entity.id}-${fileIdx}`}
                                          className="flex items-center gap-2 rounded bg-muted/50 px-2 py-1 text-xs"
                                        >
                                          <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                                          <span className="min-w-0 flex-1 truncate">
                                            {file.name}
                                          </span>
                                          <span className="shrink-0 text-muted-foreground">
                                            {(file.size / 1024).toFixed(0)}KB
                                          </span>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0"
                                            disabled={isSubmitting}
                                            onClick={() =>
                                              handleRemoveFile(
                                                entity.id,
                                                fileIdx
                                              )
                                            }
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/${locale}/dashboard/quality-assurance`)
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !storeId || !date}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Camera Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
