# Dashboard Foundation - Implementation Plan

## Executive Summary

This document outlines the architecture and implementation plan for an enterprise-grade, scalable dashboard foundation built with Next.js App Router, Tailwind CSS v4, shadcn/ui, and Zustand.

---

## 1. Architecture Overview

### Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 16 (App Router) | Server/Client components |
| Styling | Tailwind CSS v4 | CSS-first configuration |
| UI Components | shadcn/ui | Customizable primitives |
| State Management | Zustand | Lightweight, slices pattern |
| HTTP Client | Axios | Interceptors, typed responses |
| Icons | Lucide React | Tree-shakeable |

### Key Architectural Decisions

1. **Route Groups** - Using `(auth)` and `(dashboard)` route groups for layout isolation
2. **Zustand over Redux** - Simpler API, less boilerplate for this use case (see ADR-0001)
3. **Token Storage** - localStorage with httpOnly cookie recommendation documented
4. **Theme System** - CSS custom properties + Tailwind v4 theme inline

---

## 2. Folder Structure

```
b-dashboard/
├── docs/
│   ├── PLAN.md                    # This file
│   ├── TASKS.md                   # Task checklist
│   ├── ARCHITECTURE.md            # Detailed architecture
│   └── ADR/
│       ├── 0001-state-management.md
│       ├── 0002-api-layer.md
│       └── 0003-routing-layouts.md
├── app/
│   ├── globals.css                # Global styles + theme tokens
│   ├── layout.tsx                 # Root layout (providers)
│   ├── page.tsx                   # Redirect to /dashboard or /auth/login
│   ├── (auth)/
│   │   └── auth/
│   │       ├── layout.tsx         # Auth layout (centered card)
│   │       ├── login/
│   │       │   └── page.tsx
│   │       ├── forgot-password/
│   │       │   └── page.tsx
│   │       └── register/
│   │           └── page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── layout.tsx         # Dashboard shell (sidebar + topbar)
│   │       ├── page.tsx           # Dashboard home
│   │       ├── users/
│   │       │   └── page.tsx       # Users table example
│   │       └── settings/
│   │           ├── layout.tsx     # Settings sub-layout (tabs)
│   │           ├── page.tsx       # Redirect to profile
│   │           ├── profile/
│   │           │   └── page.tsx
│   │           ├── account/
│   │           │   └── page.tsx
│   │           └── appearance/
│   │               └── page.tsx
│   └── api/
│       └── auth/
│           └── [...nextauth]/     # Future: NextAuth (stub for now)
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx          # Main dashboard wrapper
│   │   ├── sidebar.tsx            # Collapsible sidebar
│   │   ├── sidebar-nav.tsx        # Navigation items
│   │   ├── topbar.tsx             # Top header bar
│   │   ├── breadcrumbs.tsx        # Breadcrumb component
│   │   ├── page-header.tsx        # Page title + actions
│   │   └── user-menu.tsx          # Profile dropdown
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── avatar.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── tooltip.tsx
│   │   └── ... (more as needed)
│   ├── shared/
│   │   ├── data-table.tsx         # Reusable table wrapper
│   │   ├── stats-card.tsx         # Dashboard stat card
│   │   └── theme-toggle.tsx       # Dark/light mode toggle
│   ├── forms/
│   │   └── login-form.tsx         # Login form component
│   └── providers/
│       ├── theme-provider.tsx     # Theme context
│       └── query-provider.tsx     # Future: React Query (optional)
├── lib/
│   ├── api/
│   │   ├── axios-client.ts        # Configured axios instance
│   │   ├── types.ts               # API response types
│   │   └── services/
│   │       ├── auth.service.ts    # Auth API calls
│   │       └── user.service.ts    # User API calls
│   ├── auth/
│   │   ├── auth.store.ts          # Zustand auth slice
│   │   ├── auth.utils.ts          # Token helpers
│   │   └── use-auth.ts            # Auth hook
│   ├── store/
│   │   ├── index.ts               # Store exports
│   │   └── ui.store.ts            # UI state (sidebar, theme)
│   └── utils/
│       ├── cn.ts                  # Class name utility
│       └── constants.ts           # App constants
├── types/
│   ├── auth.types.ts              # Auth-related types
│   ├── user.types.ts              # User types
│   └── api.types.ts               # Generic API types
└── public/
    └── ...
```

---

## 3. Routing Strategy

### Route Groups

| Group | Path | Layout | Purpose |
|-------|------|--------|---------|
| (auth) | /auth/* | Centered card | Authentication flows |
| (dashboard) | /dashboard/* | AppShell | Main application |

### Protected Routes

- All `/dashboard/*` routes require authentication
- Protection via layout-based check (client-side redirect)
- Middleware-based protection documented for production

### Key Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | page.tsx | Redirects based on auth state |
| `/auth/login` | Login form | Authentication entry |
| `/auth/forgot-password` | Stub form | Password reset (stub) |
| `/auth/register` | Stub form | Registration (stub) |
| `/dashboard` | Stats + Table | Main dashboard |
| `/dashboard/users` | Data table | User management |
| `/dashboard/settings` | Redirect | → /dashboard/settings/profile |
| `/dashboard/settings/profile` | Form | Profile settings |
| `/dashboard/settings/account` | Form | Account settings |
| `/dashboard/settings/appearance` | Theme toggle | Appearance settings |

---

## 4. Theming Strategy

### CSS Custom Properties

Using Tailwind v4's `@theme inline` with CSS variables for:

- Colors (background, foreground, primary, etc.)
- Border radius values
- Shadows
- Typography scale

### Dark Mode

- Class-based dark mode (`.dark` class on `<html>`)
- Persisted in localStorage
- System preference detection on initial load

### Theme Tokens Structure

```css
:root {
  /* Base */
  --background: oklch(100% 0 0);
  --foreground: oklch(14.9% 0.017 285.8);
  
  /* Primary */
  --primary: oklch(20.8% 0.042 265.8);
  --primary-foreground: oklch(98.5% 0 0);
  
  /* Secondary, Muted, Accent, Destructive... */
  
  /* Sidebar specific */
  --sidebar-background: ...
  --sidebar-foreground: ...
}

.dark {
  --background: oklch(14.9% 0.017 285.8);
  --foreground: oklch(98.5% 0 0);
  /* ... inverted values */
}
```

---

## 5. State Management Strategy

### Zustand with Slices Pattern

**Why Zustand:**
- Minimal boilerplate
- No providers needed (optional for devtools)
- TypeScript-first
- Selective subscriptions
- Persist middleware built-in

### Store Structure

```typescript
// Auth Store (lib/auth/auth.store.ts)
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// UI Store (lib/store/ui.store.ts)
interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
}
```

---

## 6. API Layer Strategy

### Axios Client Configuration

- Base URL from environment variable
- Request interceptor: attach auth token
- Response interceptor: handle 401 (logout), normalize errors
- Typed generic `ApiResponse<T>` wrapper

### Service Pattern

```typescript
// Service example
export const authService = {
  login: (credentials: LoginCredentials) => 
    axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials),
  
  logout: () => 
    axiosClient.post('/auth/logout'),
  
  me: () => 
    axiosClient.get<ApiResponse<User>>('/auth/me'),
};
```

### Mock API

Using Next.js Route Handlers for mock endpoints:
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/users`

---

## 7. Auth Strategy

### Flow

1. User visits app → check auth state
2. If no token → redirect to `/auth/login`
3. Login form → call `authService.login()`
4. On success → store token, update auth state, redirect to `/dashboard`
5. On API 401 → clear auth state, redirect to `/auth/login`
6. Logout → clear token, clear state, redirect

### Token Storage

- **Current implementation:** localStorage (for simplicity)
- **Production recommendation:** httpOnly cookie via backend
- Token attached via axios interceptor

### Route Protection

- Layout-based: Dashboard layout checks auth, redirects if not authenticated
- Documented middleware approach for production

---

## 8. shadcn/ui Components Used

| Component | Usage |
|-----------|-------|
| Button | Actions, submit |
| Card | Stats, content containers |
| Input | Forms |
| Label | Form labels |
| Dropdown Menu | User menu, actions |
| Avatar | User profile |
| Sheet | Mobile sidebar |
| Skeleton | Loading states |
| Table | Data display |
| Tabs | Settings navigation |
| Tooltip | Icon buttons |
| Separator | Visual dividers |
| Badge | Status indicators |

---

## 9. Implementation Phases

### Phase 1: Documentation ✓
- [x] Create PLAN.md
- [ ] Create TASKS.md
- [ ] Create ARCHITECTURE.md
- [ ] Create ADRs (0001, 0002, 0003)
- [ ] Update README.md

### Phase 2: Foundation
- [ ] Install dependencies (shadcn, axios, zustand, lucide)
- [ ] Configure shadcn/ui
- [ ] Setup theme system
- [ ] Create utility functions

### Phase 3: Components
- [ ] Build UI components (shadcn)
- [ ] Build layout components
- [ ] Build shared components

### Phase 4: State & API
- [ ] Setup Zustand stores
- [ ] Configure axios client
- [ ] Create service modules
- [ ] Setup mock API routes

### Phase 5: Pages & Auth
- [ ] Implement auth pages
- [ ] Implement dashboard layout
- [ ] Implement settings pages
- [ ] Implement example pages

### Phase 6: Polish
- [ ] Verify all routes work
- [ ] Test auth flow
- [ ] Test dark mode
- [ ] Final documentation review

---

## 10. Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Dashboard
```

---

## 11. Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "format": "prettier --write ."
}
```
