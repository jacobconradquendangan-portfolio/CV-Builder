"use client";

import { useEffect, useRef, useState } from "react";
import { Resume } from "@/components/resume/Resume";
import { useResumeStore } from "@/store/useResumeStore";

export const RESUME_WIDTH = 794;
const PAGE_PADDING = 48; // p-6 on both sides of the viewport

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

  return (
    <div
      ref={viewportRef}
      className="preview-viewport scrollbar-hidden min-h-0 min-w-0 w-full flex-1 overflow-auto bg-slate-200/70 p-3 sm:p-6"
    >
      <div
        className="resume-scale-wrap flex min-h-full w-full justify-center"
        style={{ height: contentHeight * scale }}
      >
        <div
          id="resume-print"
          className="shadow-xl"
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
        </div>
      </div>
    </div>
  );
}