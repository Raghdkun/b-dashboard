"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-page skeleton loader that mirrors the DSPR dashboard layout.
 * Uses pulse animation for a polished loading experience.
 */
export function DsprDashboardSkeleton() {
  return (
    <div className="space-y-1 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-28 rounded-md" />
        <Skeleton className="h-5 w-40 rounded-full" />
        <div className="flex-1" />
        <Skeleton className="h-5 w-5 rounded-md" />
        <Skeleton className="h-5 w-5 rounded-md" />
      </div>

      {/* Day summary stats ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-lg border border-l-2 bg-card px-2 py-1.5">
            <Skeleton className="h-4 w-4 rounded shrink-0" />
            <div className="space-y-0.5 flex-1 min-w-0">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-2 w-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Sales chart + Portal gauges */}
      <div className="grid grid-cols-1 gap-1 lg:grid-cols-4">
        <Card className="lg:col-span-2 py-1.5 gap-0">
          <CardHeader className="pb-0 px-3">
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-2.5 w-36" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-0">
            <Skeleton className="h-36 w-full rounded-md" />
          </CardContent>
        </Card>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="py-1.5 gap-0">
            <CardHeader className="pb-0 px-3">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-2.5 w-18" />
              </div>
            </CardHeader>
            <CardContent className="pb-1 px-3">
              <Skeleton className="h-20 w-full rounded-md" />
              <div className="grid grid-cols-2 gap-1 mt-0.5">
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-full rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* HNR + Labor + Top 5 */}
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="py-1.5 gap-0">
            <CardHeader className="pb-0 px-3">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-2.5 w-18" />
              </div>
            </CardHeader>
            <CardContent className="pb-1 px-3">
              <Skeleton className="h-20 w-full rounded-md" />
              <div className="grid grid-cols-2 gap-1 mt-0.5">
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-full rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="sm:col-span-2 lg:col-span-1 py-1.5 gap-0">
          <CardHeader className="pb-0.5 px-3">
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-2.5 w-28" />
              <div className="flex-1" />
              <Skeleton className="h-3 w-8 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-0 px-3 pb-1">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-6 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hourly + Donut charts */}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 py-1.5 gap-0">
          <CardHeader className="pb-0 px-3">
            <Skeleton className="h-2.5 w-36" />
          </CardHeader>
          <CardContent className="px-3 pb-0">
            <Skeleton className="h-36 w-full rounded-md" />
          </CardContent>
        </Card>
        <Card className="py-1.5 gap-0">
          <CardHeader className="pb-0 px-3">
            <Skeleton className="h-2.5 w-36" />
          </CardHeader>
          <CardContent className="px-3 pb-0">
            <Skeleton className="h-36 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>

      {/* Ingredients + Maintenance + QA */}
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="py-1.5 gap-0">
            <CardHeader className="pb-0.5 px-3">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </CardHeader>
            <CardContent className="space-y-0.5 px-3 pb-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-6 w-full rounded-md" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
