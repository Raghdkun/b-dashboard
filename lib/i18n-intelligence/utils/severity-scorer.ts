/**
 * i18n Intelligence System - Severity Scoring
 *
 * Calculates severity scores based on multiple factors:
 * - Issue type
 * - Route importance
 * - Component type
 * - User impact
 * - Frequency
 */

import {
  type IssueSeverity,
  type IssueType,
  type ComponentType,
  type TranslationLocation,
  SEVERITY_THRESHOLDS,
  ROUTE_IMPORTANCE,
  COMPONENT_IMPORTANCE,
} from "../types";

/**
 * Base scores for each issue type
 */
const ISSUE_TYPE_BASE_SCORES: Record<IssueType, number> = {
  missing: 70, // High - content not showing
  fallback: 60, // Medium-High - wrong language showing
  hardcoded: 40, // Medium - needs i18n but works
  overflow: 50, // Medium - visual issue
  "rtl-alignment": 55, // Medium - layout issue
  "rtl-direction": 65, // High - text direction wrong
};

/**
 * Factors that multiply the base score
 */
interface SeverityFactors {
  /** How important is the route? (0.5 - 2.0) */
  routeMultiplier: number;

  /** How important is the component type? (0.5 - 2.0) */
  componentMultiplier: number;

  /** How frequently does this occur? (0.8 - 1.5) */
  frequencyMultiplier: number;

  /** Is it user-facing? (0.5 - 1.5) */
  userFacingMultiplier: number;
}

/**
 * Get route importance multiplier
 */
export function getRouteMultiplier(route: string): number {
  // Check for exact match first
  if (route in ROUTE_IMPORTANCE) {
    return ROUTE_IMPORTANCE[route as keyof typeof ROUTE_IMPORTANCE];
  }

  // Check for pattern matches
  if (route.includes("/checkout") || route.includes("/payment")) {
    return 2.0;
  }
  if (route.includes("/auth") || route.includes("/login") || route.includes("/signup")) {
    return 1.8;
  }
  if (route.includes("/settings") || route.includes("/profile")) {
    return 1.3;
  }
  if (route.includes("/admin") || route.includes("/dev-tools")) {
    return 0.7;
  }

  return 1.0; // Default multiplier
}

/**
 * Get component type multiplier
 */
export function getComponentMultiplier(componentType: ComponentType): number {
  return COMPONENT_IMPORTANCE[componentType] ?? 1.0;
}

/**
 * Get frequency multiplier based on occurrence count
 */
export function getFrequencyMultiplier(occurrenceCount: number): number {
  if (occurrenceCount >= 100) return 1.5;
  if (occurrenceCount >= 50) return 1.3;
  if (occurrenceCount >= 20) return 1.2;
  if (occurrenceCount >= 10) return 1.1;
  if (occurrenceCount >= 5) return 1.0;
  return 0.8; // Rare occurrences are less urgent
}

/**
 * Get user-facing multiplier
 */
export function getUserFacingMultiplier(
  componentType: ComponentType,
  route: string
): number {
  // Error messages are always highly visible
  if (componentType === "error" || componentType === "notification") {
    return 1.5;
  }

  // Navigation is always visible
  if (componentType === "navigation") {
    return 1.4;
  }

  // Main page content is highly visible
  if (componentType === "page") {
    return 1.3;
  }

  // Admin/dev routes are less user-facing
  if (route.includes("/admin") || route.includes("/dev-tools")) {
    return 0.6;
  }

  // Tooltips and labels are secondary
  if (componentType === "tooltip" || componentType === "label") {
    return 0.9;
  }

  return 1.0;
}

/**
 * Calculate all severity factors
 */
export function calculateFactors(
  location: TranslationLocation,
  occurrenceCount: number
): SeverityFactors {
  return {
    routeMultiplier: getRouteMultiplier(location.route),
    componentMultiplier: getComponentMultiplier(location.componentType),
    frequencyMultiplier: getFrequencyMultiplier(occurrenceCount),
    userFacingMultiplier: getUserFacingMultiplier(
      location.componentType,
      location.route
    ),
  };
}

/**
 * Calculate the final severity score
 */
export function calculateSeverityScore(
  issueType: IssueType,
  location: TranslationLocation,
  occurrenceCount: number = 1
): number {
  const baseScore = ISSUE_TYPE_BASE_SCORES[issueType];
  const factors = calculateFactors(location, occurrenceCount);

  // Calculate combined multiplier (capped to prevent extreme values)
  const combinedMultiplier = Math.min(
    2.5,
    Math.max(
      0.3,
      factors.routeMultiplier *
        factors.componentMultiplier *
        factors.frequencyMultiplier *
        factors.userFacingMultiplier
    )
  );

  // Calculate final score and clamp to 0-100
  const finalScore = Math.round(baseScore * combinedMultiplier);
  return Math.min(100, Math.max(0, finalScore));
}

/**
 * Convert severity score to severity level
 */
export function scoreToSeverity(score: number): IssueSeverity {
  if (score >= SEVERITY_THRESHOLDS.critical) return "critical";
  if (score >= SEVERITY_THRESHOLDS.high) return "high";
  if (score >= SEVERITY_THRESHOLDS.medium) return "medium";
  if (score >= SEVERITY_THRESHOLDS.low) return "low";
  return "info";
}

/**
 * Calculate severity for an issue
 */
export function calculateIssueSeverity(
  issueType: IssueType,
  location: TranslationLocation,
  occurrenceCount: number = 1
): { score: number; severity: IssueSeverity } {
  const score = calculateSeverityScore(issueType, location, occurrenceCount);
  const severity = scoreToSeverity(score);
  return { score, severity };
}

/**
 * Recalculate severity when factors change
 */
export function recalculateSeverity(
  currentScore: number,
  newOccurrenceCount: number,
  previousOccurrenceCount: number
): { score: number; severity: IssueSeverity } {
  // Adjust score based on frequency change
  const frequencyRatio =
    getFrequencyMultiplier(newOccurrenceCount) /
    getFrequencyMultiplier(previousOccurrenceCount);

  const newScore = Math.min(100, Math.max(0, Math.round(currentScore * frequencyRatio)));
  return {
    score: newScore,
    severity: scoreToSeverity(newScore),
  };
}

/**
 * Get severity badge color
 */
export function getSeverityColor(severity: IssueSeverity): string {
  const colors: Record<IssueSeverity, string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
    info: "bg-gray-500",
  };
  return colors[severity];
}

/**
 * Get severity badge text color
 */
export function getSeverityTextColor(severity: IssueSeverity): string {
  const colors: Record<IssueSeverity, string> = {
    critical: "text-red-500",
    high: "text-orange-500",
    medium: "text-yellow-500",
    low: "text-blue-500",
    info: "text-gray-500",
  };
  return colors[severity];
}
