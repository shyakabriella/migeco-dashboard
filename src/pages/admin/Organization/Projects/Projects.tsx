import { useEffect, useMemo, useState } from "react";
import type { ElementType, FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  FolderKanban,
  FolderOpen,
  Loader2,
  MapPin,
  Mountain,
  PenTool,
  Plus,
  Puzzle,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import AdminSidebar from "../../AdminSidebar";

import {
  createProject,
  deleteProject,
  getCurrentUser,
  getProjects,
  updateProject,
} from "../../../../services/dmsApi";

import type { UserSummary } from "../../../../services/dmsApi";

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

type ProjectRecord = {
  id: number | string;
  name: string;
  code?: string | null;
  description?: string | null;
  location_name?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  project_type?: string | null;
  status?: string | null;
  security_level?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  creator?: {
    id?: number | string;
    name?: string;
    email?: string;
  } | null;
  documents_count?: number;
  document_count?: number;
  documents?: unknown[];
  metadata?: Record<string, unknown> | null;
};

type ProjectFormState = {
  name: string;
  code: string;
  description: string;
  location_name: string;
  latitude: string;
  longitude: string;
  project_type:
    | "geological_survey"
    | "construction"
    | "technical_study"
    | "mining"
    | "administration"
    | "other";
  status: "planned" | "active" | "completed" | "archived";
  security_level: "public" | "internal" | "confidential" | "restricted";
  start_date: string;
  end_date: string;
};

type SelectOption = {
  label: string;
  value: string;
};

const PAGE_SIZE = 6;

const emptyForm: ProjectFormState = {
  name: "",
  code: "",
  description: "",
  location_name: "",
  latitude: "",
  longitude: "",
  project_type: "other",
  status: "planned",
  security_level: "internal",
  start_date: "",
  end_date: "",
};

const statusOptions: SelectOption[] = [
  { label: "All statuses", value: "" },
  { label: "Planned", value: "planned" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

const projectTypeOptions: SelectOption[] = [
  { label: "All project types", value: "" },
  { label: "Geological Survey", value: "geological_survey" },
  { label: "Construction", value: "construction" },
  { label: "Technical Study", value: "technical_study" },
  { label: "Mining", value: "mining" },
  { label: "Administration", value: "administration" },
  { label: "Other", value: "other" },
];

const securityOptions: SelectOption[] = [
  { label: "All security levels", value: "" },
  { label: "Public", value: "public" },
  { label: "Internal", value: "internal" },
  { label: "Confidential", value: "confidential" },
  { label: "Restricted", value: "restricted" },
];

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function toLower(value?: string | null): string {
  return value ? String(value).toLowerCase() : "";
}

function getReadableStatus(value?: string | null): string {
  if (!value) return "Not specified";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function formatDate(date?: string | null): string {
  if (!date) return "Not set";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
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

  return formatDate(date);
}

function getProjectDocumentsCount(project: ProjectRecord): number {
  if (typeof project.documents_count === "number") {
    return project.documents_count;
  }

  if (typeof project.document_count === "number") {
    return project.document_count;
  }

  if (Array.isArray(project.documents)) {
    return project.documents.length;
  }

  return 0;
}

function getRecordedProgress(project: ProjectRecord): number | null {
  const value = project.metadata?.progress;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function getStatusClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "planned":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "completed":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "archived":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function getSecurityClass(securityLevel?: string | null): string {
  switch (toLower(securityLevel)) {
    case "public":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "internal":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "confidential":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "restricted":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getProjectVisual(project: ProjectRecord): {
  icon: ElementType;
  wrapperClass: string;
  progressClass: string;
} {
  const projectType = toLower(project.project_type);

  if (
    projectType === "geological_survey" ||
    projectType === "mining"
  ) {
    return {
      icon: Mountain,
      wrapperClass: "bg-violet-50 text-violet-600",
      progressClass: "bg-violet-500",
    };
  }

  if (projectType === "construction") {
    return {
      icon: Building2,
      wrapperClass: "bg-blue-50 text-blue-600",
      progressClass: "bg-blue-600",
    };
  }

  if (projectType === "technical_study") {
    return {
      icon: Puzzle,
      wrapperClass: "bg-amber-50 text-amber-600",
      progressClass: "bg-amber-500",
    };
  }

  if (projectType === "administration") {
    return {
      icon: PenTool,
      wrapperClass: "bg-emerald-50 text-emerald-600",
      progressClass: "bg-emerald-500",
    };
  }

  return {
    icon: FolderOpen,
    wrapperClass: "bg-slate-100 text-slate-600",
    progressClass: "bg-slate-500",
  };
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

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

  if (!role) return "Project User";

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
      "Project User"
    );
  }

  return "Project User";
}

function normalizeProjectsResponse(response: unknown): ProjectRecord[] {
  if (Array.isArray(response)) {
    return response as ProjectRecord[];
  }

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return record.data as ProjectRecord[];
    }

    if (
      record.data &&
      typeof record.data === "object" &&
      Array.isArray((record.data as Record<string, unknown>).data)
    ) {
      return (record.data as Record<string, unknown>)
        .data as ProjectRecord[];
    }

    if (Array.isArray(record.projects)) {
      return record.projects as ProjectRecord[];
    }
  }

  return [];
}

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError;

  if (apiError.status === 401) {
    return "Your session expired. Please sign in again.";
  }

  if (apiError.status === 403) {
    return apiError.message || "You do not have permission for this action.";
  }

  if (apiError.status === 422) {
    return apiError.message || "Validation failed. Check the project form.";
  }

  return apiError.message || "The action could not be completed.";
}

function projectToForm(project: ProjectRecord): ProjectFormState {
  return {
    name: project.name || "",
    code: project.code || "",
    description: project.description || "",
    location_name: project.location_name || "",
    latitude:
      project.latitude !== null && project.latitude !== undefined
        ? String(project.latitude)
        : "",
    longitude:
      project.longitude !== null && project.longitude !== undefined
        ? String(project.longitude)
        : "",
    project_type:
      (project.project_type as ProjectFormState["project_type"]) ||
      "other",
    status:
      (project.status as ProjectFormState["status"]) || "planned",
    security_level:
      (project.security_level as ProjectFormState["security_level"]) ||
      "internal",
    start_date: project.start_date
      ? String(project.start_date).slice(0, 10)
      : "",
    end_date: project.end_date
      ? String(project.end_date).slice(0, 10)
      : "",
  };
}

function formToPayload(form: ProjectFormState) {
  return {
    name: form.name.trim(),
    code: form.code.trim() || null,
    description: form.description.trim() || null,
    location_name: form.location_name.trim() || null,
    latitude: form.latitude.trim() || null,
    longitude: form.longitude.trim() || null,
    project_type: form.project_type,
    status: form.status,
    security_level: form.security_level,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    metadata: {
      source: "dms_frontend",
      workflow: "project_first_document_management",
    },
  };
}

function validateProjectForm(form: ProjectFormState): string | null {
  if (!form.name.trim()) {
    return "Project name is required.";
  }

  if (form.start_date && form.end_date) {
    const startDate = new Date(form.start_date);
    const endDate = new Date(form.end_date);

    if (endDate < startDate) {
      return "The end date cannot be earlier than the start date.";
    }
  }

  if (form.latitude.trim()) {
    const latitude = Number(form.latitude);

    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      return "Latitude must be a number between -90 and 90.";
    }
  }

  if (form.longitude.trim()) {
    const longitude = Number(form.longitude);

    if (
      Number.isNaN(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return "Longitude must be a number between -180 and 180.";
    }
  }

  return null;
}

function Header({
  user,
}: {
  user: UserSummary | null;
}) {
  return (
    <header className="flex min-h-[78px] shrink-0 items-center justify-between gap-5 border-b border-slate-200 bg-white px-5 lg:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Organization</span>
          <ChevronRight size={13} />
          <span className="text-slate-700">Projects</span>
        </div>

        <h1 className="mt-1 text-lg font-bold text-slate-900">
          Projects & Sites
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
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

function AlertBox({
  alert,
  onClose,
}: {
  alert: AlertState;
  onClose?: () => void;
}) {
  const Icon =
    alert.type === "success"
      ? CheckCircle2
      : alert.type === "error"
      ? AlertCircle
      : ShieldCheck;

  const alertClass =
    alert.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : alert.type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
        alertClass
      )}
    >
      <div className="flex items-start gap-2.5">
        <Icon size={17} className="mt-0.5 shrink-0" />
        <span>{alert.message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alert"
          className="shrink-0 opacity-70 transition hover:opacity-100"
        >
          <X size={16} />
        </button>
      )}
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

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        >
          {options.map((option) => (
            <option
              key={option.value || option.label}
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
    </div>
  );
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const visual = getProjectVisual(project);
  const Icon = visual.icon;
  const progress = getRecordedProgress(project);
  const documentCount = getProjectDocumentsCount(project);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            visual.wrapperClass
          )}
        >
          <Icon size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-bold text-slate-900"
            title={project.name}
          >
            {project.name}
          </p>

          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {project.code || `Project #${project.id}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
            aria-label={`Edit ${project.name}`}
            title="Edit project"
          >
            <Edit3 size={14} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${project.name}`}
            title="Delete project"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-bold",
            getStatusClass(project.status)
          )}
        >
          {getReadableStatus(project.status)}
        </span>

        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-bold",
            getSecurityClass(project.security_level)
          )}
        >
          {getReadableStatus(project.security_level)}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
        {project.description || "No project description has been added."}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-[10px] text-slate-400">Documents</p>

          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <FileText size={13} className="text-blue-600" />
            {formatNumber(documentCount)}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-slate-400">Project type</p>

          <p className="mt-1 truncate text-xs font-semibold text-slate-700">
            {getReadableStatus(project.project_type)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin size={13} className="shrink-0 text-slate-400" />

          <span className="truncate">
            {project.location_name || "No location"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={13} className="shrink-0 text-slate-400" />

          <span className="truncate">
            {formatDate(project.start_date)} – {formatDate(project.end_date)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Activity size={13} className="shrink-0 text-slate-400" />

          <span>
            Updated {formatRelativeTime(project.updated_at || project.created_at)}
          </span>
        </div>
      </div>

      {progress !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-500">
              Recorded progress
            </span>

            <span className="font-bold text-slate-800">{progress}%</span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full", visual.progressClass)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <Link
        to={`/Projects/${project.id}`}
        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <Eye size={15} />
        Open project
      </Link>
    </article>
  );
}

function FormField({
  label,
  required = false,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      {children}
    </label>
  );
}

function ProjectFormModal({
  title,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  title: string;
  form: ProjectFormState;
  saving: boolean;
  onChange: (form: ProjectFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  function updateField<K extends keyof ProjectFormState>(
    field: K,
    value: ProjectFormState[K]
  ): void {
    onChange({
      ...form,
      [field]: value,
    });
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>

            <p className="mt-1 text-xs text-slate-500">
              Add the project information used to organize documents.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <FormField label="Project name" required>
              <input
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                className={inputClass}
                placeholder="Example: Kigali Geological Survey"
              />
            </FormField>

            <FormField label="Project code">
              <input
                value={form.code}
                onChange={(event) =>
                  updateField("code", event.target.value)
                }
                className={inputClass}
                placeholder="Leave empty for automatic code"
              />
            </FormField>

            <FormField label="Project type">
              <div className="relative">
                <select
                  value={form.project_type}
                  onChange={(event) =>
                    updateField(
                      "project_type",
                      event.target
                        .value as ProjectFormState["project_type"]
                    )
                  }
                  className={cn(inputClass, "appearance-none pr-9")}
                >
                  {projectTypeOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </FormField>

            <FormField label="Status">
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value as ProjectFormState["status"]
                    )
                  }
                  className={cn(inputClass, "appearance-none pr-9")}
                >
                  {statusOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </FormField>

            <FormField label="Security level">
              <div className="relative">
                <select
                  value={form.security_level}
                  onChange={(event) =>
                    updateField(
                      "security_level",
                      event.target
                        .value as ProjectFormState["security_level"]
                    )
                  }
                  className={cn(inputClass, "appearance-none pr-9")}
                >
                  {securityOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </FormField>

            <FormField label="Location">
              <input
                value={form.location_name}
                onChange={(event) =>
                  updateField("location_name", event.target.value)
                }
                className={inputClass}
                placeholder="Example: Kigali, Rwanda"
              />
            </FormField>

            <FormField label="Latitude">
              <input
                value={form.latitude}
                onChange={(event) =>
                  updateField("latitude", event.target.value)
                }
                className={inputClass}
                placeholder="-1.9441"
                inputMode="decimal"
              />
            </FormField>

            <FormField label="Longitude">
              <input
                value={form.longitude}
                onChange={(event) =>
                  updateField("longitude", event.target.value)
                }
                className={inputClass}
                placeholder="30.0619"
                inputMode="decimal"
              />
            </FormField>

            <FormField label="Start date">
              <input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  updateField("start_date", event.target.value)
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="End date">
              <input
                type="date"
                value={form.end_date}
                onChange={(event) =>
                  updateField("end_date", event.target.value)
                }
                className={inputClass}
              />
            </FormField>

            <FormField
              label="Description"
              className="md:col-span-2"
            >
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                placeholder="Describe the project purpose and scope..."
              />
            </FormField>

            <div className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Project-first document organization
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Save the project, then open its workspace to upload and
                    manage related documents.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}

              {saving ? "Saving..." : "Save project"}
            </button>
          </div>
        </form>
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

      <span className="min-w-[78px] text-center text-xs font-semibold text-slate-600">
        Page {currentPage} of {totalPages}
      </span>

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

function LoadingPanel() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center shadow-sm shadow-slate-200/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Loader2 size={23} className="animate-spin" />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">
        Loading projects
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Retrieving project information...
      </p>
    </div>
  );
}

function EmptyPanel({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <FolderKanban size={26} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        No projects found
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
        Change the search filters or create the first project workspace.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <Plus size={16} />
        Create project
      </button>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [user, setUser] = useState<UserSummary | null>(null);

  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [securityLevel, setSecurityLevel] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [alert, setAlert] = useState<AlertState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] =
    useState<ProjectRecord | null>(null);
  const [form, setForm] =
    useState<ProjectFormState>(emptyForm);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const apiFilters = useMemo(
    () => ({
      search,
      status,
      project_type: projectType,
      security_level: securityLevel,
    }),
    [projectType, search, securityLevel, status]
  );

  async function loadProjects(): Promise<void> {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getProjects(apiFilters);
      const projectRows = normalizeProjectsResponse(response);

      setProjects(projectRows);
      setCurrentPage(1);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadUser(): Promise<void> {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadProjects();
  }, [apiFilters]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const totalProjects = projects.length;

  const activeProjects = projects.filter(
    (project) => toLower(project.status) === "active"
  ).length;

  const completedProjects = projects.filter(
    (project) => toLower(project.status) === "completed"
  ).length;

  const restrictedProjects = projects.filter(
    (project) =>
      toLower(project.security_level) === "restricted"
  ).length;

  const totalPages = Math.max(
    1,
    Math.ceil(projects.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const paginatedProjects = projects.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const hasActiveFilters =
    searchInput.trim() !== "" ||
    status !== "" ||
    projectType !== "" ||
    securityLevel !== "";

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  function openCreateModal(): void {
    setEditingProject(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(project: ProjectRecord): void {
    setEditingProject(project);
    setForm(projectToForm(project));
    setIsModalOpen(true);
  }

  function closeModal(): void {
    if (saving) return;

    setIsModalOpen(false);
    setEditingProject(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const validationError = validateProjectForm(form);

    if (validationError) {
      setAlert({
        type: "error",
        message: validationError,
      });
      return;
    }

    try {
      setSaving(true);
      setAlert(null);

      if (editingProject) {
        await updateProject(
          editingProject.id,
          formToPayload(form)
        );

        setAlert({
          type: "success",
          message: "Project updated successfully.",
        });
      } else {
        await createProject(formToPayload(form));

        setAlert({
          type: "success",
          message: "Project created successfully.",
        });
      }

      closeModal();
      await loadProjects();
    } catch (error) {
      setAlert({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProject(
    project: ProjectRecord
  ): Promise<void> {
    const confirmed = window.confirm(
      `Delete or archive "${project.name}"?`
    );

    if (!confirmed) return;

    try {
      setAlert(null);

      await deleteProject(project.id);

      setAlert({
        type: "success",
        message: "Project deleted or archived successfully.",
      });

      await loadProjects();
    } catch (error) {
      setAlert({
        type: "error",
        message: getErrorMessage(error),
      });
    }
  }

  function clearFilters(): void {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setProjectType("");
    setSecurityLevel("");
    setCurrentPage(1);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header user={user} />

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] space-y-5 px-5 py-6 lg:px-8">
            {alert && (
              <AlertBox
                alert={alert}
                onClose={() => setAlert(null)}
              />
            )}

            {errorMessage && (
              <AlertBox
                alert={{
                  type: "error",
                  message: errorMessage,
                }}
              />
            )}

            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Project Workspaces
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Create a project first, then organize its documents,
                  security, search and reporting in one workspace.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={loadProjects}
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={16} />
                  )}

                  Refresh
                </button>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
                >
                  <Plus size={17} />
                  New project
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total Projects"
                value={totalProjects}
                helper="Projects in the current result"
                icon={FolderKanban}
              />

              <MetricCard
                title="Active Projects"
                value={activeProjects}
                helper="Currently running workspaces"
                icon={Activity}
              />

              <MetricCard
                title="Completed"
                value={completedProjects}
                helper="Projects marked completed"
                icon={CheckCircle2}
              />

              <MetricCard
                title="Restricted"
                value={restrictedProjects}
                helper="High-security projects"
                icon={ShieldCheck}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                    Search projects
                  </label>

                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={searchInput}
                      onChange={(event) => {
                        setSearchInput(event.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Name, code, location or description..."
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <SelectField
                    label="Status"
                    value={status}
                    options={statusOptions}
                    onChange={(value) => {
                      setStatus(value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="lg:col-span-3">
                  <SelectField
                    label="Project type"
                    value={projectType}
                    options={projectTypeOptions}
                    onChange={(value) => {
                      setProjectType(value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="lg:col-span-2">
                  <SelectField
                    label="Security"
                    value={securityLevel}
                    options={securityOptions}
                    onChange={(value) => {
                      setSecurityLevel(value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </section>

            {loading ? (
              <LoadingPanel />
            ) : projects.length === 0 ? (
              <EmptyPanel onCreate={openCreateModal} />
            ) : (
              <section>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedProjects.map((project) => (
                    <ProjectCard
                      key={String(project.id)}
                      project={project}
                      onEdit={() => openEditModal(project)}
                      onDelete={() =>
                        handleDeleteProject(project)
                      }
                    />
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {startIndex + 1}–
                      {Math.min(
                        startIndex + paginatedProjects.length,
                        projects.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                      {projects.length}
                    </span>{" "}
                    projects
                  </p>

                  <Pagination
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    onChange={setCurrentPage}
                  />
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <ProjectFormModal
          title={
            editingProject ? "Update Project" : "Create Project"
          }
          form={form}
          saving={saving}
          onChange={setForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}