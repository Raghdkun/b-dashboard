"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-page skeleton loader that mirrors the DSPR dashboard layout.
 * Uses pulse animation for a polished loading experience.
 */
export function DsprDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-32 rounded-md" />
        <Skeleton className="h-7 w-48 rounded-full" />
        <div className="flex-1" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              </div>
              <div className="mt-2.5 flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* HNR · Portal · Labor row */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-44 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top items + Ingredients row */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-4 w-36" />
                <div className="flex-1" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: i === 0 ? 5 : 3 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
