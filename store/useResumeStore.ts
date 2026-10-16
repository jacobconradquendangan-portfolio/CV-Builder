import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_ACCENT, sampleData } from "@/lib/sample";
import { DEFAULT_DESIGN_THEME } from "@/lib/types";
import type { DesignTheme, ListKey, Personal, ResumeData, TemplateId } from "@/lib/types";

function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function emptyResume(): ResumeData {
  return {
    personal: {
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
      summary: "",
    },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    languages: [],
    certifications: [],
    characterReferences: [],
    awards: [],
  };
}

function blankItem<K extends ListKey>(key: K): ResumeData[K][number] {
  switch (key) {
    case "experience":
      return {
        id: uid(),
        role: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      } as ResumeData[K][number];
    case "education":
      return {
        id: uid(),
        degree: "",
        school: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      } as ResumeData[K][number];
    case "projects":
      return { id: uid(), name: "", link: "", linkLabel: "", description: "" } as ResumeData[K][number];
    case "skills":
      return { id: uid(), name: "" } as ResumeData[K][number];
    case "languages":
      return { id: uid(), name: "", level: "" } as ResumeData[K][number];
    case "certifications":
      return { id: uid(), name: "", issuer: "", year: "" } as ResumeData[K][number];
    case "characterReferences":
      return {
        id: uid(),
        name: "",
        company: "",
        email: "",
        phone: "",
      } as ResumeData[K][number];
    case "awards":
      return { id: uid(), name: "", issuer: "", year: "" } as ResumeData[K][number];
  }
}

export interface ResumeState {
  data: ResumeData;
  templateId: TemplateId;
  accent: string;
  design: DesignTheme;
  welcomeOpen: boolean;
  /** Measured pixel height of the rendered A4 resume (transient — not persisted). */
  contentHeight: number;

  setTemplateId: (id: TemplateId) => void;
  setAccent: (accent: string) => void;
  setDesign: (patch: Partial<DesignTheme>) => void;
  resetDesign: () => void;
  setWelcomeOpen: (open: boolean) => void;
  setPersonal: (patch: Partial<Personal>) => void;
  setData: (data: ResumeData) => void;
  setContentHeight: (height: number) => void;

  updateItem: <K extends ListKey>(
    key: K,
    id: string,
    patch: Partial<ResumeData[K][number]>
  ) => void;
  addItem: <K extends ListKey>(key: K) => void;
  removeItem: (key: ListKey, id: string) => void;
  moveItem: (key: ListKey, from: number, to: number) => void;

  loadSample: () => void;
  clear: () => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      data: sampleData,
      templateId: "modern",
      accent: DEFAULT_ACCENT,
      design: DEFAULT_DESIGN_THEME,
      welcomeOpen: false,
      contentHeight: 1123,

      setTemplateId: (templateId) => set({ templateId }),
      setAccent: (accent) => set({ accent }),
      setDesign: (patch) =>
        set((state) => ({
          design: { ...state.design, ...patch },
        })),
      resetDesign: () => set({ design: DEFAULT_DESIGN_THEME }),
      setWelcomeOpen: (welcomeOpen) => set({ welcomeOpen }),
      setContentHeight: (contentHeight) => set({ contentHeight }),

      setPersonal: (patch) =>
        set((state) => ({
          data: { ...state.data, personal: { ...state.data.personal, ...patch } },
        })),

      setData: (data) => set({ data }),

      updateItem: (key, id, patch) =>
        set((state) => ({
          data: {
            ...state.data,
            [key]: (state.data[key] as Array<{ id: string }>).map((item) =>
              item.id === id ? { ...item, ...patch } : item
            ),
          } as ResumeData,
        })),

      addItem: (key) =>
        set((state) => ({
          data: {
            ...state.data,
            [key]: [...(state.data[key] as unknown[]), blankItem(key)],
          } as ResumeData,
        })),

      removeItem: (key, id) =>
        set((state) => ({
          data: {
            ...state.data,
            [key]: (state.data[key] as Array<{ id: string }>).filter((item) => item.id !== id),
          } as ResumeData,
        })),

      moveItem: (key, from, to) =>
        set((state) => {
          const list = [...(state.data[key] as unknown[])];
          if (from === to || to < 0 || to >= list.length) return {};
          const [moved] = list.splice(from, 1);
          list.splice(to, 0, moved);
          return { data: { ...state.data, [key]: list } as ResumeData };
        }),

      loadSample: () => set({ data: sampleData }),
      clear: () => set({ data: emptyResume() }),
    }),
    {
      name: "cv-builder",
      version: 7,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<ResumeState> & {
          customTheme?: Partial<DesignTheme>;
        };
        const data = (state.data ?? {}) as Partial<ResumeData>;
        const personal = (data.personal ?? {}) as Partial<Personal>;
        // Drop legacy "custom" template id (Custom.tsx deleted) — fall back to modern.
        const templateId = state.templateId === ("custom" as TemplateId) ? "modern" : (state.templateId ?? "modern");
        // Map the short-lived dividerStyle toggle onto the new headingStyle choices.
        const legacyDivider = (state as { dividerStyle?: string }).dividerStyle;
        const headingStyle =
          state.design?.headingStyle ?? (legacyDivider === "none" ? "none" : "template");
        const persistedPhotoShape: string | undefined =
          state.customTheme?.photoShape ?? state.design?.photoShape;
        return {
          ...state,
          data: {
            ...emptyResume(),
            ...data,
            personal: {
              ...emptyResume().personal,
              ...personal,
              photo: personal.photo ?? "",
              websiteLabel: personal.websiteLabel ?? "",
              linkedin: personal.linkedin ?? "",
              linkedinLabel: personal.linkedinLabel ?? "",
            },
            experience: data.experience ?? [],
            education: data.education ?? [],
            projects: data.projects ?? [],
            skills: data.skills ?? [],
            languages: data.languages ?? [],
            certifications: data.certifications ?? [],
            characterReferences: data.characterReferences ?? [],
            awards: data.awards ?? [],
          },
          templateId,
          accent: state.accent ?? DEFAULT_ACCENT,
          design: {
            ...DEFAULT_DESIGN_THEME,
            ...(state.design ?? {}),
            headingStyle,
            // Tolerate the short-lived customTheme key from the reverted experiment.
            ...(state.customTheme ?? {}),
            photoShape:
              persistedPhotoShape === "circle" ||
              persistedPhotoShape === "rounded" ||
              persistedPhotoShape === "square"
                ? persistedPhotoShape
                : DEFAULT_DESIGN_THEME.photoShape,
          },
        };
      },
      // Persist only the resume content, not transient UI state (contentHeight).
      partialize: (state) => ({
        data: state.data,
        templateId: state.templateId,
        accent: state.accent,
        design: state.design,
      }),
    }
  )
);