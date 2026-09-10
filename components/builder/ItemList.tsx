"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function IconButton({
  onClick,
  danger,
  title,
  children,
}: {
  onClick: () => void;
  danger?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold transition-colors",
        danger
          ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          : "text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
      )}
    >
      {children}
    </button>
  );
}

interface SortableItemProps {
  id: string;
  index: number;
  label: string;
  onRemove: () => void;
  children: ReactNode;
}

function SortableItem({ id, index, label, onRemove, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : undefined,
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-slate-200 bg-white",
        isDragging && "shadow-lg ring-2 ring-indigo-200"
      )}
    >
      <div className="flex items-center gap-2 rounded-lg px-3 py-2.5">
        <button
          type="button"
          className="inline-flex h-6 w-6 cursor-grab touch-none items-center justify-center rounded text-slate-300 transition-colors hover:bg-slate-200/70 hover:text-slate-500 active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-700"
          onClick={(e) => {
            const details = e.currentTarget.closest("details");
            if (details) details.open = !details.open;
          }}
        >
          {label}
        </button>
        <IconButton title="Remove" danger onClick={onRemove}>
          ×
        </IconButton>
      </div>
      <details className="border-t border-slate-100">
        <summary className="list-none cursor-pointer px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 [&::-webkit-details-marker]:hidden">
          {index === 0 ? "Edit" : "Edit"}
        </summary>
        <div className="px-3 pb-3">{children}</div>
      </details>
    </div>
  );
}

export function ItemList<T extends { id: string }>({
  items,
  addLabel,
  onAdd,
  onRemove,
  onMove,
  formatLabel,
  children,
}: {
  items: T[];
  addLabel: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
  formatLabel?: (item: T, index: number) => string;
  children: (item: T, index: number) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onMove(oldIndex, newIndex);
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              index={index}
              label={formatLabel ? formatLabel(item, index) : `Item ${index + 1}`}
              onRemove={() => onRemove(item.id)}
            >
              {children(item, index)}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700"
      >
        + {addLabel}
      </button>
    </div>
  );
}