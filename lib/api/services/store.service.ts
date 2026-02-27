import { axiosClient } from "../axios-client";
import type { ApiResponse, PaginatedResponse, LaravelPaginatedResponse } from "@/types/api.types";
import type {
  Store,
  StoreUser,
  StoreRole,
  GetStoresParams,
  CreateStorePayload,
  UpdateStorePayload,
} from "@/types/store.types";

// API returns snake_case, frontend uses camelCase
interface ApiStore {
  id: string;
  /** User-facing store identifier set during creation */
  store_id?: string;
  name: string;
  metadata: Record<string, string | undefined>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Transform API store to frontend Store type
function transformStore(apiStore: ApiStore): Store {
  return {
    id: apiStore.id,
    storeId: apiStore.store_id || apiStore.id,
    name: apiStore.name,
    metadata: apiStore.metadata || {},
    isActive: apiStore.is_active,
    createdAt: apiStore.created_at || new Date().toISOString(),
    updatedAt: apiStore.updated_at || new Date().toISOString(),
  };
}

/**
 * Transform Laravel pagination response to simplified format
 */
function transformPaginatedResponse(
  response: LaravelPaginatedResponse<ApiStore>
): PaginatedResponse<Store> {
  return {
    data: response.data.data.map(transformStore),
    meta: {
      total: response.data.total,
      page: response.data.current_page,
      pageSize: response.data.per_page,
      totalPages: response.data.last_page,
    },
  };
}

export const storeService = {
  /**
   * Get paginated list of stores
   */
  getStores: async (
    params?: GetStoresParams
  ): Promise<PaginatedResponse<Store>> => {
    const { data } = await axiosClient.get<LaravelPaginatedResponse<ApiStore>>(
      "/stores",
      {
        params: {
          page: params?.page,
          per_page: params?.perPage,
          search: params?.search,
          is_active: params?.isActive,
        },
      }
    );
    return transformPaginatedResponse(data);
  },

  /**
   * Get a single store by ID
   */
  getStore: async (id: string): Promise<ApiResponse<Store>> => {
    const { data } = await axiosClient.get<ApiResponse<{ store: ApiStore }>>(
      `/stores/${id}`
    );
    return {
      ...data,
      data: transformStore(data.data.store),
    };
  },

  /**
   * Create a new store
   */
  createStore: async (
    payload: CreateStorePayload
  ): Promise<ApiResponse<Store>> => {
    const { data } = await axiosClient.post<ApiResponse<Store>>("/stores", {
      store_id: payload.id,
      name: payload.name,
      metadata: payload.metadata || {},
      is_active: payload.isActive ?? true,
    });
    return data;
  },

  /**
   * Update an existing store
   */
  updateStore: async (
    id: string,
    payload: UpdateStorePayload
  ): Promise<ApiResponse<Store>> => {
    const { data } = await axiosClient.put<ApiResponse<Store>>(
      `/stores/${id}`,
      {
        name: payload.name,
        metadata: payload.metadata,
        is_active: payload.isActive,
      }
    );
    return data;
  },

  /**
   * Delete a store
   */
  deleteStore: async (id: string): Promise<void> => {
    await axiosClient.delete(`/stores/${id}`);
  },

  /**
   * Get users assigned to a store
   */
  getStoreUsers: async (storeId: string): Promise<ApiResponse<StoreUser[]>> => {
    const { data } = await axiosClient.get<ApiResponse<StoreUser[]>>(
      `/stores/${storeId}/users`
    );
    return data;
  },

  /**
   * Get roles assigned to a store
   */
  getStoreRoles: async (storeId: string): Promise<ApiResponse<StoreRole[]>> => {
    const { data } = await axiosClient.get<ApiResponse<StoreRole[]>>(
      `/stores/${storeId}/roles`
    );
    return data;
  },
};
