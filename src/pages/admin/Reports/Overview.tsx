import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

type ReportType =
  | "executive_summary"
  | "document_usage"
  | "soil_geological"
  | "samples_laboratory"
  | "study_area"
  | "security_workflow"
  | "upload_activity";

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

const reportTypeOptions: Array<{
  value: ReportType;
  label: string;
  description: string;
}> = [
  {
    value: "executive_summary",
    label: "Executive Summary Report",
    description:
      "general document activity, workflow status, security alerts, and project reporting information.",
  },
  {
    value: "document_usage",
    label: "Document Usage Report",
    description:
      "document usage, classifications, document statuses, and scan readiness.",
  },
  {
    value: "soil_geological",
    label: "Soil & Geological Report",
    description:
      "soil profiles, geological findings, rock samples, boreholes, and field survey records.",
  },
  {
    value: "samples_laboratory",
    label: "Samples & Laboratory Report",
    description:
      "sample collection records, laboratory information, material types, and sample statuses.",
  },
  {
    value: "study_area",
    label: "Study Area Report",
    description:
      "field study locations, project areas, districts, sectors, and study area statuses.",
  },
  {
    value: "security_workflow",
    label: "Security Workflow Report",
    description:
      "clean, quarantined, unsafe, rejected, blocked, and security workflow information.",
  },
  {
    value: "upload_activity",
    label: "Upload Activity Report",
    description:
      "document upload and update activity for the selected reporting period.",
  },
];

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

function getSelectedProjectName(
  projectId: string,
  projects: ProjectSummary[]
): string {
  if (!projectId) return "";

  const project = projects.find((item) => String(item.id) === String(projectId));

  return project ? getProjectLabel(project) : `Project ${projectId}`;
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

function pdfText(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function formatPdfDate(date?: string | null): string {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString();
}

function getReportOption(reportType: ReportType) {
  return (
    reportTypeOptions.find((option) => option.value === reportType) ||
    reportTypeOptions[0]
  );
}

function getSmartReportTitle(
  reportType: ReportType,
  filters: ReportFilters,
  projects: ProjectSummary[]
): string {
  const selectedReport = getReportOption(reportType);
  const projectName = getSelectedProjectName(filters.project_id, projects);

  if (filters.document_type) {
    return `${getReadableStatus(filters.document_type)} Documents Report`;
  }

  if (filters.record_type) {
    return `${getReadableStatus(filters.record_type)} Geological Records Report`;
  }

  if (projectName) {
    return `${projectName} - ${selectedReport.label}`;
  }

  if (filters.district && filters.sector) {
    return `${filters.district} / ${filters.sector} - ${selectedReport.label}`;
  }

  if (filters.district) {
    return `${filters.district} - ${selectedReport.label}`;
  }

  if (filters.province) {
    return `${filters.province} - ${selectedReport.label}`;
  }

  return selectedReport.label;
}

function getActiveFilterItems(
  filters: ReportFilters,
  rangeDays: DateRange,
  projects: ProjectSummary[]
): string[] {
  const activeFilters: string[] = [`Last ${rangeDays} days`];
  const projectName = getSelectedProjectName(filters.project_id, projects);

  if (projectName) activeFilters.push(`Project: ${projectName}`);
  if (filters.document_type) {
    activeFilters.push(
      `Document Type: ${getReadableStatus(filters.document_type)}`
    );
  }
  if (filters.record_type) {
    activeFilters.push(
      `Geo Record Type: ${getReadableStatus(filters.record_type)}`
    );
  }
  if (filters.status) {
    activeFilters.push(`Status: ${getReadableStatus(filters.status)}`);
  }
  if (filters.province) activeFilters.push(`Province/City: ${filters.province}`);
  if (filters.district) activeFilters.push(`District: ${filters.district}`);
  if (filters.sector) activeFilters.push(`Sector: ${filters.sector}`);
  if (filters.search) activeFilters.push(`Search: ${filters.search}`);
  if (filters.clean_only) activeFilters.push("Clean records only");

  return activeFilters;
}

function getFilterRowsForPdf(
  filters: ReportFilters,
  rangeDays: DateRange,
  projects: ProjectSummary[],
  reportTitle: string
): string[][] {
  const rows: string[][] = [
    ["Report", reportTitle],
    ["Period", `Last ${rangeDays} days`],
  ];

  const projectName = getSelectedProjectName(filters.project_id, projects);

  if (projectName) rows.push(["Project", projectName]);
  if (filters.document_type) {
    rows.push(["Document Type", getReadableStatus(filters.document_type)]);
  }
  if (filters.record_type) {
    rows.push(["Geo Record Type", getReadableStatus(filters.record_type)]);
  }
  if (filters.status) rows.push(["Status", getReadableStatus(filters.status)]);
  if (filters.province) rows.push(["Province / City", filters.province]);
  if (filters.district) rows.push(["District", filters.district]);
  if (filters.sector) rows.push(["Sector", filters.sector]);
  if (filters.search) rows.push(["Search", filters.search]);

  rows.push(["Clean Filter", filters.clean_only ? "Enabled" : "Disabled"]);

  return rows;
}

async function loadLogoDataUrl(): Promise<string | null> {
  /*
    Put your official MIGECO logo here:
    public/logo.png

    In React/Vite public assets are available from the browser as:
    /logo.png
  */
  const logoPath = "/logo.png";

  try {
    const response = await fetch(`${logoPath}?v=${Date.now()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      return null;
    }

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(typeof reader.result === "string" ? reader.result : null);
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function getImageFormat(dataUrl: string): "PNG" | "JPEG" {
  return dataUrl.includes("image/jpeg") || dataUrl.includes("image/jpg")
    ? "JPEG"
    : "PNG";
}

function getAutoTableFinalY(doc: jsPDF): number {
  const typedDoc = doc as jsPDF & {
    lastAutoTable?: {
      finalY?: number;
    };
  };

  return typedDoc.lastAutoTable?.finalY || 45;
}

function addAdministrativeHeader(
  doc: jsPDF,
  title: string,
  logoDataUrl: string | null
): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  if (logoDataUrl) {
    try {
      doc.addImage(
        logoDataUrl,
        getImageFormat(logoDataUrl),
        14,
        6,
        34,
        24
      );
    } catch {
      // Continue without logo when image loading fails.
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(title, pageWidth - 14, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(new Date().toLocaleDateString(), pageWidth - 14, 22, {
    align: "right",
  });

  doc.setDrawColor(203, 213, 225);
  doc.line(14, 36, pageWidth - 14, 36);
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, y);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, y + 2, 196, y + 2);

  return y + 6;
}

function addAdministrativeIntro(
  doc: jsPDF,
  reportTitle: string,
  reportDescription: string,
  preparedBy: string,
  preparedRole: string,
  rangeDays: DateRange,
  y: number
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(reportTitle, 14, y);

  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const intro = `This administrative report summarizes ${reportDescription} The report is generated from the MIGECO Document Management System using the selected filters and the access rights of the logged-in user.`;

  const introLines = doc.splitTextToSize(intro, 182);
  doc.text(introLines, 14, y);

  y += introLines.length * 4 + 4;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 1.4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
    head: [["Prepared By", "Role", "Period"]],
    body: [[preparedBy, preparedRole, `Last ${rangeDays} days`]],
    margin: {
      left: 14,
      right: 14,
    },
  });

  return getAutoTableFinalY(doc) + 7;
}

function getAdministrativeSummaryRows(summary: ReportSummary): string[][] {
  return [
    ["Total Documents", formatNumber(summary.total_documents)],
    ["Clean Export Ready", formatNumber(summary.clean_export_ready_documents)],
    ["Clean Documents", formatNumber(summary.clean_documents)],
    ["Geo Records", formatNumber(summary.geological_records)],
    ["Soil Records", formatNumber(summary.soil_records)],
    ["Study Areas", formatNumber(summary.study_areas)],
    ["Samples", formatNumber(summary.samples)],
    ["Blocked / Unsafe", formatNumber(summary.blocked_documents)],
  ];
}

function getAdministrativeDetailTitle(reportType: ReportType): string {
  if (reportType === "document_usage") return "Document Usage Details";
  if (reportType === "soil_geological") return "Soil & Geological Details";
  if (reportType === "samples_laboratory") return "Samples & Laboratory Details";
  if (reportType === "study_area") return "Study Area Details";
  if (reportType === "security_workflow") return "Security Workflow Details";
  if (reportType === "upload_activity") return "Upload Activity Details";

  return "Administrative Notes";
}

function getAdministrativeDetailHead(reportType: ReportType): string[][] {
  if (reportType === "document_usage") {
    return [["Code", "Document", "Type", "Status", "Scan"]];
  }

  if (reportType === "soil_geological") {
    return [["Type", "Site / Survey", "Geologist", "District", "Date"]];
  }

  if (reportType === "samples_laboratory") {
    return [["Code", "Sample", "Type", "Material", "Status"]];
  }

  if (reportType === "study_area") {
    return [["Code", "Name", "Project", "District", "Status"]];
  }

  if (reportType === "security_workflow") {
    return [["Level", "Title", "Message"]];
  }

  if (reportType === "upload_activity") {
    return [["Period", "Uploads", "Updates"]];
  }

  return [["Level", "Title", "Message"]];
}

function getAdministrativeDetailBody(
  reportType: ReportType,
  normalized: AdvancedReportData
): string[][] {
  const maxRows = 5;

  if (reportType === "document_usage") {
    return normalized.documents.length > 0
      ? normalized.documents.slice(0, maxRows).map((document) => [
          pdfText(document.document_code),
          pdfText(document.title || document.original_file_name),
          getReadableStatus(document.document_type),
          getReadableStatus(document.status),
          getReadableStatus(document.scan_status),
        ])
      : [["-", "No documents found", "-", "-", "-"]];
  }

  if (reportType === "soil_geological") {
    return normalized.geological_records.length > 0
      ? normalized.geological_records.slice(0, maxRows).map((record) => [
          getReadableStatus(record.record_type),
          pdfText(
            record.site_name || record.survey_name || record.document?.title
          ),
          pdfText(record.geologist_name),
          pdfText(record.district),
          formatPdfDate(record.created_at),
        ])
      : [["-", "No geological records found", "-", "-", "-"]];
  }

  if (reportType === "samples_laboratory") {
    return normalized.samples.length > 0
      ? normalized.samples.slice(0, maxRows).map((sample) => [
          pdfText(sample.sample_code),
          pdfText(sample.sample_name),
          pdfText(sample.sample_type),
          pdfText(sample.material),
          getReadableStatus(sample.status),
        ])
      : [["-", "No samples found", "-", "-", "-"]];
  }

  if (reportType === "study_area") {
    return normalized.study_areas.length > 0
      ? normalized.study_areas.slice(0, maxRows).map((area) => [
          pdfText(area.code),
          pdfText(area.name),
          pdfText(area.project_name),
          pdfText(area.district),
          getReadableStatus(area.status),
        ])
      : [["-", "No study areas found", "-", "-", "-"]];
  }

  if (reportType === "security_workflow") {
    return normalized.notifications.length > 0
      ? normalized.notifications.slice(0, maxRows).map((notification) => [
          getReadableStatus(notification.level),
          notification.title,
          notification.message,
        ])
      : [["Info", "No alerts", "No security workflow alert found."]];
  }

  if (reportType === "upload_activity") {
    return normalized.activity_chart.length > 0
      ? normalized.activity_chart.slice(0, maxRows).map((row) => [
          row.name,
          formatNumber(row.uploads),
          formatNumber(row.updates),
        ])
      : [["-", "0", "0"]];
  }

  return normalized.notifications.length > 0
    ? normalized.notifications.slice(0, maxRows).map((notification) => [
        getReadableStatus(notification.level),
        notification.title,
        notification.message,
      ])
    : [
        [
          "Success",
          "Report workflow looks clean",
          "No urgent report notification found.",
        ],
      ];
}

function addSignatureSection(
  doc: jsPDF,
  preparedBy: string,
  preparedRole: string,
  startY: number
): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = Math.min(startY, pageHeight - 52);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y - 5, 196, y - 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Prepared By", 14, y);
  doc.text("Reviewed By", 78, y);
  doc.text("Approved By", 142, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);

  doc.text(preparedBy, 14, y + 7);
  doc.text(preparedRole, 14, y + 12);
  doc.text("Signature: ______________", 14, y + 18);

  doc.text("Name: __________________", 78, y + 7);
  doc.text("Signature: ______________", 78, y + 14);
  doc.text("Date: __________________", 78, y + 21);

  doc.text("Name: __________________", 142, y + 7);
  doc.text("Signature: ______________", 142, y + 14);
  doc.text("Date: __________________", 142, y + 21);
}

function addAdministrativeFooter(doc: jsPDF): void {
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("MIGECO DMS - Administrative Report", 14, pageHeight - 8);
  doc.text("Page 1 of 1", 180, pageHeight - 8);
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
  children: ReactNode;
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
  const [reportType, setReportType] =
    useState<ReportType>("executive_summary");
  const [filters, setFilters] = useState<ReportFilters>(emptyFilters);
  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const selectedReport = getReportOption(reportType);
  const smartReportTitle = getSmartReportTitle(
    reportType,
    filters,
    data.projects
  );
  const activeFilterItems = getActiveFilterItems(
    filters,
    rangeDays,
    data.projects
  );
  const summary = data.summary;

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
    setReportType("executive_summary");
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
      const reportSummary = normalized.summary;

      const loggedInUser = normalized.user || data.user;
      const preparedBy = getUserName(loggedInUser);
      const preparedRole = getRoleName(loggedInUser);

      const exportedReportTitle = getSmartReportTitle(
        reportType,
        exportFilters,
        normalized.projects
      );

      const logoDataUrl = await loadLogoDataUrl();

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      addAdministrativeHeader(doc, exportedReportTitle, logoDataUrl);

      let y = 45;

      y = addAdministrativeIntro(
        doc,
        exportedReportTitle,
        selectedReport.description,
        preparedBy,
        preparedRole,
        rangeDays,
        y
      );

      y = addSectionTitle(doc, "Applied Filters", y);

      autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: {
          fontSize: 6.8,
          cellPadding: 1.15,
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: "bold",
        },
        head: [["Filter", "Value"]],
        body: getFilterRowsForPdf(
          exportFilters,
          rangeDays,
          normalized.projects,
          exportedReportTitle
        ),
        margin: {
          left: 14,
          right: 14,
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 132 },
        },
      });

      y = getAutoTableFinalY(doc) + 7;

      y = addSectionTitle(doc, "Report Summary", y);

      autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: {
          fontSize: 6.8,
          cellPadding: 1.15,
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: "bold",
        },
        head: [["Metric", "Value"]],
        body: getAdministrativeSummaryRows(reportSummary),
        margin: {
          left: 14,
          right: 14,
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 62 },
        },
      });

      y = getAutoTableFinalY(doc) + 7;

      y = addSectionTitle(doc, getAdministrativeDetailTitle(reportType), y);

      autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: {
          fontSize: 6.3,
          cellPadding: 1.05,
          overflow: "linebreak",
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: "bold",
        },
        head: getAdministrativeDetailHead(reportType),
        body: getAdministrativeDetailBody(reportType, normalized),
        margin: {
          left: 14,
          right: 14,
        },
      });

      const signatureY = getAutoTableFinalY(doc) + 12;

      addSignatureSection(doc, preparedBy, preparedRole, signatureY);
      addAdministrativeFooter(doc);

      doc.save(
        `migeco-administrative-${reportType}-${getLocalDateKey(new Date())}.pdf`
      );

      setAlert({
        type: "success",
        message: `${exportedReportTitle} exported successfully as a simple one-page administrative PDF.`,
      });
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to export PDF report.",
      });
    }
  }

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
                    Administrative Report Builder
                  </h2>

                  <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                    Select report type and filters. The page and exported PDF
                    will show only records matching your selected filters.
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
                    Export One Page PDF
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FilterInput label="Report Type">
                  <select
                    value={reportType}
                    onChange={(event) =>
                      setReportType(event.target.value as ReportType)
                    }
                    className={inputClass()}
                  >
                    {reportTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FilterInput>

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
                  Recommended for administrative reports.
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                Current Filtered Report
              </p>

              <h3 className="mt-1 text-base font-bold text-slate-900">
                {smartReportTitle}
              </h3>

              <p className="mt-1 max-w-5xl text-xs leading-5 text-slate-600">
                {selectedReport.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilterItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-semibold text-blue-700"
                  >
                    {item}
                  </span>
                ))}
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
                {reportType === "executive_summary" && (
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
                        title="Total Documents"
                        value={formatNumber(summary.total_documents)}
                        description="documents matching filters"
                        icon={FileText}
                      />

                      <MetricCard
                        title="Geo Records"
                        value={formatNumber(summary.geological_records)}
                        description="field findings and geo metadata"
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
                        <h3 className="text-sm font-bold text-slate-900">
                          Document Activity
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Upload and update activity for selected filters
                        </p>

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
                          Administrative Notes
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
                  </>
                )}

                {reportType === "document_usage" && (
                  <>
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <MetricCard
                        title="Total Documents"
                        value={formatNumber(summary.total_documents)}
                        description="documents matching filters"
                        icon={FileText}
                      />

                      <MetricCard
                        title="Clean Documents"
                        value={formatNumber(summary.clean_documents)}
                        description="passed antivirus scan"
                        icon={ShieldCheck}
                      />

                      <MetricCard
                        title="Storage Used"
                        value={formatBytes(summary.storage_used_bytes)}
                        description="filtered uploaded file size"
                        icon={Database}
                      />

                      <MetricCard
                        title="Ready for Export"
                        value={formatNumber(
                          summary.clean_export_ready_documents
                        )}
                        description="clean administrative records"
                        icon={Download}
                      />
                    </section>

                    <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-8">
                        <h3 className="text-sm font-bold text-slate-900">
                          Document Usage Details
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Only document usage records matching your filters are
                          shown here.
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
                              {data.documents.slice(0, 12).map((document) => (
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
                                        toLower(document.scan_status) ===
                                          "clean"
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

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:col-span-4">
                        <h3 className="text-sm font-bold text-slate-900">
                          Document Types
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Most common document classifications
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
                    </section>
                  </>
                )}

                {reportType === "soil_geological" && (
                  <>
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <MetricCard
                        title="Soil Records"
                        value={formatNumber(summary.soil_records)}
                        description="soil geo records and samples"
                        icon={FlaskConical}
                      />

                      <MetricCard
                        title="Geo Records"
                        value={formatNumber(summary.geological_records)}
                        description="geological findings"
                        icon={MapPin}
                      />

                      <MetricCard
                        title="Recent Geo Records"
                        value={formatNumber(summary.recent_geo_records)}
                        description={`in last ${rangeDays} days`}
                        icon={BrainCircuit}
                      />

                      <MetricCard
                        title="Clean Export Ready"
                        value={formatNumber(
                          summary.clean_export_ready_documents
                        )}
                        description="safe records only"
                        icon={ShieldCheck}
                      />
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                      <h3 className="text-sm font-bold text-slate-900">
                        Soil & Geological Records
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Only soil profiles, geological findings, rock samples,
                        boreholes, and field survey records matching your filters
                        are shown.
                      </p>

                      <div className="mt-4 space-y-3">
                        {data.geological_records.slice(0, 12).map((record) => (
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
                              No soil or geological records found
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              A geologist should upload findings after field
                              survey.
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  </>
                )}

                {reportType === "samples_laboratory" && (
                  <>
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <MetricCard
                        title="Samples"
                        value={formatNumber(summary.samples)}
                        description="sample records"
                        icon={FlaskConical}
                      />

                      <MetricCard
                        title="Soil Sample Records"
                        value={formatNumber(summary.soil_sample_records)}
                        description="soil sample records"
                        icon={Database}
                      />

                      <MetricCard
                        title="Clean Export Ready"
                        value={formatNumber(
                          summary.clean_export_ready_documents
                        )}
                        description="safe administrative records"
                        icon={ShieldCheck}
                      />

                      <MetricCard
                        title="Uploads"
                        value={formatNumber(summary.uploads_in_range)}
                        description={`in last ${rangeDays} days`}
                        icon={UploadCloud}
                      />
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                      <h3 className="text-sm font-bold text-slate-900">
                        Samples & Laboratory Records
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Only sample and laboratory records matching your filters
                        are shown here.
                      </p>

                      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                              <th className="px-4 py-3">Code</th>
                              <th className="px-4 py-3">Sample</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3">Material</th>
                              <th className="px-4 py-3">Status</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100 bg-white">
                            {data.samples.slice(0, 12).map((sample) => (
                              <tr key={sample.id}>
                                <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                  {sample.sample_code || "-"}
                                </td>

                                <td className="px-4 py-3 font-semibold text-slate-800">
                                  {sample.sample_name || "-"}
                                </td>

                                <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                  {sample.sample_type || "-"}
                                </td>

                                <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                  {sample.material || "-"}
                                </td>

                                <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                  {getReadableStatus(sample.status)}
                                </td>
                              </tr>
                            ))}

                            {data.samples.length === 0 && (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-4 py-10 text-center text-sm text-slate-400"
                                >
                                  No sample or laboratory records found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </>
                )}

                {reportType === "study_area" && (
                  <>
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <MetricCard
                        title="Study Areas"
                        value={formatNumber(summary.study_areas)}
                        description="field survey locations"
                        icon={MapPin}
                      />

                      <MetricCard
                        title="Active Projects"
                        value={formatNumber(summary.active_projects)}
                        description="active project workspaces"
                        icon={FolderOpen}
                      />

                      <MetricCard
                        title="Geo Records"
                        value={formatNumber(summary.geological_records)}
                        description="linked geo records"
                        icon={BrainCircuit}
                      />

                      <MetricCard
                        title="Clean Export Ready"
                        value={formatNumber(
                          summary.clean_export_ready_documents
                        )}
                        description="safe records only"
                        icon={ShieldCheck}
                      />
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                      <h3 className="text-sm font-bold text-slate-900">
                        Study Area Records
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Only study area records matching your filters are shown
                        here.
                      </p>

                      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                              <th className="px-4 py-3">Code</th>
                              <th className="px-4 py-3">Name</th>
                              <th className="px-4 py-3">Project</th>
                              <th className="px-4 py-3">District</th>
                              <th className="px-4 py-3">Status</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100 bg-white">
                            {data.study_areas.slice(0, 12).map((area) => (
                              <tr key={area.id}>
                                <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                  {area.code || "-"}
                                </td>

                                <td className="px-4 py-3 font-semibold text-slate-800">
                                  {area.name || "-"}
                                </td>

                                <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                  {area.project_name || "-"}
                                </td>

                                <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                  {area.district || "-"}
                                </td>

                                <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                  {getReadableStatus(area.status)}
                                </td>
                              </tr>
                            ))}

                            {data.study_areas.length === 0 && (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-4 py-10 text-center text-sm text-slate-400"
                                >
                                  No study area records found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </>
                )}

                {reportType === "security_workflow" && (
                  <>
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <MetricCard
                        title="Clean Documents"
                        value={formatNumber(summary.clean_documents)}
                        description="passed antivirus scan"
                        icon={ShieldCheck}
                      />

                      <MetricCard
                        title="Quarantined"
                        value={formatNumber(summary.quarantined_documents)}
                        description="waiting security check"
                        icon={ShieldAlert}
                      />

                      <MetricCard
                        title="Unsafe Documents"
                        value={formatNumber(summary.unsafe_documents)}
                        description="failed sandbox safety"
                        icon={ShieldAlert}
                      />

                      <MetricCard
                        title="Blocked / Unsafe"
                        value={formatNumber(summary.blocked_documents)}
                        description="needs review"
                        icon={LockKeyhole}
                      />
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                      <h3 className="text-sm font-bold text-slate-900">
                        Security Workflow Details
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Only security workflow alerts and actions matching your
                        filters are shown here.
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {data.notifications.map((notification) => (
                          <NotificationCard
                            key={notification.id}
                            notification={notification}
                          />
                        ))}
                      </div>
                    </section>
                  </>
                )}

                {reportType === "upload_activity" && (
                  <>
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <MetricCard
                        title="Uploads"
                        value={formatNumber(summary.uploads_in_range)}
                        description={`in last ${rangeDays} days`}
                        icon={UploadCloud}
                      />

                      <MetricCard
                        title="Updates"
                        value={formatNumber(summary.updates_in_range)}
                        description={`in last ${rangeDays} days`}
                        icon={RefreshCcw}
                      />

                      <MetricCard
                        title="Total Documents"
                        value={formatNumber(summary.total_documents)}
                        description="matching selected filters"
                        icon={FileText}
                      />

                      <MetricCard
                        title="Storage Used"
                        value={formatBytes(summary.storage_used_bytes)}
                        description="filtered uploaded size"
                        icon={Database}
                      />
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                      <h3 className="text-sm font-bold text-slate-900">
                        Upload & Update Activity
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Only upload and update activity matching your filters is
                        shown here.
                      </p>

                      <div className="mt-5 h-[300px]">
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
                                id="uploadActivityUpdatesGradient"
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
                                id="uploadActivityUploadsGradient"
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
                              fill="url(#uploadActivityUpdatesGradient)"
                              activeDot={{ r: 4 }}
                            />

                            <Area
                              type="monotone"
                              dataKey="uploads"
                              stroke="#8b5cf6"
                              strokeWidth={2.5}
                              fill="url(#uploadActivityUploadsGradient)"
                              activeDot={{ r: 4 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </section>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}