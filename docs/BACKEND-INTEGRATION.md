# Backend Integration Guide

This document provides comprehensive guidance for integrating the B-Dashboard frontend with backend services. It covers authentication, theme persistence, dashboard layout synchronization, user preferences, and widget data APIs.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Authentication Integration](#authentication-integration)
- [Theme System Integration](#theme-system-integration)
- [Dashboard Personalization Sync](#dashboard-personalization-sync)
- [User Preferences API](#user-preferences-api)
- [Widget Data APIs](#widget-data-apis)
- [API Response Formats](#api-response-formats)
- [Error Handling](#error-handling)
- [WebSocket Events (Real-time)](#websocket-events-real-time)

---

## Overview

The B-Dashboard frontend is designed to be **backend-agnostic**. All backend interactions are abstracted through service layers in `lib/api/services/` and stores in `lib/`. This allows you to:

1. Use mock data during development
2. Swap backends without changing UI code
3. Implement progressive enhancement (offline-first, then sync)

### Current Integration Points

| Feature | Frontend Location | API Endpoint (Suggested) |
|---------|-------------------|--------------------------|
| Authentication | `lib/auth/auth.store.ts` | `/api/auth/*` |
| Themes | `lib/theme/theme.service.ts` | `/api/themes/*` |
| Dashboard Layouts | `lib/dashboard/store/dashboard.store.ts` | `/api/dashboard/*` |
| User Preferences | `lib/i18n/`, `lib/theme/` | `/api/user/preferences` |
| Widget Data | `components/widgets/**` | `/api/widgets/*` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Components/Pages → Zustand Stores → API Services           │
│                            ↓                                 │
│               lib/api/client.ts (Axios)                      │
│                            ↓                                 │
│          Interceptors (Auth headers, Error handling)         │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Your Choice)                    │
├─────────────────────────────────────────────────────────────┤
│  REST API / GraphQL / tRPC                                   │
│  Database (PostgreSQL, MongoDB, etc.)                        │
│  Authentication (JWT, OAuth, etc.)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Integration

### Current Implementation

The auth system uses Zustand for state management with localStorage persistence.

**Store Location:** `lib/auth/auth.store.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
```

### Backend Integration Steps

#### 1. Update the API Client

Modify `lib/api/client.ts` to add your backend URL:

```typescript
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For httpOnly cookies
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem("auth-storage");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### 2. Implement Auth Service

Create `lib/api/services/auth.service.ts`:

```typescript
import apiClient from "../client";
import type { LoginCredentials, User } from "@/types";

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/register", credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>("/auth/refresh");
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post("/auth/reset-password", { token, password });
  },
};
```

#### 3. Update Auth Store

Update `lib/auth/auth.store.ts` to use the service:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/lib/api/services/auth.service";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authService.login(credentials);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
```

#### Expected API Endpoints

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| POST | `/api/auth/login` | `{ email, password }` | `{ user, token }` |
| POST | `/api/auth/register` | `{ email, password, name }` | `{ user, token }` |
| POST | `/api/auth/logout` | - | - |
| GET | `/api/auth/me` | - | `User` |
| POST | `/api/auth/refresh` | `{ refreshToken }` | `{ token }` |
| POST | `/api/auth/forgot-password` | `{ email }` | - |
| POST | `/api/auth/reset-password` | `{ token, password }` | - |

---

## Theme System Integration

### Current Implementation

The theme system supports creating, importing, and exporting custom themes. Themes are stored locally but can be synced to a backend.

**Store Location:** `lib/theme/theme.store.ts`  
**Service Location:** `lib/theme/theme.service.ts`

### Backend Integration Steps

#### 1. Theme API Endpoints

Create these endpoints on your backend:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/themes` | Get all themes for user |
| GET | `/api/themes/:id` | Get specific theme |
| POST | `/api/themes` | Create new theme |
| PUT | `/api/themes/:id` | Update theme |
| DELETE | `/api/themes/:id` | Delete theme |
| GET | `/api/themes/active` | Get user's active theme |
| PUT | `/api/themes/active` | Set active theme |

#### 2. Theme Data Structure

```typescript
// Theme saved to backend
interface Theme {
  id: string;
  name: string;
  description?: string;
  colorMode: "light" | "dark";
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    // ... additional color tokens
  };
  borderRadius: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  isSystem?: boolean;
}
```

#### 3. Update Theme Service

```typescript
// lib/theme/theme.service.ts
import apiClient from "@/lib/api/client";
import type { Theme } from "./theme.types";

export const themeService = {
  // Local storage operations (existing)
  getLocalThemes(): Theme[] {
    const stored = localStorage.getItem("custom-themes");
    return stored ? JSON.parse(stored) : [];
  },

  // Backend operations (new)
  async fetchThemes(): Promise<Theme[]> {
    const response = await apiClient.get<Theme[]>("/themes");
    return response.data;
  },

  async saveTheme(theme: Omit<Theme, "id" | "createdAt" | "updatedAt">): Promise<Theme> {
    const response = await apiClient.post<Theme>("/themes", theme);
    return response.data;
  },

  async updateTheme(id: string, updates: Partial<Theme>): Promise<Theme> {
    const response = await apiClient.put<Theme>(`/themes/${id}`, updates);
    return response.data;
  },

  async deleteTheme(id: string): Promise<void> {
    await apiClient.delete(`/themes/${id}`);
  },

  async getActiveTheme(): Promise<Theme | null> {
    const response = await apiClient.get<Theme>("/themes/active");
    return response.data;
  },

  async setActiveTheme(themeId: string): Promise<void> {
    await apiClient.put("/themes/active", { themeId });
  },

  // Sync local themes to backend
  async syncThemes(): Promise<void> {
    const localThemes = this.getLocalThemes();
    const remoteThemes = await this.fetchThemes();

    // Merge logic - prefer remote for conflicts
    const merged = new Map<string, Theme>();

    remoteThemes.forEach((theme) => merged.set(theme.id, theme));
    localThemes.forEach((theme) => {
      if (!merged.has(theme.id)) {
        merged.set(theme.id, theme);
      }
    });

    // Save merged themes locally
    localStorage.setItem("custom-themes", JSON.stringify([...merged.values()]));
  },
};
```

---

## Dashboard Personalization Sync

### Current Implementation

User widget layouts are stored in Zustand with localStorage persistence.

**Store Location:** `lib/dashboard/store/dashboard.store.ts`

### Backend Integration Steps

#### 1. Dashboard Layout API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/layout` | Get user's dashboard layout |
| PUT | `/api/dashboard/layout` | Save dashboard layout |
| GET | `/api/dashboard/views` | Get all saved views |
| POST | `/api/dashboard/views` | Create a new view |
| PUT | `/api/dashboard/views/:id` | Update a view |
| DELETE | `/api/dashboard/views/:id` | Delete a view |
| PUT | `/api/dashboard/views/:id/active` | Set active view |

#### 2. Layout Data Structure

```typescript
interface DashboardLayout {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  widgets: UserWidget[];
  createdAt: string;
  updatedAt: string;
}

interface UserWidget {
  instanceId: string;
  widgetId: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: Record<string, unknown>;
  isVisible: boolean;
}
```

#### 3. Update Dashboard Store

```typescript
// Add sync methods to dashboard.store.ts
const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // ... existing state

      // Sync to backend
      async syncToBackend() {
        const { widgets, currentView } = get();
        await apiClient.put("/dashboard/layout", {
          viewId: currentView,
          widgets,
        });
      },

      // Load from backend
      async loadFromBackend() {
        const response = await apiClient.get<DashboardLayout>("/dashboard/layout");
        set({
          widgets: response.data.widgets,
          currentView: response.data.id,
        });
      },

      // Auto-sync on changes (debounced)
      scheduleSync: debounce(() => {
        get().syncToBackend();
      }, 2000),
    }),
    {
      name: "dashboard-storage",
      // ... persist config
    }
  )
);
```

#### 4. Sync Strategy Options

**Option A: Sync on Save**
```typescript
// Only sync when user explicitly saves
const handleSaveLayout = async () => {
  await dashboardStore.syncToBackend();
  toast.success("Layout saved!");
};
```

**Option B: Auto-sync (Debounced)**
```typescript
// Auto-sync after changes with debounce
useEffect(() => {
  const unsubscribe = dashboardStore.subscribe(
    (state) => state.widgets,
    () => dashboardStore.scheduleSync()
  );
  return unsubscribe;
}, []);
```

**Option C: Offline-first with Conflict Resolution**
```typescript
// Track local changes, sync when online
const syncManager = {
  async sync() {
    const local = dashboardStore.getState();
    const remote = await apiClient.get("/dashboard/layout");

    if (local.updatedAt > remote.data.updatedAt) {
      // Local is newer, push to server
      await apiClient.put("/dashboard/layout", local);
    } else {
      // Remote is newer, update local
      dashboardStore.setState(remote.data);
    }
  },
};
```

---

## User Preferences API

### Preferences to Sync

| Preference | Local Storage Key | Backend Field |
|------------|-------------------|---------------|
| Language | `NEXT_LOCALE` | `user.preferences.locale` |
| Theme Mode | `theme` | `user.preferences.themeMode` |
| Active Theme | `active-theme-id` | `user.preferences.activeThemeId` |
| Sidebar State | `sidebar-collapsed` | `user.preferences.sidebarCollapsed` |
| Active Dashboard View | `active-view` | `user.preferences.activeDashboardView` |

### Preferences API

```typescript
// lib/api/services/preferences.service.ts
import apiClient from "../client";

interface UserPreferences {
  locale: string;
  themeMode: "light" | "dark" | "system";
  activeThemeId: string | null;
  sidebarCollapsed: boolean;
  activeDashboardView: string;
}

export const preferencesService = {
  async get(): Promise<UserPreferences> {
    const response = await apiClient.get<UserPreferences>("/user/preferences");
    return response.data;
  },

  async update(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiClient.patch<UserPreferences>("/user/preferences", updates);
    return response.data;
  },

  // Sync all local preferences to backend
  async syncAll(): Promise<void> {
    const localPreferences: UserPreferences = {
      locale: localStorage.getItem("NEXT_LOCALE") || "en",
      themeMode: (localStorage.getItem("theme") as any) || "system",
      activeThemeId: localStorage.getItem("active-theme-id"),
      sidebarCollapsed: localStorage.getItem("sidebar-collapsed") === "true",
      activeDashboardView: localStorage.getItem("active-view") || "default",
    };
    await this.update(localPreferences);
  },

  // Load preferences from backend and apply locally
  async loadAndApply(): Promise<void> {
    const prefs = await this.get();

    localStorage.setItem("NEXT_LOCALE", prefs.locale);
    localStorage.setItem("theme", prefs.themeMode);
    if (prefs.activeThemeId) {
      localStorage.setItem("active-theme-id", prefs.activeThemeId);
    }
    localStorage.setItem("sidebar-collapsed", String(prefs.sidebarCollapsed));
    localStorage.setItem("active-view", prefs.activeDashboardView);

    // Trigger re-renders if needed
    window.dispatchEvent(new Event("preferences-loaded"));
  },
};
```

### Backend Endpoint

```
PUT /api/user/preferences
Content-Type: application/json

{
  "locale": "ar",
  "themeMode": "dark",
  "activeThemeId": "theme-123",
  "sidebarCollapsed": false,
  "activeDashboardView": "view-456"
}
```

---

## Widget Data APIs

### Widget Architecture

Each widget can fetch its own data independently:

```typescript
// components/widgets/stats-widget.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import apiClient from "@/lib/api/client";

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  growth: number;
}

export function StatsWidget({ config }: { config: { period?: string } }) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const response = await apiClient.get<StatsData>("/widgets/stats", {
        params: { period: config.period || "7d" },
      });
      setData(response.data);
      setLoading(false);
    };

    fetchStats();
    // Optionally set up polling
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [config.period]);

  if (loading) return <WidgetSkeleton />;

  return (
    <Card>
      {/* Render stats */}
    </Card>
  );
}
```

### Recommended Widget API Structure

```
GET /api/widgets/:widgetType
Query Parameters:
  - period: "1d" | "7d" | "30d" | "1y"
  - filters: JSON string of filter criteria
  - config: JSON string of widget config

Response:
{
  "data": { ... widget-specific data },
  "meta": {
    "fetchedAt": "2024-01-15T12:00:00Z",
    "cacheUntil": "2024-01-15T12:05:00Z"
  }
}
```

---

## API Response Formats

### Standard Success Response

```typescript
interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}
```

### Standard Error Response

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (not allowed) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable Entity (business logic error) |
| 500 | Internal Server Error |

---

## Error Handling

### Frontend Error Handler

```typescript
// lib/api/error-handler.ts
import { toast } from "sonner";

export function handleApiError(error: any): never {
  const message = error.response?.data?.error?.message || "An error occurred";
  const code = error.response?.data?.error?.code;

  switch (error.response?.status) {
    case 400:
      toast.error("Invalid request", { description: message });
      break;
    case 401:
      toast.error("Session expired", { description: "Please log in again" });
      // Redirect to login handled by interceptor
      break;
    case 403:
      toast.error("Access denied", { description: message });
      break;
    case 404:
      toast.error("Not found", { description: message });
      break;
    case 409:
      toast.error("Conflict", { description: message });
      break;
    case 422:
      toast.error("Validation error", { description: message });
      break;
    default:
      toast.error("Server error", { description: "Please try again later" });
  }

  throw error;
}
```

### Validation Errors

```typescript
// Display field-level validation errors
interface ValidationError {
  error: {
    code: "VALIDATION_ERROR";
    message: "Validation failed";
    details: {
      email: ["Invalid email format"];
      password: ["Must be at least 8 characters"];
    };
  };
}

// In form handling
const handleSubmit = async (data: FormData) => {
  try {
    await authService.register(data);
  } catch (error: any) {
    if (error.response?.data?.error?.details) {
      const details = error.response.data.error.details;
      Object.entries(details).forEach(([field, messages]) => {
        form.setError(field, { message: messages[0] });
      });
    }
  }
};
```

---

## WebSocket Events (Real-time)

For real-time features, implement WebSocket connections:

### Events to Consider

| Event | Direction | Payload |
|-------|-----------|---------|
| `theme:updated` | Server → Client | `{ themeId, updates }` |
| `dashboard:sync` | Server → Client | `{ widgets }` |
| `notification:new` | Server → Client | `{ notification }` |
| `widget:data` | Server → Client | `{ widgetId, data }` |

### Implementation Example

```typescript
// lib/websocket/client.ts
import { io, Socket } from "socket.io-client";

class WebSocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token },
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("theme:updated", (data) => {
      // Update theme store
      useThemeStore.getState().applyRemoteUpdate(data);
    });

    this.socket.on("dashboard:sync", (data) => {
      // Update dashboard store
      useDashboardStore.getState().applyRemoteLayout(data);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}

export const wsClient = new WebSocketClient();
```

---

## Quick Start Checklist

1. [ ] Set `NEXT_PUBLIC_API_URL` in `.env.local`
2. [ ] Update `lib/api/client.ts` with your API configuration
3. [ ] Implement auth endpoints on backend
4. [ ] Update auth store to use real API
5. [ ] Implement theme sync endpoints (optional)
6. [ ] Implement dashboard layout sync (optional)
7. [ ] Implement user preferences endpoint (optional)
8. [ ] Add widget-specific API endpoints as needed
9. [ ] Set up WebSocket server for real-time features (optional)

---

## Environment Variables

```env
# .env.local

# Required
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Auth
NEXT_PUBLIC_AUTH_COOKIE_NAME=auth-token
NEXT_PUBLIC_AUTH_COOKIE_SECURE=false  # true in production

# Feature flags
NEXT_PUBLIC_ENABLE_THEME_SYNC=true
NEXT_PUBLIC_ENABLE_DASHBOARD_SYNC=true
NEXT_PUBLIC_ENABLE_REALTIME=false
```

---

## Summary

The B-Dashboard is designed with backend integration in mind. Key points:

1. **All API calls go through `lib/api/client.ts`** - centralized interceptors
2. **Zustand stores handle state** - swap local storage for API calls
3. **Services abstract backend communication** - easy to mock or switch
4. **Progressive enhancement** - works offline, syncs when available

For questions or clarification, refer to the codebase or create an issue.
