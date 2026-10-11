"use client";

import { useEffect } from "react";
import type { ResumePdfImport } from "@/lib/importResumePdf";

const PREVIEW_SECTIONS = [
  {
    label: "Experience",
    items: (result: ResumePdfImport) =>
      result.data.experience.map((item) => [item.role, item.company].filter(Boolean).join(" · ")),
  },
  {
    label: "Education",
    items: (result: ResumePdfImport) =>
      result.data.education.map((item) => [item.degree, item.school].filter(Boolean).join(" · ")),
  },
  { label: "Projects", items: (result: ResumePdfImport) => result.data.projects.map((item) => item.name) },
  { label: "Skills", items: (result: ResumePdfImport) => result.data.skills.map((item) => item.name) },
  {
    label: "Languages",
    items: (result: ResumePdfImport) =>
      result.data.languages.map((item) => [item.name, item.level].filter(Boolean).join(" · ")),
  },
  {
    label: "Certifications",
    items: (result: ResumePdfImport) => result.data.certifications.map((item) => item.name),
  },
  { label: "Awards", items: (result: ResumePdfImport) => result.data.awards.map((item) => item.name) },
] as const;

export function PdfImportDialog({
  result,
  onCancel,
  onConfirm,
}: {
  result: ResumePdfImport;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { personal } = result.data;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="animate-fade fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-import-title"
        className="welcome-modal-scroll animate-rise max-h-[min(92dvh,820px)] w-full max-w-2xl overflow-y-auto rounded-[22px] border border-black/[0.08] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
      >
        <header className="border-b border-black/[0.06] px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0071e3]">
                Local PDF import · {result.pageCount} {result.pageCount === 1 ? "page" : "pages"}
              </p>
              <h2
                id="pdf-import-title"
                className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-[#1d1d1f]"
              >
                Review extracted resume
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6e6e73]">
                Check the details below. Confirming replaces your current resume; you can then edit
                anything the PDF parser didn&apos;t recognize.
              </p>
            </div>
            <button
              type="button"
              aria-label="Cancel PDF import"
              onClick={onCancel}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-lg text-[#6e6e73] transition-colors hover:bg-black/10"
            >
              ×
            </button>
          </div>
        </header>

        <div className="space-y-5 px-5 py-5 sm:px-7">
          <div className="rounded-2xl border border-black/[0.07] bg-[#f7f7f8] px-4 py-3.5">
            <p className="text-[16px] font-semibold text-[#1d1d1f]">
              {personal.fullName || "Name not detected"}
            </p>
            <p className="mt-0.5 text-[13px] text-[#6e6e73]">
              {personal.jobTitle || "Job title not detected"}
            </p>
            <p className="mt-2 break-words text-[12px] leading-relaxed text-[#6e6e73]">
              {[personal.email, personal.phone, personal.location].filter(Boolean).join(" · ") ||
                "No contact details detected"}
            </p>
            <p className="mt-1 break-words text-[12px] leading-relaxed text-[#0071e3]">
              {[personal.website, personal.linkedin].filter(Boolean).join(" · ") ||
                "No portfolio or LinkedIn links detected"}
            </p>
            {personal.summary && (
              <p className="mt-3 line-clamp-3 border-t border-black/[0.06] pt-3 text-[12px] leading-relaxed text-[#4b4b50]">
                {personal.summary}
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-[12px] font-semibold text-[#6e6e73]">Detected sections</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PREVIEW_SECTIONS.map((section) => (
                <div
                  key={section.label}
                  className="rounded-xl border border-black/[0.06] px-3 py-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#4b4b50]">{section.label}</span>
                    <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#6e6e73]">
                      {section.items(result).length}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {section.items(result).slice(0, 3).map((item, index) => (
                      <li
                        key={`${section.label}-${index}`}
                        className="truncate text-[11px] leading-relaxed text-[#6e6e73]"
                        title={item}
                      >
                        {item}
                      </li>
                    ))}
                    {section.items(result).length > 3 && (
                      <li className="text-[10px] text-[#0071e3]">
                        +{section.items(result).length - 3} more
                      </li>
                    )}
                    {section.items(result).length === 0 && (
                      <li className="text-[11px] text-[#aeaeb2]">None detected</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <details className="group rounded-2xl border border-black/[0.07]">
            <summary className="cursor-pointer list-none px-4 py-3 text-[13px] font-medium text-[#0071e3] [&::-webkit-details-marker]:hidden">
              Inspect all extracted text
              <span className="float-right text-[#aeaeb2] transition-transform group-open:rotate-180">
                ↓
              </span>
            </summary>
            <pre className="max-h-56 overflow-auto border-t border-black/[0.06] bg-[#f7f7f8] px-4 py-3 text-[11px] leading-relaxed whitespace-pre-wrap text-[#4b4b50]">
              {result.extractedText}
            </pre>
          </details>

          <p className="rounded-xl bg-[#0071e3]/[0.06] px-3.5 py-3 text-[12px] leading-relaxed text-[#3a3a3c]">
            Your PDF is read on this device and is not uploaded. Scanned/image-only PDFs are not
            supported yet. Your current profile photo will be kept.
          </p>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-black/[0.06] bg-[#fafafa] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.03]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-[#0071e3] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all hover:bg-[#0077ed] active:scale-[0.98]"
          >
            Replace current CV
          </button>
        </footer>
      </section>
    </div>
  );
}
