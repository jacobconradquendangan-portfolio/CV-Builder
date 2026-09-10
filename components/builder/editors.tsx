"use client";

import { useResumeStore } from "@/store/useResumeStore";
import { ItemList } from "./ItemList";
import { SelectField, TextArea, TextField } from "./controls";
import { PhotoUploader } from "./PhotoUploader";

const LANGUAGE_LEVELS = [
  "Elementary",
  "Limited Working",
  "Professional Working",
  "Full Professional",
  "Native",
];

export function PersonalEditor() {
  const personal = useResumeStore((state) => state.data.personal);
  const setPersonal = useResumeStore((state) => state.setPersonal);

  return (
    <div>
      <PhotoUploader />
      <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
        <TextField
          label="Full name"
          value={personal.fullName}
          onChange={(value) => setPersonal({ fullName: value })}
          placeholder="Avery Stone"
        />
        <TextField
          label="Job title"
          value={personal.jobTitle}
          onChange={(value) => setPersonal({ jobTitle: value })}
          placeholder="Senior Product Designer"
        />
        <TextField
          label="Email"
          type="email"
          value={personal.email}
          onChange={(value) => setPersonal({ email: value })}
          placeholder="avery@example.com"
        />
        <TextField
          label="Phone"
          value={personal.phone}
          onChange={(value) => setPersonal({ phone: value })}
          placeholder="+1 (555) 012-3456"
        />
        <TextField
          label="Location"
          value={personal.location}
          onChange={(value) => setPersonal({ location: value })}
          placeholder="Berlin, Germany"
        />
        <TextField
          label="Website / LinkedIn"
          value={personal.website}
          onChange={(value) => setPersonal({ website: value })}
          placeholder="averystone.design"
        />
      </div>
      <TextArea
        label="Professional summary"
        rows={5}
        value={personal.summary}
        onChange={(value) => setPersonal({ summary: value })}
        placeholder="Short introduction that sells your profile..."
      />
      <p className="mt-4 rounded-md bg-indigo-50 px-3 py-2 text-xs leading-relaxed text-indigo-800">
        Tip: click Download PDF and choose Save as PDF to export your resume as a print-ready document.
      </p>
    </div>
  );
}

export function ExperienceEditor() {
  const items = useResumeStore((state) => state.data.experience);
  const updateItem = useResumeStore((state) => state.updateItem);
  const addItem = useResumeStore((state) => state.addItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const moveItem = useResumeStore((state) => state.moveItem);

  return (
    <ItemList
      items={items}
      addLabel="Add experience"
      onAdd={() => addItem("experience")}
      onRemove={(id) => removeItem("experience", id)}
      onMove={(from, to) => moveItem("experience", from, to)}
      formatLabel={(item, index) =>
        item.role || item.company
          ? [item.role, item.company].filter(Boolean).join(" — ")
          : `Experience ${index + 1}`
      }
    >
      {(item) => (
        <div className="pt-3">
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <TextField
              label="Role"
              value={item.role}
              onChange={(value) => updateItem("experience", item.id, { role: value })}
              placeholder="Senior Frontend Engineer"
            />
            <TextField
              label="Company"
              value={item.company}
              onChange={(value) => updateItem("experience", item.id, { company: value })}
              placeholder="Acme Corp"
            />
            <TextField
              label="Location"
              value={item.location}
              onChange={(value) => updateItem("experience", item.id, { location: value })}
              placeholder="Berlin, DE"
            />
            <div className="grid grid-cols-2 gap-x-3">
              <TextField
                label="Start"
                value={item.startDate}
                onChange={(value) => updateItem("experience", item.id, { startDate: value })}
                placeholder="2019-04"
              />
              <TextField
                label="End"
                value={item.endDate}
                onChange={(value) => updateItem("experience", item.id, { endDate: value })}
                placeholder="2022-08"
              />
            </div>
          </div>
          <TextArea
            label="Description"
            rows={5}
            value={item.description}
            onChange={(value) => updateItem("experience", item.id, { description: value })}
            helper="One bullet point per line — each line becomes a bullet on the resume."
            placeholder="Led the redesign of the onboarding flow."
          />
        </div>
      )}
    </ItemList>
  );
}

export function EducationEditor() {
  const items = useResumeStore((state) => state.data.education);
  const updateItem = useResumeStore((state) => state.updateItem);
  const addItem = useResumeStore((state) => state.addItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const moveItem = useResumeStore((state) => state.moveItem);

  return (
    <ItemList
      items={items}
      addLabel="Add education"
      onAdd={() => addItem("education")}
      onRemove={(id) => removeItem("education", id)}
      onMove={(from, to) => moveItem("education", from, to)}
      formatLabel={(item, index) =>
        item.degree || item.school
          ? [item.degree, item.school].filter(Boolean).join(" — ")
          : `Education ${index + 1}`
      }
    >
      {(item) => (
        <div className="pt-3">
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <TextField
              label="Degree"
              value={item.degree}
              onChange={(value) => updateItem("education", item.id, { degree: value })}
              placeholder="M.Sc. Computer Science"
            />
            <TextField
              label="School"
              value={item.school}
              onChange={(value) => updateItem("education", item.id, { school: value })}
              placeholder="University of Potsdam"
            />
            <TextField
              label="Location"
              value={item.location}
              onChange={(value) => updateItem("education", item.id, { location: value })}
              placeholder="Potsdam, DE"
            />
            <div className="grid grid-cols-2 gap-x-3">
              <TextField
                label="Start"
                value={item.startDate}
                onChange={(value) => updateItem("education", item.id, { startDate: value })}
                placeholder="2014-09"
              />
              <TextField
                label="End"
                value={item.endDate}
                onChange={(value) => updateItem("education", item.id, { endDate: value })}
                placeholder="2016-06"
              />
            </div>
          </div>
          <TextArea
            label="Details"
            rows={3}
            value={item.description}
            onChange={(value) => updateItem("education", item.id, { description: value })}
            placeholder="Focus areas, thesis, honors..."
          />
        </div>
      )}
    </ItemList>
  );
}

export function ProjectsEditor() {
  const items = useResumeStore((state) => state.data.projects);
  const updateItem = useResumeStore((state) => state.updateItem);
  const addItem = useResumeStore((state) => state.addItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const moveItem = useResumeStore((state) => state.moveItem);

  return (
    <ItemList
      items={items}
      addLabel="Add project"
      onAdd={() => addItem("projects")}
      onRemove={(id) => removeItem("projects", id)}
      onMove={(from, to) => moveItem("projects", from, to)}
      formatLabel={(item, index) => item.name || `Project ${index + 1}`}
    >
      {(item) => (
        <div className="pt-3">
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <TextField
              label="Project name"
              value={item.name}
              onChange={(value) => updateItem("projects", item.id, { name: value })}
              placeholder="Open Source Design System"
            />
            <TextField
              label="Link"
              value={item.link}
              onChange={(value) => updateItem("projects", item.id, { link: value })}
              placeholder="github.com/you/project"
            />
          </div>
          <TextArea
            label="Description"
            rows={4}
            value={item.description}
            onChange={(value) => updateItem("projects", item.id, { description: value })}
            helper="One bullet point per line."
            placeholder="Built the token architecture used across 12 products."
          />
        </div>
      )}
    </ItemList>
  );
}

export function SkillsEditor() {
  const items = useResumeStore((state) => state.data.skills);
  const updateItem = useResumeStore((state) => state.updateItem);
  const addItem = useResumeStore((state) => state.addItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const moveItem = useResumeStore((state) => state.moveItem);

  return (
    <div>
      <p className="mb-3 rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
        Skills appear as badges or tags depending on the template. Add one skill per entry.
      </p>
      <ItemList
        items={items}
        addLabel="Add skill"
        onAdd={() => addItem("skills")}
        onRemove={(id) => removeItem("skills", id)}
        onMove={(from, to) => moveItem("skills", from, to)}
        formatLabel={(item, index) => item.name || `Skill ${index + 1}`}
      >
        {(item) => (
          <div className="pt-3">
            <TextField
              label="Skill"
              value={item.name}
              onChange={(value) => updateItem("skills", item.id, { name: value })}
              placeholder="Design Systems"
            />
          </div>
        )}
      </ItemList>
    </div>
  );
}

export function LanguagesEditor() {
  const items = useResumeStore((state) => state.data.languages);
  const updateItem = useResumeStore((state) => state.updateItem);
  const addItem = useResumeStore((state) => state.addItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const moveItem = useResumeStore((state) => state.moveItem);

  return (
    <ItemList
      items={items}
      addLabel="Add language"
      onAdd={() => addItem("languages")}
      onRemove={(id) => removeItem("languages", id)}
      onMove={(from, to) => moveItem("languages", from, to)}
      formatLabel={(item, index) => item.name || `Language ${index + 1}`}
    >
      {(item) => (
        <div className="pt-3">
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <TextField
              label="Language"
              value={item.name}
              onChange={(value) => updateItem("languages", item.id, { name: value })}
              placeholder="English"
            />
            <SelectField
              label="Level"
              value={item.level}
              onChange={(value) => updateItem("languages", item.id, { level: value })}
              options={LANGUAGE_LEVELS}
              placeholder="Select level"
            />
          </div>
        </div>
      )}
    </ItemList>
  );
}

export function CertificationsEditor() {
  const items = useResumeStore((state) => state.data.certifications);
  const updateItem = useResumeStore((state) => state.updateItem);
  const addItem = useResumeStore((state) => state.addItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const moveItem = useResumeStore((state) => state.moveItem);

  return (
    <ItemList
      items={items}
      addLabel="Add certification"
      onAdd={() => addItem("certifications")}
      onRemove={(id) => removeItem("certifications", id)}
      onMove={(from, to) => moveItem("certifications", from, to)}
      formatLabel={(item, index) => item.name || `Certification ${index + 1}`}
    >
      {(item) => (
        <div className="pt-3">
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <TextField
              label="Certification"
              value={item.name}
              onChange={(value) => updateItem("certifications", item.id, { name: value })}
              placeholder="AWS Solutions Architect"
            />
            <TextField
              label="Issuer"
              value={item.issuer}
              onChange={(value) => updateItem("certifications", item.id, { issuer: value })}
              placeholder="Amazon Web Services"
            />
            <TextField
              label="Year"
              value={item.year}
              onChange={(value) => updateItem("certifications", item.id, { year: value })}
              placeholder="2023"
            />
          </div>
        </div>
      )}
    </ItemList>
  );
}

export function CharacterReferencesEditor() {
  const items = useResumeStore((state) => state.data.characterReferences);
  const updateItem = useResumeStore((state) => state.updateItem);
  const addItem = useResumeStore((state) => state.addItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const moveItem = useResumeStore((state) => state.moveItem);

  return (
    <ItemList
      items={items}
      addLabel="Add reference"
      onAdd={() => addItem("characterReferences")}
      onRemove={(id) => removeItem("characterReferences", id)}
      onMove={(from, to) => moveItem("characterReferences", from, to)}
      formatLabel={(item, index) => item.name || `Reference ${index + 1}`}
    >
      {(item) => (
        <div className="pt-3">
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <TextField
              label="Name"
              value={item.name}
              onChange={(value) => updateItem("characterReferences", item.id, { name: value })}
              placeholder="Maria Santos"
            />
            <TextField
              label="Company"
              value={item.company}
              onChange={(value) => updateItem("characterReferences", item.id, { company: value })}
              placeholder="GCash (Mynt)"
            />
            <TextField
              label="Email"
              type="email"
              value={item.email}
              onChange={(value) => updateItem("characterReferences", item.id, { email: value })}
              placeholder="maria.santos@example.com"
            />
            <TextField
              label="Phone"
              value={item.phone}
              onChange={(value) => updateItem("characterReferences", item.id, { phone: value })}
              placeholder="+63 917 555 0198"
            />
          </div>
        </div>
      )}
    </ItemList>
  );
}