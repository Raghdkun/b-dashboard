# Implementation Tasks

## Task Tracker

### Legend
- [ ] Not started
- [🔄] In progress
- [x] Completed

---

## Phase 1: Documentation

### Task 1.1: Create Core Documentation
**Goal:** Establish all required documentation files before implementation

**Files:**
- `docs/PLAN.md`
- `docs/TASKS.md`
- `docs/ARCHITECTURE.md`
- `docs/ADR/0001-state-management.md`
- `docs/ADR/0002-api-layer.md`
- `docs/ADR/0003-routing-layouts.md`
- `README.md`

**Acceptance Criteria:**
- [x] PLAN.md contains architecture overview, folder structure, all strategies
- [x] TASKS.md contains all tasks with acceptance criteria
- [x] ARCHITECTURE.md documents boundaries and conventions
- [x] All 3 ADRs created with proper format
- [x] README.md updated with setup and guides

---

## Phase 2: Foundation Setup

### Task 2.1: Install Dependencies
**Goal:** Install all required npm packages

**Commands:**
```bash
pnpm add axios zustand lucide-react clsx tailwind-merge class-variance-authority next-themes
```

**Acceptance Criteria:**
- [x] All dependencies installed
- [x] No version conflicts
- [x] `pnpm dev` still works

---

### Task 2.2: Configure shadcn/ui
**Goal:** Initialize and configure shadcn/ui for the project

**Commands:**
```bash
pnpm dlx shadcn@latest init
```

**Files:**
- `components.json`
- `lib/utils.ts`

**Acceptance Criteria:**
- [x] shadcn/ui initialized
- [x] components.json configured for Tailwind v4
- [x] cn utility function available

---

### Task 2.3: Setup Theme System
**Goal:** Create comprehensive theming with dark mode support

**Files:**
- `app/globals.css` (update)
- `components/providers/theme-provider.tsx`
- `components/shared/theme-toggle.tsx`

**Acceptance Criteria:**
- [x] CSS variables defined for light/dark modes
- [x] Theme provider wraps application
- [x] Theme persists in localStorage
- [x] System preference detection works
- [x] Toggle switches theme correctly

---

## Phase 3: UI Components

### Task 3.1: Install shadcn/ui Components
**Goal:** Add all required shadcn/ui components

**Acceptance Criteria:**
- [x] All components installed and importable
- [x] Components use theme tokens
- [x] TypeScript types working

---

### Task 3.2: Build Layout Components
**Goal:** Create reusable dashboard layout primitives

**Files:**
- `components/layout/app-shell.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/sidebar-nav.tsx`
- `components/layout/topbar.tsx`
- `components/layout/breadcrumbs.tsx`
- `components/layout/page-header.tsx`
- `components/layout/user-menu.tsx`

**Acceptance Criteria:**
- [x] AppShell provides sidebar + main content structure
- [x] Sidebar is collapsible
- [x] Sidebar has navigation items with icons
- [x] Topbar shows breadcrumbs and user menu
- [x] User menu has profile, settings, logout options
- [x] Mobile responsive with sheet/drawer sidebar
- [x] Components properly typed

---

### Task 3.3: Build Shared Components
**Goal:** Create reusable business components

**Files:**
- `components/shared/data-table.tsx`
- `components/shared/stats-card.tsx`

**Acceptance Criteria:**
- [x] DataTable wraps shadcn table with common patterns
- [x] StatsCard displays metric with title, value, icon, trend
- [x] Components are generic and reusable

---

## Phase 4: State & API Layer

### Task 4.1: Setup Zustand Stores
**Goal:** Configure state management

**Files:**
- `lib/store/index.ts`
- `lib/store/ui.store.ts`
- `lib/auth/auth.store.ts`

**Acceptance Criteria:**
- [x] UI store manages sidebar collapsed state
- [x] UI store manages theme preference
- [x] Auth store manages user and token
- [x] Auth store has login/logout actions
- [x] Stores persist necessary data to localStorage

---

### Task 4.2: Configure Axios Client
**Goal:** Setup typed API client with interceptors

**Files:**
- `lib/api/axios-client.ts`
- `lib/api/types.ts`

**Acceptance Criteria:**
- [x] Axios instance configured with base URL
- [x] Request interceptor adds auth token
- [x] Response interceptor handles 401
- [x] ApiResponse<T> type defined
- [x] Error handling normalized

---

### Task 4.3: Create Service Modules
**Goal:** Implement API service layer

**Files:**
- `lib/api/services/auth.service.ts`
- `lib/api/services/user.service.ts`

**Acceptance Criteria:**
- [x] authService has login, logout, me methods
- [x] userService has getUsers, getUser methods
- [x] All methods properly typed
- [x] Services use axiosClient

---

### Task 4.4: Create Mock API Routes
**Goal:** Setup mock backend endpoints

**Files:**
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/users/route.ts`

**Acceptance Criteria:**
- [x] POST /api/auth/login returns mock token and user
- [x] POST /api/auth/logout returns success
- [x] GET /api/auth/me returns user if valid token
- [x] GET /api/users returns list of mock users

---

## Phase 5: Pages & Auth

### Task 5.1: Create Auth Layout & Pages
**Goal:** Implement authentication pages

**Files:**
- `app/(auth)/auth/layout.tsx`
- `app/(auth)/auth/login/page.tsx`
- `app/(auth)/auth/forgot-password/page.tsx`
- `app/(auth)/auth/register/page.tsx`

**Acceptance Criteria:**
- [x] Auth layout centers content
- [x] Login page has email/password form
- [x] Login form validates inputs
- [x] Successful login redirects to /dashboard
- [x] Forgot password page is stub with back link
- [x] Register page is stub with back link

---

### Task 5.2: Create Dashboard Layout
**Goal:** Implement main dashboard shell

**Files:**
- `app/(dashboard)/dashboard/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `lib/auth/use-auth.ts`

**Acceptance Criteria:**
- [x] Dashboard layout uses AppShell
- [x] Layout checks auth state, redirects if not authenticated
- [x] Dashboard home shows stats cards
- [x] Dashboard home shows data table skeleton
- [x] useAuth hook provides auth state and actions

---

### Task 5.3: Create Settings Pages
**Goal:** Implement settings section

**Files:**
- `app/(dashboard)/dashboard/settings/layout.tsx`
- `app/(dashboard)/dashboard/settings/page.tsx`
- `app/(dashboard)/dashboard/settings/profile/page.tsx`
- `app/(dashboard)/dashboard/settings/account/page.tsx`
- `app/(dashboard)/dashboard/settings/appearance/page.tsx`

**Acceptance Criteria:**
- [x] Settings layout has tab navigation
- [x] Settings root redirects to profile
- [x] Profile page has name/email form
- [x] Account page has password change stub
- [x] Appearance page has theme toggle

---

### Task 5.4: Create Users Page
**Goal:** Implement users table example

**Files:**
- `app/(dashboard)/dashboard/users/page.tsx`
- `types/user.types.ts`

**Acceptance Criteria:**
- [x] Page displays user table
- [x] Table has columns: name, email, role, status
- [x] Filter input stub present
- [x] Loading skeleton shown during fetch
- [x] Data fetched from mock API

---

### Task 5.5: Update Root Page
**Goal:** Redirect based on auth state

**Files:**
- `app/page.tsx`
- `app/layout.tsx`

**Acceptance Criteria:**
- [x] Root layout includes providers
- [x] Root page redirects to /dashboard if authenticated
- [x] Root page redirects to /auth/login if not authenticated

---

## Phase 6: Polish & Verification

### Task 6.1: Verify All Routes
**Goal:** Ensure all pages render correctly

**Acceptance Criteria:**
- [x] /auth/login renders
- [x] /auth/forgot-password renders
- [x] /auth/register renders
- [x] /dashboard renders with sidebar
- [x] /dashboard/users renders with table
- [x] /dashboard/settings/profile renders
- [x] /dashboard/settings/account renders
- [x] /dashboard/settings/appearance renders

---

### Task 6.2: Test Auth Flow
**Goal:** Verify authentication works end-to-end

**Acceptance Criteria:**
- [x] Login with valid credentials succeeds
- [x] Token stored in localStorage
- [x] Dashboard shows user info
- [x] Logout clears token and redirects
- [x] Visiting dashboard without auth redirects to login

---

### Task 6.3: Test Theme System
**Goal:** Verify dark mode works

**Acceptance Criteria:**
- [x] Theme toggle switches between light/dark
- [x] Theme persists on page reload
- [x] System preference detected on first visit
- [x] All components respect theme

---

### Task 6.4: Final Documentation Review
**Goal:** Ensure docs match implementation

**Acceptance Criteria:**
- [x] README has accurate setup steps
- [x] All file paths in docs are correct
- [x] No outdated information
- [x] CHECKPOINT.md not needed (completed in single session)

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1 | 1 | ✅ Complete |
| Phase 2 | 3 | ✅ Complete |
| Phase 3 | 3 | ✅ Complete |
| Phase 4 | 4 | ✅ Complete |
| Phase 5 | 5 | ✅ Complete |
| Phase 6 | 4 | ✅ Complete |
| **Total** | **20** | **✅ All Complete** |
