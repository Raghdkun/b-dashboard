"use client";

import { useEffect, useCallback } from "react";
import { useQAStore } from "@/lib/store/qa.store";

/**
 * Hook that exposes QA store state with smart refresh capabilities:
 *  - Auto-refresh on visibility change (when tab comes back into focus)
 *  - Starts/stops periodic auto-refresh when component mounts/unmounts
 *  - Exposes refetch, isRefreshing, structured error, and stale indicator
 */
export function useQA() {
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    currentPage,
    lastFetchedAt,
    fetchCount,
    fetchAudits,
    refreshAudits,
    goToPage,
    clearError,
    isStale,
    startAutoRefresh,
    stopAutoRefresh,
  } = useQAStore();

  /** Fetch QA audits (or re-fetch current page) */
  const refetch = useCallback(() => {
    fetchAudits(currentPage);
  }, [fetchAudits, currentPage]);

  // ── Auto-fetch on mount ───────────────────────────────────────────
  useEffect(() => {
    fetchAudits(1);
  }, [fetchAudits]);

  // ── Auto-refresh lifecycle ───────────────────────────────────────────
  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, [startAutoRefresh, stopAutoRefresh]);

  // ── Visibility change: refetch stale data when tab regains focus ─────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isStale()) {
        refreshAudits();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isStale, refreshAudits]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    currentPage,
    lastFetchedAt,
    fetchCount,
    refetch,
    goToPage,
    clearError,
    isStale: isStale(),
  };
}
