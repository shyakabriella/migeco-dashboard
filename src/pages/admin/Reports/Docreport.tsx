import { useMemo, useState, type ReactNode } from "react";
import AdminSidebar from "../AdminSidebar";

type UsagePoint = {
  label: string;
  views: number;
  downloads: number;
};

type DocumentRecord = {
  id: number;
  name: string;
  format: string;
  size: string;
  type: string;
  department: string;
  views: number;
  downloads: number;
  lastAccessed: string;
  icon: "pdf" | "doc" | "dwg";
  accent: string;
  deptClass: string;
};

const usageSeries: UsagePoint[] = [
  { label: "May 01", views: 48, downloads: 31 },
  { label: "May 05", views: 62, downloads: 39 },
  { label: "May 10", views: 54, downloads: 34 },
  { label: "May 15", views: 98, downloads: 62 },
  { label: "May 20", views: 112, downloads: 71 },
  { label: "May 25", views: 105, downloads: 58 },
  { label: "May 30", views: 129, downloads: 84 },
  { label: "Jun 04", views: 118, downloads: 77 },
  { label: "Jun 08", views: 146, downloads: 98 },
  { label: "Jun 12", views: 139, downloads: 84 },
  { label: "Jun 18", views: 152, downloads: 112 },
];

const documents: DocumentRecord[] = [
  {
    id: 1,
    name: "Site Alpha Survey Report",
    format: "PDF",
    size: "2.4 MB",
    type: "Survey Report",
    department: "Geology",
    views: 245,
    downloads: 128,
    lastAccessed: "May 28, 2024",
    icon: "pdf",
    accent: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/20",
    deptClass: "bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-400/20",
  },
  {
    id: 2,
    name: "Geotechnical Analysis Q2",
    format: "DOCX",
    size: "850 KB",
    type: "Analysis",
    department: "Engineering",
    views: 198,
    downloads: 85,
    lastAccessed: "May 27, 2024",
    icon: "doc",
    accent: "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/20",
    deptClass: "bg-fuchsia-500/15 text-fuchsia-200 ring-1 ring-inset ring-fuchsia-400/20",
  },
  {
    id: 3,
    name: "Safety Protocol v4",
    format: "PDF",
    size: "1.2 MB",
    type: "Policy",
    department: "HSE",
    views: 156,
    downloads: 142,
    lastAccessed: "May 26, 2024",
    icon: "pdf",
    accent: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/20",
    deptClass: "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-400/20",
  },
  {
    id: 4,
    name: "Beta Sector Maps",
    format: "DWG",
    size: "15.6 MB",
    type: "Blueprint",
    department: "Construction",
    views: 120,
    downloads: 95,
    lastAccessed: "May 25, 2024",
    icon: "dwg",
    accent: "bg-lime-500/15 text-lime-300 ring-1 ring-inset ring-lime-500/20",
    deptClass: "bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/20",
  },
  {
    id: 5,
    name: "Env. Impact Assessment",
    format: "PDF",
    size: "5.8 MB",
    type: "Report",
    department: "Geology",
    views: 98,
    downloads: 45,
    lastAccessed: "May 24, 2024",
    icon: "pdf",
    accent: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/20",
    deptClass: "bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-400/20",
  },
  {
    id: 6,
    name: "Foundation Inspection Log",
    format: "DOCX",
    size: "1.1 MB",
    type: "Inspection",
    department: "Engineering",
    views: 87,
    downloads: 41,
    lastAccessed: "May 21, 2024",
    icon: "doc",
    accent: "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/20",
    deptClass: "bg-fuchsia-500/15 text-fuchsia-200 ring-1 ring-inset ring-fuchsia-400/20",
  },
  {
    id: 7,
    name: "Drill Core Archive Index",
    format: "PDF",
    size: "7.4 MB",
    type: "Archive",
    department: "Geology",
    views: 76,
    downloads: 22,
    lastAccessed: "May 19, 2024",
    icon: "pdf",
    accent: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/20",
    deptClass: "bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-400/20",
  },
  {
    id: 8,
    name: "Crane Lift Procedure",
    format: "PDF",
    size: "980 KB",
    type: "Procedure",
    department: "HSE",
    views: 65,
    downloads: 51,
    lastAccessed: "May 16, 2024",
    icon: "pdf",
    accent: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/20",
    deptClass: "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-400/20",
  },
];

const topDocuments = documents.slice(0, 5);

const chartWidth = 760;
const chartHeight = 248;
const chartPadding = 22;

function buildLinePath(points: number[], maxValue: number) {
  return points
    .map((value, index) => {
      const x =
        chartPadding +
        (index * (chartWidth - chartPadding * 2)) / Math.max(points.length - 1, 1);
      const y =
        chartHeight -
        chartPadding -
        (value / maxValue) * (chartHeight - chartPadding * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function MenuIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 6h16" strokeLinecap="round" />
      <path d="M4 12h16" strokeLinecap="round" />
      <path d="M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.25 4.25" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M6.5 9a5.5 5.5 0 1 1 11 0v3.38c0 .73.24 1.44.67 2.03L19.5 16H4.5l1.33-1.59A3.2 3.2 0 0 0 6.5 12.38V9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M7.5 3.5v3" strokeLinecap="round" />
      <path d="M16.5 3.5v3" strokeLinecap="round" />
      <path d="M3.5 9h17" />
    </svg>
  );
}

function FolderIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l1.6 2h6.4A2.5 2.5 0 0 1 20.5 9.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 4v10" strokeLinecap="round" />
      <path d="m8.5 10.5 3.5 3.5 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 18.5h15" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m14.5 7-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m9.5 7 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotGridIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </svg>
  );
}

function SidebarIcon({ type, className = "h-4 w-4" }: { type: string; className?: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, className } as const;

  switch (type) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
        </svg>
      );
    case "documents":
      return (
        <svg {...common}>
          <path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h3.5l1.7 2H17A2.5 2.5 0 0 1 19.5 9.5v7A2.5 2.5 0 0 1 17 19H7a2.5 2.5 0 0 1-2.5-2.5v-9Z" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V7" strokeLinecap="round" />
          <path d="m8.5 10.5 3.5-3.5 3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 19h9" strokeLinecap="round" />
          <rect x="4" y="12" width="4" height="7" rx="1.5" />
          <rect x="16" y="12" width="4" height="7" rx="1.5" />
        </svg>
      );
    case "organization":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1.2" />
          <rect x="14" y="4" width="6" height="6" rx="1.2" />
          <rect x="9" y="14" width="6" height="6" rx="1.2" />
          <path d="M7 10v2h10v-2" />
          <path d="M12 12v2" />
        </svg>
      );
    case "search":
      return <SearchIcon className={className} />;
    case "version":
      return (
        <svg {...common}>
          <path d="M5 8a7 7 0 1 1-1 6" strokeLinecap="round" />
          <path d="M5 4v4h4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8.5a4 4 0 0 1 8 0V11" />
        </svg>
      );
    case "reports":
      return (
        <svg {...common}>
          <path d="M5 18.5V11" strokeLinecap="round" />
          <path d="M12 18.5V6" strokeLinecap="round" />
          <path d="M19 18.5v-8" strokeLinecap="round" />
        </svg>
      );
    case "audit":
      return (
        <svg {...common}>
          <path d="M6 5h12v14H6z" />
          <path d="M9 9h6" strokeLinecap="round" />
          <path d="M9 13h6" strokeLinecap="round" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M5 19a7 7 0 0 1 14 0" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" />
          <path d="M19 12h1.5" strokeLinecap="round" />
          <path d="M3.5 12H5" strokeLinecap="round" />
          <path d="M16.95 7.05l1.06-1.06" strokeLinecap="round" />
          <path d="M5.99 18.01l1.06-1.06" strokeLinecap="round" />
          <path d="M16.95 16.95l1.06 1.06" strokeLinecap="round" />
          <path d="M5.99 5.99l1.06 1.06" strokeLinecap="round" />
        </svg>
      );
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.5 9a2.5 2.5 0 1 1 4.08 1.94c-.99.84-1.58 1.35-1.58 2.56" strokeLinecap="round" />
          <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return <DotGridIcon className={className} />;
  }
}

function SelectPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-slate-800/90 px-4 text-sm font-medium text-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition hover:border-indigo-400/30 hover:bg-slate-800">
      <span className="text-slate-400">{icon}</span>
      <span>{value}</span>
      <ChevronDownIcon className="ml-1 h-4 w-4 text-slate-500" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function FileTypeIcon({ kind, className }: { kind: DocumentRecord["icon"]; className?: string }) {
  const label = kind.toUpperCase();
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold tracking-[0.18em] uppercase ${className}`}
    >
      {label.slice(0, 1)}
    </div>
  );
}

export default function Docreport() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [project, setProject] = useState("All Projects");

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesText =
        term.length === 0 ||
        [doc.name, doc.type, doc.department, doc.format, doc.lastAccessed]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesProject =
        project === "All Projects" ||
        (project === "Geology" && doc.department === "Geology") ||
        (project === "Engineering" && doc.department === "Engineering") ||
        (project === "Operations" && ["HSE", "Construction"].includes(doc.department));

      return matchesText && matchesProject;
    });
  }, [project, search]);

  const maxMetric = Math.max(...usageSeries.flatMap((item) => [item.views, item.downloads]));
  const viewsPath = buildLinePath(
    usageSeries.map((item) => item.views),
    maxMetric,
  );
  const downloadsPath = buildLinePath(
    usageSeries.map((item) => item.downloads),
    maxMetric,
  );

  const totalViews = filteredDocuments.reduce((sum, item) => sum + item.views, 0);
  const totalDownloads = filteredDocuments.reduce((sum, item) => sum + item.downloads, 0);
  const visibleTopDocs = topDocuments.filter((item) => {
    if (project === "All Projects") return true;
    if (project === "Operations") return ["HSE", "Construction"].includes(item.department);
    return item.department === project;
  });

  const dateOptions = ["Last 7 Days", "Last 30 Days", "Last Quarter"];
  const projectOptions = ["All Projects", "Geology", "Engineering", "Operations"];

  return (
    <div className="min-h-screen bg-[#0c1022] text-slate-100">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <AdminSidebar />

        <main className="flex-1">
          <header className="border-b border-white/8 bg-[#11152d]/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-4 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="font-semibold text-white">Reports</span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-2">
                  <SidebarIcon type="reports" className="h-4 w-4" />
                  <span>Document Usage</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-slate-800/80 text-slate-300 transition hover:border-indigo-400/30 hover:text-white">
                  <BellIcon className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#11152d] bg-rose-500" />
                </button>

                <div className="hidden h-8 w-px bg-white/8 sm:block" />

                <button className="flex items-center gap-3 rounded-full border border-white/8 bg-slate-800/80 py-1.5 pl-1.5 pr-3 text-left transition hover:border-indigo-400/30 hover:bg-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-orange-100 to-slate-200 text-sm font-semibold text-slate-700">
                    AM
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-medium text-white">Alex Morgan</div>
                    <div className="text-xs text-slate-400">Lead Geologist</div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>
          </header>

          <section className="px-5 py-6 sm:px-7 lg:px-10 lg:py-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">Document Usage Report</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Detailed analytics on document access, viewership, and downloads.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div onClick={() => setDateRange(dateOptions[(dateOptions.indexOf(dateRange) + 1) % dateOptions.length])}>
                  <SelectPill icon={<CalendarIcon className="h-4 w-4" />} label="Date Range" value={dateRange} />
                </div>
                <div onClick={() => setProject(projectOptions[(projectOptions.indexOf(project) + 1) % projectOptions.length])}>
                  <SelectPill icon={<FolderIcon className="h-4 w-4" />} label="Projects" value={project} />
                </div>
                <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 px-4 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(93,92,255,0.35)] transition hover:brightness-110">
                  <DownloadIcon className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_294px]">
              <section className="rounded-2xl border border-white/8 bg-[#232943] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Total Views vs. Downloads</h2>
                    <p className="mt-1 text-sm text-slate-400">Trend over selected period</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                      <span>Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span>Downloads</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent p-2">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[260px] w-full">
                    {[0.2, 0.45, 0.7, 0.95].map((ratio) => {
                      const y = chartHeight - chartPadding - ratio * (chartHeight - chartPadding * 2);
                      return (
                        <line
                          key={ratio}
                          x1={chartPadding}
                          x2={chartWidth - chartPadding}
                          y1={y}
                          y2={y}
                          stroke="rgba(148, 163, 184, 0.08)"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {usageSeries.map((point, index) => {
                      const x =
                        chartPadding +
                        (index * (chartWidth - chartPadding * 2)) /
                          Math.max(usageSeries.length - 1, 1);
                      return (
                        <text
                          key={point.label}
                          x={x}
                          y={chartHeight - 5}
                          textAnchor={index === 0 ? "start" : index === usageSeries.length - 1 ? "end" : "middle"}
                          fill="rgba(148,163,184,0.75)"
                          fontSize="11"
                        >
                          {point.label}
                        </text>
                      );
                    })}

                    <path d={viewsPath} fill="none" stroke="#5B63FF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={downloadsPath} fill="none" stroke="#00D39A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                    {usageSeries.map((point, index) => {
                      const x =
                        chartPadding +
                        (index * (chartWidth - chartPadding * 2)) /
                          Math.max(usageSeries.length - 1, 1);
                      const viewY =
                        chartHeight -
                        chartPadding -
                        (point.views / maxMetric) * (chartHeight - chartPadding * 2);
                      const downloadY =
                        chartHeight -
                        chartPadding -
                        (point.downloads / maxMetric) * (chartHeight - chartPadding * 2);

                      return (
                        <g key={`${point.label}-${point.views}`}>
                          <circle cx={x} cy={viewY} r="3.5" fill="#5B63FF" />
                          <circle cx={x} cy={downloadY} r="3.5" fill="#00D39A" />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </section>

              <section className="rounded-2xl border border-white/8 bg-[#232943] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
                <div>
                  <h2 className="text-xl font-semibold text-white">Top 5 Accessed Documents</h2>
                  <p className="mt-1 text-sm text-slate-400">Most popular files this month</p>
                </div>

                <div className="mt-8 space-y-5">
                  {visibleTopDocs.map((doc) => {
                    const barWidth = `${Math.max(18, (doc.views / 245) * 100)}%`;
                    return (
                      <div key={doc.id}>
                        <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                          <span className="max-w-[78%] truncate text-slate-100">{doc.name}.{doc.format.toLowerCase()}</span>
                          <span className="text-slate-500">{doc.views}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/6">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            style={{ width: barWidth }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-2xl border border-white/8 bg-[#232943] shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
              <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Document Usage Details</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {filteredDocuments.length} matching files • {totalViews} views • {totalDownloads} downloads
                  </p>
                </div>

                <label className="relative block w-full max-w-sm">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <SearchIcon className="h-4 w-4" />
                  </span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search documents..."
                    className="h-11 w-full rounded-xl border border-white/8 bg-[#1c213d] pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400/35"
                  />
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/8 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                      <th className="px-7 py-4 font-medium">Document Name</th>
                      <th className="px-5 py-4 font-medium">Type</th>
                      <th className="px-5 py-4 font-medium">Department</th>
                      <th className="px-5 py-4 font-medium">Views</th>
                      <th className="px-5 py-4 font-medium">Downloads</th>
                      <th className="px-7 py-4 font-medium text-right">Last Accessed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.slice(0, 5).map((doc) => (
                      <tr key={doc.id} className="border-b border-white/8 text-sm text-slate-200 transition hover:bg-white/[0.02]">
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-4">
                            <FileTypeIcon kind={doc.icon} className={doc.accent} />
                            <div>
                              <div className="font-medium text-white">{doc.name}</div>
                              <div className="mt-1 text-xs uppercase tracking-[0.08em] text-slate-500">
                                {doc.format} · {doc.size}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400">{doc.type}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${doc.deptClass}`}>
                            {doc.department}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-white">{doc.views}</td>
                        <td className="px-5 py-4 text-white">{doc.downloads}</td>
                        <td className="px-7 py-4 text-right text-slate-400">{doc.lastAccessed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>Showing 1 to {Math.min(5, filteredDocuments.length)} of {filteredDocuments.length || 0} entries</p>
                <div className="flex items-center gap-2 self-end">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-[#1c213d] text-slate-500 transition hover:border-indigo-400/30 hover:text-white">
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 transition ${
                        page === 1
                          ? "border-indigo-400/20 bg-indigo-500 text-white shadow-[0_10px_24px_rgba(99,102,241,0.35)]"
                          : "border-white/8 bg-[#1c213d] text-slate-500 hover:border-indigo-400/30 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <span className="px-1 text-slate-500">...</span>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-[#1c213d] text-slate-500 transition hover:border-indigo-400/30 hover:text-white">
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}
