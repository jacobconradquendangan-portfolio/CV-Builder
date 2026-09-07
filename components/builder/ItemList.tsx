"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function IconButton({
  onClick,
  disabled,
  danger,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold transition-colors",
        danger
          ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          : "text-slate-400 hover:bg-slate-200/70 hover:text-slate-700",
        disabled && "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-slate-400"
      )}
    >
      {children}
    </button>
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
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.id}
          className="rounded-lg border border-slate-200 bg-white"
          open={index === 0}
        >
          <summary className="flex cursor-pointer select-none list-none items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 [&::-webkit-details-marker]:hidden">
            <span className="truncate">{formatLabel ? formatLabel(item, index) : `Item ${index + 1}`}</span>
            <span
              className="flex shrink-0 items-center gap-0.5"
              onClick={(event) => event.preventDefault()}
            >
              <IconButton title="Move up" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
                ↑
              </IconButton>
              <IconButton
                title="Move down"
                disabled={index === items.length - 1}
                onClick={() => onMove(index, index + 1)}
              >
                ↓
              </IconButton>
              <IconButton title="Remove" danger onClick={() => onRemove(item.id)}>
                ×
              </IconButton>
            </span>
          </summary>
          <div className="border-t border-slate-100 px-3 pb-3">{children(item, index)}</div>
        </details>
      ))}
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