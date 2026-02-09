"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TopMenuItem, TopIngredient } from "@/types/dspr.types";
import { Pizza, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Top 5 Menu Items
// ============================================================================

interface TopItemsListProps {
  items: TopMenuItem[];
  title?: string;
  className?: string;
}

const rankColors = [
  "bg-amber-500 text-white",     // #1 gold
  "bg-slate-400 text-white",     // #2 silver
  "bg-amber-700 text-white",     // #3 bronze
  "bg-muted text-muted-foreground", // #4
  "bg-muted text-muted-foreground", // #5
];

export function TopItemsList({
  items,
  title = "Top 5 Menu Items",
  className,
}: TopItemsListProps) {
  // Find the max gross_sales to compute relative bar widths
  const maxSales = Math.max(...items.map((i) => i.gross_sales), 1);

  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="rounded-lg p-1.5 bg-orange-500/15 dark:bg-orange-500/20">
            <Pizza className="h-4 w-4 text-orange-500" />
          </div>
          {title}
          <Badge variant="secondary" className="ms-auto text-[10px] font-mono">
            {items.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, idx) => {
          const barWidth = (item.gross_sales / maxSales) * 100;
          return (
            <div
              key={item.item_id}
              className="group/item relative rounded-lg p-2.5 hover:bg-muted/50 transition-colors"
            >
              {/* Background bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-lg bg-orange-500/5 dark:bg-orange-500/10 transition-all"
                style={{ width: `${barWidth}%` }}
              />

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn(
                      "text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      rankColors[idx] ?? rankColors[3]
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {item.menu_item_name}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono px-1.5 py-0 h-5"
                  >
                    {item.quantity_sold} sold
                  </Badge>
                  <span className="text-sm font-bold tabular-nums min-w-17.5 text-end">
                    ${item.gross_sales.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Top 3 Ingredients
// ============================================================================

interface TopIngredientsListProps {
  ingredients: TopIngredient[];
  title?: string;
  className?: string;
}

export function TopIngredientsList({
  ingredients,
  title = "Top 3 Ingredients Used",
  className,
}: TopIngredientsListProps) {
  const maxUsage = Math.max(...ingredients.map((i) => i.actual_usage), 1);

  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="rounded-lg p-1.5 bg-blue-500/15 dark:bg-blue-500/20">
            <Package className="h-4 w-4 text-blue-500" />
          </div>
          {title}
          <Badge variant="secondary" className="ms-auto text-[10px] font-mono">
            {ingredients.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ingredients.map((ing, idx) => {
          const barWidth = (ing.actual_usage / maxUsage) * 100;
          return (
            <div
              key={ing.ingredient_id}
              className="relative rounded-lg p-2.5 hover:bg-muted/50 transition-colors"
            >
              {/* Background bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-lg bg-blue-500/5 dark:bg-blue-500/10 transition-all"
                style={{ width: `${barWidth}%` }}
              />

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn(
                      "text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      rankColors[idx] ?? rankColors[3]
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {ing.ingredient_description}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono shrink-0 px-2 py-0 h-5"
                >
                  {ing.actual_usage.toLocaleString()} units
                </Badge>
              </div>
            </div>
          );
        })}
        {ingredients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <Package className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
