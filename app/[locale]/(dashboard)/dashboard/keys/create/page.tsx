"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useCreateKey } from "@/lib/hooks/use-keys";
import { PageHeader } from "@/components/layout/page-header";
import { KeyForm } from "@/components/keys/key-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { CreateKeyPayload } from "@/types/key.types";

export default function CreateKeyPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";

  const { createKey, isSubmitting, error, clearError } = useCreateKey();

  const handleSubmit = async (payload: CreateKeyPayload) => {
    clearError();
    const result = await createKey(payload);
    if (result) {
      toast.success("Key created successfully.");
      router.push(`/${locale}/dashboard/keys`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Key" description="Create a new engine key with store rules.">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${locale}/dashboard/keys`}>
            <ArrowLeft className="me-2 h-4 w-4" />
            Back to Keys
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-3xl">
        <KeyForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
          submitLabel="Create Key"
        />
      </div>
    </div>
  );
}
