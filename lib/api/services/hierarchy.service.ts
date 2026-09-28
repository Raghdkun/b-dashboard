import { axiosClient } from "../axios-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type {
  RoleHierarchy,
  RoleTreeNode,
  GetHierarchiesParams,
  CreateHierarchyPayload,
  UpdateHierarchyPayload,
  ValidateHierarchyPayload,
  HierarchyValidationResult,
} from "@/types/hierarchy.types";
import type { Role, Permission } from "@/types/role.types";

/**
 * Normalize a snake_case role from the API into our camelCase Role type.
 */
function normalizeRole(raw: Record<string, unknown>): Role {
  const permissions = (raw.permissions as Array<Record<string, unknown>>) || [];
  return {
    id: String(raw.id ?? ""),
    name: (raw.name as string) ?? "",
    guardName: (raw.guard_name as string) ?? "",
    createdAt: (raw.created_at as string) ?? "",
    updatedAt: (raw.updated_at as string) ?? "",
    permissions: permissions.map((p) => ({
      id: String(p.id ?? ""),
      name: (p.name as string) ?? "",
      guardName: (p.guard_name as string) ?? "",
      createdAt: (p.created_at as string) ?? "",
      updatedAt: (p.updated_at as string) ?? "",
    })) as Permission[],
  };
}

/**
 * Normalize a snake_case hierarchy record from the API into our camelCase RoleHierarchy type.
 */
function normalizeHierarchy(raw: Record<string, unknown>): RoleHierarchy {
  return {
    id: String(raw.id ?? ""),
    higherRoleId: String(raw.higher_role_id ?? ""),
    lowerRoleId: String(raw.lower_role_id ?? ""),
    storeId: String(raw.store_id ?? ""),
    metadata: (raw.metadata as RoleHierarchy["metadata"]) ?? { createdBy: "", reason: "" },
    isActive: (raw.is_active as boolean) ?? true,
    createdAt: (raw.created_at as string) ?? "",
    updatedAt: (raw.updated_at as string) ?? "",
    higherRole: raw.higher_role ? normalizeRole(raw.higher_role as Record<string, unknown>) : undefined,
    lowerRole: raw.lower_role ? normalizeRole(raw.lower_role as Record<string, unknown>) : undefined,
    store: raw.store ? {
      id: String((raw.store as Record<string, unknown>).id ?? ""),
      storeId: String((raw.store as Record<string, unknown>).store_id ?? ""),
      name: ((raw.store as Record<string, unknown>).name as string) ?? "",
      metadata: ((raw.store as Record<string, unknown>).metadata as Record<string, string | undefined>) ?? {},
      isActive: ((raw.store as Record<string, unknown>).is_active as boolean) ?? true,
      createdAt: ((raw.store as Record<string, unknown>).created_at as string) ?? "",
      updatedAt: ((raw.store as Record<string, unknown>).updated_at as string) ?? "",
    } : undefined,
  };
}

/**
 * Build a tree of RoleTreeNode[] from flat hierarchy records.
 * Each record has higherRole (parent) and lowerRole (child).
 */
function buildTreeFromHierarchies(hierarchies: RoleHierarchy[]): RoleTreeNode[] {
  // Collect all unique roles
  const roleMap = new Map<string, Role>();
  const childToParent = new Map<string, string>(); // lowerRoleId -> higherRoleId

  for (const h of hierarchies) {
    if (h.higherRole) roleMap.set(String(h.higherRole.id), h.higherRole);
    if (h.lowerRole) roleMap.set(String(h.lowerRole.id), h.lowerRole);
    childToParent.set(String(h.lowerRoleId), String(h.higherRoleId));
  }

  // Find root roles (those that appear as higher but never as lower)
  const allLowerIds = new Set(childToParent.keys());
  const rootIds = new Set<string>();
  for (const h of hierarchies) {
    const higherId = String(h.higherRoleId);
    if (!allLowerIds.has(higherId)) {
      rootIds.add(higherId);
    }
  }

  // Build tree nodes recursively
  const buildNode = (roleId: string): RoleTreeNode | null => {
    const role = roleMap.get(roleId);
    if (!role) return null;

    const childIds = hierarchies
      .filter((h) => String(h.higherRoleId) === roleId)
      .map((h) => String(h.lowerRoleId));

    const children: RoleTreeNode[] = [];
    for (const childId of childIds) {
      const childNode = buildNode(childId);
      if (childNode) children.push(childNode);
    }

    return {
      role,
      children,
      permissions: role.permissions || [],
    };
  };

  const tree: RoleTreeNode[] = [];
  for (const rootId of rootIds) {
    const node = buildNode(rootId);
    if (node) tree.push(node);
  }

  // If no roots found (all roles are both parent and child — shouldn't happen),
  // fall back to listing all higher roles as roots
  if (tree.length === 0 && hierarchies.length > 0) {
    for (const h of hierarchies) {
      if (h.higherRole && !tree.some((n) => String(n.role.id) === String(h.higherRole!.id))) {
        const node = buildNode(String(h.higherRole.id));
        if (node) tree.push(node);
      }
    }
  }

  return tree;
}

export const hierarchyService = {
  /**
   * Get hierarchies for a store
   */
  getHierarchies: async (
    params?: GetHierarchiesParams
  ): Promise<PaginatedResponse<RoleHierarchy>> => {
    const { data } = await axiosClient.get<{
      success: boolean;
      data: { hierarchies: Record<string, unknown>[] };
    }>("/role-hierarchy/store", {
      params: {
        store_id: params?.storeId,
      },
    });
    const hierarchies = (data.data.hierarchies || []).map(normalizeHierarchy);
    return {
      data: hierarchies,
      meta: {
        total: hierarchies.length,
        page: 1,
        pageSize: hierarchies.length,
        totalPages: 1,
      },
    };
  },

  /**
   * Get a single hierarchy by ID
   */
  getHierarchy: async (id: string): Promise<ApiResponse<RoleHierarchy>> => {
    const { data } = await axiosClient.get<{
      success: boolean;
      message?: string;
      data: Record<string, unknown>;
    }>(`/role-hierarchy/${id}`);
    // The response may nest under data.hierarchy or just data
    const raw = (data.data as Record<string, unknown>).hierarchy
      ? ((data.data as Record<string, unknown>).hierarchy as Record<string, unknown>)
      : data.data;
    return {
      success: data.success,
      message: data.message,
      data: normalizeHierarchy(raw),
    };
  },

  /**
   * Get hierarchy tree for a store — built from flat hierarchy records
   */
  getHierarchyTree: async (
    storeId: string
  ): Promise<ApiResponse<RoleTreeNode[]>> => {
    const { data } = await axiosClient.get<{
      success: boolean;
      data: { hierarchies: Record<string, unknown>[] };
    }>("/role-hierarchy/store", {
      params: { store_id: storeId },
    });
    const hierarchies = (data.data.hierarchies || []).map(normalizeHierarchy);
    const tree = buildTreeFromHierarchies(hierarchies);
    return {
      success: data.success,
      data: tree,
    };
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
    
    const { data } = await axiosClient.post<{
      success: boolean;
      message?: string;
      data: Record<string, unknown>;
    }>("/role-hierarchy", {
      higher_role_id: higherRoleId,
      lower_role_id: lowerRoleId,
      store_id: payload.storeId,
      metadata: payload.metadata,
      is_active: payload.isActive ?? true,
    });
    const raw = (data.data as Record<string, unknown>).hierarchy
      ? ((data.data as Record<string, unknown>).hierarchy as Record<string, unknown>)
      : data.data;
    return {
      success: data.success,
      message: data.message,
      data: normalizeHierarchy(raw),
    };
  },

  /**
   * Update an existing hierarchy
   */
  updateHierarchy: async (
    id: string,
    payload: UpdateHierarchyPayload
  ): Promise<ApiResponse<RoleHierarchy>> => {
    const { data } = await axiosClient.put<{
      success: boolean;
      message?: string;
      data: Record<string, unknown>;
    }>(`/role-hierarchy/${id}`, {
      metadata: payload.metadata,
      is_active: payload.isActive,
    });
    const raw = (data.data as Record<string, unknown>).hierarchy
      ? ((data.data as Record<string, unknown>).hierarchy as Record<string, unknown>)
      : data.data;
    return {
      success: data.success,
      message: data.message,
      data: normalizeHierarchy(raw),
    };
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
