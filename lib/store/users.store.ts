import { create } from "zustand";
import { userService } from "@/lib/api/services/user.service";
import type {
  User,
  GetUsersParams,
  CreateUserPayload,
  UpdateUserPayload,
  UserFilters,
} from "@/types/user.types";
import type { PaginatedResponse } from "@/types/api.types";

interface UsersState {
  // Data
  users: User[];
  currentUser: User | null;
  pagination: PaginatedResponse<User>["meta"] | null;

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
  filters: UserFilters;
  selectedUserId: string | null;

  // Actions
  fetchUsers: (params?: GetUsersParams) => Promise<void>;
  fetchUser: (id: string) => Promise<User | null>;
  createUser: (data: CreateUserPayload) => Promise<User>;
  updateUser: (id: string, data: UpdateUserPayload) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  assignRoles: (userId: string, roles: string[]) => Promise<User>;
  assignPermissions: (userId: string, permissions: string[]) => Promise<User>;
  setFilters: (filters: Partial<UserFilters>) => void;
  setSelectedUserId: (id: string | null) => void;
  clearErrors: () => void;
  reset: () => void;
}

const initialState = {
  users: [],
  currentUser: null,
  pagination: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  filters: {},
  selectedUserId: null,
};

export const useUsersStore = create<UsersState>()((set, get) => ({
  ...initialState,

  fetchUsers: async (params?: GetUsersParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUsers({
        page: params?.page,
        pageSize: params?.perPage,
        search: params?.search,
        role: params?.role,
        status: params?.status,
      });
      set({
        users: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch users";
      set({ error: message, isLoading: false });
    }
  },

  fetchUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUser(id);
      if (response.success) {
        set({ currentUser: response.data, isLoading: false });
        return response.data;
      }
      throw new Error("Failed to fetch user");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch user";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  createUser: async (data: CreateUserPayload) => {
    set({ isCreating: true, createError: null });
    try {
      const response = await userService.createUser(data);
      if (response.success) {
        // Refresh the users list
        await get().fetchUsers();
        set({ isCreating: false });
        return response.data;
      }
      throw new Error(response.message || "Failed to create user");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create user";
      set({ createError: message, isCreating: false });
      throw error;
    }
  },

  updateUser: async (id: string, data: UpdateUserPayload) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await userService.updateUser(id, data);
      if (response.success) {
        // Update in list
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...response.data } : u
          ),
          currentUser:
            state.currentUser?.id === id
              ? { ...state.currentUser, ...response.data }
              : state.currentUser,
          isUpdating: false,
        }));
        return response.data;
      }
      throw new Error("Failed to update user");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update user";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ isDeleting: true, deleteError: null });
    try {
      await userService.deleteUser(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        currentUser: state.currentUser?.id === id ? null : state.currentUser,
        isDeleting: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete user";
      set({ deleteError: message, isDeleting: false });
      throw error;
    }
  },

  assignRoles: async (userId: string, roles: string[]) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await userService.assignRoles(userId, roles);
      if (response.success) {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, ...response.data } : u
          ),
          currentUser:
            state.currentUser?.id === userId
              ? { ...state.currentUser, ...response.data }
              : state.currentUser,
          isUpdating: false,
        }));
        return response.data;
      }
      throw new Error("Failed to assign roles");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to assign roles";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  assignPermissions: async (userId: string, permissions: string[]) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await userService.assignPermissions(userId, permissions);
      if (response.success) {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, ...response.data } : u
          ),
          currentUser:
            state.currentUser?.id === userId
              ? { ...state.currentUser, ...response.data }
              : state.currentUser,
          isUpdating: false,
        }));
        return response.data;
      }
      throw new Error("Failed to assign permissions");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to assign permissions";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  setFilters: (filters: Partial<UserFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setSelectedUserId: (id: string | null) => {
    set({ selectedUserId: id });
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
