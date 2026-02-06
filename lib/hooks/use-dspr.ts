"use client";

import { useDsprStore } from "@/lib/store/dspr.store";
import { useSelectedStoreStore } from "@/lib/store/selected-store.store";

/**
 * Hook that exposes DSPR store state and a refetch helper.
 * The DsprDashboard component manages when to fetch (on store/date change).
 */
export function useDspr() {
  const { selectedStore } = useSelectedStoreStore();
  const { data, isLoading, error, fetchReport, clearError } = useDsprStore();

  const refetch = (date?: string) => {
    if (selectedStore?.id) {
      fetchReport(selectedStore.id, date);
    }
  };

  return { data, isLoading, error, refetch, clearError, selectedStore };
}
