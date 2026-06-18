import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  GitBranch,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
  UsersRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

type DateRangeOption = {
  label: string;
  value: string;
  days: number;
};

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
  icon: "pdf" | "doc" | "xls" | "image" | "archive" | "file";
  document: DmsDocument;
};

const PAGE_SIZE = 6;

const dateOptions: DateRangeOption[] = [
  { label: "Last 7 days", value: "7", days: 7 },
  { label: "Last 30 days", value: "30", days: 30 },
  { label: "Last quarter", value: "90", days: 90 },
  { label: "Last 12 months", value: "365", days: 365 },
];

const reportTabs = [
  {
    label: "Overview",
    path: "/reports",
    icon: BarChart3,
  },
  {
    label: "Document Usage",
    path: "/reports/docreport",
    icon: FileText,
  },
  {
    label: "Upload Activity",
    path: "/reports/uploadrep",
    icon: UploadCloud,
  },
  {
    label: "Projects",
    path: "/reports/depreport",
    icon: UsersRound,
  },
  {
    label: "Versioning",
    path: "/reports/versioningrep",
    icon: GitBranch,
  },
  {
    label: "Access & Permissions",
    path: "/reports/accessreport",
    icon: ShieldCheck,
  },
];

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function toLower(value?: string | null): string {
  return value ? String(value).toLowerCase() : "";
}

function getReadableStatus(value?: string | null): string {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function formatBytes(bytes?: number | string | null): string {
  const numericBytes = Number(bytes || 0);

  if (!numericBytes || numericBytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = numericBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
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

function formatRelativeTime(date?: string | null): string {
  if (!date) return "Never";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Never";

  const difference = Date.now() - parsed.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return formatDate(date);
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

  return parsed >= getDateDaysAgo(days - 1);
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const names = name.trim().split(/\s+/).filter(Boolean);

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

  if (!role) return "Reports User";

  if (typeof role === "string") {
    return getReadableStatus(role);
  }

  if (typeof role === "object" && role !== null) {
    const roleObject = role as {
      name?: string;
      slug?: string;
    };

    return (
      roleObject.name ||
      getReadableStatus(roleObject.slug) ||
      "Reports User"
    );
  }

  return "Reports User";
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
  if (document.document_type) {
    return getReadableStatus(document.document_type);
  }

  if (document.extension) {
    return document.extension.toUpperCase();
  }

  return "File";
}

function getProjectName(document: DmsDocument): string {
  return document.project?.name || "No project";
}

function getLooseNumber(
  document: DmsDocument,
  keys: string[]
): number {
  const rawDocument = document as unknown as Record<string, unknown>;

  for (const key of keys) {
    const value = rawDocument[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }

  return 0;
}

function getLooseDate(
  document: DmsDocument,
  keys: string[]
): string | null {
  const rawDocument = document as unknown as Record<string, unknown>;

  for (const key of keys) {
    const value = rawDocument[key];

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
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

function getIconKind(
  document: DmsDocument
): DocumentUsageRecord["icon"] {
  const extension = toLower(document.extension);

  if (extension === "pdf") return "pdf";
  if (["doc", "docx"].includes(extension)) return "doc";
  if (["xls", "xlsx", "csv"].includes(extension)) return "xls";

  if (
    ["jpg", "jpeg", "png", "webp", "tif", "tiff"].includes(extension)
  ) {
    return "image";
  }

  if (["dwg", "dxf", "zip", "rar"].includes(extension)) {
    return "archive";
  }

  return "file";
}

function buildDocumentRecords(
  documents: DmsDocument[]
): DocumentUsageRecord[] {
  return documents.map((document) => ({
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
    icon: getIconKind(document),
    document,
  }));
}

function buildUsageSeries(
  records: DocumentUsageRecord[],
  days: number
): UsagePoint[] {
  const interval =
    days <= 7 ? 1 : days <= 30 ? 5 : days <= 90 ? 15 : 60;

  const rows: UsagePoint[] = [];

  for (let offset = days - 1; offset >= 0; offset -= interval) {
    const start = getDateDaysAgo(offset);
    const end = new Date(start);
    end.setDate(start.getDate() + interval - 1);
    end.setHours(23, 59, 59, 999);

    const matchingRecords = records.filter((record) => {
      const date =
        record.lastAccessedRaw ||
        record.document.updated_at ||
        record.document.created_at;

      if (!date) return false;

      const parsed = new Date(date);

      if (Number.isNaN(parsed.getTime())) return false;

      return parsed >= start && parsed <= end;
    });

    rows.push({
      label: start.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      }),
      views: matchingRecords.reduce(
        (total, record) => total + record.views,
        0
      ),
      downloads: matchingRecords.reduce(
        (total, record) => total + record.downloads,
        0
      ),
    });
  }

  return rows.length > 0
    ? rows
    : [{ label: "Today", views: 0, downloads: 0 }];
}

function matchesProject(
  record: DocumentUsageRecord,
  selectedProject: string
): boolean {
  return (
    selectedProject === "All Projects" ||
    record.projectName === selectedProject
  );
}

async function safeRequest<T>(
  request: () => Promise<T>,
  fallback: T
): Promise<T> {
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

function Header({
  user,
  loading,
  onRefresh,
}: {
  user: UserSummary | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="flex min-h-[78px] shrink-0 items-center justify-between gap-5 border-b border-slate-200 bg-white px-5 lg:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Reports</span>
          <ChevronRight size={13} />
          <span className="text-slate-700">Document Usage</span>
        </div>

        <h1 className="mt-1 text-lg font-bold text-slate-900">
          Document Usage Report
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCcw size={16} />
          )}

          <span className="hidden sm:inline">Refresh</span>
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-1.5 py-1 transition hover:bg-slate-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {getInitials(getUserName(user))}
          </div>

          <div className="hidden text-left lg:block">
            <p className="max-w-[150px] truncate text-sm font-semibold text-slate-800">
              {getUserName(user)}
            </p>

            <p className="mt-0.5 max-w-[150px] truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {getRoleName(user)}
            </p>
          </div>

          <ChevronDown
            size={14}
            className="hidden text-slate-400 lg:block"
          />
        </button>
      </div>
    </header>
  );
}

function ReportTabs() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-200/40">
      <div className="flex min-w-max items-center gap-1">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === "/reports"}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-10 items-center gap-2 rounded-xl px-3.5",
                  "text-sm font-semibold transition",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )
              }
            >
              <Icon size={15} />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: number;
  helper: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {formatNumber(value)}
          </p>

          <p className="mt-2 text-[11px] text-slate-400">{helper}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function FileVisual({
  kind,
}: {
  kind: DocumentUsageRecord["icon"];
}) {
  const visual: Record<
    DocumentUsageRecord["icon"],
    {
      icon: ReactNode;
      className: string;
    }
  > = {
    pdf: {
      icon: <FileText size={18} />,
      className: "bg-red-50 text-red-600",
    },
    doc: {
      icon: <FileText size={18} />,
      className: "bg-blue-50 text-blue-600",
    },
    xls: {
      icon: <FileSpreadsheet size={18} />,
      className: "bg-emerald-50 text-emerald-600",
    },
    image: {
      icon: <FileImage size={18} />,
      className: "bg-violet-50 text-violet-600",
    },
    archive: {
      icon: <FileArchive size={18} />,
      className: "bg-orange-50 text-orange-600",
    },
    file: {
      icon: <FileText size={18} />,
      className: "bg-slate-100 text-slate-600",
    },
  };

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        visual[kind].className
      )}
    >
      {visual[kind].icon}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs font-bold text-slate-700">{label}</p>

      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={item.name}
            className="flex min-w-[120px] items-center justify-between gap-4 text-xs"
          >
            <span className="text-slate-500">
              {item.name === "views" ? "Views" : "Downloads"}
            </span>

            <span className="font-bold text-slate-900">
              {item.value ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);

    const values: number[] = [];

    for (let page = start; page <= end; page += 1) {
      values.push(page);
    }

    return values;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={15} />
      </button>

      {currentPage > 2 && (
        <>
          <button
            type="button"
            onClick={() => onChange(1)}
            className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            1
          </button>

          {currentPage > 3 && (
            <span className="px-1 text-xs text-slate-400">…</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "flex h-8 min-w-8 items-center justify-center rounded-lg border px-2",
            "text-xs font-semibold transition",
            page === currentPage
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          )}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages - 1 && (
        <>
          {currentPage < totalPages - 2 && (
            <span className="px-1 text-xs text-slate-400">…</span>
          )}

          <button
            type="button"
            onClick={() => onChange(totalPages)}
            className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onChange(currentPage + 1)}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

export default function Docreport() {
  const [search, setSearch] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("30");
  const [project, setProject] = useState<string>("All Projects");

  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [user, setUser] = useState<UserSummary | null>(null);
  const [accessSummary, setAccessSummary] =
    useState<AccessSummary | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const selectedRange =
    dateOptions.find((option) => option.value === dateRange) ||
    dateOptions[1];

  async function loadData(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const [
        userData,
        documentsData,
        projectsData,
        accessSummaryData,
      ] = await Promise.all([
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
      setDocuments(
        Array.isArray(documentsData) ? documentsData : []
      );
      setProjects(
        Array.isArray(projectsData) ? projectsData : []
      );
      setAccessSummary(accessSummaryData);
      setCurrentPage(1);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load the document usage report.",
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
      ...Array.from(
        new Set(
          projects
            .map((item) => item.name)
            .filter((name): name is string => Boolean(name))
        )
      ),
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

      const dateValue =
        record.lastAccessedRaw ||
        record.document.updated_at ||
        record.document.created_at;

      return (
        matchesText &&
        matchesProject(record, project) &&
        isWithinRange(dateValue, selectedRange.days)
      );
    });
  }, [documentRecords, project, search, selectedRange.days]);

  const usageSeries = useMemo(
    () => buildUsageSeries(filteredDocuments, selectedRange.days),
    [filteredDocuments, selectedRange.days]
  );

  const totalViewsFromDocuments = filteredDocuments.reduce(
    (total, record) => total + record.views,
    0
  );

  const totalDownloadsFromDocuments = filteredDocuments.reduce(
    (total, record) => total + record.downloads,
    0
  );

  const canUseGlobalSummary =
    project === "All Projects" &&
    search.trim() === "" &&
    totalViewsFromDocuments === 0 &&
    totalDownloadsFromDocuments === 0;

  const totalViews = canUseGlobalSummary
    ? Number(accessSummary?.total_views || 0)
    : totalViewsFromDocuments;

  const totalDownloads = canUseGlobalSummary
    ? Number(accessSummary?.total_downloads || 0)
    : totalDownloadsFromDocuments;

  const engagementRate =
    totalViews > 0
      ? Math.round((totalDownloads / totalViews) * 100)
      : 0;

  const topDocuments = useMemo(
    () =>
      [...filteredDocuments]
        .sort(
          (first, second) =>
            second.views +
            second.downloads -
            (first.views + first.downloads)
        )
        .slice(0, 5),
    [filteredDocuments]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const paginatedDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  function exportReport(): void {
    const payload = {
      generated_at: new Date().toISOString(),
      generated_by: getUserName(user),
      date_range: selectedRange.label,
      project,
      search_query: search.trim() || null,
      total_documents: filteredDocuments.length,
      total_views: totalViews,
      total_downloads: totalDownloads,
      engagement_rate_percent: engagementRate,
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
        workflow_status: record.document.status,
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
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          user={user}
          loading={loading}
          onRefresh={loadData}
        />

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] space-y-5 px-5 py-6 lg:px-8">
            <ReportTabs />

            {alert && (
              <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>{alert.message}</span>

                <button
                  type="button"
                  onClick={() => setAlert(null)}
                  aria-label="Close alert"
                  className="text-lg leading-none text-red-500"
                >
                  ×
                </button>
              </div>
            )}

            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Document Usage Analytics
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Review document views, downloads, projects and recent access
                  activity from your database.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <CalendarDays
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={dateRange}
                    onChange={(event) => {
                      setDateRange(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-9 pr-9 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  >
                    {dateOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <FolderOpen
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={project}
                    onChange={(event) => {
                      setProject(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-10 max-w-[220px] appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-9 pr-9 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  >
                    {projectOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={exportReport}
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download size={16} />
                  Export data
                </button>
              </div>
            </section>

            {loading ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center shadow-sm shadow-slate-200/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Loader2 size={23} className="animate-spin" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Loading usage report
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Retrieving document access information...
                </p>
              </div>
            ) : (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="Total Views"
                    value={totalViews}
                    helper="Document open and access count"
                    icon={Eye}
                  />

                  <MetricCard
                    title="Total Downloads"
                    value={totalDownloads}
                    helper="Downloaded document count"
                    icon={Download}
                  />

                  <MetricCard
                    title="Matching Documents"
                    value={filteredDocuments.length}
                    helper={`${formatNumber(documents.length)} records loaded`}
                    icon={FileText}
                  />

                  <MetricCard
                    title="Download Rate"
                    value={engagementRate}
                    helper="Downloads for every 100 views"
                    icon={TrendingUp}
                  />
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Usage Activity
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Views and downloads for the selected period
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          Views
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Downloads
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={usageSeries}
                          margin={{
                            top: 10,
                            right: 8,
                            left: -22,
                            bottom: 0,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="usageViewsGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#2563eb"
                                stopOpacity={0.18}
                              />

                              <stop
                                offset="100%"
                                stopColor="#2563eb"
                                stopOpacity={0}
                              />
                            </linearGradient>

                            <linearGradient
                              id="usageDownloadsGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity={0.16}
                              />

                              <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            vertical={false}
                            stroke="#e2e8f0"
                            strokeDasharray="4 4"
                          />

                          <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#94a3b8",
                              fontSize: 10,
                            }}
                            dy={8}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                            tick={{
                              fill: "#94a3b8",
                              fontSize: 10,
                            }}
                          />

                          <Tooltip content={<ChartTooltip />} />

                          <Area
                            type="monotone"
                            dataKey="views"
                            stroke="#2563eb"
                            strokeWidth={2.5}
                            fill="url(#usageViewsGradient)"
                            activeDot={{ r: 4 }}
                          />

                          <Area
                            type="monotone"
                            dataKey="downloads"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fill="url(#usageDownloadsGradient)"
                            activeDot={{ r: 4 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Most Accessed Documents
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Top records by combined views and downloads
                      </p>
                    </div>

                    <div className="mt-5 space-y-3">
                      {topDocuments.length > 0 ? (
                        topDocuments.map((record, index) => {
                          const score =
                            record.views + record.downloads;

                          return (
                            <div
                              key={record.id}
                              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                {index + 1}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate text-xs font-semibold text-slate-700"
                                  title={record.name}
                                >
                                  {record.name}
                                </p>

                                <p className="mt-1 truncate text-[10px] text-slate-400">
                                  {record.projectName}
                                </p>
                              </div>

                              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                {score}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex min-h-[230px] flex-col items-center justify-center text-center">
                          <Eye size={26} className="text-slate-300" />

                          <p className="mt-3 text-sm font-semibold text-slate-600">
                            No access activity
                          </p>

                          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                            Viewed or downloaded documents will appear here.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                  <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Document Usage Details
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatNumber(filteredDocuments.length)} matching
                        documents in this report
                      </p>
                    </div>

                    <div className="relative w-full lg:max-w-sm">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Search documents..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[960px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Document
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Project
                          </th>

                          <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Views
                          </th>

                          <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Downloads
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Last Accessed
                          </th>

                          <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedDocuments.length > 0 ? (
                          paginatedDocuments.map((record) => (
                            <tr
                              key={record.id}
                              className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                  <FileVisual kind={record.icon} />

                                  <div className="min-w-0">
                                    <p
                                      className="max-w-[320px] truncate text-sm font-semibold text-slate-800"
                                      title={record.name}
                                    >
                                      {record.name}
                                    </p>

                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                      {record.format} · {record.size} ·{" "}
                                      {record.type}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex max-w-[190px] items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                  <FolderOpen size={12} />
                                  <span className="truncate">
                                    {record.projectName}
                                  </span>
                                </span>
                              </td>

                              <td className="px-5 py-4 text-center text-sm font-bold text-slate-800">
                                {formatNumber(record.views)}
                              </td>

                              <td className="px-5 py-4 text-center text-sm font-bold text-slate-800">
                                {formatNumber(record.downloads)}
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-xs font-medium text-slate-600">
                                  {record.lastAccessed}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  {formatRelativeTime(
                                    record.lastAccessedRaw
                                  )}
                                </p>
                              </td>

                              <td className="px-5 py-4 text-right">
                                <Link
                                  to={`/alldocuments?document=${record.id}`}
                                  state={{
                                    selectedDocumentId: record.id,
                                  }}
                                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                >
                                  <Eye size={14} />
                                  Open
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-5 py-14 text-center"
                            >
                              <Search
                                size={28}
                                className="mx-auto text-slate-300"
                              />

                              <p className="mt-3 text-sm font-semibold text-slate-600">
                                No usage record found
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Change the project, date range or search text.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 gap-4 bg-slate-50/60 p-4 sm:grid-cols-2 lg:hidden">
                    {paginatedDocuments.length > 0 ? (
                      paginatedDocuments.map((record) => (
                        <article
                          key={record.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <FileVisual kind={record.icon} />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {record.name}
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                {record.projectName}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
                            <div>
                              <p className="text-[10px] text-slate-400">
                                Views
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {formatNumber(record.views)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] text-slate-400">
                                Downloads
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {formatNumber(record.downloads)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] text-slate-400">
                                Format
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {record.format}
                              </p>
                            </div>
                          </div>

                          <Link
                            to={`/alldocuments?document=${record.id}`}
                            state={{
                              selectedDocumentId: record.id,
                            }}
                            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            <Eye size={15} />
                            Open document
                          </Link>
                        </article>
                      ))
                    ) : (
                      <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                        <Search
                          size={26}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                          No usage record found
                        </p>
                      </div>
                    )}
                  </div>

                  {filteredDocuments.length > 0 && (
                    <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                          {startIndex + 1}–
                          {Math.min(
                            startIndex + paginatedDocuments.length,
                            filteredDocuments.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                          {filteredDocuments.length}
                        </span>{" "}
                        documents
                      </p>

                      <Pagination
                        currentPage={safeCurrentPage}
                        totalPages={totalPages}
                        onChange={setCurrentPage}
                      />
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}