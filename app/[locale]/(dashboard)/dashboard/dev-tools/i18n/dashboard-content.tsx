/**
 * i18n Intelligence Dashboard - Client Component
 */

"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Languages, Bug, Settings, BarChart3, FlaskConical, FileCode } from "lucide-react";
import {
  HealthScoreCard,
  IssueSummaryGrid,
  IssueList,
  DetectionControls,
  LocaleHealthGrid,
  HardcodedStringsPanel,
} from "@/components/i18n-intelligence";
import { useI18nIntelligenceStore } from "@/lib/i18n-intelligence";

export function I18nIntelligenceDashboard() {
  const t = useTranslations("devTools");
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const activeTab = useI18nIntelligenceStore((s) => s.ui.activeTab);
  const setActiveTab = useI18nIntelligenceStore((s) => s.setActiveTab);
  const recalculateHealth = useI18nIntelligenceStore((s) => s.recalculateHealth);
  const toggleDetection = useI18nIntelligenceStore((s) => s.toggleDetection);
  const totalIssues = useI18nIntelligenceStore((s) =>
    Object.keys(s.issues).length
  );

  // Enable detection on mount
  useEffect(() => {
    toggleDetection(true);
    recalculateHealth();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Languages className="h-6 w-6" />
            i18n Intelligence
          </h1>
          <p className="text-muted-foreground">
            Real-time translation issue detection and monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Bug className="h-3 w-3 mr-1" />
            Dev Tools
          </Badge>
          <Link href={`/${locale}/dashboard/dev-tools/i18n/test-detection`}>
            <Button variant="outline" size="sm">
              <FlaskConical className="h-4 w-4 mr-2" />
              Test Detection
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Issues
            {totalIssues > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {totalIssues}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="locales" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Locales
          </TabsTrigger>
          <TabsTrigger value="hardcoded" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Hardcoded
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <HealthScoreCard />
              <IssueSummaryGrid />
            </div>
            <div>
              <DetectionControls />
            </div>
          </div>
          <LocaleHealthGrid />
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <IssueList />
        </TabsContent>

        {/* Locales Tab */}
        <TabsContent value="locales" className="space-y-6">
          <LocaleHealthGrid />
          <IssueList />
        </TabsContent>

        {/* Hardcoded Strings Tab */}
        <TabsContent value="hardcoded">
          <HardcodedStringsPanel />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="max-w-md">
            <DetectionControls />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
