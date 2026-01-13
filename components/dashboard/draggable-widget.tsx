"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraggableWidgetProps {
  id: string;
  isEditMode: boolean;
  onRemove?: () => void;
  onSettings?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DraggableWidget({
  id,
  isEditMode,
  onRemove,
  onSettings,
  children,
  className,
}: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "z-50 opacity-90",
        isEditMode && "ring-2 ring-primary/20 ring-offset-2 rounded-lg",
        className
      )}
    >
      {/* Edit mode overlay controls */}
      {isEditMode && (
        <div className="absolute -top-3 end-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onSettings && (
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 shadow-md"
              onClick={onSettings}
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="sr-only">Widget settings</span>
            </Button>
          )}
          {onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7 shadow-md"
              onClick={onRemove}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Remove widget</span>
            </Button>
          )}
        </div>
      )}

      {/* Drag handle */}
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute -start-3 top-1/2 -translate-y-1/2 z-10",
            "flex items-center justify-center",
            "h-8 w-6 rounded-md bg-muted/80 backdrop-blur-sm",
            "cursor-grab active:cursor-grabbing",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-muted border shadow-sm"
          )}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Widget content */}
      <div className={cn(isDragging && "pointer-events-none")}>{children}</div>
    </div>
  );
}
