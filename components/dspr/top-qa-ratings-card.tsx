"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { format, subDays } from "date-fns";
import { useSelectedStoreStore } from "@/lib/store/selected-store.store";
import { qaService, QAError } from "@/lib/api/services/qa.service";
import type { QARatingsSummaryItem } from "@/types/qa.types";
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
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

function TopQaRatingsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-4 w-52 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getDefaultDateRange() {
  const today = new Date();
  return {
    dateStart: format(subDays(today, 6), "yyyy-MM-dd"),
    dateEnd: format(today, "yyyy-MM-dd"),
  };
}

export function TopQaRatingsCard() {
  const { selectedStore } = useSelectedStoreStore();
  const [data, setData] = useState<QARatingsSummaryItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const storeId = selectedStore?.storeId ?? selectedStore?.id ?? null;
  const { dateStart, dateEnd } = useMemo(() => getDefaultDateRange(), []);

  const fetchData = useCallback(async () => {
    if (!storeId) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const result = await qaService.getRatingsSummary(
        storeId,
        dateStart,
        dateEnd,
        controller.signal
      );

      if (!controller.signal.aborted) {
        setData(result.slice(0, 5));
      }
    } catch (err) {
      if (controller.signal.aborted) return;

      if (err instanceof QAError) {
        if (err.code === "NOT_AUTHENTICATED" || err.code === "UNAUTHORIZED") {
          setError("Authentication required to load QA ratings.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to load QA ratings summary.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [storeId, dateStart, dateEnd]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  if (isLoading && !data) {
    return <TopQaRatingsSkeleton />;
  }

  if (!storeId) {
    return null;
  }

  if (error && !data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4" />
            Top 5 QA Ratings
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Last 7 days ({dateStart} → {dateEnd})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <ShieldAlert className="h-8 w-8 text-muted-foreground" />
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

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4" />
            Top 5 QA Ratings
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Last 7 days ({dateStart} → {dateEnd})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p className="text-sm text-muted-foreground">
              No QA rating issues found for this period.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4" />
              Top 5 QA Ratings
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Last 7 days ({dateStart} → {dateEnd})
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[52%]">Entity</TableHead>
                <TableHead className="text-right">Auto Fail</TableHead>
                <TableHead className="text-right">Urgent</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.entityId} className={cn(isLoading && "opacity-60")}>
                  <TableCell className="text-sm font-medium">{item.entityLabel}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{item.autoFailCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{item.urgentCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge>{item.totalCount}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 md:hidden">
          {data.map((item, index) => (
            <div
              key={item.entityId}
              className={cn("rounded-lg border p-3 space-y-2", isLoading && "opacity-60")}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium line-clamp-2">{item.entityLabel}</p>
                <Badge variant="outline" className="shrink-0">#{index + 1}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Auto Fail: {item.autoFailCount}
                </Badge>
                <Badge variant="outline">Urgent: {item.urgentCount}</Badge>
                <Badge>Total: {item.totalCount}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
