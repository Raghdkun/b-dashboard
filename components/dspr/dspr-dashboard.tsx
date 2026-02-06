"use client";

import { useState, useCallback, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useDspr } from "@/lib/hooks/use-dspr";
import {
  SalesChart,
  TopItemsList,
  TopIngredientsList,
  HourlyChannelsChart,
  DaySummaryStats,
  HnrCard,
  PortalCard,
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
  AlertCircle,
  RefreshCw,
  Store,
  Calendar as CalendarIcon,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Format a Date to YYYY-MM-DD (API-compatible format) */
function toApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Full DSPR Dashboard — renders all widgets driven by the useDspr() hook.
 * Handles loading, error, and empty states gracefully.
 */
export function DsprDashboard() {
  const { data, isLoading, error, refetch, clearError, selectedStore } =
    useDspr();

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

  // Re-fetch when the selected store changes — pass the current date
  const storeId = selectedStore?.id ?? null;
  useEffect(() => {
    if (storeId) {
      refetch(toApiDate(selectedDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return <DsprDashboardSkeleton />;
  }

  // ── No store selected ─────────────────────────────────────────────────
  if (!selectedStore) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Store className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Store Selected</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Please select a store from the sidebar to view its Daily Store
            Performance Report.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              Failed to Load Report
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearError();
                refetch(toApiDate(selectedDate));
              }}
            >
              <RefreshCw className="h-4 w-4 me-1.5" />
              Retry
            </Button>
            <Button variant="link" size="sm" asChild>
              <a
                href="https://tasks.rdexperts.tech/support-ticket"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 me-1.5" />
                Contact Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── No data yet ────────────────────────────────────────────────────────
  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <CalendarIcon className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Report Data</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No report data is available for this store. Try selecting a
            different date.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch(toApiDate(selectedDate))}
          >
            <RefreshCw className="h-4 w-4 me-1.5" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Success: render dashboard ──────────────────────────────────────────
  const { filtering, sales, top, day } = data;

  return (
    <div className="space-y-6">
      {/* ── Header meta + date picker ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          <Store className="h-3 w-3 me-1" />
          {filtering.store}
        </Badge>

        {/* Date picker */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-6 gap-1.5 text-xs font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-3 w-3" />
              {format(selectedDate, "yyyy-MM-dd")}
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

        <Badge variant="outline" className="text-xs">
          Week {filtering.iso_week} ({filtering.week_start} → {filtering.week_end})
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 ms-auto"
          onClick={() => refetch(toApiDate(selectedDate))}
          title="Refresh report"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ── Day summary stat cards ───────────────────────────────────── */}
      <DaySummaryStats day={day} />

      {/* ── Charts side by side (Sales + Hourly Channels) ────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SalesChart sales={sales} height={320} toolbar={false} />
        <HourlyChannelsChart
          hourlyData={day.hourly_sales_and_channels}
          height={320}
          toolbar={false}
        />
      </div>

      {/* ── HNR · Portal · Labor row ─────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <HnrCard hnr={day.hnr} />
        <PortalCard portal={day.portal} />
        <LaborGauge value={day.labor} />
      </div>

      {/* ── Top items + ingredients ───────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopItemsList items={top.top_5_items_sales_for_day} />
        <TopIngredientsList ingredients={top.top_3_ingredients_used} />
      </div>
    </div>
  );
}
