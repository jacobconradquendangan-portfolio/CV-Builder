import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "@/lib/types";
import { accentFg } from "@/lib/utils";
import { BulletList, DateRange, Photo } from "../primitives";

export default function Sidebar({ data, accent }: TemplateProps) {
  const { personal, experience, education, projects, skills, languages, certifications, characterReferences } = data;
  const ink = accentFg(accent);

  return (
    <div
      className="min-h-[1123px] w-full bg-white font-sans text-slate-800"
      style={{ "--accent": accent, "--accent-fg": ink } as CSSProperties}
    >
      <div className="h-1.5 w-full bg-[var(--accent-fg)]" />
      <header className="border-b border-slate-200 bg-slate-50 px-12 py-7 text-center">
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
          {personal.fullName || "Your Name"}
        </h1>
        {personal.jobTitle && (
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--accent-fg)]">
            {personal.jobTitle}
          </p>
        )}
      </header>

      <div className="flex">
        <aside className="avoid-break w-[32%] border-r border-slate-200 px-7 py-7">
          <Photo src={personal.photo} className="mx-auto mb-5 h-24 w-24 border-4 border-slate-200 shadow-md" />
          <SideSection title="Contact">
            <ContactItem label="Email" value={personal.email} />
            <ContactItem label="Phone" value={personal.phone} />
            <ContactItem label="Location" value={personal.location} />
            <ContactItem label="Website" value={personal.website} />
          </SideSection>

          {skills.some((skill) => skill.name.trim()) && (
            <SideSection title="Skills">
              <ul className="space-y-1 text-[11.5px] text-slate-700">
                {skills
                  .filter((skill) => skill.name.trim())
                  .map((skill) => (
                    <li key={skill.id} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 bg-[var(--accent-fg)]" />
                      {skill.name}
                    </li>
                  ))}
              </ul>
            </SideSection>
          )}

          {languages.some((language) => language.name.trim()) && (
            <SideSection title="Languages">
              <ul className="space-y-1 text-[11.5px] text-slate-700">
                {languages
                  .filter((language) => language.name.trim())
                  .map((language) => (
                    <li key={language.id}>
                      {language.name}
                      {language.level ? ` — ${language.level}` : ""}
                    </li>
                  ))}
              </ul>
            </SideSection>
          )}

          {certifications.some((cert) => cert.name.trim()) && (
            <SideSection title="Certifications">
              <ul className="space-y-2.5 text-[11px]">
                {certifications
                  .filter((cert) => cert.name.trim())
                  .map((cert) => (
                    <li key={cert.id}>
                      <p className="font-semibold leading-snug text-slate-800">{cert.name}</p>
                      <p className="mt-0.5 text-slate-500">
                        {cert.issuer}
                        {cert.year && ` · ${cert.year}`}
                      </p>
                    </li>
                  ))}
              </ul>
            </SideSection>
          )}
        </aside>

        <main className="flex-1 px-8 py-7">
          {personal.summary.trim() && (
            <p className="text-[12.5px] leading-relaxed text-slate-600">{personal.summary}</p>
          )}

          {experience.length > 0 && (
            <MainSection title="Experience">
              {experience.map((job, index) => (
                <div key={job.id} className={index < experience.length - 1 ? "avoid-break mb-5" : "avoid-break"}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[13px] font-bold text-slate-900">{job.role}</h3>
                    <DateRange start={job.startDate} end={job.endDate} className="shrink-0 text-[10.5px] font-medium text-slate-400" />
                  </div>
                  <p className="text-[11.5px] font-medium text-slate-600">
                    {job.company}
                    {job.location && ` · ${job.location}`}
                  </p>
                  <BulletList text={job.description} dotClassName="bg-[var(--accent-fg)] opacity-70" textClassName="text-[12px] text-slate-600" />
                </div>
              ))}
            </MainSection>
          )}

          {education.length > 0 && (
            <MainSection title="Education">
              {education.map((item, index) => (
                <div key={item.id} className={index < education.length - 1 ? "avoid-break mb-5" : "avoid-break"}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[12.5px] font-bold text-slate-900">{item.degree}</h3>
                    <DateRange start={item.startDate} end={item.endDate} className="shrink-0 text-[10.5px] font-medium text-slate-400" />
                  </div>
                  <p className="text-[11.5px] text-slate-600">
                    {item.school}
                    {item.location && ` · ${item.location}`}
                  </p>
                  {item.description.trim() && (
                    <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">{item.description}</p>
                  )}
                </div>
              ))}
            </MainSection>
          )}

          {projects.length > 0 && (
            <MainSection title="Projects">
              {projects.map((project, index) => (
                <div key={project.id} className={index < projects.length - 1 ? "avoid-break mb-4" : "avoid-break"}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[12.5px] font-bold text-slate-900">{project.name}</h3>
                    {project.link && <span className="shrink-0 text-[10.5px] text-slate-400">{project.link}</span>}
                  </div>
                  <BulletList text={project.description} dotClassName="bg-[var(--accent-fg)] opacity-70" textClassName="text-[12px] text-slate-600" />
                </div>
              ))}
            </MainSection>
          )}

          {characterReferences.some((ref) => ref.name.trim()) && (
            <MainSection title="Character References">
              {characterReferences
                .filter((ref) => ref.name.trim())
                .map((ref) => (
                  <div key={ref.id} className="avoid-break mb-4">
                    <h3 className="text-[12.5px] font-bold text-slate-900">{ref.name}</h3>
                    {ref.company && <p className="text-[11.5px] text-slate-600">{ref.company}</p>}
                    {ref.email && <p className="text-[11.5px] text-slate-600">{ref.email}</p>}
                    {ref.phone && <p className="text-[11.5px] text-slate-600">{ref.phone}</p>}
                  </div>
                ))}
            </MainSection>
          )}
        </main>
      </div>
    </div>
  );
}

function SideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent-fg)]">{title}</h2>
      <div className="mb-2.5 h-px w-8 bg-[var(--accent-fg)] opacity-40" />
      {children}
    </section>
  );
}

function ContactItem({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <p className="mb-2">
      <span className="block text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-[11.5px] text-slate-700">{value}</span>
    </p>
  );
}

function MainSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900">
        <span className="h-2 w-2 shrink-0 bg-[var(--accent-fg)]" />
        {title}
      </h2>
      {children}
    </section>
  );
}