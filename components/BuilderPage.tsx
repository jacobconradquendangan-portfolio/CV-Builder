"use client";

import { FormPanel } from "./builder/FormPanel";
import { Preview } from "./builder/Preview";
import { Topbar } from "./builder/Topbar";
import { AtsCheckPanel } from "./builder/AtsCheckPanel";
import { WelcomeModal } from "./builder/WelcomeModal";

export function BuilderPage() {
  return (
    <div className="app-shell flex h-screen min-h-0 flex-col overflow-hidden bg-slate-100">
      <Topbar />
      <WelcomeModal />
      <div className="app-main flex min-h-0 flex-1 flex-col lg:flex-row">
        <FormPanel />
        <Preview />
        <aside className="hidden h-full w-[340px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white xl:block">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-3 py-2.5">
            <h2 className="text-sm font-semibold text-slate-800">ATS Check</h2>
            <p className="text-[11px] text-slate-500">
              Live review of how well your resume survives applicant tracking systems.
            </p>
          </div>
          <div className="px-3 py-3">
            <AtsCheckPanel />
          </div>
        </aside>
      </div>
    </div>
  );
}