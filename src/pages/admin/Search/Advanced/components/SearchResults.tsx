import { useEffect, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  Eye,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Loader2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { DmsDocument } from "../../../../../services/dmsApi";

interface SearchResultsProps {
  results: DmsDocument[];
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

type SecurityReadiness = {
  score: number;
  label: string;
  helper: string;
  textClass: string;
  barClass: string;
  badgeClass: string;
};

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { label: "Newest first", value: "Newest" },
  { label: "Oldest first", value: "Oldest" },
  { label: "Document title", value: "Title" },
  { label: "Security readiness", value: "Security" },
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

function formatDate(date?: string | null): string {
  if (!date) return "Not updated";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not updated";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatRelativeTime(date?: string | null): string {
  if (!date) return "Unknown time";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown time";

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

function getDocumentTitle(document: DmsDocument): string {
  return (
    document.original_file_name ||
    document.title ||
    document.document_code ||
    `Document #${document.id}`
  );
}

function getUploaderName(document: DmsDocument): string {
  return document.uploader?.name || "Unknown uploader";
}

function getProjectName(document: DmsDocument): string {
  return document.project?.name || "No project";
}

function getCategoryName(document: DmsDocument): string {
  return document.category?.name || "Uncategorized";
}

function getDocumentType(document: DmsDocument): string {
  if (document.document_type) {
    return getReadableStatus(document.document_type);
  }

  if (document.extension) {
    return document.extension.toUpperCase();
  }

  return "File";
}

function getTags(document: DmsDocument): string[] {
  if (Array.isArray(document.tags)) {
    return document.tags.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof document.tags === "string") {
    return document.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function getStatusClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
    case "clean":
    case "safe":
    case "extracted":
    case "encrypted":
    case "analyzed":
    case "passed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "uploaded":
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
    case "unsafe":
    case "blocked":
      return "border-red-200 bg-red-50 text-red-700";

    case "archived":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getFileVisual(document: DmsDocument): {
  label: string;
  icon: React.ReactNode;
  wrapperClass: string;
  labelClass: string;
} {
  const extension = toLower(document.extension);

  if (extension === "pdf") {
    return {
      label: "PDF",
      icon: <FileText size={19} />,
      wrapperClass: "bg-red-50 text-red-600",
      labelClass: "text-red-600",
    };
  }

  if (["doc", "docx"].includes(extension)) {
    return {
      label: "DOC",
      icon: <FileText size={19} />,
      wrapperClass: "bg-blue-50 text-blue-600",
      labelClass: "text-blue-600",
    };
  }

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return {
      label: "XLS",
      icon: <FileSpreadsheet size={19} />,
      wrapperClass: "bg-emerald-50 text-emerald-600",
      labelClass: "text-emerald-600",
    };
  }

  if (["jpg", "jpeg", "png", "webp", "tif", "tiff"].includes(extension)) {
    return {
      label: extension ? extension.toUpperCase() : "IMG",
      icon: <FileImage size={19} />,
      wrapperClass: "bg-violet-50 text-violet-600",
      labelClass: "text-violet-600",
    };
  }

  if (["dwg", "dxf", "zip", "rar"].includes(extension)) {
    return {
      label: extension ? extension.toUpperCase() : "FILE",
      icon: <FileArchive size={19} />,
      wrapperClass: "bg-orange-50 text-orange-600",
      labelClass: "text-orange-600",
    };
  }

  return {
    label: extension ? extension.toUpperCase() : "FILE",
    icon: <FileText size={19} />,
    wrapperClass: "bg-slate-100 text-slate-600",
    labelClass: "text-slate-600",
  };
}

function getSecurityScore(document: DmsDocument): number {
  let score = 0;

  if (["clean", "passed"].includes(toLower(document.scan_status))) score += 25;
  if (toLower(document.sandbox_status) === "safe") score += 25;
  if (toLower(document.plaintext_status) === "extracted") score += 20;
  if (toLower(document.encryption_status) === "encrypted") score += 20;
  if (toLower(document.ai_status) === "analyzed") score += 10;

  return score;
}

function getSecurityReadiness(document: DmsDocument): SecurityReadiness {
  const score = getSecurityScore(document);

  if (score >= 80) {
    return {
      score,
      label: "Protected",
      helper: "Security workflow is nearly complete",
      textClass: "text-emerald-700",
      barClass: "bg-emerald-500",
      badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (score >= 50) {
    return {
      score,
      label: "In progress",
      helper: "Some security steps are still pending",
      textClass: "text-amber-700",
      barClass: "bg-amber-500",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    score,
    label: "Needs attention",
    helper: "Important security checks are incomplete",
    textClass: "text-red-700",
    barClass: "bg-red-500",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
  };
}

function getPipelineSteps(document: DmsDocument) {
  return [
    {
      label: "Scan",
      complete: ["clean", "passed"].includes(toLower(document.scan_status)),
    },
    {
      label: "Sandbox",
      complete: toLower(document.sandbox_status) === "safe",
    },
    {
      label: "OCR",
      complete: toLower(document.plaintext_status) === "extracted",
    },
    {
      label: "Encrypt",
      complete: toLower(document.encryption_status) === "encrypted",
    },
    {
      label: "AI",
      complete: toLower(document.ai_status) === "analyzed",
    },
  ];
}

function sortDocuments(
  documents: DmsDocument[],
  sortBy: string
): DmsDocument[] {
  const copiedDocuments = [...documents];

  if (sortBy === "Oldest") {
    return copiedDocuments.sort((first, second) => {
      const firstDate = new Date(
        first.updated_at || first.created_at || 0
      ).getTime();

      const secondDate = new Date(
        second.updated_at || second.created_at || 0
      ).getTime();

      return firstDate - secondDate;
    });
  }

  if (sortBy === "Title") {
    return copiedDocuments.sort((first, second) =>
      getDocumentTitle(first).localeCompare(getDocumentTitle(second))
    );
  }

  if (sortBy === "Security") {
    return copiedDocuments.sort(
      (first, second) => getSecurityScore(second) - getSecurityScore(first)
    );
  }

  return copiedDocuments.sort((first, second) => {
    const firstDate = new Date(
      first.updated_at || first.created_at || 0
    ).getTime();

    const secondDate = new Date(
      second.updated_at || second.created_at || 0
    ).getTime();

    return secondDate - firstDate;
  });
}

function getPaginationItems(
  currentPage: number,
  totalPages: number
): Array<number | "start-ellipsis" | "end-ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "start-ellipsis" | "end-ellipsis"> = [1];

  if (currentPage > 4) {
    items.push("start-ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (currentPage < totalPages - 3) {
    items.push("end-ellipsis");
  }

  items.push(totalPages);

  return items;
}

function StatusBadge({
  label,
  status,
}: {
  label?: string;
  status?: string | null;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1",
        "text-[10px] font-semibold",
        getStatusClass(status)
      )}
    >
      {label ? `${label}: ` : ""}
      {getReadableStatus(status)}
    </span>
  );
}

function SecurityPipeline({ document }: { document: DmsDocument }) {
  const readiness = getSecurityReadiness(document);
  const steps = getPipelineSteps(document);

  return (
    <div className="min-w-[250px]">
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-1",
            "text-[10px] font-bold",
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
          className={cn(
            "h-full rounded-full transition-all duration-300",
            readiness.barClass
          )}
          style={{ width: `${readiness.score}%` }}
        />
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {steps.map((step) => (
          <span
            key={step.label}
            title={`${step.label}: ${step.complete ? "Complete" : "Pending"}`}
            className={cn(
              "h-2 flex-1 rounded-full",
              step.complete ? "bg-emerald-500" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      <p className="mt-2 text-[10px] text-slate-400">{readiness.helper}</p>
    </div>
  );
}

function DocumentIdentity({ document }: { document: DmsDocument }) {
  const visual = getFileVisual(document);
  const tags = getTags(document);

  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          visual.wrapperClass
        )}
      >
        {visual.icon}
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className="max-w-[330px] truncate text-sm font-semibold text-slate-900"
            title={getDocumentTitle(document)}
          >
            {getDocumentTitle(document)}
          </p>

          <span
            className={cn(
              "shrink-0 text-[9px] font-bold uppercase tracking-wide",
              visual.labelClass
            )}
          >
            {visual.label}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          {document.document_code && <span>{document.document_code}</span>}

          <span className="inline-flex items-center gap-1">
            <UserRound size={11} />
            {getUploaderName(document)}
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock3 size={11} />
            {formatRelativeTime(document.updated_at || document.created_at)}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700"
              >
                #{tag}
              </span>
            ))}

            {tags.length > 3 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MobileDocumentCard({ document }: { document: DmsDocument }) {
  const visual = getFileVisual(document);
  const readiness = getSecurityReadiness(document);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            visual.wrapperClass
          )}
        >
          {visual.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {getDocumentTitle(document)}
          </p>

          <p className="mt-1 truncate text-xs text-slate-500">
            {getProjectName(document)} · {getDocumentType(document)}
          </p>
        </div>

        <StatusBadge status={document.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Category
          </p>
          <p className="mt-1 truncate text-xs font-medium text-slate-700">
            {getCategoryName(document)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Updated
          </p>
          <p className="mt-1 text-xs font-medium text-slate-700">
            {formatDate(document.updated_at || document.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-600">
            Security readiness
          </p>
          <p className={cn("text-xs font-bold", readiness.textClass)}>
            {readiness.score}%
          </p>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn("h-full rounded-full", readiness.barClass)}
            style={{ width: `${readiness.score}%` }}
          />
        </div>
      </div>

      <Link
        to={`/alldocuments?document=${document.id}`}
        state={{ selectedDocumentId: document.id }}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <Eye size={16} />
        Open document
      </Link>
    </article>
  );
}

export default function SearchResults({
  results,
  loading,
  currentPage,
  setCurrentPage,
  sortBy,
  setSortBy,
}: SearchResultsProps) {
  const sortedResults = useMemo(
    () => sortDocuments(results, sortBy),
    [results, sortBy]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedResults.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const visibleResults = useMemo(
    () => sortedResults.slice(startIndex, startIndex + PAGE_SIZE),
    [sortedResults, startIndex]
  );

  const paginationItems = useMemo(
    () => getPaginationItems(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages]
  );

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage, setCurrentPage]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Search size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Document Results
              </h2>

              {!loading && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                  {results.length} found
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Search results from your secure document database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="document-results-sort"
            className="hidden text-xs font-medium text-slate-500 sm:block"
          >
            Sort by
          </label>

          <div className="relative">
            <SlidersHorizontal
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="document-results-sort"
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronRight
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Loader2 size={23} className="animate-spin" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading documents
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Retrieving secure records from the database...
          </p>
        </div>
      ) : visibleResults.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Document
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Project & Category
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Workflow Status
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Security Readiness
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleResults.map((document) => (
                  <tr
                    key={String(document.id)}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 align-top">
                      <DocumentIdentity document={document} />
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="max-w-[210px]">
                        <div className="flex items-center gap-2">
                          <FolderOpen
                            size={14}
                            className="shrink-0 text-blue-500"
                          />

                          <p
                            className="truncate text-sm font-semibold text-slate-700"
                            title={getProjectName(document)}
                          >
                            {getProjectName(document)}
                          </p>
                        </div>

                        <p className="mt-1.5 truncate pl-[22px] text-xs text-slate-400">
                          {getCategoryName(document)}
                        </p>

                        <p className="mt-1 truncate pl-[22px] text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          {getDocumentType(document)}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex max-w-[230px] flex-wrap gap-1.5">
                        <StatusBadge status={document.status} />

                        <StatusBadge
                          label="Scan"
                          status={document.scan_status}
                        />

                        <StatusBadge
                          label="Sandbox"
                          status={document.sandbox_status}
                        />
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <SecurityPipeline document={document} />
                    </td>

                    <td className="px-5 py-4 text-right align-top">
                      <Link
                        to={`/alldocuments?document=${document.id}`}
                        state={{ selectedDocumentId: document.id }}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye size={14} />
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 bg-slate-50/60 p-4 sm:grid-cols-2 lg:hidden">
            {visibleResults.map((document) => (
              <MobileDocumentCard
                key={String(document.id)}
                document={document}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Search size={25} />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-800">
            No document matched your filters
          </h3>

          <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
            Try another project, category, date range, status or keyword. You
            can also enable OCR and plaintext content search after extraction.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {startIndex + 1}–
              {Math.min(startIndex + visibleResults.length, results.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {results.length}
            </span>{" "}
            results
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            <PaginationButton
              label="First page"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(1)}
              icon={<ChevronsLeft size={15} />}
            />

            <PaginationButton
              label="Previous page"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(safeCurrentPage - 1)}
              icon={<ChevronLeft size={15} />}
            />

            {paginationItems.map((item) => {
              if (typeof item !== "number") {
                return (
                  <span
                    key={item}
                    className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
                  >
                    …
                  </span>
                );
              }

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCurrentPage(item)}
                  aria-current={safeCurrentPage === item ? "page" : undefined}
                  className={cn(
                    "flex h-8 min-w-8 items-center justify-center rounded-lg border px-2",
                    "text-xs font-semibold transition",
                    safeCurrentPage === item
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  )}
                >
                  {item}
                </button>
              );
            })}

            <PaginationButton
              label="Next page"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(safeCurrentPage + 1)}
              icon={<ChevronRight size={15} />}
            />

            <PaginationButton
              label="Last page"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              icon={<ChevronsRight size={15} />}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function PaginationButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
    </button>
  );
}