"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";
import { exportResumeToDocx } from "@/lib/exportDocx";
import { readResumePdf, type ResumePdfImport } from "@/lib/importResumePdf";
import type { TemplateId } from "@/lib/types";
import { PdfImportDialog } from "./PdfImportDialog";

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
  "rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur transition-all duration-200 hover:bg-white active:scale-[0.98]";

export function Topbar() {
  const templateId = useResumeStore((state) => state.templateId);
  const setTemplateId = useResumeStore((state) => state.setTemplateId);
  const accent = useResumeStore((state) => state.accent);
  const setAccent = useResumeStore((state) => state.setAccent);
  const loadSample = useResumeStore((state) => state.loadSample);
  const clear = useResumeStore((state) => state.clear);
  const data = useResumeStore((state) => state.data);
  const setData = useResumeStore((state) => state.setData);

  const normalizedAccent = accent.toLowerCase();
  const selectedColor = ACCENTS.find((color) => color.value.toLowerCase() === normalizedAccent);
  const isCustomAccent = !selectedColor;
  // <input type="color"> only accepts #rrggbb — fall back when accent is malformed.
  const colorInputValue = /^#[0-9a-f]{6}$/i.test(accent) ? accent : "#4f46e5";

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
  const [pendingPdfImport, setPendingPdfImport] = useState<ResumePdfImport | null>(null);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [pdfImportError, setPdfImportError] = useState("");
  const downloadRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handlePdfSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setIsReadingPdf(true);
    setPdfImportError("");
    try {
      setPendingPdfImport(await readResumePdf(file));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown PDF reading error.";
      setPdfImportError(`Could not read this PDF. ${detail}`);
    } finally {
      setIsReadingPdf(false);
      input.value = "";
    }
  };

  const confirmPdfImport = () => {
    if (!pendingPdfImport) return;
    setData({
      ...pendingPdfImport.data,
      personal: {
        ...pendingPdfImport.data.personal,
        photo: data.personal.photo,
      },
    });
    setPendingPdfImport(null);
  };

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
    <header className="glass-strong sticky top-0 z-20 flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-black/8 px-3 py-2.5 sm:px-5">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-b from-[#2c2c2e] to-black text-[13px] font-bold text-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            C
          </span>
          <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            CV Builder
          </h1>
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#6e6e73]">
            v1.1.1
          </span>
          <a
            href="https://portfolio-website-v2-gray.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#6e6e73] transition-colors hover:bg-black/10 hover:text-[#1d1d1f]"
          >
            Visit my portfolio
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </div>

        <div className="flex w-full items-center justify-between gap-2 sm:mx-auto sm:w-auto sm:justify-center sm:gap-5">
          <label className="flex min-w-0 flex-1 items-center gap-2 text-[13px] text-[#6e6e73] sm:flex-none">
            Template
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value as TemplateId)}
              className="min-w-0 flex-1 cursor-pointer appearance-none rounded-full border border-black/10 bg-white/70 py-1.5 pl-3 pr-8 text-[13px] font-medium text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur transition-all duration-200 hover:bg-white focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/15 sm:max-w-37.5 sm:flex-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%236e6e73' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              {TEMPLATE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-1 items-center gap-2 text-[13px] text-[#6e6e73] sm:hidden">
            Color
            <select
              value={selectedColor?.value ?? "custom"}
              onChange={(event) => {
                if (event.target.value !== "custom") setAccent(event.target.value);
              }}
              aria-label="Accent color"
              className="min-w-0 flex-1 cursor-pointer rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f]"
            >
              {ACCENTS.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.name}
                </option>
              ))}
              {isCustomAccent && <option value="custom">Custom ({accent})</option>}
            </select>
          </label>

          <div className="hidden items-center gap-1 rounded-full border border-black/8 bg-white/60 px-1.5 py-1.5 backdrop-blur sm:flex" role="radiogroup" aria-label="Accent color">
            {ACCENTS.map((color) => {
              const isSelected = color.value.toLowerCase() === normalizedAccent;
              return (
                <button
                  key={color.value}
                  type="button"
                  title={color.name}
                  aria-label={`Accent ${color.name}`}
                  aria-pressed={isSelected}
                  onClick={() => setAccent(color.value)}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
                    isSelected && "bg-[#0071e3]/10"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-4.5 w-4.5 rounded-full transition-all duration-200",
                      isSelected
                        ? "ring-2 ring-[#0071e3] ring-offset-2 ring-offset-white"
                        : "ring-1 ring-black/15"
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                </button>
              );
            })}
            <label
              title={isCustomAccent ? `Custom color ${accent} (selected)` : "Pick a custom color"}
              className={cn(
                "relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
                isCustomAccent && "bg-[#0071e3]/10"
              )}
            >
              <span className="sr-only">Pick a custom accent color</span>
              <input
                type="color"
                value={colorInputValue}
                onChange={(event) => setAccent(event.target.value)}
                aria-label="Pick a custom accent color"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold",
                  isCustomAccent
                    ? "bg-[conic-gradient(from_0deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)] ring-2 ring-[#0071e3] ring-offset-2 ring-offset-white"
                    : "bg-[conic-gradient(from_0deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)] ring-1 ring-black/15"
                )}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-2 border-t border-black/6 pt-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end lg:w-auto lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handlePdfSelection}
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a resume PDF to import"
        />
        <button
          type="button"
          onClick={() => pdfInputRef.current?.click()}
          disabled={isReadingPdf}
          className={cn(secondaryButton, "w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto")}
        >
          {isReadingPdf ? "Reading PDF…" : (
            <>
              Import PDF
              <span className="rounded-full bg-[#0071e3]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0071e3]">
                Beta
              </span>
            </>
          )}
        </button>
        <button type="button" onClick={loadSample} className={cn(secondaryButton, "w-full sm:w-auto")}>
          Load sample
        </button>
        <button
          type="button"
          onClick={clear}
          className={cn(secondaryButton, "w-full hover:border-red-300 hover:bg-red-50 hover:text-red-600 sm:w-auto")}
        >
          Clear
        </button>
        <div ref={downloadRef} className="relative w-full sm:ml-auto sm:w-auto">
          <button
            type="button"
            onClick={() => setDownloadOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={downloadOpen}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0071e3] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(0,113,227,0.35)] transition-all duration-200 hover:bg-[#0077ed] hover:shadow-[0_4px_12px_rgba(0,113,227,0.4)] active:scale-[0.97] sm:w-auto"
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
            <div role="menu" className="animate-fade absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-black/8 bg-white/90 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDownloadOpen(false);
                  window.print();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[#1d1d1f] transition-colors hover:bg-black/4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#0071e3]/10 text-[#0071e3]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </span>
                <span>
                  <span className="block text-[13px] font-semibold">Save as PDF</span>
                  <span className="block text-[11px] text-[#6e6e73]">Best for printing &amp; final submission</span>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleExportDocx}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[#1d1d1f] transition-colors hover:bg-black/4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#34c759]/10 text-[#248a3d]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <span>
                  <span className="block text-[13px] font-semibold">Save as DOCX</span>
                  <span className="block text-[11px] text-[#6e6e73]">Editable in Word &amp; Google Docs</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
      {pendingPdfImport && (
        createPortal(
          <PdfImportDialog
            result={pendingPdfImport}
            onCancel={() => setPendingPdfImport(null)}
            onConfirm={confirmPdfImport}
          />,
          document.body
        )
      )}
      {pdfImportError && (
        <div
          role="alert"
          className="animate-rise fixed bottom-5 left-1/2 z-70 flex w-[min(92vw,520px)] -translate-x-1/2 items-start justify-between gap-4 rounded-2xl border border-red-200 bg-white px-4 py-3 text-[13px] leading-relaxed text-red-700 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        >
          <span>{pdfImportError}</span>
          <button
            type="button"
            onClick={() => setPdfImportError("")}
            aria-label="Dismiss PDF import error"
            className="shrink-0 rounded-full px-2 font-semibold text-red-500 hover:bg-red-50"
          >
            ×
          </button>
        </div>
      )}
    </header>
  );
}