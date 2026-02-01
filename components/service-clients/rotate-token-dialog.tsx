"use client";

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
import { Loader2 } from "lucide-react";
import { useRotateToken } from "@/lib/hooks/use-service-clients";

const rotateTokenSchema = z.object({
  expiresAt: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof rotateTokenSchema>;

interface RotateTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
  clientName?: string;
}

export function RotateTokenDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
}: RotateTokenDialogProps) {
  const { isRotating, error, rotate, clearErrors } = useRotateToken();

  const form = useForm<FormValues>({
    resolver: zodResolver(rotateTokenSchema),
    defaultValues: {
      expiresAt: null,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!clientId) return;
    try {
      await rotate(clientId, {
        expiresAt: data.expiresAt || null,
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
          <DialogTitle>Rotate Token</DialogTitle>
          <DialogDescription>
            Generate a new token for {clientName || "this service client"}. The old token will be invalidated immediately.
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
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty to keep the same expiration policy.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isRotating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isRotating}>
                {isRotating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Rotate Token
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
