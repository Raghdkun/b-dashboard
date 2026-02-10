"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import type { MaintenanceResponse } from "@/types/maintenance.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Wrench,
} from "lucide-react";

interface MaintenanceRequestsTableProps {
  data: MaintenanceResponse;
  isRefreshing: boolean;
}

const statusConfig: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  done: {
    variant: "default",
    icon: CheckCircle2,
    className:
      "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/30",
  },
  in_progress: {
    variant: "secondary",
    icon: Clock,
    className:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/30",
  },
  pending: {
    variant: "outline",
    icon: AlertCircle,
    className:
      "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/30",
  },
  cancelled: {
    variant: "destructive",
    icon: XCircle,
    className:
      "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/30",
  },
};

function getStatusConfig(status: string) {
  return (
    statusConfig[status] ?? {
      variant: "outline" as const,
      icon: AlertCircle,
      className: "",
    }
  );
}

function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MaintenanceRequestsTable({
  data,
  isRefreshing,
}: MaintenanceRequestsTableProps) {
  const t = useTranslations("maintenance");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {data.storeName}
            </CardTitle>
            <CardDescription>
              {t("storeNumber")}: {data.storeNumber} &middot;{" "}
              {t("showing", { count: data.count })}
            </CardDescription>
          </div>
          {isRefreshing && (
            <span className="text-xs text-muted-foreground animate-pulse">
              {t("refreshing")}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">{t("columns.id")}</TableHead>
                <TableHead>{t("columns.entryNumber")}</TableHead>
                <TableHead>{t("columns.brokenItem")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.submittedAt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((request) => {
                const config = getStatusConfig(request.status);
                const StatusIcon = config.icon;

                return (
                  <TableRow
                    key={request.id}
                    className={cn(isRefreshing && "opacity-60")}
                  >
                    <TableCell className="font-mono text-sm">
                      #{request.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.entryNumber}
                    </TableCell>
                    <TableCell>{request.brokenItem}</TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1", config.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {formatStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(
                        new Date(request.submittedAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {data.data.map((request) => {
            const config = getStatusConfig(request.status);
            const StatusIcon = config.icon;

            return (
              <div
                key={request.id}
                className={cn(
                  "rounded-lg border p-4 space-y-3",
                  isRefreshing && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">
                    #{request.id}
                  </span>
                  <Badge className={cn("gap-1", config.className)}>
                    <StatusIcon className="h-3 w-3" />
                    {formatStatusLabel(request.status)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("columns.entryNumber")}
                    </span>
                    <span className="text-sm font-medium">
                      {request.entryNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("columns.brokenItem")}
                    </span>
                    <span className="text-sm font-medium">
                      {request.brokenItem}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("columns.submittedAt")}
                    </span>
                    <span className="text-sm">
                      {format(
                        new Date(request.submittedAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
