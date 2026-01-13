# Implementation Plan: i18n + Theme System v2

## Overview

This document outlines the implementation plan for adding localization (English/Arabic with RTL) and Theme System v2 to the dashboard.

---

## Part 1: Localization (i18n)

### Approach
- **Library:** next-intl (already installed)
- **Routing:** Locale prefix routing (`/en/...`, `/ar/...`)
- **RTL:** CSS logical properties + Tailwind RTL variants

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Middleware                              │
│  - Detect locale from URL/cookie/header                     │
│  - Redirect to locale-prefixed route                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   [locale] Layout                            │
│  - Set html lang and dir attributes                         │
│  - Provide translations via NextIntlClientProvider          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Page Components                           │
│  - Use useTranslations() hook for client components         │
│  - Use getTranslations() for server components              │
└─────────────────────────────────────────────────────────────┘
```

### Translation File Structure

```json
// locales/en.json
{
  "common": {
    "search": "Search...",
    "logout": "Log out",
    "profile": "Profile",
    "settings": "Settings",
    "loading": "Loading...",
    "error": "An error occurred",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add"
  },
  "nav": {
    "dashboard": "Dashboard",
    "users": "Users",
    "settings": "Settings",
    "collapse": "Collapse"
  },
  "auth": {
    "login": {
      "title": "Welcome back",
      "description": "Enter your credentials to access your account",
      "email": "Email",
      "password": "Password",
      "forgotPassword": "Forgot password?",
      "signIn": "Sign in",
      "noAccount": "Don't have an account?",
      "register": "Create account"
    },
    "register": {
      "title": "Create an account",
      "description": "Enter your details to get started"
    },
    "forgotPassword": {
      "title": "Reset your password",
      "description": "Enter your email and we'll send you instructions"
    }
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back! Here's an overview of your workspace.",
    "stats": {
      "totalUsers": "Total Users",
      "activeNow": "Active Now",
      "revenue": "Revenue",
      "growth": "Growth",
      "fromLastMonth": "from last month",
      "currentlyOnline": "currently online",
      "comparedToLastQuarter": "compared to last quarter"
    },
    "recentUsers": "Recent Users"
  },
  "users": {
    "title": "Users",
    "description": "Manage your users and their permissions.",
    "addUser": "Add User",
    "searchPlaceholder": "Search users...",
    "noUsers": "No users found.",
    "columns": {
      "user": "User",
      "role": "Role",
      "status": "Status",
      "joined": "Joined"
    }
  },
  "settings": {
    "title": "Settings",
    "description": "Manage your account settings and preferences.",
    "tabs": {
      "profile": "Profile",
      "account": "Account",
      "appearance": "Appearance",
      "preferences": "Preferences",
      "themes": "Themes"
    },
    "profile": {
      "title": "Profile",
      "description": "Manage your public profile information."
    },
    "account": {
      "title": "Account",
      "description": "Manage your account security and settings."
    },
    "appearance": {
      "title": "Appearance",
      "description": "Customize how the dashboard looks and feels.",
      "theme": "Theme",
      "themeDescription": "Select your preferred color scheme for the interface.",
      "light": "Light",
      "lightDescription": "Light mode with bright backgrounds",
      "dark": "Dark",
      "darkDescription": "Dark mode for reduced eye strain",
      "system": "System",
      "systemDescription": "Follow your system preferences"
    },
    "preferences": {
      "title": "Preferences",
      "description": "Customize your dashboard experience.",
      "language": "Language",
      "languageDescription": "Select your preferred language."
    },
    "themes": {
      "title": "Theme Manager",
      "description": "Create, import, and manage custom themes.",
      "currentTheme": "Current Theme",
      "availableThemes": "Available Themes",
      "importTheme": "Import Theme",
      "exportTheme": "Export Theme",
      "resetDefault": "Reset to Default",
      "deleteTheme": "Delete Theme",
      "cannotDeleteDefault": "Cannot delete the default theme",
      "themeImported": "Theme imported successfully",
      "themeDeleted": "Theme deleted",
      "invalidJson": "Invalid JSON format",
      "validationFailed": "Theme validation failed"
    }
  }
}
```

### RTL Considerations

| LTR Property | RTL Equivalent |
|--------------|----------------|
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `left` | `inset-inline-start` |
| `right` | `inset-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |

Tailwind utilities with RTL variants:
```css
.rtl\:rotate-180:is([dir="rtl"] *) { transform: rotate(180deg); }
.rtl\:space-x-reverse:is([dir="rtl"] *) > * { --tw-space-x-reverse: 1; }
```

---

## Part 2: Theme System v2

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Theme Store (Zustand)                     │
│  - themes: Theme[]                                          │
│  - selectedThemeId: string                                  │
│  - addTheme, removeTheme, selectTheme, etc.                 │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌─────────────────────┐               ┌─────────────────────┐
│    localStorage     │               │   Backend API       │
│  (persist middleware)│              │  (future sync)      │
└─────────────────────┘               └─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   applyTheme()                               │
│  - Sets CSS custom properties on :root                      │
│  - Handles light/dark mode variants                         │
└─────────────────────────────────────────────────────────────┘
```

### Default Theme Definition

```typescript
export const defaultTheme: Theme = {
  id: "default",
  name: "Default",
  version: "1.0.0",
  isDefault: true,
  colors: {
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.145 0 0)",
      primary: "oklch(0.205 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      secondary: "oklch(0.97 0 0)",
      secondaryForeground: "oklch(0.205 0 0)",
      muted: "oklch(0.97 0 0)",
      mutedForeground: "oklch(0.556 0 0)",
      accent: "oklch(0.97 0 0)",
      accentForeground: "oklch(0.205 0 0)",
      destructive: "oklch(0.577 0.245 27.325)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: "oklch(0.708 0 0)",
      // ... chart and sidebar colors
    },
    dark: {
      // ... dark mode colors
    }
  },
  radius: {
    base: "0.625rem"
  }
};
```

### Theme Validation (Zod)

```typescript
const colorSchema = z.string().refine(
  (val) => /^(oklch|hsl|rgb|#)/.test(val),
  "Must be a valid CSS color"
);

const themeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(50),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  isDefault: z.boolean().optional(),
  colors: z.object({
    light: colorTokensSchema,
    dark: colorTokensSchema,
  }),
  radius: z.object({
    base: z.string(),
  }),
  metadata: z.object({
    author: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});
```

---

## Part 3: Dashboard Polish

### Radius System

```css
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}
```

### Layout Updates

1. **AppShell main content area:**
   ```tsx
   <main className="flex-1 overflow-auto p-4 md:p-6">
     <div className="rounded-xl bg-card/50 p-4 md:p-6">
       {children}
     </div>
   </main>
   ```

2. **Consistent card styling:**
   ```tsx
   <Card className="rounded-xl border-border/50">
   ```

3. **Table containers:**
   ```tsx
   <div className="rounded-lg border overflow-hidden">
     <Table>...</Table>
   </div>
   ```

---

## Folder Structure Changes

```
b-dashboard/
├── app/
│   ├── [locale]/                    # Locale-prefixed routes
│   │   ├── layout.tsx               # NEW: Root layout with i18n
│   │   ├── page.tsx                 # NEW: Redirect to dashboard
│   │   ├── (auth)/
│   │   │   └── auth/
│   │   │       ├── login/page.tsx
│   │   │       ├── register/page.tsx
│   │   │       └── forgot-password/page.tsx
│   │   └── (dashboard)/
│   │       └── dashboard/
│   │           ├── layout.tsx
│   │           ├── page.tsx
│   │           ├── users/page.tsx
│   │           └── settings/
│   │               ├── layout.tsx
│   │               ├── page.tsx
│   │               ├── profile/page.tsx
│   │               ├── account/page.tsx
│   │               ├── appearance/page.tsx
│   │               ├── preferences/page.tsx  # NEW
│   │               └── themes/page.tsx       # NEW
│   ├── api/
│   │   └── themes/                   # NEW: Theme API routes
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── layout.tsx                    # Minimal root (no locale)
│   └── page.tsx                      # Redirect to /en
├── lib/
│   ├── i18n/
│   │   ├── config.ts                 # NEW: i18n configuration
│   │   ├── request.ts                # NEW: next-intl request config
│   │   └── locales/
│   │       ├── en.json               # NEW: English translations
│   │       └── ar.json               # NEW: Arabic translations
│   └── theme/
│       ├── types.ts                  # NEW: Theme types
│       ├── schema.ts                 # NEW: Zod validation
│       ├── theme.store.ts            # NEW: Zustand store
│       ├── apply-theme.ts            # NEW: Apply theme utility
│       ├── theme.service.ts          # NEW: Backend service
│       └── default-theme.ts          # NEW: Default theme
├── middleware.ts                     # NEW: i18n middleware
└── components/
    ├── layout/                       # Updated for RTL
    └── shared/
        └── language-switcher.tsx     # NEW
```

---

## Implementation Order

1. Fix TypeScript and ESLint errors
2. Setup i18n infrastructure
3. Create translation files
4. Migrate pages to [locale] structure
5. Implement theme system
6. Add theme manager UI
7. Polish dashboard layouts
8. Add preferences page
9. Final testing and documentation
