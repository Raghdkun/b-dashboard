import type { Role, Permission } from "./role.types";
import type { Store } from "./store.types";

/**
 * User role nested within user responses
 */
export interface UserRole {
  id: string;
  name: string;
  permissions?: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * User permission nested within user responses
 */
export interface UserPermission {
  id: string;
  name: string;
}

/**
 * Store data nested within user responses
 */
export interface UserStore {
  store: {
    id: string;
    name: string;
    storeId?: string;
  };
  roles: Array<{
    id: string;
    name: string;
    permissions: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

/**
 * User summary statistics
 */
export interface UserSummary {
  totalStores: number;
  totalRoles: number;
  totalPermissions: number;
  manageableUsersCount: number;
}

/**
 * Extended User entity with roles, permissions, and stores
 */
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  avatar?: string | null;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt: string;
  // Extended fields for authorization
  roles?: UserRole[];
  permissions?: UserPermission[];
  stores?: UserStore[];
  globalRoles?: Role[];
  globalPermissions?: Permission[];
  allPermissions?: Permission[];
  summary?: UserSummary;
}

/**
 * Simplified role type for backward compatibility
 */
export type UserRoleType = "admin" | "user" | "editor" | "manager";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  roles?: string[];
  permissions?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  status?: User["status"];
  avatar?: string | null;
  roles?: string[];
  permissions?: string[];
}

export interface AssignRolesPayload {
  roles: string[];
}

export interface AssignPermissionsPayload {
  permissions: string[];
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface GetUsersParams {
  page?: number;
  perPage?: number;
  search?: string;
  role?: string;
  status?: string;
}

// ============================================================================
// State Types
// ============================================================================

export interface UserAsyncStates {
  fetchUsers: { loading: boolean; error: string | null };
  fetchUser: { loading: boolean; error: string | null };
  createUser: { loading: boolean; error: string | null };
  updateUser: { loading: boolean; error: string | null };
  deleteUser: { loading: boolean; error: string | null };
  assignRoles: { loading: boolean; error: string | null };
  assignPermissions: { loading: boolean; error: string | null };
}

export interface UserFilters {
  search?: string;
  sortField?: "name" | "email" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
  hasRoles?: boolean;
  hasPermissions?: boolean;
  roleNames?: string[];
  permissionNames?: string[];
  emailVerified?: boolean;
  storeIds?: string[];
  status?: User["status"];
}

// ============================================================================
// Form Types
// ============================================================================

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  passwordConfirmation?: string;
  roles: string[];
  permissions: string[];
  status: User["status"];
}
