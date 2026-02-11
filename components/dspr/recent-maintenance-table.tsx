"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { useSelectedStoreStore } from "@/lib/store/selected-store.store";
import {
  maintenanceService,
  MaintenanceError,
} from "@/lib/api/services/maintenance.service";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Wrench,
  RefreshCw,
  ExternalLink,
  Loader2,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Status helpers                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

const statusConfig: Record<
  string,
  {
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  done: {
    icon: CheckCircle2,
    className:
      "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/30",
  },
  in_progress: {
    icon: Clock,
    className:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/30",
  },
  pending: {
    icon: AlertCircle,
    className:
      "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/30",
  },
  cancelled: {
    icon: XCircle,
    className:
      "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/30",
  },
  canceled: {
    icon: XCircle,
    className:
      "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/30",
  },
};

function getStatusConfig(status: string) {
  return (
    statusConfig[status] ?? {
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

/* ────────────────────────────────────────────────────────────────────────── */
/*  Skeleton                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function RecentMaintenanceSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-4 w-56 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Component                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export function RecentMaintenanceTable() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { selectedStore } = useSelectedStoreStore();
  const [data, setData] = useState<MaintenanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const storeId = selectedStore?.storeId ?? null;

  const fetchData = useCallback(async () => {
    if (!storeId) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const result = await maintenanceService.getRequests(
        storeId,
        1,
        controller.signal,
        3
      );
      if (!controller.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof MaintenanceError) {
        setError(err.message);
      } else {
        setError("Failed to load maintenance requests.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [storeId]);

  // Fetch on mount & when store changes
  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  // ── Loading state ────────────────────────────────────────────────────
  if (isLoading && !data) {
    return <RecentMaintenanceSkeleton />;
  }

  // ── No store selected ────────────────────────────────────────────────
  if (!storeId) {
    return null;
  }

  // ── Error state ──────────────────────────────────────────────────────
  if (error && !data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4" />
            Recent Maintenance Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5 me-1.5" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────
  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4" />
            Recent Maintenance Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p className="text-sm text-muted-foreground">
              No maintenance requests found.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Data table ───────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-4 w-4" />
              Recent Maintenance Requests
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Latest {data.data.length}{data.pagination?.total ? ` of ${data.pagination.total}` : data.count ? ` of ${data.count}` : ""} requests
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            {isLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={fetchData}
              disabled={isLoading}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              asChild
            >
              <Link href={`/${locale}/dashboard/maintenance`}>
                View All
                <ExternalLink className="h-3 w-3 ms-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Entry #</TableHead>
                <TableHead>Broken Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((request) => {
                const config = getStatusConfig(request.status);
                const StatusIcon = config.icon;

                return (
                  <TableRow
                    key={request.id}
                    className={cn(isLoading && "opacity-60")}
                  >
                    <TableCell className="font-mono text-xs">
                      #{request.id}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {request.entryNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      {request.brokenItem}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1 text-xs", config.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {formatStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
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
                  "rounded-lg border p-3 space-y-2",
                  isLoading && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{request.id}
                  </span>
                  <Badge className={cn("gap-1 text-xs", config.className)}>
                    <StatusIcon className="h-3 w-3" />
                    {formatStatusLabel(request.status)}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{request.brokenItem}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Entry #{request.entryNumber}</span>
                  <span>
                    {format(
                      new Date(request.submittedAt),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
