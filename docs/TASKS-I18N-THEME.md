# Implementation Tasks: i18n + Theme System v2

## Legend
- [ ] Not started
- [🔄] In progress
- [x] Completed

---

## Phase 0: Fix Existing Problems

### Task 0.1: Fix TypeScript Errors
- [x] Consolidate duplicate User type (auth.types.ts vs user.types.ts)
- [x] Fix DataTable generic constraint (`T extends object` instead of `Record<string, unknown>`)

### Task 0.2: Fix ESLint Errors
- [x] Fix `setMounted` in useEffect (appearance/page.tsx)
- [x] Remove unused `searchQuery` variable (users/page.tsx)

### Task 0.3: Clean up README
- [ ] Remove embedded task requirements from README.md

**Acceptance Criteria:**
- [x] `pnpm build` passes with no TypeScript errors
- [x] `pnpm lint` passes with no errors

---

## Phase 1: i18n Infrastructure

### Task 1.1: Create i18n Configuration
- [x] Create `lib/i18n/config.ts` with locale settings
- [x] Create `i18n/request.ts` for next-intl (fix missing file error)
- [x] Create `middleware.ts` for locale routing

### Task 1.2: Create Translation Files
- [x] Create `lib/i18n/locales/en.json` with all translations
- [x] Create `lib/i18n/locales/ar.json` with Arabic translations

### Task 1.3: Update Root Layout
- [x] Create `app/[locale]/layout.tsx` with NextIntlClientProvider
- [x] Set html `lang` and `dir` attributes
- [x] Create `app/[locale]/page.tsx` redirect

### Task 1.4: Update App Layout
- [x] Update `app/layout.tsx` to be minimal (just providers)
- [x] Update `app/page.tsx` to redirect to locale

**Acceptance Criteria:**
- [x] `/en` and `/ar` routes work
- [x] `dir="rtl"` and `lang="ar"` set when Arabic
- [x] No hydration errors

---

## Phase 2: Migrate Pages to [locale]

### Task 2.1: Migrate Auth Pages
- [x] `app/[locale]/(auth)/auth/layout.tsx`
- [x] `app/[locale]/(auth)/auth/login/page.tsx`
- [x] `app/[locale]/(auth)/auth/register/page.tsx`
- [x] `app/[locale]/(auth)/auth/forgot-password/page.tsx`
- [x] Update all hardcoded strings to use `t()`

### Task 2.2: Migrate Dashboard Pages
- [x] `app/[locale]/(dashboard)/dashboard/layout.tsx`
- [x] `app/[locale]/(dashboard)/dashboard/page.tsx`
- [x] `app/[locale]/(dashboard)/dashboard/users/page.tsx`

### Task 2.3: Migrate Settings Pages
- [x] `app/[locale]/(dashboard)/dashboard/settings/layout.tsx`
- [x] `app/[locale]/(dashboard)/dashboard/settings/page.tsx`
- [x] `app/[locale]/(dashboard)/dashboard/settings/profile/page.tsx`
- [x] `app/[locale]/(dashboard)/dashboard/settings/account/page.tsx`
- [x] `app/[locale]/(dashboard)/dashboard/settings/appearance/page.tsx`

### Task 2.4: Update Layout Components
- [x] Update Sidebar with translations + RTL support
- [x] Update Topbar with translations
- [x] Update Breadcrumbs for RTL
- [x] Update UserMenu with translations

**Acceptance Criteria:**
- [x] All pages render in both /en and /ar
- [x] No hardcoded English strings in components
- [x] Sidebar displays correctly in RTL

---

## Phase 3: Language Preferences

### Task 3.1: Create Language Switcher
- [x] Create `components/shared/language-switcher.tsx` (built into preferences page)
- [x] Add locale persistence (cookie + localStorage)

### Task 3.2: Create Preferences Page
- [x] Create `app/[locale]/(dashboard)/dashboard/settings/preferences/page.tsx`
- [x] Add language selection UI
- [x] Add to settings tabs navigation

### Task 3.3: Update Settings Layout
- [x] Add "Preferences" tab to settings navigation
- [x] Translate tab labels

**Acceptance Criteria:**
- [x] Language switcher works and persists
- [x] Preferences page accessible from settings
- [x] Locale cookie set for middleware

---

## Phase 4: Theme System v2

### Task 4.1: Create Theme Types & Schema
- [x] Create `lib/theme/types.ts` with Theme interface
- [x] Create `lib/theme/schema.ts` with Zod validation
- [x] Create `lib/theme/default-theme.ts`

### Task 4.2: Create Theme Store
- [x] Create `lib/theme/theme.store.ts` (Zustand with persist)
- [x] Implement addTheme, removeTheme, selectTheme, resetToDefault

### Task 4.3: Create Theme Application
- [x] Create `lib/theme/apply-theme.ts` utility
- [x] Add FOUC prevention script to root layout

### Task 4.4: Create Theme Service
- [x] Create `lib/theme/theme.service.ts` with backend interfaces
- [x] Create API route stubs:
  - [x] `app/api/themes/route.ts` (GET, POST)
  - [x] `app/api/themes/[id]/route.ts` (GET, PUT, DELETE)
  - [x] `app/api/themes/active/route.ts` (GET, PUT)
  - [x] `app/api/themes/sync/route.ts` (POST)

### Task 4.5: Create Theme Manager Page
- [x] Create `app/[locale]/(dashboard)/dashboard/settings/themes/page.tsx`
- [x] Implement theme list with selection
- [x] Implement JSON import with validation
- [x] Implement JSON export
- [x] Implement theme deletion (protect default)
- [x] Implement reset to default

### Task 4.6: Update Settings Navigation
- [x] Add "Themes" tab to settings layout
- [x] Ensure translations for themes section

**Acceptance Criteria:**
- [x] Default theme loads on app start
- [x] Can import valid JSON theme
- [x] Theme persists across reload
- [x] No FOUC when loading custom theme
- [x] Cannot delete default theme
- [x] Export produces valid JSON

---

## Phase 5: Dashboard Polish

### Task 5.1: Apply Radius System
- [x] Verify radius tokens in globals.css
- [x] Update AppShell main content with rounded corners
- [x] Update Sidebar with consistent rounding
- [x] Update Card components (uses shadcn defaults)

### Task 5.2: Improve Layout Realism
- [x] Add subtle background contrast to main content area (bg-muted/40)
- [x] Ensure consistent spacing rhythm
- [x] Add proper focus rings (via outline-ring/50)
- [x] Verify hover states

### Task 5.3: RTL Polish
- [x] Test all layouts in Arabic
- [x] Fix chevron/arrow icons in RTL
- [x] Fix padding/margin issues (use me-/ms-/pe-/ps-)
- [x] Test mobile sheet in RTL

**Acceptance Criteria:**
- [x] Dashboard looks polished and enterprise-ready
- [x] Consistent radius across all containers
- [x] No visual bugs in RTL mode

---

## Phase 6: Documentation & Cleanup

### Task 6.1: Update README
- [x] Add "Adding a Translation Key" section
- [x] Add "Adding a New Locale" section
- [x] Add "Importing/Exporting Themes" section
- [x] Add "Backend Theme Sync" section
- [x] Remove old task requirements from README

### Task 6.2: Update PROBLEMS.md
- [x] Mark all fixed issues as completed
- [x] Document any new issues found

### Task 6.3: Final Verification
- [x] Run `pnpm build` - no errors
- [x] Run `pnpm lint` - no errors
- [x] Test all routes in English
- [x] Test all routes in Arabic
- [x] Test theme import/export
- [x] Test theme persistence
- [x] Test language switching

**Acceptance Criteria:**
- [x] All docs accurate and up-to-date
- [x] No TypeScript or lint errors
- [x] All features working as documented

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 0 | 3 | ✅ Complete |
| Phase 1 | 4 | ✅ Complete |
| Phase 2 | 4 | ✅ Complete |
| Phase 3 | 3 | ✅ Complete |
| Phase 4 | 6 | ✅ Complete |
| Phase 5 | 3 | ✅ Complete |
| Phase 6 | 3 | ✅ Complete |
| **Total** | **26** | **✅ 26 Complete** |
