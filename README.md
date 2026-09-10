# CV / Resume Builder

A fast, Vercel-friendly resume & curriculum vitae builder built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Zustand**.

Enter your details once, switch between five professional formats, customize the accent color, check common ATS risks, and export a crisp, print-ready **PDF** or an editable **DOCX** — 100% client-side, so it works seamlessly on Vercel serverless.

## Features

- **ATS self-check panel** — live pass/warn/fail review of parser risks (layout, missing sections, bullet length, photo, page count)
- **Job keyword coverage** — paste a job description for a local comparison of common keywords against your resume
- **Five templates** — Modern, Classic, Minimal, Sidebar, and ATS-Friendly
- **Accent color picker** — restyle your whole document with one click
- **ATS-Friendly format** — a strictly single-column, parser-safe layout for job portals
- **Live A4 preview** — scaled to fit your editor, pixel-accurate to the export
- **Full data model** — personal info, summary, experience, education, projects, skills, languages, certifications, awards & honors, character references
- **Awards & Honors** — showcase achievements, recognition, and industry awards (ATS-friendly, great for keywords)
- **Character references** — optional section for professional references with name, company, email, and phone (ATS-advised: provide upon request in most markets)
- **Reorderable lists** — add, remove, and reorder entries with a simple UI
- **PDF export** — exact, vector, text-selectable output via the browser print dialog
- **DOCX export** — downloadable, editable file compatible with Microsoft Word, Google Docs, LibreOffice, and Apple Pages
- **Auto-save** — everything persists to `localStorage` (via Zustand `persist`)
- **Privacy-first storage** — resume details, photos, and job descriptions stay in the browser; the app has no account or data-collection backend
- **Sample data** — one click to load a realistic example
- **Mobile-friendly workspace** — responsive template and color controls, collapsible editor and preview views, mobile ATS drawer, and full-width resume preview

## Mobile compatibility

Version **1.0.1** improves the builder experience on phones and smaller screens. You can switch between the editor and preview, hide either workspace for a full-screen view, choose a template and accent color from mobile-friendly controls, and open the ATS check in a drawer.

Mobile support is actively being tested and improved. Please report layout issues, export problems, or other feedback through the GitHub Issues link in the app's welcome guide.

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

## Exporting to PDF

Click **Download PDF** (or press `Ctrl/Cmd + P`). In the print dialog choose **“Save as PDF”** as the destination, set paper size to **A4** and margins to **None** for the best result. Because the resume is rendered as real DOM/CSS, the resulting PDF keeps vector text (selectable, searchable) and exact colors.

The export is handled entirely in the browser with print CSS — no server-side rendering of PDFs required, which is why it works out of the box on Vercel.

## Exporting to DOCX

Click **Export DOCX** to download a `.docx` file (Office Open XML) that opens and is fully editable in **Microsoft Word**, **Google Docs**, **LibreOffice**, and **Apple Pages**. The file includes your name, job title, contact line, summary, experience, education, projects, skills, languages, certifications, awards, and character references — formatted with section headings, bullet points, and right-aligned dates.

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

CVBuilder is released under the [MIT License](LICENSE). Copyright (c) 2026 Jacob Conrad Quendangan.

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

## How printing / PDF generation works

The resume is rendered inside `#resume-inner` at full A4 size (794 px wide) and visually scaled down for the editor. When printing, CSS in `app/globals.css`:

- Sets `@page { size: A4; margin: 0 }`.
- Hides all page UI and re-shows only `#resume-print`.
- Resets the preview scaling so the document prints at natural size.
- Enforces `print-color-adjust: exact` so template colors are preserved.

