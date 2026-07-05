import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { NavLink } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Database,
  Download,
  FileText,
  FilterX,
  FlaskConical,
  FolderOpen,
  Loader2,
  LockKeyhole,
  MapPin,
  RefreshCcw,
  ScanSearch,
  Search,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
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

import { apiRequest } from "../../../services/dmsApi";

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

type ReportFilters = {
  province: string;
  district: string;
  sector: string;
  project_id: string;
  document_type: string;
  record_type: string;
  status: string;
  search: string;
  clean_only: boolean;
};

type ReportSummary = {
  total_documents?: number;
  clean_documents?: number;
  clean_export_ready_documents?: number;
  quarantined_documents?: number;
  archived_documents?: number;
  unsafe_documents?: number;
  failed_scan_documents?: number;
  blocked_documents?: number;
  total_projects?: number;
  active_projects?: number;
  study_areas?: number;
  samples?: number;
  geological_records?: number;
  soil_records?: number;
  soil_geological_records?: number;
  soil_sample_records?: number;
  recent_geo_records?: number;
  uploads_in_range?: number;
  updates_in_range?: number;
  storage_used_bytes?: number;
};

type ReportNotification = {
  id: string;
  level: "success" | "warning" | "danger" | "info";
  title: string;
  message: string;
  count?: number;
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

type GeologicalRecord = {
  id: number;
  record_type?: string | null;
  site_name?: string | null;
  survey_name?: string | null;
  geologist_name?: string | null;
  province?: string | null;
  district?: string | null;
  sector?: string | null;
  rock_type?: string | null;
  mineral_name?: string | null;
  borehole_code?: string | null;
  created_at?: string | null;
  document?: {
    id?: number;
    document_code?: string | null;
    title?: string | null;
    status?: string | null;
    scan_status?: string | null;
    sandbox_status?: string | null;
    project?: {
      id?: number;
      name?: string | null;
      code?: string | null;
    } | null;
  } | null;
};

type StudyArea = {
  id: number;
  name?: string | null;
  code?: string | null;
  project_name?: string | null;
  province?: string | null;
  district?: string | null;
  sector?: string | null;
  status?: string | null;
};

type SampleRecord = {
  id: number;
  sample_code?: string | null;
  sample_name?: string | null;
  sample_type?: string | null;
  material?: string | null;
  project_name?: string | null;
  district?: string | null;
  sector?: string | null;
  status?: string | null;
};

type AdvancedReportData = {
  user: UserSummary | null;
  filters?: Record<string, unknown>;
  summary: ReportSummary;
  projects: ProjectSummary[];
  documents: DmsDocument[];
  geological_records: GeologicalRecord[];
  study_areas: StudyArea[];
  samples: SampleRecord[];
  notifications: ReportNotification[];
  activity_chart: ActivityChartRow[];
  document_types: DocumentTypeRow[];
};

const emptyFilters: ReportFilters = {
  province: "",
  district: "",
  sector: "",
  project_id: "",
  document_type: "",
  record_type: "",
  status: "",
  search: "",
  clean_only: true,
};

const emptyReportData: AdvancedReportData = {
  user: null,
  summary: {},
  projects: [],
  documents: [],
  geological_records: [],
  study_areas: [],
  samples: [],
  notifications: [],
  activity_chart: [],
  document_types: [],
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
    icon: FolderOpen,
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

function formatNumber(value?: number | null): string {
  return new Intl.NumberFormat().format(Number(value || 0));
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

    return roleObject.name || getReadableStatus(roleObject.slug);
  }

  return "Reports User";
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

function buildQueryParams(rangeDays: DateRange, filters: ReportFilters): string {
  const params = new URLSearchParams();

  params.set("date_range", rangeDays);

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      if (value) params.set(key, "1");
      return;
    }

    if (String(value || "").trim()) {
      params.set(key, String(value).trim());
    }
  });

  return params.toString();
}

function getProjectLabel(project: ProjectSummary): string {
  const projectObject = project as ProjectSummary & {
    code?: string | null;
    title?: string | null;
    project_name?: string | null;
  };

  const name =
    projectObject.name ||
    projectObject.title ||
    projectObject.project_name ||
    `Project ${projectObject.id}`;

  return projectObject.code ? `${name} (${projectObject.code})` : name;
}

function normalizeReportData(payload: AdvancedReportData): AdvancedReportData {
  return {
    ...emptyReportData,
    ...payload,
    summary: payload.summary || {},
    projects: Array.isArray(payload.projects) ? payload.projects : [],
    documents: Array.isArray(payload.documents) ? payload.documents : [],
    geological_records: Array.isArray(payload.geological_records)
      ? payload.geological_records
      : [],
    study_areas: Array.isArray(payload.study_areas) ? payload.study_areas : [],
    samples: Array.isArray(payload.samples) ? payload.samples : [],
    notifications: Array.isArray(payload.notifications)
      ? payload.notifications
      : [],
    activity_chart: Array.isArray(payload.activity_chart)
      ? payload.activity_chart
      : [],
    document_types: Array.isArray(payload.document_types)
      ? payload.document_types
      : [],
  };
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

          <ChevronDown size={14} className="hidden text-slate-400 lg:block" />
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
                  "inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition",
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
}: {
  title: string;
  value: string;
  description: string;
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

          <p className="mt-2 text-[11px] text-slate-400">{description}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function FilterInput({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      {children}
    </label>
  );
}

function inputClass(): string {
  return "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50";
}

function NotificationCard({
  notification,
}: {
  notification: ReportNotification;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        styles[notification.level] || styles.info
      )}
    >
      <div className="flex items-start gap-3">
        <Bell size={18} className="mt-0.5 shrink-0" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{notification.title}</p>

          <p className="mt-1 text-xs leading-5 opacity-90">
            {notification.message}
          </p>
        </div>

        {typeof notification.count === "number" && notification.count > 0 && (
          <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold">
            {notification.count}
          </span>
        )}
      </div>
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
            className="flex items-center justify-between gap-5 text-xs"
          >
            <span className="text-slate-500">
              {item.name === "updates" ? "Updates" : "Uploads"}
            </span>

            <span className="font-bold text-slate-900">{item.value ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsOverview() {
  const [data, setData] = useState<AdvancedReportData>(emptyReportData);
  const [rangeDays, setRangeDays] = useState<DateRange>("30");
  const [filters, setFilters] = useState<ReportFilters>(emptyFilters);
  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const queryParams = useMemo(
    () => buildQueryParams(rangeDays, filters),
    [rangeDays, filters]
  );

  async function loadReport(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const response = await apiRequest(
        `/reports/advanced-overview?${queryParams}`,
        {
          method: "GET",
        }
      );

      const payload = unwrapData<AdvancedReportData>(
        response,
        emptyReportData
      );

      setData(normalizeReportData(payload));
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
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  function clearFilters(): void {
    setFilters(emptyFilters);
    setRangeDays("30");
  }

  async function exportCleanReport(): Promise<void> {
    try {
      setAlert(null);

      const exportFilters = {
        ...filters,
        clean_only: true,
      };

      const exportQuery = buildQueryParams(rangeDays, exportFilters);

      const response = await apiRequest(
        `/reports/export-preview?${exportQuery}`,
        {
          method: "GET",
        }
      );

      const payload = unwrapData<AdvancedReportData>(
        response,
        emptyReportData
      );

      const normalized = normalizeReportData(payload);

      const exportPayload = {
        generated_at: new Date().toISOString(),
        note: "Export generated using clean filter before export.",
        filters: normalized.filters,
        summary: normalized.summary,
        documents: normalized.documents,
        geological_records: normalized.geological_records,
        study_areas: normalized.study_areas,
        samples: normalized.samples,
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `migeco-clean-report-${getLocalDateKey(
        new Date()
      )}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setAlert({
        type: "success",
        message: "Clean filtered report exported successfully.",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to export clean report.",
      });
    }
  }

  const summary = data.summary;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header user={data.user} loading={loading} onRefresh={loadReport} />

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] space-y-5 px-5 py-6 lg:px-8">
            <ReportTabs />

            {alert && (
              <div
                className={cn(
                  "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
                  alert.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : alert.type === "info"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-red-200 bg-red-50 text-red-700"
                )}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <span>{alert.message}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setAlert(null)}
                  className="text-lg leading-none opacity-70"
                  aria-label="Close alert"
                >
                  ×
                </button>
              </div>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Advanced Report Builder
                  </h2>

                  <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                    Filter reports by region, project, soil records, geo
                    documents, clean security status, and field survey records
                    before export.
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
                    onClick={clearFilters}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <FilterX size={16} />
                    Clear filters
                  </button>

                  <button
                    type="button"
                    onClick={exportCleanReport}
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download size={16} />
                    Export clean report
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FilterInput label="Province / City">
                  <input
                    value={filters.province}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        province: event.target.value,
                      })
                    }
                    placeholder="Example: Kigali City"
                    className={inputClass()}
                  />
                </FilterInput>

                <FilterInput label="District">
                  <input
                    value={filters.district}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        district: event.target.value,
                      })
                    }
                    placeholder="Example: Gasabo"
                    className={inputClass()}
                  />
                </FilterInput>

                <FilterInput label="Sector">
                  <input
                    value={filters.sector}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        sector: event.target.value,
                      })
                    }
                    placeholder="Example: Kimironko"
                    className={inputClass()}
                  />
                </FilterInput>

                <FilterInput label="Project">
                  <select
                    value={filters.project_id}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        project_id: event.target.value,
                      })
                    }
                    className={inputClass()}
                  >
                    <option value="">All projects</option>
                    {data.projects.map((project) => (
                      <option key={project.id} value={String(project.id)}>
                        {getProjectLabel(project)}
                      </option>
                    ))}
                  </select>
                </FilterInput>

                <FilterInput label="Document Type">
                  <select
                    value={filters.document_type}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        document_type: event.target.value,
                      })
                    }
                    className={inputClass()}
                  >
                    <option value="">All types</option>
                    <option value="geological_report">
                      Geological Report
                    </option>
                    <option value="technical_drawing">
                      Technical Drawing
                    </option>
                    <option value="survey_map">Survey Map</option>
                    <option value="construction_record">
                      Construction Record
                    </option>
                    <option value="spreadsheet">Spreadsheet</option>
                    <option value="image">Image</option>
                    <option value="other">Other</option>
                  </select>
                </FilterInput>

                <FilterInput label="Geo Record Type">
                  <select
                    value={filters.record_type}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        record_type: event.target.value,
                      })
                    }
                    className={inputClass()}
                  >
                    <option value="">All geo records</option>
                    <option value="geological_report">
                      Geological Report
                    </option>
                    <option value="geological_map">Geological Map</option>
                    <option value="borehole">Borehole</option>
                    <option value="rock_sample">Rock Sample</option>
                    <option value="soil_profile">Soil Profile</option>
                    <option value="laboratory_result">
                      Laboratory Result
                    </option>
                    <option value="field_note">Field Note</option>
                    <option value="groundwater">Groundwater</option>
                  </select>
                </FilterInput>

                <FilterInput label="Document Status">
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        status: event.target.value,
                      })
                    }
                    className={inputClass()}
                  >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="quarantined">Quarantined</option>
                    <option value="archived">Archived</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </FilterInput>

                <FilterInput label="Search">
                  <div className="relative">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    />

                    <input
                      value={filters.search}
                      onChange={(event) =>
                        setFilters({
                          ...filters,
                          search: event.target.value,
                        })
                      }
                      placeholder="Search report..."
                      className={cn(inputClass(), "pl-9")}
                    />
                  </div>
                </FilterInput>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                  <input
                    type="checkbox"
                    checked={filters.clean_only}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        clean_only: event.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-emerald-300"
                  />
                  Clean filter before export
                </label>

                <span className="text-xs text-slate-400">
                  Recommended: keep clean filter enabled when exporting official
                  reports.
                </span>
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
                    title="Clean Export Ready"
                    value={formatNumber(
                      summary.clean_export_ready_documents
                    )}
                    description="active, clean and safe records"
                    icon={ShieldCheck}
                  />

                  <MetricCard
                    title="Geo Records"
                    value={formatNumber(summary.geological_records)}
                    description="field findings and geo metadata"
                    icon={MapPin}
                  />

                  <MetricCard
                    title="Soil Records"
                    value={formatNumber(summary.soil_records)}
                    description="soil geo records and samples"
                    icon={FlaskConical}
                  />

                  <MetricCard
                    title="Storage Used"
                    value={formatBytes(summary.storage_used_bytes)}
                    description="filtered uploaded file size"
                    icon={Database}
                  />
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="Total Documents"
                    value={formatNumber(summary.total_documents)}
                    description="documents matching filters"
                    icon={FileText}
                  />

                  <MetricCard
                    title="Uploads"
                    value={formatNumber(summary.uploads_in_range)}
                    description={`in last ${rangeDays} days`}
                    icon={UploadCloud}
                  />

                  <MetricCard
                    title="Study Areas"
                    value={formatNumber(summary.study_areas)}
                    description="field survey locations"
                    icon={MapPin}
                  />

                  <MetricCard
                    title="Blocked / Unsafe"
                    value={formatNumber(summary.blocked_documents)}
                    description="needs review before use"
                    icon={ShieldAlert}
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
                          Upload and update activity for selected filters
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={data.activity_chart}
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
                            tick={{ fill: "#94a3b8", fontSize: 10 }}
                            dy={8}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                            tick={{ fill: "#94a3b8", fontSize: 10 }}
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
                    <h3 className="text-sm font-bold text-slate-900">
                      Notifications
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Report alerts and required actions
                    </p>

                    <div className="mt-4 space-y-3">
                      {data.notifications.map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-7">
                    <h3 className="text-sm font-bold text-slate-900">
                      Geo Documents by Region
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Documents matching selected province, district, sector or
                      project
                    </p>

                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                          <tr>
                            <th className="px-4 py-3">Document</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Scan</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                          {data.documents.slice(0, 8).map((document) => (
                            <tr key={document.id}>
                              <td className="px-4 py-3">
                                <p className="font-semibold text-slate-800">
                                  {document.title || "Untitled document"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {document.document_code ||
                                    document.original_file_name ||
                                    "No code"}
                                </p>
                              </td>

                              <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                {getReadableStatus(document.document_type)}
                              </td>

                              <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                {getReadableStatus(document.status)}
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-1 text-[11px] font-bold",
                                    toLower(document.scan_status) === "clean"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50 text-amber-700"
                                  )}
                                >
                                  {getReadableStatus(document.scan_status)}
                                </span>
                              </td>
                            </tr>
                          ))}

                          {data.documents.length === 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-10 text-center text-sm text-slate-400"
                              >
                                No documents found for selected filters.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-5">
                    <h3 className="text-sm font-bold text-slate-900">
                      Soil & Geological Records
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Soil, borehole, rock sample and field survey findings
                    </p>

                    <div className="mt-4 space-y-3">
                      {data.geological_records.slice(0, 7).map((record) => (
                        <div
                          key={record.id}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-800">
                                {record.site_name ||
                                  record.survey_name ||
                                  record.document?.title ||
                                  "Geological record"}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {getReadableStatus(record.record_type)} ·{" "}
                                {record.district || "No district"} ·{" "}
                                {record.sector || "No sector"}
                              </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                              Geo
                            </span>
                          </div>
                        </div>
                      ))}

                      {data.geological_records.length === 0 && (
                        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
                          <MapPin size={24} className="text-slate-300" />

                          <p className="mt-3 text-sm font-semibold text-slate-600">
                            No geo records found
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            A geologist should upload findings after field
                            survey.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-6">
                    <h3 className="text-sm font-bold text-slate-900">
                      Document Types
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Most common file classifications in selected report
                    </p>

                    <div className="mt-5 space-y-4">
                      {data.document_types.map((row) => (
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
                              style={{ width: `${row.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}

                      {data.document_types.length === 0 && (
                        <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                          No document type data.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-6">
                    <h3 className="text-sm font-bold text-slate-900">
                      Processing Health
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Clean scan, encryption, text readiness and AI workflow
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <MetricCard
                        title="Clean Documents"
                        value={formatNumber(summary.clean_documents)}
                        description="passed antivirus scan"
                        icon={ShieldCheck}
                      />

                      <MetricCard
                        title="Unsafe Documents"
                        value={formatNumber(summary.unsafe_documents)}
                        description="failed sandbox safety"
                        icon={ShieldAlert}
                      />

                      <MetricCard
                        title="Ready for Export"
                        value={formatNumber(
                          summary.clean_export_ready_documents
                        )}
                        description="official clean filter"
                        icon={Download}
                      />

                      <MetricCard
                        title="Recent Geo Records"
                        value={formatNumber(summary.recent_geo_records)}
                        description={`in last ${rangeDays} days`}
                        icon={BrainCircuit}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                        <ScanSearch
                          size={18}
                          className="mx-auto text-blue-600"
                        />
                        <p className="mt-2 text-xs font-bold text-slate-700">
                          Text Ready
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                        <LockKeyhole
                          size={18}
                          className="mx-auto text-blue-600"
                        />
                        <p className="mt-2 text-xs font-bold text-slate-700">
                          Encrypted
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                        <ShieldCheck
                          size={18}
                          className="mx-auto text-blue-600"
                        />
                        <p className="mt-2 text-xs font-bold text-slate-700">
                          Safe
                        </p>
                      </div>
                    </div>
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