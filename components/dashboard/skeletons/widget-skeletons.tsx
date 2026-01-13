"use client";

import { cn } from "@/lib/utils";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Stats Widget Skeleton
export function StatsWidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("min-h-30", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <SkeletonCircle size={20} />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

// Chart Widget Skeleton
interface ChartWidgetSkeletonProps {
  type?: "bar" | "line" | "pie";
  className?: string;
}

export function ChartWidgetSkeleton({
  type = "bar",
  className,
}: ChartWidgetSkeletonProps) {
  return (
    <Card className={cn("min-h-75", className)}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        {type === "pie" ? (
          <div className="flex items-center justify-center gap-8">
            <SkeletonCircle size={140} />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : type === "line" ? (
          <div className="space-y-4">
            <div className="h-45 relative">
              {/* Y-axis labels */}
              <div className="absolute start-0 top-0 bottom-6 flex flex-col justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-8" />
                ))}
              </div>
              {/* Chart area with line shape */}
              <div className="ms-12 h-full border-s border-b border-border relative">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,30 Q15,25 25,28 T50,15 T75,20 T100,8"
                    fill="none"
                    className="stroke-muted"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between ms-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-10" />
              ))}
            </div>
          </div>
        ) : (
          // Bar chart
          <div className="space-y-4">
            <div className="flex items-end gap-3 h-45">
              {[65, 85, 45, 95, 70, 55, 80].map((h, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            {/* X-axis labels */}
            <div className="flex gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 h-3" />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Table Widget Skeleton
interface TableWidgetSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableWidgetSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableWidgetSkeletonProps) {
  return (
    <Card className={cn("min-h-87.5", className)}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex gap-4 pb-3 border-b">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex gap-4 py-2">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <Skeleton
                  key={colIdx}
                  className="h-4 flex-1"
                  style={{
                    width: colIdx === 0 ? "30%" : undefined,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// List Widget Skeleton
interface ListWidgetSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListWidgetSkeleton({
  items = 5,
  showAvatar = true,
  className,
}: ListWidgetSkeletonProps) {
  return (
    <Card className={cn("min-h-75", className)}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              {showAvatar && <SkeletonCircle size={36} />}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Feed Skeleton
export function ActivityWidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("min-h-75", className)}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <SkeletonCircle size={8} />
                {i < 4 && <Skeleton className="w-0.5 h-12 mt-1" />}
              </div>
              <div className="flex-1 space-y-1 pb-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Widget Skeleton
export function ActionsWidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("min-h-50", className)}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Calendar Widget Skeleton
export function CalendarWidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("min-h-87.5", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Generic Widget Skeleton (fallback)
export function GenericWidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("min-h-50", className)}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <SkeletonText lines={4} />
      </CardContent>
    </Card>
  );
}
