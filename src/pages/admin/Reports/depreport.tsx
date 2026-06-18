import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FolderKanban,
  FolderOpen,
  GitBranch,
  HardDrive,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  UsersRound,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
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

type ViewMode = "volume" | "storage";

type DepartmentDistributionRow = {
  id: string;
  name: string;
  projectCount: number;
  documentCount: number;
  storageBytes: number;
  storageLabel: string;
  percentage: number;
  trend: number;
  color: string;
};

type DepartmentPieRow = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

type ProjectActivityRow = {
  id: number | string;
  initials: string;
  name: string;
  code: string;
  department: string;
  documentCount: number;
  storageBytes: number;
  storageLabel: string;
  lastActivityRaw: string | null;
  lastActivity: string;
  trend: number;
};

const PAGE_SIZE = 6;

const departmentColors = [
  "#2563eb",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#64748b",
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

function formatRelativeTime(date?: string | null): string {
  if (!date) return "No activity";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "No activity";

  const difference = Date.now() - parsed.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getInitials(name?: string | null): string {
  if (!name) return "NA";

  const parts = name.trim().split(/\s+/).filter(Boolean);

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

function getNestedValue(row: unknown, path: string): unknown {
  if (!row || typeof row !== "object") return undefined;

  return path.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") return undefined;

    return (current as Record<string, unknown>)[segment];
  }, row);
}

function getNestedName(row: unknown, paths: string[]): string {
  for (const path of paths) {
    const value = getNestedValue(row, path);

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;

      if (typeof record.name === "string" && record.name.trim()) {
        return record.name.trim();
      }

      if (typeof record.title === "string" && record.title.trim()) {
        return record.title.trim();
      }
    }
  }

  return "";
}

function getDepartmentFromProject(project: ProjectSummary): string {
  const directValue = getLooseString(project, [
    "department_name",
    "lead_department",
    "lead_dept",
    "organization_unit",
  ]);

  if (directValue) return directValue;

  const nestedValue = getNestedName(project, [
    "department",
    "leadDepartment",
    "organization",
    "unit",
  ]);

  return nestedValue || "No department";
}

function getDepartmentFromDocument(document: DmsDocument): string {
  const directValue = getLooseString(document, [
    "department_name",
    "lead_department",
    "lead_dept",
    "organization_unit",
  ]);

  if (directValue) return directValue;

  const nestedValue = getNestedName(document, [
    "department",
    "project.department",
    "leadDepartment",
    "organization",
    "unit",
  ]);

  if (nestedValue) return nestedValue;

  if (document.project) {
    const projectDepartment = getDepartmentFromProject(
      document.project as ProjectSummary
    );

    if (projectDepartment !== "No department") {
      return projectDepartment;
    }
  }

  if (document.category?.name) {
    return document.category.name;
  }

  return "No department";
}

function getProjectName(project: ProjectSummary): string {
  return project.name || `Project #${project.id}`;
}

function getProjectCode(project: ProjectSummary): string {
  return (
    getLooseString(project, ["code", "project_code", "document_code"]) ||
    `PRJ-${project.id}`
  );
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

function isWithinPeriod(
  date?: string | null,
  startDaysAgo = 0,
  endDaysAgo = 30
): boolean {
  if (!date) return false;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return false;

  const end = new Date();
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() - startDaysAgo);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - endDaysAgo);

  return parsed >= start && parsed <= end;
}

function calculateTrend(current: number, previous: number): number {
  if (previous <= 0 && current > 0) return 100;
  if (previous <= 0) return 0;

  return Math.round(((current - previous) / previous) * 100);
}

function getProjectLastActivity(
  project: ProjectSummary,
  documents: DmsDocument[]
): string | null {
  const relatedDocuments = documents.filter((document) =>
    documentBelongsToProject(document, project)
  );

  const projectRecord = project as unknown as {
    updated_at?: string;
    created_at?: string;
  };

  const dates = [
    projectRecord.updated_at,
    projectRecord.created_at,
    ...relatedDocuments.map(getDocumentDate),
  ]
    .filter((date): date is string => Boolean(date))
    .map((date) => new Date(date).getTime())
    .filter((time) => !Number.isNaN(time));

  if (dates.length === 0) return null;

  return new Date(Math.max(...dates)).toISOString();
}

function buildDepartmentDistribution(
  documents: DmsDocument[],
  projects: ProjectSummary[],
  mode: ViewMode
): DepartmentDistributionRow[] {
  const departments = new Map<
    string,
    {
      documentCount: number;
      storageBytes: number;
      projectIds: Set<string>;
      currentCount: number;
      previousCount: number;
    }
  >();

  documents.forEach((document) => {
    const departmentName = getDepartmentFromDocument(document);

    if (!departments.has(departmentName)) {
      departments.set(departmentName, {
        documentCount: 0,
        storageBytes: 0,
        projectIds: new Set<string>(),
        currentCount: 0,
        previousCount: 0,
      });
    }

    const department = departments.get(departmentName)!;

    department.documentCount += 1;
    department.storageBytes += getDocumentStorage(document);

    if (document.project_id || document.project?.id) {
      department.projectIds.add(
        String(document.project_id || document.project?.id)
      );
    }

    const documentDate = document.created_at || document.updated_at;

    if (isWithinPeriod(documentDate, 0, 30)) {
      department.currentCount += 1;
    } else if (isWithinPeriod(documentDate, 31, 60)) {
      department.previousCount += 1;
    }
  });

  projects.forEach((project) => {
    const departmentName = getDepartmentFromProject(project);

    if (!departments.has(departmentName)) {
      departments.set(departmentName, {
        documentCount: 0,
        storageBytes: 0,
        projectIds: new Set<string>(),
        currentCount: 0,
        previousCount: 0,
      });
    }

    departments.get(departmentName)!.projectIds.add(String(project.id));
  });

  const totalMetric =
    mode === "storage"
      ? Math.max(
          1,
          documents.reduce(
            (total, document) => total + getDocumentStorage(document),
            0
          )
        )
      : Math.max(1, documents.length);

  return Array.from(departments.entries())
    .map(([name, values], index) => {
      const metric =
        mode === "storage"
          ? values.storageBytes
          : values.documentCount;

      return {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name,
        projectCount: values.projectIds.size,
        documentCount: values.documentCount,
        storageBytes: values.storageBytes,
        storageLabel: formatBytes(values.storageBytes),
        percentage: Math.round((metric / totalMetric) * 100),
        trend: calculateTrend(
          values.currentCount,
          values.previousCount
        ),
        color: departmentColors[index % departmentColors.length],
      };
    })
    .sort((first, second) =>
      mode === "storage"
        ? second.storageBytes - first.storageBytes
        : second.documentCount - first.documentCount
    );
}

function buildPieRows(
  distribution: DepartmentDistributionRow[],
  mode: ViewMode
): DepartmentPieRow[] {
  const total = distribution.reduce(
    (sum, item) =>
      sum +
      (mode === "storage"
        ? item.storageBytes
        : item.documentCount),
    0
  );

  if (total <= 0) return [];

  return distribution.slice(0, 6).map((item) => {
    const value =
      mode === "storage"
        ? item.storageBytes
        : item.documentCount;

    return {
      name: item.name,
      value,
      percentage: Math.round((value / total) * 100),
      color: item.color,
    };
  });
}

function buildProjectActivityRows(
  projects: ProjectSummary[],
  documents: DmsDocument[]
): ProjectActivityRow[] {
  const rows = projects.map((project) => {
    const relatedDocuments = documents.filter((document) =>
      documentBelongsToProject(document, project)
    );

    const storageBytes = relatedDocuments.reduce(
      (total, document) => total + getDocumentStorage(document),
      0
    );

    const currentCount = relatedDocuments.filter((document) =>
      isWithinPeriod(
        document.created_at || document.updated_at,
        0,
        30
      )
    ).length;

    const previousCount = relatedDocuments.filter((document) =>
      isWithinPeriod(
        document.created_at || document.updated_at,
        31,
        60
      )
    ).length;

    const lastActivityRaw = getProjectLastActivity(project, documents);

    return {
      id: project.id,
      initials: getInitials(getProjectName(project)),
      name: getProjectName(project),
      code: getProjectCode(project),
      department: getDepartmentFromProject(project),
      documentCount: relatedDocuments.length,
      storageBytes,
      storageLabel: formatBytes(storageBytes),
      lastActivityRaw,
      lastActivity: formatRelativeTime(lastActivityRaw),
      trend: calculateTrend(currentCount, previousCount),
    };
  });

  const unassignedDocuments = documents.filter(
    (document) => !document.project_id && !document.project?.id
  );

  if (unassignedDocuments.length > 0) {
    const storageBytes = unassignedDocuments.reduce(
      (total, document) => total + getDocumentStorage(document),
      0
    );

    const currentCount = unassignedDocuments.filter((document) =>
      isWithinPeriod(
        document.created_at || document.updated_at,
        0,
        30
      )
    ).length;

    const previousCount = unassignedDocuments.filter((document) =>
      isWithinPeriod(
        document.created_at || document.updated_at,
        31,
        60
      )
    ).length;

    const latestDate =
      unassignedDocuments
        .map(getDocumentDate)
        .filter((date): date is string => Boolean(date))
        .sort(
          (first, second) =>
            new Date(second).getTime() - new Date(first).getTime()
        )[0] || null;

    rows.push({
      id: "unassigned",
      initials: "UP",
      name: "Unassigned documents",
      code: "NO-PROJECT",
      department: "Unassigned",
      documentCount: unassignedDocuments.length,
      storageBytes,
      storageLabel: formatBytes(storageBytes),
      lastActivityRaw: latestDate,
      lastActivity: formatRelativeTime(latestDate),
      trend: calculateTrend(currentCount, previousCount),
    });
  }

  return rows.sort(
    (first, second) =>
      second.documentCount - first.documentCount
  );
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
          <span className="text-slate-700">Projects</span>
        </div>

        <h1 className="mt-1 text-lg font-bold text-slate-900">
          Department & Project Report
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
  value: string;
  helper: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
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

function TrendBadge({ trend }: { trend: number }) {
  if (trend === 0) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
        No change
      </span>
    );
  }

  const positive = trend > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
        "text-[10px] font-bold",
        positive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      )}
    >
      {positive ? (
        <TrendingUp size={12} />
      ) : (
        <TrendingDown size={12} />
      )}

      {positive ? "+" : ""}
      {trend}%
    </span>
  );
}

function PieTooltip({
  active,
  payload,
  mode,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: DepartmentPieRow;
  }>;
  mode: ViewMode;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const row = payload[0]?.payload;

  if (!row) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-bold text-slate-700">{row.name}</p>

      <p className="mt-1 text-xs text-slate-500">
        {mode === "storage" ? "Storage share" : "Document share"}:{" "}
        <span className="font-bold text-slate-900">
          {row.percentage}%
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

function MobileProjectCard({
  project,
}: {
  project: ProjectActivityRow;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
          {project.initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {project.name}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {project.code}
          </p>
        </div>

        <TrendBadge trend={project.trend} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-[10px] text-slate-400">Documents</p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {formatNumber(project.documentCount)}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-slate-400">Storage</p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {project.storageLabel}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] text-slate-400">Department</p>
        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
          {project.department}
        </p>
      </div>

      <Link
        to="/alldocuments"
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <FolderOpen size={15} />
        Open document library
      </Link>
    </article>
  );
}

export default function Depreport() {
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [user, setUser] = useState<UserSummary | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("volume");
  const [projectFilter, setProjectFilter] =
    useState<string>("All Projects");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  async function loadData(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const [userData, documentsData, projectsData] =
        await Promise.all([
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
            : "Unable to load the department and project report.",
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
            .map((project) => getProjectName(project))
            .filter(Boolean)
        )
      ),
    ],
    [projects]
  );

  const filteredProjects = useMemo(() => {
    if (projectFilter === "All Projects") {
      return projects;
    }

    return projects.filter(
      (project) => getProjectName(project) === projectFilter
    );
  }, [projectFilter, projects]);

  const filteredDocuments = useMemo(() => {
    if (projectFilter === "All Projects") {
      return documents;
    }

    const selectedProject = projects.find(
      (project) => getProjectName(project) === projectFilter
    );

    if (!selectedProject) return [];

    return documents.filter((document) =>
      documentBelongsToProject(document, selectedProject)
    );
  }, [documents, projectFilter, projects]);

  const departmentDistribution = useMemo(
    () =>
      buildDepartmentDistribution(
        filteredDocuments,
        filteredProjects,
        viewMode
      ),
    [filteredDocuments, filteredProjects, viewMode]
  );

  const pieRows = useMemo(
    () => buildPieRows(departmentDistribution, viewMode),
    [departmentDistribution, viewMode]
  );

  const projectActivity = useMemo(
    () =>
      buildProjectActivityRows(
        filteredProjects,
        filteredDocuments
      ),
    [filteredDocuments, filteredProjects]
  );

  const searchedProjectActivity = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) return projectActivity;

    return projectActivity.filter((project) =>
      [
        project.name,
        project.code,
        project.department,
        project.storageLabel,
        project.lastActivity,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm)
    );
  }, [projectActivity, search]);

  const totalDocuments = filteredDocuments.length;

  const totalStorageBytes = filteredDocuments.reduce(
    (total, document) => total + getDocumentStorage(document),
    0
  );

  const departmentCount = departmentDistribution.length;

  const totalPages = Math.max(
    1,
    Math.ceil(searchedProjectActivity.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const paginatedProjects = searchedProjectActivity.slice(
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
      `department-project-report-${new Date()
        .toISOString()
        .slice(0, 10)}.json`,
      {
        generated_at: new Date().toISOString(),
        generated_by: getUserName(user),
        selected_project: projectFilter,
        view_mode: viewMode,
        total_documents: totalDocuments,
        total_projects: filteredProjects.length,
        total_departments: departmentCount,
        total_storage_bytes: totalStorageBytes,
        total_storage: formatBytes(totalStorageBytes),
        department_distribution: departmentDistribution,
        project_activity: projectActivity,
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
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{alert.message}</span>
                </div>

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
                  Department & Project Analytics
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Compare document volume, storage usage and project activity
                  using current database records.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <FolderKanban
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={projectFilter}
                    onChange={(event) => {
                      setProjectFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-10 max-w-[230px] appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-9 pr-9 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
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
                  Loading project report
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Retrieving department and project data...
                </p>
              </div>
            ) : (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="Documents"
                    value={formatNumber(totalDocuments)}
                    helper="Documents in current filter"
                    icon={FileText}
                  />

                  <MetricCard
                    title="Projects"
                    value={formatNumber(filteredProjects.length)}
                    helper={`${formatNumber(projects.length)} total loaded`}
                    icon={FolderKanban}
                  />

                  <MetricCard
                    title="Departments"
                    value={formatNumber(departmentCount)}
                    helper="Departments represented"
                    icon={Building2}
                  />

                  <MetricCard
                    title="Storage Used"
                    value={formatBytes(totalStorageBytes)}
                    helper="Real document file size"
                    icon={HardDrive}
                  />
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Department Distribution
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Compare departments by document count or storage
                        </p>
                      </div>

                      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => setViewMode("volume")}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                            viewMode === "volume"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          )}
                        >
                          Volume
                        </button>

                        <button
                          type="button"
                          onClick={() => setViewMode("storage")}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                            viewMode === "storage"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          )}
                        >
                          Storage
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {departmentDistribution.length > 0 ? (
                        departmentDistribution
                          .slice(0, 7)
                          .map((department) => (
                            <div
                              key={department.id}
                              className="rounded-xl border border-slate-200 p-3.5"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                                    style={{
                                      backgroundColor: department.color,
                                    }}
                                  >
                                    {getInitials(department.name)}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">
                                      {department.name}
                                    </p>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                      {department.projectCount} project
                                      {department.projectCount === 1 ? "" : "s"} ·{" "}
                                      {department.documentCount} document
                                      {department.documentCount === 1 ? "" : "s"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                  <TrendBadge trend={department.trend} />

                                  <div className="min-w-[84px] text-right">
                                    <p className="text-sm font-bold text-slate-800">
                                      {viewMode === "storage"
                                        ? department.storageLabel
                                        : formatNumber(
                                            department.documentCount
                                          )}
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-slate-400">
                                      {department.percentage}% share
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${department.percentage}%`,
                                    backgroundColor: department.color,
                                  }}
                                />
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                          <Building2
                            size={28}
                            className="text-slate-300"
                          />

                          <p className="mt-3 text-sm font-semibold text-slate-600">
                            No department data
                          </p>

                          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                            Assign projects or documents to departments to see
                            their distribution.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Department Contribution
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Percentage share of the selected metric
                      </p>
                    </div>

                    {pieRows.length > 0 ? (
                      <>
                        <div className="relative mt-4 h-[210px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={pieRows}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={58}
                                outerRadius={82}
                                paddingAngle={2}
                                stroke="none"
                              >
                                {pieRows.map((row) => (
                                  <Cell
                                    key={row.name}
                                    fill={row.color}
                                  />
                                ))}
                              </Pie>

                              <Tooltip
                                content={
                                  <PieTooltip mode={viewMode} />
                                }
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>

                          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-slate-900">
                              {viewMode === "storage"
                                ? formatBytes(totalStorageBytes)
                                : formatNumber(totalDocuments)}
                            </span>

                            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              {viewMode === "storage"
                                ? "Total storage"
                                : "Documents"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {pieRows.map((row) => (
                            <div
                              key={row.name}
                              className="flex items-center gap-3"
                            >
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: row.color,
                                }}
                              />

                              <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                                {row.name}
                              </span>

                              <span className="text-xs font-bold text-slate-900">
                                {row.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex min-h-[310px] flex-col items-center justify-center text-center">
                        <BarChart3
                          size={27}
                          className="text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                          No contribution data
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                  <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Project Activity
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Documents, storage and recent activity by project
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
                        placeholder="Search projects..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[980px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Project
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Department
                          </th>

                          <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Documents
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Storage
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Last Activity
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            30-day Trend
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedProjects.length > 0 ? (
                          paginatedProjects.map((project) => (
                            <tr
                              key={String(project.id)}
                              className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
                                    {project.initials}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[280px] truncate text-sm font-semibold text-slate-800">
                                      {project.name}
                                    </p>

                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                      {project.code}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex max-w-[210px] items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                  <Building2 size={12} />
                                  <span className="truncate">
                                    {project.department}
                                  </span>
                                </span>
                              </td>

                              <td className="px-5 py-4 text-center text-sm font-bold text-slate-800">
                                {formatNumber(project.documentCount)}
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                                {project.storageLabel}
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-xs font-semibold text-slate-600">
                                  {project.lastActivity}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <TrendBadge trend={project.trend} />
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
                                No project activity found
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Change the project filter or search text.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 gap-4 bg-slate-50/60 p-4 sm:grid-cols-2 lg:hidden">
                    {paginatedProjects.length > 0 ? (
                      paginatedProjects.map((project) => (
                        <MobileProjectCard
                          key={String(project.id)}
                          project={project}
                        />
                      ))
                    ) : (
                      <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                        <Search
                          size={26}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                          No project activity found
                        </p>
                      </div>
                    )}
                  </div>

                  {searchedProjectActivity.length > 0 && (
                    <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                          {startIndex + 1}–
                          {Math.min(
                            startIndex + paginatedProjects.length,
                            searchedProjectActivity.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                          {searchedProjectActivity.length}
                        </span>{" "}
                        projects
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