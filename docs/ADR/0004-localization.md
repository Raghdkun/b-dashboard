# ADR 0004: Localization Strategy

**Status:** Accepted  
**Date:** 2026-01-13  
**Decision Makers:** Development Team

## Context

The dashboard requires internationalization (i18n) support for English (en) and Arabic (ar) with full RTL support for Arabic. We need to choose an i18n approach that works well with Next.js App Router.

## Decision Drivers

- Next.js 16 App Router compatibility
- Server Component support
- Type safety
- RTL layout support
- Locale persistence (localStorage + cookies)
- SEO-friendly locale routing
- Developer experience

## Considered Options

### Option 1: next-intl (Recommended)
**Pros:**
- First-class App Router support with RSC
- Built-in middleware for locale detection
- Type-safe message keys
- Excellent documentation
- Supports both server and client components
- Already installed in the project

**Cons:**
- Additional bundle size
- Learning curve for advanced features

### Option 2: next-i18next
**Pros:**
- Mature ecosystem
- Large community

**Cons:**
- Primarily designed for Pages Router
- App Router support is experimental
- Requires additional configuration

### Option 3: Lightweight dictionary approach
**Pros:**
- Zero dependencies
- Full control

**Cons:**
- Must implement everything manually
- No type safety without extra work
- No middleware integration

## Decision

**Chosen Option: next-intl**

next-intl is already installed and configured in the project. It provides:
- Native App Router support
- Built-in middleware for locale routing
- Type-safe translations with TypeScript
- Server Component optimization
- Easy locale switching

## Routing Strategy

We will use **locale prefix routing**: `/en/...` and `/ar/...`

**Rationale:**
- SEO-friendly (search engines index each locale separately)
- Clear URL structure
- Works with middleware for automatic detection
- Allows bookmarking locale-specific pages

### URL Structure
```
/en/dashboard          → English dashboard
/ar/dashboard          → Arabic dashboard
/en/auth/login         → English login
/ar/auth/login         → Arabic login
```

### Locale Detection Order
1. URL path prefix (if present)
2. Cookie `NEXT_LOCALE` (user preference)
3. Accept-Language header
4. Default locale (`en`)

## RTL Implementation

### HTML Attributes
```tsx
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```

### CSS Strategy
- Use logical properties: `margin-inline-start`, `padding-inline-end`
- Use Tailwind's RTL utilities: `rtl:`, `ltr:` variants
- Flip icons when needed using CSS transforms

### Component Adaptations
- Sidebar: Flip chevron icons, adjust padding
- Breadcrumbs: Reverse separator direction
- Forms: Align labels correctly

## File Structure

```
lib/
└── i18n/
    ├── config.ts           # Locale configuration
    ├── request.ts          # next-intl request config
    └── locales/
        ├── en.json         # English translations
        └── ar.json         # Arabic translations

app/
└── [locale]/
    ├── layout.tsx          # Root layout with locale
    ├── (auth)/
    │   └── auth/
    │       └── login/
    └── (dashboard)/
        └── dashboard/
```

## Translation Keys Convention

```json
{
  "common": {
    "search": "Search...",
    "logout": "Log out",
    "profile": "Profile"
  },
  "nav": {
    "dashboard": "Dashboard",
    "users": "Users",
    "settings": "Settings"
  },
  "settings": {
    "title": "Settings",
    "tabs": {
      "profile": "Profile",
      "account": "Account",
      "appearance": "Appearance",
      "preferences": "Preferences",
      "themes": "Themes"
    }
  }
}
```

## Consequences

### Positive
- Full i18n support with minimal code changes
- Type-safe translations
- SEO benefits from locale-prefixed URLs
- Proper RTL support for Arabic

### Negative
- URL structure changes (migration needed)
- All strings must use `t()` function
- Testing complexity increases

### Risks
- Performance impact from locale loading
- Mitigation: Use server components for static content

## Implementation Tasks

1. Create `i18n/request.ts` configuration
2. Create middleware.ts for locale routing
3. Create translation JSON files
4. Migrate pages to `[locale]` structure
5. Update all hardcoded strings to use `t()`
6. Add RTL support to layout components
7. Create language switcher component
8. Add preferences page with language selection
