import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Bell,
  ChevronDown,
  Download,
  Filter,
  Search as SearchIcon,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Loader2,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
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

type DepartmentDistributionRow = {
  id: string;
  name: string;
  projects: string;
  documents: number;
  utilization: number;
  storage: string;
  trend: string;
  positive: boolean | null;
  color: string;
  icon: string;
  rawStorageBytes: number;
};

type DepartmentPieRow = {
  name: string;
  value: number;
  color: string;
};

type SiteStatRow = {
  id: string;
  name: string;
  projectId: string;
  leadDept: string;
  docs: number;
  storage: string;
  lastActivity: string;
  trend: string;
  trendPositive: boolean | null;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

type ViewMode = "volume" | "storage";

const departmentColors = [
  "#10b981",
  "#6366f1",
  "#f97316",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

const departmentIcons = ["⛰️", "🛠️", "🏗️", "📋", "🧪", "📁", "🏢"];

const pageSize = 6;

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

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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

function getLooseString(row: unknown, keys: string[]): string {
  if (!row || typeof row !== "object") return "";

  const record = row as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getLooseNestedName(row: unknown, keys: string[]): string {
  if (!row || typeof row !== "object") return "";

  const record = row as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "object" && value !== null) {
      const nested = value as { name?: unknown; title?: unknown };

      if (typeof nested.name === "string" && nested.name.trim()) {
        return nested.name.trim();
      }

      if (typeof nested.title === "string" && nested.title.trim()) {
        return nested.title.trim();
      }
    }
  }

  return "";
}

function getDepartmentFromProject(project: ProjectSummary): string {
  const directValue = getLooseString(project, [
    "department_name",
    "department",
    "lead_department",
    "lead_dept",
    "organization_unit",
  ]);

  if (directValue) return directValue;

  const nestedValue = getLooseNestedName(project, [
    "department",
    "leadDepartment",
    "organization",
    "unit",
  ]);

  if (nestedValue) return nestedValue;

  return "No Department";
}

function getDepartmentFromDocument(document: DmsDocument): string {
  const directValue = getLooseString(document, [
    "department_name",
    "department",
    "lead_department",
    "lead_dept",
    "organization_unit",
  ]);

  if (directValue) return directValue;

  const nestedValue = getLooseNestedName(document, [
    "department",
    "project.department",
    "leadDepartment",
    "organization",
    "unit",
  ]);

  if (nestedValue) return nestedValue;

  const projectDepartment = document.project
    ? getDepartmentFromProject(document.project as ProjectSummary)
    : "";

  if (projectDepartment && projectDepartment !== "No Department") {
    return projectDepartment;
  }

  if (document.category?.name) return document.category.name;

  return "No Department";
}

function getProjectId(project: ProjectSummary): string {
  return String(project.id);
}

function getProjectCode(project: ProjectSummary): string {
  const code = getLooseString(project, ["code", "project_code", "document_code"]);

  return code || `PRJ-${project.id}`;
}

function getProjectName(project: ProjectSummary): string {
  return project.name || `Project #${project.id}`;
}

function documentBelongsToProject(
  document: DmsDocument,
  project: ProjectSummary
): boolean {
  const projectId = String(project.id);

  return (
    String(document.project_id || "") === projectId ||
    String(document.project?.id || "") === projectId
  );
}

function getDocumentStorage(document: DmsDocument): number {
  return Number(document.file_size || 0);
}

function getDocumentDate(document: DmsDocument): string | null {
  return document.updated_at || document.created_at || null;
}

function formatRelativeTime(date?: string | null): string {
  if (!date) return "No activity";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "No activity";

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getProjectLastActivity(
  project: ProjectSummary,
  documents: DmsDocument[]
): string | null {
  const relatedDocuments = documents.filter((document) =>
    documentBelongsToProject(document, project)
  );

  const dates = [
    project.updated_at,
    project.created_at,
    ...relatedDocuments.map(getDocumentDate),
  ]
    .filter((date): date is string => Boolean(date))
    .map((date) => new Date(date).getTime())
    .filter((time) => !Number.isNaN(time));

  if (dates.length === 0) return null;

  return new Date(Math.max(...dates)).toISOString();
}

function isWithinLastDays(date?: string | null, days = 30): boolean {
  if (!date) return false;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return false;

  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);

  return parsed >= threshold;
}

function buildDepartmentDistribution(
  documents: DmsDocument[],
  projects: ProjectSummary[],
  mode: ViewMode
): DepartmentDistributionRow[] {
  const map = new Map<
    string,
    {
      documents: number;
      storage: number;
      projects: Set<string>;
      recent: number;
      previous: number;
    }
  >();

  documents.forEach((document) => {
    const department = getDepartmentFromDocument(document);

    if (!map.has(department)) {
      map.set(department, {
        documents: 0,
        storage: 0,
        projects: new Set<string>(),
        recent: 0,
        previous: 0,
      });
    }

    const current = map.get(department)!;

    current.documents += 1;
    current.storage += getDocumentStorage(document);

    if (document.project_id || document.project?.id) {
      current.projects.add(String(document.project_id || document.project?.id));
    }

    if (isWithinLastDays(document.created_at || document.updated_at, 30)) {
      current.recent += 1;
    }

    if (
      !isWithinLastDays(document.created_at || document.updated_at, 30) &&
      isWithinLastDays(document.created_at || document.updated_at, 60)
    ) {
      current.previous += 1;
    }
  });

  projects.forEach((project) => {
    const department = getDepartmentFromProject(project);

    if (!map.has(department)) {
      map.set(department, {
        documents: 0,
        storage: 0,
        projects: new Set<string>(),
        recent: 0,
        previous: 0,
      });
    }

    map.get(department)!.projects.add(String(project.id));
  });

  const totalDocuments = Math.max(1, documents.length);
  const totalStorage = Math.max(
    1,
    documents.reduce((sum, document) => sum + getDocumentStorage(document), 0)
  );

  return Array.from(map.entries())
    .map(([department, value], index) => {
      const baseValue = mode === "storage" ? value.storage : value.documents;
      const totalValue = mode === "storage" ? totalStorage : totalDocuments;
      const trendValue =
        value.previous <= 0 && value.recent > 0
          ? 100
          : value.previous <= 0
          ? 0
          : Math.round(((value.recent - value.previous) / value.previous) * 100);

      return {
        id: department.toLowerCase().replace(/\s+/g, "-"),
        name: department,
        projects: `${value.projects.size} Project${
          value.projects.size === 1 ? "" : "s"
        } Active`,
        documents: value.documents,
        utilization: Math.round((baseValue / totalValue) * 100),
        storage: formatBytes(value.storage),
        rawStorageBytes: value.storage,
        trend: `${trendValue >= 0 ? "+" : ""}${trendValue}%`,
        positive: trendValue === 0 ? null : trendValue > 0,
        color: departmentColors[index % departmentColors.length],
        icon: departmentIcons[index % departmentIcons.length],
      };
    })
    .sort((first, second) =>
      mode === "storage"
        ? second.rawStorageBytes - first.rawStorageBytes
        : second.documents - first.documents
    );
}

function buildDepartmentPieRows(
  distribution: DepartmentDistributionRow[],
  mode: ViewMode
): DepartmentPieRow[] {
  const total =
    mode === "storage"
      ? distribution.reduce((sum, item) => sum + item.rawStorageBytes, 0)
      : distribution.reduce((sum, item) => sum + item.documents, 0);

  if (total <= 0) return [];

  return distribution.slice(0, 6).map((item) => {
    const value =
      mode === "storage"
        ? Math.round((item.rawStorageBytes / total) * 100)
        : Math.round((item.documents / total) * 100);

    return {
      name: item.name,
      value,
      color: item.color,
    };
  });
}

function buildSiteStats(
  projects: ProjectSummary[],
  documents: DmsDocument[]
): SiteStatRow[] {
  const projectRows = projects.map((project) => {
    const relatedDocuments = documents.filter((document) =>
      documentBelongsToProject(document, project)
    );

    const storage = relatedDocuments.reduce(
      (sum, document) => sum + getDocumentStorage(document),
      0
    );

    const recentCount = relatedDocuments.filter((document) =>
      isWithinLastDays(document.created_at || document.updated_at, 30)
    ).length;

    const previousCount = relatedDocuments.filter(
      (document) =>
        !isWithinLastDays(document.created_at || document.updated_at, 30) &&
        isWithinLastDays(document.created_at || document.updated_at, 60)
    ).length;

    const trend =
      previousCount <= 0 && recentCount > 0
        ? 100
        : previousCount <= 0
        ? 0
        : Math.round(((recentCount - previousCount) / previousCount) * 100);

    return {
      id: getInitials(getProjectName(project)),
      name: getProjectName(project),
      projectId: getProjectCode(project),
      leadDept: getDepartmentFromProject(project),
      docs: relatedDocuments.length,
      storage: formatBytes(storage),
      lastActivity: formatRelativeTime(getProjectLastActivity(project, documents)),
      trend: `${trend >= 0 ? "+" : ""}${trend}%`,
      trendPositive: trend === 0 ? null : trend > 0,
    };
  });

  const noProjectDocuments = documents.filter(
    (document) => !document.project_id && !document.project?.id
  );

  if (noProjectDocuments.length > 0) {
    const storage = noProjectDocuments.reduce(
      (sum, document) => sum + getDocumentStorage(document),
      0
    );

    projectRows.push({
      id: "NP",
      name: "No Project",
      projectId: "NO-PROJECT",
      leadDept: "Unassigned",
      docs: noProjectDocuments.length,
      storage: formatBytes(storage),
      lastActivity: formatRelativeTime(
        noProjectDocuments
          .map(getDocumentDate)
          .filter((date): date is string => Boolean(date))
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      ),
      trend: "0%",
      trendPositive: null,
    });
  }

  return projectRows.sort((first, second) => second.docs - first.docs);
}

function getDeptColor(dept: string) {
  const lower = dept.toLowerCase();

  if (lower.includes("geo")) return "text-emerald-400 bg-emerald-400/10";
  if (lower.includes("engineer")) return "text-indigo-400 bg-indigo-400/10";
  if (lower.includes("construct")) return "text-orange-400 bg-orange-400/10";
  if (lower.includes("legal")) return "text-purple-400 bg-purple-400/10";
  if (lower.includes("unassigned")) return "text-slate-400 bg-slate-400/10";

  return "text-cyan-400 bg-cyan-400/10";
}

function getDeptDotColor(dept: string) {
  const lower = dept.toLowerCase();

  if (lower.includes("geo")) return "bg-emerald-400";
  if (lower.includes("engineer")) return "bg-indigo-400";
  if (lower.includes("construct")) return "bg-orange-400";
  if (lower.includes("legal")) return "bg-purple-400";

  return "bg-cyan-400";
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

export default function Depreport() {
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("volume");
  const [projectFilter, setProjectFilter] = useState<string>("All Projects");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

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
      setDocuments(documentsData);
      setProjects(projectsData);
      setCurrentPage(1);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load department/project report data.",
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
      ...projects
        .map((project) => getProjectName(project))
        .filter((name): name is string => Boolean(name)),
    ],
    [projects]
  );

  const filteredProjects = useMemo(() => {
    if (projectFilter === "All Projects") return projects;

    return projects.filter((project) => getProjectName(project) === projectFilter);
  }, [projectFilter, projects]);

  const filteredDocuments = useMemo(() => {
    if (projectFilter === "All Projects") return documents;

    const selectedProject = projects.find(
      (project) => getProjectName(project) === projectFilter
    );

    if (!selectedProject) return documents;

    return documents.filter((document) =>
      documentBelongsToProject(document, selectedProject)
    );
  }, [documents, projectFilter, projects]);

  const distribution = useMemo(
    () => buildDepartmentDistribution(filteredDocuments, filteredProjects, viewMode),
    [filteredDocuments, filteredProjects, viewMode]
  );

  const pieRows = useMemo(
    () => buildDepartmentPieRows(distribution, viewMode),
    [distribution, viewMode]
  );

  const siteStats = useMemo(
    () => buildSiteStats(filteredProjects, filteredDocuments),
    [filteredDocuments, filteredProjects]
  );

  const searchedSiteStats = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return siteStats;

    return siteStats.filter((site) =>
      [
        site.name,
        site.projectId,
        site.leadDept,
        site.storage,
        site.lastActivity,
        site.trend,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [search, siteStats]);

  const totalDocuments = filteredDocuments.length;
  const totalStorage = filteredDocuments.reduce(
    (sum, document) => sum + getDocumentStorage(document),
    0
  );

  const totalPages = Math.max(1, Math.ceil(searchedSiteStats.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedSiteStats = searchedSiteStats.slice(
    startIndex,
    startIndex + pageSize
  );

  function exportReport(): void {
    exportJson(
      `department-project-report-${new Date().toISOString().slice(0, 10)}.json`,
      {
        generated_at: new Date().toISOString(),
        generated_by: getUserName(user),
        project_filter: projectFilter,
        view_mode: viewMode,
        total_documents: totalDocuments,
        total_storage: formatBytes(totalStorage),
        department_distribution: distribution,
        project_activity: siteStats,
      }
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] font-sans text-slate-300">
      <AdminSidebar />

      <main className="flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800/50 bg-[#161922] px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-200">Reports</span>
              <span className="text-slate-600">/</span>
              <div className="flex items-center gap-2 text-slate-400">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Department & Project Analytics</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1e212b] px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-[#252936] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </button>

            <button className="relative p-2 text-slate-400 transition-colors hover:text-slate-200">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-200">
                  {getUserName(user)}
                </p>
                <p className="text-xs text-slate-500">{getRoleName(user)}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-medium text-white">
                {getInitials(getUserName(user))}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-semibold text-white">
                Department & Project Reports
              </h1>
              <p className="text-sm text-slate-400">
                Real database comparison of document volume, storage allocation,
                department grouping, and project site activity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={projectFilter}
                onChange={(event) => {
                  setProjectFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-700 bg-[#1e212b] px-4 py-2 text-sm text-slate-300 outline-none transition-colors hover:bg-[#252936]"
              >
                {projectOptions.map((option) => (
                  <option key={option} value={option} className="bg-[#1e212b]">
                    {option}
                  </option>
                ))}
              </select>

              <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1e212b] px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-[#252936]">
                <Filter className="h-4 w-4" />
                <span>{viewMode === "volume" ? "Volume" : "Storage Size"}</span>
              </button>

              <button
                type="button"
                onClick={exportReport}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {alert && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                alert.type === "error"
                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                  : "border-blue-500/20 bg-blue-500/10 text-blue-300"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              {alert.message}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              title="Documents"
              value={totalDocuments}
              helper="Documents in current project filter"
            />
            <MetricCard
              title="Projects"
              value={filteredProjects.length}
              helper={`${projects.length} total projects loaded`}
            />
            <MetricCard
              title="Storage"
              value={formatBytes(totalStorage)}
              helper="Calculated from document file_size"
            />
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-800/50 bg-[#161922] p-12 text-center text-sm text-slate-400">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
              Loading department and project report from database...
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-800/50 bg-[#161922] p-5 xl:col-span-2">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">
                        Department Document Distribution
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Documents and storage grouped from real department/project
                        data
                      </p>
                    </div>
                    <div className="flex rounded-lg bg-[#1e212b] p-1">
                      <button
                        type="button"
                        onClick={() => setViewMode("volume")}
                        className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                          viewMode === "volume"
                            ? "bg-slate-800 text-slate-300"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Volume
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("storage")}
                        className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                          viewMode === "storage"
                            ? "bg-slate-800 text-slate-300"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Storage Size
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {distribution.length > 0 ? (
                      distribution.map((dept) => (
                        <div key={dept.id}>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{dept.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-slate-200">
                                  {dept.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {dept.projects}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <span
                                className={`text-xs ${
                                  dept.positive === true
                                    ? "text-emerald-400"
                                    : dept.positive === false
                                    ? "text-red-400"
                                    : "text-slate-400"
                                }`}
                              >
                                {dept.trend} vs previous period
                              </span>
                              <div className="text-right">
                                <p className="text-base font-semibold text-slate-200">
                                  {formatNumber(dept.documents)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {dept.storage}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className="w-20 text-xs text-slate-500"
                              style={{ color: dept.color }}
                            >
                              {dept.utilization}% Utilized
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1e212b]">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${dept.utilization}%`,
                                  backgroundColor: dept.color,
                                  opacity: 0.8,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No department data available yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/50 bg-[#161922] p-5">
                  <h3 className="mb-4 text-base font-semibold text-slate-100">
                    Department Contribution
                  </h3>

                  <div className="relative mb-4 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieRows}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieRows.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {formatNumber(totalDocuments)}
                      </span>
                      <span className="text-xs text-slate-500">total Docs</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {pieRows.length > 0 ? (
                      pieRows.map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="flex-1 text-sm text-slate-400">
                            {item.name}
                          </span>
                          <span className="text-sm font-medium text-slate-200">
                            {item.value}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No contribution data available.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/50 bg-[#161922]">
                <div className="flex flex-col gap-4 border-b border-slate-800/50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <h3 className="text-base font-semibold text-slate-100">
                    Site-Level Activity Stats
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Search project..."
                        className="rounded-lg border border-slate-700 bg-[#1e212b] py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-indigo-500"
                      />
                    </label>
                    <button className="p-2 text-slate-400 transition-colors hover:text-slate-200">
                      <SlidersHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800/50">
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Project Name
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Lead Dept
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Docs
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Storage
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Last Activity
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {paginatedSiteStats.length > 0 ? (
                        paginatedSiteStats.map((site) => (
                          <tr
                            key={`${site.projectId}-${site.name}`}
                            className="transition-colors hover:bg-slate-800/30"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-[#1e212b] text-xs font-medium text-slate-400">
                                  {site.id}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-200">
                                    {site.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    ID: {site.projectId}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getDeptColor(
                                  site.leadDept
                                )}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${getDeptDotColor(
                                    site.leadDept
                                  )}`}
                                />
                                {site.leadDept}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-slate-200">
                                {formatNumber(site.docs)}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-slate-200">
                                {site.storage}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-slate-400">
                                {site.lastActivity}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`text-sm font-medium ${
                                  site.trendPositive === true
                                    ? "text-emerald-400"
                                    : site.trendPositive === false
                                    ? "text-red-400"
                                    : "text-slate-400"
                                }`}
                              >
                                {site.trendPositive === true
                                  ? "↗ "
                                  : site.trendPositive === false
                                  ? "↘ "
                                  : "− "}
                                {site.trend}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-10 text-center text-sm text-slate-500"
                          >
                            No project activity found for this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/50 px-5 py-4">
                  <p className="text-sm text-slate-500">
                    Showing {paginatedSiteStats.length} of{" "}
                    {searchedSiteStats.length} Active Projects
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage(safeCurrentPage - 1)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage(safeCurrentPage + 1)}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: number | string;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800/50 bg-[#161922] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}