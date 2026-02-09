"use client";

import { useEffect, useCallback, useRef } from "react";
import { useDsprStore } from "@/lib/store/dspr.store";
import { useSelectedStoreStore } from "@/lib/store/selected-store.store";

/**
 * Hook that exposes DSPR store state with smart refresh capabilities:
 *  - Auto-refresh on visibility change (when tab comes back into focus)
 *  - Starts/stops periodic auto-refresh when component mounts/unmounts
 *  - Exposes refetch, isRefreshing, structured error, and stale indicator
 */
export function useDspr() {
  const { selectedStore } = useSelectedStoreStore();
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    lastFetchedAt,
    fetchCount,
    fetchReport,
    refreshReport,
    clearError,
    isStale,
    startAutoRefresh,
    stopAutoRefresh,
  } = useDsprStore();

  const storeIdRef = useRef(selectedStore?.id);
  storeIdRef.current = selectedStore?.id;

  /** Fetch for a specific date (or re-fetch current) */
  const refetch = useCallback(
    (date?: string) => {
      if (storeIdRef.current) {
        fetchReport(storeIdRef.current, date);
      }
    },
    [fetchReport]
  );

  /** Refresh the last fetched report (same store + date) */
  const refresh = useCallback(() => {
    refreshReport();
  }, [refreshReport]);

  // ── Auto-refresh lifecycle ───────────────────────────────────────────
  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, [startAutoRefresh, stopAutoRefresh]);

  // ── Visibility change: refetch stale data when tab regains focus ─────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isStale()) {
        refreshReport();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isStale, refreshReport]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    lastFetchedAt,
    fetchCount,
    refetch,
    refresh,
    clearError,
    isStale: isStale(),
    selectedStore,
  };
}
