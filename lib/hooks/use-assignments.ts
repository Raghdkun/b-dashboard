"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useAssignmentsStore } from "@/lib/store/assignments.store";
import type { AssignmentFilters, BulkAssignmentItem } from "@/types/assignment.types";

/**
 * Hook for managing store assignments
 */
export function useStoreAssignments(storeId: string | null) {
  const {
    storeAssignments,
    pagination,
    isLoading,
    isDeleting,
    error,
    deleteError,
    fetchStoreAssignments,
    deleteAssignment,
    toggleAssignment,
    clearErrors,
  } = useAssignmentsStore();

  useEffect(() => {
    if (storeId) {
      fetchStoreAssignments(storeId);
    }
  }, [storeId, fetchStoreAssignments]);

  const assignments = useMemo(
    () => (storeId ? storeAssignments[storeId] || [] : []),
    [storeId, storeAssignments]
  );

  const refetch = useCallback(
    (page?: number) => {
      if (storeId) {
        fetchStoreAssignments(storeId, page);
      }
    },
    [storeId, fetchStoreAssignments]
  );

  return {
    assignments,
    pagination,
    isLoading,
    isDeleting,
    error,
    deleteError,
    refetch,
    deleteAssignment,
    toggleAssignment,
    clearErrors,
  };
}

/**
 * Hook for managing user assignments
 */
export function useUserAssignments(userId: string | null) {
  const {
    userAssignments,
    pagination,
    isLoading,
    isDeleting,
    error,
    deleteError,
    fetchUserAssignments,
    deleteAssignment,
    toggleAssignment,
    removeByContext,
    clearErrors,
  } = useAssignmentsStore();

  useEffect(() => {
    if (userId) {
      fetchUserAssignments(userId);
    }
  }, [userId, fetchUserAssignments]);

  const assignments = useMemo(
    () => (userId ? userAssignments[userId] || [] : []),
    [userId, userAssignments]
  );

  const refetch = useCallback(
    (page?: number) => {
      if (userId) {
        fetchUserAssignments(userId, page);
      }
    },
    [userId, fetchUserAssignments]
  );

  return {
    assignments,
    pagination,
    isLoading,
    isDeleting,
    error,
    deleteError,
    refetch,
    deleteAssignment,
    toggleAssignment,
    removeByContext: useCallback(
      (roleId: string, storeId: string) =>
        userId
          ? removeByContext(userId, roleId, storeId)
          : Promise.reject("No user selected"),
      [userId, removeByContext]
    ),
    clearErrors,
  };
}

/**
 * Hook for creating assignments
 */
export function useCreateAssignment() {
  const { isCreating, createError, createAssignment, clearErrors } =
    useAssignmentsStore();

  return {
    isCreating,
    error: createError,
    createAssignment,
    clearErrors,
  };
}

/**
 * Hook for fetching assignment details
 */
export function useAssignmentDetails(assignmentId: string) {
  const {
    currentAssignment,
    isLoading,
    error,
    fetchAssignment,
  } = useAssignmentsStore();

  const fetchAssignmentDetails = useCallback(() => {
    if (assignmentId) {
      fetchAssignment(assignmentId);
    }
  }, [assignmentId, fetchAssignment]);

  return {
    assignment: currentAssignment,
    isLoading,
    error,
    fetchAssignment: fetchAssignmentDetails,
  };
}

/**
 * Hook for bulk assignment operations
 */
export function useBulkAssignment() {
  const {
    bulkSelection,
    bulkProgress,
    bulkResult,
    isBulkProcessing,
    bulkError,
    bulkAssign,
    selectUser,
    deselectUser,
    selectRole,
    deselectRole,
    selectStore,
    deselectStore,
    clearSelection,
    clearBulkResult,
    clearErrors,
  } = useAssignmentsStore();

  const canSubmit = useMemo(
    () =>
      bulkSelection.selectedUsers.length > 0 &&
      bulkSelection.selectedRoles.length > 0 &&
      bulkSelection.selectedStores.length > 0,
    [bulkSelection]
  );

  const totalAssignments = useMemo(
    () =>
      bulkSelection.selectedUsers.length *
      bulkSelection.selectedRoles.length *
      bulkSelection.selectedStores.length,
    [bulkSelection]
  );

  const executeBulkAssign = useCallback(async () => {
    if (!canSubmit) {
      throw new Error("Please select at least one user, role, and store");
    }

    // For each user, create assignments for all role-store combinations
    const results = [];
    for (const userId of bulkSelection.selectedUsers) {
      const assignments: BulkAssignmentItem[] = [];
      for (const roleId of bulkSelection.selectedRoles) {
        for (const storeId of bulkSelection.selectedStores) {
          assignments.push({ roleId, storeId });
        }
      }
      const result = await bulkAssign({ userId, assignments });
      results.push(result);
    }
    return results;
  }, [bulkSelection, bulkAssign, canSubmit]);

  // Toggle functions for multi-select behavior
  const toggleUser = useCallback(
    (userId: string) => {
      if (bulkSelection.selectedUsers.includes(userId)) {
        deselectUser(userId);
      } else {
        selectUser(userId);
      }
    },
    [bulkSelection.selectedUsers, selectUser, deselectUser]
  );

  const toggleRole = useCallback(
    (roleId: string) => {
      if (bulkSelection.selectedRoles.includes(roleId)) {
        deselectRole(roleId);
      } else {
        selectRole(roleId);
      }
    },
    [bulkSelection.selectedRoles, selectRole, deselectRole]
  );

  const toggleStore = useCallback(
    (storeId: string) => {
      if (bulkSelection.selectedStores.includes(storeId)) {
        deselectStore(storeId);
      } else {
        selectStore(storeId);
      }
    },
    [bulkSelection.selectedStores, selectStore, deselectStore]
  );

  return {
    selection: bulkSelection,
    progress: bulkProgress,
    result: bulkResult,
    isProcessing: isBulkProcessing,
    error: bulkError,
    canSubmit,
    totalAssignments,
    toggleUser,
    toggleRole,
    toggleStore,
    selectUser,
    deselectUser,
    selectRole,
    deselectRole,
    selectStore,
    deselectStore,
    clearSelection,
    executeBulkAssign,
    clearBulkResult,
    clearErrors,
  };
}
