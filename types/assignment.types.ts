/**
 * User Roles Store Assignment Types
 * Type definitions for user role store assignment management.
 */

import type { Role, Permission } from "./role.types";
import type { Store } from "./store.types";

// ============================================================================
// Base Entity Types
// ============================================================================

/**
 * Simplified user entity for assignments
 */
export interface AssignmentUser {
  id: string;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Flexible metadata structure for assignments
 */
export interface AssignmentMetadata {
  startDate?: string;
  endDate?: string;
  notes?: string;
  department?: string;
  [key: string]: unknown;
}

/**
 * Core assignment entity with related entities
 */
export interface Assignment {
  id: string;
  userId: string;
  roleId: string;
  storeId: string;
  metadata: AssignmentMetadata;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Alias for createdAt - for backward compatibility */
  assignedAt?: string;
  user?: AssignmentUser;
  role?: Role;
  store?: Store;
  // Snake_case aliases for API compatibility
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Request payload for assigning a user role to a store
 */
export interface CreateAssignmentPayload {
  userId: string;
  roleId: string;
  storeId: string;
  metadata?: AssignmentMetadata;
  isActive?: boolean;
}

/**
 * Request payload for updating an assignment
 */
export interface UpdateAssignmentPayload {
  metadata?: AssignmentMetadata;
  isActive?: boolean;
}

/**
 * Request payload for removing user role from store or toggling status
 */
export interface RemoveAssignmentPayload {
  userId: string;
  roleId: string;
  storeId: string;
}

/**
 * Single assignment item for bulk operations
 */
export interface BulkAssignmentItem {
  roleId: string;
  storeId: string;
  metadata?: AssignmentMetadata;
}

/**
 * Request payload for bulk assigning user roles
 */
export interface BulkAssignPayload {
  userId: string;
  assignments: BulkAssignmentItem[];
}

/**
 * Query parameters for fetching store assignments
 */
export interface GetStoreAssignmentsParams {
  storeId: string;
  page?: number;
  perPage?: number;
}

/**
 * Query parameters for fetching user assignments
 */
export interface GetUserAssignmentsParams {
  userId: string;
  page?: number;
  perPage?: number;
}

// ============================================================================
// Bulk Operation Types
// ============================================================================

/**
 * Result of a single bulk assignment operation
 */
export interface BulkAssignmentResult {
  success: boolean;
  assignment?: Assignment;
  error?: string;
  roleId: string;
  storeId: string;
}

/**
 * Response for bulk assignment operations
 */
export interface BulkAssignmentResponse {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: BulkAssignmentResult[];
}

// ============================================================================
// State Types
// ============================================================================

export interface AssignmentAsyncStates {
  fetchAssignments: { loading: boolean; error: string | null };
  createAssignment: { loading: boolean; error: string | null };
  updateAssignment: { loading: boolean; error: string | null };
  deleteAssignment: { loading: boolean; error: string | null };
  bulkAssign: { loading: boolean; error: string | null };
}

export interface AssignmentFilters {
  search?: string;
  storeId?: string;
  userId?: string;
  roleId?: string;
  isActive?: boolean;
  sortField?: "createdAt" | "updatedAt" | "userName" | "roleName" | "storeName";
  sortDirection?: "asc" | "desc";
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Selection state for bulk operations
 */
export interface BulkSelectionState {
  selectedUsers: string[];
  selectedRoles: string[];
  selectedStores: string[];
}

/**
 * Progress state for bulk operations
 */
export interface BulkProgressState {
  isProcessing: boolean;
  total: number;
  completed: number;
  failed: number;
  currentItem?: string;
}
