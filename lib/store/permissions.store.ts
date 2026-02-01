/**
 * Permissions Zustand Store
 * State management for permissions feature
 */

import { create } from "zustand";
import { permissionService } from "@/lib/api/services/role.service";
import type {
  Permission,
  CreatePermissionPayload,
  UpdatePermissionPayload,
} from "@/types/role.types";
import type { PaginatedResponse } from "@/types/api.types";

interface PermissionsFilters {
  search: string;
  guardName?: string;
}

interface PermissionsState {
  // Data
  permissions: Permission[];
  currentPermission: Permission | null;
  pagination: PaginatedResponse<Permission>["meta"] | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;

  // UI state
  filters: PermissionsFilters;
  selectedPermissionId: string | null;

  // Actions
  fetchPermissions: (page?: number) => Promise<void>;
  fetchPermission: (id: string) => Promise<Permission | null>;
  createPermission: (data: CreatePermissionPayload) => Promise<Permission>;
  updatePermission: (id: string, data: UpdatePermissionPayload) => Promise<Permission>;
  deletePermission: (id: string) => Promise<void>;

  // UI actions
  setFilters: (filters: Partial<PermissionsFilters>) => void;
  setSelectedPermissionId: (id: string | null) => void;
  clearErrors: () => void;
  reset: () => void;
}

const initialFilters: PermissionsFilters = {
  search: "",
  guardName: undefined,
};

const initialState = {
  permissions: [],
  currentPermission: null,
  pagination: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  filters: initialFilters,
  selectedPermissionId: null,
};

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  ...initialState,

  fetchPermissions: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const response = await permissionService.getPermissions({
        page,
        perPage: 10,
        search: filters.search || undefined,
        guardName: filters.guardName,
      });
      set({
        permissions: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch permissions";
      set({ error: message, isLoading: false });
    }
  },

  fetchPermission: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await permissionService.getPermission(id);
      if (response.success) {
        set({ currentPermission: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch permission");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch permission";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  createPermission: async (data: CreatePermissionPayload) => {
    set({ isCreating: true, createError: null });
    try {
      const response = await permissionService.createPermission(data);
      if (response.success) {
        set((state) => ({
          permissions: [response.data, ...state.permissions],
          isCreating: false,
        }));
        return response.data;
      }
      throw new Error(response.message || "Failed to create permission");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create permission";
      set({ createError: message, isCreating: false });
      throw error;
    }
  },

  updatePermission: async (id: string, data: UpdatePermissionPayload) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await permissionService.updatePermission(id, data);
      if (response.success) {
        set((state) => ({
          permissions: state.permissions.map((p) => (p.id === id ? response.data : p)),
          currentPermission: state.currentPermission?.id === id ? response.data : state.currentPermission,
          isUpdating: false,
        }));
        return response.data;
      }
      throw new Error(response.message || "Failed to update permission");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update permission";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  deletePermission: async (id: string) => {
    set({ isDeleting: true, deleteError: null });
    try {
      await permissionService.deletePermission(id);
      set((state) => ({
        permissions: state.permissions.filter((p) => p.id !== id),
        currentPermission: state.currentPermission?.id === id ? null : state.currentPermission,
        isDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete permission";
      set({ deleteError: message, isDeleting: false });
      throw error;
    }
  },

  // UI actions
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSelectedPermissionId: (id) => set({ selectedPermissionId: id }),

  clearErrors: () =>
    set({
      error: null,
      createError: null,
      updateError: null,
      deleteError: null,
    }),

  reset: () => set(initialState),
}));
