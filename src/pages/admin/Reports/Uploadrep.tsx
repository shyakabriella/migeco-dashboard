import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  GitBranch,
  Loader2,
  Monitor,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminSidebar from "../AdminSidebar";

import {
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

type DateRangeOption = {
  label: string;
  value: string;
  days: number;
};

type UploadTrendPoint = {
  label: string;
  uploads: number;
};

type ContributorPoint = {
  name: string;
  uploads: number;
};

type IngestionStatusTone = "success" | "warning" | "danger" | "info";

type IngestionRow = {
  id: number | string;
  batchCode: string;
  source: string;
  uploadDate: string;
  uploadTime: string;
  status: string;
  statusTone: IngestionStatusTone;
  documentName: string;
  projectName: string;
  uploaderName: string;
  createdAt?: string | null;
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

function formatDate(date?: string | null): string {
  if (!date) return "Unknown";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatTime(date?: string | null): string {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(date?: string | null): string {
  if (!date) return "Unknown";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown";

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

function getUserName(user: UserSummary | null): string {
  return user?.name || "DMS User";
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const names = name.trim().split(/\s+/).filter(Boolean);

  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }

  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
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

function getProjectName(document: DmsDocument): string {
  return document.project?.name || "No project";
}

function getUploaderName(document: DmsDocument): string {
  return document.uploader?.name || "Unknown uploader";
}

function getUploadSource(document: DmsDocument): string {
  const rawDocument = document as unknown as Record<string, unknown>;

  const value =
    rawDocument.upload_source ||
    rawDocument.source ||
    rawDocument.input_mode ||
    rawDocument.channel;

  if (typeof value === "string" && value.trim()) {
    return getReadableStatus(value);
  }

  return "Web upload";
}

function isScanClean(document: DmsDocument): boolean {
  return ["clean", "passed"].includes(toLower(document.scan_status));
}

function isSandboxSafe(document: DmsDocument): boolean {
  return toLower(document.sandbox_status) === "safe";
}

function isPlaintextExtracted(document: DmsDocument): boolean {
  return toLower(document.plaintext_status) === "extracted";
}

function isBlocked(document: DmsDocument): boolean {
  return (
    ["infected", "rejected", "blocked"].includes(
      toLower(document.status)
    ) ||
    ["infected", "failed"].includes(toLower(document.scan_status)) ||
    ["unsafe", "failed"].includes(toLower(document.sandbox_status))
  );
}

function getIngestionStatus(document: DmsDocument): {
  label: string;
  tone: IngestionStatusTone;
} {
  if (isBlocked(document)) {
    return {
      label: "Blocked",
      tone: "danger",
    };
  }

  if (!isScanClean(document)) {
    return {
      label: "Pending scan",
      tone: "warning",
    };
  }

  if (!isSandboxSafe(document)) {
    return {
      label: "Pending sandbox",
      tone: "warning",
    };
  }

  if (!isPlaintextExtracted(document)) {
    return {
      label: "Pending OCR",
      tone: "info",
    };
  }

  return {
    label: "Completed",
    tone: "success",
  };
}

function buildUploadTrendData(
  documents: DmsDocument[],
  days: number
): UploadTrendPoint[] {
  const interval =
    days <= 7 ? 1 : days <= 30 ? 5 : days <= 90 ? 15 : 60;

  const rows: UploadTrendPoint[] = [];

  for (let offset = days - 1; offset >= 0; offset -= interval) {
    const start = getDateDaysAgo(offset);
    const end = new Date(start);
    end.setDate(start.getDate() + interval - 1);
    end.setHours(23, 59, 59, 999);

    const uploads = documents.filter((document) => {
      if (!document.created_at) return false;

      const createdAt = new Date(document.created_at);

      if (Number.isNaN(createdAt.getTime())) return false;

      return createdAt >= start && createdAt <= end;
    }).length;

    rows.push({
      label: start.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      }),
      uploads,
    });
  }

  return rows.length > 0
    ? rows
    : [{ label: "Today", uploads: 0 }];
}

function buildContributorData(
  documents: DmsDocument[]
): ContributorPoint[] {
  const contributors = new Map<string, number>();

  documents.forEach((document) => {
    const uploaderName = getUploaderName(document);

    contributors.set(
      uploaderName,
      (contributors.get(uploaderName) || 0) + 1
    );
  });

  return Array.from(contributors.entries())
    .map(([name, uploads]) => ({
      name,
      uploads,
    }))
    .sort((first, second) => second.uploads - first.uploads)
    .slice(0, 6);
}

function buildIngestionRows(
  documents: DmsDocument[]
): IngestionRow[] {
  return [...documents]
    .sort((first, second) => {
      const firstDate = new Date(
        first.created_at || first.updated_at || 0
      ).getTime();

      const secondDate = new Date(
        second.created_at || second.updated_at || 0
      ).getTime();

      return secondDate - firstDate;
    })
    .map((document) => {
      const status = getIngestionStatus(document);
      const createdAt = document.created_at || document.updated_at;

      return {
        id: document.id,
        batchCode: `DOC-${document.id}`,
        source: getUploadSource(document),
        uploadDate: formatDate(createdAt),
        uploadTime: formatTime(createdAt),
        status: status.label,
        statusTone: status.tone,
        documentName: getDocumentTitle(document),
        projectName: getProjectName(document),
        uploaderName: getUploaderName(document),
        createdAt,
      };
    });
}

function exportJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
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
          <span className="text-slate-700">Upload Activity</span>
        </div>

        <h1 className="mt-1 text-lg font-bold text-slate-900">
          Upload & Activity Report
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

function StatusBadge({
  status,
  tone,
}: {
  status: string;
  tone: IngestionStatusTone;
}) {
  const toneClass = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  }[tone];

  const dotClass = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[10px] font-bold",
        toneClass
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      {status}
    </span>
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
      <p className="mb-1 text-xs font-bold text-slate-700">{label}</p>

      <p className="text-xs text-slate-500">
        Uploads:{" "}
        <span className="font-bold text-slate-900">
          {payload[0]?.value ?? 0}
        </span>
      </p>
    </div>
  );
}

function ContributorTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-bold text-slate-700">{label}</p>

      <p className="mt-1 text-xs text-slate-500">
        Uploads:{" "}
        <span className="font-bold text-slate-900">
          {payload[0]?.value ?? 0}
        </span>
      </p>
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
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={15} />
      </button>

      <span className="min-w-[78px] text-center text-xs font-semibold text-slate-600">
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

export default function Uploadrep() {
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [user, setUser] = useState<UserSummary | null>(null);

  const [dateRange, setDateRange] = useState<string>("30");
  const [project, setProject] = useState<string>("All Projects");
  const [search, setSearch] = useState<string>("");

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

      const [userData, documentsData, projectsData] = await Promise.all([
        getCurrentUser().catch(() => null),
        getDocuments({}).catch(() => []),
        getProjects({}).catch(() => []),
      ]);

      setUser(userData);
      setDocuments(
        Array.isArray(documentsData) ? documentsData : []
      );
      setProjects(
        Array.isArray(projectsData) ? projectsData : []
      );
      setCurrentPage(1);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load the upload activity report.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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
    const searchTerm = search.trim().toLowerCase();

    return documents.filter((document) => {
      const dateValue = document.created_at || document.updated_at;

      const matchesDate = isWithinRange(
        dateValue,
        selectedRange.days
      );

      const matchesProject =
        project === "All Projects" ||
        getProjectName(document) === project;

      const searchableText = [
        getDocumentTitle(document),
        getProjectName(document),
        getUploaderName(document),
        getUploadSource(document),
        document.document_code,
        document.status,
        document.scan_status,
        document.sandbox_status,
        document.plaintext_status,
        document.encryption_status,
        document.ai_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchTerm.length === 0 ||
        searchableText.includes(searchTerm);

      return matchesDate && matchesProject && matchesSearch;
    });
  }, [documents, project, search, selectedRange.days]);

  const uploadTrend = useMemo(
    () => buildUploadTrendData(filteredDocuments, selectedRange.days),
    [filteredDocuments, selectedRange.days]
  );

  const contributors = useMemo(
    () => buildContributorData(filteredDocuments),
    [filteredDocuments]
  );

  const ingestionRows = useMemo(
    () => buildIngestionRows(filteredDocuments),
    [filteredDocuments]
  );

  const totalUploads = filteredDocuments.length;

  const completedUploads = filteredDocuments.filter(
    (document) => getIngestionStatus(document).tone === "success"
  ).length;

  const pendingUploads = filteredDocuments.filter(
    (document) =>
      ["warning", "info"].includes(getIngestionStatus(document).tone)
  ).length;

  const blockedUploads = filteredDocuments.filter(isBlocked).length;

  const totalPages = Math.max(
    1,
    Math.ceil(ingestionRows.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const paginatedRows = ingestionRows.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  function exportReport(): void {
    exportJson(
      `upload-activity-report-${new Date()
        .toISOString()
        .slice(0, 10)}.json`,
      {
        generated_at: new Date().toISOString(),
        generated_by: getUserName(user),
        date_range: selectedRange.label,
        project,
        search_query: search.trim() || null,
        total_uploads: totalUploads,
        completed_uploads: completedUploads,
        pending_uploads: pendingUploads,
        blocked_uploads: blockedUploads,
        contributors,
        upload_activity: uploadTrend,
        ingestions: ingestionRows,
      }
    );
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
                  Upload Activity Analytics
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Track document uploads, contributors and processing status
                  from your real database records.
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
                  Loading upload report
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Retrieving document upload activity...
                </p>
              </div>
            ) : (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="Uploads in Range"
                    value={totalUploads}
                    helper={`${formatNumber(documents.length)} records loaded`}
                    icon={UploadCloud}
                  />

                  <MetricCard
                    title="Completed Pipeline"
                    value={completedUploads}
                    helper="Scan, sandbox and OCR completed"
                    icon={CheckCircle2}
                  />

                  <MetricCard
                    title="Pending Processing"
                    value={pendingUploads}
                    helper="Waiting for a workflow step"
                    icon={FileText}
                  />

                  <MetricCard
                    title="Blocked Uploads"
                    value={blockedUploads}
                    helper="Rejected, infected or unsafe"
                    icon={ShieldAlert}
                  />
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Upload Volume
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Real document uploads for the selected period
                        </p>
                      </div>

                      <span className="inline-flex self-start items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        {totalUploads} uploads
                      </span>
                    </div>

                    <div className="mt-5 h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={uploadTrend}
                          margin={{
                            top: 10,
                            right: 8,
                            left: -22,
                            bottom: 0,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="uploadActivityGradient"
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
                            dataKey="uploads"
                            stroke="#2563eb"
                            strokeWidth={2.5}
                            fill="url(#uploadActivityGradient)"
                            activeDot={{ r: 4 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Top Contributors
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Users with the most uploads
                      </p>
                    </div>

                    {contributors.length > 0 ? (
                      <div className="mt-5 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={contributors}
                            margin={{
                              top: 20,
                              right: 4,
                              left: 4,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid
                              vertical={false}
                              stroke="#e2e8f0"
                              strokeDasharray="4 4"
                            />

                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              interval={0}
                              tick={{
                                fill: "#94a3b8",
                                fontSize: 9,
                              }}
                              tickFormatter={(value: string) =>
                                value.length > 10
                                  ? `${value.slice(0, 10)}…`
                                  : value
                              }
                            />

                            <YAxis hide allowDecimals={false} />

                            <Tooltip content={<ContributorTooltip />} />

                            <Bar
                              dataKey="uploads"
                              fill="#2563eb"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={38}
                            >
                              <LabelList
                                dataKey="uploads"
                                position="top"
                                fill="#334155"
                                fontSize={10}
                                fontWeight={700}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                        <UserRound
                          size={27}
                          className="text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                          No contributor data
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Upload activity will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                  <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          Recent Ingestions
                        </h3>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          Live
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Latest documents and their processing status
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
                        placeholder="Search uploads..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[980px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Document
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Source
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Uploaded By
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Upload Time
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Status
                          </th>

                          <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedRows.length > 0 ? (
                          paginatedRows.map((row) => (
                            <tr
                              key={String(row.id)}
                              className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <FileText size={18} />
                                  </div>

                                  <div className="min-w-0">
                                    <p
                                      className="max-w-[300px] truncate text-sm font-semibold text-slate-800"
                                      title={row.documentName}
                                    >
                                      {row.documentName}
                                    </p>

                                    <p className="mt-1 truncate text-[11px] text-slate-400">
                                      {row.batchCode} · {row.projectName}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                  <Monitor size={13} />
                                  {row.source}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="text-xs font-medium text-slate-600">
                                  {row.uploaderName}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-xs font-medium text-slate-600">
                                  {row.uploadDate}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  {row.uploadTime || formatRelativeTime(row.createdAt)}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <StatusBadge
                                  status={row.status}
                                  tone={row.statusTone}
                                />
                              </td>

                              <td className="px-5 py-4 text-right">
                                <Link
                                  to={`/alldocuments?document=${row.id}`}
                                  state={{
                                    selectedDocumentId: row.id,
                                  }}
                                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                >
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
                                No uploads found
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Change the date range, project or search text.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 gap-4 bg-slate-50/60 p-4 sm:grid-cols-2 lg:hidden">
                    {paginatedRows.length > 0 ? (
                      paginatedRows.map((row) => (
                        <article
                          key={String(row.id)}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <FileText size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {row.documentName}
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                {row.projectName}
                              </p>
                            </div>

                            <StatusBadge
                              status={row.status}
                              tone={row.statusTone}
                            />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                            <div>
                              <p className="text-[10px] text-slate-400">
                                Source
                              </p>

                              <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                                {row.source}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] text-slate-400">
                                Uploader
                              </p>

                              <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                                {row.uploaderName}
                              </p>
                            </div>
                          </div>

                          <Link
                            to={`/alldocuments?document=${row.id}`}
                            state={{
                              selectedDocumentId: row.id,
                            }}
                            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
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
                          No uploads found
                        </p>
                      </div>
                    )}
                  </div>

                  {ingestionRows.length > 0 && (
                    <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                          {startIndex + 1}–
                          {Math.min(
                            startIndex + paginatedRows.length,
                            ingestionRows.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                          {ingestionRows.length}
                        </span>{" "}
                        uploads
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