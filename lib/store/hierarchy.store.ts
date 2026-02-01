import { create, type StateCreator } from "zustand";
import { hierarchyService } from "@/lib/api/services/hierarchy.service";
import type {
  RoleHierarchy,
  RoleTreeNode,
  GetHierarchiesParams,
  CreateHierarchyPayload,
  UpdateHierarchyPayload,
  ValidateHierarchyPayload,
  HierarchyValidationResult,
  HierarchyFilters,
  TreeViewState,
} from "@/types/hierarchy.types";
import type { PaginatedResponse } from "@/types/api.types";

interface HierarchyState {
  // Data
  hierarchies: RoleHierarchy[];
  currentHierarchy: RoleHierarchy | null;
  hierarchyTree: Record<string, RoleTreeNode[]>;
  validationResult: HierarchyValidationResult | null;
  pagination: PaginatedResponse<RoleHierarchy>["meta"] | null;

  // Loading states
  isLoading: boolean;
  isLoadingTree: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isValidating: boolean;

  // Error states
  error: string | null;
  treeError: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  validationError: string | null;

  // UI state
  filters: HierarchyFilters;
  selectedHierarchyId: string | null;
  treeViewState: TreeViewState;
  deleteConfirmation: {
    isOpen: boolean;
    hierarchyIds: string[];
  };

  // Actions
  fetchHierarchies: (params?: GetHierarchiesParams) => Promise<void>;
  fetchHierarchy: (id: string) => Promise<RoleHierarchy | null>;
  fetchHierarchyTree: (storeId: string) => Promise<void>;
  createHierarchy: (data: CreateHierarchyPayload) => Promise<RoleHierarchy>;
  updateHierarchy: (
    id: string,
    data: UpdateHierarchyPayload
  ) => Promise<RoleHierarchy>;
  deleteHierarchy: (hierarchy: RoleHierarchy | { higherRoleId: string; lowerRoleId: string; storeId: string; id?: string }) => Promise<void>;
  bulkDeleteHierarchies: (ids: string[]) => Promise<void>;
  validateHierarchy: (
    data: ValidateHierarchyPayload
  ) => Promise<HierarchyValidationResult>;

  // Tree view actions
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  toggleNodeExpansion: (nodeId: string) => void;

  // UI actions
  setFilters: (filters: Partial<HierarchyFilters>) => void;
  setSelectedHierarchyId: (id: string | null) => void;
  openDeleteConfirmation: (hierarchyIds: string[]) => void;
  closeDeleteConfirmation: () => void;
  clearValidationResult: () => void;
  clearErrors: () => void;
  reset: () => void;
}

const initialTreeViewState: TreeViewState = {
  expandedNodes: new Set(),
  selectedNode: null,
  focusedNode: null,
};

const initialState = {
  hierarchies: [],
  currentHierarchy: null,
  hierarchyTree: {},
  validationResult: null,
  pagination: null,
  isLoading: false,
  isLoadingTree: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isValidating: false,
  error: null,
  treeError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  validationError: null,
  filters: {},
  selectedHierarchyId: null,
  treeViewState: initialTreeViewState,
  deleteConfirmation: {
    isOpen: false,
    hierarchyIds: [],
  },
};

export const useHierarchyStore = create<HierarchyState>()((set: (partial: Partial<HierarchyState> | ((state: HierarchyState) => Partial<HierarchyState>)) => void, get: () => HierarchyState) => ({
  ...initialState,

  fetchHierarchies: async (params?: GetHierarchiesParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hierarchyService.getHierarchies(params);
      set({
        hierarchies: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch hierarchies";
      set({ error: message, isLoading: false });
    }
  },

  fetchHierarchy: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hierarchyService.getHierarchy(id);
      if (response.success) {
        set({ currentHierarchy: response.data, isLoading: false });
        return response.data;
      }
      throw new Error("Failed to fetch hierarchy");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch hierarchy";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  fetchHierarchyTree: async (storeId: string) => {
    set({ isLoadingTree: true, treeError: null });
    try {
      const response = await hierarchyService.getHierarchyTree(storeId);
      if (response.success) {
        set((state: HierarchyState) => ({
          hierarchyTree: { ...state.hierarchyTree, [storeId]: response.data },
          isLoadingTree: false,
        }));
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch hierarchy tree";
      set({ treeError: message, isLoadingTree: false });
    }
  },

  createHierarchy: async (data: CreateHierarchyPayload) => {
    set({ isCreating: true, createError: null });
    try {
      const response = await hierarchyService.createHierarchy(data);
      if (response.success) {
        await get().fetchHierarchies({ storeId: data.storeId });
        await get().fetchHierarchyTree(data.storeId);
        set({ isCreating: false });
        return response.data;
      }
      throw new Error(response.message || "Failed to create hierarchy");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create hierarchy";
      set({ createError: message, isCreating: false });
      throw error;
    }
  },

  updateHierarchy: async (id: string, data: UpdateHierarchyPayload) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await hierarchyService.updateHierarchy(id, data);
      if (response.success) {
        set((state: HierarchyState) => ({
          hierarchies: state.hierarchies.map((h: RoleHierarchy) =>
            h.id === id ? { ...h, ...response.data } : h
          ),
          currentHierarchy:
            state.currentHierarchy?.id === id
              ? { ...state.currentHierarchy, ...response.data }
              : state.currentHierarchy,
          isUpdating: false,
        }));
        return response.data;
      }
      throw new Error(response.message || "Failed to update hierarchy");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update hierarchy";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  deleteHierarchy: async (hierarchy: RoleHierarchy | { higherRoleId: string; lowerRoleId: string; storeId: string; id?: string }) => {
    set({ isDeleting: true, deleteError: null });
    try {
      await hierarchyService.deleteHierarchy({
        higherRoleId: hierarchy.higherRoleId,
        lowerRoleId: hierarchy.lowerRoleId,
        storeId: hierarchy.storeId,
      });
      const idToRemove = hierarchy.id;
      set((state: HierarchyState) => ({
        hierarchies: idToRemove 
          ? state.hierarchies.filter((h: RoleHierarchy) => h.id !== idToRemove)
          : state.hierarchies.filter((h: RoleHierarchy) => 
              !(h.higherRoleId === hierarchy.higherRoleId && 
                h.lowerRoleId === hierarchy.lowerRoleId && 
                h.storeId === hierarchy.storeId)),
        currentHierarchy:
          state.currentHierarchy?.id === idToRemove ? null : state.currentHierarchy,
        isDeleting: false,
        deleteConfirmation: { isOpen: false, hierarchyIds: [] },
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete hierarchy";
      set({ deleteError: message, isDeleting: false });
      throw error;
    }
  },

  bulkDeleteHierarchies: async (ids: string[]) => {
    set({ isDeleting: true, deleteError: null });
    try {
      await hierarchyService.bulkDeleteHierarchies(ids);
      set((state: HierarchyState) => ({
        hierarchies: state.hierarchies.filter((h: RoleHierarchy) => !ids.includes(h.id)),
        currentHierarchy:
          state.currentHierarchy && ids.includes(state.currentHierarchy.id)
            ? null
            : state.currentHierarchy,
        isDeleting: false,
        deleteConfirmation: { isOpen: false, hierarchyIds: [] },
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete hierarchies";
      set({ deleteError: message, isDeleting: false });
      throw error;
    }
  },

  validateHierarchy: async (data: ValidateHierarchyPayload) => {
    set({ isValidating: true, validationError: null, validationResult: null });
    try {
      const response = await hierarchyService.validateHierarchy(data);
      if (response.success) {
        set({ validationResult: response.data, isValidating: false });
        return response.data;
      }
      throw new Error(response.message || "Failed to validate hierarchy");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to validate hierarchy";
      set({ validationError: message, isValidating: false });
      throw error;
    }
  },

  // Tree view actions
  expandNode: (nodeId: string) => {
    set((state: HierarchyState) => ({
      treeViewState: {
        ...state.treeViewState,
        expandedNodes: new Set([...state.treeViewState.expandedNodes, nodeId]),
      },
    }));
  },

  collapseNode: (nodeId: string) => {
    set((state: HierarchyState) => {
      const newExpanded = new Set(state.treeViewState.expandedNodes);
      newExpanded.delete(nodeId);
      return {
        treeViewState: {
          ...state.treeViewState,
          expandedNodes: newExpanded,
        },
      };
    });
  },

  selectNode: (nodeId: string | null) => {
    set((state: HierarchyState) => ({
      treeViewState: {
        ...state.treeViewState,
        selectedNode: nodeId,
      },
    }));
  },

  toggleNodeExpansion: (nodeId: string) => {
    const { treeViewState } = get();
    if (treeViewState.expandedNodes.has(nodeId)) {
      get().collapseNode(nodeId);
    } else {
      get().expandNode(nodeId);
    }
  },

  // UI actions
  setFilters: (filters: Partial<HierarchyFilters>) => {
    set((state: HierarchyState) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setSelectedHierarchyId: (id: string | null) => {
    set({ selectedHierarchyId: id });
  },

  openDeleteConfirmation: (hierarchyIds: string[]) => {
    set({ deleteConfirmation: { isOpen: true, hierarchyIds } });
  },

  closeDeleteConfirmation: () => {
    set({ deleteConfirmation: { isOpen: false, hierarchyIds: [] } });
  },

  clearValidationResult: () => {
    set({ validationResult: null, validationError: null });
  },

  clearErrors: () => {
    set({
      error: null,
      treeError: null,
      createError: null,
      updateError: null,
      deleteError: null,
      validationError: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
