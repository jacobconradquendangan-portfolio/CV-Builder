"use client";

import { useEffect, useState } from "react";
import { FormPanel } from "./builder/FormPanel";
import { Preview } from "./builder/Preview";
import { Topbar } from "./builder/Topbar";
import { AtsCheckPanel } from "./builder/AtsCheckPanel";
import { WelcomeModal } from "./builder/WelcomeModal";

export function BuilderPage() {
  const [atsOpen, setAtsOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);

  useEffect(() => {
    if (!atsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAtsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [atsOpen]);

  return (
    <div className="app-shell flex h-screen min-h-0 flex-col overflow-hidden bg-slate-100">
      <Topbar />
      <WelcomeModal />
      <div className="flex shrink-0 gap-2 border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => {
            setEditorOpen((open) => !open);
            if (editorOpen) setPreviewOpen(true);
          }}
          aria-expanded={editorOpen}
          className="flex min-w-0 flex-1 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <span>{editorOpen ? "Hide editor" : "Edit resume"}</span>
          <span aria-hidden="true" className="text-base text-slate-400">
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
          className="flex min-w-0 flex-1 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <span>{previewOpen ? "Hide preview" : "View preview"}</span>
          <span aria-hidden="true" className="text-base text-slate-400">
            {previewOpen ? "↑" : "↓"}
          </span>
        </button>
      </div>
      <button
        type="button"
        onClick={() => setAtsOpen(true)}
        className="fixed bottom-4 right-16 z-40 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg transition-colors hover:bg-slate-50 xl:hidden"
      >
        ATS Check
      </button>
      <div className="app-main flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className={editorOpen ? "contents" : "hidden lg:contents"}>
          <FormPanel mobileFullHeight={!previewOpen} />
        </div>
        <div className={previewOpen ? "contents" : "hidden lg:contents"}>
          <Preview />
        </div>
        <aside className="hidden h-full w-[340px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white xl:block">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-3 py-2.5">
            <h2 className="text-sm font-semibold text-slate-800">ATS Check</h2>
            <p className="text-[11px] text-slate-500">
              Live review of how well your resume survives applicant tracking systems.
            </p>
          </div>
          <div className="px-3 py-3">
            <AtsCheckPanel />
          </div>
        </aside>
      </div>
      {atsOpen && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-ats-title">
          <button
            type="button"
            aria-label="Close ATS check"
            onClick={() => setAtsOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-slate-900/45"
          />
          <aside className="welcome-modal-scroll absolute inset-y-0 right-0 w-[min(90vw,360px)] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-4 py-3">
              <div>
                <h2 id="mobile-ats-title" className="text-sm font-semibold text-slate-800">
                  ATS Check
                </h2>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  Live review of your resume for applicant tracking systems.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAtsOpen(false)}
                aria-label="Close ATS check"
                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-lg leading-none text-slate-500 hover:bg-slate-50 hover:text-slate-800"
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