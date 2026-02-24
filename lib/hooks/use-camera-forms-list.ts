"use client";

import { useEffect, useCallback } from "react";
import { useCameraFormsStore } from "@/lib/store/camera-forms.store";

/**
 * Hook that exposes camera forms list state with auto-fetch on mount.
 */
export function useCameraFormsList() {
  const {
    dailyData,
    dailyPage,
    dailyLoading,
    dailyRefreshing,
    dailyError,
    weeklyData,
    weeklyPage,
    weeklyLoading,
    weeklyRefreshing,
    weeklyError,
    filters,
    isDeleting,
    deleteError,
    fetchDaily,
    fetchWeekly,
    deleteCameraForm,
    setDailyPage,
    setWeeklyPage,
    setFilters,
    applyFilters,
    resetFilters,
    clearDailyError,
    clearWeeklyError,
  } = useCameraFormsStore();

  // Auto-fetch on mount
  useEffect(() => {
    fetchDaily(1);
    fetchWeekly(1);
  }, [fetchDaily, fetchWeekly]);

  const refetchDaily = useCallback(() => {
    fetchDaily(dailyPage);
  }, [fetchDaily, dailyPage]);

  const refetchWeekly = useCallback(() => {
    fetchWeekly(weeklyPage);
  }, [fetchWeekly, weeklyPage]);

  const refetchAll = useCallback(() => {
    fetchDaily(dailyPage);
    fetchWeekly(weeklyPage);
  }, [fetchDaily, fetchWeekly, dailyPage, weeklyPage]);

  return {
    // Daily
    dailyData,
    dailyPage,
    dailyLoading,
    dailyRefreshing,
    dailyError,
    setDailyPage,
    refetchDaily,
    clearDailyError,

    // Weekly
    weeklyData,
    weeklyPage,
    weeklyLoading,
    weeklyRefreshing,
    weeklyError,
    setWeeklyPage,
    refetchWeekly,
    clearWeeklyError,

    // Shared
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    refetchAll,

    // Delete
    isDeleting,
    deleteError,
    deleteCameraForm,
  };
}
