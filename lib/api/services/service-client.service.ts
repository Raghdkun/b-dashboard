/**
 * Service Client API Service
 * Handles all HTTP requests related to service clients management
 */

import { axiosClient } from "../axios-client";
import type {
  ServiceClient,
  ServiceClientWithToken,
  CreateServiceClientPayload,
  UpdateServiceClientPayload,
  RotateTokenPayload,
  GetServiceClientsParams,
} from "@/types/service-client.types";
import type { ApiResponse, PaginatedResponse, LaravelPaginatedResponse } from "@/types/api.types";

/**
 * Transform Laravel paginated response to standard format
 */
function transformPaginatedResponse<T>(response: LaravelPaginatedResponse<T>): Omit<PaginatedResponse<T>, 'data'> {
  const paginationData = response.data;
  return {
    meta: {
      total: paginationData.total,
      page: paginationData.current_page,
      pageSize: paginationData.per_page,
      totalPages: paginationData.last_page,
    },
  };
}

/**
 * Transform API response to camelCase
 */
const transformServiceClient = (data: Record<string, unknown>): ServiceClient => ({
  id: String(data.id),
  name: data.name as string,
  tokenHash: data.token_hash as string,
  isActive: data.is_active as boolean,
  expiresAt: data.expires_at as string | null,
  notes: data.notes as string | null,
  createdAt: data.created_at as string,
  updatedAt: data.updated_at as string,
  lastUsedAt: data.last_used_at as string | null,
  useCount: data.use_count as number,
});

export const serviceClientService = {
  /**
   * Get paginated list of service clients
   */
  getServiceClients: async (
    params?: GetServiceClientsParams
  ): Promise<PaginatedResponse<ServiceClient>> => {
    const { data } = await axiosClient.get<LaravelPaginatedResponse<Record<string, unknown>>>(
      "/service-clients",
      {
        params: {
          page: params?.page,
          per_page: params?.perPage,
          search: params?.search,
        },
      }
    );
    return {
      ...transformPaginatedResponse(data),
      data: data.data.data.map(transformServiceClient),
    };
  },

  /**
   * Get a single service client by ID
   */
  getServiceClient: async (id: string): Promise<ApiResponse<ServiceClient>> => {
    const { data } = await axiosClient.get<ApiResponse<Record<string, unknown>>>(
      `/service-clients/${id}`
    );
    return {
      ...data,
      data: transformServiceClient(data.data),
    };
  },

  /**
   * Create a new service client
   * Returns the client with its initial token (only time token is returned in full)
   */
  createServiceClient: async (
    payload: CreateServiceClientPayload
  ): Promise<ApiResponse<ServiceClientWithToken>> => {
    const { data } = await axiosClient.post<ApiResponse<{ service: Record<string, unknown>; token: string }>>(
      "/service-clients",
      {
        name: payload.name,
        is_active: payload.isActive ?? true,
        expires_at: payload.expiresAt,
        notes: payload.notes,
      }
    );
    return {
      ...data,
      data: {
        service: transformServiceClient(data.data.service),
        token: data.data.token,
      },
    };
  },

  /**
   * Update an existing service client
   */
  updateServiceClient: async (
    id: string,
    payload: UpdateServiceClientPayload
  ): Promise<ApiResponse<ServiceClient>> => {
    const { data } = await axiosClient.put<ApiResponse<Record<string, unknown>>>(
      `/service-clients/${id}`,
      {
        name: payload.name,
        is_active: payload.isActive,
        expires_at: payload.expiresAt,
        notes: payload.notes,
      }
    );
    return {
      ...data,
      data: transformServiceClient(data.data),
    };
  },

  /**
   * Delete a service client
   */
  deleteServiceClient: async (id: string): Promise<void> => {
    await axiosClient.delete(`/service-clients/${id}`);
  },

  /**
   * Rotate service client token
   * Returns new token (only time new token is returned)
   */
  rotateToken: async (
    id: string,
    payload?: RotateTokenPayload
  ): Promise<ApiResponse<ServiceClientWithToken>> => {
    const { data } = await axiosClient.post<ApiResponse<{ service: Record<string, unknown>; token: string }>>(
      `/service-clients/${id}/rotate`,
      {
        expires_at: payload?.expiresAt,
      }
    );
    return {
      ...data,
      data: {
        service: transformServiceClient(data.data.service),
        token: data.data.token,
      },
    };
  },

  /**
   * Toggle service client active status
   */
  toggleStatus: async (id: string): Promise<ApiResponse<ServiceClient>> => {
    const { data } = await axiosClient.post<ApiResponse<{ service: Record<string, unknown> }>>(
      `/service-clients/${id}/toggle`
    );
    return {
      ...data,
      data: transformServiceClient(data.data.service),
    };
  },
};
