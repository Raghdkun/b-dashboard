/**
 * Permissions Hooks
 * Custom hooks for permissions feature
 */

import { useCallback, useEffect } from "react";
import { usePermissionsStore } from "@/lib/store/permissions.store";
import type { CreatePermissionPayload, UpdatePermissionPayload } from "@/types/role.types";

/**
 * Hook for fetching and managing permissions list
 */
export function usePermissions() {
  const {
    permissions,
    pagination,
    isLoading,
    error,
    filters,
    fetchPermissions,
    setFilters,
    clearErrors,
  } = usePermissionsStore();

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const refetch = useCallback(() => {
    fetchPermissions(pagination?.page || 1);
  }, [fetchPermissions, pagination?.page]);

  const goToPage = useCallback(
    (page: number) => {
      fetchPermissions(page);
    },
    [fetchPermissions]
  );

  const search = useCallback(
    (searchTerm: string) => {
      setFilters({ search: searchTerm });
      fetchPermissions(1);
    },
    [setFilters, fetchPermissions]
  );

  return {
    permissions,
    pagination,
    isLoading,
    error,
    filters,
    refetch,
    goToPage,
    search,
    setFilters,
    clearErrors,
  };
}

/**
 * Hook for creating permissions
 */
export function useCreatePermission() {
  const { isCreating, createError, createPermission, clearErrors } =
    usePermissionsStore();

  return {
    isCreating,
    error: createError,
    createPermission,
    clearErrors,
  };
}

/**
 * Hook for updating permissions
 */
export function useUpdatePermission(permissionId?: string) {
  const {
    currentPermission,
    isLoading,
    isUpdating,
    error,
    updateError,
    fetchPermission,
    updatePermission,
    clearErrors,
  } = usePermissionsStore();

  useEffect(() => {
    if (permissionId) {
      fetchPermission(permissionId);
    }
  }, [permissionId, fetchPermission]);

  const update = useCallback(
    async (data: UpdatePermissionPayload) => {
      if (!permissionId) throw new Error("No permission ID provided");
      return updatePermission(permissionId, data);
    },
    [permissionId, updatePermission]
  );

  return {
    permission: currentPermission,
    isLoading,
    isUpdating,
    error: error || updateError,
    update,
    refetch: () => permissionId && fetchPermission(permissionId),
    clearErrors,
  };
}

/**
 * Hook for deleting permissions
 */
export function useDeletePermission() {
  const { isDeleting, deleteError, deletePermission, clearErrors } =
    usePermissionsStore();

  return {
    isDeleting,
    error: deleteError,
    deletePermission,
    clearErrors,
  };
}
