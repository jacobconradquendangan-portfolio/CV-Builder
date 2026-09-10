"use client";

import { useEffect, useRef, useState } from "react";
import { Resume } from "@/components/resume/Resume";
import { useResumeStore } from "@/store/useResumeStore";
import { PAGE_PADDING, PRINTED_PAGE_HEIGHT, estimatePageCount } from "@/lib/utils";

export const RESUME_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

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
      className="preview-viewport scrollbar-hidden relative min-h-0 min-w-0 w-full flex-1 overflow-auto bg-[#e8e8ed] p-3 sm:p-8"
    >
      <div className="glass mx-auto mb-4 flex max-w-[794px] items-center justify-between rounded-full py-1.5 pl-3 pr-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] print:hidden">
        <span className="flex items-center gap-2 text-[13px] font-medium text-[#1d1d1f]">
          <span
            className={
              pageCount === 1 ? "h-2 w-2 rounded-full bg-[#34c759]" : "h-2 w-2 rounded-full bg-[#ff9f0a]"
            }
          />
          {pageCount === 1 ? "Single Page · A4" : `${pageCount} Pages · A4`}
        </span>
        <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#6e6e73]">
          {Math.round(scale * 100)}%
        </span>
      </div>

      <div
        className="resume-scale-wrap flex min-h-full w-full justify-center"
        style={{ height: contentHeight * scale }}
      >
        <div
          id="resume-print"
          className="relative overflow-hidden rounded-[4px] shadow-[0_8px_40px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.12)] ring-1 ring-black/10"
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
            // Markers use the printed-page height (A4 minus the repeated
            // top/bottom gutter) so they line up with where the browser
            // actually breaks the page; the page count itself uses the full
            // A4 height to avoid a phantom blank page at exact multiples.
            const topPx = pageNum * PRINTED_PAGE_HEIGHT * scale;
            return (
              <div
                key={pageNum}
                className="print:hidden pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                style={{ top: `${topPx}px` }}
              >
                <div className="w-full border-b-2 border-dashed border-[#ff3b30]/70" />
                <span className="absolute right-3 -translate-y-1/2 rounded-full bg-[#1d1d1f]/85 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-lg backdrop-blur">
                  Page {pageNum} / {pageNum + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}