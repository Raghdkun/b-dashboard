/**
 * i18n Intelligence System - Utility Exports
 */

export {
  calculateSeverityScore,
  calculateIssueSeverity,
  scoreToSeverity,
  recalculateSeverity,
  getSeverityColor,
  getSeverityTextColor,
  getRouteMultiplier,
  getComponentMultiplier,
  getFrequencyMultiplier,
  getUserFacingMultiplier,
  calculateFactors,
} from "./severity-scorer";

export {
  exportAsJSON,
  exportAsCSV,
  exportAsMarkdown,
  exportIssues,
  downloadFile,
} from "./export";
