/**
 * i18n Intelligence Dashboard Page
 *
 * Developer tools for monitoring and debugging translation issues
 */

import { Metadata } from "next";
import { I18nIntelligenceDashboard } from "./dashboard-content";

export const metadata: Metadata = {
  title: "i18n Intelligence | Dev Tools",
  description: "Monitor and debug translation issues in real-time",
};

export default function I18nIntelligencePage() {
  return <I18nIntelligenceDashboard />;
}
