/**
 * i18n Intelligence - ESLint Integration
 *
 * Exports ESLint plugin and analyzer for hardcoded string detection
 */

export { default as plugin } from "./plugin";
export {
  analyzeHardcodedStrings,
  generateReport,
  saveResults,
  loadResults,
  type HardcodedStringIssue,
  type AnalysisResult,
} from "./analyzer";
