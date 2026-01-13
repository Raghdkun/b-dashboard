# ADR 0002: API Layer Architecture

## Status

Accepted

## Date

2026-01-12

## Context

We need a consistent, scalable approach for API communication. Requirements:

1. **Type safety** - All requests and responses should be typed
2. **Interceptors** - Handle auth tokens, errors, loading states
3. **Modularity** - Services organized by domain
4. **Error handling** - Consistent error format across the app
5. **Mock support** - Easy to mock for development and testing

### Options Considered

#### Option A: Native Fetch with Wrapper

**Pros:**
- No dependencies
- Modern browsers support
- Server component compatible

**Cons:**
- More boilerplate for interceptors
- Less feature-rich

#### Option B: Axios

**Pros:**
- Built-in interceptors
- Request/response transformation
- Automatic JSON handling
- Wide adoption, well-documented
- Easy to configure globally

**Cons:**
- Additional dependency (~30KB)
- Not natively async iterable

#### Option C: TanStack Query (React Query)

**Pros:**
- Caching, deduplication, background refetch
- Excellent for data fetching patterns
- DevTools

**Cons:**
- Adds complexity for simple cases
- Learning curve
- Better suited as complement, not replacement

## Decision

We choose **Axios** as the HTTP client with a service pattern architecture.

TanStack Query may be added later for caching needs but is not required for the initial implementation.

## Rationale

1. **Interceptors**: Axios interceptors make it trivial to attach auth tokens and handle 401 responses globally.

2. **Type Safety**: Generic typing with `axios.get<T>()` provides good TypeScript integration.

3. **Familiarity**: Most developers know Axios, reducing onboarding time.

4. **Flexibility**: Easy to configure for different environments (base URLs, timeouts).

5. **Service Pattern**: Natural fit for organizing API calls by domain.

## Implementation

### Axios Client Configuration

```typescript
// lib/api/axios-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/auth/auth.store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Type Definitions

```typescript
// lib/api/types.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### Service Pattern

```typescript
// lib/api/services/auth.service.ts
import { axiosClient } from '../axios-client';
import type { ApiResponse } from '../types';
import type { User, LoginCredentials, AuthResponse } from '@/types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await axiosClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  },

  me: async (): Promise<ApiResponse<User>> => {
    const { data } = await axiosClient.get<ApiResponse<User>>('/auth/me');
    return data;
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const { data } = await axiosClient.post<ApiResponse<{ token: string }>>(
      '/auth/refresh'
    );
    return data;
  },
};
```

```typescript
// lib/api/services/user.service.ts
import { axiosClient } from '../axios-client';
import type { ApiResponse, PaginatedResponse } from '../types';
import type { User } from '@/types/user.types';

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
}

export const userService = {
  getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
    const { data } = await axiosClient.get<PaginatedResponse<User>>('/users', {
      params,
    });
    return data;
  },

  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await axiosClient.get<ApiResponse<User>>(`/users/${id}`);
    return data;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    const { data } = await axiosClient.patch<ApiResponse<User>>(
      `/users/${id}`,
      userData
    );
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  },
};
```

### Service Index

```typescript
// lib/api/services/index.ts
export { authService } from './auth.service';
export { userService } from './user.service';
```

### Mock API Routes (Next.js Route Handlers)

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  // Mock validation
  if (email === 'admin@example.com' && password === 'password') {
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          avatar: null,
        },
        token: 'mock-jwt-token-12345',
      },
    });
  }

  return NextResponse.json(
    { success: false, message: 'Invalid credentials' },
    { status: 401 }
  );
}
```

### Usage in Components

```tsx
// In a component or hook
import { authService } from '@/lib/api/services';

async function handleLogin(credentials: LoginCredentials) {
  try {
    const response = await authService.login(credentials);
    if (response.success) {
      // Store token, update state
      useAuthStore.getState().setUser(response.data.user);
    }
  } catch (error) {
    // Error already handled by interceptor for 401
    // Handle other errors here
    console.error('Login failed:', error);
  }
}
```

## Token Storage Strategy

### Current Implementation (Development)

For simplicity, tokens are stored in localStorage via Zustand's persist middleware:

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'auth-storage',
    partialize: (state) => ({ token: state.token }),
  }
)
```

### Production Recommendation

For production environments, use httpOnly cookies:

1. **Backend sets cookie** on login response
2. **Cookie sent automatically** with requests (same-origin)
3. **XSS protection** - JavaScript cannot access httpOnly cookies
4. **CSRF protection** needed (SameSite, CSRF tokens)

```typescript
// Example: Backend sets cookie
res.cookie('token', jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

## Consequences

### Positive

- Consistent API communication pattern
- Type-safe requests and responses
- Global error handling
- Easy to add new services
- Mock API works without external backend

### Negative

- Additional dependency (Axios)
- Must maintain mock routes during development
- Token in localStorage is XSS-vulnerable (documented for production change)

### Mitigations

- Document httpOnly cookie migration path
- Use Axios interceptors for centralized auth handling
- Consider adding React Query later for caching

## References

- [Axios Documentation](https://axios-http.com/)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [OWASP Token Storage](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#token-storage-on-client-side)
