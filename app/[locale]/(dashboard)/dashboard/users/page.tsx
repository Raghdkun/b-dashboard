"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { userService } from "@/lib/api/services/user.service";
import type { User } from "@/types/user.types";

export default function UsersPage() {
  const t = useTranslations("users");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    {
      key: "user",
      header: t("columns.user"),
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="text-xs">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: t("columns.role"),
      cell: (user: User) => (
        <Badge variant="outline" className="capitalize">
          {user.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: t("columns.status"),
      cell: (user: User) => (
        <Badge
          variant={
            user.status === "active"
              ? "default"
              : user.status === "inactive"
              ? "secondary"
              : "outline"
          }
          className="capitalize"
        >
          {user.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t("columns.joined"),
      cell: (user: User) => (
        <span className="text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const fetchUsers = async (search?: string) => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers({
        search,
        pageSize: 20,
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchChange = (value: string) => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchUsers(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
      >
        <Button>
          <Plus className="me-2 h-4 w-4" />
          {t("addUser")}
        </Button>
      </PageHeader>

      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder={t("searchPlaceholder")}
        onSearchChange={handleSearchChange}
        emptyMessage={t("noUsers")}
      />
    </div>
  );
}
