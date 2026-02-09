"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useCreateServiceClient } from "@/lib/hooks/use-service-clients";

const createServiceClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  isActive: z.boolean(),
  expiresAt: z.string().optional().nullable(),
  notes: z.string().max(500, "Notes are too long").optional().nullable(),
});

type FormValues = z.infer<typeof createServiceClientSchema>;

interface CreateServiceClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateServiceClientDialog({
  open,
  onOpenChange,
}: CreateServiceClientDialogProps) {
  const { isCreating, error, createClient, clearErrors } = useCreateServiceClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(createServiceClientSchema),
    defaultValues: {
      name: "",
      isActive: true,
      expiresAt: null,
      notes: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createClient({
        name: data.name,
        isActive: data.isActive,
        expiresAt: data.expiresAt || null,
        notes: data.notes || null,
      });
      form.reset();
      onOpenChange(false);
    } catch {
      // Error is handled in store
    }
  };

  const handleClose = () => {
    form.reset();
    clearErrors();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Service Client</DialogTitle>
          <DialogDescription>
            Create a new service client for API access. The token will only be shown once.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My API Client" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this service client.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Enable or disable this service client.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty for no expiration.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this client..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
