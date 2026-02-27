import { axiosClient } from "../axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  LoginCredentials,
  AuthUser,
  ApiLoginResponse,
  ApiMeResponse,
  ApiAuthUser,
  ApiAuthRole,
  ApiAuthPermission,
  ApiAuthUserStore,
} from "@/types/auth.types";

/**
 * Transform API permission to frontend format
 */
function transformPermission(apiPerm: ApiAuthPermission) {
  return {
    id: String(apiPerm.id),
    name: apiPerm.name,
    guardName: apiPerm.guard_name,
  };
}

/**
 * Transform API role to frontend format
 */
function transformRole(apiRole: ApiAuthRole) {
  return {
    id: String(apiRole.id),
    name: apiRole.name,
    guardName: apiRole.guard_name,
    permissions: apiRole.permissions?.map(transformPermission),
  };
}

/**
 * Transform API user store to frontend format
 */
function transformUserStore(apiStore: ApiAuthUserStore) {
  return {
    store: {
      id: apiStore.store.store_id,
      name: apiStore.store.name,
      metadata: apiStore.store.metadata,
      isActive: apiStore.store.is_active,
    },
    directRoles: apiStore.direct_roles?.map(transformRole) || [],
    effectiveRoles: apiStore.effective_roles?.map(r => ({
      ...transformRole(r),
      isInherited: r.is_inherited,
    })) || [],
    effectivePermissions: apiStore.effective_permissions?.map(transformPermission) || [],
    hierarchyInfo: apiStore.hierarchy_info?.map(h => ({
      role: { id: String(h.role.id), name: h.role.name },
      managesRoles: h.manages_roles?.map(r => ({ id: String(r.id), name: r.name })) || [],
      managedByRoles: h.managed_by_roles?.map(r => ({ id: String(r.id), name: r.name })) || [],
      canManageUsers: h.can_manage_users,
      hierarchyLevel: h.hierarchy_level,
    })),
    manageableUsers: apiStore.manageable_users,
    assignmentMetadata: apiStore.assignment_metadata?.map(m => ({
      roleId: String(m.role_id),
      roleName: m.role_name,
      metadata: m.metadata,
      assignedAt: m.assigned_at,
      isActive: m.is_active,
    })),
  };
}

/**
 * Transform API user to frontend AuthUser format
 */
function transformUser(apiUser: ApiAuthUser): AuthUser {
  return {
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    emailVerifiedAt: apiUser.email_verified_at,
    createdAt: apiUser.created_at,
    updatedAt: apiUser.updated_at,
    globalRoles: apiUser.global_roles?.map(transformRole) || [],
    globalPermissions: apiUser.global_permissions?.map(transformPermission) || [],
    allPermissions: apiUser.all_permissions?.map(transformPermission) || [],
    stores: apiUser.stores?.map(transformUserStore) || [],
    summary: {
      totalStores: apiUser.summary?.total_stores || 0,
      totalRoles: apiUser.summary?.total_roles || 0,
      totalPermissions: apiUser.summary?.total_permissions || 0,
      manageableUsersCount: apiUser.summary?.manageable_users_count || 0,
    },
  };
}

export const authService = {
  login: async (
    credentials: LoginCredentials
  ): Promise<{ success: boolean; message?: string; data: { user: AuthUser; token: string } }> => {
    const { data } = await axiosClient.post<ApiLoginResponse>(
      "/auth/login",
      credentials
    );
    
    return {
      success: data.success,
      message: data.message,
      data: {
        user: transformUser(data.data.user),
        token: data.data.token,
      },
    };
  },

  logout: async (): Promise<void> => {
    try {
      await axiosClient.post("/auth/logout");
    } catch {
      // Ignore logout errors - we'll clear local state anyway
    }
  },

  me: async (): Promise<ApiResponse<AuthUser>> => {
    const { data } = await axiosClient.get<ApiMeResponse>("/auth/me");
    
    return {
      success: data.success,
      message: data.message,
      data: transformUser(data.data.user),
    };
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const { data } = await axiosClient.post<ApiResponse<{ token: string }>>(
      "/auth/refresh-token"
    );
    return data;
  },
};
