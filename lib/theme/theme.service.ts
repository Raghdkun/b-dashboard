import type { Theme, ThemeApiResponse, ThemeApiListResponse, ThemeApiError } from "./types";

// API endpoints (configurable)
const API_BASE = "/api/themes";

/**
 * Theme API Service
 * Provides backend-ready methods for syncing themes
 * Currently returns mock responses, ready for backend integration
 */
export const themeService = {
  /**
   * Fetch all themes from the server
   */
  async listThemes(): Promise<ThemeApiListResponse> {
    try {
      const response = await fetch(API_BASE, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error: ThemeApiError = await response.json();
        return { success: false, error: error.error };
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  /**
   * Fetch a single theme by ID
   */
  async getTheme(id: string): Promise<ThemeApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error: ThemeApiError = await response.json();
        return { success: false, error: error.error };
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  /**
   * Create a new theme on the server
   */
  async createTheme(theme: Omit<Theme, "id">): Promise<ThemeApiResponse> {
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(theme),
      });

      if (!response.ok) {
        const error: ThemeApiError = await response.json();
        return { success: false, error: error.error };
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  /**
   * Update an existing theme on the server
   */
  async updateTheme(id: string, updates: Partial<Theme>): Promise<ThemeApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error: ThemeApiError = await response.json();
        return { success: false, error: error.error };
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  /**
   * Delete a theme from the server
   */
  async deleteTheme(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error: ThemeApiError = await response.json();
        return { success: false, error: error.error };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  /**
   * Sync local themes with the server
   * Uploads local themes that don't exist on server
   * Downloads server themes that don't exist locally
   */
  async syncThemes(localThemes: Theme[]): Promise<{
    success: boolean;
    uploaded: number;
    downloaded: number;
    themes?: Theme[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ themes: localThemes }),
      });

      if (!response.ok) {
        const error: ThemeApiError = await response.json();
        return { success: false, uploaded: 0, downloaded: 0, error: error.error };
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  /**
   * Get user's active theme preference from server
   */
  async getActiveThemeId(): Promise<{ success: boolean; themeId?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/active`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error: ThemeApiError = await response.json();
        return { success: false, error: error.error };
      }

      const data = await response.json();
      return { success: true, themeId: data.themeId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  /**
   * Set user's active theme preference on server
   */
  async setActiveThemeId(themeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/active`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ themeId }),
      });

      if (!response.ok) {
        const error: ThemeApiError = await response.json();
        return { success: false, error: error.error };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },
};

export type ThemeService = typeof themeService;
