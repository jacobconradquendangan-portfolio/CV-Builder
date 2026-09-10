"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { useResumeStore, type ResumeState } from "@/store/useResumeStore";
import {
  CertificationsEditor,
  CharacterReferencesEditor,
  EducationEditor,
  ExperienceEditor,
  LanguagesEditor,
  PersonalEditor,
  ProjectsEditor,
  SkillsEditor,
} from "./editors";

const TABS: readonly { id: string; label: string; tooltip?: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "languages", label: "Languages" },
  { id: "certifications", label: "Certs" },
  { id: "characterReferences", label: "Refs", tooltip: "Character references (optional)" },
] as const;

type TabId = (typeof TABS)[number]["id"] & string;

export function FormPanel({ mobileFullHeight = false }: { mobileFullHeight?: boolean }) {
  const [tab, setTab] = useState<TabId>("personal");

  // useShallow must be invoked inside a component (it is a hook). It makes the
  // store compare each selected value individually, so returning a fresh object
  // from the selector does not trigger React's useSyncExternalStore to re-render
  // in an endless loop.
  const counts = useResumeStore(
    useShallow((state: ResumeState) => ({
      personal: 0,
      experience: state.data.experience.length,
      education: state.data.education.length,
      projects: state.data.projects.length,
      skills: state.data.skills.length,
      languages: state.data.languages.length,
      certifications: state.data.certifications.length,
      characterReferences: state.data.characterReferences?.length ?? 0,
    }))
  );

  return (
    <aside
      className={cn(
        "scrollbar-hidden w-full shrink-0 overflow-y-auto border-b border-slate-200 bg-white lg:h-full lg:w-[400px] lg:border-b-0 lg:border-r",
        mobileFullHeight ? "h-full" : "h-1/2"
      )}
    >
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-3">
        <div className="grid grid-cols-4 gap-1.5 py-2">
          {TABS.map((tabItem) => {
            const active = tab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setTab(tabItem.id)}
                title={
                  tabItem.id === "certifications"
                    ? "Certifications"
                    : tabItem.tooltip ?? tabItem.label
                }
                className={cn(
                  "flex min-w-0 items-center justify-center gap-1 rounded-md border px-1.5 py-1.5 text-[11px] font-semibold transition-colors",
                  active
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                {tabItem.label}
                {tabItem.id !== "personal" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                      counts[tabItem.id as keyof typeof counts] > 0
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {counts[tabItem.id as keyof typeof counts]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-8 pt-2">
        {tab === "personal" && <PersonalEditor />}
        {tab === "experience" && <ExperienceEditor />}
        {tab === "education" && <EducationEditor />}
        {tab === "projects" && <ProjectsEditor />}
        {tab === "skills" && <SkillsEditor />}
        {tab === "languages" && <LanguagesEditor />}
        {tab === "certifications" && <CertificationsEditor />}
        {tab === "characterReferences" && <CharacterReferencesEditor />}
      </div>
    </aside>
  );
}