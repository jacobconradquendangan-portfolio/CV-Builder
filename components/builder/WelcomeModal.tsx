"use client";

import { useCallback, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";

const STORAGE_KEY = "cv-builder-welcome-seen";

const FEATURES = [
  "5 resume templates — Modern, Classic, Minimal, Sidebar & ATS-Friendly",
  "10 accent colors, including plain black & white",
  "Optional photo upload (stored on your device only)",
  "Export as PDF (text-selectable) or DOCX (editable)",
  "Live ATS self-check panel on the right",
  "Optional job-description keyword coverage check — processed on this device",
  "Your resume details and images stay in this browser — nothing is sent to or collected by this app",
];

const STEPS = [
  "Fill in your details — use the tabs on the left to add experience, education, skills, projects and more.",
  "Style your resume — pick one of 5 templates and 10 accent colors; the preview updates live. Use the ATS panel for parser warnings and optional job-keyword coverage.",
  "Download — click Download and choose PDF (text-selectable, print-ready) or DOCX (editable in Word / Google Docs).",
];

export function WelcomeModal() {
  const welcomeOpen = useResumeStore((state) => state.welcomeOpen);
  const setWelcomeOpen = useResumeStore((state) => state.setWelcomeOpen);

  // Auto-open on first visit.
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setWelcomeOpen(true);
      }
    } catch {
      // localStorage unavailable — skip auto-open.
    }
  }, [setWelcomeOpen]);

  const close = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore persistence errors
    }
    setWelcomeOpen(false);
  }, [setWelcomeOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!welcomeOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [welcomeOpen, close]);

  if (!welcomeOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 px-6 pb-5 pt-6 text-white">
          <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-bold tracking-wide">
            Privacy-first web app
          </span>
          <h2 id="welcome-title" className="mt-2 text-2xl font-bold leading-snug">
            Build a job-ready resume in minutes
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-indigo-100">
            A browser-based resume builder and ATS checker for students and job seekers. Your resume
            information and uploaded images stay on this device.
          </p>
        </div>

        <div className="px-6 py-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            What you get
          </p>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                  ✓
                </span>
                <span className="text-xs leading-snug text-slate-700">{feature}</span>
              </li>
            ))}
          </ul>

          <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            How it works
          </p>
          <ol className="space-y-2">
            {STEPS.map((step, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-xs leading-relaxed text-slate-600">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Found a bug or have feedback?</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              This builder is actively being tested and improved. Tell me about formatting issues,
              PDF export glitches, or feature ideas.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium">
              <a
                href="https://github.com/jacobconradquendangan-portfolio/CV-Builder/issues"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Report a bug on GitHub
              </a>
              <a
                href="mailto:jacobconradquendangan@gmail.com"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Send direct feedback
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={close}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Get Started
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Reopen this guide anytime from the ? button in the bottom-right corner.
          </p>
        </div>
      </div>
    </div>
  );
}