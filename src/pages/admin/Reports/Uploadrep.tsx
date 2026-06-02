import { useEffect, useMemo, useState } from "react";
import {
  UploadCloud,
  MoreVertical,
  Download,
  Calendar,
  Monitor,
  Bell,
  ChevronDown,
  Loader2,
  RefreshCcw,
  FileText,
  ShieldCheck,
  Search,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList,
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

type DateRangeOption = {
  label: string;
  days: number;
};

type UploadTrendPoint = {
  day: string;
  total: number;
  projected: number;
};

type ContributorPoint = {
  name: string;
  uploads: number;
};

type IngestionRow = {
  id: string;
  source: string;
  uploadDate: string;
  uploadTime: string;
  count: string;
  status: string;
  statusTone: "success" | "warning" | "danger" | "info";
  documentName: string;
  projectName: string;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

const dateOptions: DateRangeOption[] = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last Quarter", days: 90 },
  { label: "Last 12 Months", days: 365 },
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

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
  });
}

function formatDatePart(date?: string | null): string {
  if (!date) return "Unknown";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown";

  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (parsed.toDateString() === today.toDateString()) return "Today";
  if (parsed.toDateString() === yesterday.toDateString()) return "Yesterday";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatTimePart(date?: string | null): string {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
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

function getUserName(user: UserSummary | null): string {
  return user?.name || "DMS User";
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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

function getProjectName(document: DmsDocument): string {
  return document.project?.name || "No Project";
}

function getUploaderName(document: DmsDocument): string {
  return document.uploader?.name || "Unknown";
}

function getUploadSource(document: DmsDocument): string {
  const rawDocument = document as unknown as Record<string, unknown>;

  const source =
    rawDocument.upload_source ||
    rawDocument.source ||
    rawDocument.input_mode ||
    rawDocument.channel;

  if (typeof source === "string" && source.trim()) {
    return getReadableStatus(source);
  }

  return "Web Upload";
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
    ["infected", "rejected", "blocked"].includes(toLower(document.status)) ||
    ["infected", "failed"].includes(toLower(document.scan_status)) ||
    ["unsafe", "failed"].includes(toLower(document.sandbox_status))
  );
}

function getIngestionStatus(document: DmsDocument): {
  label: string;
  tone: IngestionRow["statusTone"];
} {
  if (isBlocked(document)) {
    return {
      label: "Security Blocked",
      tone: "danger",
    };
  }

  if (!isScanClean(document)) {
    return {
      label: "Pending Scan",
      tone: "warning",
    };
  }

  if (!isSandboxSafe(document)) {
    return {
      label: "Pending Sandbox",
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
    label: "Success",
    tone: "success",
  };
}

function buildUploadTrendData(
  documents: DmsDocument[],
  days: number
): UploadTrendPoint[] {
  const interval = days <= 30 ? 5 : days <= 90 ? 15 : 60;
  const rows: UploadTrendPoint[] = [];

  for (let day = days - 1; day >= 0; day -= interval) {
    const start = getDateDaysAgo(day);
    const end = new Date(start);
    end.setDate(start.getDate() + interval);
    end.setHours(23, 59, 59, 999);

    const total = documents.filter((document) => {
      if (!document.created_at) return false;

      const createdAt = new Date(document.created_at);

      if (Number.isNaN(createdAt.getTime())) return false;

      return createdAt >= start && createdAt <= end;
    }).length;

    rows.push({
      day: formatShortDate(start),
      total,
      projected: Math.max(total, Math.round(total * 1.15)),
    });
  }

  return rows.length > 0 ? rows : [{ day: "Today", total: 0, projected: 0 }];
}

function buildContributorData(documents: DmsDocument[]): ContributorPoint[] {
  const contributors = new Map<string, number>();

  documents.forEach((document) => {
    const name = getUploaderName(document);
    contributors.set(name, (contributors.get(name) || 0) + 1);
  });

  return Array.from(contributors.entries())
    .map(([name, uploads]) => ({
      name,
      uploads,
    }))
    .sort((first, second) => second.uploads - first.uploads)
    .slice(0, 6);
}

function buildIngestionRows(documents: DmsDocument[]): IngestionRow[] {
  return [...documents]
    .sort((first, second) => {
      const firstDate = new Date(first.created_at || first.updated_at || 0).getTime();
      const secondDate = new Date(
        second.created_at || second.updated_at || 0
      ).getTime();

      return secondDate - firstDate;
    })
    .map((document) => {
      const status = getIngestionStatus(document);

      return {
        id: `#DOC-${document.id}`,
        source: getUploadSource(document),
        uploadDate: formatDatePart(document.created_at || document.updated_at),
        uploadTime: formatTimePart(document.created_at || document.updated_at),
        count: "1 File",
        status: status.label,
        statusTone: status.tone,
        documentName: getDocumentTitle(document),
        projectName: getProjectName(document),
      };
    });
}

function filterByProject(document: DmsDocument, selectedProject: string): boolean {
  if (selectedProject === "All Projects") return true;

  return getProjectName(document) === selectedProject;
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

function StatusPill({ status, tone }: { status: string; tone: IngestionRow["statusTone"] }) {
  const toneClass = {
    success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    danger: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  }[tone];

  const dotClass = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-blue-500",
  }[tone];

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {status}
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string;
  value: number;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#1e2333] bg-[#161b25] p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8e95a3]">
          {title}
        </p>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5b58f2]/10 text-[#8e95a3]">
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold text-white">{formatNumber(value)}</p>
      <p className="mt-1 text-xs text-[#8e95a3]">{helper}</p>
    </div>
  );
}

function Uploadrep() {
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [user, setUser] = useState<UserSummary | null>(null);
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [project, setProject] = useState("All Projects");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const selectedRange =
    dateOptions.find((option) => option.label === dateRange) || dateOptions[1];

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
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load upload and activity report data.",
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
        .map((item) => item.name)
        .filter((name): name is string => Boolean(name)),
    ],
    [projects]
  );

  const filteredDocuments = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return documents.filter((document) => {
      const dateValue = document.created_at || document.updated_at;
      const matchesDate = isWithinRange(dateValue, selectedRange.days);
      const matchesProject = filterByProject(document, project);

      const searchable = [
        getDocumentTitle(document),
        getProjectName(document),
        getUploaderName(document),
        getUploadSource(document),
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
        searchTerm.length === 0 || searchable.includes(searchTerm);

      return matchesDate && matchesProject && matchesSearch;
    });
  }, [documents, project, search, selectedRange.days]);

  const lineData = useMemo(
    () => buildUploadTrendData(filteredDocuments, selectedRange.days),
    [filteredDocuments, selectedRange.days]
  );

  const barData = useMemo(
    () => buildContributorData(filteredDocuments),
    [filteredDocuments]
  );

  const tableData = useMemo(
    () => buildIngestionRows(filteredDocuments).slice(0, 10),
    [filteredDocuments]
  );

  const totalUploads = filteredDocuments.length;
  const successfulUploads = filteredDocuments.filter(
    (document) => getIngestionStatus(document).label === "Success"
  ).length;
  const pendingPipeline = filteredDocuments.filter(
    (document) => getIngestionStatus(document).label !== "Success"
  ).length;

  function exportReport(): void {
    exportJson(
      `upload-activity-report-${new Date().toISOString().slice(0, 10)}.json`,
      {
        generated_at: new Date().toISOString(),
        generated_by: getUserName(user),
        date_range: dateRange,
        project,
        total_uploads: totalUploads,
        successful_uploads: successfulUploads,
        pending_pipeline: pendingPipeline,
        top_contributors: barData,
        recent_ingestions: tableData,
      }
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0e14] font-sans text-white">
      <AdminSidebar />

      <main className="flex h-full flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#1e2333] bg-[#11141e] px-8">
          <div className="flex items-center text-sm">
            <span className="mr-4 font-semibold text-white">Reports</span>
            <UploadCloud className="mr-2 h-4 w-4 text-[#8e95a3]" />
            <span className="text-[#8e95a3]">Upload & Activity Report</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2e364f] bg-[#1a1f2c] px-3 py-2 text-xs text-white transition-colors hover:bg-[#232a3b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </button>

            <button className="relative text-[#8e95a3] transition-colors hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-[#11141e] bg-red-500" />
            </button>

            <div className="flex cursor-pointer items-center gap-3">
              <div className="flex flex-col justify-center text-right">
                <span className="text-sm font-medium leading-tight">
                  {getUserName(user)}
                </span>
                <span className="text-xs leading-tight text-[#8e95a3]">
                  {getRoleName(user)}
                </span>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2e364f] bg-[#5b58f2]/20 text-xs font-semibold text-white">
                {getInitials(getUserName(user))}
              </div>

              <ChevronDown className="h-4 w-4 text-[#8e95a3]" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#0b0e14] p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="mb-1 text-2xl font-bold text-white">
                  Upload & Activity Report
                </h1>
                <p className="text-sm text-[#8e95a3]">
                  Real report from documents database: uploads, contributors,
                  processing status, scan, sandbox, OCR, and activity.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={dateRange}
                  onChange={(event) => setDateRange(event.target.value)}
                  className="rounded-lg border border-[#2e364f] bg-[#1a1f2c] px-4 py-2 text-sm text-white outline-none transition-colors hover:bg-[#232a3b]"
                >
                  {dateOptions.map((option) => (
                    <option key={option.label} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={project}
                  onChange={(event) => setProject(event.target.value)}
                  className="rounded-lg border border-[#2e364f] bg-[#1a1f2c] px-4 py-2 text-sm text-white outline-none transition-colors hover:bg-[#232a3b]"
                >
                  {projectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={exportReport}
                  className="flex items-center gap-2 rounded-lg bg-[#5b58f2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f4ce3]"
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>

            {alert && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  alert.type === "error"
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                }`}
              >
                {alert.message}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard
                title="Uploads in Range"
                value={totalUploads}
                helper={`${formatNumber(documents.length)} total documents loaded`}
                icon={<UploadCloud className="h-4 w-4" />}
              />
              <MetricCard
                title="Successful Pipeline"
                value={successfulUploads}
                helper="Clean + sandbox safe + OCR extracted"
                icon={<ShieldCheck className="h-4 w-4" />}
              />
              <MetricCard
                title="Pending Processing"
                value={pendingPipeline}
                helper="Waiting for scan, sandbox, OCR, or security review"
                icon={<FileText className="h-4 w-4" />}
              />
            </div>

            {loading ? (
              <div className="rounded-xl border border-[#1e2333] bg-[#161b25] p-12 text-center text-sm text-[#8e95a3]">
                <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
                Loading upload and activity report from database...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="rounded-xl border border-[#1e2333] bg-[#161b25] p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <h2 className="mb-1 text-base font-semibold text-white">
                          Upload Volume Trends
                        </h2>
                        <p className="text-xs text-[#8e95a3]">
                          Real document uploads over selected date range
                        </p>
                      </div>

                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#5b58f2]" />
                          <span className="text-[#8e95a3]">Total Files</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full border border-dashed border-[#5b58f2]" />
                          <span className="text-[#8e95a3]">Projected</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={lineData}
                          margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorTotal"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#5b58f2"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#5b58f2"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#1e2333"
                          />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#8e95a3", fontSize: 11 }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#8e95a3", fontSize: 11 }}
                            hide
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1f2c",
                              border: "1px solid #2e364f",
                              borderRadius: "8px",
                            }}
                            itemStyle={{ color: "#fff" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#5b58f2"
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                            strokeWidth={3}
                            activeDot={{
                              r: 6,
                              fill: "#5b58f2",
                              stroke: "#1a1f2c",
                              strokeWidth: 2,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex flex-col rounded-xl border border-[#1e2333] bg-[#161b25] p-6 shadow-sm">
                    <div className="mb-6">
                      <h2 className="mb-1 text-base font-semibold text-white">
                        Top Contributors
                      </h2>
                      <p className="text-xs text-[#8e95a3]">
                        Highest uploads by user
                      </p>
                    </div>

                    <div className="mt-auto min-h-[250px] w-full flex-1">
                      {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={barData}
                            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                          >
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#8e95a3", fontSize: 11 }}
                              dy={10}
                            />
                            <Tooltip cursor={{ fill: "transparent" }} />
                            <Bar dataKey="uploads" radius={[4, 4, 4, 4]} barSize={32}>
                              {barData.map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    index === 0 || index === barData.length - 1
                                      ? "#6366f1"
                                      : "#313650"
                                  }
                                />
                              ))}
                              <LabelList
                                dataKey="uploads"
                                position="top"
                                fill="#fff"
                                fontSize={11}
                                fontWeight="bold"
                                dy={-5}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#8e95a3]">
                          No contributor data available.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#1e2333] bg-[#161b25] shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-[#1e2333] bg-[#181d2a] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-semibold text-white">
                        Recent Ingestions
                      </h2>
                      <span className="rounded border border-[#2e364f] bg-[#1e2333] px-2 py-0.5 text-[10px] font-medium text-[#5b58f2]">
                        Live
                      </span>
                    </div>

                    <label className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e95a3]" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search uploads..."
                        className="w-full rounded-lg border border-[#2e364f] bg-[#11141e] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#8e95a3] focus:border-[#5b58f2]"
                      />
                    </label>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#1e2333] bg-[#11141e] text-[10px] font-semibold uppercase text-[#8e95a3]">
                        <tr>
                          <th className="w-48 px-6 py-4">Batch ID</th>
                          <th className="px-6 py-4">Document</th>
                          <th className="px-6 py-4">Source</th>
                          <th className="px-6 py-4">Upload Time</th>
                          <th className="px-6 py-4">File Count</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="w-24 px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2333]">
                        {tableData.length > 0 ? (
                          tableData.map((row) => (
                            <tr
                              key={row.id}
                              className="transition-colors hover:bg-[#1a1f2c]"
                            >
                              <td className="px-6 py-4">
                                <span className="rounded border border-[#2e364f] bg-[#1e2333] px-2.5 py-1 font-mono text-xs text-[#a1a8b6]">
                                  {row.id}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <div>
                                  <p className="max-w-xs truncate text-sm font-medium text-white">
                                    {row.documentName}
                                  </p>
                                  <p className="text-xs text-[#8e95a3]">
                                    {row.projectName}
                                  </p>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-white">
                                  <Monitor className="h-4 w-4 text-[#8e95a3]" />
                                  <span className="text-sm">{row.source}</span>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex flex-col text-sm">
                                  <span className="text-white">{row.uploadDate}</span>
                                  <span className="text-xs text-[#8e95a3]">
                                    {row.uploadTime}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-sm text-white">
                                {row.count}
                              </td>

                              <td className="px-6 py-4">
                                <StatusPill status={row.status} tone={row.statusTone} />
                              </td>

                              <td className="px-6 py-4 text-right">
                                <button className="rounded p-1 text-[#8e95a3] transition-colors hover:bg-[#2e364f] hover:text-white">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-6 py-10 text-center text-sm text-[#8e95a3]"
                            >
                              No uploads found for this filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Uploadrep;