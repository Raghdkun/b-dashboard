/**
 * Security Configuration
 * Central configuration for all security settings
 */

import type { SecurityConfig, ContentSecurityPolicy } from "./types";

// Environment-based configuration
const isDev = process.env.NODE_ENV === "development";

export const securityConfig: SecurityConfig = {
  csrfEnabled: true,
  csrfTokenExpiry: 1000 * 60 * 60, // 1 hour
  sanitizeInputs: true,
  logSecurityEvents: true,
  allowedOrigins: [
    "http://localhost:3000",
    "https://localhost:3000",
    "https://b-dashboard-five.vercel.app/",
    process.env.NEXT_PUBLIC_APP_URL || "",
  ].filter(Boolean),
  maxRequestSize: 1024 * 1024, // 1MB
  rateLimiting: {
    enabled: !isDev,
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
};

// Content Security Policy configuration
export const cspConfig: ContentSecurityPolicy = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    // Allow inline scripts for Next.js (required)
    "'unsafe-inline'",
    // For development only
    ...(isDev ? ["'unsafe-eval'"] : []),
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind and styled-jsx
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https:", // Allow HTTPS images
  ],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    process.env.NEXT_PUBLIC_API_URL || "",
    // WebSocket for HMR in development
    ...(isDev ? ["ws://localhost:3000", "wss://localhost:3000"] : []),
  ].filter(Boolean),
  "frame-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
  "upgrade-insecure-requests": !isDev,
};

// Security headers configuration
export const securityHeaders = {
  // Prevent clickjacking
  "X-Frame-Options": "SAMEORIGIN",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Enable XSS filter
  "X-XSS-Protection": "1; mode=block",
  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Restrict browser features
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
  ].join(", "),
  // HSTS - only in production
  ...(!isDev && {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  }),
};

// Build CSP header string
export function buildCSPHeader(): string {
  const directives: string[] = [];

  for (const [directive, values] of Object.entries(cspConfig)) {
    if (directive === "upgrade-insecure-requests") {
      if (values) {
        directives.push(directive);
      }
    } else if (Array.isArray(values) && values.length > 0) {
      directives.push(`${directive} ${values.join(" ")}`);
    }
  }

  return directives.join("; ");
}

// Get all security headers as an object
export function getSecurityHeaders(): Record<string, string> {
  return {
    ...securityHeaders,
    "Content-Security-Policy": buildCSPHeader(),
  };
}
