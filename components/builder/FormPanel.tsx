"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { useResumeStore, type ResumeState } from "@/store/useResumeStore";
import {
  AwardsEditor,
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
  { id: "awards", label: "Awards" },
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
      awards: state.data.awards?.length ?? 0,
      characterReferences: state.data.characterReferences?.length ?? 0,
    }))
  );

  return (
    <aside
      className={cn(
        "scrollbar-hidden w-full shrink-0 overflow-y-auto border-b border-black/[0.08] bg-white lg:h-full lg:w-[400px] lg:border-b-0 lg:border-r",
        mobileFullHeight ? "h-full" : "h-1/2"
      )}
    >
      <div className="glass sticky top-0 z-10 border-b border-black/[0.06] px-4">
        <div className="grid grid-cols-4 gap-1.5 py-3">
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
                  "flex min-w-0 items-center justify-center gap-1 rounded-[10px] px-1.5 py-2 text-[12px] font-medium transition-all duration-200 active:scale-[0.96]",
                  active
                    ? "bg-black/[0.07] text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-[#6e6e73] hover:bg-black/[0.05] hover:text-[#1d1d1f]"
                )}
              >
                {tabItem.label}
                {tabItem.id !== "personal" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                      counts[tabItem.id as keyof typeof counts] > 0
                        ? "bg-[#0071e3]/10 text-[#0071e3]"
                        : "bg-black/[0.05] text-[#aeaeb2]"
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

      <div className="animate-fade px-5 pb-10 pt-1" key={tab}>
        {tab === "personal" && <PersonalEditor />}
        {tab === "experience" && <ExperienceEditor />}
        {tab === "education" && <EducationEditor />}
        {tab === "projects" && <ProjectsEditor />}
        {tab === "skills" && <SkillsEditor />}
        {tab === "languages" && <LanguagesEditor />}
        {tab === "certifications" && <CertificationsEditor />}
        {tab === "awards" && <AwardsEditor />}
        {tab === "characterReferences" && <CharacterReferencesEditor />}
      </div>
    </aside>
  );
}