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
      className="animate-fade fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-md"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="welcome-modal-scroll animate-rise max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[20px] bg-white/95 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:max-h-[min(90vh,680px)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-gradient-to-b from-[#1d1d1f] to-[#3a3a3c] px-6 pb-6 pt-7 text-white sm:px-8">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur">
            Privacy-first · On-device only
          </span>
          <h2 id="welcome-title" className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em]">
            Build a job-ready resume in minutes
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/70">
            A browser-based resume builder and ATS checker for students and job seekers. Your resume
            information and uploaded images stay on this device.
          </p>
        </div>

        <div className="px-6 py-5 sm:px-8 sm:py-6">
          <p className="mb-2.5 text-[12px] font-semibold text-[#6e6e73]">
            What you get
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 rounded-2xl bg-[#f5f5f7] px-3 py-2.5"
              >
                <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#34c759] text-[10px] font-bold text-white">
                  ✓
                </span>
                <span className="text-[13px] leading-snug text-[#1d1d1f]">{feature}</span>
              </li>
            ))}
          </ul>

          <p className="mb-2.5 mt-6 text-[12px] font-semibold text-[#6e6e73]">
            How it works
          </p>
          <ol className="space-y-2.5">
            {STEPS.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-[11px] font-semibold text-white">
                  {index + 1}
                </span>
                <span className="text-[13px] leading-relaxed text-[#3a3a3c]">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-2xl bg-[#f5f5f7] px-5 py-4">
            <p className="text-[14px] font-semibold text-[#1d1d1f]">Found a bug or have feedback?</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#6e6e73]">
              This builder is actively being tested and improved. Tell me about formatting issues,
              PDF export glitches, or feature ideas.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-medium">
              <a
                href="https://github.com/jacobconradquendangan-portfolio/CV-Builder/issues"
                target="_blank"
                rel="noreferrer"
                className="text-[#0071e3] hover:underline"
              >
                Report a bug on GitHub
              </a>
              <a
                href="mailto:jacobconradquendangan@gmail.com"
                className="text-[#0071e3] hover:underline"
              >
                Send direct feedback
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-black/[0.06] bg-white/60 px-6 py-4 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={close}
            className="w-full rounded-full bg-[#0071e3] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(0,113,227,0.35)] transition-all duration-200 hover:bg-[#0077ed] active:scale-[0.98]"
          >
            Get Started
          </button>
          <p className="mt-2.5 text-center text-[11px] text-[#aeaeb2]">
            Reopen this guide anytime from the ? button in the bottom-right corner.
          </p>
        </div>
      </div>
    </div>
  );
}