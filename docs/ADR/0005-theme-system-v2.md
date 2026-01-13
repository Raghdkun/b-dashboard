# ADR 0005: Theme System v2

**Status:** Accepted  
**Date:** 2026-01-13  
**Decision Makers:** Development Team

## Context

The current theme system only supports light/dark/system mode switching via next-themes. We need a more sophisticated theming architecture that supports:
- Multiple custom themes
- JSON-based theme import/export (AI-friendly workflow)
- Theme persistence and backend synchronization
- Runtime theme application without page reload

## Decision Drivers

- Extensibility for custom branded themes
- AI-friendly JSON import workflow
- Type safety and validation
- Avoid flash of unstyled content (FOUC)
- Backend-ready architecture
- Compatibility with shadcn/ui and Tailwind v4

## Decision

Implement a **Theme System v2** with the following architecture:

### Theme JSON Schema

```typescript
interface Theme {
  id: string;
  name: string;
  version: string;
  isDefault?: boolean;
  colors: {
    light: ColorTokens;
    dark: ColorTokens;
  };
  radius: RadiusScale;
  metadata?: {
    author?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

interface ColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  sidebar?: string;
  sidebarForeground?: string;
  sidebarPrimary?: string;
  sidebarPrimaryForeground?: string;
  sidebarAccent?: string;
  sidebarAccentForeground?: string;
  sidebarBorder?: string;
  sidebarRing?: string;
}

interface RadiusScale {
  base: string;  // --radius value
}
```

### Storage Strategy

**Layer 1: localStorage (Required)**
- `theme-storage`: Zustand persisted store with theme list
- `selected-theme-id`: Currently active theme ID
- Immediate access for FOUC prevention

**Layer 2: Zustand Store**
- Centralized theme state management
- Theme CRUD operations
- Selection and application logic

**Layer 3: Backend API (Future)**
- Service interfaces ready for backend sync
- Route handler stubs provided
- No immediate backend implementation required

### Theme Application Method

```typescript
function applyTheme(theme: Theme, mode: 'light' | 'dark') {
  const root = document.documentElement;
  const colors = theme.colors[mode];
  
  // Apply color tokens
  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = `--${camelToKebab(key)}`;
    root.style.setProperty(cssVar, value);
  });
  
  // Apply radius
  root.style.setProperty('--radius', theme.radius.base);
}
```

### FOUC Prevention

Use inline script in root layout:
```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          const stored = localStorage.getItem('theme-storage');
          if (stored) {
            const { state } = JSON.parse(stored);
            const theme = state.themes.find(t => t.id === state.selectedThemeId);
            if (theme) {
              // Apply minimal critical CSS variables
              const mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
              const colors = theme.colors[mode];
              const root = document.documentElement.style;
              root.setProperty('--background', colors.background);
              root.setProperty('--foreground', colors.foreground);
              // ... other critical tokens
            }
          }
        } catch (e) {}
      })();
    `,
  }}
/>
```

## File Structure

```
lib/
└── theme/
    ├── schema.ts           # Zod schemas for validation
    ├── types.ts            # TypeScript interfaces
    ├── theme.store.ts      # Zustand store
    ├── apply-theme.ts      # Theme application utility
    ├── theme.service.ts    # Backend-ready service
    └── default-theme.ts    # Default theme definition

app/
├── api/
│   └── themes/
│       ├── route.ts        # GET (list), POST (create)
│       └── [id]/
│           └── route.ts    # GET, PUT, DELETE by ID
└── [locale]/
    └── (dashboard)/
        └── dashboard/
            └── settings/
                └── themes/
                    └── page.tsx  # Theme manager UI
```

## API Design (Backend-Ready)

### Endpoints
```
GET    /api/themes          - List all themes
POST   /api/themes          - Create new theme
GET    /api/themes/:id      - Get theme by ID
PUT    /api/themes/:id      - Update theme
DELETE /api/themes/:id      - Delete theme
```

### Service Interface
```typescript
interface ThemeService {
  getThemes(): Promise<Theme[]>;
  getTheme(id: string): Promise<Theme>;
  createTheme(theme: Omit<Theme, 'id'>): Promise<Theme>;
  updateTheme(id: string, updates: Partial<Theme>): Promise<Theme>;
  deleteTheme(id: string): Promise<void>;
  syncFromBackend(): Promise<void>;
  syncToBackend(theme: Theme): Promise<void>;
}
```

## Theme Manager UI Features

1. **Theme List**
   - Display all available themes
   - Visual preview swatch
   - Select active theme
   - Delete custom themes (cannot delete default)

2. **Import Theme**
   - Textarea for JSON paste
   - Validation with error feedback
   - Preview before save
   - Name conflict handling

3. **Export Theme**
   - Copy current theme as JSON
   - Download as .json file

4. **Reset to Default**
   - One-click restore to default theme
   - Confirmation dialog

## Consequences

### Positive
- Full theme customization capability
- AI-friendly JSON workflow
- Type-safe with Zod validation
- Backend-ready architecture
- No FOUC with inline script

### Negative
- Increased complexity
- More localStorage usage
- Inline script adds to initial HTML

### Risks
- Large theme JSON could impact performance
- Mitigation: Validate and limit theme size

## Validation Rules

- Theme ID: UUID format
- Name: 1-50 characters
- Version: Semver format
- Colors: Valid CSS color values (oklch, hsl, rgb, hex)
- Radius: Valid CSS length value

## Migration Path

1. Create default theme from current CSS variables
2. Implement theme store with persistence
3. Add theme application utility
4. Create theme manager UI
5. Add API route stubs
6. Update documentation
