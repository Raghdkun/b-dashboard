"use client";

import { useEffect, useCallback } from "react";
import { useStoresStore } from "@/lib/store/stores.store";
import type { GetStoresParams, StoreFilters } from "@/types/store.types";

/**
 * Hook for managing stores list with pagination and filtering
 */
export function useStores(initialParams?: GetStoresParams) {
  const {
    stores,
    pagination,
    isLoading,
    error,
    filters,
    fetchStores,
    setFilters,
  } = useStoresStore();

  useEffect(() => {
    fetchStores(initialParams);
  }, [fetchStores, initialParams]);

  const refetch = useCallback(
    (params?: GetStoresParams) => {
      fetchStores({ ...initialParams, ...params });
    },
    [fetchStores, initialParams]
  );

  const handleSearch = useCallback(
    (search: string) => {
      setFilters({ search });
      fetchStores({ ...initialParams, search });
    },
    [fetchStores, setFilters, initialParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchStores({ ...initialParams, page });
    },
    [fetchStores, initialParams]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<StoreFilters>) => {
      setFilters(newFilters);
      fetchStores({
        ...initialParams,
        search: newFilters.search,
        isActive: newFilters.isActive,
      });
    },
    [fetchStores, setFilters, initialParams]
  );

  return {
    stores,
    pagination,
    isLoading,
    error,
    filters,
    refetch,
    handleSearch,
    handlePageChange,
    handleFilterChange,
    setFilters,
  };
}

/**
 * Hook for managing a single store with users and roles
 */
export function useStore(storeId: string | null) {
  const {
    currentStore,
    storeUsers,
    storeRoles,
    isLoading,
    isLoadingUsers,
    isLoadingRoles,
    isUpdating,
    isDeleting,
    error,
    updateError,
    deleteError,
    fetchStore,
    fetchStoreUsers,
    fetchStoreRoles,
    updateStore,
    deleteStore,
    clearErrors,
  } = useStoresStore();

  useEffect(() => {
    if (storeId) {
      fetchStore(storeId);
    }
  }, [storeId, fetchStore]);

  const loadStoreUsers = useCallback(() => {
    if (storeId) {
      fetchStoreUsers(storeId);
    }
  }, [storeId, fetchStoreUsers]);

  const loadStoreRoles = useCallback(() => {
    if (storeId) {
      fetchStoreRoles(storeId);
    }
  }, [storeId, fetchStoreRoles]);

  const refetch = useCallback(() => {
    if (storeId) {
      fetchStore(storeId);
    }
  }, [storeId, fetchStore]);

  return {
    store: currentStore,
    users: storeId ? storeUsers[storeId] || [] : [],
    roles: storeId ? storeRoles[storeId] || [] : [],
    isLoading,
    isLoadingUsers,
    isLoadingRoles,
    isUpdating,
    isDeleting,
    error,
    updateError,
    deleteError,
    refetch,
    loadStoreUsers,
    loadStoreRoles,
    updateStore: useCallback(
      (data: Parameters<typeof updateStore>[1]) =>
        storeId
          ? updateStore(storeId, data)
          : Promise.reject("No store selected"),
      [storeId, updateStore]
    ),
    deleteStore: useCallback(
      () =>
        storeId ? deleteStore(storeId) : Promise.reject("No store selected"),
      [storeId, deleteStore]
    ),
    clearErrors,
  };
}

/**
 * Hook for creating stores
 */
export function useCreateStore() {
  const { isCreating, createError, createStore, clearErrors } = useStoresStore();

  return {
    isCreating,
    error: createError,
    createStore,
    clearErrors,
  };
}

/**
 * Hook for fetching store details
 */
export function useStoreDetails(storeId: string) {
  const {
    currentStore,
    isLoading,
    error,
    fetchStore,
  } = useStoresStore();

  const fetchStoreDetails = useCallback(() => {
    if (storeId) {
      fetchStore(storeId);
    }
  }, [storeId, fetchStore]);

  return {
    store: currentStore,
    isLoading,
    error,
    fetchStore: fetchStoreDetails,
  };
}

/**
 * Hook for updating stores
 */
export function useUpdateStore() {
  const { isUpdating, updateError, updateStore, clearErrors } = useStoresStore();

  return {
    isUpdating,
    error: updateError,
    updateStore,
    clearErrors,
  };
}

/**
 * Hook for deleting stores
 */
export function useDeleteStore() {
  const { isDeleting, deleteError, deleteStore, clearErrors } = useStoresStore();

  return {
    isDeleting,
    error: deleteError,
    deleteStore,
    clearErrors,
  };
}
