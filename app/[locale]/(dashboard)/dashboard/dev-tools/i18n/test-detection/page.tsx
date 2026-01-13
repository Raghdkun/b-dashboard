/**
 * i18n Intelligence Test Page
 *
 * This page intentionally uses missing translation keys to test
 * the i18n Intelligence detection system
 */

import { TestDetectionContent } from "./test-content";

export const metadata = {
  title: "i18n Detection Test | Dev Tools",
  description: "Test page for i18n Intelligence detection",
};

export default function TestDetectionPage() {
  return <TestDetectionContent />;
}
