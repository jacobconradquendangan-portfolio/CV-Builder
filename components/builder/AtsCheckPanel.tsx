"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { cn, estimatePageCount } from "@/lib/utils";
import type { ResumeData } from "@/lib/types";
import { useResumeStore, type ResumeState } from "@/store/useResumeStore";

type Status = "pass" | "warn" | "fail";

interface Check {
  id: string;
  label: string;
  status: Status;
  note: string;
}

function longestLine(text: string): number {
  return text
    .split("\n")
    .map((line) => line.trim().length)
    .reduce((max, length) => Math.max(max, length), 0);
}

const KEYWORD_STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "been",
  "before",
  "being",
  "between",
  "could",
  "from",
  "have",
  "into",
  "more",
  "most",
  "must",
  "other",
  "our",
  "over",
  "role",
  "should",
  "that",
  "their",
  "them",
  "these",
  "they",
  "this",
  "those",
  "through",
  "using",
  "what",
  "when",
  "where",
  "which",
  "will",
  "with",
  "work",
  "would",
  "your",
]);

function extractKeywords(text: string): string[] {
  const counts = new Map<string, number>();
  const terms = text.toLowerCase().match(/[a-z0-9][a-z0-9+#./-]{2,}/g) ?? [];

  for (const term of terms) {
    const keyword = term.replace(/^[./-]+|[./-]+$/g, "");
    if (!keyword || KEYWORD_STOP_WORDS.has(keyword) || /^\d+$/.test(keyword)) continue;
    counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .slice(0, 30)
    .map(([keyword]) => keyword);
}

function getResumeSearchText(data: ResumeData): string {
  return JSON.stringify(data).toLowerCase();
}

export function AtsCheckPanel() {
  const [jobDescription, setJobDescription] = useState("");
  const snapshot = useResumeStore(
    useShallow((state: ResumeState) => ({
      data: state.data,
      templateId: state.templateId,
      contentHeight: state.contentHeight,
    }))
  );

  const keywordMatch = useMemo(() => {
    const keywords = extractKeywords(jobDescription);
    if (keywords.length === 0) {
      return { keywords, matched: [], missing: [], score: 0 };
    }

    const resumeText = getResumeSearchText(snapshot.data);
    const matched = keywords.filter((keyword) => resumeText.includes(keyword));
    const missing = keywords.filter((keyword) => !resumeText.includes(keyword));

    return {
      keywords,
      matched,
      missing,
      score: Math.round((matched.length / keywords.length) * 100),
    };
  }, [jobDescription, snapshot.data]);

  const checks = useMemo<Check[]>(() => {
    const { data, templateId, contentHeight } = snapshot;
    const { personal, characterReferences, awards } = data;
    const result: Check[] = [];

    if (templateId === "ats") {
      result.push({
        id: "template",
        label: "Template layout",
        status: "pass",
        note: "ATS-Friendly single column — safest for automated parsing.",
      });
    } else if (templateId === "modern" || templateId === "sidebar") {
      result.push({
        id: "template",
        label: "Template layout",
        status: "warn",
        note: "Two-column layouts can be read out of order by some parsers. Switch to ATS-Friendly / Classic / Minimal for job portals.",
      });
    } else {
      result.push({
        id: "template",
        label: "Template layout",
        status: "pass",
        note: "Single column — parses reliably.",
      });
    }

    result.push(
      personal.fullName.trim()
        ? { id: "name", label: "Full name", status: "pass", note: "Found." }
        : {
            id: "name",
            label: "Full name",
            status: "fail",
            note: "Add your full name — this is how the parser identifies you.",
          }
    );

    result.push(
      /^\S+@\S+\.\S+$/.test(personal.email.trim())
        ? { id: "email", label: "Email address", status: "pass", note: "Found." }
        : {
            id: "email",
            label: "Email address",
            status: "fail",
            note: "Add a valid email — most ATS require it to submit.",
          }
    );

    result.push(
      personal.phone.trim()
        ? { id: "phone", label: "Phone number", status: "pass", note: "Found." }
        : {
            id: "phone",
            label: "Phone number",
            status: "warn",
            note: "Suggested — many recruiters expect a phone number.",
          }
    );

    result.push(
      personal.summary.trim()
        ? { id: "summary", label: "Summary / objective", status: "pass", note: "Found." }
        : {
            id: "summary",
            label: "Summary / objective",
            status: "warn",
            note: "Add 2-4 sentences; parsers often map this to a 'summary' field.",
          }
    );

    result.push(
      data.experience.length > 0
        ? {
            id: "experience",
            label: "Work experience",
            status: "pass",
            note: `${data.experience.length} entr${data.experience.length === 1 ? "y" : "ies"}.`,
          }
        : {
            id: "experience",
            label: "Work experience",
            status: "warn",
            note: "Add at least one entry — the strongest ATS section (students may skip it).",
          }
    );

    const undated = data.experience.filter((entry) => !entry.startDate.trim() && !entry.endDate.trim());
    result.push(
      data.experience.length === 0 || undated.length === 0
        ? { id: "experience-dates", label: "Dates on experience", status: "pass", note: "All entries have dates." }
        : {
            id: "experience-dates",
            label: "Dates on experience",
            status: "warn",
            note: `${undated.length} entr${undated.length === 1 ? "y is" : "ies are"} missing dates.`,
          }
    );

    result.push(
      data.education.length > 0
        ? { id: "education", label: "Education", status: "pass", note: "Found." }
        : {
            id: "education",
            label: "Education",
            status: "warn",
            note: "Add your education — many parsers auto-detect it.",
          }
    );

    result.push(
      data.skills.some((skill) => skill.name.trim())
        ? {
            id: "skills",
            label: "Skills",
            status: "pass",
            note: "Found. ATS-Friendly keeps them comma-separated for best extraction.",
          }
        : {
            id: "skills",
            label: "Skills",
            status: "fail",
            note: "Add skills — ATS keyword matching relies heavily on this section.",
          }
    );

    const maxLine = Math.max(
      0,
      ...data.experience.map((entry) => longestLine(entry.description)),
      ...data.projects.map((project) => longestLine(project.description)),
      ...data.education.map((item) => longestLine(item.description))
    );
    result.push(
      maxLine <= 160
        ? { id: "bullets", label: "Bullet length", status: "pass", note: "Bullets stay under ~2 lines each." }
        : {
            id: "bullets",
            label: "Bullet length",
            status: "warn",
            note: `Longest bullet is ${maxLine} characters — keep bullets concise and scannable.`,
          }
    );

    result.push(
      personal.photo?.trim()
        ? {
            id: "photo",
            label: "Profile photo",
            status: "warn",
            note: "Most ATS ignore photos and treat them as wasted space — consider removing for portal submissions.",
          }
        : { id: "photo", label: "Profile photo", status: "pass", note: "None set — recommended for ATS." }
    );

    const pages = estimatePageCount(contentHeight);
    result.push(
      pages <= 2
        ? {
            id: "pages",
            label: "Resume length",
            status: "pass",
            note: `${pages} page${pages === 1 ? "" : "s"} — ideal for ATS.`,
          }
        : {
            id: "pages",
            label: "Resume length",
            status: "warn",
            note: `${pages} pages — aim for 1-2 pages for best results.`,
          }
    );

    // Check for character references completeness
    const hasReferences = characterReferences.some((ref) => ref.name.trim());
    if (hasReferences) {
      const incompleteRefs = characterReferences.filter(
        (ref) => ref.name.trim() && (!ref.email.trim() || !ref.phone.trim())
      );
      result.push(
        incompleteRefs.length === 0
          ? {
              id: "characterReferences",
              label: "Character references",
              status: "pass",
              note: "References included with complete details. Tip: optional in most markets — provide upon request instead to save space.",
            }
          : {
              id: "characterReferences",
              label: "Character references",
              status: "warn",
              note: `${incompleteRefs.length} reference(s) missing email or phone. Tip: consider removing references from CV and providing upon request instead.`,
            }
      );
    }

    // Check for awards
    if (awards.some((award) => award.name.trim())) {
      result.push({
        id: "awards",
        label: "Awards & Honors",
        status: "pass",
        note: "Awards section found — great for showcasing achievements and keywords.",
      });
    }

    return result;
  }, [snapshot]);

  const failCount = checks.filter((check) => check.status === "fail").length;
  const warnCount = checks.filter((check) => check.status === "warn").length;
  const passCount = checks.filter((check) => check.status === "pass").length;

  const verdict = failCount > 0 ? "Needs attention" : warnCount > 0 ? "Almost there" : "Looks great";
  const verdictClasses = cn(
    "rounded-full px-2.5 py-0.5 text-xs font-bold",
    failCount > 0
      ? "bg-rose-100 text-rose-700"
      : warnCount > 0
        ? "bg-amber-100 text-amber-800"
        : "bg-emerald-100 text-emerald-700"
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
        <div>
          <p className="text-sm font-semibold text-slate-800">{verdict}</p>
          <p className="text-[11px] text-slate-500">
            {passCount} pass · {warnCount} warn · {failCount} fail
          </p>
        </div>
        <span className={verdictClasses}>{verdict}</span>
      </div>

      <p className="mb-3 rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
        A quick, opinionated review of how well your resume will survive automated applicant tracking
        systems. Adjust for the job you&apos;re applying to — a human reader still loves eye-catching layouts.
      </p>

      <section className="mb-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-[13px] font-semibold text-slate-800">Job keyword match</h3>
            <p className="text-[11px] text-slate-500">Paste a job description for a local comparison.</p>
          </div>
          {jobDescription.trim() && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-bold",
                keywordMatch.score >= 70
                  ? "bg-emerald-100 text-emerald-700"
                  : keywordMatch.score >= 40
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-700"
              )}
            >
              {keywordMatch.score}% keyword coverage
            </span>
          )}
        </div>
        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the job description here..."
          aria-label="Job description"
          rows={4}
          className="w-full resize-y rounded-md border border-slate-300 px-2.5 py-2 text-xs leading-relaxed text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        {keywordMatch.keywords.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-[11px] text-slate-500">
              {keywordMatch.matched.length} of {keywordMatch.keywords.length} common keywords found. This is a local heuristic, not a guarantee of ATS results.
            </p>
            {keywordMatch.missing.length > 0 && (
              <div>
                <p className="mb-1 text-[11px] font-semibold text-slate-600">Consider adding</p>
                <div className="flex flex-wrap gap-1">
                  {keywordMatch.missing.map((keyword) => (
                    <span key={keyword} className="rounded bg-rose-50 px-1.5 py-0.5 text-[11px] text-rose-700">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <ul className="space-y-1.5">
        {checks.map((check) => (
          <li key={check.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <StatusIcon status={check.status} />
              <span className="text-[13px] font-medium text-slate-800">{check.label}</span>
            </div>
            <p className="mt-1 pl-6 text-[11px] leading-relaxed text-slate-500">{check.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
        status === "pass" && "bg-emerald-500",
        status === "warn" && "bg-amber-500",
        status === "fail" && "bg-rose-500"
      )}
    >
      {status === "pass" ? "✓" : status === "warn" ? "!" : "×"}
    </span>
  );
}