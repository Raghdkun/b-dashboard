import { create } from "zustand";
import {
  maintenanceService,
  MaintenanceError,
  type MaintenanceErrorCode,
} from "@/lib/api/services/maintenance.service";
import type { MaintenanceResponse } from "@/types/maintenance.types";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Constants                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

/** Data is considered fresh for 2 minutes */
const STALE_AFTER_MS = 2 * 60 * 1000;

/** Auto-refresh interval (3 min) */
const AUTO_REFRESH_MS = 3 * 60 * 1000;

/** Max retries for retryable errors (client-level) */
const MAX_AUTO_RETRIES = 2;

/** Delay between auto-retries */
const RETRY_DELAY_MS = 3_000;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

interface MaintenanceErrorState {
  message: string;
  code: MaintenanceErrorCode;
  retryable: boolean;
  retryAfter?: number;
}

interface MaintenanceState {
  // Data
  data: MaintenanceResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: MaintenanceErrorState | null;

  // Pagination
  currentPage: number;

  // Metadata
  lastFetchedAt: number | null;
  lastStoreId: string | null;
  fetchCount: number;

  // Actions
  fetchRequests: (storeId?: string, page?: number) => Promise<void>;
  refreshRequests: () => Promise<void>;
  goToPage: (page: number) => void;
  clearError: () => void;
  reset: () => void;

  // Smart refresh
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  isStale: () => boolean;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Internal state                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

let _autoRefreshTimer: ReturnType<typeof setInterval> | null = null;
let _abortController: AbortController | null = null;
let _retryTimer: ReturnType<typeof setTimeout> | null = null;
let _retryCount = 0;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Store                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export const useMaintenanceStore = create<MaintenanceState>()((set, get) => ({
  data: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  currentPage: 1,
  lastFetchedAt: null,
  lastStoreId: null,
  fetchCount: 0,

  fetchRequests: async (storeId?: string, page: number = 1) => {
    const state = get();

    // Cancel any in-flight request
    if (_abortController) {
      _abortController.abort();
    }
    _abortController = new AbortController();

    // If we already have data, show "refreshing" instead of full loading
    const hasExistingData = state.data !== null;
    set({
      isLoading: !hasExistingData,
      isRefreshing: hasExistingData,
      error: null,
    });

    _retryCount = 0;

    const performFetch = async (): Promise<void> => {
      try {
        const data = await maintenanceService.getRequests(
          storeId,
          page,
          _abortController?.signal
        );

        set({
          data,
          isLoading: false,
          isRefreshing: false,
          error: null,
          currentPage: page,
          lastFetchedAt: Date.now(),
          lastStoreId: storeId ?? data.storeNumber ?? null,
          fetchCount: get().fetchCount + 1,
        });
      } catch (err: unknown) {
        // Cancelled — ignore silently
        if (
          err instanceof Error &&
          (err.name === "CanceledError" || err.name === "AbortError")
        ) {
          return;
        }

        const maintenanceErr =
          err instanceof MaintenanceError
            ? err
            : new MaintenanceError(
                err instanceof Error
                  ? err.message
                  : "Failed to load maintenance requests.",
                "UNKNOWN"
              );

        // Auto-retry for retryable errors (exclude auth errors)
        const isAuthError =
          maintenanceErr.code === "UNAUTHORIZED" ||
          maintenanceErr.code === "NOT_AUTHENTICATED" ||
          maintenanceErr.code === "FORBIDDEN";
        if (
          maintenanceErr.retryable &&
          !isAuthError &&
          _retryCount < MAX_AUTO_RETRIES
        ) {
          _retryCount++;
          await new Promise<void>((resolve) => {
            _retryTimer = setTimeout(resolve, RETRY_DELAY_MS);
            _abortController?.signal.addEventListener(
              "abort",
              () => {
                if (_retryTimer) {
                  clearTimeout(_retryTimer);
                  _retryTimer = null;
                }
                resolve();
              },
              { once: true }
            );
          });
          if (_abortController?.signal.aborted) return;
          _retryTimer = null;
          return performFetch();
        }

        set({
          isLoading: false,
          isRefreshing: false,
          error: {
            message: maintenanceErr.message,
            code: maintenanceErr.code,
            retryable: maintenanceErr.retryable,
            retryAfter: maintenanceErr.retryAfter,
          },
          // Keep stale data on refresh failures
          ...(hasExistingData ? {} : { data: null }),
        });
      }
    };

    await performFetch();
  },

  refreshRequests: async () => {
    const { lastStoreId, currentPage, fetchRequests } = get();
    if (lastStoreId) {
      await fetchRequests(lastStoreId, currentPage);
    }
  },

  goToPage: (page: number) => {
    const { lastStoreId, fetchRequests } = get();
    if (lastStoreId) {
      fetchRequests(lastStoreId, page);
    }
  },

  clearError: () => set({ error: null }),

  reset: () => {
    if (_abortController) _abortController.abort();
    if (_autoRefreshTimer) clearInterval(_autoRefreshTimer);
    if (_retryTimer) clearTimeout(_retryTimer);
    _autoRefreshTimer = null;
    _retryTimer = null;
    _retryCount = 0;

    set({
      data: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      currentPage: 1,
      lastFetchedAt: null,
      lastStoreId: null,
      fetchCount: 0,
    });
  },

  isStale: () => {
    const { lastFetchedAt } = get();
    if (!lastFetchedAt) return true;
    return Date.now() - lastFetchedAt > STALE_AFTER_MS;
  },

  startAutoRefresh: () => {
    if (_autoRefreshTimer) return;

    _autoRefreshTimer = setInterval(() => {
      const { isLoading, isRefreshing, refreshRequests } = get();
      if (!isLoading && !isRefreshing) {
        refreshRequests();
      }
    }, AUTO_REFRESH_MS);
  },

  stopAutoRefresh: () => {
    if (_autoRefreshTimer) {
      clearInterval(_autoRefreshTimer);
      _autoRefreshTimer = null;
    }
  },
}));
