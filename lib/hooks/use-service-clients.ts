/**
 * Service Clients Hooks
 * Custom hooks for service clients feature
 */

import { useCallback, useEffect } from "react";
import { useServiceClientsStore } from "@/lib/store/service-clients.store";
import type {
  CreateServiceClientPayload,
  UpdateServiceClientPayload,
  RotateTokenPayload,
} from "@/types/service-client.types";

/**
 * Hook for fetching and managing service clients list
 */
export function useServiceClients() {
  const {
    clients,
    pagination,
    isLoading,
    error,
    filters,
    fetchClients,
    setFilters,
    clearErrors,
  } = useServiceClientsStore();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const refetch = useCallback(() => {
    fetchClients(pagination?.page || 1);
  }, [fetchClients, pagination?.page]);

  const goToPage = useCallback(
    (page: number) => {
      fetchClients(page);
    },
    [fetchClients]
  );

  const search = useCallback(
    (searchTerm: string) => {
      setFilters({ search: searchTerm });
      fetchClients(1);
    },
    [setFilters, fetchClients]
  );

  return {
    clients,
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
 * Hook for creating service clients
 */
export function useCreateServiceClient() {
  const {
    isCreating,
    createError,
    lastCreatedToken,
    isCreateDialogOpen,
    isTokenDialogOpen,
    createClient,
    openCreateDialog,
    closeCreateDialog,
    closeTokenDialog,
    clearErrors,
  } = useServiceClientsStore();

  return {
    isCreating,
    error: createError,
    token: lastCreatedToken,
    isDialogOpen: isCreateDialogOpen,
    isTokenDialogOpen,
    createClient,
    openDialog: openCreateDialog,
    closeDialog: closeCreateDialog,
    closeTokenDialog,
    clearErrors,
  };
}

/**
 * Hook for updating service clients
 */
export function useUpdateServiceClient(clientId?: string) {
  const {
    currentClient,
    isLoading,
    isUpdating,
    error,
    updateError,
    fetchClient,
    updateClient,
    clearErrors,
  } = useServiceClientsStore();

  useEffect(() => {
    if (clientId) {
      fetchClient(clientId);
    }
  }, [clientId, fetchClient]);

  const update = useCallback(
    async (data: UpdateServiceClientPayload) => {
      if (!clientId) throw new Error("No client ID provided");
      return updateClient(clientId, data);
    },
    [clientId, updateClient]
  );

  return {
    client: currentClient,
    isLoading,
    isUpdating,
    error: error || updateError,
    update,
    refetch: () => clientId && fetchClient(clientId),
    clearErrors,
  };
}

/**
 * Hook for deleting service clients
 */
export function useDeleteServiceClient() {
  const { isDeleting, deleteError, deleteClient, clearErrors } =
    useServiceClientsStore();

  return {
    isDeleting,
    error: deleteError,
    deleteClient,
    clearErrors,
  };
}

/**
 * Hook for rotating service client tokens
 */
export function useRotateToken() {
  const {
    isRotating,
    rotateError,
    lastRotatedToken,
    isRotateDialogOpen,
    isTokenDialogOpen,
    selectedClientId,
    rotateToken,
    openRotateDialog,
    closeRotateDialog,
    closeTokenDialog,
    clearErrors,
  } = useServiceClientsStore();

  const rotate = useCallback(
    async (id?: string, data?: RotateTokenPayload) => {
      const clientId = id || selectedClientId;
      if (!clientId) throw new Error("No client ID provided");
      return rotateToken(clientId, data);
    },
    [selectedClientId, rotateToken]
  );

  return {
    isRotating,
    error: rotateError,
    token: lastRotatedToken,
    isDialogOpen: isRotateDialogOpen,
    isTokenDialogOpen,
    selectedClientId,
    rotate,
    openDialog: openRotateDialog,
    closeDialog: closeRotateDialog,
    closeTokenDialog,
    clearErrors,
  };
}

/**
 * Hook for toggling service client status
 */
export function useToggleServiceClientStatus() {
  const { isTogglingStatus, error, toggleStatus, clearErrors } =
    useServiceClientsStore();

  return {
    isToggling: isTogglingStatus,
    error,
    toggleStatus,
    clearErrors,
  };
}
