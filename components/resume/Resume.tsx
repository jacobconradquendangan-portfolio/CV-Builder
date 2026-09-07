import type { ComponentType } from "react";
import type { ResumeData, TemplateId, TemplateProps } from "@/lib/types";
import Ats from "./templates/Ats";
import Classic from "./templates/Classic";
import Minimal from "./templates/Minimal";
import Modern from "./templates/Modern";
import Sidebar from "./templates/Sidebar";

export const TEMPLATES: Record<TemplateId, ComponentType<TemplateProps>> = {
  modern: Modern,
  classic: Classic,
  minimal: Minimal,
  sidebar: Sidebar,
  ats: Ats,
};

export function Resume({
  data,
  templateId,
  accent,
}: {
  data: ResumeData;
  templateId: TemplateId;
  accent: string;
}) {
  const Template = TEMPLATES[templateId] ?? Modern;
  return <Template data={data} accent={accent} />;
}