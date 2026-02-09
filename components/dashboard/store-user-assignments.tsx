"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreAssignments } from "@/lib/hooks/use-assignments";
import { User, Mail, Shield, Calendar, Users } from "lucide-react";
import type { Assignment } from "@/types/assignment.types";

interface StoreUserAssignmentsProps {
  storeId: string;
}

export function StoreUserAssignments({ storeId }: StoreUserAssignmentsProps) {
  const t = useTranslations("assignments");
  const tCommon = useTranslations("common");
  const { assignments, isLoading } = useStoreAssignments(storeId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Log fetched assignments data
  useEffect(() => {
    // console.log("Assignments data:", assignments, "Type:", typeof assignments, "Is array:", Array.isArray(assignments));
    // if (mounted && Array.isArray(assignments) && assignments.length > 0) {
    //   console.log("Store User Assignments fetched:", assignments);
    // }
  }, [assignments, mounted]);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("storeAssignments.title") || "Store User Assignments"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("storeAssignments.title") || "Store User Assignments"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!Array.isArray(assignments) || assignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {t("noAssignments") || "No assignments found"}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t("columns.user") || "User"}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t("columns.email") || "Email"}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {t("columns.role") || "Role"}
                    </div>
                  </TableHead>
                  <TableHead>
                    {t("columns.status") || "Status"}
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t("columns.assigned") || "Assigned"}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(assignments) && assignments.map((assignment: Assignment) => {
                  const assignmentSnake = assignment as Assignment & {
                    is_active?: boolean;
                    created_at?: string;
                  };
                  return (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.user?.name || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {assignment.user?.email || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {assignment.role?.name || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={assignmentSnake.is_active ? "default" : "secondary"}
                      >
                        {assignmentSnake.is_active
                          ? t("status.active") || "Active"
                          : t("status.inactive") || "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(assignmentSnake.created_at || "").toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
