"use client";

import { useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";
import { exportResumeToDocx } from "@/lib/exportDocx";
import type { TemplateId } from "@/lib/types";

const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "minimal", label: "Minimal" },
  { id: "sidebar", label: "Sidebar" },
  { id: "ats", label: "ATS Friendly" },
];

const ACCENTS = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Teal", value: "#0d9488" },
  { name: "Emerald", value: "#059669" },
  { name: "Rose", value: "#e11d48" },
  { name: "Amber", value: "#b45309" },
  { name: "Sky", value: "#0369a1" },
  { name: "Slate", value: "#334155" },
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#6b7280" },
  { name: "White", value: "#ffffff" },
];

const secondaryButton =
  "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50";

export function Topbar() {
  const templateId = useResumeStore((state) => state.templateId);
  const setTemplateId = useResumeStore((state) => state.setTemplateId);
  const accent = useResumeStore((state) => state.accent);
  const setAccent = useResumeStore((state) => state.setAccent);
  const loadSample = useResumeStore((state) => state.loadSample);
  const clear = useResumeStore((state) => state.clear);
  const setWelcomeOpen = useResumeStore((state) => state.setWelcomeOpen);
  const data = useResumeStore((state) => state.data);

  const handleExportDocx = async () => {
    try {
      await exportResumeToDocx(data);
    } catch {
      window.alert("Could not export as DOCX. Please try again.");
    } finally {
      setDownloadOpen(false);
    }
  };

  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!downloadOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [downloadOpen]);

  return (
    <header className="z-20 flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-[15px] font-bold tracking-tight text-slate-900">
            CV<span className="text-indigo-600">Builder</span>
          </h1>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-700">
            v1.0.0
          </span>
        </div>

        <div className="flex items-center gap-5 sm:mx-auto">
          <label className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500">
            Template
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value as TemplateId)}
              className="max-w-[145px] rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {TEMPLATE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Accent color">
          {ACCENTS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.name}
              aria-label={`Accent ${color.name}`}
              onClick={() => setAccent(color.value)}
              className={cn(
                "h-5 w-5 rounded-full border border-slate-300/80 transition-transform hover:scale-110",
                accent === color.value && "ring-2 ring-slate-400 ring-offset-2"
              )}
              style={{ backgroundColor: color.value }}
            />
          ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 border-t border-slate-100 pt-2 lg:w-auto lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
        <button type="button" onClick={loadSample} className={secondaryButton}>
          Load sample
        </button>
        <button
          type="button"
          onClick={() => setWelcomeOpen(true)}
          aria-label="Open welcome guide"
          title="Open welcome guide"
          className="fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-bold text-slate-600 shadow-lg transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          ?
        </button>
        <button
          type="button"
          onClick={clear}
          className={cn(secondaryButton, "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600")}
        >
          Clear
        </button>
        <div ref={downloadRef} className="relative">
          <button
            type="button"
            onClick={() => setDownloadOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={downloadOpen}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m6 9 6 6 6-6" />
              <path d="M5 21h14" />
            </svg>
            Download
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {downloadOpen && (
            <div role="menu" className="absolute right-0 z-30 mt-1.5 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDownloadOpen(false);
                  window.print();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>
                  <span className="block font-medium">Save as PDF</span>
                  <span className="block text-[11px] text-slate-400">Best for printing &amp; final submission</span>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleExportDocx}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>
                  <span className="block font-medium">Save as DOCX</span>
                  <span className="block text-[11px] text-slate-400">Editable in Word &amp; Google Docs</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}