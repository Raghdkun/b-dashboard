"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TopMenuItem, TopIngredient } from "@/types/dspr.types";
import { Pizza, Package } from "lucide-react";

// ============================================================================
// Top 5 Menu Items
// ============================================================================

interface TopItemsListProps {
  items: TopMenuItem[];
  title?: string;
  className?: string;
}

export function TopItemsList({
  items,
  title = "Top 5 Menu Items",
  className,
}: TopItemsListProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Pizza className="h-4 w-4 text-orange-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.item_id}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">
                #{idx + 1}
              </span>
              <span className="text-sm font-medium truncate">
                {item.menu_item_name}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="text-xs font-mono">
                {item.quantity_sold} sold
              </Badge>
              <span className="text-sm font-semibold tabular-nums min-w-17.5 text-end">
                ${item.gross_sales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No data available
          </p>
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
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ingredients.map((ing, idx) => (
          <div
            key={ing.ingredient_id}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">
                #{idx + 1}
              </span>
              <span className="text-sm font-medium truncate">
                {ing.ingredient_description}
              </span>
            </div>
            <Badge variant="outline" className="text-xs font-mono shrink-0">
              {ing.actual_usage.toLocaleString()} units
            </Badge>
          </div>
        ))}
        {ingredients.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No data available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
