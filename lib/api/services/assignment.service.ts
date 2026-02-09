import { axiosClient } from "../axios-client";
import type { ApiResponse, PaginatedResponse, LaravelPaginatedResponse } from "@/types/api.types";
import type {
  Assignment,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  BulkAssignPayload,
  BulkAssignmentResponse,
  GetStoreAssignmentsParams,
  GetUserAssignmentsParams,
} from "@/types/assignment.types";

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

export const assignmentService = {
  /**
   * Get all assignments for a store
   */
  getStoreAssignments: async (
    params: GetStoreAssignmentsParams
  ): Promise<PaginatedResponse<Assignment>> => {
    const { data } = await axiosClient.get<ApiResponse<{ assignments: Assignment[] }>>(
      "/user-role-store/store-assignments",
      {
        params: {
          store_id: params.storeId,
          page: params.page,
          per_page: params.perPage,
        },
      }
    );
    const assignments = data.data?.assignments || [];
    return {
      data: assignments,
      meta: {
        total: assignments.length,
        page: params.page || 1,
        pageSize: params.perPage || 10,
        totalPages: 1,
      },
    };
  },

  /**
   * Get all assignments for a user
   */
  getUserAssignments: async (
    params: GetUserAssignmentsParams
  ): Promise<PaginatedResponse<Assignment>> => {
    const { data } = await axiosClient.get<LaravelPaginatedResponse<Assignment>>(
      `/users/${params.userId}/assignments`,
      {
        params: {
          page: params.page,
          per_page: params.perPage,
        },
      }
    );
    return transformPaginatedResponse(data);
  },

  /**
   * Get a single assignment by ID
   */
  getAssignment: async (id: string): Promise<ApiResponse<Assignment>> => {
    const { data } = await axiosClient.get<ApiResponse<Assignment>>(
      `/assignments/${id}`
    );
    return data;
  },

  /**
   * Create a new assignment
   */
  createAssignment: async (
    payload: CreateAssignmentPayload
  ): Promise<ApiResponse<Assignment>> => {
    const { data } = await axiosClient.post<ApiResponse<Assignment>>(
      "/user-role-store/assign",
      {
        user_id: payload.userId,
        role_id: payload.roleId,
        store_id: payload.storeId,
        metadata: payload.metadata,
        is_active: payload.isActive ?? true,
      }
    );
    return data;
  },

  /**
   * Update an existing assignment
   */
  updateAssignment: async (
    id: string,
    payload: UpdateAssignmentPayload
  ): Promise<ApiResponse<Assignment>> => {
    const { data } = await axiosClient.put<ApiResponse<Assignment>>(
      `/assignments/${id}`,
      {
        metadata: payload.metadata,
        is_active: payload.isActive,
      }
    );
    return data;
  },

  /**
   * Delete an assignment (remove user from role at store)
   */
  deleteAssignment: async (userId: string, roleId: string, storeId: string): Promise<void> => {
    await axiosClient.post("/user-role-store/remove", {
      user_id: userId,
      role_id: roleId,
      store_id: storeId,
    });
  },

  /**
   * Toggle assignment active status
   */
  toggleAssignment: async (userId: string, roleId: string, storeId: string): Promise<ApiResponse<Assignment>> => {
    const { data } = await axiosClient.post<ApiResponse<Assignment>>(
      "/user-role-store/toggle",
      {
        user_id: userId,
        role_id: roleId,
        store_id: storeId,
      }
    );
    return data;
  },

  /**
   * Bulk assign roles to stores for users
   */
  bulkAssign: async (
    payload: BulkAssignPayload
  ): Promise<ApiResponse<BulkAssignmentResponse>> => {
    const { data } = await axiosClient.post<
      ApiResponse<BulkAssignmentResponse>
    >("/user-role-store/bulk-assign", {
      assignments: payload.assignments.map((a) => ({
        user_id: payload.userId,
        role_id: a.roleId,
        store_id: a.storeId,
        metadata: a.metadata,
      })),
    });
    return data;
  },

  /**
   * Get store assignments
   */
  getStoreAssignmentsByStore: async (storeId: string): Promise<ApiResponse<Assignment[]>> => {
    const { data } = await axiosClient.get<ApiResponse<Assignment[]>>(
      "/user-role-store/store-assignments",
      {
        params: { store_id: storeId },
      }
    );
    return data;
  },

  /**
   * Get user assignments
   */
  getUserAssignmentsByUser: async (userId: string): Promise<ApiResponse<Assignment[]>> => {
    const { data } = await axiosClient.get<ApiResponse<Assignment[]>>(
      "/user-role-store/user-assignments",
      {
        params: { user_id: userId },
      }
    );
    return data;
  },
};
