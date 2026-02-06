import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Store } from "@/types/store.types";

interface SelectedStoreState {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  clearSelectedStore: () => void;
}

/**
 * Global Zustand store for managing the currently selected store
 * This store is persisted to localStorage automatically via the persist middleware
 * All components that subscribe to this store will update reactively when the store changes
 */
export const useSelectedStoreStore = create<SelectedStoreState>()(
  persist(
    (set) => ({
      selectedStore: null,

      setSelectedStore: (store: Store | null) => {
        console.log("📦 Selected Store Updated:", store?.name || "Cleared");
        set({ selectedStore: store });
      },

      clearSelectedStore: () => {
        console.log("🗑️ Selected Store Cleared");
        set({ selectedStore: null });
      },
    }),
    {
      name: "selected-store-storage", // localStorage key
    }
  )
);
