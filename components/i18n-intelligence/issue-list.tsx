/**
 * i18n Intelligence Dashboard - Issue List
 */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Eye,
  EyeOff,
  MoreVertical,
  Clock,
  MapPin,
  Hash,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useI18nIntelligenceStore,
  type TranslationIssue,
  type IssueSeverity,
  getSeverityColor,
  exportIssues,
} from "@/lib/i18n-intelligence";
import { useShallow } from "zustand/react/shallow";

interface IssueCardProps {
  issue: TranslationIssue;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onExpand: () => void;
}

const severityBadgeVariants: Record<IssueSeverity, string> = {
  critical: "bg-red-500 hover:bg-red-600 text-white",
  high: "bg-orange-500 hover:bg-orange-600 text-white",
  medium: "bg-yellow-500 hover:bg-yellow-600 text-black",
  low: "bg-blue-500 hover:bg-blue-600 text-white",
  info: "bg-gray-500 hover:bg-gray-600 text-white",
};

function formatTimeAgo(timestamp: number, t: ReturnType<typeof useTranslations<"common">>): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return t("justNow");
  if (seconds < 3600) return t("minutesAgo", { count: Math.floor(seconds / 60) });
  if (seconds < 86400) return t("hoursAgo", { count: Math.floor(seconds / 3600) });
  return t("daysAgo", { count: Math.floor(seconds / 86400) });
}

function IssueCard({
  issue,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
}: IssueCardProps) {
  const t = useTranslations("devTools.i18n.issues");
  const tCommon = useTranslations("common");
  const setIssueStatus = useI18nIntelligenceStore((s) => s.setIssueStatus);
  const deleteIssue = useI18nIntelligenceStore((s) => s.deleteIssue);

  return (
    <div
      className={cn(
        "border rounded-lg p-3 transition-colors",
        isSelected && "bg-accent",
        isExpanded && "ring-2 ring-primary"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={cn("text-xs", severityBadgeVariants[issue.severity])}>
              {issue.severity}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {issue.type}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(issue.lastSeen, tCommon)}
            </span>
          </div>

          <p className="text-sm font-medium truncate">{issue.description}</p>

          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {issue.location.route}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {issue.occurrenceCount}x
            </span>
          </div>

          {isExpanded && (
            <div className="mt-3 p-3 bg-muted rounded-md space-y-2">
              {"fullKey" in issue && (
                <div>
                  <span className="text-xs font-medium">Key:</span>
                  <code className="ml-2 text-xs bg-background px-1 rounded">
                    {issue.fullKey}
                  </code>
                </div>
              )}
              {issue.suggestedFix && (
                <div>
                  <span className="text-xs font-medium">Fix:</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {issue.suggestedFix}
                  </p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium">Locations:</span>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  {issue.allLocations.slice(0, 5).map((loc, i) => (
                    <li key={i}>
                      {loc.route} → {loc.componentName}
                    </li>
                  ))}
                  {issue.allLocations.length > 5 && (
                    <li>...and {issue.allLocations.length - 5} more</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onExpand}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setIssueStatus(issue.id, "acknowledged")}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t("acknowledge")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIssueStatus(issue.id, "resolved")}
              >
                <Check className="h-4 w-4 mr-2" />
                {t("markResolved")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIssueStatus(issue.id, "wont-fix")}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                {t("wontFix")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deleteIssue(issue.id)}
              >
                <X className="h-4 w-4 mr-2" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function IssueList() {
  const t = useTranslations("devTools.i18n.issues");
  const tExport = useTranslations("devTools.i18n.export");
  // Get raw data from store
  const allIssues = useI18nIntelligenceStore(
    useShallow((s) => Object.values(s.issues))
  );
  const filters = useI18nIntelligenceStore((s) => s.ui.filters);
  const sort = useI18nIntelligenceStore((s) => s.ui.sort);
  const showResolved = useI18nIntelligenceStore((s) => s.ui.showResolved);
  const selectedIssues = useI18nIntelligenceStore((s) => s.ui.selectedIssues);
  const expandedIssue = useI18nIntelligenceStore((s) => s.ui.expandedIssue);
  const toggleIssueSelection = useI18nIntelligenceStore(
    (s) => s.toggleIssueSelection
  );
  const expandIssue = useI18nIntelligenceStore((s) => s.expandIssue);
  const selectIssues = useI18nIntelligenceStore((s) => s.selectIssues);
  const clearSelection = useI18nIntelligenceStore((s) => s.clearSelection);
  const bulkSetIssueStatus = useI18nIntelligenceStore((s) => s.bulkSetIssueStatus);
  const bulkDeleteIssues = useI18nIntelligenceStore((s) => s.bulkDeleteIssues);

  // Memoize filtered and sorted issues
  const issues = useMemo(() => {
    let result = [...allIssues];

    // Filter by status (show/hide resolved)
    if (!showResolved) {
      result = result.filter(
        (i) => i.status !== "resolved" && i.status !== "wont-fix"
      );
    }

    // Apply filters
    if (filters.types?.length) {
      result = result.filter((i) => filters.types!.includes(i.type));
    }
    if (filters.severities?.length) {
      result = result.filter((i) => filters.severities!.includes(i.severity));
    }
    if (filters.statuses?.length) {
      result = result.filter((i) => filters.statuses!.includes(i.status));
    }
    if (filters.routes?.length) {
      result = result.filter((i) => filters.routes!.includes(i.location.route));
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.description.toLowerCase().includes(query) ||
          ("key" in i && i.key.toLowerCase().includes(query)) ||
          i.location.route.toLowerCase().includes(query) ||
          i.location.componentName.toLowerCase().includes(query)
      );
    }

    // Sort
    const sortMultiplier = sort.direction === "asc" ? 1 : -1;
    result.sort((a, b) => {
      switch (sort.field) {
        case "severity":
          return (b.severityScore - a.severityScore) * sortMultiplier;
        case "lastSeen":
          return (b.lastSeen - a.lastSeen) * sortMultiplier;
        case "occurrenceCount":
          return (b.occurrenceCount - a.occurrenceCount) * sortMultiplier;
        case "firstDetected":
          return (b.firstDetected - a.firstDetected) * sortMultiplier;
        default:
          return 0;
      }
    });

    return result;
  }, [allIssues, filters, sort, showResolved]);

  const handleSelectAll = () => {
    if (selectedIssues.length === issues.length) {
      clearSelection();
    } else {
      selectIssues(issues.map((i) => i.id));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("description", { count: issues.length })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            {issues.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    {tExport("title")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportIssues(issues, "json")}>
                    <FileJson className="h-4 w-4 mr-2" />
                    {tExport("asJson")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportIssues(issues, "csv")}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    {tExport("asCsv")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportIssues(issues, "markdown")}>
                    <FileText className="h-4 w-4 mr-2" />
                    {tExport("asMarkdown")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* Bulk Actions */}
            {selectedIssues.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {t("selected", { count: selectedIssues.length })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkSetIssueStatus(selectedIssues, "resolved")}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {t("resolve")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkDeleteIssues(selectedIssues)}
                >
                  <X className="h-4 w-4 mr-1" />
                  {t("delete")}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("noIssues")}</p>
            <p className="text-sm">
              {t("noIssuesHint")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={
                  selectedIssues.length === issues.length && issues.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">{t("selectAll")}</span>
            </div>
            <ScrollArea className="h-125 pr-4">
              <div className="space-y-2">
                {issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    isSelected={selectedIssues.includes(issue.id)}
                    isExpanded={expandedIssue === issue.id}
                    onSelect={() => toggleIssueSelection(issue.id)}
                    onExpand={() =>
                      expandIssue(expandedIssue === issue.id ? null : issue.id)
                    }
                  />
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}
