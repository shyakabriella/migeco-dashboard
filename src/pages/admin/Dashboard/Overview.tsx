import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  FlaskConical,
  FolderOpen,
  Loader2,
  MapPinned,
  RefreshCcw,
  Search,
  ShieldCheck,
} from "lucide-react";

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
  type: "error" | "success" | "info";
  message: string;
};

type DashboardData = {
  user: UserSummary | null;
  documents: DmsDocument[];
  projects: ProjectSummary[];
};

type WeeklyUpload = {
  key: string;
  day: string;
  date: string;
  value: number;
};

type DocumentDisplayStatus = "clean" | "pending" | "alert";

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

function getUserName(user: UserSummary | null): string {
  return user?.name || "DMS User";
}

function getRoleName(user: UserSummary | null): string {
  const role = (user as { role?: unknown } | null)?.role;

  if (!role) return "System User";

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
      "System User"
    );
  }

  return "System User";
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const names = name.trim().split(/\s+/).filter(Boolean);

  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }

  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";

  return "Good Evening";
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatDate(date?: string | null): string {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatRelativeTime(date?: string | null): string {
  if (!date) return "Unknown time";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown time";
  }

  const difference = Date.now() - parsedDate.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return formatDate(date);
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
  if (document.extension) {
    return document.extension.toUpperCase();
  }

  if (document.document_type) {
    return getReadableStatus(document.document_type);
  }

  return "FILE";
}

function getProjectName(document: DmsDocument): string {
  return document.project?.name || "No project";
}

function isBlockedDocument(document: DmsDocument): boolean {
  const documentStatus = toLower(document.status);
  const scanStatus = toLower(document.scan_status);
  const sandboxStatus = toLower(document.sandbox_status);

  return (
    ["infected", "rejected", "blocked", "failed"].includes(documentStatus) ||
    ["infected", "failed"].includes(scanStatus) ||
    ["unsafe", "failed"].includes(sandboxStatus)
  );
}

function isCleanDocument(document: DmsDocument): boolean {
  const scanStatus = toLower(document.scan_status);
  const sandboxStatus = toLower(document.sandbox_status);
  const status = toLower(document.status);

  if (isBlockedDocument(document)) {
    return false;
  }

  return (
    ["clean", "passed"].includes(scanStatus) ||
    ["safe"].includes(sandboxStatus) ||
    status === "active"
  );
}

function isSampleOrLaboratoryDocument(document: DmsDocument): boolean {
  const values = [
    document.title,
    document.document_code,
    document.document_type,
    document.original_file_name,
    document.category?.name,
    document.category?.slug,
  ]
    .map((value) => toLower(value))
    .join(" ");

  return [
    "sample",
    "laboratory",
    "lab",
    "rock_sample",
    "soil_sample",
    "core_sample",
    "laboratory_result",
    "test_result",
  ].some((keyword) => values.includes(keyword));
}

function countStudyAreas(projects: ProjectSummary[]): number {
  const studyAreaKeys = projects
    .map((project) => {
      const locationName = toLower(project.location_name);
      const latitude = project.latitude;
      const longitude = project.longitude;

      if (locationName) {
        return locationName;
      }

      if (
        latitude !== null &&
        latitude !== undefined &&
        longitude !== null &&
        longitude !== undefined
      ) {
        return `${latitude},${longitude}`;
      }

      return null;
    })
    .filter((value): value is string => Boolean(value));

  return new Set(studyAreaKeys).size;
}

function isPendingReviewDocument(document: DmsDocument): boolean {
  const status = toLower(document.status);
  const scanStatus = toLower(document.scan_status);
  const sandboxStatus = toLower(document.sandbox_status);
  const encryptionStatus = toLower(document.encryption_status);
  const plaintextStatus = toLower(document.plaintext_status);
  const aiStatus = toLower(document.ai_status);

  return (
    [
      "pending",
      "pending_review",
      "pending_scan",
      "quarantined",
      "draft",
    ].includes(status) ||
    ["pending", "suspicious", "infected", "failed"].includes(scanStatus) ||
    ["pending", "unsafe", "failed"].includes(sandboxStatus) ||
    ["pending", "failed"].includes(encryptionStatus) ||
    ["pending", "failed"].includes(plaintextStatus) ||
    ["pending", "flagged", "failed"].includes(aiStatus)
  );
}

function getDocumentDisplayStatus(
  document: DmsDocument
): DocumentDisplayStatus {
  if (isBlockedDocument(document)) {
    return "alert";
  }

  if (isCleanDocument(document)) {
    return "clean";
  }

  return "pending";
}

function getDocumentStatusLabel(document: DmsDocument): string {
  const status = getDocumentDisplayStatus(document);

  if (status === "clean") return "Clean";
  if (status === "alert") return "Needs Review";

  return "Pending";
}

function getDocumentStatusClass(document: DmsDocument): string {
  const status = getDocumentDisplayStatus(document);

  if (status === "clean") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "alert") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getProjectStatusClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "completed":
      return "bg-blue-50 text-blue-700";
    case "planned":
      return "bg-violet-50 text-violet-700";
    case "archived":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function sortByDate<T extends { updated_at?: string; created_at?: string }>(
  rows: T[]
): T[] {
  return [...rows].sort((first, second) => {
    const firstDate = new Date(
      first.updated_at || first.created_at || 0
    ).getTime();

    const secondDate = new Date(
      second.updated_at || second.created_at || 0
    ).getTime();

    return secondDate - firstDate;
  });
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDocumentDateKey(document: DmsDocument): string | null {
  const dateValue = document.created_at || document.updated_at;

  if (!dateValue) return null;

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return getLocalDateKey(parsedDate);
}

function countProjectDocuments(
  project: ProjectSummary,
  documents: DmsDocument[]
): number {
  const projectCount =
    project.documents_count ?? project.document_count ?? undefined;

  if (typeof projectCount === "number") {
    return projectCount;
  }

  return documents.filter(
    (document) => String(document.project_id) === String(project.id)
  ).length;
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-[11px] text-slate-400">{description}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
      <div className="mb-3 text-slate-400">{icon}</div>

      <p className="text-sm font-semibold text-slate-700">{title}</p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function WeeklyUploadsChart({
  rows,
}: {
  rows: WeeklyUpload[];
}) {
  const width = 720;
  const height = 250;
  const leftPadding = 42;
  const rightPadding = 18;
  const topPadding = 24;
  const bottomPadding = 42;

  const chartWidth = width - leftPadding - rightPadding;
  const chartHeight = height - topPadding - bottomPadding;

  const maximumValue = Math.max(...rows.map((row) => row.value), 1);

  const points = rows.map((row, index) => {
    const x =
      leftPadding +
      (index * chartWidth) / Math.max(rows.length - 1, 1);

    const y =
      topPadding +
      chartHeight -
      (row.value / maximumValue) * chartHeight;

    return {
      ...row,
      x,
      y,
    };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const areaPoints = [
    `${points[0]?.x ?? leftPadding},${topPadding + chartHeight}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${
      points[points.length - 1]?.x ?? leftPadding + chartWidth
    },${topPadding + chartHeight}`,
  ].join(" ");

  const gridLines = [0, 1, 2, 3].map((line) => {
    const y = topPadding + (line * chartHeight) / 3;

    return {
      y,
      value: Math.round(maximumValue - (line * maximumValue) / 3),
    };
  });

  return (
    <div className="mt-5 overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[250px] w-full min-w-[620px]"
        role="img"
        aria-label="Document uploads during the last seven days"
      >
        <defs>
          <linearGradient
            id="documentUploadArea"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {gridLines.map((gridLine) => (
          <g key={gridLine.y}>
            <line
              x1={leftPadding}
              y1={gridLine.y}
              x2={width - rightPadding}
              y2={gridLine.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />

            <text
              x={leftPadding - 10}
              y={gridLine.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#94a3b8"
            >
              {gridLine.value}
            </text>
          </g>
        ))}

        <polygon
          points={areaPoints}
          fill="url(#documentUploadArea)"
        />

        <polyline
          points={linePoints}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point) => (
          <g key={point.key}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#ffffff"
              stroke="#2563eb"
              strokeWidth="3"
            />

            <text
              x={point.x}
              y={height - 19}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#64748b"
            >
              {point.day}
            </text>

            <text
              x={point.x}
              y={height - 5}
              textAnchor="middle"
              fontSize="9"
              fill="#94a3b8"
            >
              {point.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function StatusRow({
  label,
  value,
  total,
  dotClass,
}: {
  label: string;
  value: number;
  total: number;
  dotClass: string;
}) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={cn("h-2.5 w-2.5 rounded-full", dotClass)} />

        <span className="truncate text-sm text-slate-600">{label}</span>
      </div>

      <div className="text-right">
        <span className="text-sm font-bold text-slate-900">{value}</span>

        <span className="ml-2 text-xs text-slate-400">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData>({
    user: null,
    documents: [],
    projects: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  async function loadDashboard(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const [user, documents, projects] = await Promise.all([
        getCurrentUser(),
        getDocuments({}),
        getProjects({}),
      ]);

      setData({
        user,
        documents: Array.isArray(documents) ? documents : [],
        projects: Array.isArray(projects) ? projects : [],
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load dashboard information.";

      setAlert({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const weeklyUploads = useMemo<WeeklyUpload[]>(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - (6 - index));

      const key = getLocalDateKey(date);

      const value = data.documents.filter(
        (document) => getDocumentDateKey(document) === key
      ).length;

      return {
        key,
        day: date.toLocaleDateString(undefined, {
          weekday: "short",
        }),
        date: date.toLocaleDateString(undefined, {
          month: "short",
          day: "2-digit",
        }),
        value,
      };
    });
  }, [data.documents]);

  const dashboardStats = useMemo(() => {
    const totalProjects = data.projects.length;
    const totalDocuments = data.documents.length;

    const totalSamples = data.documents.filter(
      isSampleOrLaboratoryDocument
    ).length;

    const totalStudyAreas = countStudyAreas(data.projects);

    const pendingReviews = data.documents.filter(
      isPendingReviewDocument
    ).length;

    const uploadsThisWeek = weeklyUploads.reduce(
      (total, row) => total + row.value,
      0
    );

    const cleanDocuments = data.documents.filter(
      (document) => getDocumentDisplayStatus(document) === "clean"
    ).length;

    const pendingDocuments = data.documents.filter(
      (document) => getDocumentDisplayStatus(document) === "pending"
    ).length;

    const alertDocuments = data.documents.filter(
      (document) => getDocumentDisplayStatus(document) === "alert"
    ).length;

    return {
      totalProjects,
      totalDocuments,
      totalSamples,
      totalStudyAreas,
      pendingReviews,
      uploadsThisWeek,
      cleanDocuments,
      pendingDocuments,
      alertDocuments,
    };
  }, [data.documents, data.projects, weeklyUploads]);

  const recentDocuments = useMemo(() => {
    return sortByDate(data.documents).slice(0, 5);
  }, [data.documents]);

  const recentProjects = useMemo(() => {
    return sortByDate(data.projects)
      .slice(0, 4)
      .map((project) => ({
        project,
        documentCount: countProjectDocuments(project, data.documents),
      }));
  }, [data.projects, data.documents]);

  function submitSearch(): void {
    const query = searchText.trim();

    if (!query) {
      navigate("/search");
      return;
    }

    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  const totalForStatus = Math.max(data.documents.length, 1);

  const cleanWidth =
    (dashboardStats.cleanDocuments / totalForStatus) * 100;

  const pendingWidth =
    (dashboardStats.pendingDocuments / totalForStatus) * 100;

  const alertWidth =
    (dashboardStats.alertDocuments / totalForStatus) * 100;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex min-h-[78px] shrink-0 items-center justify-between gap-6 border-b border-slate-200 bg-white px-6 lg:px-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-normal text-slate-500">
                {getGreeting()},
              </h1>

              <span className="truncate text-xl font-bold text-slate-900">
                {getUserName(data.user)}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Here is your document management overview
            </p>
          </div>

          <div className="hidden max-w-md flex-1 xl:block">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitSearch();
                  }
                }}
                placeholder="Search documents..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-20 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <button
                type="button"
                onClick={submitSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 md:flex">
              <CalendarDays size={15} />
              {formatCurrentDate()}
            </div>

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Notifications"
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
                {getInitials(getUserName(data.user))}
              </div>

              <div className="hidden text-left lg:block">
                <p className="max-w-[150px] truncate text-sm font-semibold text-slate-800">
                  {getUserName(data.user)}
                </p>

                <p className="mt-0.5 max-w-[150px] truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  {getRoleName(data.user)}
                </p>
              </div>

              <ChevronDown
                size={14}
                className="hidden text-slate-400 lg:block"
              />
            </button>
          </div>
        </header>

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Dashboard Overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Important information from your document database
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCcw size={16} />
                )}

                Refresh
              </button>
            </div>

            {alert && (
              <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <MetricCard
                icon={<FolderOpen size={21} />}
                label="Total Projects"
                value={loading ? "..." : dashboardStats.totalProjects}
                description="Projects registered in the system"
              />

              <MetricCard
                icon={<FileText size={21} />}
                label="Total Documents"
                value={loading ? "..." : dashboardStats.totalDocuments}
                description="Documents currently registered"
              />

              <MetricCard
                icon={<FlaskConical size={21} />}
                label="Total Samples"
                value={loading ? "..." : dashboardStats.totalSamples}
                description="Sample and laboratory documents"
              />

              <MetricCard
                icon={<MapPinned size={21} />}
                label="Total Study Areas"
                value={loading ? "..." : dashboardStats.totalStudyAreas}
                description="Unique project locations"
              />

              <MetricCard
                icon={<Clock3 size={21} />}
                label="Pending Reviews"
                value={loading ? "..." : dashboardStats.pendingReviews}
                description="Documents waiting for action"
              />
            </section>

            <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Document Upload Activity
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Documents added during the last seven days
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 self-start rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    {dashboardStats.uploadsThisWeek} uploads
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex h-[270px] items-center justify-center gap-3 text-sm text-slate-400">
                      <Loader2 size={19} className="animate-spin" />
                      Loading chart...
                    </div>
                  ) : (
                    <WeeklyUploadsChart rows={weeklyUploads} />
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Status Summary
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Current document condition
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <ShieldCheck size={20} />
                  </div>
                </div>

                <div className="mt-7 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white">
                  <p className="text-xs font-medium text-blue-100">
                    Clean Documents
                  </p>

                  <p className="mt-2 text-4xl font-bold">
                    {loading ? "..." : dashboardStats.cleanDocuments}
                  </p>

                  <p className="mt-2 text-xs text-blue-100">
                    Documents currently considered safe
                  </p>
                </div>

                <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                  {cleanWidth > 0 && (
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${cleanWidth}%` }}
                    />
                  )}

                  {pendingWidth > 0 && (
                    <div
                      className="bg-amber-400"
                      style={{ width: `${pendingWidth}%` }}
                    />
                  )}

                  {alertWidth > 0 && (
                    <div
                      className="bg-red-500"
                      style={{ width: `${alertWidth}%` }}
                    />
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <StatusRow
                    label="Clean"
                    value={dashboardStats.cleanDocuments}
                    total={data.documents.length}
                    dotClass="bg-emerald-500"
                  />

                  <StatusRow
                    label="Pending"
                    value={dashboardStats.pendingDocuments}
                    total={data.documents.length}
                    dotClass="bg-amber-400"
                  />

                  <StatusRow
                    label="Needs Review"
                    value={dashboardStats.alertDocuments}
                    total={data.documents.length}
                    dotClass="bg-red-500"
                  />
                </div>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40 xl:col-span-8">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Recent Documents
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Five most recently updated documents
                    </p>
                  </div>

                  <Link
                    to="/alldocuments"
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    View all
                  </Link>
                </div>

                {loading ? (
                  <div className="flex min-h-[280px] items-center justify-center gap-3 text-sm text-slate-400">
                    <Loader2 size={19} className="animate-spin" />
                    Loading documents...
                  </div>
                ) : recentDocuments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Document
                          </th>

                          <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Project
                          </th>

                          <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Status
                          </th>

                          <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Updated
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentDocuments.map((document) => (
                          <tr
                            key={String(document.id)}
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                  <FileText size={18} />
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-[280px] truncate text-sm font-semibold text-slate-800">
                                    {getDocumentTitle(document)}
                                  </p>

                                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    {getDocumentType(document)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="max-w-[180px] truncate text-sm text-slate-600">
                                {getProjectName(document)}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={cn(
                                  "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold",
                                  getDocumentStatusClass(document)
                                )}
                              >
                                {getDocumentStatusLabel(document)}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock3 size={13} />

                                {formatRelativeTime(
                                  document.updated_at ||
                                    document.created_at
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-5">
                    <EmptyState
                      icon={<FileText size={30} />}
                      title="No documents found"
                      description="Uploaded documents will appear here."
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Recent Projects
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Latest project workspaces
                    </p>
                  </div>

                  <Link
                    to="/Projects"
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    View all
                  </Link>
                </div>

                <div className="mt-5 space-y-2">
                  {loading ? (
                    <div className="flex min-h-[280px] items-center justify-center gap-3 text-sm text-slate-400">
                      <Loader2 size={19} className="animate-spin" />
                      Loading projects...
                    </div>
                  ) : recentProjects.length > 0 ? (
                    recentProjects.map(({ project, documentCount }) => (
                      <Link
                        key={String(project.id)}
                        to={`/Projects/${project.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-50"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                          {(project.name || "P")
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {project.name || "Unnamed Project"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {documentCount} document
                            {documentCount === 1 ? "" : "s"}
                          </p>
                        </div>

                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
                            getProjectStatusClass(project.status)
                          )}
                        >
                          {getReadableStatus(project.status)}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <EmptyState
                      icon={<FolderOpen size={30} />}
                      title="No projects found"
                      description="Projects created in the system will appear here."
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}