"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useHierarchyStore } from "@/lib/store/hierarchy.store";
import type {
  GetHierarchiesParams,
  HierarchyFilters,
  RoleTreeNode,
  FlatTreeNode,
} from "@/types/hierarchy.types";

/**
 * Hook for managing hierarchies list with pagination and filtering
 */
export function useHierarchies(initialParams?: GetHierarchiesParams) {
  const {
    hierarchies,
    pagination,
    isLoading,
    error,
    filters,
    fetchHierarchies,
    setFilters,
  } = useHierarchyStore();

  useEffect(() => {
    fetchHierarchies(initialParams);
  }, [fetchHierarchies, initialParams]);

  const refetch = useCallback(
    (params?: GetHierarchiesParams) => {
      fetchHierarchies({ ...initialParams, ...params });
    },
    [fetchHierarchies, initialParams]
  );

  const handleStoreFilter = useCallback(
    (storeId: string | undefined) => {
      setFilters({ storeId });
      fetchHierarchies({ ...initialParams, storeId });
    },
    [fetchHierarchies, setFilters, initialParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchHierarchies({ ...initialParams, page });
    },
    [fetchHierarchies, initialParams]
  );

  return {
    hierarchies,
    pagination,
    isLoading,
    error,
    filters,
    refetch,
    handleStoreFilter,
    handlePageChange,
    setFilters,
  };
}

/**
 * Hook for managing a single hierarchy
 */
export function useHierarchy(hierarchyId: string | null) {
  const {
    currentHierarchy,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    updateError,
    deleteError,
    fetchHierarchy,
    updateHierarchy,
    deleteHierarchy,
    clearErrors,
  } = useHierarchyStore();

  useEffect(() => {
    if (hierarchyId) {
      fetchHierarchy(hierarchyId);
    }
  }, [hierarchyId, fetchHierarchy]);

  const refetch = useCallback(() => {
    if (hierarchyId) {
      fetchHierarchy(hierarchyId);
    }
  }, [hierarchyId, fetchHierarchy]);

  return {
    hierarchy: currentHierarchy,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    updateError,
    deleteError,
    refetch,
    updateHierarchy: useCallback(
      (data: Parameters<typeof updateHierarchy>[1]) =>
        hierarchyId
          ? updateHierarchy(hierarchyId, data)
          : Promise.reject("No hierarchy selected"),
      [hierarchyId, updateHierarchy]
    ),
    deleteHierarchy: useCallback(
      () =>
        currentHierarchy
          ? deleteHierarchy(currentHierarchy)
          : Promise.reject("No hierarchy selected"),
      [currentHierarchy, deleteHierarchy]
    ),
    clearErrors,
  };
}

/**
 * Hook for creating hierarchies
 */
export function useCreateHierarchy() {
  const { isCreating, createError, createHierarchy, clearErrors } =
    useHierarchyStore();

  return {
    isCreating,
    error: createError,
    createHierarchy,
    clearErrors,
  };
}

/**
 * Hook for fetching hierarchy details
 */
export function useHierarchyDetails(hierarchyId: string) {
  const {
    currentHierarchy,
    isLoading,
    error,
    fetchHierarchy,
  } = useHierarchyStore();

  const fetchHierarchyDetails = useCallback(() => {
    if (hierarchyId) {
      fetchHierarchy(hierarchyId);
    }
  }, [hierarchyId, fetchHierarchy]);

  return {
    hierarchy: currentHierarchy,
    isLoading,
    error,
    fetchHierarchy: fetchHierarchyDetails,
  };
}

/**
 * Hook for updating hierarchies
 */
export function useUpdateHierarchy() {
  const { isUpdating, updateError, updateHierarchy, clearErrors } = useHierarchyStore();

  return {
    isUpdating,
    error: updateError,
    updateHierarchy,
    clearErrors,
  };
}

/**
 * Hook for deleting hierarchies
 */
export function useDeleteHierarchy() {
  const { isDeleting, deleteError, deleteHierarchy, clearErrors } = useHierarchyStore();

  return {
    isDeleting,
    error: deleteError,
    deleteHierarchy,
    clearErrors,
  };
}

/**
 * Hook for managing hierarchy tree view for a store
 */
export function useHierarchyTree(storeId: string | null) {
  const {
    hierarchyTree,
    isLoadingTree,
    treeError,
    treeViewState,
    fetchHierarchyTree,
    expandNode,
    collapseNode,
    selectNode,
    toggleNodeExpansion,
  } = useHierarchyStore();

  useEffect(() => {
    if (storeId) {
      fetchHierarchyTree(storeId);
    }
  }, [storeId, fetchHierarchyTree]);

  const tree = useMemo(
    () => (storeId ? hierarchyTree[storeId] || [] : []),
    [storeId, hierarchyTree]
  );

  // Flatten tree for list rendering
  const flattenTree = useCallback(
    (
      nodes: RoleTreeNode[],
      depth: number = 0,
      parentId: string | null = null
    ): FlatTreeNode[] => {
      const result: FlatTreeNode[] = [];
      for (const node of nodes) {
        const nodeId = node.role.id;
        const isExpanded = treeViewState.expandedNodes.has(nodeId);
        result.push({
          id: nodeId,
          role: node.role,
          depth,
          hasChildren: node.children.length > 0,
          isExpanded,
          parentId,
        });
        if (isExpanded && node.children.length > 0) {
          result.push(...flattenTree(node.children, depth + 1, nodeId));
        }
      }
      return result;
    },
    [treeViewState.expandedNodes]
  );

  const flatTree = useMemo(() => flattenTree(tree), [tree, flattenTree]);

  const refetch = useCallback(() => {
    if (storeId) {
      fetchHierarchyTree(storeId);
    }
  }, [storeId, fetchHierarchyTree]);

  return {
    tree,
    flatTree,
    isLoading: isLoadingTree,
    error: treeError,
    selectedNode: treeViewState.selectedNode,
    expandedNodes: treeViewState.expandedNodes,
    refetch,
    expandNode,
    collapseNode,
    selectNode,
    toggleNodeExpansion,
    expandAll: useCallback(() => {
      const getAllNodeIds = (nodes: RoleTreeNode[]): string[] => {
        const ids: string[] = [];
        for (const node of nodes) {
          ids.push(node.role.id);
          if (node.children.length > 0) {
            ids.push(...getAllNodeIds(node.children));
          }
        }
        return ids;
      };
      getAllNodeIds(tree).forEach((id) => expandNode(id));
    }, [tree, expandNode]),
    collapseAll: useCallback(() => {
      const getAllNodeIds = (nodes: RoleTreeNode[]): string[] => {
        const ids: string[] = [];
        for (const node of nodes) {
          ids.push(node.role.id);
          if (node.children.length > 0) {
            ids.push(...getAllNodeIds(node.children));
          }
        }
        return ids;
      };
      getAllNodeIds(tree).forEach((id) => collapseNode(id));
    }, [tree, collapseNode]),
  };
}

/**
 * Hook for validating hierarchy configurations
 */
export function useHierarchyValidation() {
  const {
    validationResult,
    isValidating,
    validationError,
    validateHierarchy,
    clearValidationResult,
    clearErrors,
  } = useHierarchyStore();

  return {
    validationResult,
    isValidating,
    error: validationError,
    validateHierarchy,
    clearValidationResult,
    clearErrors,
  };
}

/**
 * Hook for managing hierarchy delete confirmation
 */
export function useHierarchyDeleteConfirmation() {
  const {
    deleteConfirmation,
    isDeleting,
    deleteError,
    hierarchies,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    deleteHierarchy,
    bulkDeleteHierarchies,
    clearErrors,
  } = useHierarchyStore();

  const confirmDelete = useCallback(async () => {
    if (deleteConfirmation.hierarchyIds.length === 1) {
      // Find the full hierarchy object to get required fields
      const hierarchy = hierarchies.find(h => h.id === deleteConfirmation.hierarchyIds[0]);
      if (hierarchy) {
        await deleteHierarchy(hierarchy);
      } else {
        throw new Error("Hierarchy not found");
      }
    } else if (deleteConfirmation.hierarchyIds.length > 1) {
      await bulkDeleteHierarchies(deleteConfirmation.hierarchyIds);
    }
  }, [deleteConfirmation.hierarchyIds, hierarchies, deleteHierarchy, bulkDeleteHierarchies]);

  return {
    isOpen: deleteConfirmation.isOpen,
    hierarchyIds: deleteConfirmation.hierarchyIds,
    isDeleting,
    error: deleteError,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDelete,
    clearErrors,
  };
}
