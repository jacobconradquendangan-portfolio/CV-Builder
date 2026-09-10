import type { CSSProperties } from "react";
import type { TemplateProps } from "@/lib/types";
import { accentFg } from "@/lib/utils";
import { BulletList, DateRange, Photo } from "../primitives";

export default function Classic({ data, accent }: TemplateProps) {
  const { personal, experience, education, projects, skills, languages, characterReferences, awards } = data;
  const ink = accentFg(accent);

  const contactParts = [personal.email, personal.phone, personal.location, personal.website].filter(
    Boolean
  );

  return (
    <div
      className="min-h-[1123px] w-full bg-white px-14 py-12 font-serif text-slate-800"
      style={{ "--accent": accent, "--accent-fg": ink } as CSSProperties}
    >
      <header className="border-b-2 border-slate-300 pb-4 text-center">
        <Photo src={personal.photo} className="mx-auto mb-4 h-24 w-24 border-4 border-slate-200" />
        <h1 className="text-[30px] font-bold uppercase tracking-[0.14em] text-slate-900">
          {personal.fullName || "Your Name"}
        </h1>
        {personal.jobTitle && (
          <p className="mt-1.5 text-[14px] italic text-[var(--accent-fg)]">{personal.jobTitle}</p>
        )}
        {contactParts.length > 0 && (
          <p className="mt-2 text-[11.5px] tracking-wide text-slate-600">{contactParts.join("   ·   ")}</p>
        )}
      </header>

      {personal.summary.trim() && (
        <p className="mt-5 text-justify text-[12.5px] italic leading-relaxed text-slate-700">
          {personal.summary}
        </p>
      )}

      {experience.length > 0 && (
        <>
          <SectionTitle title="Experience" />
          {experience.map((job) => (
            <div key={job.id} className="avoid-break mb-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-900">{job.role}</h3>
                <DateRange start={job.startDate} end={job.endDate} className="shrink-0 text-[11px] italic text-slate-500" />
              </div>
              <p className="text-[12px] italic text-slate-600">
                {job.company}
                {job.location && `, ${job.location}`}
              </p>
              <BulletList text={job.description} dotClassName="bg-slate-700 opacity-80" textClassName="text-[12px] text-slate-700" />
            </div>
          ))}
        </>
      )}

      {education.length > 0 && (
        <>
          <SectionTitle title="Education" />
          {education.map((item) => (
            <div key={item.id} className="avoid-break mb-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-900">{item.degree}</h3>
                <DateRange start={item.startDate} end={item.endDate} className="shrink-0 text-[11px] italic text-slate-500" />
              </div>
              <p className="text-[12px] italic text-slate-600">
                {item.school}
                {item.location && `, ${item.location}`}
              </p>
              {item.description.trim() && (
                <p className="mt-1 text-[11.5px] leading-relaxed text-slate-700">{item.description}</p>
              )}
            </div>
          ))}
        </>
      )}

      {projects.length > 0 && (
        <>
          <SectionTitle title="Projects" />
          {projects.map((project) => (
            <div key={project.id} className="avoid-break mb-4">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[12.5px] font-bold text-slate-900">{project.name}</h3>
                {project.link && <span className="shrink-0 text-[11px] italic text-slate-500">{project.link}</span>}
              </div>
              <BulletList text={project.description} dotClassName="bg-slate-700 opacity-80" textClassName="text-[12px] text-slate-700" />
            </div>
          ))}
        </>
      )}

      {skills.some((skill) => skill.name.trim()) && (
        <>
          <SectionTitle title="Skills" />
          <p className="text-[12px] leading-relaxed text-slate-700">
            {skills.filter((skill) => skill.name.trim()).map((skill) => skill.name).join(", ")}
          </p>
        </>
      )}

      {languages.some((language) => language.name.trim()) && (
        <>
          <SectionTitle title="Languages" />
          <p className="text-[12px] leading-relaxed text-slate-700">
            {languages
              .filter((language) => language.name.trim())
              .map((language) => (language.level ? `${language.name} (${language.level})` : language.name))
              .join("   ·   ")}
          </p>
        </>
      )}

      {awards.some((award) => award.name.trim()) && (
        <>
          <SectionTitle title="Awards & Honors" />
          {awards
            .filter((award) => award.name.trim())
            .map((award) => (
              <div key={award.id} className="avoid-break mb-3">
                <h3 className="text-[13px] font-bold text-slate-900">{award.name}</h3>
                {award.issuer && <p className="text-[12px] italic text-slate-600">{award.issuer}</p>}
                {award.year && <p className="text-[11.5px] text-slate-500">{award.year}</p>}
              </div>
            ))}
        </>
      )}

      {characterReferences.some((ref) => ref.name.trim()) && (
        <>
          <SectionTitle title="Character References" />
          {characterReferences
            .filter((ref) => ref.name.trim())
            .map((ref) => (
              <div key={ref.id} className="avoid-break mb-4">
                <h3 className="text-[13px] font-bold text-slate-900">{ref.name}</h3>
                {ref.company && <p className="text-[12px] italic text-slate-600">{ref.company}</p>}
                {ref.email && <p className="text-[11.5px] text-slate-600">{ref.email}</p>}
                {ref.phone && <p className="text-[11.5px] text-slate-600">{ref.phone}</p>}
              </div>
            ))}
        </>
      )}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="mb-3 mt-7 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.24em] text-slate-900">
      <span className="h-[2px] w-9 bg-[var(--accent-fg)]" />
      {title}
      <span className="h-px flex-1 bg-slate-300" />
    </h2>
  );
}