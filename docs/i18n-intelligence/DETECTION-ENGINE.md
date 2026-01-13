# Multilingual Content Intelligence System
## Detection & Analysis Engine

**Version:** 1.0.0  
**Date:** 2026-01-13  
**Status:** Draft

---

## Overview

The Detection Engine is responsible for:
1. Intercepting next-intl translation calls
2. Detecting missing keys without crashing the UI
3. Tracking fallback usage
4. Identifying hardcoded strings
5. Validating RTL layouts
6. Scoring issue severity

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DETECTION ENGINE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    INTERCEPTORS                                │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │  │
│  │  │ useTransla- │ │ getTransla- │ │   t()       │              │  │
│  │  │ tions Hook  │ │ tions (RSC) │ │  Function   │              │  │
│  │  │  Wrapper    │ │   Wrapper   │ │   Proxy     │              │  │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘              │  │
│  │         │               │               │                      │  │
│  │         └───────────────┴───────────────┘                      │  │
│  │                         │                                       │  │
│  │                         ▼                                       │  │
│  │  ┌─────────────────────────────────────────────────────────┐   │  │
│  │  │                 EVENT COLLECTOR                          │   │  │
│  │  │  - Batches events                                        │   │  │
│  │  │  - Extracts location context                             │   │  │
│  │  │  - Deduplicates                                          │   │  │
│  │  └─────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     ANALYZERS                                  │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │  │
│  │  │  Missing    │ │  Hardcoded  │ │    RTL      │              │  │
│  │  │   Key       │ │   String    │ │   Layout    │              │  │
│  │  │  Analyzer   │ │   Analyzer  │ │   Analyzer  │              │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘              │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │  │
│  │  │  Fallback   │ │  Overflow   │ │  Severity   │              │  │
│  │  │   Usage     │ │   Text      │ │   Scorer    │              │  │
│  │  │  Analyzer   │ │   Analyzer  │ │             │              │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   ISSUE GENERATOR                              │  │
│  │  - Creates issue records                                       │  │
│  │  - Deduplicates existing issues                                │  │
│  │  - Updates occurrence counts                                   │  │
│  │  - Triggers notifications                                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Intercepting next-intl

### Safe Missing Key Detection

The key challenge is detecting missing translations **without crashing the UI**. next-intl has a built-in `onError` handler we can leverage.

```typescript
// lib/i18n-intelligence/interceptors/intl-config.ts

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { translationCollector } from '../collector';

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  if (!['en', 'ar'].includes(locale)) notFound();

  // Load messages
  const messages = (await import(`@/lib/i18n/locales/${locale}.json`)).default;

  return {
    messages,
    
    // Custom error handler - this is the key!
    onError(error) {
      // Don't crash, just collect the error
      if (error.code === 'MISSING_MESSAGE') {
        translationCollector.recordMissing({
          key: error.key,
          namespace: error.namespace,
          locale,
          timestamp: Date.now(),
        });
      }
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] ${error.code}: ${error.key}`);
      }
    },
    
    // Return fallback instead of throwing
    getMessageFallback({ namespace, key, error }) {
      // Record fallback usage
      translationCollector.recordFallback({
        key,
        namespace,
        locale,
        fallbackValue: `${namespace}.${key}`, // Show key as fallback
        timestamp: Date.now(),
      });
      
      // Return the key itself as a visible indicator
      if (process.env.NODE_ENV === 'development') {
        return `⚠️ ${namespace}.${key}`;
      }
      
      // In production, try to return English fallback
      return getEnglishFallback(namespace, key) || key;
    },
  };
});

async function getEnglishFallback(namespace: string, key: string): string | null {
  try {
    const enMessages = (await import('@/lib/i18n/locales/en.json')).default;
    const ns = enMessages[namespace];
    if (ns && typeof ns === 'object' && key in ns) {
      return ns[key];
    }
  } catch {
    // Ignore
  }
  return null;
}
```

### Wrapping useTranslations Hook

To capture location context, we wrap the hook:

```typescript
// lib/i18n-intelligence/interceptors/use-translations-wrapper.tsx
"use client";

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useCallback, useRef, useEffect } from 'react';
import { useTranslationIntelligenceStore } from '../store';

type TranslationFunction = ReturnType<typeof useNextIntlTranslations>;

export function useTranslationsWithTracking(namespace: string): TranslationFunction {
  const originalT = useNextIntlTranslations(namespace);
  const pathname = usePathname();
  const { trackUsage, config } = useTranslationIntelligenceStore();
  const componentRef = useRef<string | null>(null);

  // Try to capture component name from React DevTools
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // This is a hack to get component name - works in dev only
      const stack = new Error().stack;
      const match = stack?.match(/at (\w+) \(/);
      if (match) {
        componentRef.current = match[1];
      }
    }
  }, []);

  // Wrapped translation function
  const wrappedT = useCallback(
    (key: string, values?: Record<string, unknown>) => {
      const result = originalT(key, values);
      
      // Track usage if enabled
      if (config.enabled) {
        // Sample in production
        if (config.productionMode && Math.random() > config.sampleRate) {
          return result;
        }

        trackUsage({
          key,
          namespace,
          fullKey: `${namespace}.${key}`,
          locale: 'en', // Will be filled by context
          usedFallback: result.startsWith('⚠️'),
          resolvedValue: result,
          location: {
            route: pathname,
            componentName: componentRef.current || 'Unknown',
          },
          componentType: inferComponentType(key),
        });
      }

      return result;
    },
    [originalT, namespace, pathname, trackUsage, config]
  );

  // Return a proxy that intercepts all property access
  return new Proxy(wrappedT, {
    apply(target, thisArg, args) {
      return target.apply(thisArg, args as [string, Record<string, unknown>?]);
    },
    get(target, prop) {
      // Handle nested namespaces and other properties
      if (typeof prop === 'string' && prop !== 'raw') {
        return (values?: Record<string, unknown>) => wrappedT(prop, values);
      }
      return Reflect.get(target, prop);
    },
  }) as TranslationFunction;
}

/**
 * Infer component type from key naming conventions
 */
function inferComponentType(key: string): ComponentType {
  const keyLower = key.toLowerCase();
  
  if (keyLower.includes('button') || keyLower.includes('submit') || keyLower.includes('action')) {
    return 'button';
  }
  if (keyLower.includes('title') || keyLower.includes('heading')) {
    return 'heading';
  }
  if (keyLower.includes('label')) {
    return 'label';
  }
  if (keyLower.includes('tooltip') || keyLower.includes('hint')) {
    return 'tooltip';
  }
  if (keyLower.includes('placeholder')) {
    return 'placeholder';
  }
  if (keyLower.includes('error')) {
    return 'error-message';
  }
  if (keyLower.includes('success')) {
    return 'success-message';
  }
  if (keyLower.includes('column') || keyLower.includes('header')) {
    return 'table-header';
  }
  
  return 'unknown';
}
```

### Re-exporting for Easy Migration

```typescript
// lib/i18n-intelligence/index.ts

// Re-export wrapped hook with same name for easy migration
export { useTranslationsWithTracking as useTranslations } from './interceptors/use-translations-wrapper';

// Export original for cases where tracking isn't needed
export { useTranslations as useTranslationsOriginal } from 'next-intl';

// Export store and types
export * from './store';
export * from './types';
```

---

## 2. Missing Key Detection

```typescript
// lib/i18n-intelligence/analyzers/missing-key-analyzer.ts

import type { MissingTranslationIssue, SupportedLocale } from '../types';
import { loadLocaleMessages } from '../utils/locale-loader';

interface MissingKeyResult {
  key: string;
  namespace: string;
  missingIn: SupportedLocale[];
  existsIn: SupportedLocale[];
  fallbackValue?: string;
}

/**
 * Analyzes locale files to find missing keys
 */
export async function analyzeMissingKeys(): Promise<MissingKeyResult[]> {
  const locales: SupportedLocale[] = ['en', 'ar'];
  const allMessages: Record<SupportedLocale, Record<string, unknown>> = {
    en: {},
    ar: {},
  };

  // Load all locale files
  for (const locale of locales) {
    allMessages[locale] = await loadLocaleMessages(locale);
  }

  // Get all unique keys from all locales
  const allKeys = new Set<string>();
  for (const locale of locales) {
    collectKeys(allMessages[locale], '', allKeys);
  }

  // Check each key in each locale
  const results: MissingKeyResult[] = [];

  for (const fullKey of allKeys) {
    const existsIn: SupportedLocale[] = [];
    const missingIn: SupportedLocale[] = [];

    for (const locale of locales) {
      if (hasKey(allMessages[locale], fullKey)) {
        existsIn.push(locale);
      } else {
        missingIn.push(locale);
      }
    }

    // Only report if missing in at least one locale but exists in another
    if (missingIn.length > 0 && existsIn.length > 0) {
      const [namespace, ...keyParts] = fullKey.split('.');
      results.push({
        key: keyParts.join('.'),
        namespace,
        missingIn,
        existsIn,
        fallbackValue: getKeyValue(allMessages.en, fullKey) as string,
      });
    }
  }

  return results;
}

/**
 * Recursively collect all keys from a nested object
 */
function collectKeys(
  obj: Record<string, unknown>,
  prefix: string,
  keys: Set<string>
): void {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      collectKeys(value as Record<string, unknown>, fullKey, keys);
    } else {
      keys.add(fullKey);
    }
  }
}

/**
 * Check if a nested key exists
 */
function hasKey(obj: Record<string, unknown>, path: string): boolean {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || typeof current !== 'object') {
      return false;
    }
    if (!(part in (current as Record<string, unknown>))) {
      return false;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current !== undefined;
}

/**
 * Get value at nested path
 */
function getKeyValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}
```

---

## 3. Hardcoded String Detection

### Static Analysis (Build-time)

```typescript
// lib/i18n-intelligence/analyzers/hardcoded-string-analyzer.ts

import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

interface HardcodedStringResult {
  string: string;
  file: string;
  line: number;
  column: number;
  context: string;
  wordCount: number;
  suggestedKey: string;
  likelyBrandName: boolean;
}

// Patterns to exclude (not hardcoded strings we care about)
const EXCLUDE_PATTERNS = [
  /^[A-Z_]+$/, // Constants like "API_URL"
  /^\d+$/, // Pure numbers
  /^#[0-9a-fA-F]{3,8}$/, // Hex colors
  /^https?:\/\//, // URLs
  /^\//, // Paths
  /^\.[a-z]+$/, // File extensions
  /^[a-z]{2}(-[A-Z]{2})?$/, // Locale codes
  /^(true|false|null|undefined)$/, // Boolean/null strings
];

// Brand names and technical terms to flag as low confidence
const BRAND_PATTERNS = [
  /^(Google|Facebook|Twitter|GitHub|Microsoft|Apple|Amazon)/i,
  /^(React|Next|Node|TypeScript|JavaScript|CSS|HTML)/i,
  /^(B-Dashboard|Dashboard)/i,
];

/**
 * Analyze a TypeScript/JavaScript file for hardcoded strings
 */
export async function analyzeFile(filePath: string): Promise<HardcodedStringResult[]> {
  const results: HardcodedStringResult[] = [];
  const code = await fs.promises.readFile(filePath, 'utf-8');
  
  // Skip non-component files
  if (!shouldAnalyzeFile(filePath)) {
    return results;
  }

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      // Check JSX text content
      JSXText(path) {
        const text = path.node.value.trim();
        if (isHardcodedCandidate(text)) {
          results.push(createResult(text, filePath, path.node.loc, code));
        }
      },

      // Check string literals in JSX attributes
      JSXAttribute(path) {
        const value = path.node.value;
        if (value?.type === 'StringLiteral') {
          const text = value.value;
          // Skip common non-translatable attributes
          const attrName = path.node.name.name;
          if (!['className', 'id', 'href', 'src', 'type', 'name', 'key'].includes(String(attrName))) {
            if (isHardcodedCandidate(text)) {
              results.push(createResult(text, filePath, value.loc, code));
            }
          }
        }
      },

      // Check template literals
      TemplateLiteral(path) {
        // Only flag if it has no expressions and looks like user-facing text
        if (path.node.expressions.length === 0) {
          const text = path.node.quasis[0]?.value.cooked || '';
          if (isHardcodedCandidate(text)) {
            results.push(createResult(text, filePath, path.node.loc, code));
          }
        }
      },
    });
  } catch (error) {
    console.error(`Failed to parse ${filePath}:`, error);
  }

  return results;
}

function shouldAnalyzeFile(filePath: string): boolean {
  // Only analyze component files
  return (
    filePath.includes('/components/') ||
    filePath.includes('/app/') ||
    filePath.includes('/pages/')
  ) && (
    filePath.endsWith('.tsx') ||
    filePath.endsWith('.jsx')
  ) && !filePath.includes('.test.') && !filePath.includes('.spec.');
}

function isHardcodedCandidate(text: string): boolean {
  const trimmed = text.trim();
  
  // Must have at least 3 words or 15 characters
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount < 3 && trimmed.length < 15) {
    return false;
  }

  // Check exclusion patterns
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return false;
  }

  return true;
}

function createResult(
  text: string,
  file: string,
  loc: { start: { line: number; column: number } } | null | undefined,
  code: string
): HardcodedStringResult {
  const line = loc?.start.line || 0;
  const column = loc?.start.column || 0;
  
  // Get surrounding context
  const lines = code.split('\n');
  const contextStart = Math.max(0, line - 2);
  const contextEnd = Math.min(lines.length, line + 1);
  const context = lines.slice(contextStart, contextEnd).join('\n');

  // Check if likely brand name
  const likelyBrandName = BRAND_PATTERNS.some(p => p.test(text));

  // Generate suggested key
  const suggestedKey = generateKeyFromText(text);

  return {
    string: text,
    file,
    line,
    column,
    context,
    wordCount: text.split(/\s+/).length,
    suggestedKey,
    likelyBrandName,
  };
}

function generateKeyFromText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 4)
    .join('_')
    .substring(0, 30);
}

/**
 * Analyze entire project for hardcoded strings
 */
export async function analyzeProject(projectRoot: string): Promise<HardcodedStringResult[]> {
  const results: HardcodedStringResult[] = [];
  const files = await findTsxFiles(projectRoot);

  for (const file of files) {
    const fileResults = await analyzeFile(file);
    results.push(...fileResults);
  }

  return results;
}

async function findTsxFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules and hidden directories
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await findTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }

  return files;
}
```

### Runtime Detection

```typescript
// lib/i18n-intelligence/analyzers/runtime-hardcoded-detector.ts

/**
 * Client-side detection using MutationObserver
 * Watches for text nodes that don't have translation markers
 */
export function createHardcodedDetector() {
  if (typeof window === 'undefined') return null;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            checkTextNode(node as Text);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            checkElementText(node as Element);
          }
        }
      }
    }
  });

  return {
    start() {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    },
    stop() {
      observer.disconnect();
    },
  };
}

function checkTextNode(node: Text) {
  const text = node.textContent?.trim();
  if (!text) return;

  // Skip if parent has data-i18n marker (from our wrapper)
  if (node.parentElement?.hasAttribute('data-i18n-key')) {
    return;
  }

  // Check if it looks like hardcoded user-facing text
  if (isLikelyHardcoded(text)) {
    reportHardcodedString({
      text,
      element: node.parentElement,
      route: window.location.pathname,
    });
  }
}

function checkElementText(element: Element) {
  // Skip certain elements
  if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName)) {
    return;
  }

  // Check direct text content
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      checkTextNode(child as Text);
    }
  }
}

function isLikelyHardcoded(text: string): boolean {
  // At least 3 words
  if (text.split(/\s+/).length < 3) return false;
  
  // Contains letters
  if (!/[a-zA-Z]/.test(text)) return false;
  
  // Not a number or code-like string
  if (/^[\d\s.,;:!?-]+$/.test(text)) return false;
  
  return true;
}

function reportHardcodedString(info: {
  text: string;
  element: Element | null;
  route: string;
}) {
  // Send to store
  console.warn('[i18n-intelligence] Hardcoded string detected:', info);
  // useTranslationIntelligenceStore.getState().reportHardcoded(info);
}
```

---

## 4. RTL Layout Validation

```typescript
// lib/i18n-intelligence/analyzers/rtl-analyzer.ts

interface RTLIssue {
  type: 'alignment' | 'direction' | 'overflow' | 'icon-position';
  element: Element;
  cssProperty?: string;
  currentValue?: string;
  expectedValue?: string;
  selector: string;
}

/**
 * Analyze current page for RTL issues
 */
export function analyzeRTLLayout(): RTLIssue[] {
  const issues: RTLIssue[] = [];
  const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';

  if (!isRTL) {
    // Can't analyze RTL issues in LTR mode
    return issues;
  }

  // Check all visible elements
  const elements = document.querySelectorAll('*');

  for (const element of elements) {
    const style = window.getComputedStyle(element);

    // Check for hardcoded left/right margins and paddings
    checkDirectionalStyles(element, style, issues);

    // Check for hardcoded text alignment
    checkTextAlignment(element, style, issues);

    // Check for icon positioning
    checkIconPosition(element, style, issues);

    // Check for overflow
    checkOverflow(element, style, issues);
  }

  return issues;
}

function checkDirectionalStyles(
  element: Element,
  style: CSSStyleDeclaration,
  issues: RTLIssue[]
) {
  // These properties should use logical equivalents
  const problematicProps = [
    { physical: 'margin-left', logical: 'margin-inline-start' },
    { physical: 'margin-right', logical: 'margin-inline-end' },
    { physical: 'padding-left', logical: 'padding-inline-start' },
    { physical: 'padding-right', logical: 'padding-inline-end' },
    { physical: 'left', logical: 'inset-inline-start' },
    { physical: 'right', logical: 'inset-inline-end' },
  ];

  for (const { physical, logical } of problematicProps) {
    const value = style.getPropertyValue(physical);
    if (value && value !== '0px' && value !== 'auto') {
      // Check if the logical property is also set (which is fine)
      const logicalValue = style.getPropertyValue(logical);
      if (!logicalValue || logicalValue === 'auto') {
        issues.push({
          type: 'alignment',
          element,
          cssProperty: physical,
          currentValue: value,
          expectedValue: `Use ${logical} instead`,
          selector: getSelector(element),
        });
      }
    }
  }
}

function checkTextAlignment(
  element: Element,
  style: CSSStyleDeclaration,
  issues: RTLIssue[]
) {
  const textAlign = style.getPropertyValue('text-align');
  
  // left/right should be start/end in RTL context
  if (textAlign === 'left' || textAlign === 'right') {
    issues.push({
      type: 'direction',
      element,
      cssProperty: 'text-align',
      currentValue: textAlign,
      expectedValue: textAlign === 'left' ? 'start' : 'end',
      selector: getSelector(element),
    });
  }
}

function checkIconPosition(
  element: Element,
  style: CSSStyleDeclaration,
  issues: RTLIssue[]
) {
  // Check if element is an icon next to text
  if (element.tagName === 'SVG' || element.classList.contains('icon')) {
    const parent = element.parentElement;
    if (!parent) return;

    const flexDirection = window.getComputedStyle(parent).flexDirection;
    
    // In RTL, icons should typically be on the right
    // But if flex-direction isn't reversed, they might be wrong
    if (flexDirection === 'row') {
      const elementRect = element.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      
      // Icon is on the left side - might need to be on the right
      if (elementRect.left - parentRect.left < parentRect.right - elementRect.right) {
        issues.push({
          type: 'icon-position',
          element,
          expectedValue: 'Icon should be on the right side in RTL',
          selector: getSelector(element),
        });
      }
    }
  }
}

function checkOverflow(
  element: Element,
  style: CSSStyleDeclaration,
  issues: RTLIssue[]
) {
  // Check if text is overflowing its container
  if (element.scrollWidth > element.clientWidth) {
    const overflow = style.getPropertyValue('overflow');
    const textOverflow = style.getPropertyValue('text-overflow');
    
    if (overflow !== 'hidden' && textOverflow !== 'ellipsis') {
      issues.push({
        type: 'overflow',
        element,
        currentValue: `${element.scrollWidth}px (container: ${element.clientWidth}px)`,
        expectedValue: 'Consider adding overflow handling',
        selector: getSelector(element),
      });
    }
  }
}

/**
 * Generate a CSS selector for an element
 */
function getSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const classes = Array.from(element.classList).slice(0, 2).join('.');
  if (classes) {
    return `${element.tagName.toLowerCase()}.${classes}`;
  }

  return element.tagName.toLowerCase();
}

/**
 * Compare LTR and RTL screenshots for visual diff
 */
export async function captureVisualDiff(route: string): Promise<{
  ltr: string;
  rtl: string;
}> {
  // This would use a headless browser in CI/CD
  // For client-side, we can use html2canvas
  
  // Placeholder - actual implementation would use Puppeteer or Playwright
  return {
    ltr: '',
    rtl: '',
  };
}
```

---

## 5. Severity Scoring

```typescript
// lib/i18n-intelligence/analyzers/severity-scorer.ts

import type { 
  TranslationIssue, 
  IssueSeverity, 
  ComponentType,
  TranslationLocation 
} from '../types';

interface ScoringFactors {
  routeImportance: number;      // 0-30
  componentImportance: number;  // 0-30
  usageFrequency: number;       // 0-20
  localeCoverage: number;       // 0-20
}

/**
 * Calculate severity score for an issue
 */
export function calculateSeverity(
  issue: Partial<TranslationIssue>,
  renderCount: number = 0
): { score: number; severity: IssueSeverity; factors: ScoringFactors } {
  const factors: ScoringFactors = {
    routeImportance: calculateRouteImportance(issue.location?.route || ''),
    componentImportance: calculateComponentImportance(issue.componentType as ComponentType),
    usageFrequency: calculateUsageFrequency(renderCount),
    localeCoverage: calculateLocaleCoverage(issue),
  };

  const score = Math.min(100,
    factors.routeImportance +
    factors.componentImportance +
    factors.usageFrequency +
    factors.localeCoverage
  );

  const severity = scoreToSeverity(score);

  return { score, severity, factors };
}

function calculateRouteImportance(route: string): number {
  // Core routes are most important
  if (route === '/dashboard' || route === '/') return 30;
  if (route.includes('/auth/login') || route.includes('/auth/register')) return 28;
  if (route.includes('/dashboard/users')) return 25;
  if (route.includes('/dashboard/settings')) return 20;
  if (route.includes('/dashboard/')) return 15;
  return 10;
}

function calculateComponentImportance(componentType: ComponentType): number {
  const scores: Record<ComponentType, number> = {
    'button': 30,
    'error-message': 30,
    'heading': 25,
    'label': 25,
    'link': 23,
    'menu-item': 22,
    'table-header': 20,
    'widget-title': 20,
    'success-message': 18,
    'paragraph': 15,
    'badge': 12,
    'table-cell': 12,
    'widget-content': 12,
    'placeholder': 10,
    'tooltip': 8,
    'unknown': 10,
  };

  return scores[componentType] || 10;
}

function calculateUsageFrequency(renderCount: number): number {
  if (renderCount > 10000) return 20;
  if (renderCount > 1000) return 15;
  if (renderCount > 100) return 10;
  if (renderCount > 10) return 5;
  return 2;
}

function calculateLocaleCoverage(issue: Partial<TranslationIssue>): number {
  if (issue.type === 'missing') {
    const missing = (issue as any).missingInLocales?.length || 0;
    return Math.min(20, missing * 10);
  }
  return 10;
}

function scoreToSeverity(score: number): IssueSeverity {
  if (score >= 75) return 'blocker';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

/**
 * Route importance configuration (can be customized)
 */
export const ROUTE_IMPORTANCE: Record<string, number> = {
  '/': 100,
  '/dashboard': 100,
  '/auth/login': 95,
  '/auth/register': 90,
  '/dashboard/users': 80,
  '/dashboard/settings': 70,
  '/dashboard/settings/profile': 65,
  '/dashboard/settings/themes': 50,
};

/**
 * Update route importance (for customization)
 */
export function setRouteImportance(route: string, importance: number): void {
  ROUTE_IMPORTANCE[route] = importance;
}
```

---

## 6. Event Collector

```typescript
// lib/i18n-intelligence/collector/event-collector.ts

import type { TranslationUsageEvent } from '../types';

interface CollectorConfig {
  batchInterval: number;  // ms between batch sends
  maxBatchSize: number;   // max events per batch
  sampleRate: number;     // 0-1, for production
}

class TranslationEventCollector {
  private queue: Omit<TranslationUsageEvent, 'id' | 'timestamp'>[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private config: CollectorConfig;
  private onBatch: (events: TranslationUsageEvent[]) => void;

  constructor(
    config: Partial<CollectorConfig> = {},
    onBatch: (events: TranslationUsageEvent[]) => void
  ) {
    this.config = {
      batchInterval: 100,
      maxBatchSize: 50,
      sampleRate: 1,
      ...config,
    };
    this.onBatch = onBatch;
  }

  /**
   * Add an event to the queue
   */
  collect(event: Omit<TranslationUsageEvent, 'id' | 'timestamp'>): void {
    // Sample in production
    if (this.config.sampleRate < 1 && Math.random() > this.config.sampleRate) {
      return;
    }

    this.queue.push(event);

    // Flush if batch is full
    if (this.queue.length >= this.config.maxBatchSize) {
      this.flush();
      return;
    }

    // Schedule batch flush
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.flush();
      }, this.config.batchInterval);
    }
  }

  /**
   * Flush queued events
   */
  flush(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.queue.length === 0) return;

    // Create full events with IDs and timestamps
    const events: TranslationUsageEvent[] = this.queue.map((event, index) => ({
      ...event,
      id: `${Date.now()}-${index}`,
      timestamp: Date.now(),
    }));

    // Clear queue
    this.queue = [];

    // Send batch
    this.onBatch(events);
  }

  /**
   * Record missing key
   */
  recordMissing(info: {
    key: string;
    namespace: string;
    locale: string;
    timestamp: number;
  }): void {
    // This is called from the server config
    // We need a way to communicate to the client store
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('i18n:missing', { detail: info }));
    }
  }

  /**
   * Record fallback usage
   */
  recordFallback(info: {
    key: string;
    namespace: string;
    locale: string;
    fallbackValue: string;
    timestamp: number;
  }): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('i18n:fallback', { detail: info }));
    }
  }
}

// Singleton instance
let collector: TranslationEventCollector | null = null;

export function getCollector(
  config?: Partial<CollectorConfig>,
  onBatch?: (events: TranslationUsageEvent[]) => void
): TranslationEventCollector {
  if (!collector && onBatch) {
    collector = new TranslationEventCollector(config, onBatch);
  }
  return collector!;
}

export { TranslationEventCollector };
```

---

## Implementation Checklist

### Phase 1: Core Detection (MVP)

- [ ] Implement `onError` and `getMessageFallback` in next-intl config
- [ ] Create `TranslationEventCollector` class
- [ ] Create `useTranslationsWithTracking` wrapper hook
- [ ] Set up Zustand store for issue tracking
- [ ] Implement `analyzeMissingKeys` for build-time check

### Phase 2: Enhanced Analysis

- [ ] Implement hardcoded string analyzer (static)
- [ ] Implement runtime hardcoded detector (MutationObserver)
- [ ] Implement RTL layout analyzer
- [ ] Implement severity scoring system
- [ ] Add health score calculation

### Phase 3: Developer Tools

- [ ] Create CLI command for full analysis
- [ ] Add ESLint plugin for hardcoded strings
- [ ] Create VS Code extension integration
- [ ] Add CI/CD integration hooks

---

## Next Steps

1. **Dashboard UI Design** → [DASHBOARD-UI.md](./DASHBOARD-UI.md)
2. **Implementation Tasks** → [TASKS.md](./TASKS.md)
