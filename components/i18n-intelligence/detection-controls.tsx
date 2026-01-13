/**
 * i18n Intelligence Dashboard - Detection Controls
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Settings,
} from "lucide-react";
import { useI18nIntelligenceStore } from "@/lib/i18n-intelligence";

export function DetectionControls() {
  const config = useI18nIntelligenceStore((s) => s.config);
  const isDetecting = useI18nIntelligenceStore((s) => s.isDetecting);
  const toggleDetection = useI18nIntelligenceStore((s) => s.toggleDetection);
  const updateConfig = useI18nIntelligenceStore((s) => s.updateConfig);
  const recalculateHealth = useI18nIntelligenceStore((s) => s.recalculateHealth);
  const clearAllIssues = useI18nIntelligenceStore((s) => s.clearAllIssues);
  const clearResolvedIssues = useI18nIntelligenceStore((s) => s.clearResolvedIssues);
  const exportData = useI18nIntelligenceStore((s) => s.exportData);
  const importData = useI18nIntelligenceStore((s) => s.importData);
  const reset = useI18nIntelligenceStore((s) => s.reset);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `i18n-intelligence-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          importData(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Detection Controls</CardTitle>
          <Badge variant={isDetecting ? "default" : "secondary"}>
            {isDetecting ? "Active" : "Paused"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Detection Active</Label>
            <p className="text-xs text-muted-foreground">
              Track translation issues in real-time
            </p>
          </div>
          <Button
            variant={isDetecting ? "default" : "outline"}
            size="sm"
            onClick={() => toggleDetection()}
          >
            {isDetecting ? (
              <>
                <Pause className="h-4 w-4 mr-1" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" /> Start
              </>
            )}
          </Button>
        </div>

        {/* Detection Options */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label htmlFor="detect-missing" className="text-sm">
              Missing Keys
            </Label>
            <Switch
              id="detect-missing"
              checked={config.detectMissingKeys}
              onCheckedChange={(checked: boolean) =>
                updateConfig({ detectMissingKeys: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="detect-fallback" className="text-sm">
              Fallback Usage
            </Label>
            <Switch
              id="detect-fallback"
              checked={config.detectFallbackUsage}
              onCheckedChange={(checked: boolean) =>
                updateConfig({ detectFallbackUsage: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="detect-rtl" className="text-sm">
              RTL Issues
            </Label>
            <Switch
              id="detect-rtl"
              checked={config.detectRTLIssues}
              onCheckedChange={(checked: boolean) =>
                updateConfig({ detectRTLIssues: checked })
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={recalculateHealth}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={clearResolvedIssues}
            className="text-yellow-600 hover:text-yellow-700"
          >
            Clear Resolved
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllIssues}
            className="text-orange-600 hover:text-orange-700"
          >
            Clear All Issues
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Reset all data? This cannot be undone.")) {
                reset();
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
