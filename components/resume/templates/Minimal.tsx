import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "@/lib/types";
import { accentFg } from "@/lib/utils";
import { BulletList, DateRange, Photo } from "../primitives";

export default function Minimal({ data, accent }: TemplateProps) {
  const { personal, experience, education, projects, skills, languages, certifications, characterReferences } = data;
  const ink = accentFg(accent);

  return (
    <div
      className="min-h-[1123px] w-full bg-white px-12 py-12 font-sans text-slate-800"
      style={{ "--accent": accent, "--accent-fg": ink } as CSSProperties}
    >
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <Photo src={personal.photo} className="h-20 w-20 border-2 border-slate-100 shadow-sm" />
        <div className="min-w-[220px] flex-1">
          <h1 className="text-[34px] font-extralight leading-none tracking-tight text-slate-900">
            {personal.fullName || "Your Name"}
          </h1>
          {personal.jobTitle && (
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent-fg)]">
              {personal.jobTitle}
            </p>
          )}
        </div>
        <div className="pb-1 text-right text-[11px] leading-relaxed text-slate-500">
          {personal.email && <p>{personal.email}</p>}
          {personal.phone && <p>{personal.phone}</p>}
          {personal.location && <p>{personal.location}</p>}
          {personal.website && <p>{personal.website}</p>}
        </div>
      </div>

      {personal.summary.trim() && (
        <p className="mt-6 max-w-[85%] text-[12.5px] leading-relaxed text-slate-600">{personal.summary}</p>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((job) => (
            <div key={job.id} className="avoid-break mb-5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] font-semibold text-slate-900">{job.role}</span>
                <DateRange start={job.startDate} end={job.endDate} className="shrink-0 text-[10.5px] font-medium text-slate-400" />
              </div>
              <p className="text-[11.5px] text-slate-500">
                {job.company}
                {job.location && ` · ${job.location}`}
              </p>
              <BulletList text={job.description} dotClassName="bg-[var(--accent-fg)] opacity-70" textClassName="text-[11.5px] text-slate-600" />
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          {education.map((item) => (
            <div key={item.id} className="avoid-break mb-5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] font-semibold text-slate-900">{item.degree}</span>
                <DateRange start={item.startDate} end={item.endDate} className="shrink-0 text-[10.5px] font-medium text-slate-400" />
              </div>
              <p className="text-[11.5px] text-slate-500">
                {item.school}
                {item.location && ` · ${item.location}`}
              </p>
              {item.description.trim() && (
                <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">{item.description}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((project) => (
            <div key={project.id} className="avoid-break mb-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[12.5px] font-semibold text-slate-900">{project.name}</span>
                {project.link && <span className="shrink-0 text-[10.5px] text-slate-400">{project.link}</span>}
              </div>
              <BulletList text={project.description} dotClassName="bg-[var(--accent-fg)] opacity-70" textClassName="text-[11.5px] text-slate-600" />
            </div>
          ))}
        </Section>
      )}

      {skills.some((skill) => skill.name.trim()) && (
        <Section title="Skills">
          <p className="text-[11.5px] leading-relaxed text-slate-600">
            {skills.filter((skill) => skill.name.trim()).map((skill) => skill.name).join("   ·   ")}
          </p>
        </Section>
      )}

      {languages.some((language) => language.name.trim()) && (
        <Section title="Languages">
          <p className="text-[11.5px] leading-relaxed text-slate-600">
            {languages
              .filter((language) => language.name.trim())
              .map((language) => (language.level ? `${language.name} (${language.level})` : language.name))
              .join("   ·   ")}
          </p>
        </Section>
      )}

      {certifications.some((cert) => cert.name.trim()) && (
        <Section title="Certifications">
          {certifications
            .filter((cert) => cert.name.trim())
            .map((cert) => (
              <div key={cert.id} className="avoid-break mb-2 flex items-baseline justify-between gap-4 text-[11.5px]">
                <span className="font-medium text-slate-800">{cert.name}</span>
                <span className="shrink-0 text-slate-500">
                  {cert.issuer}
                  {cert.year && ` · ${cert.year}`}
                </span>
              </div>
            ))}
        </Section>
      )}

      {characterReferences.some((ref) => ref.name.trim()) && (
        <Section title="Character References">
          {characterReferences
            .filter((ref) => ref.name.trim())
            .map((ref) => (
              <div key={ref.id} className="avoid-break mb-3 text-[11.5px]">
                <span className="font-semibold text-slate-800">{ref.name}</span>
                {ref.company && <span className="text-slate-500">, {ref.company}</span>}
                {ref.email && <div className="mt-0.5 text-slate-500">{ref.email}</div>}
                {ref.phone && <div className="text-slate-500">{ref.phone}</div>}
              </div>
            ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-3 border-b border-slate-200 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}