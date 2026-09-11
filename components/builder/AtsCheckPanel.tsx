"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { cn, estimatePageCount, prettyDate } from "@/lib/utils";
import type { ResumeData } from "@/lib/types";
import { useResumeStore, type ResumeState } from "@/store/useResumeStore";

type Status = "pass" | "warn" | "fail";

interface Check {
  id: string;
  label: string;
  status: Status;
  note: string;
}

function longestLine(_text: string): number {
  return 0;
}

const KEYWORD_STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "all",
  "also",
  "and",
  "any",
  "are",
  "because",
  "been",
  "before",
  "being",
  "between",
  "both",
  "but",
  "can",
  "candidate",
  "company",
  "could",
  "day",
  "each",
  "etc",
  "experience",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "her",
  "here",
  "him",
  "his",
  "how",
  "including",
  "into",
  "its",
  "job",
  "join",
  "joining",
  "looking",
  "more",
  "most",
  "must",
  "not",
  "now",
  "one",
  "only",
  "other",
  "our",
  "out",
  "over",
  "per",
  "position",
  "requirements",
  "responsibilities",
  "role",
  "same",
  "should",
  "some",
  "such",
  "team",
  "than",
  "that",
  "the",
  "their",
  "them",
  "these",
  "they",
  "this",
  "those",
  "through",
  "under",
  "until",
  "using",
  "very",
  "via",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "will",
  "with",
  "within",
  "work",
  "working",
  "would",
  "years",
  "you",
  "your",
]);

/**
 * Canonical forms so full month names in a job posting match the 3-letter
 * labels the resume renders ("February" -> "feb" matches "Feb 2021"),
 * and "current"/"ongoing" match the "Present" end-date label.
 */
const TOKEN_ALIASES: Record<string, string> = {
  january: "jan",
  february: "feb",
  march: "mar",
  april: "apr",
  june: "jun",
  july: "jul",
  august: "aug",
  september: "sep",
  sept: "sep",
  october: "oct",
  november: "nov",
  december: "dec",
  current: "present",
  currently: "present",
  ongoing: "present",
  presently: "present",
};

/**
 * Tokenizes free text the same way for both the job description and the
 * resume so matches are apples-to-apples. Keeps tech tokens like c++,
 * c#, node.js and ci/cd intact.
 */
function tokenize(text: string): string[] {
  const terms = text.toLowerCase().match(/[a-z0-9][a-z0-9+#./-]{2,}/g) ?? [];
  const tokens: string[] = [];

  for (const term of terms) {
    const stripped = term.replace(/^[./-]+|[./-]+$/g, "");
    if (!stripped || KEYWORD_STOP_WORDS.has(stripped) || /^\d+$/.test(stripped)) continue;
    tokens.push(TOKEN_ALIASES[stripped] ?? stripped);
  }

  return tokens;
}

function extractKeywords(text: string): string[] {
  const counts = new Map<string, number>();

  for (const token of tokenize(text)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .slice(0, 30)
    .map(([keyword]) => keyword);
}

/**
 * Collects only human-visible resume content for keyword matching.
 * Deliberately omits JSON keys, item ids, and personal.photo (a base64
 * data: URL whose random alphabet otherwise matches arbitrary keywords).
 */
function collectResumeText(data: ResumeData): string {
  const parts: string[] = [
    data.personal.fullName,
    data.personal.jobTitle,
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.website,
    data.personal.summary,
  ];

  for (const job of data.experience) {
    const startLabel = prettyDate(job.startDate);
    const endLabel = (job.endDate ?? "").trim() ? prettyDate(job.endDate) : "Present";
    parts.push(job.role, job.company, job.location, job.description, startLabel, endLabel);
  }
  for (const item of data.education) {
    const startLabel = prettyDate(item.startDate);
    const endLabel = (item.endDate ?? "").trim() ? prettyDate(item.endDate) : "Present";
    parts.push(item.degree, item.school, item.location, item.description, startLabel, endLabel);
  }
  for (const project of data.projects) {
    parts.push(project.name, project.link, project.description);
  }
  for (const skill of data.skills) {
    parts.push(skill.name);
  }
  for (const language of data.languages) {
    parts.push(language.name, language.level);
  }
  for (const cert of data.certifications) {
    parts.push(cert.name, cert.issuer, cert.year);
  }
  for (const award of data.awards) {
    parts.push(award.name, award.issuer, award.year);
  }
  for (const ref of data.characterReferences) {
    parts.push(ref.name, ref.company, ref.email, ref.phone);
  }

  return parts.filter(Boolean).join("\n");
}

/**
 * Exact-token set of the resume. Matching uses Set.has (word boundaries)
 * instead of String.includes (substring) so "art" no longer matches
 * "part"/"support", "java" no longer matches "javascript", etc.
 */
function getResumeTokenSet(data: ResumeData): Set<string> {
  return new Set(tokenize(collectResumeText(data)));
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

    const resumeTokens = getResumeTokenSet(snapshot.data);
    const matched = keywords.filter((keyword) => resumeTokens.has(keyword));
    const missing = keywords.filter((keyword) => !resumeTokens.has(keyword));

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

    if (data.experience.length > 0) {
      const undated = data.experience.filter(
        (entry) => !entry.startDate.trim() && !entry.endDate.trim()
      );
      result.push(
        undated.length === 0
          ? {
              id: "experience-dates",
              label: "Dates on experience",
              status: "pass",
              note: "All entries have dates.",
            }
          : {
              id: "experience-dates",
              label: "Dates on experience",
              status: "warn",
              note: `${undated.length} ${undated.length === 1 ? "entry is" : "entries are"} missing dates.`,
            }
      );
    }

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

    const bullets = [data.experience, data.projects, data.education]
      .flatMap((section) => section.map((entry) => entry.description))
      .flatMap((text) => text.split("\n"))
      .map((line) => line.trim().replace(/^[-•*>]|\d+[.)\]}:]/, "").trim())
      .filter(Boolean);
    const maxLine = bullets.reduce((max, bullet) => Math.max(max, bullet.length), 0);
    result.push(
      maxLine <= 160
        ? {
            id: "bullets",
            label: "Bullet length",
            status: "pass",
            note:
              bullets.length === 0
                ? "No bullets yet — one line per achievement keeps resumes scannable."
                : `${bullets.length} ${bullets.length === 1 ? "bullet" : "bullets"} checked — each stays within ~2 lines (longest ${maxLine} chars).`,
          }
        : {
            id: "bullets",
            label: "Bullet length",
            status: "warn",
            note: `Longest bullet is ${maxLine} characters — split it so each bullet stays within ~2 lines.`,
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
  const verdictDot = failCount > 0 ? "bg-[#ff3b30]" : warnCount > 0 ? "bg-[#ff9f0a]" : "bg-[#34c759]";

  return (
    <div className="animate-fade space-y-3">
      <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2.5">
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", verdictDot)} />
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{verdict}</p>
        </div>
        <p className="mt-1 pl-5 text-[12px] tabular-nums text-[#6e6e73]">
          {passCount} pass · {warnCount} warn · {failCount} fail
        </p>
      </div>

      <p className="rounded-2xl bg-black/[0.04] px-4 py-3 text-[12px] leading-relaxed text-[#6e6e73]">
        A quick, opinionated review of how well your resume will survive automated applicant tracking
        systems. Adjust for the job you&apos;re applying to — a human reader still loves eye-catching layouts.
      </p>

      <section className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">Job keyword match</h3>
            <p className="text-[12px] text-[#6e6e73]">Paste a job description for a local comparison.</p>
          </div>
          {jobDescription.trim() && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold tabular-nums",
                keywordMatch.score >= 70
                  ? "bg-[#34c759]/10 text-[#248a3d]"
                  : keywordMatch.score >= 40
                    ? "bg-[#ff9f0a]/10 text-[#b25000]"
                    : "bg-[#ff3b30]/10 text-[#d70015]"
              )}
            >
              {keywordMatch.score}%
            </span>
          )}
        </div>
        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the job description here..."
          aria-label="Job description"
          rows={4}
          className="w-full resize-y rounded-[10px] border border-black/10 bg-[#f5f5f7]/60 px-3 py-2 text-[13px] leading-relaxed text-[#1d1d1f] outline-none transition-all duration-200 placeholder:text-[#aeaeb2] hover:bg-[#f5f5f7] focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/15"
        />
        {keywordMatch.keywords.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-[12px] text-[#6e6e73]">
              {keywordMatch.matched.length} of {keywordMatch.keywords.length} common keywords found. This is a local heuristic, not a guarantee of ATS results.
            </p>
            {keywordMatch.missing.length > 0 && (
              <div>
                <p className="mb-1.5 text-[12px] font-semibold text-[#1d1d1f]">Consider adding</p>
                <div className="flex flex-wrap gap-1.5">
                  {keywordMatch.missing.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-[#ff3b30]/10 px-2.5 py-1 text-[11px] font-medium text-[#d70015]">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <ul className="space-y-2">
        {checks.map((check) => (
          <li key={check.id} className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-2.5">
              <StatusIcon status={check.status} />
              <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{check.label}</span>
            </div>
            <p className="mt-1.5 pl-[28px] text-[12px] leading-relaxed text-[#6e6e73]">{check.note}</p>
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
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
        status === "pass" && "bg-[#34c759]",
        status === "warn" && "bg-[#ff9f0a]",
        status === "fail" && "bg-[#ff3b30]"
      )}
    >
      {status === "pass" ? "✓" : status === "warn" ? "!" : "×"}
    </span>
  );
}