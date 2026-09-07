export interface Personal {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photo: string;
  summary: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  link: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export type ListKey =
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "languages"
  | "certifications";

export type TemplateId = "modern" | "classic" | "minimal" | "sidebar" | "ats";

export interface ResumeData {
  personal: Personal;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
}

export interface TemplateProps {
  data: ResumeData;
  accent: string;
}