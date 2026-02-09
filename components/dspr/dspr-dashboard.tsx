"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { format, subDays, formatDistanceToNow } from "date-fns";
import { useDspr } from "@/lib/hooks/use-dspr";
import {
  SalesChart,
  TopItemsList,
  TopIngredientsList,
  HourlyChannelsChart,
  DaySummaryStats,
  HnrCard,
  PortalCard,
  OnTimeCard,
  LaborGauge,
  DsprDashboardSkeleton,
} from "@/components/dspr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  RefreshCw,
  Store,
  Calendar as CalendarIcon,
  ExternalLink,
  Clock,
  WifiOff,
  ShieldAlert,
  SearchX,
  ServerCrash,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Format a Date to YYYY-MM-DD (API-compatible format) */
function toApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Error state component                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function ErrorDisplay({
  error,
  onRetry,
  onClear,
  locale,
}: {
  error: { message: string; code: string; retryable: boolean; retryAfter?: number };
  onRetry: () => void;
  onClear: () => void;
  locale: string;
}) {
  const errorConfig = useMemo(() => {
    switch (error.code) {
      case "NOT_AUTHENTICATED":
        return {
          icon: ShieldAlert,
          title: "Authentication Required",
          color: "text-amber-500",
          borderColor: "border-amber-200 dark:border-amber-900/50",
          bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
        };
      case "UNAUTHORIZED":
        return {
          icon: ShieldAlert,
          title: "DSPR Access Issue",
          color: "text-amber-500",
          borderColor: "border-amber-200 dark:border-amber-900/50",
          bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
        };
      case "FORBIDDEN":
        return {
          icon: ShieldAlert,
          title: "Access Denied",
          color: "text-red-500",
          borderColor: "border-red-200 dark:border-red-900/50",
          bgColor: "bg-red-50/50 dark:bg-red-950/20",
        };
      case "NOT_FOUND":
        return {
          icon: SearchX,
          title: "No Report Data",
          color: "text-slate-500",
          borderColor: "border-slate-200 dark:border-slate-800",
          bgColor: "bg-slate-50/50 dark:bg-slate-950/20",
        };
      case "TIMEOUT":
      case "NETWORK_ERROR":
        return {
          icon: WifiOff,
          title: "Connection Issue",
          color: "text-orange-500",
          borderColor: "border-orange-200 dark:border-orange-900/50",
          bgColor: "bg-orange-50/50 dark:bg-orange-950/20",
        };
      case "RATE_LIMITED":
        return {
          icon: Clock,
          title: "Rate Limited",
          color: "text-blue-500",
          borderColor: "border-blue-200 dark:border-blue-900/50",
          bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
        };
      case "SERVER_ERROR":
        return {
          icon: ServerCrash,
          title: "Server Error",
          color: "text-red-500",
          borderColor: "border-red-200 dark:border-red-900/50",
          bgColor: "bg-red-50/50 dark:bg-red-950/20",
        };
      default:
        return {
          icon: AlertCircle,
          title: "Something Went Wrong",
          color: "text-destructive",
          borderColor: "border-destructive/30",
          bgColor: "bg-destructive/5",
        };
    }
  }, [error.code]);

  const Icon = errorConfig.icon;

  return (
    <Card className={cn("border-2", errorConfig.borderColor, errorConfig.bgColor)}>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-5">
        <div className={cn("rounded-full p-4", errorConfig.bgColor)}>
          <Icon className={cn("h-10 w-10", errorConfig.color)} />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-lg font-semibold">{errorConfig.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {error.message}
          </p>
          {error.retryAfter && (
            <p className="text-xs text-muted-foreground">
              Try again in {error.retryAfter} seconds
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {error.code === "NOT_AUTHENTICATED" ? (
            <Button variant="default" size="sm" asChild>
              <a href={`/${locale}/auth/login`}>
                <ShieldAlert className="h-4 w-4 me-1.5" />
                Log In
              </a>
            </Button>
          ) : error.retryable ? (
            <Button variant="default" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 me-1.5" />
              Try Again
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onClear}>
              Dismiss
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://tasks.rdexperts.tech/support-ticket"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 me-1.5" />
              Support
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Main Dashboard                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Full DSPR Dashboard — production-ready with:
 *  - Structured error display per error code
 *  - Smart refresh with stale indicator
 *  - Background refresh indicator
 *  - Last-updated timestamp
 *  - Smooth loading transitions
 */
export function DsprDashboard() {
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    lastFetchedAt,
    refetch,
    refresh,
    clearError,
    isStale,
    selectedStore,
  } = useDspr();

  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Default date = yesterday
  const [selectedDate, setSelectedDate] = useState<Date>(subDays(new Date(), 1));
  const [dateOpen, setDateOpen] = useState(false);

  // Re-fetch when date changes
  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      setSelectedDate(date);
      setDateOpen(false);
      refetch(toApiDate(date));
    },
    [refetch]
  );

  // Re-fetch when the selected store changes
  const storeId = selectedStore?.id ?? null;
  // console.log("[DsprDashboard] render:", { storeId, selectedStore: selectedStore ? { id: selectedStore.id, name: selectedStore.name } : null, hasData: !!data, isLoading, error });
  const selectedDateRef = useRef(selectedDate);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    if (storeId) {
      refetch(toApiDate(selectedDateRef.current));
    }
  }, [storeId, refetch]);

  // Format "last updated" time
  const lastUpdatedLabel = useMemo(() => {
    if (!lastFetchedAt) return null;
    return formatDistanceToNow(lastFetchedAt, { addSuffix: true });
  }, [lastFetchedAt]);

  // ── Initial loading (no data yet) ──────────────────────────────────────
  if (isLoading && !data) {
    return <DsprDashboardSkeleton />;
  }

  // ── No store selected ─────────────────────────────────────────────────
  if (!selectedStore) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Store className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Store Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Select a store from the sidebar to view its Daily Store Performance Report.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Error state (no data) ──────────────────────────────────────────────
  if (error && !data) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => refetch(toApiDate(selectedDate))}
        onClear={clearError}
        locale={locale}
      />
    );
  }

  // ── No data & no error ─────────────────────────────────────────────────
  if (!data) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <CalendarIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Report Data</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              No data is available for this store. Select a date to load the report.
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => refetch(toApiDate(selectedDate))}
          >
            <RefreshCw className="h-4 w-4 me-1.5" />
            Load Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Success: render dashboard ──────────────────────────────────────────
  const { filtering, sales, top, day } = data;

  return (
    <div className={cn("space-y-6", isRefreshing && "relative")}>
      {/* ── Refresh overlay bar ──────────────────────────────────── */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="h-0.5 bg-primary/30 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* ── Header bar ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Store badge */}
        <Badge
          variant="secondary"
          className="text-xs gap-1.5 px-3 py-1 font-medium"
        >
          <Store className="h-3.5 w-3.5" />
          Store {filtering.store}
        </Badge>

        {/* Date picker */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 gap-1.5 text-xs font-medium",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {format(selectedDate, "MMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date > subDays(new Date(), 1)}
              defaultMonth={selectedDate}
            />
          </PopoverContent>
        </Popover>

        {/* Week badge */}
        <Badge variant="outline" className="text-xs gap-1 px-2.5 py-1">
          <CalendarIcon className="h-3 w-3" />
          Week {filtering.iso_week}
          <span className="text-muted-foreground">
            ({filtering.week_start} → {filtering.week_end})
          </span>
        </Badge>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Error banner inline (when we have data but also an error from refresh) */}
        {error && data && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="destructive"
                className="text-xs gap-1 cursor-pointer animate-in fade-in"
                onClick={() => refetch(toApiDate(selectedDate))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); refetch(toApiDate(selectedDate)); } }}
              >
                <AlertTriangle className="h-3 w-3" />
                Refresh failed — tap to retry
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{error.message}</TooltipContent>
          </Tooltip>
        )}

        {/* Status indicators */}
        <div className="flex items-center gap-1.5">
          {/* Stale indicator */}
          {isStale && !isRefreshing && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-xs gap-1 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 cursor-pointer"
                  onClick={refresh}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); refresh(); } }}
                >
                  <Clock className="h-3 w-3" />
                  Stale
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Data may be outdated. Click to refresh.
              </TooltipContent>
            </Tooltip>
          )}

          {/* Last updated */}
          {lastUpdatedLabel && !isRefreshing && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {lastUpdatedLabel}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Last updated {lastUpdatedLabel}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Refresh button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => refetch(toApiDate(selectedDate))}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isRefreshing ? "Refreshing…" : "Refresh report"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* ── Day summary + Weekly Sales side by side ──────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DaySummaryStats day={day} />
        <SalesChart sales={sales} height={320} toolbar={false} />
      </div>

      {/* ── Hourly Channels (full width) ────────────────────────── */}
      <HourlyChannelsChart
        hourlyData={day.hourly_sales_and_channels}
        height={320}
        toolbar={false}
      />

      {/* ── HNR · Portal · On Time · Labor gauges row ────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HnrCard hnr={day.hnr} />
        <PortalCard portal={day.portal} />
        <OnTimeCard portal={day.portal} />
        <LaborGauge value={day.labor || 21} />
      </div>

      {/* ── Top items + ingredients ───────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopItemsList items={top.top_5_items_sales_for_day} />
        <TopIngredientsList ingredients={top.top_3_ingredients_used} />
      </div>
    </div>
  );
}
