import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import type {
  Award,
  Certification,
  Education,
  Experience,
  Language,
  Personal,
  Project,
  ResumeData,
  Skill,
} from "./types";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PAGES = 40;
const MONTH = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE = `(?:${MONTH}\\s+\\d{4}|\\d{1,2}[./-]\\d{4}|\\d{4})`;
const DATE_RANGE = new RegExp(`(${DATE})\\s*(?:–|—|\\bto\\b|-)\\s*(${DATE}|present|current)\\s*$`, "i");
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s|,]+/i;
const PHONE_PATTERN = /(?:\+?\d[\d\s().-]{6,}\d)/;

type PdfTextLine = {
  text: string;
  x: number;
  y: number;
  links: Array<{ url: string; label: string }>;
};

type TextChunk = {
  text: string;
  x: number;
  y: number;
  width: number;
};

type Section =
  | "header"
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "languages"
  | "certifications"
  | "awards"
  | "references";

export interface ResumePdfImport {
  data: ResumeData;
  extractedText: string;
  pageCount: number;
}

export async function readResumePdf(file: File): Promise<ResumePdfImport> {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Choose a PDF file to import.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("This PDF is larger than 20 MB. Choose a smaller file.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = new TextDecoder().decode(bytes.subarray(0, 5));
  if (signature !== "%PDF-") {
    throw new Error("This file does not appear to be a valid PDF.");
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const loadingTask = pdfjs.getDocument({ data: bytes, isEvalSupported: false });
  let document: PDFDocumentProxy | undefined;

  try {
    document = await loadingTask.promise;
    if (document.numPages > MAX_PAGES) {
      throw new Error(`This PDF has more than ${MAX_PAGES} pages. Choose a shorter resume.`);
    }

    const pages: PdfTextLine[][] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const [content, annotations] = await Promise.all([
        page.getTextContent(),
        page.getAnnotations(),
      ]);
      const chunks = content.items.flatMap((item) => {
        if (!("str" in item) || !item.str.trim()) return [];
        return [{
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
        }];
      });
      const lines = groupTextLines(chunks);

      for (const annotation of annotations) {
        if (!annotation.url || !Array.isArray(annotation.rect)) continue;
        const [left, bottom, right, top] = annotation.rect;
        const line = lines.find((candidate) => candidate.y >= bottom - 3 && candidate.y <= top + 3);
        if (!line) continue;
        const overlapping = chunks.filter(
          (chunk) =>
            Math.abs(chunk.y - line.y) < 3 &&
            chunk.x + chunk.width >= left - 2 &&
            chunk.x <= right + 2
        );
        const label = overlapping.map((chunk) => chunk.text).join("").trim();
        line.links.push({ url: annotation.url, label });
      }

      pages.push(lines);
    }

    const lines = pages.flat();
    const extractedText = lines.map((line) => line.text).filter(Boolean).join("\n");
    if (extractedText.replace(/\s/g, "").length < 40) {
      throw new Error(
        "No selectable text was found. This may be a scanned PDF; OCR is not supported yet."
      );
    }

    return {
      data: parseResumeLines(lines),
      extractedText,
      pageCount: document.numPages,
    };
  } finally {
    if (document) await document.destroy();
    else await loadingTask.destroy();
  }
}

function groupTextLines(chunks: TextChunk[]): PdfTextLine[] {
  const sorted = [...chunks].sort((first, second) => second.y - first.y || first.x - second.x);
  const groups: Array<{ y: number; chunks: TextChunk[] }> = [];

  for (const chunk of sorted) {
    let group = groups.find((candidate) => Math.abs(candidate.y - chunk.y) <= 2.5);
    if (!group) {
      group = { y: chunk.y, chunks: [] };
      groups.push(group);
    }
    group.chunks.push(chunk);
  }

  return groups
    .map(({ y, chunks: row }) => {
      const ordered = row.sort((first, second) => first.x - second.x);
      let text = "";
      let previousEnd = Number.NEGATIVE_INFINITY;

      for (const chunk of ordered) {
        const needsSpace =
          text.length > 0 &&
          chunk.x - previousEnd > 1.5 &&
          !/\s$/.test(text) &&
          !/^\s/.test(chunk.text);
        text += `${needsSpace ? " " : ""}${chunk.text}`;
        previousEnd = chunk.x + chunk.width;
      }

      return {
        text: text.replace(/[ \t]+/g, " ").trim(),
        x: ordered[0]?.x ?? 0,
        y,
        links: [],
      };
    })
    .filter((line) => line.text);
}

function parseResumeLines(lines: PdfTextLine[]): ResumeData {
  const sections: Record<Section, PdfTextLine[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    projects: [],
    skills: [],
    languages: [],
    certifications: [],
    awards: [],
    references: [],
  };

  let section: Section = "header";
  for (const line of lines) {
    const heading = identifySection(line.text);
    if (heading) {
      section = heading;
    } else {
      sections[section].push(line);
    }
  }

  const personal = parsePersonal(sections.header, sections.summary);
  return {
    personal,
    experience: parseExperience(sections.experience),
    education: parseEducation(sections.education),
    projects: parseProjects(sections.projects),
    skills: parseSkills(sections.skills),
    languages: parseLanguages(sections.languages),
    certifications: parseCertifications(sections.certifications),
    characterReferences: parseReferences(sections.references),
    awards: parseAwards(sections.awards),
  };
}

function identifySection(text: string): Section | null {
  const normalized = text.toUpperCase().replace(/[^A-Z]/g, "");
  const headings: Record<string, Section> = {
    SUMMARY: "summary",
    PROFESSIONALSUMMARY: "summary",
    PROFILE: "summary",
    OBJECTIVE: "summary",
    EXPERIENCE: "experience",
    WORKEXPERIENCE: "experience",
    EMPLOYMENT: "experience",
    CAREERHISTORY: "experience",
    EDUCATION: "education",
    ACADEMICBACKGROUND: "education",
    PROJECTS: "projects",
    PORTFOLIO: "projects",
    SKILLS: "skills",
    TECHNICALSKILLS: "skills",
    LANGUAGES: "languages",
    CERTIFICATIONS: "certifications",
    LICENSESANDCERTIFICATIONS: "certifications",
    AWARDS: "awards",
    AWARDSHONORS: "awards",
    AWARDSANDHONORS: "awards",
    HONORSANDAWARDS: "awards",
    REFERENCES: "references",
    CHARACTERREFERENCES: "references",
  };
  return headings[normalized] ?? null;
}

function parsePersonal(header: PdfTextLine[], summary: PdfTextLine[]): Personal {
  const personal: Personal = {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    websiteLabel: "",
    linkedin: "",
    linkedinLabel: "",
    photo: "",
    summary: summary.map((line) => line.text).join(" ").trim(),
  };

  const contactLine = header.find((line) => EMAIL_PATTERN.test(line.text));
  const firstEmailMatch = contactLine?.text.match(EMAIL_PATTERN);
  personal.email = firstEmailMatch?.[0] ?? "";

  const phoneLine = header.find((line) => PHONE_PATTERN.test(line.text));
  personal.phone = phoneLine?.text.match(PHONE_PATTERN)?.[0]?.trim() ?? "";

  const profileLinks = header.flatMap((line) => line.links);
  for (const link of profileLinks) {
    if (/linkedin\./i.test(link.url)) {
      personal.linkedin = link.url;
      personal.linkedinLabel = "LinkedIn";
      continue;
    }
    if (!personal.website) {
      personal.website = link.url;
      personal.websiteLabel = "Portfolio";
    }
  }

  const headerText = header.map((line) => line.text).join(" ");
  const linkedInUrl = personal.linkedin || extractUrl(headerText.match(/(?:linkedin\.com\/\S+)/i)?.[0] ?? "");
  if (linkedInUrl && !personal.linkedin) {
    personal.linkedin = linkedInUrl;
    personal.linkedinLabel = "LinkedIn";
  }
  if (!personal.website) {
    const urls = [...headerText.matchAll(new RegExp(URL_PATTERN, "gi"))].map(([url]) => normalizeUrl(url));
    const websiteUrl = urls.find((url) => url && !/linkedin\./i.test(url));
    if (websiteUrl) {
      personal.website = websiteUrl;
      personal.websiteLabel = "Portfolio";
    }
  }

  if (contactLine) {
    const segments = contactLine.text
      .split(/[·|•]/)
      .map((part) => part.trim())
      .filter(Boolean);
    personal.location =
      segments.find(
        (part) =>
          !EMAIL_PATTERN.test(part) &&
          !PHONE_PATTERN.test(part) &&
          !contactLine.links.some((link) => link.label === part)
      ) ?? "";
  }

  const nameLine = header.find(
    (line) => !EMAIL_PATTERN.test(line.text) && !PHONE_PATTERN.test(line.text) && !line.links.length
  );
  if (nameLine) {
    const linkedinName = nameFromLinkedInUrl(personal.linkedin ?? "");
    personal.fullName = isSpacedUppercase(nameLine.text) && linkedinName
      ? linkedinName
      : normalizeName(nameLine.text);
  }

  const jobTitleLine = header.find(
    (line) =>
      line !== nameLine &&
      !EMAIL_PATTERN.test(line.text) &&
      !PHONE_PATTERN.test(line.text) &&
      !line.links.length &&
      line.text !== personal.location
  );
  personal.jobTitle = jobTitleLine?.text ?? "";
  personal.summary = [
    ...summary,
    ...header.filter(
      (line) =>
        line !== nameLine &&
        line !== jobTitleLine &&
        line !== contactLine &&
        !EMAIL_PATTERN.test(line.text) &&
        !PHONE_PATTERN.test(line.text) &&
        !line.links.length
    ),
  ]
    .map((line) => line.text)
    .join(" ")
    .trim();
  return personal;
}

function parseExperience(lines: PdfTextLine[]): Experience[] {
  const jobs: Experience[] = [];
  let current: Experience | null = null;
  const minX = Math.min(...lines.map((line) => line.x));

  const save = () => {
    if (current && (current.role || current.company || current.description)) jobs.push(current);
  };

  for (const line of lines) {
    const { title, startDate, endDate } = removeDateRange(line.text);
    const startsEntry =
      Boolean(startDate || isUppercaseHeading(title)) ||
      Boolean(current?.company && current.description && line.x <= minX + 2);

    if (!current || startsEntry) {
      save();
      current = {
        id: makeId("experience", jobs.length),
        role: title,
        company: "",
        location: "",
        startDate,
        endDate,
        description: "",
      };
      continue;
    }

    if (!current.company) {
      const [company, location = ""] = line.text.split(/\s*,\s*/, 2);
      current.company = company.trim();
      current.location = location.trim();
    } else {
      current.description = appendLine(current.description, line.text);
    }
  }
  save();
  return jobs;
}

function parseEducation(lines: PdfTextLine[]): Education[] {
  const items: Education[] = [];
  let current: Education | null = null;
  const minX = Math.min(...lines.map((line) => line.x));

  const save = () => {
    if (current && (current.degree || current.school || current.description)) items.push(current);
  };

  for (const line of lines) {
    const { title, startDate, endDate } = removeDateRange(line.text);
    const startsEntry =
      Boolean(startDate || isUppercaseHeading(title)) ||
      Boolean(current?.school && line.x <= minX + 2);
    if (!current || startsEntry) {
      save();
      current = {
        id: makeId("education", items.length),
        degree: title,
        school: "",
        location: "",
        startDate,
        endDate,
        description: "",
      };
      continue;
    }

    if (!current.school) {
      const [school, location = ""] = line.text.split(/\s*,\s*/, 2);
      current.school = school.trim();
      current.location = location.trim();
    } else {
      current.description = appendLine(current.description, line.text);
    }
  }
  save();
  return items;
}

function parseProjects(lines: PdfTextLine[]): Project[] {
  const projects: Project[] = [];
  let current: Project | null = null;
  const minX = Math.min(...lines.map((line) => line.x));
  const save = () => {
    if (current && (current.name || current.link || current.description)) projects.push(current);
  };

  for (const line of lines) {
    const anchor = line.links[0];
    const urlMatch = line.text.match(/https?:\/\/\S+/i);
    const startsEntry =
      !current ||
      line.x <= minX + 2 &&
        (Boolean(anchor || urlMatch) || Boolean(current.description) || !current.name);

    if (startsEntry) {
      save();
      const link = anchor?.url ?? (urlMatch ? normalizeUrl(urlMatch[0]) : "");
      let name = line.text;
      if (anchor?.label) name = removeFirst(name, anchor.label);
      if (urlMatch) name = removeFirst(name, urlMatch[0]);
      current = {
        id: makeId("project", projects.length),
        name: cleanEntryTitle(name),
        link,
        linkLabel: link ? preferredLinkLabel(anchor?.label) : "",
        description: "",
      };
      continue;
    }

    if (anchor && current) {
      current.link = anchor.url;
      current.linkLabel = preferredLinkLabel(anchor.label);
    }
    if (current) current.description = appendLine(current.description, line.text);
  }
  save();
  return projects;
}

function parseSkills(lines: PdfTextLine[]): Skill[] {
  return splitList(lines.map((line) => line.text).join(", ")).map((name, index) => ({
    id: makeId("skill", index),
    name,
  }));
}

function parseLanguages(lines: PdfTextLine[]): Language[] {
  const text = lines.map((line) => line.text).join(" · ");
  return splitList(text).map((item, index) => {
    const match = item.match(/^(.+?)\s*\(([^)]+)\)$/);
    return {
      id: makeId("language", index),
      name: match?.[1]?.trim() ?? item,
      level: match?.[2]?.trim() ?? "",
    };
  });
}

function parseCertifications(lines: PdfTextLine[]): Certification[] {
  const certs: Certification[] = [];
  let current: Omit<Certification, "id"> | null = null;

  const save = () => {
    if (current?.name) certs.push({ ...current, id: makeId("certification", certs.length) });
  };

  for (const line of lines) {
    if (/^(issued|expires)\b/i.test(line.text)) {
      const year = line.text.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? "";
      if (current && !current.year) current.year = year;
      continue;
    }

    if (!current) {
      current = { name: line.text, issuer: "", year: "" };
    } else if (!current.issuer) {
      current.issuer = line.text;
    } else {
      save();
      current = { name: line.text, issuer: "", year: "" };
    }
  }
  save();
  return certs;
}

function parseAwards(lines: PdfTextLine[]): Award[] {
  const awards: Award[] = [];
  let current: Omit<Award, "id"> | null = null;
  const dateOnlyPattern = new RegExp(
    `^(${DATE})(?:\\s*(?:–|—|\\bto\\b|-)\\s*(${DATE}|present|current))?$`,
    "i"
  );

  const save = () => {
    if (current?.name) {
      awards.push({ ...current, id: makeId("award", awards.length) });
    }
  };

  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;

    const dateMatch = text.match(dateOnlyPattern);
    if (dateMatch) {
      if (current) {
        current.year = dateMatch[2]
          ? text.replace(/\s+/g, " ").trim()
          : dateMatch[1].match(/\b(?:19|20)\d{2}\b/)?.[0] ?? current.year;
      }
      continue;
    }

    if (!current) {
      current = {
        name: text,
        issuer: "",
        year: text.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? "",
      };
    } else if (!current.issuer) {
      current.issuer = text;
    } else {
      save();
      current = {
        name: text,
        issuer: "",
        year: text.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? "",
      };
    }
  }
  save();
  return awards;
}

function parseReferences(lines: PdfTextLine[]) {
  const references = [];
  for (const line of lines) {
    const email = line.text.match(EMAIL_PATTERN)?.[0] ?? "";
    const phone = line.text.match(PHONE_PATTERN)?.[0]?.trim() ?? "";
    const name = line.text.replace(email, "").replace(phone, "").replace(/[|·,]/g, " ").trim();
    if (!name && !email && !phone) continue;
    references.push({
      id: makeId("reference", references.length),
      name,
      company: "",
      email,
      phone,
    });
  }
  return references;
}

function removeDateRange(text: string): { title: string; startDate: string; endDate: string } {
  const match = text.match(DATE_RANGE);
  if (!match) return { title: cleanEntryTitle(text), startDate: "", endDate: "" };
  return {
    title: cleanEntryTitle(text.slice(0, match.index)),
    startDate: match[1].trim(),
    endDate: match[2].trim(),
  };
}

function normalizeName(value: string): string {
  const compact = value.trim().replace(/\s+/g, " ");
  const name = isSpacedUppercase(compact) ? compact.replace(/\s/g, "") : compact;
  return name
    .toLowerCase()
    .replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toUpperCase());
}

function isSpacedUppercase(value: string): boolean {
  return /^(?:[A-Z]\s+){2,}[A-Z]$/.test(value.trim());
}

function nameFromLinkedInUrl(value: string): string {
  const match = value.match(/linkedin\.com\/in\/([^/?#]+)/i);
  if (!match) return "";
  return decodeURIComponent(match[1])
    .replace(/-\d{5,}.*$/, "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isUppercaseHeading(value: string): boolean {
  const letters = value.replace(/[^A-Za-z]/g, "");
  return letters.length >= 4 && letters === letters.toUpperCase();
}

function cleanEntryTitle(value: string): string {
  return value
    .replace(/^[•●▪◦*-]\s*/, "")
    .replace(/\s+/g, " ")
    .replace(/[|·]\s*$/, "")
    .trim();
}

function appendLine(existing: string, next: string): string {
  return existing ? `${existing}\n${next}` : next;
}

function splitList(value: string): string[] {
  return value
    .split(/[,;·•|\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/\s+/g, " "));
}

function removeFirst(text: string, fragment: string): string {
  const index = text.indexOf(fragment);
  return index < 0 ? text : `${text.slice(0, index)} ${text.slice(index + fragment.length)}`.trim();
}

function preferredLinkLabel(label?: string): string {
  const value = label?.trim() ?? "";
  return value && !/^https?:\/\//i.test(value) ? value : "View project";
}

function extractUrl(value: string): string {
  return normalizeUrl(value.match(/(?:https?:\/\/|www\.)\S+/i)?.[0] ?? "");
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim().replace(/[),.;]+$/, "");
  if (!trimmed) return "";
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function makeId(prefix: string, index: number): string {
  return `pdf-${prefix}-${index + 1}`;
}
