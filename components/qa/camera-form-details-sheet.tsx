"use client";

import { format } from "date-fns";
import { useMemo } from "react";
import { useCameraFormDetail } from "@/lib/hooks/use-camera-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Calendar,
  FileText,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  User,
} from "lucide-react";
import type { CameraFormAudit, CameraFormEntryItem } from "@/types/qa.types";

function getRatingVariant(
  label: string
): "default" | "secondary" | "destructive" | "outline" {
  const normalized = label.toLowerCase();
  if (normalized === "pass") return "default";
  if (
    normalized === "fail" ||
    normalized === "auto fail" ||
    normalized === "autofail" ||
    normalized === "urgent"
  ) {
    return "destructive";
  }
  return "secondary";
}

function groupEntriesByCategory(entries: CameraFormEntryItem[]) {
  return entries.reduce<Record<string, CameraFormEntryItem[]>>((acc, entry) => {
    const category = entry.entity.category.label;
    if (!acc[category]) acc[category] = [];
    acc[category].push(entry);
    return acc;
  }, {});
}

function attachmentLabel(url: string, path: string) {
  try {
    const urlFile = new URL(url).pathname.split("/").pop();
    if (urlFile) return decodeURIComponent(urlFile);
  } catch {
    // fallback to path parsing below
  }

  const pathFile = path.split("/").pop();
  return pathFile || "Attachment";
}

interface CameraFormDetailsSheetProps {
  auditId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CameraFormDetailsContent({ audit }: { audit: CameraFormAudit }) {
  const groupedEntries = useMemo(
    () => groupEntriesByCategory(audit.cameraForms),
    [audit.cameraForms]
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-2 px-4 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate" title={audit.store.store}>
            {audit.store.store}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4 shrink-0" />
          <span className="truncate" title={audit.user.email}>
            {audit.user.name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{format(new Date(audit.date), "MMM dd, yyyy")}</span>
        </div>
      </div>

      <Separator className="my-2" />

      <ScrollArea className="h-[calc(100vh-15.5rem)] px-4 pb-6 sm:h-[calc(100vh-14rem)]">
        {audit.cameraForms.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No entity entries found for this camera form.
          </p>
        ) : (
          <div className="space-y-5">
            {Object.entries(groupedEntries).map(([category, entries]) => (
              <section key={category} className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {category}
                </h4>

                <div className="space-y-2">
                  {entries.map((entry) => (
                    <article key={entry.id} className="rounded-lg border p-3">
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-5">
                          {entry.entity.entityLabel}
                        </p>
                        <Badge variant={getRatingVariant(entry.rating.label)}>
                          {entry.rating.label}
                        </Badge>
                      </div>

                      {entry.notes.length > 0 ? (
                        <div className="space-y-2">
                          {entry.notes.map((note) => (
                            <div key={note.id} className="rounded-md bg-muted/35 p-2.5">
                              <p className="mb-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span className="whitespace-pre-wrap wrap-break-word">{note.note}</span>
                              </p>

                              {note.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 pl-5">
                                  {note.attachments.map((attachment) => (
                                    <a
                                      key={attachment.id}
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
                                    >
                                      <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                                      <span className="truncate">
                                        {attachmentLabel(attachment.url, attachment.path)}
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No notes.</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
}

export function CameraFormDetailsSheet({
  auditId,
  open,
  onOpenChange,
}: CameraFormDetailsSheetProps) {
  const activeAuditId = open ? auditId : null;
  const { audit, isLoading, error, refetch } = useCameraFormDetail(activeAuditId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full p-0 sm:max-w-xl md:max-w-2xl">
        <SheetHeader className="border-b pb-3">
          <SheetTitle>Camera Form Details</SheetTitle>
          <SheetDescription>
            {audit ? `Form #${audit.id}` : auditId ? `Form #${auditId}` : "Form details"}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading camera form details...
          </div>
        ) : error ? (
          <div className="space-y-3 p-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="w-fit">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : audit ? (
          <CameraFormDetailsContent audit={audit} />
        ) : (
          <p className="p-4 text-sm text-muted-foreground">No details available.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
