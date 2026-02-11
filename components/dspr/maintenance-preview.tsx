"use client";

import { useParams, useRouter } from "next/navigation";
import { useMaintenance } from "@/lib/hooks/use-maintenance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wrench,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Status helpers                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle2; className: string }
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
};

function getConfig(status: string) {
  return (
    statusConfig[status] ?? {
      icon: AlertCircle,
      className: "",
    }
  );
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Skeleton                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function MaintenancePreviewSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className="h-4 w-4" />
          Recent Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-20 shrink-0" />
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

/**
 * Compact maintenance preview for the DSPR dashboard.
 * Fetches the 3 most recent maintenance requests and displays them
 * in a card with a link to the full maintenance page.
 */
export function MaintenancePreview() {
  const { data, isLoading, isRefreshing, error } = useMaintenance(3);
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const router = useRouter();

  // Loading skeleton
  if (isLoading && !data) {
    return <MaintenancePreviewSkeleton />;
  }

  // Silent fail for preview — don't show error card in DSPR dashboard
  if (error && !data) return null;

  // Don't render if no data or empty
  if (!data || data.data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4" />
            Recent Maintenance
            {isRefreshing && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={() => router.push(`/${locale}/dashboard/maintenance`)}
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {data.data.map((request) => {
            const config = getConfig(request.status);
            const StatusIcon = config.icon;

            return (
              <div
                key={request.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border p-3",
                  isRefreshing && "opacity-60"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {request.brokenItem}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{request.id} &middot;{" "}
                    {format(new Date(request.submittedAt), "MMM dd, yyyy")}
                  </p>
                </div>
                <Badge className={cn("gap-1 shrink-0", config.className)}>
                  <StatusIcon className="h-3 w-3" />
                  {formatStatus(request.status)}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
