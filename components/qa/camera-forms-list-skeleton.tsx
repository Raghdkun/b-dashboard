"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CameraFormsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop skeleton */}
        <div className="hidden md:block overflow-x-auto space-y-4">
          {/* Table header */}
          <div className="flex gap-4">
            <Skeleton className="h-4 w-12 shrink-0" />
            <Skeleton className="h-4 w-32 shrink-0" />
            <Skeleton className="h-4 w-28 shrink-0" />
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-4 w-20 shrink-0" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24 shrink-0" />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-5 w-8 shrink-0" />
              <Skeleton className="h-5 w-32 shrink-0" />
              <Skeleton className="h-5 w-32 shrink-0" />
              <Skeleton className="h-5 w-24 shrink-0" />
              <Skeleton className="h-5 w-24 shrink-0" />
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-16 shrink-0" />
              ))}
            </div>
          ))}
        </div>

        {/* Mobile skeleton */}
        <div className="space-y-3 md:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
              <div className="pt-2 border-t space-y-2">
                <Skeleton className="h-3 w-20" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-16 rounded" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
