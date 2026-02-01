/**
 * Store Management Types
 * Defines all TypeScript interfaces and types for Store entities,
 * API responses, and state management.
 */

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Store metadata containing additional information about the store
 */
export interface StoreMetadata {
  phone?: string;
  address?: string;
  email?: string;
  managerId?: string;
  [key: string]: string | undefined;
}

/**
 * Core Store entity interface
 */
export interface Store {
  id: string;
  name: string;
  metadata: StoreMetadata;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User pivot data when associated with a store
 */
export interface UserStorePivot {
  storeId: string;
  userId: string;
  roleId: string;
  metadata: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Store User entity with pivot relationship data
 */
export interface StoreUser {
  id: string;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  pivot: UserStorePivot;
}

/**
 * Role pivot data when associated with a store
 */
export interface RoleStorePivot {
  storeId: string;
  roleId: string;
  userId: string;
  metadata: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Store Role entity with pivot relationship data
 */
export interface StoreRole {
  id: string;
  name: string;
  guardName: string;
  createdAt: string;
  updatedAt: string;
  pivot: RoleStorePivot;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Query parameters for fetching stores
 */
export interface GetStoresParams {
  perPage?: number;
  page?: number;
  search?: string;
  isActive?: boolean;
}

/**
 * Payload for creating a new store
 */
export interface CreateStorePayload {
  id: string;
  name: string;
  metadata?: StoreMetadata;
  isActive?: boolean;
}

/**
 * Payload for updating an existing store
 */
export interface UpdateStorePayload {
  name?: string;
  metadata?: StoreMetadata;
  isActive?: boolean;
}

// ============================================================================
// Store State Types
// ============================================================================

/**
 * Individual async operation state
 */
export interface AsyncState {
  loading: boolean;
  error: string | null;
}

/**
 * Store-specific async states for different operations
 */
export interface StoreAsyncStates {
  fetchStores: AsyncState;
  fetchStore: AsyncState;
  createStore: AsyncState;
  updateStore: AsyncState;
  deleteStore: AsyncState;
  fetchStoreUsers: AsyncState;
  fetchStoreRoles: AsyncState;
}

/**
 * Filter and sort options for stores
 */
export type StoreSortField = "name" | "createdAt" | "updatedAt" | "isActive";
export type SortDirection = "asc" | "desc";

export interface StoreFilters {
  search?: string;
  sortField?: StoreSortField;
  sortDirection?: SortDirection;
  isActive?: boolean;
}
