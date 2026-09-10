# CV Builder

A fast, privacy-first resume and CV builder built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Zustand**. Enter your details, switch between five professional templates, run an ATS self-check, and export a print-ready **PDF** or editable **DOCX** — entirely client-side.

## Features

- **Five templates** — Modern, Classic, Minimal, Sidebar, and ATS-Friendly
- **ATS self-check** — live pass/warn/fail review of parser risks (layout, missing sections, bullet length, page count)
- **Job keyword coverage** — paste a job description to compare keywords against your resume
- **Live A4 preview** — pixel-accurate, scaled editor with page-break indicators
- **Accent color picker** — restyle the entire document with one click
- **PDF export** — vector, text-selectable output via the browser print dialog
- **DOCX export** — editable file compatible with Word, Google Docs, LibreOffice, and Pages
- **Full data model** — personal info, summary, experience, education, projects, skills, languages, certifications, awards, and character references
- **Auto-save** — all data persists to `localStorage`
- **Privacy-first** — your resume and photos never leave the browser
- **Responsive** — collapsible editor/preview, mobile ATS drawer, full-width preview on small screens

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run build`   | Production build             |
| `npm run start`   | Run the production build     |
| `npm run lint`    | Run ESLint                   |

## Exporting

**PDF** — Click **Download PDF** (or `Ctrl/Cmd + P`). In the print dialog, choose **Save as PDF**, set paper size to **A4**, and margins to **None**. The resume renders as real DOM/CSS, so the output keeps vector text and exact colors.

**DOCX** — Click **Export DOCX** to download an editable `.docx` file with all sections formatted with headings, bullet points, and right-aligned dates.

## Deploying to Vercel

Everything is static and client-side, so deploying is trivial:

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import it into [Vercel](https://vercel.com/new) — the framework preset **Next.js** is detected automatically.
3. Click **Deploy**.

No environment variables or serverless functions are required.

You can also deploy via the CLI:

```bash
npm i -g vercel
vercel
```

## License

Released under the [MIT License](LICENSE). Copyright (c) 2026 Jacob Conrad Quendangan.

## Project structure

```
app/                     # Next.js app router (root page + layout + globals.css)
components/
  BuilderPage.tsx        # 3-column layout: editor | live preview | ATS check
  builder/
    Topbar.tsx           # Template picker, accent colors, help, and download actions
    FormPanel.tsx        # Tabbed data-entry panel (left column)
    AtsCheckPanel.tsx    # Live ATS self-check and local keyword coverage (right column)
    editors.tsx          # Section editors (personal, experience, …)
    controls.tsx         # TextField, TextArea, SelectField building blocks
    ItemList.tsx         # Reusable add / remove / reorder list editor
    Preview.tsx          # Scaled A4 live preview (center column) + print root
  resume/
    Resume.tsx           # Template registry + selector
    primitives.tsx       # Shared BulletList, DateRange, date helpers
    templates/           # Modern, Classic, Minimal, Sidebar, Ats
lib/
  types.ts               # Data model + shared types
  sample.ts              # Sample resume data
  utils.ts               # cn() class helper
  exportDocx.ts          # DOCX (Office Open XML) export generator
store/
  useResumeStore.ts      # Zustand store with localStorage persistence
```

## Adding a new template

1. Create `components/resume/templates/YourTemplate.tsx` exporting a component typed as `TemplateProps` (receives `data` and `accent`).
2. Register it in `components/resume/Resume.tsx` under a new `TemplateId`.
3. Add your `TemplateId` to the `TemplateId` union in `lib/types.ts`.
4. Add an option to the topbar dropdown in `components/builder/Topbar.tsx`.

Templates are plain React + CSS, so anything that uses Tailwind utilities will appear identically in the exported PDF.
