import { create } from "zustand";
import { dsprService } from "@/lib/api/services/dspr.service";
import type { DsprResponse } from "@/types/dspr.types";

interface DsprState {
  data: DsprResponse | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: string | null;

  fetchReport: (storeId?: string, date?: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useDsprStore = create<DsprState>()((set) => ({
  data: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  fetchReport: async (storeId?: string, date?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await dsprService.getReport(storeId, date);
      set({
        data,
        isLoading: false,
        lastFetchedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load report data.";
      console.error("❌ DSPR Store:", message);
      set({ isLoading: false, error: message });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({ data: null, isLoading: false, error: null, lastFetchedAt: null }),
}));
