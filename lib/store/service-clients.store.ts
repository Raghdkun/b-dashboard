/**
 * Service Clients Zustand Store
 * State management for service clients feature
 */

import { create } from "zustand";
import { serviceClientService } from "@/lib/api/services/service-client.service";
import type {
  ServiceClient,
  CreateServiceClientPayload,
  UpdateServiceClientPayload,
  RotateTokenPayload,
  ServiceClientFilters,
} from "@/types/service-client.types";
import type { PaginatedResponse } from "@/types/api.types";

interface ServiceClientsState {
  // Data
  clients: ServiceClient[];
  currentClient: ServiceClient | null;
  pagination: PaginatedResponse<ServiceClient>["meta"] | null;
  lastCreatedToken: string | null;
  lastRotatedToken: string | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isRotating: boolean;
  isTogglingStatus: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  rotateError: string | null;

  // UI state
  filters: ServiceClientFilters;
  selectedClientId: string | null;
  isTokenDialogOpen: boolean;
  isCreateDialogOpen: boolean;
  isRotateDialogOpen: boolean;

  // Actions
  fetchClients: (page?: number) => Promise<void>;
  fetchClient: (id: string) => Promise<ServiceClient | null>;
  createClient: (data: CreateServiceClientPayload) => Promise<ServiceClient>;
  updateClient: (id: string, data: UpdateServiceClientPayload) => Promise<ServiceClient>;
  deleteClient: (id: string) => Promise<void>;
  rotateToken: (id: string, data?: RotateTokenPayload) => Promise<string>;
  toggleStatus: (id: string) => Promise<ServiceClient>;

  // UI actions
  setFilters: (filters: Partial<ServiceClientFilters>) => void;
  setSelectedClientId: (id: string | null) => void;
  openTokenDialog: (token: string) => void;
  closeTokenDialog: () => void;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  openRotateDialog: (clientId: string) => void;
  closeRotateDialog: () => void;
  clearErrors: () => void;
  reset: () => void;
}

const initialFilters: ServiceClientFilters = {
  search: "",
  isActive: undefined,
};

const initialState = {
  clients: [],
  currentClient: null,
  pagination: null,
  lastCreatedToken: null,
  lastRotatedToken: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isRotating: false,
  isTogglingStatus: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  rotateError: null,
  filters: initialFilters,
  selectedClientId: null,
  isTokenDialogOpen: false,
  isCreateDialogOpen: false,
  isRotateDialogOpen: false,
};

export const useServiceClientsStore = create<ServiceClientsState>((set, get) => ({
  ...initialState,

  fetchClients: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const response = await serviceClientService.getServiceClients({
        page,
        perPage: 10,
        search: filters.search || undefined,
      });
      set({
        clients: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch service clients";
      set({ error: message, isLoading: false });
    }
  },

  fetchClient: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await serviceClientService.getServiceClient(id);
      if (response.success) {
        set({ currentClient: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch service client");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch service client";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  createClient: async (data: CreateServiceClientPayload) => {
    set({ isCreating: true, createError: null });
    try {
      const response = await serviceClientService.createServiceClient(data);
      if (response.success) {
        set((state) => ({
          clients: [response.data.service, ...state.clients],
          lastCreatedToken: response.data.token,
          isCreating: false,
          isCreateDialogOpen: false,
          isTokenDialogOpen: true,
        }));
        return response.data.service;
      }
      throw new Error(response.message || "Failed to create service client");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create service client";
      set({ createError: message, isCreating: false });
      throw error;
    }
  },

  updateClient: async (id: string, data: UpdateServiceClientPayload) => {
    set({ isUpdating: true, updateError: null });
    try {
      const response = await serviceClientService.updateServiceClient(id, data);
      if (response.success) {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? response.data : c)),
          currentClient: state.currentClient?.id === id ? response.data : state.currentClient,
          isUpdating: false,
        }));
        return response.data;
      }
      throw new Error(response.message || "Failed to update service client");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update service client";
      set({ updateError: message, isUpdating: false });
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    set({ isDeleting: true, deleteError: null });
    try {
      await serviceClientService.deleteServiceClient(id);
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        currentClient: state.currentClient?.id === id ? null : state.currentClient,
        isDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete service client";
      set({ deleteError: message, isDeleting: false });
      throw error;
    }
  },

  rotateToken: async (id: string, data?: RotateTokenPayload) => {
    set({ isRotating: true, rotateError: null });
    try {
      const response = await serviceClientService.rotateToken(id, data);
      if (response.success) {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? response.data.service : c)),
          currentClient: state.currentClient?.id === id ? response.data.service : state.currentClient,
          lastRotatedToken: response.data.token,
          isRotating: false,
          isRotateDialogOpen: false,
          isTokenDialogOpen: true,
        }));
        return response.data.token;
      }
      throw new Error(response.message || "Failed to rotate token");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to rotate token";
      set({ rotateError: message, isRotating: false });
      throw error;
    }
  },

  toggleStatus: async (id: string) => {
    set({ isTogglingStatus: true, error: null });
    try {
      const response = await serviceClientService.toggleStatus(id);
      if (response.success) {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? response.data : c)),
          currentClient: state.currentClient?.id === id ? response.data : state.currentClient,
          isTogglingStatus: false,
        }));
        return response.data;
      }
      throw new Error(response.message || "Failed to toggle status");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to toggle status";
      set({ error: message, isTogglingStatus: false });
      throw error;
    }
  },

  // UI actions
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSelectedClientId: (id) => set({ selectedClientId: id }),

  openTokenDialog: (token) =>
    set({ isTokenDialogOpen: true, lastCreatedToken: token }),

  closeTokenDialog: () =>
    set({ isTokenDialogOpen: false, lastCreatedToken: null, lastRotatedToken: null }),

  openCreateDialog: () => set({ isCreateDialogOpen: true }),

  closeCreateDialog: () => set({ isCreateDialogOpen: false, createError: null }),

  openRotateDialog: (clientId) =>
    set({ isRotateDialogOpen: true, selectedClientId: clientId }),

  closeRotateDialog: () =>
    set({ isRotateDialogOpen: false, selectedClientId: null, rotateError: null }),

  clearErrors: () =>
    set({
      error: null,
      createError: null,
      updateError: null,
      deleteError: null,
      rotateError: null,
    }),

  reset: () => set(initialState),
}));
