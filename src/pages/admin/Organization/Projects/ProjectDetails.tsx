import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BrainCircuit,
  Bug,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  FolderOpen,
  HardDrive,
  Loader2,
  LockKeyhole,
  MapPin,
  Radar,
  RefreshCcw,
  ScanSearch,
  Search,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

import AdminSidebar from "../../AdminSidebar";
import Upload from "../../Upload&digitization/Upload";

import {
  analyzeDocumentWithAi,
  encryptDocument,
  extractDocumentPlaintext,
  getCurrentUser,
  getDocumentAccessStatus,
  getDocuments,
  getProject,
  openDocumentInNewTab,
  saveDocumentToDevice,
  scanDocument,
  testDocumentSandbox,
} from "../../../../services/dmsApi";

import type {
  DmsDocument,
  ProjectSummary,
  UserSummary,
} from "../../../../services/dmsApi";

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

type DocumentAction =
  | "check_access"
  | "open"
  | "download"
  | "scan"
  | "sandbox"
  | "plaintext"
  | "encrypt"
  | "ai";

type DocumentFilter = "all" | "clean" | "pending" | "blocked";

type SecurityReadiness = {
  score: number;
  label: string;
  badgeClass: string;
  progressClass: string;
  textClass: string;
};

const PAGE_SIZE = 7;

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function toLower(value?: string | null): string {
  return value ? String(value).toLowerCase() : "";
}

function getReadableStatus(value?: string | null): string {
  if (!value) return "Not available";

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

  if (Number.isNaN(parsed.getTime())) return "Not set";

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

function getDocumentTitle(document: DmsDocument): string {
  return (
    document.original_file_name ||
    document.title ||
    document.document_code ||
    `Document #${document.id}`
  );
}

function getStatusClass(value?: string | null): string {
  switch (toLower(value)) {
    case "active":
    case "clean":
    case "passed":
    case "safe":
    case "encrypted":
    case "extracted":
    case "analyzed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "planned":
    case "pending":
    case "pending_scan":
    case "scanning":
    case "not_tested":
    case "not_extracted":
    case "not_encrypted":
    case "not_analyzed":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "quarantined":
    case "suspicious":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "infected":
    case "rejected":
    case "failed":
    case "blocked":
    case "unsafe":
      return "border-red-200 bg-red-50 text-red-700";

    case "archived":
    case "completed":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getSecurityClass(value?: string | null): string {
  switch (toLower(value)) {
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

function isCleanDocument(document: DmsDocument): boolean {
  return ["clean", "passed"].includes(toLower(document.scan_status));
}

function isBlockedDocument(document: DmsDocument): boolean {
  return (
    ["infected", "failed"].includes(toLower(document.scan_status)) ||
    ["unsafe", "failed"].includes(toLower(document.sandbox_status)) ||
    ["infected", "rejected", "blocked"].includes(toLower(document.status))
  );
}

function isPendingDocument(document: DmsDocument): boolean {
  if (isBlockedDocument(document) || isCleanDocument(document)) {
    return false;
  }

  return true;
}

function isEncryptedDocument(document: DmsDocument): boolean {
  return ["encrypted", "completed", "done"].includes(
    toLower(document.encryption_status)
  );
}

function getSecurityScore(document: DmsDocument): number {
  let score = 0;

  if (isCleanDocument(document)) score += 25;
  if (toLower(document.sandbox_status) === "safe") score += 25;
  if (toLower(document.plaintext_status) === "extracted") score += 20;
  if (toLower(document.encryption_status) === "encrypted") score += 20;
  if (toLower(document.ai_status) === "analyzed") score += 10;

  return score;
}

function getSecurityReadiness(document: DmsDocument): SecurityReadiness {
  const score = getSecurityScore(document);

  if (isBlockedDocument(document)) {
    return {
      score,
      label: "Blocked",
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      progressClass: "bg-red-500",
      textClass: "text-red-700",
    };
  }

  if (score >= 80) {
    return {
      score,
      label: "Protected",
      badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      progressClass: "bg-emerald-500",
      textClass: "text-emerald-700",
    };
  }

  if (score >= 50) {
    return {
      score,
      label: "In progress",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      progressClass: "bg-amber-500",
      textClass: "text-amber-700",
    };
  }

  return {
    score,
    label: "Needs review",
    badgeClass: "border-orange-200 bg-orange-50 text-orange-700",
    progressClass: "bg-orange-500",
    textClass: "text-orange-700",
  };
}

function getScanButtonLabel(document: DmsDocument): string {
  if (isCleanDocument(document)) return "Re-scan";
  if (toLower(document.scan_status) === "scanning") return "Scanning...";

  return "Run scan";
}

function makeActionKey(
  id: number | string,
  action: DocumentAction
): string {
  return `${id}-${action}`;
}

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError;

  if (apiError.status === 401) {
    return "Your session expired. Please sign in again.";
  }

  if (apiError.status === 403) {
    return apiError.message || "You do not have permission.";
  }

  return apiError.message || "The action could not be completed.";
}

function normalizeProjectResponse(response: unknown): ProjectSummary | null {
  if (!response || typeof response !== "object") return null;

  const record = response as Record<string, unknown>;

  if (
    record.data &&
    typeof record.data === "object" &&
    !Array.isArray(record.data)
  ) {
    return record.data as ProjectSummary;
  }

  return response as ProjectSummary;
}

function normalizeDocumentsResponse(response: unknown): DmsDocument[] {
  if (Array.isArray(response)) {
    return response as DmsDocument[];
  }

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return record.data as DmsDocument[];
    }

    if (
      record.data &&
      typeof record.data === "object" &&
      Array.isArray((record.data as Record<string, unknown>).data)
    ) {
      return (record.data as Record<string, unknown>)
        .data as DmsDocument[];
    }

    if (Array.isArray(record.documents)) {
      return record.documents as DmsDocument[];
    }
  }

  return [];
}

function Header({
  project,
  user,
}: {
  project: ProjectSummary;
  user: UserSummary | null;
}) {
  return (
    <header className="flex min-h-[78px] shrink-0 items-center justify-between gap-5 border-b border-slate-200 bg-white px-5 lg:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link to="/projects" className="transition hover:text-blue-600">
            Projects
          </Link>

          <ChevronRight size={13} />

          <span className="max-w-[240px] truncate text-slate-700">
            {project.name}
          </span>
        </div>

        <h1 className="mt-1 truncate text-lg font-bold text-slate-900">
          Project Workspace
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
          className="shrink-0 opacity-70 transition hover:opacity-100"
          aria-label="Close alert"
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

function ProjectInfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-3">
      <div className="mt-0.5 shrink-0 text-blue-600">{icon}</div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function SecurityReadinessDisplay({
  document,
}: {
  document: DmsDocument;
}) {
  const readiness = getSecurityReadiness(document);

  return (
    <div className="min-w-[190px]">
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-bold",
            readiness.badgeClass
          )}
        >
          {readiness.label}
        </span>

        <span className={cn("text-xs font-bold", readiness.textClass)}>
          {readiness.score}%
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", readiness.progressClass)}
          style={{ width: `${readiness.score}%` }}
        />
      </div>
    </div>
  );
}

function DocumentTable({
  documents,
  loading,
  search,
  filter,
  currentPage,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onOpenDetails,
}: {
  documents: DmsDocument[];
  loading: boolean;
  search: string;
  filter: DocumentFilter;
  currentPage: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: DocumentFilter) => void;
  onPageChange: (page: number) => void;
  onOpenDetails: (document: DmsDocument) => void;
}) {
  const filteredDocuments = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return [...documents]
      .filter((document) => {
        const searchableText = [
          getDocumentTitle(document),
          document.document_code,
          document.category?.name,
          document.uploader?.name,
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
          !searchTerm || searchableText.includes(searchTerm);

        const matchesFilter =
          filter === "all" ||
          (filter === "clean" && isCleanDocument(document)) ||
          (filter === "pending" && isPendingDocument(document)) ||
          (filter === "blocked" && isBlockedDocument(document));

        return matchesSearch && matchesFilter;
      })
      .sort((first, second) => {
        const firstDate = new Date(
          first.updated_at || first.created_at || 0
        ).getTime();

        const secondDate = new Date(
          second.updated_at || second.created_at || 0
        ).getTime();

        return secondDate - firstDate;
      });
  }, [documents, filter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const paginatedDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      onPageChange(safeCurrentPage);
    }
  }, [currentPage, onPageChange, safeCurrentPage]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Project Documents
            </h2>

            {!loading && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                {filteredDocuments.length} found
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Documents attached to this project only
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="relative w-full lg:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => {
                onSearchChange(event.target.value);
                onPageChange(1);
              }}
              placeholder="Search project documents..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(event) => {
                onFilterChange(event.target.value as DocumentFilter);
                onPageChange(1);
              }}
              className="h-10 w-full min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="all">All documents</option>
              <option value="clean">Clean scan</option>
              <option value="pending">Pending review</option>
              <option value="blocked">Blocked</option>
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Loader2 size={23} className="animate-spin" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading project documents
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Retrieving secure document records...
          </p>
        </div>
      ) : paginatedDocuments.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[940px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Document
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Category
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Security readiness
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Size
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Updated
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedDocuments.map((document) => (
                  <tr
                    key={String(document.id)}
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
                            title={getDocumentTitle(document)}
                          >
                            {getDocumentTitle(document)}
                          </p>

                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            {document.document_code || `Document #${document.id}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex max-w-[170px] rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        <span className="truncate">
                          {document.category?.name || "Uncategorized"}
                        </span>
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <SecurityReadinessDisplay document={document} />
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                      {formatBytes(document.file_size)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-slate-600">
                        {formatRelativeTime(
                          document.updated_at || document.created_at
                        )}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDate(
                          document.updated_at || document.created_at
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenDetails(document)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye size={14} />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 bg-slate-50/60 p-4 sm:grid-cols-2 lg:hidden">
            {paginatedDocuments.map((document) => {
              const readiness = getSecurityReadiness(document);

              return (
                <article
                  key={String(document.id)}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {getDocumentTitle(document)}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {document.category?.name || "Uncategorized"}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                        readiness.badgeClass
                      )}
                    >
                      {readiness.score}%
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-[10px] text-slate-400">Size</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {formatBytes(document.file_size)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">Scan</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {getReadableStatus(document.scan_status)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenDetails(document)}
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Eye size={15} />
                    View details
                  </button>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Search size={25} />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-800">
            No project document found
          </h3>

          <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
            Change the search or status filter, or upload the first document
            for this project.
          </p>
        </div>
      )}

      {!loading && filteredDocuments.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {startIndex + 1}–
              {Math.min(
                startIndex + paginatedDocuments.length,
                filteredDocuments.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredDocuments.length}
            </span>{" "}
            documents
          </p>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}

function PipelineRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>

      <span
        className={cn(
          "rounded-full border px-2.5 py-1 text-[10px] font-bold",
          getStatusClass(value)
        )}
      >
        {getReadableStatus(value)}
      </span>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  loading,
  primary = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  loading: boolean;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3",
        "text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        primary
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      )}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

function DocumentDrawer({
  document,
  actionLoadingKey,
  onDocumentAction,
  onClose,
}: {
  document: DmsDocument;
  actionLoadingKey: string;
  onDocumentAction: (
    document: DmsDocument,
    action: DocumentAction
  ) => void;
  onClose: () => void;
}) {
  const readiness = getSecurityReadiness(document);

  const isLoading = (action: DocumentAction): boolean =>
    actionLoadingKey === makeActionKey(document.id, action);

  return (
    <div className="fixed inset-0 z-[130] flex justify-end bg-slate-950/35 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Close document details"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <aside className="relative z-10 flex h-full w-full max-w-[470px] flex-col border-l border-slate-200 bg-[#f8fafc] shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">
              Document details
            </p>

            <h2
              className="mt-1 truncate text-base font-bold text-slate-900"
              title={getDocumentTitle(document)}
            >
              {getDocumentTitle(document)}
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              {document.document_code || `Document #${document.id}`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Security readiness
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Combined scan, sandbox, OCR, encryption and AI status
                </p>
              </div>

              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                  readiness.badgeClass
                )}
              >
                {readiness.label}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full",
                    readiness.progressClass
                  )}
                  style={{ width: `${readiness.score}%` }}
                />
              </div>

              <span className={cn("text-sm font-bold", readiness.textClass)}>
                {readiness.score}%
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">
              Secure document actions
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <ActionButton
                label="Check access"
                icon={<ShieldCheck size={15} />}
                loading={isLoading("check_access")}
                onClick={() =>
                  onDocumentAction(document, "check_access")
                }
              />

              <ActionButton
                label="Open"
                icon={<Eye size={15} />}
                loading={isLoading("open")}
                primary
                onClick={() => onDocumentAction(document, "open")}
              />

              <ActionButton
                label="Download"
                icon={<Download size={15} />}
                loading={isLoading("download")}
                onClick={() => onDocumentAction(document, "download")}
              />

              <ActionButton
                label={getScanButtonLabel(document)}
                icon={<Bug size={15} />}
                loading={isLoading("scan")}
                onClick={() => onDocumentAction(document, "scan")}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Security pipeline
              </h3>
            </div>

            <div className="mt-4 space-y-2">
              <PipelineRow label="Document" value={document.status} />
              <PipelineRow label="Antivirus" value={document.scan_status} />
              <PipelineRow label="Sandbox" value={document.sandbox_status} />
              <PipelineRow
                label="Plaintext / OCR"
                value={document.plaintext_status}
              />
              <PipelineRow
                label="Encryption"
                value={document.encryption_status}
              />
              <PipelineRow label="AI analysis" value={document.ai_status} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">
              Processing controls
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <ActionButton
                label="Run sandbox test"
                icon={<Radar size={15} />}
                loading={isLoading("sandbox")}
                onClick={() => onDocumentAction(document, "sandbox")}
              />

              <ActionButton
                label="Extract plaintext / OCR"
                icon={<ScanSearch size={15} />}
                loading={isLoading("plaintext")}
                onClick={() => onDocumentAction(document, "plaintext")}
              />

              <ActionButton
                label="Encrypt document"
                icon={<LockKeyhole size={15} />}
                loading={isLoading("encrypt")}
                onClick={() => onDocumentAction(document, "encrypt")}
              />

              <ActionButton
                label="Analyze with AI"
                icon={<BrainCircuit size={15} />}
                loading={isLoading("ai")}
                onClick={() => onDocumentAction(document, "ai")}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">
              Document information
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <DetailRow
                label="Title"
                value={document.title || getDocumentTitle(document)}
              />
              <DetailRow
                label="Category"
                value={document.category?.name || "Uncategorized"}
              />
              <DetailRow
                label="Uploader"
                value={document.uploader?.name || "Unknown"}
              />
              <DetailRow
                label="File size"
                value={formatBytes(document.file_size)}
              />
              <DetailRow
                label="Created"
                value={formatDate(document.created_at)}
              />
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-slate-400">{label}</span>

      <span className="max-w-[250px] break-words text-right font-semibold text-slate-700">
        {value || "Not available"}
      </span>
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

function LoadingScreen() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb]">
      <AdminSidebar />

      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Loader2 size={23} className="animate-spin" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading project workspace
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Retrieving project and document information...
          </p>
        </div>
      </main>
    </div>
  );
}

function NotFoundScreen() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb]">
      <AdminSidebar />

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={27} />
          </div>

          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Project not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The requested project could not be loaded or is no longer
            available.
          </p>

          <Link
            to="/projects"
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
            Back to projects
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [user, setUser] = useState<UserSummary | null>(null);

  const [selectedDocument, setSelectedDocument] =
    useState<DmsDocument | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [documentsLoading, setDocumentsLoading] =
    useState<boolean>(true);

  const [alert, setAlert] = useState<AlertState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [actionLoadingKey, setActionLoadingKey] =
    useState<string>("");

  const [isUploadModalOpen, setIsUploadModalOpen] =
    useState<boolean>(false);

  const [documentSearch, setDocumentSearch] = useState<string>("");
  const [documentFilter, setDocumentFilter] =
    useState<DocumentFilter>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const projectNumberId = Number(projectId || 0);

  async function loadProject(): Promise<void> {
    if (!projectId) return;

    const response = await getProject(projectId);
    const projectData = normalizeProjectResponse(response);

    setProject(projectData);
  }

  async function loadDocuments(): Promise<void> {
    if (!projectId) return;

    try {
      setDocumentsLoading(true);

      const response = await getDocuments({
        project_id: projectId,
      });

      const documentRows = normalizeDocumentsResponse(response);

      setDocuments(documentRows);

      setSelectedDocument((currentDocument) => {
        if (!currentDocument) return null;

        return (
          documentRows.find(
            (document) => document.id === currentDocument.id
          ) || null
        );
      });
    } finally {
      setDocumentsLoading(false);
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

  async function loadAll(): Promise<void> {
    if (!projectId) return;

    try {
      setLoading(true);
      setErrorMessage("");

      await Promise.all([
        loadProject(),
        loadDocuments(),
        loadUser(),
      ]);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [projectId]);

  function updateDocumentInState(updatedDocument: DmsDocument): void {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === updatedDocument.id
          ? updatedDocument
          : document
      )
    );

    setSelectedDocument((currentDocument) =>
      currentDocument?.id === updatedDocument.id
        ? updatedDocument
        : currentDocument
    );
  }

  async function runDocumentAction(
    document: DmsDocument,
    action: DocumentAction
  ): Promise<void> {
    try {
      setActionLoadingKey(makeActionKey(document.id, action));
      setAlert(null);

      if (action === "check_access") {
        const response = await getDocumentAccessStatus(document.id);

        setAlert({
          type: response.access?.is_safe_to_open
            ? "success"
            : "info",
          message:
            response.access?.reason_blocked ||
            `Access checked. View: ${
              response.access?.can_view ? "Yes" : "No"
            }, Download: ${
              response.access?.can_download ? "Yes" : "No"
            }.`,
        });

        return;
      }

      if (action === "open") {
        await openDocumentInNewTab(document.id);

        setAlert({
          type: "success",
          message: "The document was opened securely.",
        });

        return;
      }

      if (action === "download") {
        await saveDocumentToDevice(
          document.id,
          getDocumentTitle(document)
        );

        setAlert({
          type: "success",
          message: "The secure document download started.",
        });

        return;
      }

      if (action === "scan") {
        const response = await scanDocument(document.id);

        updateDocumentInState(response.document);

        setAlert({
          type: isCleanDocument(response.document)
            ? "success"
            : "info",
          message: `Scan completed: ${getReadableStatus(
            response.document.scan_status
          )}.`,
        });
      }

      if (action === "sandbox") {
        const response = await testDocumentSandbox(document.id);

        updateDocumentInState(response.document);

        setAlert({
          type: "success",
          message: "Sandbox testing completed.",
        });
      }

      if (action === "plaintext") {
        const response = await extractDocumentPlaintext(document.id);

        updateDocumentInState(response.document);

        setAlert({
          type: "success",
          message: "Plaintext and OCR extraction completed.",
        });
      }

      if (action === "encrypt") {
        const response = await encryptDocument(document.id);

        updateDocumentInState(response.document);

        setAlert({
          type: "success",
          message: "Document encryption completed.",
        });
      }

      if (action === "ai") {
        const response = await analyzeDocumentWithAi(document.id);

        updateDocumentInState(response.document);

        setAlert({
          type: "success",
          message: "AI document analysis completed.",
        });
      }

      await loadDocuments();
    } catch (error) {
      setAlert({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setActionLoadingKey("");
    }
  }

  const totalDocuments = documents.length;

  const cleanDocuments = documents.filter(isCleanDocument).length;

  const needsAttentionDocuments = documents.filter(
    (document) =>
      isPendingDocument(document) || isBlockedDocument(document)
  ).length;

  const encryptedDocuments = documents.filter(
    isEncryptedDocument
  ).length;

  const totalStorageBytes = documents.reduce(
    (total, document) => total + Number(document.file_size || 0),
    0
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (!project) {
    return <NotFoundScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header project={project} user={user} />

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
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {project.name}
                  </h2>

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

                <p className="mt-1 text-xs text-slate-500">
                  {project.code || `Project #${project.id}`} ·{" "}
                  {getReadableStatus(project.project_type)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/projects"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <ArrowLeft size={16} />
                  Back
                </Link>

                <button
                  type="button"
                  onClick={loadAll}
                  disabled={loading || documentsLoading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {documentsLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={16} />
                  )}
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
                >
                  <UploadCloud size={16} />
                  Upload document
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Documents"
                value={totalDocuments}
                helper="Documents attached to this project"
                icon={FileText}
              />

              <MetricCard
                title="Clean Scan"
                value={cleanDocuments}
                helper="Documents that passed scanning"
                icon={ShieldCheck}
              />

              <MetricCard
                title="Needs Attention"
                value={needsAttentionDocuments}
                helper="Pending, unsafe or blocked records"
                icon={ShieldAlert}
              />

              <MetricCard
                title="Encrypted"
                value={encryptedDocuments}
                helper={`${formatBytes(totalStorageBytes)} total project storage`}
                icon={HardDrive}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-8">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={18} className="text-blue-600" />

                    <h3 className="text-sm font-bold text-slate-900">
                      Project Overview
                    </h3>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ProjectInfoItem
                      icon={<FolderOpen size={15} />}
                      label="Project type"
                      value={getReadableStatus(project.project_type)}
                    />

                    <ProjectInfoItem
                      icon={<MapPin size={15} />}
                      label="Location"
                      value={project.location_name || "Not specified"}
                    />

                    <ProjectInfoItem
                      icon={<ShieldCheck size={15} />}
                      label="Security"
                      value={getReadableStatus(project.security_level)}
                    />

                    <ProjectInfoItem
                      icon={<CalendarDays size={15} />}
                      label="Timeline"
                      value={`${formatDate(
                        project.start_date
                      )} – ${formatDate(project.end_date)}`}
                    />
                  </div>

                  {project.description && (
                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 xl:col-span-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-blue-800">
                        Project document rule
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        Documents uploaded here remain linked to this project
                        and use the configured security processing workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <DocumentTable
              documents={documents}
              loading={documentsLoading}
              search={documentSearch}
              filter={documentFilter}
              currentPage={currentPage}
              onSearchChange={setDocumentSearch}
              onFilterChange={setDocumentFilter}
              onPageChange={setCurrentPage}
              onOpenDetails={setSelectedDocument}
            />
          </div>
        </div>
      </main>

      {selectedDocument && (
        <DocumentDrawer
          document={selectedDocument}
          actionLoadingKey={actionLoadingKey}
          onDocumentAction={runDocumentAction}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="relative h-[92vh] w-full max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="absolute right-4 top-4 z-20">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
                aria-label="Close upload modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-full overflow-y-auto">
              <Upload
                modalMode
                defaultProjectId={projectNumberId}
                lockProjectSelection
                projectLabel={project.name}
                onClose={() => setIsUploadModalOpen(false)}
                onUploaded={() => {
                  setAlert({
                    type: "success",
                    message:
                      "The document was uploaded under this project and submitted to the security workflow.",
                  });

                  setIsUploadModalOpen(false);
                  loadDocuments();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}