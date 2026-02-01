"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useUsersStore } from "@/lib/store/users.store";
import type { GetUsersParams, UserFilters } from "@/types/user.types";

/**
 * Hook for managing users list with pagination and filtering
 */
export function useUsers(initialParams?: GetUsersParams) {
  const {
    users,
    pagination,
    isLoading,
    error,
    filters,
    fetchUsers,
    setFilters,
  } = useUsersStore();

  useEffect(() => {
    fetchUsers(initialParams);
  }, [fetchUsers, initialParams]);

  const refetch = useCallback(
    (params?: GetUsersParams) => {
      fetchUsers({ ...initialParams, ...params });
    },
    [fetchUsers, initialParams]
  );

  const handleSearch = useCallback(
    (search: string) => {
      setFilters({ search });
      fetchUsers({ ...initialParams, search });
    },
    [fetchUsers, setFilters, initialParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchUsers({ ...initialParams, page });
    },
    [fetchUsers, initialParams]
  );

  return {
    users,
    pagination,
    isLoading,
    error,
    filters,
    refetch,
    handleSearch,
    handlePageChange,
    setFilters,
  };
}

/**
 * Hook for managing a single user
 */
export function useUser(userId: string | null) {
  const {
    currentUser,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    updateError,
    deleteError,
    fetchUser,
    updateUser,
    deleteUser,
    assignRoles,
    assignPermissions,
    clearErrors,
  } = useUsersStore();

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);

  const refetch = useCallback(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);

  return {
    user: currentUser,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    updateError,
    deleteError,
    refetch,
    updateUser: useCallback(
      (data: Parameters<typeof updateUser>[1]) =>
        userId ? updateUser(userId, data) : Promise.reject("No user selected"),
      [userId, updateUser]
    ),
    deleteUser: useCallback(
      () =>
        userId ? deleteUser(userId) : Promise.reject("No user selected"),
      [userId, deleteUser]
    ),
    assignRoles: useCallback(
      (roles: string[]) =>
        userId ? assignRoles(userId, roles) : Promise.reject("No user selected"),
      [userId, assignRoles]
    ),
    assignPermissions: useCallback(
      (permissions: string[]) =>
        userId
          ? assignPermissions(userId, permissions)
          : Promise.reject("No user selected"),
      [userId, assignPermissions]
    ),
    clearErrors,
  };
}

/**
 * Hook for creating users
 */
export function useCreateUser() {
  const { isCreating, createError, createUser, clearErrors } = useUsersStore();

  return {
    isCreating,
    error: createError,
    createUser,
    clearErrors,
  };
}

/**
 * Hook for role/permission management on users
 */
export function useUserRolePermissions(userId: string | null) {
  const { currentUser, isUpdating, updateError, assignRoles, assignPermissions } =
    useUsersStore();

  const userRoles = useMemo(
    () => currentUser?.roles?.map((r: { name: string }) => r.name) || [],
    [currentUser]
  );

  const userPermissions = useMemo(
    () => currentUser?.permissions?.map((p: { name: string }) => p.name) || [],
    [currentUser]
  );

  return {
    userRoles,
    userPermissions,
    isUpdating,
    error: updateError,
    assignRoles: useCallback(
      (roles: string[]) =>
        userId ? assignRoles(userId, roles) : Promise.reject("No user selected"),
      [userId, assignRoles]
    ),
    assignPermissions: useCallback(
      (permissions: string[]) =>
        userId
          ? assignPermissions(userId, permissions)
          : Promise.reject("No user selected"),
      [userId, assignPermissions]
    ),
  };
}
