"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Loader2, AlertCircle } from "lucide-react";
import { useCreateAssignment } from "@/lib/hooks/use-assignments";
import { useUsers } from "@/lib/hooks/use-users";
import { useStores } from "@/lib/hooks/use-stores";
import { useRoles } from "@/lib/hooks/use-roles";
import type { Assignment, CreateAssignmentPayload } from "@/types/assignment.types";

interface AssignmentFormProps {
  assignment?: Assignment;
  preselectedUserId?: string;
  preselectedStoreId?: string;
  onSuccess?: (assignment: Assignment) => void;
}

export function AssignmentForm({
  assignment,
  preselectedUserId,
  preselectedStoreId,
  onSuccess,
}: AssignmentFormProps) {
  const t = useTranslations("assignments");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const { createAssignment, isCreating, error } = useCreateAssignment();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { stores, isLoading: isLoadingStores } = useStores();
  const { roles, isLoading: isLoadingRoles } = useRoles();

  const [formData, setFormData] = useState<CreateAssignmentPayload>({
    userId: assignment?.userId || preselectedUserId || "",
    storeId: assignment?.storeId || preselectedStoreId || "",
    roleId: assignment?.roleId || "",
  });

  const handleChange = (field: keyof CreateAssignmentPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createAssignment(formData);
      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/${locale}/dashboard/assignments`);
      }
    } catch {
      // Error is handled by the hook
    }
  };

  const isLoading = isLoadingUsers || isLoadingStores || isLoadingRoles;

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
          <CardTitle>{t("form.assignmentDetails")}</CardTitle>
          <CardDescription>{t("form.assignmentDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">{t("form.user")}</Label>
            <Select
              value={formData.userId}
              onValueChange={(value: string) => handleChange("userId", value)}
              disabled={!!preselectedUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectUser")} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  users.map((user: { id: string; name: string; email: string }) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleId">{t("form.role")}</Label>
            <Select
              value={formData.roleId}
              onValueChange={(value: string) => handleChange("roleId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRoles ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  roles.map((role: { id: string; name: string }) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/assignments`)}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isCreating || !formData.userId || !formData.storeId || !formData.roleId}
        >
          {isCreating && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {assignment ? tCommon("save") : t("form.create")}
        </Button>
      </div>
    </form>
  );
}
