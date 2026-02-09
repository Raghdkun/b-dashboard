/**
 * Role Hierarchy Types
 * Comprehensive TypeScript definitions for enterprise role hierarchy management
 * with recursive tree structures, permissions, and metadata handling.
 */

import type { Role, Permission } from "./role.types";
import type { Store } from "./store.types";

// ============================================================================
// Hierarchy Core Types
// ============================================================================

/**
 * Role hierarchy metadata for tracking creation and context
 */
export interface HierarchyMetadata {
  createdBy: string;
  reason: string;
  [key: string]: unknown;
}

/**
 * Core role hierarchy relationship
 */
export interface RoleHierarchy {
  id: string;
  higherRoleId: string;
  lowerRoleId: string;
  storeId: string;
  metadata: HierarchyMetadata;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  higherRole?: Role;
  lowerRole?: Role;
  parentRole?: Role; // alias for higherRole
  childRole?: Role; // alias for lowerRole
  /** Alias for higherRoleId - for form compatibility */
  parentRoleId?: string;
  /** Alias for lowerRoleId - for form compatibility */
  childRoleId?: string;
  store?: Store;
}

// ============================================================================
// Recursive Tree Types
// ============================================================================

/**
 * Metadata for tree node operations and state management
 */
export interface TreeNodeMetadata {
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  path: string[];
}

/**
 * Tree node representing a role in the hierarchy with its children
 */
export interface RoleTreeNode {
  role: Role;
  children: RoleTreeNode[];
  permissions: Permission[];
  treeMetadata?: TreeNodeMetadata;
}

/**
 * Flattened tree node for list rendering
 */
export interface FlatTreeNode {
  id: string;
  role: Role;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  parentId: string | null;
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Query parameters for fetching hierarchies
 */
export interface GetHierarchiesParams {
  storeId?: string;
  page?: number;
  perPage?: number;
}

/**
 * Payload for creating a new hierarchy
 */
export interface CreateHierarchyPayload {
  higherRoleId?: string;
  lowerRoleId?: string;
  parentRoleId?: string; // alias for higherRoleId
  childRoleId?: string; // alias for lowerRoleId
  storeId: string;
  metadata?: HierarchyMetadata;
  isActive?: boolean;
}

/**
 * Payload for updating a hierarchy
 */
export interface UpdateHierarchyPayload {
  metadata?: HierarchyMetadata;
  isActive?: boolean;
}

/**
 * Payload for validating hierarchy
 */
export interface ValidateHierarchyPayload {
  roleId: string;
  storeId: string;
}

/**
 * Validation result
 */
export interface HierarchyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  circularDependencies?: string[];
}

// ============================================================================
// State Types
// ============================================================================

export interface HierarchyAsyncStates {
  fetchHierarchies: { loading: boolean; error: string | null };
  fetchHierarchy: { loading: boolean; error: string | null };
  fetchTree: { loading: boolean; error: string | null };
  createHierarchy: { loading: boolean; error: string | null };
  updateHierarchy: { loading: boolean; error: string | null };
  deleteHierarchy: { loading: boolean; error: string | null };
  validateHierarchy: { loading: boolean; error: string | null };
}

export interface HierarchyFilters {
  search?: string;
  storeId?: string;
  isActive?: boolean;
  sortField?: "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Tree view state
 */
export interface TreeViewState {
  expandedNodes: Set<string>;
  selectedNode: string | null;
  focusedNode: string | null;
}

/**
 * Delete confirmation state
 */
export interface DeleteConfirmationState {
  isOpen: boolean;
  hierarchyIds: string[];
  affectedRoles: Role[];
}
