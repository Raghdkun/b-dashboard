"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  TestTube,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuthRules, useTestAuthRule } from "@/lib/hooks/use-auth-rules";
import { useAuthRulesStore } from "@/lib/store/auth-rules.store";
import type { AuthRule, HttpMethod } from "@/types/auth-rule.types";

const methodColors: Record<HttpMethod, string> = {
  GET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  PATCH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  ANY: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export default function AuthRulesPage() {
  const t = useTranslations("authRules");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const { rules, isLoading, handleSearch, refetch } = useAuthRules();
  const { deleteRule, isDeleting } = useAuthRulesStore();
  const { testRule, testResult, isTesting, error: testError, clearTestResult } = useTestAuthRule();

  // Test dialog state
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testPathDsl, setTestPathDsl] = useState("");
  const [testPath, setTestPath] = useState("");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<AuthRule | null>(null);

  const handleOpenTest = (rule: AuthRule) => {
    setTestPathDsl(rule.pathDsl || rule.path_dsl || "");
    setTestPath("");
    clearTestResult();
    setTestDialogOpen(true);
  };

  const handleRunTest = async () => {
    if (!testPathDsl || !testPath) return;
    await testRule({ pathDsl: testPathDsl, testPath: testPath });
  };

  const handleOpenDelete = (rule: AuthRule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await deleteRule(String(ruleToDelete.id));
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
      refetch();
    } catch {
      // error shown in store
    }
  };

  const columns = [
    {
      key: "service",
      header: t("columns.service"),
      cell: (rule: AuthRule) => (
        <Badge variant="outline">{rule.service}</Badge>
      ),
    },
    {
      key: "method",
      header: t("columns.method"),
      cell: (rule: AuthRule) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
            methodColors[rule.method] || ""
          }`}
        >
          {rule.method}
        </span>
      ),
    },
    {
      key: "path",
      header: t("columns.path"),
      cell: (rule: AuthRule) => (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {rule.pathDsl || rule.routeName || "-"}
        </code>
      ),
    },
    {
      key: "authorization",
      header: t("columns.authorization"),
      cell: (rule: AuthRule) => (
        <div className="flex flex-wrap gap-1">
          {rule.rolesAny && rule.rolesAny.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {t("rolesAny", { count: rule.rolesAny.length })}
            </Badge>
          )}
          {rule.permissionsAny && rule.permissionsAny.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {t("permissionsAny", { count: rule.permissionsAny.length })}
            </Badge>
          )}
          {rule.permissionsAll && rule.permissionsAll.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {t("permissionsAll", { count: rule.permissionsAll.length })}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      header: t("columns.priority"),
      cell: (rule: AuthRule) => (
        <span className="text-muted-foreground">{rule.priority}</span>
      ),
    },
    {
      key: "status",
      header: t("columns.status"),
      cell: (rule: AuthRule) => (
        <Badge variant={rule.isActive ? "default" : "secondary"}>
          {rule.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (rule: AuthRule) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.push(`/${locale}/dashboard/auth-rules/${rule.id}`)
              }
            >
              <Eye className="me-2 h-4 w-4" />
              {t("actions.view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenTest(rule)}>
              <TestTube className="me-2 h-4 w-4" />
              {t("actions.test")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/${locale}/dashboard/auth-rules/${rule.id}/edit`)
              }
            >
              <Pencil className="me-2 h-4 w-4" />
              {t("actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleOpenDelete(rule)}
            >
              <Trash2 className="me-2 h-4 w-4" />
              {t("actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")}>
        <Button
          onClick={() => router.push(`/${locale}/dashboard/auth-rules/create`)}
        >
          <Plus className="me-2 h-4 w-4" />
          {t("addRule")}
        </Button>
      </PageHeader>

      <DataTable
        data={rules}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder={t("searchPlaceholder")}
        onSearchChange={handleSearch}
        emptyMessage={t("noRules")}
      />

      {/* Test Rule Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.test")}</DialogTitle>
            <DialogDescription>
              Test if a path matches the rule&apos;s path DSL pattern.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-path-dsl">{t("form.pathDsl")}</Label>
              <Input
                id="test-path-dsl"
                value={testPathDsl}
                onChange={(e) => setTestPathDsl(e.target.value)}
                placeholder={t("form.pathDslPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-path">Test Path</Label>
              <Input
                id="test-path"
                value={testPath}
                onChange={(e) => setTestPath(e.target.value)}
                placeholder="e.g., /api/users/123"
              />
            </div>
            {testResult && (
              <Alert variant={testResult.matches ? "default" : "destructive"}>
                {testResult.matches ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {testResult.matches
                    ? "Path matches the DSL pattern!"
                    : "Path does not match the DSL pattern."}
                </AlertDescription>
              </Alert>
            )}
            {testError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{testError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleRunTest} disabled={isTesting || !testPathDsl || !testPath}>
              {isTesting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              Run Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.delete")}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this auth rule? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {ruleToDelete && (
            <div className="py-4 text-sm text-muted-foreground">
              <p>
                <strong>Service:</strong> {ruleToDelete.service}
              </p>
              <p>
                <strong>Method:</strong> {ruleToDelete.method}
              </p>
              <p>
                <strong>Path:</strong>{" "}
                {ruleToDelete.pathDsl || ruleToDelete.routeName || "-"}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              {t("actions.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
