import {
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import type { ResumeData } from "./types";
import { prettyDate } from "../components/resume/primitives";

const FONT = "Calibri";

/** Generates a .docx (Office Open XML) file from resume data — editable in Word, Google Docs, LibreOffice, Pages. */
export async function exportResumeToDocx(data: ResumeData): Promise<void> {
  const { personal } = data;

  const children: Paragraph[] = [];

  // ---- Name ----
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: personal.fullName.trim() || "Your Name",
          bold: true,
          size: 36,
          font: FONT,
        }),
      ],
    })
  );

  // ---- Job title ----
  if (personal.jobTitle.trim()) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: personal.jobTitle, size: 22, font: FONT })],
      })
    );
  }

  // ---- Contact line ----
  const contactParts = [personal.email, personal.phone, personal.location, personal.website].filter(
    (part) => part.trim()
  );
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: contactParts.join("  |  "), size: 18, color: "64748b", font: FONT })],
      })
    );
  }

  // ---- Summary ----
  if (personal.summary.trim()) {
    children.push(sectionHeading("PROFESSIONAL SUMMARY"));
    children.push(bodyText(personal.summary));
  }

  // ---- Experience ----
  if (data.experience.length > 0) {
    children.push(sectionHeading("EXPERIENCE"));
    for (const job of data.experience) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: job.role, bold: true, size: 22, font: FONT }),
            new TextRun({ text: "\t" }),
            new TextRun({ text: formatDateRange(job.startDate, job.endDate), size: 20, color: "64748b", font: FONT }),
          ],
        })
      );
      if (job.company.trim()) {
        const companyLine = [job.company, job.location].filter((p) => p.trim()).join(", ");
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: companyLine, italics: true, size: 20, color: "475569", font: FONT })],
          })
        );
      }
      for (const line of splitLines(job.description)) {
        children.push(bulletParagraph(line));
      }
    }
  }

  // ---- Education ----
  if (data.education.length > 0) {
    children.push(sectionHeading("EDUCATION"));
    for (const item of data.education) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: item.degree, bold: true, size: 22, font: FONT }),
            new TextRun({ text: "\t" }),
            new TextRun({ text: formatDateRange(item.startDate, item.endDate), size: 20, color: "64748b", font: FONT }),
          ],
        })
      );
      if (item.school.trim()) {
        const schoolLine = [item.school, item.location].filter((p) => p.trim()).join(", ");
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: schoolLine, italics: true, size: 20, color: "475569", font: FONT })],
          })
        );
      }
      if (item.description.trim()) {
        children.push(bodyText(item.description));
      }
    }
  }

  // ---- Projects ----
  if (data.projects.length > 0) {
    children.push(sectionHeading("PROJECTS"));
    for (const project of data.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: project.name, bold: true, size: 22, font: FONT }),
            ...(project.link.trim()
              ? [
                  new TextRun({ text: "\t", font: FONT }),
                  new TextRun({ text: project.link, size: 18, color: "2563eb", font: FONT }),
                ]
              : []),
          ],
        })
      );
      for (const line of splitLines(project.description)) {
        children.push(bulletParagraph(line));
      }
    }
  }

  // ---- Skills ----
  if (data.skills.some((skill) => skill.name.trim())) {
    children.push(sectionHeading("SKILLS"));
    const skillText = data.skills
      .map((skill) => skill.name.trim())
      .filter(Boolean)
      .join(", ");
    children.push(bodyText(skillText));
  }

  // ---- Languages ----
  if (data.languages.some((language) => language.name.trim())) {
    children.push(sectionHeading("LANGUAGES"));
    const languageText = data.languages
      .map((language) => (language.level ? `${language.name} (${language.level})` : language.name))
      .filter((text) => text.trim())
      .join("  ·  ");
    children.push(bodyText(languageText));
  }

  // ---- Certifications ----
  if (data.certifications.some((cert) => cert.name.trim())) {
    children.push(sectionHeading("CERTIFICATIONS"));
    for (const cert of data.certifications) {
      const parts = [
        cert.name,
        ...(cert.issuer.trim() ? [`— ${cert.issuer}`] : []),
        ...(cert.year.trim() ? [cert.year.trim()] : []),
      ];
      children.push(bulletParagraph(parts.join(" ")));
    }
  }

  // ---- Character References ----
  if (data.characterReferences.some((ref) => ref.name.trim())) {
    children.push(sectionHeading("CHARACTER REFERENCES"));
    for (const ref of data.characterReferences) {
      if (!ref.name.trim()) continue;
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [new TextRun({ text: ref.name, bold: true, size: 22, font: FONT })],
        })
      );
      if (ref.company.trim()) {
        children.push(
          new Paragraph({
            spacing: { after: 20 },
            children: [new TextRun({ text: ref.company, italics: true, size: 20, color: "475569", font: FONT })],
          })
        );
      }
      if (ref.email.trim()) {
        children.push(
          new Paragraph({
            spacing: { after: 20 },
            children: [new TextRun({ text: `Email: ${ref.email}`, size: 20, color: "64748b", font: FONT })],
          })
        );
      }
      if (ref.phone.trim()) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: `Phone: ${ref.phone}`, size: 20, color: "64748b", font: FONT })],
          })
        );
      }
    }
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: 21 } } },
      paragraphStyles: [
        {
          id: "Heading",
          name: "Heading",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { bold: true, size: 24, color: "1e293b" },
          paragraph: { spacing: { before: 200, after: 80 } },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(personal.fullName.trim() || "resume").replace(/\s+/g, "_")}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 160, after: 80 },
    border: { bottom: { color: "cbd5e1", space: 1, style: BorderStyle.SINGLE, size: 6 } },
    children: [new TextRun({ text, bold: true, size: 24, color: "1e293b", font: FONT })],
  });
}

function bodyText(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 21, font: FONT })],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 21, font: FONT })],
  });
}

function formatDateRange(start: string, end: string): string {
  const from = prettyDate(start);
  const to = prettyDate(end) || "Present";
  if (!from && !to) return "";
  return `${from || "—"} – ${to}`;
}

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}