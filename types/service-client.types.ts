/**
 * Service Client Types
 * Types for managing API service clients/tokens
 */

/**
 * Core Service Client entity
 */
export interface ServiceClient {
  id: string;
  name: string;
  tokenHash: string;
  isActive: boolean;
  expiresAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  useCount: number;
}

/**
 * Service client with token (returned on create/rotate)
 */
export interface ServiceClientWithToken {
  service: ServiceClient;
  token: string;
}

/**
 * Request payload for creating a new service client
 */
export interface CreateServiceClientPayload {
  name: string;
  isActive?: boolean;
  expiresAt?: string | null;
  notes?: string | null;
}

/**
 * Request payload for updating a service client
 */
export interface UpdateServiceClientPayload {
  name?: string;
  isActive?: boolean;
  expiresAt?: string | null;
  notes?: string | null;
}

/**
 * Request payload for rotating service token
 */
export interface RotateTokenPayload {
  expiresAt?: string | null;
}

/**
 * Query parameters for fetching service clients
 */
export interface GetServiceClientsParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/**
 * Filters for service clients list
 */
export interface ServiceClientFilters {
  search: string;
  isActive?: boolean;
}
