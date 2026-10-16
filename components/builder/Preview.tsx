"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Resume } from "@/components/resume/Resume";
import { useResumeStore } from "@/store/useResumeStore";
import type { DesignTheme, TemplateId } from "@/lib/types";
import { PAGE_PADDING, PRINTED_PAGE_HEIGHT, estimatePageCount } from "@/lib/utils";

export const RESUME_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

const DESIGN_FONTS: Record<DesignTheme["fontFamily"], string> = {
  sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", "Nimbus Roman", serif',
  mono: 'ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace',
  rounded: 'ui-rounded, "SF Pro Rounded", -apple-system, "Segoe UI", sans-serif',
};

/**
 * Scoped override so Design settings apply to every template without
 * rewriting them. `#resume-inner` ID selectors beat Tailwind utilities and
 * keep the selected font family consistent across templates.
 */
function designCss(theme: DesignTheme, templateId: TemplateId, hasPhoto: boolean): string {
  const nameDelta = theme.nameSize - 30;
  const lineDelta = theme.lineHeight - 1.6;
  const photoDelta = hasPhoto ? theme.photoSize - 96 : 0;
  const customPhotoShape = hasPhoto && theme.photoShape !== "circle";
  const supportsHeadlineLines = templateId !== "modern" && templateId !== "sidebar";
  const headingStyle = supportsHeadlineLines ? theme.headingStyle ?? "template" : "template";
  const fontRule = `#resume-inner, #resume-inner > div { font-family: ${DESIGN_FONTS[theme.fontFamily]} !important; }`;
  const lineRule = lineDelta ? `#resume-inner, #resume-inner * { line-height: ${theme.lineHeight} !important; }` : "";
  const nameRule = nameDelta ? `#resume-inner h1 { font-size: ${theme.nameSize}px !important; }` : "";
  const photoSizeRule =
    photoDelta
      ? `#resume-inner img[alt=""] { width: ${theme.photoSize}px !important; height: ${theme.photoSize}px !important; }`
      : "";
  const photoShapeRule = customPhotoShape ? `#resume-inner img[alt=""] { border-radius: ${theme.photoShape === "rounded" ? "16px" : "0"} !important; }` : "";
  // Bullets: BulletList renders <span class="... rounded-full"> dots inside <li class="flex"> rows.
  // Dash/square override the first span in each row; none hides it and removes the row gap.
  const bulletRule =
    theme.bulletStyle === "none"
      ? `#resume-inner li.flex > span:first-child { display: none !important; } #resume-inner li.flex { gap: 0 !important; }`
      : theme.bulletStyle === "dashes"
        ? `#resume-inner li.flex > span:first-child { border-radius: 0 !important; height: 2px !important; width: 8px !important; margin-top: 7px !important; }`
        : theme.bulletStyle === "squares"
          ? `#resume-inner li.flex > span:first-child { border-radius: 0 !important; }`
          : "";
  // Headline lines: restyle every template's h2. Template keeps native look;
  // rule/underline/none strip native decoration first, then apply the chosen style.
  const stripNativeHeadings =
    headingStyle === "rule" || headingStyle === "underline" || headingStyle === "none"
      ? `#resume-inner h2 > span[class*="bg-"], #resume-inner h2 + span[class*="bg-"], #resume-inner h2 span.h-px, #resume-inner span.h-px, #resume-inner h2 span[class*="w-"] { display: none !important; } #resume-inner h2 { border: none !important; background: none !important; padding-bottom: 0 !important; }`
      : "";
  const applyHeadingStyle =
    headingStyle === "rule"
      ? `#resume-inner h2 { display: flex !important; align-items: center !important; gap: 8px !important; } #resume-inner h2::after { content: "" !important; display: block !important; width: auto !important; height: 2px !important; flex: 1 1 auto !important; background: var(--accent-fg) !important; }`
      : headingStyle === "underline"
        ? `#resume-inner h2 { border-bottom: 2px solid var(--accent-fg) !important; padding-bottom: 6px !important; }`
        : "";
  return [fontRule, lineRule, nameRule, photoSizeRule, photoShapeRule, bulletRule, stripNativeHeadings, applyHeadingStyle]
    .filter(Boolean)
    .join("\n");
}

export function Preview() {
  const data = useResumeStore((state) => state.data);
  const templateId = useResumeStore((state) => state.templateId);
  const accent = useResumeStore((state) => state.accent);
  const design = useResumeStore((state) => state.design);
  const contentHeight = useResumeStore((state) => state.contentHeight);
  const setContentHeight = useResumeStore((state) => state.setContentHeight);

  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const scaledFontElementsRef = useRef(
    new Map<HTMLElement, { value: string; priority: string }>()
  );
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    for (const [element, original] of scaledFontElementsRef.current) {
      if (original.value) {
        element.style.setProperty("font-size", original.value, original.priority);
      } else {
        element.style.removeProperty("font-size");
      }
    }
    scaledFontElementsRef.current.clear();

    const scaleByElement = new Map<HTMLElement, number>();
    const addElements = (selector: string, fontScale: number) => {
      if (fontScale === 1) return;
      for (const element of inner.querySelectorAll<HTMLElement>(selector)) {
        scaleByElement.set(element, fontScale);
      }
    };

    addElements("p, p *, li, li *, h3, h3 *", design.baseSize / 12);
    addElements("h2, h2 *", design.headingSize / 11);

    const fontSizes = [...scaleByElement].map(([element, fontScale]) => ({
      element,
      fontScale,
      fontSize: Number.parseFloat(window.getComputedStyle(element).fontSize),
      originalValue: element.style.getPropertyValue("font-size"),
      originalPriority: element.style.getPropertyPriority("font-size"),
    }));

    for (const { element, fontScale, fontSize, originalValue, originalPriority } of fontSizes) {
      if (!Number.isFinite(fontSize)) continue;
      scaledFontElementsRef.current.set(element, {
        value: originalValue,
        priority: originalPriority,
      });
      element.style.setProperty("font-size", `${fontSize * fontScale}px`, "important");
    }
  }, [data, design.baseSize, design.headingSize, templateId]);

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
  }, [data, templateId, accent, design, setContentHeight]);

  const pageCount = estimatePageCount(contentHeight);
  const overrideCss = designCss(design, templateId, Boolean(data.personal.photo?.trim()));

  return (
    <div
      ref={viewportRef}
      className="preview-viewport scrollbar-hidden relative min-h-0 min-w-0 w-full flex-1 overflow-auto bg-[#e8e8ed] p-3 sm:p-8"
    >
      <div className="glass mx-auto mb-4 flex max-w-198.5 items-center justify-between rounded-full py-1.5 pl-3 pr-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] print:hidden">
        <span className="flex items-center gap-2 text-[13px] font-medium text-[#1d1d1f]">
          <span
            className={
              pageCount === 1 ? "h-2 w-2 rounded-full bg-[#34c759]" : "h-2 w-2 rounded-full bg-[#ff9f0a]"
            }
          />
          {pageCount === 1 ? "Single Page · A4" : `${pageCount} Pages · A4`}
        </span>
        <span className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#6e6e73]">
          {Math.round(scale * 100)}%
        </span>
      </div>

      <div
        className="resume-scale-wrap flex min-h-full w-full justify-center"
        style={{ height: contentHeight * scale }}
      >
        <div
          id="resume-print"
          className="relative overflow-hidden rounded-sm shadow-[0_8px_40px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.12)] ring-1 ring-black/10"
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
            {overrideCss && <style>{overrideCss}</style>}
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