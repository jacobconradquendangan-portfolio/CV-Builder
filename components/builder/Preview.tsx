"use client";

import { useEffect, useRef, useState } from "react";
import { Resume } from "@/components/resume/Resume";
import { useResumeStore } from "@/store/useResumeStore";

export const RESUME_WIDTH = 794;
export const PAGE_HEIGHT = 1123;
/**
 * The printed resume root uses vertical padding on every page fragment. In the
 * browser print layout, the break threshold is the A4 height minus that padding,
 * not just the top edge. This keeps the preview cutoff aligned with the actual
 * page break before sections such as Skills land on the next page.
 */
const A4_PAGE_HEIGHT = 1123;
const PAGE_PADDING = 48; // py-12 on the resume root (top + bottom padding)
const PRINTED_PAGE_HEIGHT = A4_PAGE_HEIGHT - PAGE_PADDING * 2;

function estimatePageCount(contentHeight: number): number {
  if (contentHeight <= 0) return 1;
  // Count full A4 pages as they truly land on the page; adding the vertical
  // padding back in here creates a phantom blank second page when the resume
  // reaches the exact page height.
  return Math.max(1, Math.ceil(contentHeight / A4_PAGE_HEIGHT));
}

export function Preview() {
  const data = useResumeStore((state) => state.data);
  const templateId = useResumeStore((state) => state.templateId);
  const accent = useResumeStore((state) => state.accent);
  const contentHeight = useResumeStore((state) => state.contentHeight);
  const setContentHeight = useResumeStore((state) => state.setContentHeight);

  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const isMobile = window.innerWidth < 640;
      const availableWidth = isMobile ? window.innerWidth : viewport.clientWidth;
      const padding = isMobile ? 24 : PAGE_PADDING;
      const width = Math.max(280, availableWidth - padding);
      setScale(Math.min(1, width / RESUME_WIDTH));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const measureHeight = () => setContentHeight(inner.offsetHeight);
    measureHeight();
    const observer = new ResizeObserver(measureHeight);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [data, templateId, accent, setContentHeight]);

  const pageCount = estimatePageCount(contentHeight);

  return (
    <div
      ref={viewportRef}
      className="preview-viewport scrollbar-hidden relative min-h-0 min-w-0 w-full flex-1 overflow-auto bg-slate-200/70 p-3 sm:p-6"
    >
      <div className="mx-auto mb-3 flex max-w-[794px] items-center justify-between text-xs font-medium text-slate-600 print:hidden">
        <span className="flex items-center gap-1.5 rounded-full border border-slate-300/80 bg-white/90 px-2.5 py-1 shadow-xs backdrop-blur-xs">
          <span
            className={
              pageCount === 1 ? "h-2 w-2 rounded-full bg-emerald-500" : "h-2 w-2 rounded-full bg-amber-500"
            }
          />
          {pageCount === 1 ? "Single Page (A4)" : `${pageCount} Pages (A4)`}
        </span>
        <span className="text-[11px] text-slate-500">
          Scale: {Math.round(scale * 100)}%
        </span>
      </div>

      <div
        className="resume-scale-wrap flex min-h-full w-full justify-center"
        style={{ height: contentHeight * scale }}
      >
        <div
          id="resume-print"
          className="relative shadow-xl"
          style={{ width: RESUME_WIDTH * scale, height: contentHeight * scale }}
        >
          <div
            ref={innerRef}
            id="resume-inner"
            style={{
              width: RESUME_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <Resume data={data} templateId={templateId} accent={accent} />
          </div>

          {/* Visual Page Break Line Indicators */}
          {Array.from({ length: pageCount - 1 }).map((_, index) => {
            const pageNum = index + 1;
            // Align each cutoff marker with the same printed-page height used for
            // the page count calculation, including the repeated top padding.
            const topPx = pageNum * PRINTED_PAGE_HEIGHT * scale;
            return (
              <div
                key={pageNum}
                className="print:hidden pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                style={{ top: `${topPx}px` }}
              >
                <div className="w-full border-b-2 border-dashed border-rose-500 shadow-xs" />
                <span className="absolute right-3 -translate-y-1/2 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                  PDF Page {pageNum} / {pageNum + 1} Cutoff
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}