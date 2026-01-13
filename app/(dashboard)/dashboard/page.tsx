"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Activity,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { userService } from "@/lib/api/services/user.service";
import type { User } from "@/types/user.types";

const columns = [
  {
    key: "name",
    header: "Name",
    cell: (user: User) => (
      <div className="font-medium">{user.name}</div>
    ),
  },
  {
    key: "email",
    header: "Email",
    cell: (user: User) => (
      <span className="text-muted-foreground">{user.email}</span>
    ),
  },
  {
    key: "role",
    header: "Role",
    cell: (user: User) => (
      <Badge variant="outline" className="capitalize">
        {user.role}
      </Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
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
];

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getUsers({ pageSize: 5 });
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your workspace."
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value="2,350"
          description="from last month"
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Active Now"
          value="573"
          description="currently online"
          icon={Activity}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Revenue"
          value="$45,231"
          description="from last month"
          icon={DollarSign}
          trend={{ value: 4.1, isPositive: true }}
        />
        <StatsCard
          title="Growth"
          value="+12.5%"
          description="compared to last quarter"
          icon={TrendingUp}
          trend={{ value: 2.3, isPositive: false }}
        />
      </div>

      {/* Recent Users Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Users</h2>
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No users found."
        />
      </div>
    </div>
  );
}
