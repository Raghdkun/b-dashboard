import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AxiosError } from "axios";
import { authService } from "@/lib/api/services/auth.service";
import type { AuthUser, LoginCredentials, AuthUserStore } from "@/types/auth.types";

interface AuthState {
  // User data
  user: AuthUser | null;
  token: string | null;
  
  // Derived permission/role arrays for quick lookup
  permissions: string[];
  roles: string[];
  
  // Auth status
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setToken: (token: string) => void;
  checkAuth: () => Promise<void>;
  initialize: () => void;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  isSuperAdmin: () => boolean;
  canAccess: (requiredPermissions?: string[], requiredRoles?: string[]) => boolean;
  
  // Store helpers
  getUserStores: () => AuthUserStore[];
  hasStoreAccess: (storeId: string) => boolean;
  getStorePermissions: (storeId: string) => string[];
  getStoreRoles: (storeId: string) => string[];
}

/**
 * Extract all permission names from AuthUser
 */
function extractPermissions(user: AuthUser | null): string[] {
  if (!user) return [];
  return user.allPermissions?.map(p => p.name) || [];
}

/**
 * Extract all role names from AuthUser (global + store roles)
 */
function extractRoles(user: AuthUser | null): string[] {
  if (!user) return [];
  
  const roleNames = new Set<string>();
  
  // Add global roles
  user.globalRoles?.forEach(r => roleNames.add(r.name));
  
  // Add store-specific roles
  user.stores?.forEach(store => {
    store.effectiveRoles?.forEach(r => roleNames.add(r.name));
  });
  
  return Array.from(roleNames);
}

function getLoginErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const responseMessage = axiosError?.response?.data?.message;
  const responseError = axiosError?.response?.data?.error;

  if (responseMessage) return responseMessage;
  if (responseError) return responseError;
  if (axiosError?.code === "ECONNABORTED") {
    return "Login request timed out. Please try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Login failed. Please check your credentials and try again.";
}

function persistUserData(user: AuthUser | null) {
  if (typeof window === "undefined") return;

  if (!user) {
    localStorage.removeItem("auth-user");
    return;
  }

  localStorage.setItem("auth-user", JSON.stringify(user));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],
      roles: [],
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials);
          if (response.success) {
            const user = response.data.user;
            set({
              user,
              token: response.data.token,
              permissions: extractPermissions(user),
              roles: extractRoles(user),
              isAuthenticated: true,
              isLoading: false,
            });
            persistUserData(user);
          } else {
            set({ isLoading: false });
            throw new Error(response.message || "Login failed");
          }
        } catch (error) {
          set({ isLoading: false });
          throw new Error(getLoginErrorMessage(error));
        }
      },

      logout: () => {
        authService.logout().catch(() => {});
        set({
          user: null,
          token: null,
          permissions: [],
          roles: [],
          isAuthenticated: false,
        });
        persistUserData(null);
      },

      setUser: (user: AuthUser) => {
        set({
          user,
          permissions: extractPermissions(user),
          roles: extractRoles(user),
        });
        persistUserData(user);
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, user: null, permissions: [], roles: [] });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authService.me();
          if (response.success) {
            const user = response.data;
            set({
              user,
              permissions: extractPermissions(user),
              roles: extractRoles(user),
              isAuthenticated: true,
              isLoading: false,
            });
            persistUserData(user);
          } else {
            set({
              user: null,
              token: null,
              permissions: [],
              roles: [],
              isAuthenticated: false,
              isLoading: false,
            });
            persistUserData(null);
          }
        } catch {
          set({
            user: null,
            token: null,
            permissions: [],
            roles: [],
            isAuthenticated: false,
            isLoading: false,
          });
          persistUserData(null);
        }
      },

      initialize: () => {
        set({ isInitialized: true });
      },

      // Permission checking methods
      hasPermission: (permission: string) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },

      hasAnyPermission: (permissionList: string[]) => {
        if (!permissionList.length) return false;
        const { permissions } = get();
        return permissionList.some(p => permissions.includes(p));
      },

      hasAllPermissions: (permissionList: string[]) => {
        if (!permissionList.length) return false;
        const { permissions } = get();
        return permissionList.every(p => permissions.includes(p));
      },

      hasRole: (role: string) => {
        const { roles } = get();
        return roles.includes(role);
      },

      hasAnyRole: (roleList: string[]) => {
        if (!roleList.length) return false;
        const { roles } = get();
        return roleList.some(r => roles.includes(r));
      },

      hasAllRoles: (roleList: string[]) => {
        if (!roleList.length) return false;
        const { roles } = get();
        return roleList.every(r => roles.includes(r));
      },

      isSuperAdmin: () => {
        return get().hasRole("super-admin");
      },

      canAccess: (requiredPermissions?: string[], requiredRoles?: string[]) => {
        const state = get();
        
        // Super admin can access everything
        if (state.isSuperAdmin()) return true;
        
        let hasRequiredPermissions = true;
        let hasRequiredRoles = true;

        if (requiredPermissions && requiredPermissions.length > 0) {
          hasRequiredPermissions = state.hasAnyPermission(requiredPermissions);
        }

        if (requiredRoles && requiredRoles.length > 0) {
          hasRequiredRoles = state.hasAnyRole(requiredRoles);
        }

        return hasRequiredPermissions && hasRequiredRoles;
      },

      // Store access helpers
      getUserStores: () => {
        const { user } = get();
        return user?.stores || [];
      },

      hasStoreAccess: (storeId: string) => {
        const { user } = get();
        if (!user?.stores) return false;
        return user.stores.some(s => s.store.id === storeId);
      },

      getStorePermissions: (storeId: string) => {
        const { user } = get();
        const store = user?.stores?.find(s => s.store.id === storeId);
        return store?.effectivePermissions?.map(p => p.name) || [];
      },

      getStoreRoles: (storeId: string) => {
        const { user } = get();
        const store = user?.stores?.find(s => s.store.id === storeId);
        return store?.effectiveRoles?.map(r => r.name) || [];
      },
    }),
    {
      name: "auth-token",
      partialize: (state) => ({
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
        if (state) {
          state.initialize();
          state.checkAuth();
        }
      },
    }
  )
);
