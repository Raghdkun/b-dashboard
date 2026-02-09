import { axiosClient } from "../axios-client";
import type { ApiResponse, PaginatedResponse, LaravelPaginatedResponse } from "@/types/api.types";
import type {
  RoleHierarchy,
  RoleTreeNode,
  GetHierarchiesParams,
  CreateHierarchyPayload,
  UpdateHierarchyPayload,
  ValidateHierarchyPayload,
  HierarchyValidationResult,
} from "@/types/hierarchy.types";

// Helper to transform Laravel pagination to our frontend format
function transformPaginatedResponse<T>(response: LaravelPaginatedResponse<T>): PaginatedResponse<T> {
  return {
    data: response.data.data,
    meta: {
      total: response.data.total,
      page: response.data.current_page,
      pageSize: response.data.per_page,
      totalPages: response.data.last_page,
    },
  };
}

export const hierarchyService = {
  /**
   * Get hierarchies for a store
   */
  getHierarchies: async (
    params?: GetHierarchiesParams
  ): Promise<PaginatedResponse<RoleHierarchy>> => {
    const { data } = await axiosClient.get<LaravelPaginatedResponse<RoleHierarchy>>(
      "/role-hierarchy/store",
      {
        params: {
          page: params?.page,
          per_page: params?.perPage,
          store_id: params?.storeId,
        },
      }
    );
    return transformPaginatedResponse(data);
  },

  /**
   * Get a single hierarchy by ID
   */
  getHierarchy: async (id: string): Promise<ApiResponse<RoleHierarchy>> => {
    const { data } = await axiosClient.get<ApiResponse<RoleHierarchy>>(
      `/role-hierarchy/${id}`
    );
    return data;
  },

  /**
   * Get hierarchy tree for a store
   */
  getHierarchyTree: async (
    storeId: string
  ): Promise<ApiResponse<RoleTreeNode[]>> => {
    const { data } = await axiosClient.get<ApiResponse<RoleTreeNode[]>>(
      "/role-hierarchy/tree",
      {
        params: { store_id: storeId },
      }
    );
    return data;
  },

  /**
   * Create a new hierarchy relationship
   */
  createHierarchy: async (
    payload: CreateHierarchyPayload
  ): Promise<ApiResponse<RoleHierarchy>> => {
    // Handle both higherRoleId/lowerRoleId and parentRoleId/childRoleId aliases
    const higherRoleId = payload.higherRoleId || payload.parentRoleId;
    const lowerRoleId = payload.lowerRoleId || payload.childRoleId;
    
    const { data } = await axiosClient.post<ApiResponse<RoleHierarchy>>(
      "/role-hierarchy",
      {
        higher_role_id: higherRoleId,
        lower_role_id: lowerRoleId,
        store_id: payload.storeId,
        metadata: payload.metadata,
        is_active: payload.isActive ?? true,
      }
    );
    return data;
  },

  /**
   * Update an existing hierarchy
   */
  updateHierarchy: async (
    id: string,
    payload: UpdateHierarchyPayload
  ): Promise<ApiResponse<RoleHierarchy>> => {
    const { data } = await axiosClient.put<ApiResponse<RoleHierarchy>>(
      `/hierarchies/${id}`,
      {
        metadata: payload.metadata,
        is_active: payload.isActive,
      }
    );
    return data;
  },

  /**
   * Delete a hierarchy (remove relationship)
   */
  deleteHierarchy: async (payload: { higherRoleId: string; lowerRoleId: string; storeId: string }): Promise<void> => {
    await axiosClient.post("/role-hierarchy/remove", {
      higher_role_id: payload.higherRoleId,
      lower_role_id: payload.lowerRoleId,
      store_id: payload.storeId,
    });
  },

  /**
   * Bulk delete hierarchies
   */
  bulkDeleteHierarchies: async (ids: string[]): Promise<void> => {
    await axiosClient.delete("/role-hierarchy/bulk", {
      data: { ids },
    });
  },

  /**
   * Validate a hierarchy configuration
   */
  validateHierarchy: async (
    payload: ValidateHierarchyPayload
  ): Promise<ApiResponse<HierarchyValidationResult>> => {
    const { data } = await axiosClient.post<
      ApiResponse<HierarchyValidationResult>
    >("/role-hierarchy/validate", {
      role_id: payload.roleId,
      store_id: payload.storeId,
    });
    return data;
  },
};
