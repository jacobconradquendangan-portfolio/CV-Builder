"use client";

import { useEffect, useState } from "react";
import { FormPanel } from "./builder/FormPanel";
import { Preview } from "./builder/Preview";
import { Topbar } from "./builder/Topbar";
import { AtsCheckPanel } from "./builder/AtsCheckPanel";
import { WelcomeModal } from "./builder/WelcomeModal";
import { useResumeStore } from "@/store/useResumeStore";

export function BuilderPage() {
  const [atsOpen, setAtsOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const setWelcomeOpen = useResumeStore((state) => state.setWelcomeOpen);

  useEffect(() => {
    if (!atsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAtsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [atsOpen]);

  return (
    <div className="app-shell flex h-screen min-h-0 flex-col overflow-hidden bg-[#f5f5f7]">
      <Topbar />
      <WelcomeModal />
      <div className="flex shrink-0 gap-2 border-b border-black/[0.08] bg-white/80 px-3 py-2 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => {
            setEditorOpen((open) => !open);
            if (editorOpen) setPreviewOpen(true);
          }}
          aria-expanded={editorOpen}
          className="flex min-w-0 flex-1 items-center justify-between rounded-[10px] bg-black/[0.05] px-3 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors active:bg-black/10"
        >
          <span>{editorOpen ? "Hide editor" : "Edit resume"}</span>
          <span aria-hidden="true" className="text-[#aeaeb2]">
            {editorOpen ? "↑" : "↓"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setPreviewOpen((open) => !open);
            if (previewOpen) setEditorOpen(true);
          }}
          aria-expanded={previewOpen}
          className="flex min-w-0 flex-1 items-center justify-between rounded-[10px] bg-black/[0.05] px-3 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors active:bg-black/10"
        >
          <span>{previewOpen ? "Hide preview" : "View preview"}</span>
          <span aria-hidden="true" className="text-[#aeaeb2]">
            {previewOpen ? "↑" : "↓"}
          </span>
        </button>
      </div>
      <button
        type="button"
        onClick={() => setAtsOpen(true)}
        className="glass fixed bottom-4 right-16 z-40 rounded-full border border-black/10 px-4 py-2 text-[13px] font-medium text-[#1d1d1f] shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200 hover:bg-white active:scale-95 xl:hidden"
      >
        ATS Check
      </button>
      <button
        type="button"
        onClick={() => setWelcomeOpen(true)}
        aria-label="Open welcome guide"
        title="Open welcome guide"
        className="fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-sm font-semibold text-[#6e6e73] shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-200 hover:bg-white hover:text-[#1d1d1f] active:scale-95"
      >
        ?
      </button>
      <div className="app-main flex min-h-0 flex-1 flex-col gap-0 lg:flex-row lg:gap-3 lg:p-3">
        <div className={editorOpen ? "contents" : "hidden lg:contents"}>
          <div className="contents lg:overflow-hidden lg:rounded-[18px] lg:border lg:border-black/[0.08] lg:bg-white lg:shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <FormPanel mobileFullHeight={!previewOpen} />
          </div>
        </div>
        <div className={previewOpen ? "contents" : "hidden lg:contents"}>
          <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:overflow-hidden lg:rounded-[18px] lg:border lg:border-black/[0.08] lg:shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <Preview />
          </div>
        </div>
        <aside className="scrollbar-hidden hidden h-full w-[340px] shrink-0 overflow-y-auto rounded-[18px] border border-black/[0.08] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] xl:block">
          <div className="glass sticky top-0 z-10 border-b border-black/[0.06] px-4 py-3">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">ATS Check</h2>
            <p className="text-[12px] text-[#6e6e73]">
              Live review of how well your resume survives applicant tracking systems.
            </p>
          </div>
          <div className="px-3 py-3">
            <AtsCheckPanel />
          </div>
        </aside>
      </div>
      {atsOpen && (
        <div className="animate-fade fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-ats-title">
          <button
            type="button"
            aria-label="Close ATS check"
            onClick={() => setAtsOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/30 backdrop-blur-sm"
          />
          <aside className="welcome-modal-scroll absolute inset-y-0 right-0 w-[min(90vw,360px)] overflow-y-auto rounded-l-[20px] border-l border-black/[0.08] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
            <div className="glass sticky top-0 z-10 flex items-start justify-between border-b border-black/[0.06] px-4 py-3">
              <div>
                <h2 id="mobile-ats-title" className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                  ATS Check
                </h2>
                <p className="mt-0.5 text-[12px] leading-relaxed text-[#6e6e73]">
                  Live review of your resume for applicant tracking systems.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAtsOpen(false)}
                aria-label="Close ATS check"
                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-lg leading-none text-[#6e6e73] transition-colors hover:bg-black/10 hover:text-[#1d1d1f] active:scale-95"
              >
                ×
              </button>
            </div>
            <div className="px-3 py-3">
              <AtsCheckPanel />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}