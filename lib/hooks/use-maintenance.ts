"use client";

import { useEffect, useCallback, useRef } from "react";
import { useMaintenanceStore } from "@/lib/store/maintenance.store";
import { useSelectedStoreStore } from "@/lib/store/selected-store.store";

/**
 * Hook that exposes Maintenance store state with smart refresh capabilities:
 *  - Auto-refresh on visibility change (when tab comes back into focus)
 *  - Starts/stops periodic auto-refresh when component mounts/unmounts
 *  - Exposes refetch, isRefreshing, structured error, and stale indicator
 */
export function useMaintenance(limit: number = 10) {
  const { selectedStore } = useSelectedStoreStore();
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    lastFetchedAt,
    fetchCount,
    fetchRequests,
    refreshRequests,
    clearError,
    isStale,
    startAutoRefresh,
    stopAutoRefresh,
  } = useMaintenanceStore();

  const storeIdRef = useRef(selectedStore?.storeId);
  storeIdRef.current = selectedStore?.storeId;

  /** Fetch maintenance requests (or re-fetch current) */
  const refetch = useCallback(
    (newLimit?: number) => {
      if (storeIdRef.current) {
        fetchRequests(storeIdRef.current, newLimit ?? limit);
      }
    },
    [fetchRequests, limit]
  );

  /** Refresh the last fetched data (same store + limit) */
  const refresh = useCallback(() => {
    refreshRequests();
  }, [refreshRequests]);

  // ── Auto-fetch when store changes ─────────────────────────────────
  useEffect(() => {
    if (selectedStore?.storeId) {
      fetchRequests(selectedStore.storeId, limit);
    }
  }, [selectedStore?.storeId, limit, fetchRequests]);

  // ── Auto-refresh lifecycle ───────────────────────────────────────────
  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, [startAutoRefresh, stopAutoRefresh]);

  // ── Visibility change: refetch stale data when tab regains focus ─────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isStale()) {
        refreshRequests();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isStale, refreshRequests]);

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
