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
  User,
  Shield,
} from "lucide-react";
import { useStoreAssignments } from "@/lib/hooks/use-assignments";
import { useStores } from "@/lib/hooks/use-stores";
import type { Assignment } from "@/types/assignment.types";

export default function AssignmentsByStorePage() {
  const t = useTranslations("assignments");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const { stores, isLoading: isLoadingStores } = useStores();
  const {
    assignments,
    isLoading,
    refetch,
  } = useStoreAssignments(selectedStoreId);

  const columns = [
    {
      key: "user",
      header: t("columns.user"),
      cell: (assignment: Assignment) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{assignment.user?.name}</div>
            <div className="text-sm text-muted-foreground">
              {assignment.user?.email}
            </div>
          </div>
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
                  `/${locale}/dashboard/users/${assignment.userId}`
                )
              }
            >
              <Eye className="me-2 h-4 w-4" />
              {t("actions.viewUser")}
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
          title={t("byStore.pageTitle")}
          description={t("byStore.pageDescription")}
        />
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={selectedStoreId || ""}
          onValueChange={(value: string) => setSelectedStoreId(value || null)}
        >
          <SelectTrigger className="w-75">
            <SelectValue placeholder={t("selectStore")} />
          </SelectTrigger>
          <SelectContent>
            {stores.map((store: { id: string; name: string }) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStoreId && (
        <DataTable
          data={assignments}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={t("noAssignmentsForStore")}
        />
      )}
    </div>
  );
}
