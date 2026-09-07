import type { CSSProperties, ReactNode } from "react";
import type { TemplateProps } from "@/lib/types";
import { cn, isLightColor, accentFg } from "@/lib/utils";
import { BulletList, DateRange, Photo } from "../primitives";

export default function Modern({ data, accent }: TemplateProps) {
  const { personal, experience, education, projects, skills, languages, certifications } = data;
  const lightAccent = isLightColor(accent);
  const ink = accentFg(accent);

  return (
    <div
      className="flex min-h-[1123px] w-full bg-white font-sans text-slate-800"
      style={{ "--accent": accent, "--accent-fg": ink } as CSSProperties}
    >
      <aside
        className={cn(
          "w-[31%] bg-[var(--accent)] px-7 py-9",
          lightAccent ? "text-slate-900" : "text-white"
        )}
      >
        <Photo
          src={personal.photo}
          className={cn(
            "mx-auto mb-6 h-28 w-28 border-4 shadow-lg",
            lightAccent ? "border-slate-900/20" : "border-white/40"
          )}
        />
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
          {personal.fullName || "Your Name"}
        </h1>
        <p
          className={cn(
            "mb-9 mt-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
            lightAccent ? "text-slate-600" : "text-white/80"
          )}
        >
          {personal.jobTitle}
        </p>

        <SidebarSection light={lightAccent} title="Contact">
          <ContactLine light={lightAccent} label="Email" value={personal.email} />
          <ContactLine light={lightAccent} label="Phone" value={personal.phone} />
          <ContactLine light={lightAccent} label="Location" value={personal.location} />
          <ContactLine light={lightAccent} label="Website" value={personal.website} />
        </SidebarSection>

        {skills.some((skill) => skill.name.trim()) && (
          <SidebarSection light={lightAccent} title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {skills
                .filter((skill) => skill.name.trim())
                .map((skill) => (
                  <span
                    key={skill.id}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-medium",
                      lightAccent ? "bg-slate-900/10" : "bg-white/15"
                    )}
                  >
                    {skill.name}
                  </span>
                ))}
            </div>
          </SidebarSection>
        )}

        {languages.some((language) => language.name.trim()) && (
          <SidebarSection light={lightAccent} title="Languages">
            <ul className="space-y-1.5 text-[11px]">
              {languages
                .filter((language) => language.name.trim())
                .map((language) => (
                  <li key={language.id}>
                    {language.name}
                    {language.level ? ` — ${language.level}` : ""}
                  </li>
                ))}
            </ul>
          </SidebarSection>
        )}

        {certifications.some((cert) => cert.name.trim()) && (
          <SidebarSection light={lightAccent} title="Certifications">
            <ul className="space-y-2.5 text-[11px]">
              {certifications
                .filter((cert) => cert.name.trim())
                .map((cert) => (
                  <li key={cert.id}>
                    <p className="font-semibold leading-snug">{cert.name}</p>
                    <p className={cn("mt-0.5", lightAccent ? "text-slate-600" : "text-white/75")}>
                      {cert.issuer}
                      {cert.year && ` · ${cert.year}`}
                    </p>
                  </li>
                ))}
            </ul>
          </SidebarSection>
        )}
      </aside>

      <main className="flex-1 px-9 py-9">
        {personal.summary.trim() && (
          <p className="mb-8 text-[12.5px] leading-relaxed text-slate-600">{personal.summary}</p>
        )}

        {experience.length > 0 && (
          <MainSection title="Experience">
            {experience.map((job, index) => (
              <div key={job.id} className={cn("avoid-break mb-5", index === experience.length - 1 && "mb-0")}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[13.5px] font-bold text-slate-900">{job.role}</h3>
                  <DateRange
                    start={job.startDate}
                    end={job.endDate}
                    className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-slate-500"
                  />
                </div>
                <p className="text-[11.5px] font-semibold text-[var(--accent-fg)]">
                  {job.company}
                  {job.location && ` · ${job.location}`}
                </p>
                <BulletList
                  text={job.description}
                  dotClassName="bg-[var(--accent-fg)] opacity-70"
                  textClassName="text-[12px] text-slate-600"
                />
              </div>
            ))}
          </MainSection>
        )}

        {education.length > 0 && (
          <MainSection title="Education">
            {education.map((item, index) => (
              <div key={item.id} className={cn("avoid-break mb-5", index === education.length - 1 && "mb-0")}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[13px] font-bold text-slate-900">{item.degree}</h3>
                  <DateRange
                    start={item.startDate}
                    end={item.endDate}
                    className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-slate-500"
                  />
                </div>
                <p className="text-[11.5px] font-semibold text-[var(--accent-fg)]">
                  {item.school}
                  {item.location && ` · ${item.location}`}
                </p>
                {item.description.trim() && (
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{item.description}</p>
                )}
              </div>
            ))}
          </MainSection>
        )}

        {projects.length > 0 && (
          <MainSection title="Projects">
            {projects.map((project, index) => (
              <div key={project.id} className={cn("avoid-break mb-5", index === projects.length - 1 && "mb-0")}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[13px] font-bold text-slate-900">{project.name}</h3>
                  {project.link && (
                    <span className="shrink-0 text-[10px] font-medium text-slate-500">{project.link}</span>
                  )}
                </div>
                <BulletList
                  text={project.description}
                  dotClassName="bg-[var(--accent-fg)] opacity-70"
                  textClassName="text-[12px] text-slate-600"
                />
              </div>
            ))}
          </MainSection>
        )}
      </main>
    </div>
  );
}

function SidebarSection({
  title,
  children,
  light,
}: {
  title: string;
  children: ReactNode;
  light: boolean;
}) {
  return (
    <section className="mb-6">
      <h2
        className={cn(
          "mb-2.5 border-b pb-1.5 text-[10px] font-bold uppercase tracking-[0.24em]",
          light ? "border-slate-900/25 text-slate-900" : "border-white/25 text-white"
        )}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function ContactLine({
  label,
  value,
  light,
}: {
  label: string;
  value: string;
  light: boolean;
}) {
  if (!value.trim()) return null;
  return (
    <p className="mb-1.5 text-[11px] leading-snug">
      <span className={cn("font-medium", light ? "text-slate-600" : "text-white/70")}>{label}: </span>
      {value}
    </p>
  );
}

function MainSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--accent-fg)]">{title}</h2>
        <span className="h-px flex-1 bg-[var(--accent-fg)] opacity-30" />
      </div>
      {children}
    </section>
  );
}