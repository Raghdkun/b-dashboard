/**
 * i18n Intelligence - ESLint Plugin for Hardcoded String Detection
 *
 * This plugin detects hardcoded strings in JSX that should use i18n
 */

import type { Rule } from "eslint";

// Using 'any' for ESTree JSX nodes as estree-jsx types require additional dependency
// The actual node structure is validated at runtime by ESLint
/* eslint-disable @typescript-eslint/no-explicit-any */
type ESTreeNode = any;
type JSXText = any;
type JSXElement = any;
type JSXAttribute = any;
type Literal = any;
type TemplateLiteral = any;
type JSXExpressionContainer = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

// =============================================================================
// Configuration
// =============================================================================

/**
 * Patterns to exclude from detection (safe strings)
 */
const EXCLUDE_PATTERNS = [
  // URLs and paths
  /^https?:\/\//,
  /^\/[a-z0-9\-_/]*$/i,
  /^mailto:/,
  /^tel:/,
  // Code identifiers
  /^[A-Z][A-Z0-9_]+$/, // CONSTANTS
  /^[a-z]+\.[a-z.]+$/i, // dot notation (e.g., common.save)
  // Technical strings
  /^#[0-9a-f]{3,8}$/i, // Colors
  /^\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms)?$/, // CSS values
  /^[a-z]+:\/\//, // URIs with scheme
  /^data:/, // Data URIs
  // Date formats
  /^(yyyy|MM|dd|HH|mm|ss|[\/\-:.\s])+$/,
  // Class names (Tailwind/CSS)
  /^[a-z0-9\-_\s]+$/i,
  // Single characters or numbers
  /^.$/,
  /^\d+$/,
  // Empty or whitespace only
  /^\s*$/,
  // JSON/code snippets
  /^\{.*\}$/,
  /^\[.*\]$/,
  // Icon names
  /^(lucide-|heroicons-|material-)/i,
];

/**
 * JSX attributes that typically contain technical values, not user-facing text
 */
const SAFE_ATTRIBUTES = new Set([
  // Accessibility
  "role",
  "aria-label", // Actually should be translated! Remove from safe
  "aria-describedby",
  "aria-labelledby",
  // IDs and names
  "id",
  "name",
  "htmlFor",
  "key",
  "testId",
  "data-testid",
  // Technical
  "className",
  "class",
  "style",
  "href",
  "src",
  "srcSet",
  "type",
  "rel",
  "target",
  "method",
  "action",
  "value", // Form values can be technical
  // Event handlers
  "onClick",
  "onSubmit",
  "onChange",
  "onFocus",
  "onBlur",
  // Size/layout
  "width",
  "height",
  "size",
  "variant",
  "color",
  "fill",
  "stroke",
  // Icons
  "icon",
  "iconName",
  // Data attributes (technical)
  "data-state",
  "data-orientation",
  "data-side",
  "data-align",
]);

/**
 * Attributes that SHOULD be translated (user-facing)
 */
const TRANSLATABLE_ATTRIBUTES = new Set([
  "alt",
  "title",
  "placeholder",
  "label",
  "description",
  "aria-label",
  "aria-description",
  "content",
  "message",
  "errorMessage",
  "helperText",
  "tooltip",
]);

/**
 * Component names that typically contain technical content
 */
const SAFE_COMPONENTS = new Set([
  "Script",
  "Head",
  "Style",
  "Code",
  "Pre",
  "code",
  "pre",
  "style",
  "script",
]);

/**
 * Minimum length for string to be considered translatable
 */
const MIN_STRING_LENGTH = 2;

// =============================================================================
// Helper Functions
// =============================================================================

function isExcludedString(text: string): boolean {
  const trimmed = text.trim();
  
  // Too short
  if (trimmed.length < MIN_STRING_LENGTH) {
    return true;
  }
  
  // Check against exclude patterns
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(trimmed));
}

function hasLetters(text: string): boolean {
  return /[a-zA-Z]/.test(text);
}

function looksLikeUserFacingText(text: string): boolean {
  const trimmed = text.trim();
  
  // Must have letters
  if (!hasLetters(trimmed)) {
    return false;
  }
  
  // Check if it looks like a sentence or phrase
  // Has spaces and words
  if (/\s/.test(trimmed) && /[a-zA-Z]{2,}/.test(trimmed)) {
    return true;
  }
  
  // Single word but capitalized like a label
  if (/^[A-Z][a-z]+/.test(trimmed)) {
    return true;
  }
  
  // Contains common UI words
  const uiWords = /\b(click|submit|save|cancel|edit|delete|add|remove|view|open|close|next|back|confirm|yes|no|ok|error|success|warning|info|loading|please|enter|select|choose)\b/i;
  if (uiWords.test(trimmed)) {
    return true;
  }
  
  return false;
}

function getParentComponentName(node: ESTreeNode, ancestors: ESTreeNode[]): string | null {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (ancestor.type === "JSXElement") {
      const jsxElement = ancestor as JSXElement;
      if (jsxElement.openingElement.name.type === "JSXIdentifier") {
        return jsxElement.openingElement.name.name;
      }
    }
  }
  return null;
}

function isInsideSafeComponent(ancestors: ESTreeNode[]): boolean {
  for (const ancestor of ancestors) {
    if (ancestor.type === "JSXElement") {
      const jsxElement = ancestor as JSXElement;
      if (jsxElement.openingElement.name.type === "JSXIdentifier") {
        const name = jsxElement.openingElement.name.name;
        if (SAFE_COMPONENTS.has(name)) {
          return true;
        }
      }
    }
  }
  return false;
}

function isInsideTranslationCall(ancestors: ESTreeNode[]): boolean {
  for (const ancestor of ancestors) {
    if (ancestor.type === "CallExpression") {
      const callee = (ancestor as any).callee;
      if (callee?.type === "Identifier") {
        const name = callee.name;
        // t() or useTranslations patterns
        if (name === "t" || name.includes("Translation") || name.includes("translate")) {
          return true;
        }
      }
    }
  }
  return false;
}

// =============================================================================
// ESLint Rule
// =============================================================================

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Detect hardcoded strings that should use i18n translations",
      category: "Best Practices",
      recommended: false,
    },
    fixable: undefined,
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          excludePatterns: {
            type: "array",
            items: { type: "string" },
          },
          safeAttributes: {
            type: "array",
            items: { type: "string" },
          },
          minLength: {
            type: "number",
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hardcodedString:
        'Hardcoded string "{{text}}" should use i18n translation. Consider using t("{{suggestedKey}}").',
      hardcodedAttribute:
        'Hardcoded string in "{{attribute}}" attribute should use i18n translation.',
    },
  },

  create(context: Rule.RuleContext) {
    const options = context.options[0] || {};
    const userExcludePatterns = (options.excludePatterns || []).map(
      (p: string) => new RegExp(p)
    );
    const userSafeAttributes = new Set(options.safeAttributes || []);
    const minLength = options.minLength || MIN_STRING_LENGTH;

    const allExcludePatterns = [...EXCLUDE_PATTERNS, ...userExcludePatterns];
    const allSafeAttributes = new Set([...SAFE_ATTRIBUTES, ...userSafeAttributes]);

    function shouldCheck(text: string): boolean {
      const trimmed = text.trim();
      if (trimmed.length < minLength) return false;
      if (!hasLetters(trimmed)) return false;
      if (allExcludePatterns.some((p) => p.test(trimmed))) return false;
      return looksLikeUserFacingText(trimmed);
    }

    function generateSuggestedKey(text: string): string {
      return text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/gi, "")
        .replace(/\s+/g, "_")
        .substring(0, 30);
    }

    return {
      // Check JSX text content
      JSXText(node: JSXText & Rule.NodeParentExtension) {
        const text = node.value;
        const ancestors = context.sourceCode.getAncestors(node);

        if (isInsideSafeComponent(ancestors as ESTreeNode[])) return;
        if (isInsideTranslationCall(ancestors as ESTreeNode[])) return;
        if (!shouldCheck(text)) return;

        context.report({
          node: node as unknown as ESTreeNode,
          messageId: "hardcodedString",
          data: {
            text: text.trim().substring(0, 50),
            suggestedKey: generateSuggestedKey(text),
          },
        });
      },

      // Check string literals in JSX attributes
      JSXAttribute(node: JSXAttribute & Rule.NodeParentExtension) {
        const attrName =
          node.name.type === "JSXIdentifier" ? node.name.name : null;
        if (!attrName) return;

        // Skip safe attributes unless they're translatable
        if (allSafeAttributes.has(attrName) && !TRANSLATABLE_ATTRIBUTES.has(attrName)) {
          return;
        }

        const value = node.value;
        if (!value) return;

        let textToCheck: string | null = null;

        if (value.type === "Literal" && typeof value.value === "string") {
          textToCheck = value.value;
        } else if (value.type === "JSXExpressionContainer") {
          const expr = value.expression;
          if (expr.type === "Literal" && typeof (expr as Literal).value === "string") {
            textToCheck = (expr as Literal).value as string;
          } else if (expr.type === "TemplateLiteral") {
            const tl = expr as TemplateLiteral;
            // Only check simple template literals without expressions
            if (tl.expressions.length === 0 && tl.quasis.length === 1) {
              textToCheck = tl.quasis[0].value.cooked || "";
            }
          }
        }

        if (!textToCheck) return;
        if (!shouldCheck(textToCheck)) return;

        // Extra check for translatable attributes - be more strict
        if (TRANSLATABLE_ATTRIBUTES.has(attrName)) {
          context.report({
            node: node as unknown as ESTreeNode,
            messageId: "hardcodedAttribute",
            data: {
              attribute: attrName,
            },
          });
        } else if (looksLikeUserFacingText(textToCheck)) {
          context.report({
            node: node as unknown as ESTreeNode,
            messageId: "hardcodedString",
            data: {
              text: textToCheck.substring(0, 50),
              suggestedKey: generateSuggestedKey(textToCheck),
            },
          });
        }
      },

      // Check string literals in JSX expression containers (children)
      "JSXExpressionContainer > Literal"(node: Literal & Rule.NodeParentExtension) {
        if (typeof node.value !== "string") return;
        
        const ancestors = context.sourceCode.getAncestors(node);
        if (isInsideSafeComponent(ancestors as ESTreeNode[])) return;
        if (isInsideTranslationCall(ancestors as ESTreeNode[])) return;
        if (!shouldCheck(node.value)) return;

        context.report({
          node: node as unknown as ESTreeNode,
          messageId: "hardcodedString",
          data: {
            text: node.value.substring(0, 50),
            suggestedKey: generateSuggestedKey(node.value),
          },
        });
      },

      // Check template literals in JSX
      "JSXExpressionContainer > TemplateLiteral"(node: TemplateLiteral & Rule.NodeParentExtension) {
        // Only check simple template literals
        if (node.expressions.length > 0) return;
        if (node.quasis.length !== 1) return;

        const text = node.quasis[0].value.cooked || "";
        const ancestors = context.sourceCode.getAncestors(node);
        
        if (isInsideSafeComponent(ancestors as ESTreeNode[])) return;
        if (isInsideTranslationCall(ancestors as ESTreeNode[])) return;
        if (!shouldCheck(text)) return;

        context.report({
          node: node as unknown as ESTreeNode,
          messageId: "hardcodedString",
          data: {
            text: text.substring(0, 50),
            suggestedKey: generateSuggestedKey(text),
          },
        });
      },
    };
  },
};

// =============================================================================
// Plugin Export
// =============================================================================

const plugin = {
  meta: {
    name: "@b-dashboard/eslint-plugin-i18n-intelligence",
    version: "1.0.0",
  },
  rules: {
    "no-hardcoded-strings": rule,
  },
  configs: {
    recommended: {
      plugins: ["@b-dashboard/i18n-intelligence"],
      rules: {
        "@b-dashboard/i18n-intelligence/no-hardcoded-strings": "warn",
      },
    },
    strict: {
      plugins: ["@b-dashboard/i18n-intelligence"],
      rules: {
        "@b-dashboard/i18n-intelligence/no-hardcoded-strings": "error",
      },
    },
  },
};

export default plugin;
export { rule as noHardcodedStrings };
