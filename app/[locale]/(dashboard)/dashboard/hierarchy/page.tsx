"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  GitBranch,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useStores } from "@/lib/hooks/use-stores";
import { useHierarchyTree } from "@/lib/hooks/use-hierarchy";
import type { FlatTreeNode } from "@/types/hierarchy.types";
import { cn } from "@/lib/utils";

function TreeNode({
  node,
  onToggle,
  onSelect,
  isSelected,
}: {
  node: FlatTreeNode;
  onToggle: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  isSelected: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
        isSelected && "bg-muted"
      )}
      style={{ paddingInlineStart: `${node.depth * 24 + 12}px` }}
      onClick={() => onSelect(node.id)}
    >
      {node.hasChildren ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
          className="p-0.5 hover:bg-muted rounded"
        >
          {node.isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ) : (
        <span className="w-5" />
      )}
      <Shield className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{node.role.name}</span>
    </div>
  );
}

export default function HierarchyPage() {
  const t = useTranslations("hierarchy");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const { stores, isLoading: isLoadingStores } = useStores();
  const {
    flatTree,
    isLoading: isLoadingTree,
    selectedNode,
    toggleNodeExpansion,
    selectNode,
    expandAll,
    collapseAll,
  } = useHierarchyTree(selectedStoreId);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")}>
        <Button
          onClick={() => router.push(`/${locale}/dashboard/hierarchy/create`)}
        >
          <Plus className="me-2 h-4 w-4" />
          {t("createHierarchy")}
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4">
        <Select
          value={selectedStoreId || ""}
          onValueChange={(value: string) => setSelectedStoreId(value || null)}
        >
          <SelectTrigger className="w-75">
            <SelectValue placeholder={t("selectStore")} />
          </SelectTrigger>
          <SelectContent>
            {isLoadingStores ? (
              <div className="p-2">
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              stores.map((store: { id: string; name: string }) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {selectedStoreId && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              {t("expandAll")}
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              {t("collapseAll")}
            </Button>
          </div>
        )}
      </div>

      {!selectedStoreId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {t("selectStorePrompt")}
            </p>
          </CardContent>
        </Card>
      ) : isLoadingTree ? (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : flatTree.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              {t("noHierarchy")}
            </p>
            <Button
              onClick={() =>
                router.push(`/${locale}/dashboard/hierarchy/create`)
              }
            >
              <Plus className="me-2 h-4 w-4" />
              {t("createFirst")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("tree.title")}</CardTitle>
              <CardDescription>{t("tree.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                {flatTree.map((node: FlatTreeNode) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    onToggle={toggleNodeExpansion}
                    onSelect={selectNode}
                    isSelected={selectedNode === node.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("details.title")}</CardTitle>
              <CardDescription>{t("details.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  {(() => {
                    const node = flatTree.find((n: FlatTreeNode) => n.id === selectedNode);
                    if (!node) return null;
                    return (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {t("details.roleName")}
                          </label>
                          <p className="font-medium">{node.role.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {t("details.guardName")}
                          </label>
                          <p>{node.role.guardName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {t("details.depth")}
                          </label>
                          <p>{node.depth}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {t("details.hasChildren")}
                          </label>
                          <p>{node.hasChildren ? t("yes") : t("no")}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("details.selectNode")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
