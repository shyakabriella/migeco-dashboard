import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Eye,
  FolderOpen,
  Database,
  Download,
  Calendar,
  FilePlus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronRight,
  FileText,
  UploadCloud,
  UsersRound,
  GitBranch,
  ShieldCheck,
  Loader2,
  RefreshCcw,
  AlertTriangle,
  LockKeyhole,
  BrainCircuit,
  Radar,
  ScanSearch,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  restricted_suggested?: number;
  confidential_suggested?: number;
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

type ReportRow = {
  name: string;
  type: string;
  typeColor: string;
  date: string;
  user: string;
  userInitials: string;
  userColor: string;
  fileType: string;
  fileIconColor: string;
  description: string;
};

type ActivityChartRow = {
  name: string;
  uploads: number;
  updated: number;
};

type DocumentTypeRow = {
  name: string;
  count: number;
  percent: number;
  color: string;
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

const reportTabs = [
  {
    label: "Overview",
    path: "/reports",
    icon: BarChart3,
  },
  {
    label: "Document Usage Report",
    path: "/reports/docreport",
    icon: FileText,
  },
  {
    label: "Upload & Activity Report",
    path: "/reports/uploadrep",
    icon: UploadCloud,
  },
  {
    label: "Department/Project Reports",
    path: "/reports/depreport",
    icon: UsersRound,
  },
  {
    label: "Versioning Report",
    path: "/reports/versioningrep",
    icon: GitBranch,
  },
  {
    label: "Access/Permission Report",
    path: "/reports/accessreport",
    icon: ShieldCheck,
  },
];

const typeColors = [
  "bg-emerald-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-blue-500",
  "bg-yellow-500",
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
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size = size / 1024;
    index += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[index]}`;
}

function formatDate(date?: string | null): string {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  if (typeof role === "string") {
    return getReadableStatus(role);
  }

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
  if (document.document_type) {
    return getReadableStatus(document.document_type);
  }

  if (document.extension) {
    return document.extension.toUpperCase();
  }

  return "Unknown Type";
}

function getProjectName(document: DmsDocument): string {
  return document.project?.name || "No Project";
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

function getTrend(current: number, previous: number): number {
  if (previous <= 0 && current > 0) return 100;
  if (previous <= 0) return 0;

  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function countInWindow(
  documents: DmsDocument[],
  field: "created_at" | "updated_at",
  days: number
): number {
  return documents.filter((document) => isWithinRange(document[field], days)).length;
}

function countPreviousWindow(
  documents: DmsDocument[],
  field: "created_at" | "updated_at",
  days: number
): number {
  const now = new Date();
  const currentStart = getDateDaysAgo(days);
  const previousStart = getDateDaysAgo(days * 2);

  return documents.filter((document) => {
    const value = document[field];

    if (!value) return false;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return false;

    return date >= previousStart && date < currentStart && date <= now;
  }).length;
}

function buildActivityChartData(
  documents: DmsDocument[],
  rangeDays: number
): ActivityChartRow[] {
  const rows: ActivityChartRow[] = [];
  const interval = rangeDays <= 30 ? 5 : rangeDays <= 90 ? 15 : 60;

  for (let day = rangeDays - 1; day >= 0; day -= interval) {
    const start = getDateDaysAgo(day);
    const end = new Date(start);
    end.setDate(start.getDate() + interval);
    end.setHours(23, 59, 59, 999);

    const uploads = documents.filter((document) => {
      if (!document.created_at) return false;

      const createdAt = new Date(document.created_at);

      return createdAt >= start && createdAt <= end;
    }).length;

    const updated = documents.filter((document) => {
      if (!document.updated_at) return false;

      const updatedAt = new Date(document.updated_at);

      return updatedAt >= start && updatedAt <= end;
    }).length;

    rows.push({
      name: formatShortDate(start),
      uploads,
      updated,
    });
  }

  return rows.length > 0 ? rows : [{ name: "Today", uploads: 0, updated: 0 }];
}

function buildDocumentTypeRows(documents: DmsDocument[]): DocumentTypeRow[] {
  const counts = new Map<string, number>();

  documents.forEach((document) => {
    const type = getDocumentType(document);
    counts.set(type, (counts.get(type) || 0) + 1);
  });

  const total = documents.length || 1;

  return Array.from(counts.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, 6)
    .map(([name, count], index) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
      color: typeColors[index % typeColors.length],
    }));
}

function buildRecentReports(
  documents: DmsDocument[],
  projects: ProjectSummary[],
  user: UserSummary | null,
  rangeDays: number
): ReportRow[] {
  const generatedBy = getUserName(user);
  const userInitials = getInitials(generatedBy);
  const now = formatDate(new Date().toISOString());

  const uploadedInRange = countInWindow(documents, "created_at", rangeDays);
  const updatedInRange = countInWindow(documents, "updated_at", rangeDays);
  const activeProjects = projects.filter(
    (project) => toLower(project.status) === "active"
  ).length;

  return [
    {
      name: "Document Usage Report",
      type: "Usage",
      typeColor: "text-blue-400 bg-blue-400/10",
      date: now,
      user: generatedBy,
      userInitials,
      userColor: "bg-indigo-600",
      fileType: `${formatNumber(documents.length)} documents`,
      fileIconColor: "text-blue-400 bg-blue-400/10",
      description: "Generated from current document metadata and workflow status.",
    },
    {
      name: "Upload & Activity Report",
      type: "Activity",
      typeColor: "text-purple-400 bg-purple-400/10",
      date: now,
      user: generatedBy,
      userInitials,
      userColor: "bg-purple-600",
      fileType: `${formatNumber(uploadedInRange)} uploads / ${formatNumber(updatedInRange)} updates`,
      fileIconColor: "text-purple-400 bg-purple-400/10",
      description: `Calculated from documents created or updated in the last ${rangeDays} days.`,
    },
    {
      name: "Department/Project Report",
      type: "Project",
      typeColor: "text-emerald-400 bg-emerald-400/10",
      date: now,
      user: generatedBy,
      userInitials,
      userColor: "bg-emerald-600",
      fileType: `${formatNumber(projects.length)} projects / ${formatNumber(activeProjects)} active`,
      fileIconColor: "text-emerald-400 bg-emerald-400/10",
      description: "Project-based document distribution and active project count.",
    },
    {
      name: "Access & Security Report",
      type: "Security",
      typeColor: "text-orange-400 bg-orange-400/10",
      date: now,
      user: generatedBy,
      userInitials,
      userColor: "bg-orange-600",
      fileType: `${formatNumber(documents.filter(isBlocked).length)} blocked / unsafe`,
      fileIconColor: "text-orange-400 bg-orange-400/10",
      description: "Based on scan, sandbox, encryption, plaintext, and AI readiness statuses.",
    },
  ];
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

type KPICardProps = {
  title: string;
  value: string;
  trend?: number;
  trendValue?: string;
  icon: ElementType;
  iconColor: string;
  iconBg: string;
  subtitle?: string;
};

function KPICard({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  iconColor,
  iconBg,
  subtitle,
}: KPICardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#2d3145] bg-[#1e2130] p-5">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </h3>

        <div className={`flex h-8 w-8 items-center justify-center rounded ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`flex items-center font-medium ${
              trend >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="mr-0.5 h-3 w-3" />
            ) : (
              <ArrowDownRight className="mr-0.5 h-3 w-3" />
            )}
            {trendValue}
          </span>

          <span className="text-gray-500">{subtitle}</span>
        </div>
      )}
    </div>
  );
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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1f2231] bg-[#161824] px-6 text-sm">
      <div className="flex items-center gap-3 font-medium text-gray-400">
        <span className="text-white">Reports</span>
        <ChevronRight className="h-4 w-4" />
        <span className="flex items-center gap-2 text-gray-400">
          <BarChart3 className="h-4 w-4" />
          Overview
        </span>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-[#2d3145] bg-[#1e2130] px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-[#2a2e41] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Refresh
        </button>

        <button className="relative text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#161824]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-white">{getUserName(user)}</div>
            <div className="text-xs text-gray-500">{getRoleName(user)}</div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2d3145] bg-indigo-600/20 text-xs font-semibold text-white">
            {getInitials(getUserName(user))}
          </div>

          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </header>
  );
}

function ReportTabs() {
  return (
    <div className="rounded-2xl border border-[#2d3145] bg-[#1e2130] p-2">
      <div className="flex flex-wrap items-center gap-2">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === "/reports"}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#5d5fef] text-white shadow-lg shadow-[#5d5fef]/20"
                    : "text-gray-400 hover:bg-[#2a2e41] hover:text-white"
                )
              }
            >
              <Icon size={16} />
              {tab.label}
            </NavLink>
          );
        })}
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
        documents,
        projects,
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
            : "Failed to load report dashboard data.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const documentsInRange = useMemo(() => {
    return data.documents.filter((document) =>
      isWithinRange(document.created_at || document.updated_at, selectedRangeDays)
    );
  }, [data.documents, selectedRangeDays]);

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
  const uploadTrend = getTrend(uploadedCurrent, uploadedPrevious);

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
  const updateTrend = getTrend(updatedCurrent, updatedPrevious);

  const activeProjects = data.projects.filter(
    (project) => toLower(project.status) === "active"
  ).length;

  const activeProjectFiles = data.documents.filter(
    (document) =>
      toLower(document.status) === "active" &&
      (document.project_id || document.project?.id)
  ).length;

  const totalStorageBytes = data.documents.reduce(
    (sum, document) => sum + Number(document.file_size || 0),
    0
  );
  const capacityBytes = 5 * 1024 * 1024 * 1024 * 1024;
  const storagePercent = Math.min(
    100,
    Math.round((totalStorageBytes / capacityBytes) * 100)
  );

  const activityData = useMemo(
    () => buildActivityChartData(data.documents, selectedRangeDays),
    [data.documents, selectedRangeDays]
  );

  const documentTypeRows = useMemo(
    () => buildDocumentTypeRows(data.documents),
    [data.documents]
  );

  const recentReports = useMemo(
    () =>
      buildRecentReports(
        data.documents,
        data.projects,
        data.user,
        selectedRangeDays
      ),
    [data.documents, data.projects, data.user, selectedRangeDays]
  );

  const securityReadyDocuments = data.documents.filter(
    (document) => isClean(document) && isSandboxSafe(document) && isEncrypted(document)
  ).length;

  const blockedDocuments = data.documents.filter(isBlocked).length;

  function exportSummary(): void {
    const summary = {
      generated_at: new Date().toISOString(),
      range_days: selectedRangeDays,
      total_documents: data.documents.length,
      documents_in_range: documentsInRange.length,
      uploaded_in_range: uploadedCurrent,
      updated_in_range: updatedCurrent,
      total_projects: data.projects.length,
      active_projects: activeProjects,
      active_project_files: activeProjectFiles,
      storage_used: formatBytes(totalStorageBytes),
      storage_percent: storagePercent,
      clean_documents: data.documents.filter(isClean).length,
      sandbox_safe_documents:
        data.sandboxSummary?.safe_documents ??
        data.documents.filter(isSandboxSafe).length,
      encrypted_documents:
        data.encryptionSummary?.encrypted_documents ??
        data.documents.filter(isEncrypted).length,
      plaintext_ready_documents:
        data.plaintextSummary?.extracted_documents ??
        data.documents.filter(isPlaintextReady).length,
      ai_analyzed_documents:
        data.aiSummary?.analyzed_documents ??
        data.documents.filter(isAiAnalyzed).length,
      blocked_documents: blockedDocuments,
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `dms-report-summary-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f111a] font-sans">
      <AdminSidebar />

      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <Header user={data.user} loading={loading} onRefresh={loadDashboard} />

        <main className="custom-scrollbar flex-1 overflow-y-auto bg-[#0f111a] p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <ReportTabs />

            {alert && (
              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  alert.type === "error"
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                {alert.message}
              </div>
            )}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-white">
                  Reports Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  Real database insights from documents, projects, scan,
                  sandbox, encryption, plaintext, and AI controllers.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={rangeDays}
                  onChange={(event) => setRangeDays(event.target.value as DateRange)}
                  className="rounded-lg border border-[#2d3145] bg-[#1e2130] px-4 py-2 text-sm font-medium text-gray-300 outline-none transition-colors hover:bg-[#2a2e41]"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Last 12 Months</option>
                </select>

                <button
                  type="button"
                  onClick={exportSummary}
                  className="flex items-center gap-2 rounded-lg bg-[#5d5fef] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4b4dc4]"
                >
                  <Download className="h-4 w-4" />
                  Export Summary
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#2d3145] bg-[#1e2130] p-12 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading report data from database...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <KPICard
                    title="DOCUMENTS UPDATED"
                    value={formatNumber(updatedCurrent)}
                    trend={updateTrend}
                    trendValue={`${updateTrend >= 0 ? "+" : ""}${updateTrend}%`}
                    subtitle={`vs previous ${selectedRangeDays} days`}
                    icon={Eye}
                    iconColor="text-blue-500"
                    iconBg="bg-blue-500/10"
                  />

                  <KPICard
                    title="UPLOAD VOLUME"
                    value={formatNumber(uploadedCurrent)}
                    trend={uploadTrend}
                    trendValue={`${uploadTrend >= 0 ? "+" : ""}${uploadTrend}%`}
                    subtitle={`vs previous ${selectedRangeDays} days`}
                    icon={UploadCloud}
                    iconColor="text-purple-500"
                    iconBg="bg-purple-500/10"
                  />

                  <KPICard
                    title="ACTIVE PROJECT FILES"
                    value={formatNumber(activeProjectFiles)}
                    trend={activeProjects > 0 ? 1 : 0}
                    trendValue={`${formatNumber(activeProjects)} active`}
                    subtitle="projects"
                    icon={FolderOpen}
                    iconColor="text-orange-500"
                    iconBg="bg-orange-500/10"
                  />

                  <div className="flex flex-col justify-between rounded-2xl border border-[#2d3145] bg-[#1e2130] p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        STORAGE UTILIZATION
                      </h3>

                      <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/10">
                        <Database className="h-4 w-4 text-emerald-500" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-2xl font-bold text-white">
                        {formatBytes(totalStorageBytes)}
                      </span>
                    </div>

                    <div className="mt-auto">
                      <div className="mb-2 flex h-1.5 w-full overflow-hidden rounded-full bg-[#2d3145]">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${storagePercent}%` }}
                        />
                      </div>

                      <p className="text-xs text-gray-500">
                        {storagePercent}% of 5 TB capacity used
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <SmallMetric
                    title="Clean Scan"
                    value={data.documents.filter(isClean).length}
                    icon={ShieldCheck}
                    tone="emerald"
                  />

                  <SmallMetric
                    title="Sandbox Safe"
                    value={
                      data.sandboxSummary?.safe_documents ??
                      data.documents.filter(isSandboxSafe).length
                    }
                    icon={Radar}
                    tone="orange"
                  />

                  <SmallMetric
                    title="Encrypted"
                    value={
                      data.encryptionSummary?.encrypted_documents ??
                      data.documents.filter(isEncrypted).length
                    }
                    icon={LockKeyhole}
                    tone="emerald"
                  />

                  <SmallMetric
                    title="Text Ready"
                    value={
                      data.plaintextSummary?.extracted_documents ??
                      data.documents.filter(isPlaintextReady).length
                    }
                    icon={ScanSearch}
                    tone="blue"
                  />

                  <SmallMetric
                    title="AI Analyzed"
                    value={
                      data.aiSummary?.analyzed_documents ??
                      data.documents.filter(isAiAnalyzed).length
                    }
                    icon={BrainCircuit}
                    tone="purple"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border border-[#2d3145] bg-[#1e2130] p-5 lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="mb-1 font-semibold text-white">
                          Document Activity Trends
                        </h3>
                        <p className="text-xs text-gray-400">
                          Real uploads and updates in the selected range
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          <span className="text-xs text-gray-400">Updates</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-purple-500" />
                          <span className="text-xs text-gray-400">Uploads</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={activityData}
                          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorUpdated"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#3b82f6"
                                stopOpacity={0.1}
                              />
                              <stop
                                offset="95%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                              />
                            </linearGradient>

                            <linearGradient
                              id="colorUploads"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#a855f7"
                                stopOpacity={0.1}
                              />
                              <stop
                                offset="95%"
                                stopColor="#a855f7"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#2d3145"
                          />

                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            dy={10}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            dx={-10}
                          />

                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e2130",
                              borderColor: "#2d3145",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                            itemStyle={{ color: "#fff" }}
                          />

                          <Area
                            type="monotone"
                            dataKey="updated"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorUpdated)"
                          />

                          <Area
                            type="monotone"
                            dataKey="uploads"
                            stroke="#a855f7"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorUploads)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex flex-col rounded-2xl border border-[#2d3145] bg-[#1e2130] p-5">
                    <div className="mb-6">
                      <h3 className="mb-1 font-semibold text-white">
                        Top Documents by Type
                      </h3>
                      <p className="text-xs text-gray-400">
                        Distribution from database document types/extensions
                      </p>
                    </div>

                    <div className="flex flex-1 flex-col justify-center space-y-6">
                      {documentTypeRows.length > 0 ? (
                        documentTypeRows.map((item) => (
                          <div key={item.name}>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-300">
                                {item.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {item.percent}% ({item.count})
                              </span>
                            </div>

                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                              <div
                                className={`h-full rounded-full ${item.color}`}
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No document type data available yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <SecuritySummaryCard
                    title="Security Ready"
                    value={securityReadyDocuments}
                    helper="Clean + sandbox safe + encrypted"
                    tone="success"
                  />

                  <SecuritySummaryCard
                    title="Blocked / Unsafe"
                    value={blockedDocuments}
                    helper="Infected, rejected, unsafe, failed, or blocked"
                    tone="danger"
                  />

                  <SecuritySummaryCard
                    title="Ready for AI"
                    value={
                      data.aiSummary?.ready_for_ai ??
                      data.documents.filter(
                        (document) =>
                          isClean(document) &&
                          isSandboxSafe(document) &&
                          isPlaintextReady(document) &&
                          !isAiAnalyzed(document)
                      ).length
                    }
                    helper="Clean + safe + plaintext extracted"
                    tone="purple"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#2d3145] bg-[#1e2130]">
                  <div className="flex items-center justify-between border-b border-[#2d3145] px-5 py-4">
                    <h3 className="font-semibold text-white">
                      Generated Report Summary
                    </h3>

                    <button
                      type="button"
                      onClick={exportSummary}
                      className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
                    >
                      Export JSON
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap text-left text-sm">
                      <thead className="border-b border-[#2d3145] bg-[#181a25] text-xs uppercase text-gray-400">
                        <tr>
                          <th className="px-5 py-3 font-semibold tracking-wider">
                            Report Name
                          </th>
                          <th className="px-5 py-3 font-semibold tracking-wider">
                            Type
                          </th>
                          <th className="px-5 py-3 font-semibold tracking-wider">
                            Date Generated
                          </th>
                          <th className="px-5 py-3 font-semibold tracking-wider">
                            Generated By
                          </th>
                          <th className="px-5 py-3 text-right font-semibold tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#2d3145]">
                        {recentReports.map((report) => (
                          <tr
                            key={report.name}
                            className="group transition-colors hover:bg-[#24283b]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${report.fileIconColor}`}
                                >
                                  {report.name.includes("Activity") ? (
                                    <UploadCloud className="h-4 w-4" />
                                  ) : (
                                    <FilePlus className="h-4 w-4" />
                                  )}
                                </div>

                                <div>
                                  <div className="font-medium text-white">
                                    {report.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {report.fileType}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {report.description}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-md px-2.5 py-1 text-xs font-medium ${report.typeColor}`}
                              >
                                {report.type}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-400">
                              {report.date}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-white ${report.userColor}`}
                                >
                                  {report.userInitials}
                                </div>

                                <span className="text-gray-300">{report.user}</span>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={exportSummary}
                                className="inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SmallMetric({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  icon: ElementType;
  tone: "emerald" | "orange" | "blue" | "purple";
}) {
  const toneClass = {
    emerald: "text-emerald-400 bg-emerald-400/10",
    orange: "text-orange-400 bg-orange-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    purple: "text-purple-400 bg-purple-400/10",
  }[tone];

  return (
    <div className="rounded-2xl border border-[#2d3145] bg-[#1e2130] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>

        <div className={`flex h-8 w-8 items-center justify-center rounded ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="text-2xl font-bold text-white">{formatNumber(value)}</p>
    </div>
  );
}

function SecuritySummaryCard({
  title,
  value,
  helper,
  tone,
}: {
  title: string;
  value: number;
  helper: string;
  tone: "success" | "danger" | "purple";
}) {
  const toneClass = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    danger: "border-red-500/20 bg-red-500/10 text-red-300",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-300",
  }[tone];

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold">{formatNumber(value)}</p>
      <p className="mt-2 text-sm opacity-80">{helper}</p>
    </div>
  );
}