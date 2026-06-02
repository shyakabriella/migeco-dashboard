import {
  Eye,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  MoreVertical,
  Search,
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

const pageSize = 8;

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
  return document.project?.name || "No Project";
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

function getFileBadge(document: DmsDocument): {
  label: string;
  className: string;
} {
  const extension = toLower(document.extension);

  if (extension === "pdf") {
    return {
      label: "PDF",
      className: "bg-red-600 text-white",
    };
  }

  if (["doc", "docx"].includes(extension)) {
    return {
      label: "DOC",
      className: "bg-blue-600 text-white",
    };
  }

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return {
      label: "XLS",
      className: "bg-emerald-600 text-white",
    };
  }

  if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return {
      label: extension.toUpperCase(),
      className: "bg-purple-600 text-white",
    };
  }

  if (["dwg", "dxf", "zip", "rar"].includes(extension)) {
    return {
      label: extension.toUpperCase(),
      className: "bg-orange-600 text-white",
    };
  }

  return {
    label: extension ? extension.toUpperCase() : "FILE",
    className: "bg-slate-700 text-white",
  };
}

function getFileIcon(document: DmsDocument) {
  const extension = toLower(document.extension);

  if (["jpg", "jpeg", "png", "webp", "tif", "tiff"].includes(extension)) {
    return <FileImage size={18} />;
  }

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return <FileSpreadsheet size={18} />;
  }

  if (["dwg", "dxf", "zip", "rar"].includes(extension)) {
    return <FileArchive size={18} />;
  }

  return <FileText size={18} />;
}

function getStatusClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
    case "clean":
    case "safe":
    case "extracted":
    case "encrypted":
    case "analyzed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

    case "uploaded":
    case "pending":
    case "pending_scan":
    case "scanning":
    case "not_tested":
    case "not_extracted":
    case "not_encrypted":
    case "not_analyzed":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";

    case "quarantined":
    case "suspicious":
      return "border-orange-500/20 bg-orange-500/10 text-orange-300";

    case "infected":
    case "rejected":
    case "failed":
    case "unsafe":
    case "blocked":
      return "border-red-500/20 bg-red-500/10 text-red-300";

    case "archived":
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";

    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }
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

function getSecurityScore(document: DmsDocument): number {
  let score = 0;

  if (toLower(document.scan_status) === "clean") score += 25;
  if (toLower(document.sandbox_status) === "safe") score += 25;
  if (toLower(document.plaintext_status) === "extracted") score += 20;
  if (toLower(document.encryption_status) === "encrypted") score += 20;
  if (toLower(document.ai_status) === "analyzed") score += 10;

  return score;
}

function sortDocuments(documents: DmsDocument[], sortBy: string): DmsDocument[] {
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

export default function SearchResults({
  results,
  loading,
  currentPage,
  setCurrentPage,
  sortBy,
  setSortBy,
}: SearchResultsProps) {
  const sortedResults = sortDocuments(results, sortBy);
  const totalPages = Math.max(1, Math.ceil(sortedResults.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const visibleResults = sortedResults.slice(startIndex, startIndex + pageSize);

  return (
    <div className="rounded-xl border border-[#1e2a3a] bg-[#111827]">
      <div className="flex flex-col gap-4 border-b border-[#1e2a3a] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8b96a8]">
            Database Results
          </span>

          <span className="rounded bg-[#1e2a3a] px-2 py-0.5 text-xs font-semibold text-white">
            {loading ? "Loading..." : `${results.length} Found`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8b96a8]">
          <span>Sort by:</span>

          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#1e2a3a] bg-[#0d1117] px-2 py-1.5 text-xs font-semibold text-white outline-none focus:border-indigo-500"
          >
            <option>Newest</option>
            <option>Oldest</option>
            <option>Title</option>
            <option>Security</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-[#1e2a3a] text-[11px] uppercase tracking-wider text-[#9aa7bd]">
            <tr>
              <th className="w-12 px-5 py-4">
                <input type="checkbox" readOnly className="rounded" />
              </th>
              <th className="px-5 py-4">Document Name</th>
              <th className="px-5 py-4">Project</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Security Pipeline</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-12">
                  <div className="flex items-center justify-center gap-3 text-sm text-[#8b96a8]">
                    <Loader2 size={20} className="animate-spin" />
                    Loading real documents from database...
                  </div>
                </td>
              </tr>
            ) : visibleResults.length > 0 ? (
              visibleResults.map((document) => {
                const badge = getFileBadge(document);
                const securityScore = getSecurityScore(document);
                const tags = getTags(document);

                return (
                  <tr
                    key={String(document.id)}
                    className="border-b border-[#1e2a3a] transition-colors last:border-b-0 hover:bg-[#0d1117]/60"
                  >
                    <td className="px-5 py-4">
                      <input type="checkbox" readOnly className="rounded" />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[10px] font-bold ${badge.className}`}
                          title={getDocumentType(document)}
                        >
                          {badge.label}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">
                              {getFileIcon(document)}
                            </span>

                            <p className="max-w-[360px] truncate font-semibold text-white">
                              {getDocumentTitle(document)}
                            </p>
                          </div>

                          <p className="mt-1 text-xs text-[#8b96a8]">
                            Modified:{" "}
                            {formatDate(document.updated_at || document.created_at)}{" "}
                            by {getUploaderName(document)}
                          </p>

                          {document.document_code && (
                            <p className="mt-1 text-[11px] text-[#64748b]">
                              Code: {document.document_code}
                            </p>
                          )}

                          {tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-300"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                        {getProjectName(document)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-[#8b96a8]">
                      {getDocumentType(document)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-44 overflow-hidden rounded-full bg-[#1e2a3a]">
                            <div
                              className={`h-full rounded-full ${
                                securityScore >= 80
                                  ? "bg-emerald-500"
                                  : securityScore >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${securityScore}%` }}
                            />
                          </div>

                          <span
                            className={`text-xs font-semibold ${
                              securityScore >= 80
                                ? "text-emerald-400"
                                : securityScore >= 50
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {securityScore}%
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(
                              document.status
                            )}`}
                          >
                            {getReadableStatus(document.status)}
                          </span>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(
                              document.scan_status
                            )}`}
                          >
                            Scan: {getReadableStatus(document.scan_status)}
                          </span>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(
                              document.sandbox_status
                            )}`}
                          >
                            Sandbox: {getReadableStatus(document.sandbox_status)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to="/alldocuments"
                          className="inline-flex items-center gap-2 rounded-lg border border-[#1e2a3a] bg-[#0d1117] px-3 py-2 text-xs text-[#8b96a8] hover:border-indigo-500/40 hover:text-white"
                        >
                          <Eye size={14} />
                          Open
                        </Link>

                        <button
                          type="button"
                          className="rounded-lg p-2 text-[#8b96a8] hover:bg-[#0d1117] hover:text-white"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <Search size={32} className="mx-auto mb-3 text-[#4a5568]" />

                  <h3 className="text-sm font-semibold text-white">
                    No document matched
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8b96a8]">
                    Try another project, category, date range, status, keyword,
                    or enable OCR/plaintext content search after extraction.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-[#1e2a3a] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-[#8b96a8]">
            Showing {startIndex + 1}-
            {Math.min(startIndex + visibleResults.length, results.length)} of{" "}
            {results.length} database result{results.length === 1 ? "" : "s"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(safeCurrentPage - 1)}
              className="rounded-lg border border-[#1e2a3a] px-3 py-1.5 text-xs text-[#8b96a8] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).slice(0, 5).map((_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg border px-3 py-1.5 text-xs ${
                    safeCurrentPage === page
                      ? "border-indigo-500 bg-indigo-600 text-white"
                      : "border-[#1e2a3a] text-[#8b96a8] hover:text-white"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(safeCurrentPage + 1)}
              className="rounded-lg border border-[#1e2a3a] px-3 py-1.5 text-xs text-[#8b96a8] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}