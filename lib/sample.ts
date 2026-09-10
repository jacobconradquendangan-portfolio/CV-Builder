import type { ResumeData } from "./types";

export const DEFAULT_ACCENT = "#4f46e5";

export const sampleData: ResumeData = {
  personal: {
    fullName: "Andrea Nicole Reyes",
    jobTitle: "Senior Product Designer",
    email: "andrea.reyes@example.com",
    phone: "+63 917 555 0123",
    location: "Makati City, Metro Manila",
    website: "andrea-reyes.design",
    photo: "",
    summary:
      "Product designer with 8+ years of experience crafting intuitive digital products for fintech and e-commerce in the Philippine market. I bridge research, strategy and execution to ship experiences that users love and businesses rely on.",
  },
  experience: [
    {
      id: "exp-1",
      role: "Senior Product Designer",
      company: "GCash (Mynt)",
      location: "Makati City, Metro Manila",
      startDate: "2021-03",
      endDate: "",
      description:
        "Led end-to-end design for the payments platform used by 81M+ Filipino users.\nBuilt and scaled the design system adopted by 4 product squads.\nImproved transaction completion rate by 28% through research-driven redesign.",
    },
    {
      id: "exp-2",
      role: "Product Designer",
      company: "Kalibrr",
      location: "Ortigas Center, Pasig City",
      startDate: "2018-06",
      endDate: "2021-02",
      description:
        "Designed the job-matching experience for 2M+ Filipino job seekers.\nRan usability testing and translated insights into 40+ shipped improvements.\nIncreased profile completion rate by 35%.",
    },
    {
      id: "exp-3",
      role: "UI / UX Designer",
      company: "Pointwest Technologies",
      location: "Eastwood City, Quezon City",
      startDate: "2016-01",
      endDate: "2018-05",
      description:
        "Produced wireframes, prototypes and marketing pages for 30+ clients across BPO and financial services.\nIntroduced a prototyping workflow that cut client feedback cycles in half.",
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "M.S. Human-Computer Interaction",
      school: "Ateneo de Manila University",
      location: "Quezon City, Metro Manila",
      startDate: "2014-09",
      endDate: "2016-06",
      description: "Focus on human-computer interaction and design research.",
    },
    {
      id: "edu-2",
      degree: "B.S. Information Technology",
      school: "University of the Philippines Diliman",
      location: "Quezon City, Metro Manila",
      startDate: "2010-09",
      endDate: "2014-06",
      description: "Magna Cum Laude. Specialized in human-computer interaction and web development.",
    },
  ],
  projects: [
    {
      id: "prj-1",
      name: "GCash App Redesign",
      link: "gcash.com",
      description:
        "Redesigned the bill payments flow for 81M+ users.\nImproved transaction completion rate by 28% and reduced support tickets by 15%.",
    },
    {
      id: "prj-2",
      name: "Barangay e-Serbasyon",
      link: "github.com/andrea/barangay",
      description:
        "A digital services platform for barangay clearance and permit applications.\nServed 50K+ residents across 12 barangays in Metro Manila.",
    },
  ],
  skills: [
    { id: "sk-1", name: "UX Research" },
    { id: "sk-2", name: "Design Systems" },
    { id: "sk-3", name: "Prototyping" },
    { id: "sk-4", name: "Interaction Design" },
    { id: "sk-5", name: "Usability Testing" },
    { id: "sk-6", name: "Figma" },
    { id: "sk-7", name: "HTML / CSS" },
    { id: "sk-8", name: "Storytelling" },
  ],
  languages: [
    { id: "lang-1", name: "Filipino", level: "Native" },
    { id: "lang-2", name: "English", level: "Professional Working" },
    { id: "lang-3", name: "Cebuano", level: "Conversational" },
  ],
  certifications: [
    { id: "cert-1", name: "Google UX Design Professional Certificate", issuer: "Google", year: "2021" },
    { id: "cert-2", name: "Certified Usability Analyst", issuer: "HFI", year: "2020" },
  ],
  characterReferences: [],
};