import { axiosClient } from "../axios-client";
import type { ApiResponse, PaginatedResponse, LaravelPaginatedResponse } from "@/types/api.types";
import type {
  AuthRule,
  GetAuthRulesParams,
  CreateAuthRulePayload,
  UpdateAuthRulePayload,
  TestAuthRulePayload,
  TestAuthRuleResult,
} from "@/types/auth-rule.types";

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

export const authRuleService = {
  /**
   * Get paginated list of auth rules
   */
  getAuthRules: async (
    params?: GetAuthRulesParams
  ): Promise<PaginatedResponse<AuthRule>> => {
    const { data } = await axiosClient.get<LaravelPaginatedResponse<AuthRule>>(
      "/auth-rules",
      {
        params: {
          page: params?.page,
          per_page: params?.perPage,
          search: params?.search,
          service: params?.service,
        },
      }
    );
    return transformPaginatedResponse(data);
  },

  /**
   * Get a single auth rule by ID
   */
  getAuthRule: async (id: string): Promise<ApiResponse<AuthRule>> => {
    const { data } = await axiosClient.get<ApiResponse<AuthRule>>(
      `/auth-rules/${id}`
    );
    return data;
  },

  /**
   * Create a new auth rule
   */
  createAuthRule: async (
    payload: CreateAuthRulePayload
  ): Promise<ApiResponse<AuthRule>> => {
    const requestBody: Record<string, unknown> = {
      service: payload.service,
      method: payload.method,
      priority: payload.priority,
      is_active: payload.isActive,
      roles_any: payload.rolesAny,
      permissions_any: payload.permissionsAny,
      permissions_all: payload.permissionsAll,
    };

    // Add path configuration based on type
    if ("pathDsl" in payload && payload.pathDsl) {
      requestBody.path_dsl = payload.pathDsl;
    }
    if ("routeName" in payload && payload.routeName) {
      requestBody.route_name = payload.routeName;
    }

    const { data } = await axiosClient.post<ApiResponse<AuthRule>>(
      "/auth-rules",
      requestBody
    );
    return data;
  },

  /**
   * Update an existing auth rule
   */
  updateAuthRule: async (
    id: string,
    payload: UpdateAuthRulePayload
  ): Promise<ApiResponse<AuthRule>> => {
    const { data } = await axiosClient.put<ApiResponse<AuthRule>>(
      `/auth-rules/${id}`,
      {
        service: payload.service,
        method: payload.method,
        path_dsl: payload.pathDsl,
        route_name: payload.routeName,
        priority: payload.priority,
        is_active: payload.isActive,
        roles_any: payload.rolesAny,
        permissions_any: payload.permissionsAny,
        permissions_all: payload.permissionsAll,
      }
    );
    return data;
  },

  /**
   * Delete an auth rule
   */
  deleteAuthRule: async (id: string): Promise<void> => {
    await axiosClient.delete(`/auth-rules/${id}`);
  },

  /**
   * Test an auth rule path matching
   */
  testAuthRule: async (
    payload: TestAuthRulePayload
  ): Promise<ApiResponse<TestAuthRuleResult>> => {
    const { data } = await axiosClient.post<ApiResponse<TestAuthRuleResult>>(
      "/auth-rules/test",
      {
        path_dsl: payload.pathDsl,
        test_path: payload.testPath,
      }
    );
    return data;
  },

  /**
   * Get available services for auth rules
   */
  getServices: async (): Promise<ApiResponse<string[]>> => {
    const { data } = await axiosClient.get<ApiResponse<string[]>>(
      "/auth-rules/services"
    );
    return data;
  },
};
