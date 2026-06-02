import { useEffect, useMemo, useState, type ReactNode } from "react";
import AdminSidebar from "../AdminSidebar";
import {
  apiRequest,
  getCurrentUser,
  getDocuments,
  getProjects,
} from "../../../services/dmsApi";
import type {
  DmsDocument,
  ProjectSummary,
  UserSummary,
} from "../../../services/dmsApi";

type UsagePoint = {
  label: string;
  views: number;
  downloads: number;
};

type DocumentUsageRecord = {
  id: number | string;
  name: string;
  format: string;
  size: string;
  type: string;
  projectName: string;
  views: number;
  downloads: number;
  lastAccessed: string;
  lastAccessedRaw?: string | null;
  icon: "pdf" | "doc" | "xls" | "image" | "dwg" | "file";
  accent: string;
  projectClass: string;
  document: DmsDocument;
};

type DateRangeOption = {
  label: string;
  days: number;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

type AccessSummary = {
  total_views?: number;
  total_downloads?: number;
  recent_views?: number;
  recent_downloads?: number;
  [key: string]: unknown;
};

const chartWidth = 760;
const chartHeight = 248;
const chartPadding = 22;
const pageSize = 5;

const dateOptions: DateRangeOption[] = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last Quarter", days: 90 },
  { label: "Last 12 Months", days: 365 },
];

const projectBadgeClasses = [
  "bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-400/20",
  "bg-fuchsia-500/15 text-fuchsia-200 ring-1 ring-inset ring-fuchsia-400/20",
  "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-400/20",
  "bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/20",
  "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/20",
];

function toLower(value?: string | null): string {
  return value ? String(value).toLowerCase() : "";
}

function getReadableStatus(value?: string | null): string {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function formatBytes(bytes?: number | string | null): string {
  const numericBytes = Number(bytes || 0);

  if (!numericBytes || numericBytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = numericBytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size = size / 1024;
    index += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[index]}`;
}

function formatDate(date?: string | null): string {
  if (!date) return "Never accessed";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Never accessed";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
  });
}

function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function isWithinRange(date?: string | null, days = 30): boolean {
  if (!date) return false;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return false;

  return parsed >= getDateDaysAgo(days);
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const names = name.trim().split(" ").filter(Boolean);

  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }

  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
}

function getUserName(user: UserSummary | null): string {
  return user?.name || "DMS User";
}

function getRoleName(user: UserSummary | null): string {
  const role = (user as { role?: unknown } | null)?.role;

  if (!role) return "Reports Controller";

  if (typeof role === "string") return getReadableStatus(role);

  if (typeof role === "object" && role !== null) {
    const roleObject = role as { name?: string; slug?: string };

    return roleObject.name || getReadableStatus(roleObject.slug);
  }

  return "Reports Controller";
}

function getDocumentTitle(document: DmsDocument): string {
  return (
    document.original_file_name ||
    document.title ||
    document.document_code ||
    `Document #${document.id}`
  );
}

function getDocumentType(document: DmsDocument): string {
  if (document.document_type) return getReadableStatus(document.document_type);
  if (document.extension) return document.extension.toUpperCase();

  return "File";
}

function getProjectName(document: DmsDocument): string {
  return document.project?.name || "No Project";
}

function getLooseNumber(document: DmsDocument, keys: string[]): number {
  const rawDocument = document as unknown as Record<string, unknown>;

  for (const key of keys) {
    const value = rawDocument[key];

    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return 0;
}

function getLooseDate(document: DmsDocument, keys: string[]): string | null {
  const rawDocument = document as unknown as Record<string, unknown>;

  for (const key of keys) {
    const value = rawDocument[key];

    if (typeof value === "string" && value.trim() !== "") return value;
  }

  return document.updated_at || document.created_at || null;
}

function getDocumentViews(document: DmsDocument): number {
  return getLooseNumber(document, [
    "views_count",
    "view_count",
    "views",
    "access_count",
    "accesses_count",
    "opened_count",
    "open_count",
  ]);
}

function getDocumentDownloads(document: DmsDocument): number {
  return getLooseNumber(document, [
    "downloads_count",
    "download_count",
    "downloads",
    "downloaded_count",
  ]);
}

function getLastAccessedDate(document: DmsDocument): string | null {
  return getLooseDate(document, [
    "last_accessed_at",
    "last_viewed_at",
    "last_downloaded_at",
    "accessed_at",
    "viewed_at",
  ]);
}

function getIconKind(document: DmsDocument): DocumentUsageRecord["icon"] {
  const extension = toLower(document.extension);

  if (extension === "pdf") return "pdf";
  if (["doc", "docx"].includes(extension)) return "doc";
  if (["xls", "xlsx", "csv"].includes(extension)) return "xls";
  if (["jpg", "jpeg", "png", "webp", "tif", "tiff"].includes(extension)) {
    return "image";
  }
  if (["dwg", "dxf"].includes(extension)) return "dwg";

  return "file";
}

function getAccentClass(kind: DocumentUsageRecord["icon"]): string {
  switch (kind) {
    case "pdf":
      return "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/20";
    case "doc":
      return "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/20";
    case "xls":
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/20";
    case "image":
      return "bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-500/20";
    case "dwg":
      return "bg-lime-500/15 text-lime-300 ring-1 ring-inset ring-lime-500/20";
    default:
      return "bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-500/20";
  }
}

function buildDocumentRecords(documents: DmsDocument[]): DocumentUsageRecord[] {
  return documents.map((document, index) => {
    const kind = getIconKind(document);

    return {
      id: document.id,
      name: getDocumentTitle(document),
      format: document.extension?.toUpperCase() || "FILE",
      size: formatBytes(document.file_size),
      type: getDocumentType(document),
      projectName: getProjectName(document),
      views: getDocumentViews(document),
      downloads: getDocumentDownloads(document),
      lastAccessed: formatDate(getLastAccessedDate(document)),
      lastAccessedRaw: getLastAccessedDate(document),
      icon: kind,
      accent: getAccentClass(kind),
      projectClass: projectBadgeClasses[index % projectBadgeClasses.length],
      document,
    };
  });
}

function buildLinePath(points: number[], maxValue: number) {
  return points
    .map((value, index) => {
      const x =
        chartPadding +
        (index * (chartWidth - chartPadding * 2)) /
          Math.max(points.length - 1, 1);
      const y =
        chartHeight -
        chartPadding -
        ((maxValue > 0 ? value : 0) / Math.max(maxValue, 1)) *
          (chartHeight - chartPadding * 2);

      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildUsageSeries(records: DocumentUsageRecord[], days: number): UsagePoint[] {
  const interval = days <= 30 ? 5 : days <= 90 ? 15 : 60;
  const rows: UsagePoint[] = [];

  for (let day = days - 1; day >= 0; day -= interval) {
    const start = getDateDaysAgo(day);
    const end = new Date(start);
    end.setDate(start.getDate() + interval);
    end.setHours(23, 59, 59, 999);

    const matchingRecords = records.filter((record) => {
      const date = record.lastAccessedRaw || record.document.updated_at || record.document.created_at;

      if (!date) return false;

      const parsed = new Date(date);

      if (Number.isNaN(parsed.getTime())) return false;

      return parsed >= start && parsed <= end;
    });

    rows.push({
      label: formatShortDate(start),
      views: matchingRecords.reduce((sum, record) => sum + record.views, 0),
      downloads: matchingRecords.reduce((sum, record) => sum + record.downloads, 0),
    });
  }

  return rows.length > 0 ? rows : [{ label: "Today", views: 0, downloads: 0 }];
}

function matchesProject(record: DocumentUsageRecord, selectedProject: string): boolean {
  if (selectedProject === "All Projects") return true;

  return record.projectName === selectedProject;
}

async function safeRequest<T>(request: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await request();
  } catch {
    return fallback;
  }
}

function unwrapData<T>(response: unknown, fallback: T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return (response as { data?: T }).data ?? fallback;
  }

  return (response as T) ?? fallback;
}

function MenuIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M4 6h16" strokeLinecap="round" />
      <path d="M4 12h16" strokeLinecap="round" />
      <path d="M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.25 4.25" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
    >
      <path d="M6.5 9a5.5 5.5 0 1 1 11 0v3.38c0 .73.24 1.44.67 2.03L19.5 16H4.5l1.33-1.59A3.2 3.2 0 0 0 6.5 12.38V9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M7.5 3.5v3" strokeLinecap="round" />
      <path d="M16.5 3.5v3" strokeLinecap="round" />
      <path d="M3.5 9h17" />
    </svg>
  );
}

function FolderIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l1.6 2h6.4A2.5 2.5 0 0 1 20.5 9.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M12 4v10" strokeLinecap="round" />
      <path
        d="m8.5 10.5 3.5 3.5 3.5-3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.5 18.5h15" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="m14.5 7-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="m9.5 7 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SidebarIcon({
  type,
  className = "h-4 w-4",
}: {
  type: string;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    className,
  } as const;

  switch (type) {
    case "reports":
      return (
        <svg {...common}>
          <path d="M5 18.5V11" strokeLinecap="round" />
          <path d="M12 18.5V6" strokeLinecap="round" />
          <path d="M19 18.5v-8" strokeLinecap="round" />
        </svg>
      );
    default:
      return <MenuIcon className={className} />;
  }
}

function SelectPill({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-slate-800/90 px-4 text-sm font-medium text-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition hover:border-indigo-400/30 hover:bg-slate-800">
      <span className="text-slate-400">{icon}</span>
      <span className="sr-only">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none bg-transparent pr-6 text-sm font-medium text-slate-200 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-900">
            {option}
          </option>
        ))}
      </select>

      <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" />
    </label>
  );
}

function FileTypeIcon({
  kind,
  className,
}: {
  kind: DocumentUsageRecord["icon"];
  className?: string;
}) {
  const labelMap: Record<DocumentUsageRecord["icon"], string> = {
    pdf: "P",
    doc: "D",
    xls: "X",
    image: "I",
    dwg: "C",
    file: "F",
  };

  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold uppercase tracking-[0.18em] ${className}`}
    >
      {labelMap[kind]}
    </div>
  );
}

export default function Docreport() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [project, setProject] = useState("All Projects");
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [user, setUser] = useState<UserSummary | null>(null);
  const [accessSummary, setAccessSummary] = useState<AccessSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedRange =
    dateOptions.find((item) => item.label === dateRange) || dateOptions[1];

  async function loadData(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const [userData, documentsData, projectsData, accessSummaryData] =
        await Promise.all([
          safeRequest(() => getCurrentUser(), null),
          safeRequest(() => getDocuments({}), []),
          safeRequest(() => getProjects({}), []),
          safeRequest(
            async () =>
              unwrapData<AccessSummary>(
                await apiRequest("/document-access/summary", {
                  method: "GET",
                }),
                {}
              ),
            null
          ),
        ]);

      setUser(userData);
      setDocuments(documentsData);
      setProjects(projectsData);
      setAccessSummary(accessSummaryData);
      setCurrentPage(1);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load document usage report data.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const documentRecords = useMemo(
    () => buildDocumentRecords(documents),
    [documents]
  );

  const projectOptions = useMemo(
    () => [
      "All Projects",
      ...projects
        .map((item) => item.name)
        .filter((name): name is string => Boolean(name)),
    ],
    [projects]
  );

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return documentRecords.filter((record) => {
      const matchesText =
        term.length === 0 ||
        [
          record.name,
          record.type,
          record.projectName,
          record.format,
          record.size,
          record.lastAccessed,
          record.document.document_code,
          record.document.security_level,
          record.document.status,
          record.document.scan_status,
          record.document.sandbox_status,
          record.document.encryption_status,
          record.document.plaintext_status,
          record.document.ai_status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesSelectedProject = matchesProject(record, project);
      const dateValue =
        record.lastAccessedRaw ||
        record.document.updated_at ||
        record.document.created_at;

      const matchesDate = isWithinRange(dateValue, selectedRange.days);

      return matchesText && matchesSelectedProject && matchesDate;
    });
  }, [documentRecords, project, search, selectedRange.days]);

  const usageSeries = useMemo(
    () => buildUsageSeries(filteredDocuments, selectedRange.days),
    [filteredDocuments, selectedRange.days]
  );

  const maxMetric = Math.max(
    1,
    ...usageSeries.flatMap((item) => [item.views, item.downloads])
  );

  const viewsPath = buildLinePath(
    usageSeries.map((item) => item.views),
    maxMetric
  );

  const downloadsPath = buildLinePath(
    usageSeries.map((item) => item.downloads),
    maxMetric
  );

  const totalViewsFromDocuments = filteredDocuments.reduce(
    (sum, item) => sum + item.views,
    0
  );
  const totalDownloadsFromDocuments = filteredDocuments.reduce(
    (sum, item) => sum + item.downloads,
    0
  );

  const totalViews =
    accessSummary?.total_views && project === "All Projects" && !search
      ? Number(accessSummary.total_views)
      : totalViewsFromDocuments;

  const totalDownloads =
    accessSummary?.total_downloads && project === "All Projects" && !search
      ? Number(accessSummary.total_downloads)
      : totalDownloadsFromDocuments;

  const topDocuments = useMemo(
    () =>
      [...filteredDocuments]
        .sort((first, second) => second.views + second.downloads - (first.views + first.downloads))
        .slice(0, 5),
    [filteredDocuments]
  );

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + pageSize
  );

  function exportReport(): void {
    const payload = {
      generated_at: new Date().toISOString(),
      generated_by: getUserName(user),
      date_range: dateRange,
      project,
      total_documents: filteredDocuments.length,
      total_views: totalViews,
      total_downloads: totalDownloads,
      documents: filteredDocuments.map((record) => ({
        id: record.id,
        name: record.name,
        format: record.format,
        size: record.size,
        type: record.type,
        project: record.projectName,
        views: record.views,
        downloads: record.downloads,
        last_accessed: record.lastAccessed,
        status: record.document.status,
        scan_status: record.document.scan_status,
        sandbox_status: record.document.sandbox_status,
        encryption_status: record.document.encryption_status,
        plaintext_status: record.document.plaintext_status,
        ai_status: record.document.ai_status,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `document-usage-report-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#0c1022] text-slate-100">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <AdminSidebar />

        <main className="flex-1">
          <header className="border-b border-white/8 bg-[#11152d]/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-4 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                <span className="text-white">Reports</span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-2">
                  <SidebarIcon type="reports" className="h-4 w-4" />
                  <span>Document Usage</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/8 bg-slate-800/80 px-4 text-sm text-slate-300 transition hover:border-indigo-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
                  ) : (
                    <MenuIcon className="h-4 w-4" />
                  )}
                  Refresh
                </button>

                <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-slate-800/80 text-slate-300 transition hover:border-indigo-400/30 hover:text-white">
                  <BellIcon className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#11152d] bg-rose-500" />
                </button>

                <div className="hidden h-8 w-px bg-white/8 sm:block" />

                <button className="flex items-center gap-3 rounded-full border border-white/8 bg-slate-800/80 py-1.5 pl-1.5 pr-3 text-left transition hover:border-indigo-400/30 hover:bg-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-orange-100 to-slate-200 text-sm font-semibold text-slate-700">
                    {getInitials(getUserName(user))}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-medium text-white">
                      {getUserName(user)}
                    </div>
                    <div className="text-xs text-slate-400">{getRoleName(user)}</div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>
          </header>

          <section className="px-5 py-6 sm:px-7 lg:px-10 lg:py-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  Document Usage Report
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Real database analytics on document access, views, downloads,
                  projects, file types, and last access.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <SelectPill
                  icon={<CalendarIcon className="h-4 w-4" />}
                  label="Date Range"
                  value={dateRange}
                  options={dateOptions.map((item) => item.label)}
                  onChange={(value) => {
                    setDateRange(value);
                    setCurrentPage(1);
                  }}
                />

                <SelectPill
                  icon={<FolderIcon className="h-4 w-4" />}
                  label="Projects"
                  value={project}
                  options={projectOptions}
                  onChange={(value) => {
                    setProject(value);
                    setCurrentPage(1);
                  }}
                />

                <button
                  type="button"
                  onClick={exportReport}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 px-4 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(93,92,255,0.35)] transition hover:brightness-110"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>

            {alert && (
              <div
                className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                  alert.type === "error"
                    ? "border-rose-500/20 bg-rose-500/10 text-rose-200"
                    : "border-blue-500/20 bg-blue-500/10 text-blue-200"
                }`}
              >
                {alert.message}
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Total Views"
                value={totalViews}
                helper="From access/view fields returned by API"
              />
              <MetricCard
                title="Total Downloads"
                value={totalDownloads}
                helper="From download fields returned by API"
              />
              <MetricCard
                title="Matching Documents"
                value={filteredDocuments.length}
                helper={`${formatNumber(documents.length)} total documents loaded`}
              />
            </div>

            {loading ? (
              <div className="mt-8 rounded-2xl border border-white/8 bg-[#232943] p-12 text-center text-sm text-slate-400">
                Loading real document usage data from database...
              </div>
            ) : (
              <>
                <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_294px]">
                  <section className="rounded-2xl border border-white/8 bg-[#232943] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          Total Views vs. Downloads
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                          Trend over selected period using available access counters
                        </p>
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
                          const y =
                            chartHeight -
                            chartPadding -
                            ratio * (chartHeight - chartPadding * 2);

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
                              textAnchor={
                                index === 0
                                  ? "start"
                                  : index === usageSeries.length - 1
                                  ? "end"
                                  : "middle"
                              }
                              fill="rgba(148,163,184,0.75)"
                              fontSize="11"
                            >
                              {point.label}
                            </text>
                          );
                        })}

                        <path
                          d={viewsPath}
                          fill="none"
                          stroke="#5B63FF"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d={downloadsPath}
                          fill="none"
                          stroke="#00D39A"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {usageSeries.map((point, index) => {
                          const x =
                            chartPadding +
                            (index * (chartWidth - chartPadding * 2)) /
                              Math.max(usageSeries.length - 1, 1);
                          const viewY =
                            chartHeight -
                            chartPadding -
                            (point.views / maxMetric) *
                              (chartHeight - chartPadding * 2);
                          const downloadY =
                            chartHeight -
                            chartPadding -
                            (point.downloads / maxMetric) *
                              (chartHeight - chartPadding * 2);

                          return (
                            <g key={`${point.label}-${point.views}`}>
                              <circle cx={x} cy={viewY} r="3.5" fill="#5B63FF" />
                              <circle
                                cx={x}
                                cy={downloadY}
                                r="3.5"
                                fill="#00D39A"
                              />
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/8 bg-[#232943] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Top 5 Accessed Documents
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">
                        Most viewed/downloaded files in current filter
                      </p>
                    </div>

                    <div className="mt-8 space-y-5">
                      {topDocuments.length > 0 ? (
                        topDocuments.map((doc) => {
                          const topScore = Math.max(
                            1,
                            ...topDocuments.map((item) => item.views + item.downloads)
                          );
                          const score = doc.views + doc.downloads;
                          const barWidth = `${Math.max(8, (score / topScore) * 100)}%`;

                          return (
                            <div key={doc.id}>
                              <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                                <span className="max-w-[78%] truncate text-slate-100">
                                  {doc.name}
                                </span>
                                <span className="text-slate-500">{score}</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-white/6">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                  style={{ width: barWidth }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-slate-500">
                          No accessed documents found for this filter.
                        </p>
                      )}
                    </div>
                  </section>
                </div>

                <section className="mt-6 rounded-2xl border border-white/8 bg-[#232943] shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
                  <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Document Usage Details
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatNumber(filteredDocuments.length)} matching files •{" "}
                        {formatNumber(totalViews)} views •{" "}
                        {formatNumber(totalDownloads)} downloads
                      </p>
                    </div>

                    <label className="relative block w-full max-w-sm">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <SearchIcon className="h-4 w-4" />
                      </span>
                      <input
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setCurrentPage(1);
                        }}
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
                          <th className="px-5 py-4 font-medium">Project</th>
                          <th className="px-5 py-4 font-medium">Views</th>
                          <th className="px-5 py-4 font-medium">Downloads</th>
                          <th className="px-7 py-4 text-right font-medium">
                            Last Accessed
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDocuments.length > 0 ? (
                          paginatedDocuments.map((doc) => (
                            <tr
                              key={doc.id}
                              className="border-b border-white/8 text-sm text-slate-200 transition hover:bg-white/[0.02]"
                            >
                              <td className="px-7 py-4">
                                <div className="flex items-center gap-4">
                                  <FileTypeIcon
                                    kind={doc.icon}
                                    className={doc.accent}
                                  />
                                  <div>
                                    <div className="font-medium text-white">
                                      {doc.name}
                                    </div>
                                    <div className="mt-1 text-xs uppercase tracking-[0.08em] text-slate-500">
                                      {doc.format} · {doc.size}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-slate-400">
                                {doc.type}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${doc.projectClass}`}
                                >
                                  {doc.projectName}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-white">
                                {formatNumber(doc.views)}
                              </td>
                              <td className="px-5 py-4 text-white">
                                {formatNumber(doc.downloads)}
                              </td>
                              <td className="px-7 py-4 text-right text-slate-400">
                                {doc.lastAccessed}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-7 py-10 text-center text-sm text-slate-500"
                            >
                              No document usage record matched your filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-4 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Showing{" "}
                      {filteredDocuments.length === 0 ? 0 : startIndex + 1} to{" "}
                      {Math.min(startIndex + paginatedDocuments.length, filteredDocuments.length)}{" "}
                      of {filteredDocuments.length} entries
                    </p>
                    <div className="flex items-center gap-2 self-end">
                      <button
                        type="button"
                        disabled={safeCurrentPage <= 1}
                        onClick={() => setCurrentPage(safeCurrentPage - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-[#1c213d] text-slate-500 transition hover:border-indigo-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>

                      {Array.from({ length: totalPages })
                        .slice(0, 5)
                        .map((_, index) => {
                          const page = index + 1;

                          return (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 transition ${
                                page === safeCurrentPage
                                  ? "border-indigo-400/20 bg-indigo-500 text-white shadow-[0_10px_24px_rgba(99,102,241,0.35)]"
                                  : "border-white/8 bg-[#1c213d] text-slate-500 hover:border-indigo-400/30 hover:text-white"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                      <button
                        type="button"
                        disabled={safeCurrentPage >= totalPages}
                        onClick={() => setCurrentPage(safeCurrentPage + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-[#1c213d] text-slate-500 transition hover:border-indigo-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#232943] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}