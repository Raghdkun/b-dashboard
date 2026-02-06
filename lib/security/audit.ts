/**
 * Security Audit
 * Runtime security auditing and monitoring
 */

import { securityConfig, cspConfig, securityHeaders } from "./config";
import type {
  SecurityCheck,
  SecurityAuditResult,
  SecurityEvent,
  SecurityEventType,
  SecurityLevel,
} from "./types";

// In-memory event log (in production, send to a logging service)
const securityEvents: SecurityEvent[] = [];
const MAX_EVENTS = 1000;

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Log a security event
 */
export function logSecurityEvent(
  type: SecurityEventType,
  level: SecurityLevel,
  message: string,
  details?: Record<string, unknown>
): void {
  if (!securityConfig.logSecurityEvents) return;

  const event: SecurityEvent = {
    id: generateId(),
    type,
    level,
    message,
    details,
    timestamp: Date.now(),
    source: typeof window !== "undefined" ? window.location.pathname : "server",
  };

  securityEvents.unshift(event);

  // Keep only recent events
  if (securityEvents.length > MAX_EVENTS) {
    securityEvents.pop();
  }

  // Console logging for development
  if (process.env.NODE_ENV === "development") {
    const logMethod =
      level === "critical" || level === "high"
        ? console.error
        : level === "medium"
          ? console.warn
          : console.info;

    logMethod(`[Security ${level.toUpperCase()}]`, message, details);
  }
}

/**
 * Get recent security events
 */
export function getSecurityEvents(limit = 50): SecurityEvent[] {
  return securityEvents.slice(0, limit);
}

/**
 * Clear security events
 */
export function clearSecurityEvents(): void {
  securityEvents.length = 0;
}

/**
 * Run security audit checks
 */
export function runSecurityAudit(): SecurityAuditResult {
  const checks: SecurityCheck[] = [];
  const timestamp = Date.now();

  // Check 1: HTTPS usage
  checks.push(checkHTTPS());

  // Check 2: Secure cookies
  checks.push(checkSecureCookies());

  // Check 3: localStorage security
  checks.push(checkLocalStorageSecurity());

  // Check 4: CSP configuration
  checks.push(checkCSPConfig());

  // Check 5: Security headers
  checks.push(checkSecurityHeaders());

  // Check 6: CSRF protection
  checks.push(checkCSRFProtection());

  // Check 7: Rate limiting
  checks.push(checkRateLimiting());

  // Check 8: Input sanitization
  checks.push(checkInputSanitization());

  // Check 9: Token storage
  checks.push(checkTokenStorage());

  // Check 10: Console exposure
  checks.push(checkConsoleExposure());

  // Calculate summary
  const summary = {
    passed: checks.filter((c) => c.status === "pass").length,
    failed: checks.filter((c) => c.status === "fail").length,
    warnings: checks.filter((c) => c.status === "warning").length,
    unknown: checks.filter((c) => c.status === "unknown").length,
  };

  // Calculate overall score (0-100)
  const weights = { pass: 1, warning: 0.5, fail: 0, unknown: 0.25 };
  const totalWeight = checks.reduce(
    (acc, check) => acc + weights[check.status],
    0
  );
  const overallScore = Math.round((totalWeight / checks.length) * 100);

  return {
    timestamp,
    overallScore,
    checks,
    summary,
  };
}

/**
 * Individual security checks
 */

function checkHTTPS(): SecurityCheck {
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const isDev = process.env.NODE_ENV === "development";

  return {
    id: "https",
    name: "HTTPS Enabled",
    description: "Application should use HTTPS in production",
    category: "configuration",
    status: isSecure || isDev ? "pass" : "fail",
    level: "critical",
    details: isDev
      ? "Development mode - HTTPS not required"
      : isSecure
        ? "HTTPS is enabled"
        : "Application is not using HTTPS",
    recommendation: !isSecure && !isDev ? "Enable HTTPS for all traffic" : undefined,
    timestamp: Date.now(),
  };
}

function checkSecureCookies(): SecurityCheck {
  if (typeof document === "undefined") {
    return {
      id: "secure-cookies",
      name: "Secure Cookie Flags",
      description: "Cookies should have Secure, HttpOnly, and SameSite flags",
      category: "cookies",
      status: "unknown",
      level: "high",
      details: "Cannot check cookies on server side",
      timestamp: Date.now(),
    };
  }

  // Check if any cookies are accessible via JS (HttpOnly cookies won't be)
  const accessibleCookies = document.cookie
    .split(";")
    .filter((c) => c.trim().length > 0);
  const sensitivePatterns = ["token", "session", "auth", "jwt"];
  const exposedSensitive = accessibleCookies.filter((cookie) => {
    const name = cookie.split("=")[0].trim().toLowerCase();
    return sensitivePatterns.some((pattern) => name.includes(pattern));
  });

  return {
    id: "secure-cookies",
    name: "Secure Cookie Flags",
    description: "Sensitive cookies should have HttpOnly flag",
    category: "cookies",
    status: exposedSensitive.length === 0 ? "pass" : "fail",
    level: "high",
    details:
      exposedSensitive.length > 0
        ? `Found ${exposedSensitive.length} sensitive cookies accessible via JavaScript`
        : "No sensitive cookies exposed to JavaScript",
    recommendation:
      exposedSensitive.length > 0
        ? "Set HttpOnly flag on sensitive cookies"
        : undefined,
    timestamp: Date.now(),
  };
}

function checkLocalStorageSecurity(): SecurityCheck {
  if (typeof localStorage === "undefined") {
    return {
      id: "localstorage",
      name: "localStorage Security",
      description: "Sensitive data should not be stored in localStorage",
      category: "storage",
      status: "unknown",
      level: "high",
      details: "localStorage not available",
      timestamp: Date.now(),
    };
  }

  const sensitivePatterns = ["token", "password", "secret", "key", "auth"];
  const allKeys = Object.keys(localStorage);
  const sensitiveKeys = allKeys.filter((key) =>
    sensitivePatterns.some((pattern) => key.toLowerCase().includes(pattern))
  );

  // Check auth-token specifically
  const authTokenStorage = localStorage.getItem("auth-token");
  const hasTokenInStorage = authTokenStorage && authTokenStorage.includes('"token"');

  return {
    id: "localstorage",
    name: "localStorage Security",
    description: "Tokens should be stored in HttpOnly cookies, not localStorage",
    category: "storage",
    status: hasTokenInStorage ? "warning" : "pass",
    level: "high",
    details: hasTokenInStorage
      ? "Auth token is stored in localStorage (vulnerable to XSS)"
      : "No sensitive tokens found in localStorage",
    recommendation: hasTokenInStorage
      ? "Consider using HttpOnly cookies for token storage"
      : undefined,
    timestamp: Date.now(),
  };
}

function checkCSPConfig(): SecurityCheck {
  const hasDefaultSrc = cspConfig["default-src"].length > 0;
  const hasUnsafeEval = cspConfig["script-src"].includes("'unsafe-eval'");
  const hasUnsafeInline = cspConfig["script-src"].includes("'unsafe-inline'");
  const isDev = process.env.NODE_ENV === "development";

  let status: "pass" | "warning" | "fail" = "pass";
  let details = "CSP is properly configured";

  if (hasUnsafeEval && !isDev) {
    status = "fail";
    details = "CSP allows unsafe-eval in production";
  } else if (hasUnsafeInline) {
    status = "warning";
    details = "CSP allows unsafe-inline (required for some frameworks)";
  }

  return {
    id: "csp",
    name: "Content Security Policy",
    description: "CSP should be properly configured to prevent XSS",
    category: "headers",
    status,
    level: "high",
    details,
    recommendation:
      status !== "pass"
        ? "Review CSP configuration and use nonces where possible"
        : undefined,
    timestamp: Date.now(),
  };
}

function checkSecurityHeaders(): SecurityCheck {
  const requiredHeaders = [
    "X-Frame-Options",
    "X-Content-Type-Options",
    "X-XSS-Protection",
    "Referrer-Policy",
  ];

  const configuredHeaders = Object.keys(securityHeaders);
  const missingHeaders = requiredHeaders.filter(
    (h) => !configuredHeaders.includes(h)
  );

  return {
    id: "security-headers",
    name: "Security Headers",
    description: "Essential security headers should be configured",
    category: "headers",
    status: missingHeaders.length === 0 ? "pass" : "fail",
    level: "medium",
    details:
      missingHeaders.length > 0
        ? `Missing headers: ${missingHeaders.join(", ")}`
        : "All essential security headers are configured",
    timestamp: Date.now(),
  };
}

function checkCSRFProtection(): SecurityCheck {
  return {
    id: "csrf",
    name: "CSRF Protection",
    description: "Cross-Site Request Forgery protection should be enabled",
    category: "csrf",
    status: securityConfig.csrfEnabled ? "pass" : "fail",
    level: "high",
    details: securityConfig.csrfEnabled
      ? "CSRF protection is enabled"
      : "CSRF protection is disabled",
    recommendation: !securityConfig.csrfEnabled
      ? "Enable CSRF protection in security config"
      : undefined,
    timestamp: Date.now(),
  };
}

function checkRateLimiting(): SecurityCheck {
  const isDev = process.env.NODE_ENV === "development";

  return {
    id: "rate-limiting",
    name: "Rate Limiting",
    description: "API rate limiting should be enabled in production",
    category: "configuration",
    status: securityConfig.rateLimiting.enabled || isDev ? "pass" : "warning",
    level: "medium",
    details: securityConfig.rateLimiting.enabled
      ? `Rate limiting: ${securityConfig.rateLimiting.maxRequests} requests per ${securityConfig.rateLimiting.windowMs / 1000}s`
      : isDev
        ? "Rate limiting disabled in development"
        : "Rate limiting is disabled",
    timestamp: Date.now(),
  };
}

function checkInputSanitization(): SecurityCheck {
  return {
    id: "input-sanitization",
    name: "Input Sanitization",
    description: "User inputs should be sanitized before processing",
    category: "input-validation",
    status: securityConfig.sanitizeInputs ? "pass" : "warning",
    level: "high",
    details: securityConfig.sanitizeInputs
      ? "Input sanitization is enabled"
      : "Input sanitization is disabled",
    recommendation: !securityConfig.sanitizeInputs
      ? "Enable input sanitization in security config"
      : undefined,
    timestamp: Date.now(),
  };
}

function checkTokenStorage(): SecurityCheck {
  // This is more of a recommendation check
  return {
    id: "token-storage",
    name: "Token Storage Method",
    description: "Auth tokens should use secure storage methods",
    category: "authentication",
    status: "warning",
    level: "high",
    details:
      "Currently using localStorage for token storage (check auth.store.ts)",
    recommendation:
      "Consider implementing HttpOnly cookie-based token storage for better security against XSS attacks",
    timestamp: Date.now(),
  };
}

function checkConsoleExposure(): SecurityCheck {
  const isDev = process.env.NODE_ENV === "development";

  return {
    id: "console-exposure",
    name: "Console Logging",
    description: "Sensitive data should not be logged in production",
    category: "configuration",
    status: isDev ? "pass" : "warning",
    level: "low",
    details: isDev
      ? "Console logging is acceptable in development"
      : "Review console.log statements for sensitive data exposure",
    recommendation: !isDev
      ? "Remove or conditionally disable console logging in production"
      : undefined,
    timestamp: Date.now(),
  };
}

/**
 * Get security score color
 */
export function getSecurityScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

/**
 * Get security level badge color
 */
export function getSecurityLevelColor(level: SecurityLevel): string {
  switch (level) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-blue-500";
    case "info":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
}
