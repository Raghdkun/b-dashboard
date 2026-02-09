import { create } from "zustand";
import { roleService, permissionService } from "@/lib/api/services/role.service";
import type {
  Role,
  Permission,
  RoleWithStats,
  GetRolesParams,
  GetPermissionsParams,
  CreateRolePayload,
  UpdateRolePayload,
  CreatePermissionPayload,
  UpdatePermissionPayload,
  RoleFilters,
} from "@/types/role.types";
import type { PaginatedResponse } from "@/types/api.types";

interface RolesState {
  // Data
  roles: RoleWithStats[];
  permissions: Permission[];
  currentRole: Role | null;
  currentRolePermissions: Permission[];
  rolesPagination: PaginatedResponse<RoleWithStats>["meta"] | null;
  permissionsPagination: PaginatedResponse<Permission>["meta"] | null;

  // Loading states
  isLoading: boolean;
  isLoadingPermissions: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error states
  error: string | null;
  permissionsError: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;

  // UI state
  filters: RoleFilters;
  selectedRoleId: string | null;

  // Role Actions
  fetchRoles: (params?: GetRolesParams) => Promise<void>;
  fetchRole: (id: string) => Promise<Role | null>;
  createRole: (data: CreateRolePayload) => Promise<Role>;
  updateRole: (id: string, data: UpdateRolePayload) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  fetchRolePermissions: (roleId: string) => Promise<void>;
  syncRolePermissions: (roleId: string, permissions: string[]) => Promise<void>;

  // Permission Actions
  fetchPermissions: (params?: GetPermissionsParams) => Promise<void>;
  createPermission: (data: CreatePermissionPayload) => Promise<Permission>;
  updatePermission: (
    id: string,
    data: UpdatePermissionPayload
  ) => Promise<Permission>;
  deletePermission: (id: string) => Promise<void>;

  // UI Actions
  setFilters: (filters: Partial<RoleFilters>) => void;
  setSelectedRoleId: (id: string | null) => void;
  clearErrors: () => void;
  reset: () => void;
}

const initialState = {
  roles: [],
  permissions: [],
  currentRole: null,
  currentRolePermissions: [],
  rolesPagination: null,
  permissionsPagination: null,
  isLoading: false,
  isLoadingPermissions: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  permissionsError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  filters: {},
  selectedRoleId: null,
};

export const useRolesStore = create<RolesState>()((set, get) => ({
  ...initialState,

  fetchRoles: async (params?: GetRolesParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await roleService.getRoles(params);
      set({
        roles: response.data,
        rolesPagination: response.meta,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch roles";
      set({ error: message, isLoading: false });
    }
  },

  fetchRole: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await roleService.getRole(id);
      if (response.success) {
        set({ currentRole: response.data, isLoading: false });
        return response.data;
      }
      throw new Error("Failed to fetch role");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch role";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  createRole: async (data: CreateRolePayload) => {
    set({ isCreating: true, createError: null });
    try {
      const response = await roleService.createRole(data);
      if (response.success) {
        await get().fetchRoles();
        set({ isCreating: false });
        return response.data;
      }
      throw new Error(response.message || "Failed to create role");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create role";
      set({ createError: message, isCreating: false });
      throw error;
    }
  },

  updateRole: async (id: string, data: UpdateRolePayload) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await roleService.updateRole(id, data);
      if (response.success) {
        set((state) => ({
          roles: state.roles.map((r) =>
            r.id === id ? { ...r, ...response.data } : r
          ),
          currentRole:
            state.currentRole?.id === id
              ? { ...state.currentRole, ...response.data }
              : state.currentRole,
          isUpdating: false,
        }));
        return response.data;
      }
      throw new Error(response.message || "Failed to update role");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update role";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  deleteRole: async (id: string) => {
    set({ isDeleting: true, deleteError: null });
    try {
      await roleService.deleteRole(id);
      set((state) => ({
        roles: state.roles.filter((r) => r.id !== id),
        currentRole: state.currentRole?.id === id ? null : state.currentRole,
        isDeleting: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete role";
      set({ deleteError: message, isDeleting: false });
      throw error;
    }
  },

  fetchRolePermissions: async (roleId: string) => {
    set({ isLoadingPermissions: true, permissionsError: null });
    try {
      const response = await roleService.getRolePermissions(roleId);
      if (response.success) {
        set({ currentRolePermissions: response.data, isLoadingPermissions: false });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch role permissions";
      set({ permissionsError: message, isLoadingPermissions: false });
    }
  },

  syncRolePermissions: async (roleId: string, permissions: string[]) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await roleService.syncRolePermissions(roleId, permissions);
      if (response.success) {
        set((state) => ({
          currentRole:
            state.currentRole?.id === roleId
              ? { ...state.currentRole, permissions: response.data.permissions }
              : state.currentRole,
          isUpdating: false,
        }));
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to sync role permissions";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  fetchPermissions: async (params?: GetPermissionsParams) => {
    set({ isLoadingPermissions: true, permissionsError: null });
    try {
      const response = await permissionService.getPermissions(params);
      set({
        permissions: response.data,
        permissionsPagination: response.meta,
        isLoadingPermissions: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch permissions";
      set({ permissionsError: message, isLoadingPermissions: false });
    }
  },

  createPermission: async (data: CreatePermissionPayload) => {
    set({ isCreating: true, createError: null });
    try {
      const response = await permissionService.createPermission(data);
      if (response.success) {
        await get().fetchPermissions();
        set({ isCreating: false });
        return response.data;
      }
      throw new Error(response.message || "Failed to create permission");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create permission";
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
          permissions: state.permissions.map((p) =>
            p.id === id ? { ...p, ...response.data } : p
          ),
          isUpdating: false,
        }));
        return response.data;
      }
      throw new Error(response.message || "Failed to update permission");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update permission";
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
        isDeleting: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete permission";
      set({ deleteError: message, isDeleting: false });
      throw error;
    }
  },

  setFilters: (filters: Partial<RoleFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setSelectedRoleId: (id: string | null) => {
    set({ selectedRoleId: id });
  },

  clearErrors: () => {
    set({
      error: null,
      permissionsError: null,
      createError: null,
      updateError: null,
      deleteError: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
