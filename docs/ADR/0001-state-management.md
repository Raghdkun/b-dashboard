# ADR 0001: State Management Choice

## Status

Accepted

## Date

2026-01-12

## Context

We need to choose a state management solution for the dashboard application. The primary use cases are:

1. **Authentication state** - User info, token, login/logout
2. **UI state** - Sidebar collapsed state, theme preference
3. **Future expansion** - Notifications, user preferences, etc.

### Options Considered

#### Option A: Redux Toolkit

**Pros:**
- Industry standard, well-documented
- Powerful dev tools
- Great for complex state logic
- Middleware ecosystem (thunks, sagas)

**Cons:**
- Significant boilerplate (slices, selectors, dispatch)
- Requires Provider wrapper
- Steeper learning curve
- Overkill for simple state

#### Option B: Zustand

**Pros:**
- Minimal boilerplate
- No Provider required
- TypeScript-first design
- Built-in persist middleware
- Selective subscriptions (performance)
- Simple API (just hooks)

**Cons:**
- Less mature ecosystem
- Fewer middleware options
- Less suitable for very complex state graphs

#### Option C: React Context + useReducer

**Pros:**
- Built into React, no dependencies
- Simple for small apps

**Cons:**
- Performance issues with frequent updates
- No built-in persistence
- Boilerplate for complex state

## Decision

We choose **Zustand** for state management.

## Rationale

1. **Simplicity**: Our state needs are straightforward (auth + UI). Zustand's minimal API reduces boilerplate significantly.

2. **TypeScript Support**: Zustand has excellent TypeScript inference, reducing type annotation overhead.

3. **Persistence**: Built-in `persist` middleware makes storing auth tokens and theme preferences trivial.

4. **Performance**: Selective subscriptions mean components only re-render when their specific state slice changes.

5. **No Provider Hell**: Zustand stores work without wrapping the app in providers (though we can add for devtools).

6. **Scalability**: If needs grow, Zustand supports slices pattern similar to Redux Toolkit.

## Implementation

### Store Structure

```typescript
// lib/auth/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials);
          set({ 
            user: response.user, 
            token: response.token, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }), // Only persist token
    }
  )
);
```

```typescript
// lib/store/ui.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'system',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
```

### Usage Pattern

```tsx
// In components
function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  // ...
}

// Selective subscription for performance
function UserAvatar() {
  const user = useAuthStore((state) => state.user);
  // Only re-renders when user changes
}
```

## Consequences

### Positive

- Faster development with less boilerplate
- Simpler mental model for team
- Easy persistence out of the box
- Good performance characteristics

### Negative

- Team unfamiliar with Redux may not transfer skills directly
- Need to learn Zustand-specific patterns
- May need refactor if state complexity grows significantly

### Mitigations

- Document patterns clearly in ARCHITECTURE.md
- If complexity grows, can migrate to Redux Toolkit with similar slice pattern
- Use TypeScript strictly to catch issues early

## References

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Comparison Article](https://blog.logrocket.com/zustand-vs-redux/)
