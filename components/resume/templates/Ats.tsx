import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "@/lib/types";
import { accentFg } from "@/lib/utils";
import { BulletList, DateRange, Photo } from "../primitives";

/**
 * ATS-Friendly template.
 * Strictly optimized for automated applicant-tracking-system parsers:
 *  - single column, linear reading order, no sidebars / no tables
 *  - standard section headings parsers look for
 *  - contact info as one plain line under the name
 *  - skills & languages as comma-separated plain text (best for extraction)
 *  - no icons, graphs or text-in-images
 *
 * Note: a photo is optional here. Most ATS ignore it (the ATS Check panel
 * flags this), but some regions / industries expect one — so the choice is yours.
 */
export default function Ats({ data, accent }: TemplateProps) {
  const { personal, experience, education, projects, skills, languages, certifications, characterReferences, awards } = data;
  const ink = accentFg(accent);

  const contactParts = [personal.email, personal.phone, personal.location, personal.website].filter(
    Boolean
  );

  return (
    <div
      className="min-h-[1123px] w-full bg-white px-12 py-12 font-sans text-slate-800"
      style={{ "--accent": accent, "--accent-fg": ink } as CSSProperties}
    >
      <header className="border-b-2 border-slate-400 pb-3 text-center">
        <Photo src={personal.photo} className="mx-auto mb-3 h-20 w-20 border-2 border-slate-200" />
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
          {personal.fullName || "Your Name"}
        </h1>
        {personal.jobTitle && (
          <p className="mt-1 text-[13px] font-medium text-slate-700">{personal.jobTitle}</p>
        )}
        {contactParts.length > 0 && (
          <p className="mt-2 text-[11.5px] text-slate-600">{contactParts.join("   |   ")}</p>
        )}
      </header>

      {personal.summary.trim() && (
        <Section title="Summary">
          <p className="text-[12px] leading-relaxed text-slate-700">{personal.summary}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((job) => (
            <div key={job.id} className="avoid-break mb-4">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[13px] font-bold text-slate-900">{job.role}</h3>
                <DateRange
                  start={job.startDate}
                  end={job.endDate}
                  className="shrink-0 text-[11px] font-medium text-slate-600"
                />
              </div>
              <p className="text-[12px] font-medium text-slate-700">
                {job.company}
                {job.location && `, ${job.location}`}
              </p>
              <BulletList
                text={job.description}
                dotClassName="bg-slate-800 opacity-70"
                textClassName="text-[12px] text-slate-700"
              />
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          {education.map((item) => (
            <div key={item.id} className="avoid-break mb-4">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[12.5px] font-bold text-slate-900">{item.degree}</h3>
                <DateRange
                  start={item.startDate}
                  end={item.endDate}
                  className="shrink-0 text-[11px] font-medium text-slate-600"
                />
              </div>
              <p className="text-[12px] font-medium text-slate-700">
                {item.school}
                {item.location && `, ${item.location}`}
              </p>
              {item.description.trim() && (
                <p className="mt-1 text-[11.5px] leading-relaxed text-slate-700">{item.description}</p>
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
                <h3 className="text-[12.5px] font-bold text-slate-900">{project.name}</h3>
                {project.link && (
                  <span className="shrink-0 text-[11px] font-medium text-slate-600">{project.link}</span>
                )}
              </div>
              <BulletList
                text={project.description}
                dotClassName="bg-slate-800 opacity-70"
                textClassName="text-[12px] text-slate-700"
              />
            </div>
          ))}
        </Section>
      )}

      {skills.some((skill) => skill.name.trim()) && (
        <Section title="Skills">
          <p className="text-[12px] leading-relaxed text-slate-700">
            {skills.filter((skill) => skill.name.trim()).map((skill) => skill.name).join(", ")}
          </p>
        </Section>
      )}

      {languages.some((language) => language.name.trim()) && (
        <Section title="Languages">
          <p className="text-[12px] leading-relaxed text-slate-700">
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
              <div key={cert.id} className="avoid-break mb-1.5 text-[12px] leading-relaxed text-slate-700">
                {cert.name}
                {cert.issuer && ` — ${cert.issuer}`}
                {cert.year && ` (${cert.year})`}
              </div>
            ))}
        </Section>
      )}

      {awards.some((award) => award.name.trim()) && (
        <Section title="Awards & Honors">
          {awards
            .filter((award) => award.name.trim())
            .map((award) => (
              <div key={award.id} className="avoid-break mb-1.5 text-[12px] leading-relaxed text-slate-700">
                {award.name}
                {award.issuer && ` — ${award.issuer}`}
                {award.year && ` (${award.year})`}
              </div>
            ))}
        </Section>
      )}

      {characterReferences.some((ref) => ref.name.trim()) && (
        <Section title="Character References">
          {characterReferences
            .filter((ref) => ref.name.trim())
            .map((ref) => (
              <div key={ref.id} className="avoid-break mb-3 text-[12px] leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">{ref.name}</span>
                {ref.company && <span>, {ref.company}</span>}
                {ref.email && (
                  <div className="mt-0.5 text-[11px] text-slate-600">{ref.email}</div>
                )}
                {ref.phone && <div className="text-[11px] text-slate-600">{ref.phone}</div>}
              </div>
            ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2.5 border-b border-slate-300 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  );
}