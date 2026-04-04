import { useState } from "react";

type WorkPhase = "Excavation" | "Foundation" | "Logistics" | "Structure";
type Status = "Approved" | "Pending Review" | "Flagged";

interface Report {
  id: number;
  name: string;
  code: string;
  manager: string;
  initials: string;
  avatarColor: string;
  phase: WorkPhase;
  status: Status;
  date: string;
  icon: "doc" | "excel" | "warning" | "chart";
}

const reports: Report[] = [
  {
    id: 1,
    name: "Daily Log - Site A4",
    code: "DL-2023-10-24-A4.pdf",
    manager: "John Smith",
    initials: "JS",
    avatarColor: "bg-blue-600",
    phase: "Excavation",
    status: "Approved",
    date: "Oct 24, 2023",
    icon: "doc",
  },
  {
    id: 2,
    name: "Concrete Pour Report – Base",
    code: "CP-2023-10-23-B2.pdf",
    manager: "Maria Kovac",
    initials: "MK",
    avatarColor: "bg-rose-600",
    phase: "Foundation",
    status: "Pending Review",
    date: "Oct 23, 2023",
    icon: "doc",
  },
  {
    id: 3,
    name: "Material Usage - Week 42",
    code: "MU-W42-2023.xlsx",
    manager: "David Ross",
    initials: "DR",
    avatarColor: "bg-emerald-600",
    phase: "Logistics",
    status: "Approved",
    date: "Oct 23, 2023",
    icon: "excel",
  },
  {
    id: 4,
    name: "Safety Incident Report #004",
    code: "SIR-004-SITE-B.pdf",
    manager: "John Smith",
    initials: "JS",
    avatarColor: "bg-blue-600",
    phase: "Excavation",
    status: "Flagged",
    date: "Oct 22, 2023",
    icon: "warning",
  },
  {
    id: 5,
    name: "Daily Log - Site A4",
    code: "DL-2023-10-22-A4.pdf",
    manager: "John Smith",
    initials: "JS",
    avatarColor: "bg-blue-600",
    phase: "Excavation",
    status: "Approved",
    date: "Oct 22, 2023",
    icon: "doc",
  },
  {
    id: 6,
    name: "Progress Report - Structural Steel",
    code: "PR-SS-L3.pdf",
    manager: "Ana Lee",
    initials: "AL",
    avatarColor: "bg-violet-600",
    phase: "Structure",
    status: "Approved",
    date: "Oct 21, 2023",
    icon: "chart",
  },
];

const phaseColors: Record<WorkPhase, string> = {
  Excavation: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  Foundation: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  Logistics: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
  Structure: "bg-teal-500/20 text-teal-400 border border-teal-500/30",
};

const statusConfig: Record<Status, { dot: string; label: string; color: string }> = {
  Approved: { dot: "bg-emerald-500", label: "Approved", color: "text-emerald-400" },
  "Pending Review": { dot: "bg-amber-400", label: "Pending Review", color: "text-amber-400" },
  Flagged: { dot: "bg-red-500", label: "Flagged", color: "text-red-400" },
};

const DocIcon = ({ type }: { type: Report["icon"] }) => {
  if (type === "warning") {
    return (
      <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    );
  }
  if (type === "chart") {
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
    );
  }
  if (type === "excel") {
    return (
      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );
};

export default function ReportsTable() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  return (
    <div className="flex flex-col flex-1">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search reports..."
              className="bg-[#151d2e] border border-white/10 text-slate-300 text-sm placeholder:text-slate-600 rounded-lg pl-9 pr-4 py-2 w-52 focus:outline-none focus:border-[#3b5bdb] transition-colors"
            />
          </div>

          {/* Filter */}
          <button className="flex items-center gap-2 bg-[#151d2e] border border-white/10 text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>

          {/* Date Range */}
          <button className="flex items-center gap-2 bg-[#151d2e] border border-white/10 text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Date Range
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-[#151d2e] border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Download */}
          <button className="w-9 h-9 bg-[#151d2e] border border-white/10 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#151d2e] border border-white/5 rounded-xl overflow-hidden flex-1">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr_0.5fr] gap-4 px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Report Name
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Site Manager</div>
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Work Phase</div>
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Status</div>
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Date</div>
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Actions</div>
        </div>

        {/* Table Rows */}
        {reports.map((report, idx) => {
          const st = statusConfig[report.status];
          return (
            <div
              key={report.id}
              className={`grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr_0.5fr] gap-4 px-6 py-4 items-center hover:bg-white/[0.03] transition-colors ${
                idx !== reports.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              {/* Report Name */}
              <div className="flex items-center gap-3">
                <DocIcon type={report.icon} />
                <div>
                  <p className="text-white text-sm font-medium leading-tight">{report.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{report.code}</p>
                </div>
              </div>

              {/* Site Manager */}
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${report.avatarColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                  {report.initials}
                </div>
                <span className="text-slate-300 text-sm">{report.manager}</span>
              </div>

              {/* Work Phase */}
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${phaseColors[report.phase]}`}>
                  {report.phase}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                <span className={`text-sm ${st.color}`}>{st.label}</span>
              </div>

              {/* Date */}
              <div className="text-slate-400 text-sm">{report.date}</div>

              {/* Actions */}
              <div className="flex items-center justify-center">
                <button className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/5">
          <p className="text-slate-500 text-sm">
            Showing <span className="text-slate-300">1</span> to{" "}
            <span className="text-slate-300">6</span> of{" "}
            <span className="text-slate-300 font-semibold">3,402</span> results
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-slate-500 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-not-allowed opacity-50">
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
