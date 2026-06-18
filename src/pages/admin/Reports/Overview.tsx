import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Database,
  Download,
  FileText,
  FolderOpen,
  GitBranch,
  Loader2,
  LockKeyhole,
  Radar,
  RefreshCcw,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
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

type DateRange = "7" | "30" | "90" | "365";

type AiSummary = {
  total_documents?: number;
  ready_for_ai?: number;
  analyzed_documents?: number;
  not_analyzed_documents?: number;
  pending_ai_documents?: number;
  failed_ai_documents?: number;
};

type EncryptionSummary = {
  total_documents?: number;
  clean_active_documents?: number;
  encrypted_documents?: number;
  not_encrypted_documents?: number;
  failed_encryption_documents?: number;
};

type SandboxSummary = {
  total_documents?: number;
  clean_active_documents?: number;
  not_tested_documents?: number;
  pending_documents?: number;
  safe_documents?: number;
  unsafe_documents?: number;
  failed_documents?: number;
};

type PlaintextSummary = {
  total_documents?: number;
  clean_documents?: number;
  extracted_documents?: number;
  not_extracted_documents?: number;
  failed_documents?: number;
};

type DashboardData = {
  user: UserSummary | null;
  documents: DmsDocument[];
  projects: ProjectSummary[];
  aiSummary: AiSummary | null;
  encryptionSummary: EncryptionSummary | null;
  sandboxSummary: SandboxSummary | null;
  plaintextSummary: PlaintextSummary | null;
};

type ActivityChartRow = {
  name: string;
  uploads: number;
  updates: number;
};

type DocumentTypeRow = {
  name: string;
  count: number;
  percentage: number;
};

type ReportShortcut = {
  title: string;
  description: string;
  path: string;
  icon: ElementType;
  value: string;
};

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
  // {
  //   label: "Versioning",
  //   path: "/reports/versioningrep",
  //   icon: GitBranch,
  // },
  // {
  //   label: "Access & Permissions",
  //   path: "/reports/accessreport",
  //   icon: ShieldCheck,
  // },
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

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
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

function getDocumentType(document: DmsDocument): string {
  if (document.document_type) {
    return getReadableStatus(document.document_type);
  }

  if (document.extension) {
    return document.extension.toUpperCase();
  }

  return "Other";
}

function getStartDate(days: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (days - 1));

  return date;
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

  return parsed >= getStartDate(days);
}

function countInWindow(
  documents: DmsDocument[],
  field: "created_at" | "updated_at",
  days: number
): number {
  return documents.filter((document) =>
    isWithinRange(document[field], days)
  ).length;
}

function countPreviousWindow(
  documents: DmsDocument[],
  field: "created_at" | "updated_at",
  days: number
): number {
  const currentStart = getStartDate(days);
  const previousStart = getDateDaysAgo(days * 2 - 1);

  return documents.filter((document) => {
    const value = document[field];

    if (!value) return false;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return false;

    return date >= previousStart && date < currentStart;
  }).length;
}

function getTrend(current: number, previous: number): number {
  if (previous <= 0 && current > 0) return 100;
  if (previous <= 0) return 0;

  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function isClean(document: DmsDocument): boolean {
  return ["clean", "passed"].includes(toLower(document.scan_status));
}

function isSandboxSafe(document: DmsDocument): boolean {
  return toLower(document.sandbox_status) === "safe";
}

function isEncrypted(document: DmsDocument): boolean {
  return toLower(document.encryption_status) === "encrypted";
}

function isPlaintextReady(document: DmsDocument): boolean {
  return toLower(document.plaintext_status) === "extracted";
}

function isAiAnalyzed(document: DmsDocument): boolean {
  return toLower(document.ai_status) === "analyzed";
}

function isBlocked(document: DmsDocument): boolean {
  return (
    ["infected", "rejected", "blocked"].includes(toLower(document.status)) ||
    ["infected", "failed"].includes(toLower(document.scan_status)) ||
    ["unsafe", "failed"].includes(toLower(document.sandbox_status))
  );
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildActivityChartData(
  documents: DmsDocument[],
  rangeDays: number
): ActivityChartRow[] {
  const interval =
    rangeDays <= 7 ? 1 : rangeDays <= 30 ? 5 : rangeDays <= 90 ? 15 : 60;

  const rows: ActivityChartRow[] = [];

  for (let offset = rangeDays - 1; offset >= 0; offset -= interval) {
    const start = getDateDaysAgo(offset);
    const end = new Date(start);
    end.setDate(start.getDate() + interval - 1);
    end.setHours(23, 59, 59, 999);

    const uploads = documents.filter((document) => {
      if (!document.created_at) return false;

      const createdAt = new Date(document.created_at);

      return createdAt >= start && createdAt <= end;
    }).length;

    const updates = documents.filter((document) => {
      if (!document.updated_at) return false;

      const updatedAt = new Date(document.updated_at);

      return updatedAt >= start && updatedAt <= end;
    }).length;

    rows.push({
      name: start.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      }),
      uploads,
      updates,
    });
  }

  return rows.length > 0
    ? rows
    : [{ name: "Today", uploads: 0, updates: 0 }];
}

function buildDocumentTypeRows(
  documents: DmsDocument[]
): DocumentTypeRow[] {
  const counts = new Map<string, number>();

  documents.forEach((document) => {
    const type = getDocumentType(document);
    counts.set(type, (counts.get(type) || 0) + 1);
  });

  const total = documents.length || 1;

  return Array.from(counts.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    }));
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
          <span className="text-slate-700">Overview</span>
        </div>

        <h1 className="mt-1 text-lg font-bold text-slate-900">
          Reports & Analytics
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
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: ElementType;
  trend?: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <div className="mt-2 flex items-center gap-2">
            {trend !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-bold",
                  trend >= 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {trend >= 0 ? (
                  <ArrowUpRight size={13} />
                ) : (
                  <ArrowDownRight size={13} />
                )}

                {trend >= 0 ? "+" : ""}
                {trend}%
              </span>
            )}

            <span className="text-[11px] text-slate-400">
              {description}
            </span>
          </div>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function WorkflowMetric({
  title,
  value,
  total,
  icon,
}: {
  title: string;
  value: number;
  total: number;
  icon: ReactNode;
}) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-blue-600">{icon}</span>

          <span className="truncate text-xs font-semibold text-slate-600">
            {title}
          </span>
        </div>

        <span className="text-xs font-bold text-slate-900">
          {value}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-[10px] text-slate-400">
        {percentage}% of documents
      </p>
    </div>
  );
}

function ReportShortcutCard({
  shortcut,
}: {
  shortcut: ReportShortcut;
}) {
  const Icon = shortcut.icon;

  return (
    <Link
      to={shortcut.path}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-blue-200 hover:bg-blue-50/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {shortcut.title}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {shortcut.description}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-slate-900">
          {shortcut.value}
        </p>

        <ChevronRight
          size={14}
          className="ml-auto mt-1 text-slate-300 transition group-hover:text-blue-600"
        />
      </div>
    </Link>
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
    color?: string;
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
            className="flex items-center justify-between gap-5 text-xs"
          >
            <span className="text-slate-500">
              {item.name === "updates" ? "Updates" : "Uploads"}
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

export default function ReportsOverview() {
  const [data, setData] = useState<DashboardData>({
    user: null,
    documents: [],
    projects: [],
    aiSummary: null,
    encryptionSummary: null,
    sandboxSummary: null,
    plaintextSummary: null,
  });

  const [rangeDays, setRangeDays] = useState<DateRange>("30");
  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const selectedRangeDays = Number(rangeDays);

  async function loadDashboard(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const [
        user,
        documents,
        projects,
        aiSummary,
        encryptionSummary,
        sandboxSummary,
        plaintextSummary,
      ] = await Promise.all([
        safeRequest(() => getCurrentUser(), null),
        safeRequest(() => getDocuments({}), []),
        safeRequest(() => getProjects({}), []),
        safeRequest(
          async () =>
            unwrapData<AiSummary>(
              await apiRequest("/document-ai/summary", {
                method: "GET",
              }),
              {}
            ),
          null
        ),
        safeRequest(
          async () =>
            unwrapData<EncryptionSummary>(
              await apiRequest("/document-encryption/summary", {
                method: "GET",
              }),
              {}
            ),
          null
        ),
        safeRequest(
          async () =>
            unwrapData<SandboxSummary>(
              await apiRequest("/document-sandbox/summary", {
                method: "GET",
              }),
              {}
            ),
          null
        ),
        safeRequest(
          async () =>
            unwrapData<PlaintextSummary>(
              await apiRequest("/document-plaintext/summary", {
                method: "GET",
              }),
              {}
            ),
          null
        ),
      ]);

      setData({
        user,
        documents: Array.isArray(documents) ? documents : [],
        projects: Array.isArray(projects) ? projects : [],
        aiSummary,
        encryptionSummary,
        sandboxSummary,
        plaintextSummary,
      });
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load report information.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const uploadedCurrent = countInWindow(
    data.documents,
    "created_at",
    selectedRangeDays
  );

  const uploadedPrevious = countPreviousWindow(
    data.documents,
    "created_at",
    selectedRangeDays
  );

  const updatedCurrent = countInWindow(
    data.documents,
    "updated_at",
    selectedRangeDays
  );

  const updatedPrevious = countPreviousWindow(
    data.documents,
    "updated_at",
    selectedRangeDays
  );

  const uploadTrend = getTrend(uploadedCurrent, uploadedPrevious);
  const updateTrend = getTrend(updatedCurrent, updatedPrevious);

  const activeProjects = data.projects.filter(
    (project) => toLower(project.status) === "active"
  ).length;

  const totalStorageBytes = data.documents.reduce(
    (total, document) => total + Number(document.file_size || 0),
    0
  );

  const cleanDocuments = data.documents.filter(isClean).length;

  const sandboxSafeDocuments =
    data.sandboxSummary?.safe_documents ??
    data.documents.filter(isSandboxSafe).length;

  const encryptedDocuments =
    data.encryptionSummary?.encrypted_documents ??
    data.documents.filter(isEncrypted).length;

  const plaintextReadyDocuments =
    data.plaintextSummary?.extracted_documents ??
    data.documents.filter(isPlaintextReady).length;

  const aiAnalyzedDocuments =
    data.aiSummary?.analyzed_documents ??
    data.documents.filter(isAiAnalyzed).length;

  const blockedDocuments = data.documents.filter(isBlocked).length;

  const activityData = useMemo(
    () => buildActivityChartData(data.documents, selectedRangeDays),
    [data.documents, selectedRangeDays]
  );

  const documentTypeRows = useMemo(
    () => buildDocumentTypeRows(data.documents),
    [data.documents]
  );

  const reportShortcuts = useMemo<ReportShortcut[]>(
    () => [
      {
        title: "Document Usage",
        description: "Document totals and usage",
        path: "/reports/docreport",
        icon: FileText,
        value: formatNumber(data.documents.length),
      },
      {
        title: "Upload Activity",
        description: `Uploads in ${selectedRangeDays} days`,
        path: "/reports/uploadrep",
        icon: UploadCloud,
        value: formatNumber(uploadedCurrent),
      },
      {
        title: "Project Report",
        description: "Active project workspaces",
        path: "/reports/depreport",
        icon: FolderOpen,
        value: formatNumber(activeProjects),
      },
      {
        title: "Access & Security",
        description: "Blocked or unsafe records",
        path: "/reports/accessreport",
        icon: ShieldAlert,
        value: formatNumber(blockedDocuments),
      },
    ],
    [
      activeProjects,
      blockedDocuments,
      data.documents.length,
      selectedRangeDays,
      uploadedCurrent,
    ]
  );

  function exportSummary(): void {
    const summary = {
      generated_at: new Date().toISOString(),
      selected_range_days: selectedRangeDays,
      total_documents: data.documents.length,
      uploads_in_range: uploadedCurrent,
      updates_in_range: updatedCurrent,
      total_projects: data.projects.length,
      active_projects: activeProjects,
      storage_used_bytes: totalStorageBytes,
      storage_used_readable: formatBytes(totalStorageBytes),
      clean_documents: cleanDocuments,
      sandbox_safe_documents: sandboxSafeDocuments,
      encrypted_documents: encryptedDocuments,
      plaintext_ready_documents: plaintextReadyDocuments,
      ai_analyzed_documents: aiAnalyzedDocuments,
      blocked_documents: blockedDocuments,
      document_types: documentTypeRows,
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `dms-report-summary-${getLocalDateKey(new Date())}.json`;

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
          user={data.user}
          loading={loading}
          onRefresh={loadDashboard}
        />

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] space-y-5 px-5 py-6 lg:px-8">
            <ReportTabs />

            {alert && (
              <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{alert.message}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setAlert(null)}
                  className="text-lg leading-none text-red-500"
                  aria-label="Close alert"
                >
                  ×
                </button>
              </div>
            )}

            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Reporting Overview
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Real-time insights from your documents, projects and security
                  workflow.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={rangeDays}
                  onChange={(event) =>
                    setRangeDays(event.target.value as DateRange)
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last 12 months</option>
                </select>

                <button
                  type="button"
                  onClick={exportSummary}
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
                  Loading report data
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Retrieving current database information...
                </p>
              </div>
            ) : (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="Total Documents"
                    value={formatNumber(data.documents.length)}
                    description="registered records"
                    icon={FileText}
                  />

                  <MetricCard
                    title="Uploads"
                    value={formatNumber(uploadedCurrent)}
                    description={`vs previous ${selectedRangeDays} days`}
                    icon={UploadCloud}
                    trend={uploadTrend}
                  />

                  <MetricCard
                    title="Document Updates"
                    value={formatNumber(updatedCurrent)}
                    description={`vs previous ${selectedRangeDays} days`}
                    icon={RefreshCcw}
                    trend={updateTrend}
                  />

                  <MetricCard
                    title="Storage Used"
                    value={formatBytes(totalStorageBytes)}
                    description="real uploaded file size"
                    icon={Database}
                  />
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Document Activity
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Upload and update activity for the selected period
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          Updates
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-violet-500" />
                          Uploads
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={activityData}
                          margin={{
                            top: 10,
                            right: 8,
                            left: -22,
                            bottom: 0,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="reportsUpdatesGradient"
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
                              id="reportsUploadsGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#8b5cf6"
                                stopOpacity={0.16}
                              />

                              <stop
                                offset="100%"
                                stopColor="#8b5cf6"
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
                            dataKey="name"
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
                            dataKey="updates"
                            stroke="#2563eb"
                            strokeWidth={2.5}
                            fill="url(#reportsUpdatesGradient)"
                            activeDot={{ r: 4 }}
                          />

                          <Area
                            type="monotone"
                            dataKey="uploads"
                            stroke="#8b5cf6"
                            strokeWidth={2.5}
                            fill="url(#reportsUploadsGradient)"
                            activeDot={{ r: 4 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Document Types
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Most common file classifications
                      </p>
                    </div>

                    <div className="mt-6 space-y-5">
                      {documentTypeRows.length > 0 ? (
                        documentTypeRows.map((row) => (
                          <div key={row.name}>
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="truncate text-xs font-semibold text-slate-600">
                                {row.name}
                              </span>

                              <span className="shrink-0 text-[11px] font-bold text-slate-900">
                                {row.count}
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{
                                  width: `${row.percentage}%`,
                                }}
                              />
                            </div>

                            <p className="mt-1 text-right text-[10px] text-slate-400">
                              {row.percentage}%
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="flex min-h-[230px] flex-col items-center justify-center text-center">
                          <FileText
                            size={26}
                            className="text-slate-300"
                          />

                          <p className="mt-3 text-sm font-semibold text-slate-600">
                            No document type data
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Uploaded files will appear here.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Document Workflow Health
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        One compact view of document processing readiness
                      </p>
                    </div>

                    {blockedDocuments > 0 && (
                      <span className="inline-flex self-start items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-700">
                        <ShieldAlert size={13} />
                        {blockedDocuments} needs review
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <WorkflowMetric
                      title="Clean Scan"
                      value={cleanDocuments}
                      total={data.documents.length}
                      icon={<ShieldCheck size={15} />}
                    />

                    <WorkflowMetric
                      title="Sandbox Safe"
                      value={sandboxSafeDocuments}
                      total={data.documents.length}
                      icon={<Radar size={15} />}
                    />

                    <WorkflowMetric
                      title="Encrypted"
                      value={encryptedDocuments}
                      total={data.documents.length}
                      icon={<LockKeyhole size={15} />}
                    />

                    <WorkflowMetric
                      title="Text Ready"
                      value={plaintextReadyDocuments}
                      total={data.documents.length}
                      icon={<ScanSearch size={15} />}
                    />

                    <WorkflowMetric
                      title="AI Analyzed"
                      value={aiAnalyzedDocuments}
                      total={data.documents.length}
                      icon={<BrainCircuit size={15} />}
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Open Detailed Reports
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Continue to a focused report without repeating dashboard
                      information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {reportShortcuts.map((shortcut) => (
                      <ReportShortcutCard
                        key={shortcut.path}
                        shortcut={shortcut}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}