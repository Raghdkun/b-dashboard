import { create } from "zustand";
import { storeService } from "@/lib/api/services/store.service";
import type {
  Store,
  StoreUser,
  StoreRole,
  GetStoresParams,
  CreateStorePayload,
  UpdateStorePayload,
  StoreFilters,
} from "@/types/store.types";
import type { PaginatedResponse } from "@/types/api.types";

interface StoresState {
  // Data
  stores: Store[];
  currentStore: Store | null;
  storeUsers: Record<string, StoreUser[]>;
  storeRoles: Record<string, StoreRole[]>;
  pagination: PaginatedResponse<Store>["meta"] | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingUsers: boolean;
  isLoadingRoles: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;

  // UI state
  filters: StoreFilters;
  selectedStoreId: string | null;

  // Actions
  fetchStores: (params?: GetStoresParams) => Promise<void>;
  fetchStore: (id: string) => Promise<Store | null>;
  createStore: (data: CreateStorePayload) => Promise<Store>;
  updateStore: (id: string, data: UpdateStorePayload) => Promise<Store>;
  deleteStore: (id: string) => Promise<void>;
  fetchStoreUsers: (storeId: string) => Promise<void>;
  fetchStoreRoles: (storeId: string) => Promise<void>;
  setFilters: (filters: Partial<StoreFilters>) => void;
  setSelectedStoreId: (id: string | null) => void;
  clearErrors: () => void;
  reset: () => void;
}

const initialState = {
  stores: [],
  currentStore: null,
  storeUsers: {},
  storeRoles: {},
  pagination: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isLoadingUsers: false,
  isLoadingRoles: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  filters: {},
  selectedStoreId: null,
};

export const useStoresStore = create<StoresState>()((set, get) => ({
  ...initialState,

  fetchStores: async (params?: GetStoresParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeService.getStores(params);
      set({
        stores: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch stores";
      set({ error: message, isLoading: false });
    }
  },

  fetchStore: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storeService.getStore(id);
      if (response.success) {
        set({ currentStore: response.data, isLoading: false });
        return response.data;
      }
      throw new Error("Failed to fetch store");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch store";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  createStore: async (data: CreateStorePayload) => {
    set({ isCreating: true, createError: null });
    try {
      const response = await storeService.createStore(data);
      if (response.success) {
        await get().fetchStores();
        set({ isCreating: false });
        return response.data;
      }
      throw new Error(response.message || "Failed to create store");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create store";
      set({ createError: message, isCreating: false });
      throw error;
    }
  },

  updateStore: async (id: string, data: UpdateStorePayload) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await storeService.updateStore(id, data);
      if (response.success) {
        set((state) => ({
          stores: state.stores.map((s) =>
            s.id === id ? { ...s, ...response.data } : s
          ),
          currentStore:
            state.currentStore?.id === id
              ? { ...state.currentStore, ...response.data }
              : state.currentStore,
          isUpdating: false,
        }));
        return response.data;
      }
      throw new Error(response.message || "Failed to update store");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update store";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  deleteStore: async (id: string) => {
    set({ isDeleting: true, deleteError: null });
    try {
      await storeService.deleteStore(id);
      set((state) => ({
        stores: state.stores.filter((s) => s.id !== id),
        currentStore: state.currentStore?.id === id ? null : state.currentStore,
        isDeleting: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete store";
      set({ deleteError: message, isDeleting: false });
      throw error;
    }
  },

  fetchStoreUsers: async (storeId: string) => {
    set({ isLoadingUsers: true });
    try {
      const response = await storeService.getStoreUsers(storeId);
      if (response.success) {
        set((state) => ({
          storeUsers: { ...state.storeUsers, [storeId]: response.data },
          isLoadingUsers: false,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch store users:", error);
      set({ isLoadingUsers: false });
    }
  },

  fetchStoreRoles: async (storeId: string) => {
    set({ isLoadingRoles: true });
    try {
      const response = await storeService.getStoreRoles(storeId);
      if (response.success) {
        set((state) => ({
          storeRoles: { ...state.storeRoles, [storeId]: response.data },
          isLoadingRoles: false,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch store roles:", error);
      set({ isLoadingRoles: false });
    }
  },

  setFilters: (filters: Partial<StoreFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setSelectedStoreId: (id: string | null) => {
    set({ selectedStoreId: id });
  },

  clearErrors: () => {
    set({
      error: null,
      createError: null,
      updateError: null,
      deleteError: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
