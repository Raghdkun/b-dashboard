import { create } from "zustand";
import { assignmentService } from "@/lib/api/services/assignment.service";
import type {
  Assignment,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  BulkAssignPayload,
  BulkAssignmentResponse,
  AssignmentFilters,
  BulkSelectionState,
  BulkProgressState,
} from "@/types/assignment.types";
import type { PaginatedResponse } from "@/types/api.types";

interface AssignmentsState {
  // Data
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  storeAssignments: Record<string, Assignment[]>;
  userAssignments: Record<string, Assignment[]>;
  bulkResult: BulkAssignmentResponse | null;
  pagination: PaginatedResponse<Assignment>["meta"] | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isBulkProcessing: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  bulkError: string | null;

  // UI state
  filters: AssignmentFilters;
  selectedAssignmentId: string | null;
  bulkSelection: BulkSelectionState;
  bulkProgress: BulkProgressState;

  // Actions
  fetchStoreAssignments: (storeId: string, page?: number) => Promise<void>;
  fetchUserAssignments: (userId: string, page?: number) => Promise<void>;
  fetchAssignment: (id: string) => Promise<Assignment | null>;
  createAssignment: (data: CreateAssignmentPayload) => Promise<Assignment>;
  updateAssignment: (
    id: string,
    data: UpdateAssignmentPayload
  ) => Promise<Assignment>;
  deleteAssignment: (userId: string, roleId: string, storeId: string) => Promise<void>;
  toggleAssignment: (userId: string, roleId: string, storeId: string) => Promise<Assignment>;
  bulkAssign: (data: BulkAssignPayload) => Promise<BulkAssignmentResponse>;
  removeByContext: (
    userId: string,
    roleId: string,
    storeId: string
  ) => Promise<void>;

  // Selection actions
  selectUser: (userId: string) => void;
  deselectUser: (userId: string) => void;
  selectRole: (roleId: string) => void;
  deselectRole: (roleId: string) => void;
  selectStore: (storeId: string) => void;
  deselectStore: (storeId: string) => void;
  clearSelection: () => void;

  // UI actions
  setFilters: (filters: Partial<AssignmentFilters>) => void;
  setSelectedAssignmentId: (id: string | null) => void;
  clearBulkResult: () => void;
  clearErrors: () => void;
  reset: () => void;
}

const initialBulkSelection: BulkSelectionState = {
  selectedUsers: [],
  selectedRoles: [],
  selectedStores: [],
};

const initialBulkProgress: BulkProgressState = {
  isProcessing: false,
  total: 0,
  completed: 0,
  failed: 0,
};

const initialState = {
  assignments: [],
  currentAssignment: null,
  storeAssignments: {},
  userAssignments: {},
  bulkResult: null,
  pagination: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isBulkProcessing: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  bulkError: null,
  filters: {},
  selectedAssignmentId: null,
  bulkSelection: initialBulkSelection,
  bulkProgress: initialBulkProgress,
};

export const useAssignmentsStore = create<AssignmentsState>()((set, get) => ({
  ...initialState,

  fetchStoreAssignments: async (storeId: string, page?: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await assignmentService.getStoreAssignments({
        storeId,
        page,
      });
      set((state) => ({
        storeAssignments: {
          ...state.storeAssignments,
          [storeId]: response.data,
        },
        pagination: response.meta,
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch store assignments";
      set({ error: message, isLoading: false });
    }
  },

  fetchUserAssignments: async (userId: string, page?: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await assignmentService.getUserAssignments({
        userId,
        page,
      });
      set((state) => ({
        userAssignments: { ...state.userAssignments, [userId]: response.data },
        pagination: response.meta,
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch user assignments";
      set({ error: message, isLoading: false });
    }
  },

  fetchAssignment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await assignmentService.getAssignment(id);
      if (response.success) {
        set({ currentAssignment: response.data, isLoading: false });
        return response.data;
      }
      throw new Error("Failed to fetch assignment");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch assignment";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  createAssignment: async (data: CreateAssignmentPayload) => {
    set({ isCreating: true, createError: null });
    try {
      const response = await assignmentService.createAssignment(data);
      if (response.success) {
        // Refresh relevant caches
        if (data.storeId) {
          await get().fetchStoreAssignments(data.storeId);
        }
        if (data.userId) {
          await get().fetchUserAssignments(data.userId);
        }
        set({ isCreating: false });
        return response.data;
      }
      throw new Error(response.message || "Failed to create assignment");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create assignment";
      set({ createError: message, isCreating: false });
      throw error;
    }
  },

  updateAssignment: async (id: string, data: UpdateAssignmentPayload) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await assignmentService.updateAssignment(id, data);
      if (response.success) {
        set((state) => ({
          currentAssignment:
            state.currentAssignment?.id === id
              ? { ...state.currentAssignment, ...response.data }
              : state.currentAssignment,
          isUpdating: false,
        }));
        return response.data;
      }
      throw new Error(response.message || "Failed to update assignment");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update assignment";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  deleteAssignment: async (userId: string, roleId: string, storeId: string) => {
    set({ isDeleting: true, deleteError: null });
    try {
      await assignmentService.deleteAssignment(userId, roleId, storeId);
      set((state) => ({
        // Clear any cached assignments that might match
        storeAssignments: {
          ...state.storeAssignments,
          [storeId]: (state.storeAssignments[storeId] || []).filter(
            (a) => !(a.userId === userId && a.roleId === roleId)
          ),
        },
        userAssignments: {
          ...state.userAssignments,
          [userId]: (state.userAssignments[userId] || []).filter(
            (a) => !(a.storeId === storeId && a.roleId === roleId)
          ),
        },
        isDeleting: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete assignment";
      set({ deleteError: message, isDeleting: false });
      throw error;
    }
  },

  toggleAssignment: async (userId: string, roleId: string, storeId: string) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await assignmentService.toggleAssignment(userId, roleId, storeId);
      if (response.success) {
        set({ isUpdating: false });
        return response.data;
      }
      throw new Error(response.message || "Failed to toggle assignment");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to toggle assignment";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  bulkAssign: async (data: BulkAssignPayload) => {
    set({
      isBulkProcessing: true,
      bulkError: null,
      bulkProgress: {
        isProcessing: true,
        total: data.assignments.length,
        completed: 0,
        failed: 0,
      },
    });
    try {
      const response = await assignmentService.bulkAssign(data);
      if (response.success) {
        set({
          bulkResult: response.data,
          isBulkProcessing: false,
          bulkProgress: {
            isProcessing: false,
            total: response.data.totalRequested,
            completed: response.data.successCount,
            failed: response.data.failureCount,
          },
        });
        // Refresh user assignments
        await get().fetchUserAssignments(data.userId);
        return response.data;
      }
      throw new Error(response.message || "Failed to bulk assign");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to bulk assign";
      set({
        bulkError: message,
        isBulkProcessing: false,
        bulkProgress: { ...initialBulkProgress },
      });
      throw error;
    }
  },

  removeByContext: async (userId: string, roleId: string, storeId: string) => {
    set({ isDeleting: true, deleteError: null });
    try {
      await assignmentService.deleteAssignment(userId, roleId, storeId);
      // Refresh relevant caches
      await get().fetchStoreAssignments(storeId);
      await get().fetchUserAssignments(userId);
      set({ isDeleting: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove assignment";
      set({ deleteError: message, isDeleting: false });
      throw error;
    }
  },

  // Selection actions
  selectUser: (userId: string) => {
    set((state) => ({
      bulkSelection: {
        ...state.bulkSelection,
        selectedUsers: [...state.bulkSelection.selectedUsers, userId],
      },
    }));
  },

  deselectUser: (userId: string) => {
    set((state) => ({
      bulkSelection: {
        ...state.bulkSelection,
        selectedUsers: state.bulkSelection.selectedUsers.filter(
          (id) => id !== userId
        ),
      },
    }));
  },

  selectRole: (roleId: string) => {
    set((state) => ({
      bulkSelection: {
        ...state.bulkSelection,
        selectedRoles: [...state.bulkSelection.selectedRoles, roleId],
      },
    }));
  },

  deselectRole: (roleId: string) => {
    set((state) => ({
      bulkSelection: {
        ...state.bulkSelection,
        selectedRoles: state.bulkSelection.selectedRoles.filter(
          (id) => id !== roleId
        ),
      },
    }));
  },

  selectStore: (storeId: string) => {
    set((state) => ({
      bulkSelection: {
        ...state.bulkSelection,
        selectedStores: [...state.bulkSelection.selectedStores, storeId],
      },
    }));
  },

  deselectStore: (storeId: string) => {
    set((state) => ({
      bulkSelection: {
        ...state.bulkSelection,
        selectedStores: state.bulkSelection.selectedStores.filter(
          (id) => id !== storeId
        ),
      },
    }));
  },

  clearSelection: () => {
    set({ bulkSelection: initialBulkSelection });
  },

  // UI actions
  setFilters: (filters: Partial<AssignmentFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setSelectedAssignmentId: (id: string | null) => {
    set({ selectedAssignmentId: id });
  },

  clearBulkResult: () => {
    set({ bulkResult: null, bulkProgress: initialBulkProgress });
  },

  clearErrors: () => {
    set({
      error: null,
      createError: null,
      updateError: null,
      deleteError: null,
      bulkError: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
