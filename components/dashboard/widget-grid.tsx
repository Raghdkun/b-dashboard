"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  Announcements,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { useDashboardStore, useSortedWidgets, useIsEditMode } from "@/lib/dashboard";
import { DraggableWidget } from "./draggable-widget";
import { WidgetRenderer } from "./widget-renderer";
import { cn } from "@/lib/utils";

interface WidgetGridProps {
  className?: string;
}

export function WidgetGrid({ className }: WidgetGridProps) {
  const t = useTranslations("dashboard");
  const isEditMode = useIsEditMode();
  const widgets = useSortedWidgets();
  const { reorderWidgets, removeWidget, setDraggedWidget } = useDashboardStore();
  
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sensors for pointer and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Screen reader announcements
  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Grabbed widget. Current position: ${widgets.findIndex((w) => w.instanceId === active.id) + 1} of ${widgets.length}. Use arrow keys to move, Enter to drop, Escape to cancel.`;
    },
    onDragOver({ over }) {
      if (over) {
        const overIndex = widgets.findIndex((w) => w.instanceId === over.id);
        return `Widget moved to position ${overIndex + 1} of ${widgets.length}.`;
      }
      return "";
    },
    onDragEnd({ over }) {
      if (over) {
        const newIndex = widgets.findIndex((w) => w.instanceId === over.id);
        return `Widget dropped at position ${newIndex + 1} of ${widgets.length}.`;
      }
      return "Widget drop cancelled.";
    },
    onDragCancel() {
      return "Dragging cancelled. Widget returned to original position.";
    },
  };

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(event.active.id as string);
      setDraggedWidget(event.active.id as string);
    },
    [setDraggedWidget]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      
      if (over && active.id !== over.id) {
        reorderWidgets(active.id as string, over.id as string);
      }
      
      setActiveId(null);
      setDraggedWidget(null);
    },
    [reorderWidgets, setDraggedWidget]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setDraggedWidget(null);
  }, [setDraggedWidget]);

  const activeWidget = activeId
    ? widgets.find((w) => w.instanceId === activeId)
    : null;

  if (widgets.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16", className)}>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">{t("empty.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("empty.description")}</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      accessibility={{ announcements }}
    >
      <SortableContext
        items={widgets.map((w) => w.instanceId)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("space-y-4", className)}>
          {/* Stats row - first 4 widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets.slice(0, 4).map((widget) => (
              <DraggableWidget
                key={widget.instanceId}
                id={widget.instanceId}
                isEditMode={isEditMode}
                onRemove={() => removeWidget(widget.instanceId)}
              >
                <WidgetRenderer widget={widget} />
              </DraggableWidget>
            ))}
          </div>

          {/* Charts row - next 2 widgets */}
          {widgets.length > 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {widgets.slice(4, 6).map((widget) => (
                <DraggableWidget
                  key={widget.instanceId}
                  id={widget.instanceId}
                  isEditMode={isEditMode}
                  onRemove={() => removeWidget(widget.instanceId)}
                >
                  <WidgetRenderer widget={widget} />
                </DraggableWidget>
              ))}
            </div>
          )}

          {/* Bottom row - remaining widgets */}
          {widgets.length > 6 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {widgets.slice(6).map((widget) => (
                <DraggableWidget
                  key={widget.instanceId}
                  id={widget.instanceId}
                  isEditMode={isEditMode}
                  onRemove={() => removeWidget(widget.instanceId)}
                  className={widget.widgetId === "recent-orders" ? "lg:col-span-2" : ""}
                >
                  <WidgetRenderer widget={widget} />
                </DraggableWidget>
              ))}
            </div>
          )}
        </div>
      </SortableContext>

      {/* Drag overlay - shows dragged item */}
      <DragOverlay>
        {activeWidget ? (
          <div className="opacity-80 shadow-2xl">
            <WidgetRenderer widget={activeWidget} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
