"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MoreHorizontal,
  Eye,
  Trash2,
  Building2,
  Shield,
} from "lucide-react";
import { useUserAssignments } from "@/lib/hooks/use-assignments";
import { useUsers } from "@/lib/hooks/use-users";
import type { Assignment } from "@/types/assignment.types";

export default function AssignmentsByUserPage() {
  const t = useTranslations("assignments");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { users, isLoading: isLoadingUsers } = useUsers();
  const {
    assignments,
    isLoading,
    refetch,
  } = useUserAssignments(selectedUserId);

  const columns = [
    {
      key: "store",
      header: t("columns.store"),
      cell: (assignment: Assignment) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{assignment.store?.name || "-"}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: t("columns.role"),
      cell: (assignment: Assignment) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary">{assignment.role?.name || "-"}</Badge>
        </div>
      ),
    },
    {
      key: "assignedAt",
      header: t("columns.assignedAt"),
      cell: (assignment: Assignment) => (
        <span className="text-muted-foreground">
          {new Date(assignment.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (assignment: Assignment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  `/${locale}/dashboard/stores/${assignment.storeId}`
                )
              }
            >
              <Eye className="me-2 h-4 w-4" />
              {t("actions.viewStore")}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="me-2 h-4 w-4" />
              {t("actions.remove")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/${locale}/dashboard/assignments`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={t("byUser.pageTitle")}
          description={t("byUser.pageDescription")}
        />
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={selectedUserId || ""}
          onValueChange={(value: string) => setSelectedUserId(value || null)}
        >
          <SelectTrigger className="w-75">
            <SelectValue placeholder={t("selectUser")} />
          </SelectTrigger>
          <SelectContent>
            {users.map((user: { id: string; name: string; email: string }) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedUserId && (
        <DataTable
          data={assignments}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={t("noAssignmentsForUser")}
        />
      )}
    </div>
  );
}
