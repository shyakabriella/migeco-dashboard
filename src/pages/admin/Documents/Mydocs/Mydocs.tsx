import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  AlertCircle,
  Archive as ArchiveIcon,
  Bell,
  CheckCircle2,
  ChevronDown,
  Command,
  Download,
  Eye,
  FileCode,
  Files,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  LockKeyhole,
  MoreVertical,
  RefreshCcw,
  ScanSearch,
  Search,
  Share2,
  ShieldCheck,
  Star,
  UploadCloud,
  UserCircle2,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import AdminSidebar from "../../AdminSidebar";
import Upload from "../../Upload&digitization/Upload";
import {
  getCurrentUser,
  getDocumentAccessStatus,
  getDocuments,
  openDocumentInNewTab,
  saveDocumentToDevice,
} from "../../../../services/dmsApi";
import type { DmsDocument, DocumentFilters } from "../../../../services/dmsApi";

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

type StoredUser = {
  id?: number | string;
  name?: string;
  email?: string;
  role?: {
    slug?: string;
    name?: string;
  } | null;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

type DocumentAction = "check_access" | "open" | "download";

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Pending Scan", value: "pending_scan" },
  { label: "Active", value: "active" },
  { label: "Quarantined", value: "quarantined" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
];

function getStoredUser(): StoredUser | null {
  const keys = ["dms_user", "user", "authUser"];

  for (const key of keys) {
    const rawUser = localStorage.getItem(key) || sessionStorage.getItem(key);

    if (!rawUser) continue;

    try {
      return JSON.parse(rawUser) as StoredUser;
    } catch {
      return null;
    }
  }

  return null;
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function toLower(value?: string | null): string {
  return value ? value.toLowerCase() : "";
}

function formatDate(date?: string): string {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "—";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size = size / 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function getReadableStatus(status?: string | null): string {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function getFileExtension(document: DmsDocument): string {
  if (document.extension) return document.extension.toLowerCase();

  const fileName = document.original_file_name || document.title || "";
  const parts = fileName.split(".");

  return parts.length > 1 ? String(parts.pop()).toLowerCase() : "";
}

function getFileTypeLabel(document: DmsDocument): string {
  const extension = getFileExtension(document);

  if (extension === "pdf") return "PDF Document";
  if (["jpg", "jpeg", "png", "tif", "tiff"].includes(extension)) return "Image";
  if (["xls", "xlsx", "csv"].includes(extension)) return "Spreadsheet";
  if (["doc", "docx"].includes(extension)) return "Word Document";
  if (["ppt", "pptx"].includes(extension)) return "Presentation";
  if (["dwg", "dxf"].includes(extension)) return "Technical Drawing";

  return getReadableStatus(document.document_type);
}

function getFileTypeIcon(document: DmsDocument): ReactNode {
  const extension = getFileExtension(document);

  if (extension === "pdf") {
    return <FileText size={18} className="text-red-500" />;
  }

  if (["jpg", "jpeg", "png", "tif", "tiff"].includes(extension)) {
    return <ImageIcon size={18} className="text-fuchsia-500" />;
  }

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return <FileSpreadsheet size={18} className="text-green-500" />;
  }

  if (["dwg", "dxf"].includes(extension)) {
    return <FileCode size={18} className="text-orange-400" />;
  }

  if (["doc", "docx", "txt"].includes(extension)) {
    return <FileCode size={18} className="text-blue-500" />;
  }

  return <FileText size={18} className="text-slate-400" />;
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
    case "encrypted":
    case "extracted":
    case "analyzed":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
    case "pending_scan":
    case "pending":
    case "not_tested":
    case "not_extracted":
    case "not_encrypted":
    case "not_analyzed":
    case "scanning":
      return "bg-yellow-500/15 text-yellow-300 border-yellow-500/20";
    case "quarantined":
    case "suspicious":
      return "bg-orange-500/15 text-orange-300 border-orange-500/20";
    case "rejected":
    case "infected":
    case "failed":
    case "unsafe":
    case "blocked":
      return "bg-red-500/15 text-red-300 border-red-500/20";
    case "archived":
      return "bg-slate-500/15 text-slate-300 border-slate-500/20";
    default:
      return "bg-blue-500/15 text-blue-300 border-blue-500/20";
  }
}

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError;

  if (apiError.status === 401) {
    return "Your session expired. Please login again.";
  }

  if (apiError.status === 403) {
    return "You do not have permission to retrieve or access this document.";
  }

  return apiError.message || "Action failed. Please try again.";
}

function makeActionKey(id: number | string, action: DocumentAction): string {
  return `${id}-${action}`;
}

export default function Mydocs() {
  const fallbackUser = useMemo(() => getStoredUser(), []);

  const [currentUser, setCurrentUser] = useState<StoredUser | null>(
    fallbackUser
  );
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DmsDocument | null>(
    null
  );

  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [actionMessage, setActionMessage] = useState<AlertState | null>(null);
  const [actionLoadingKey, setActionLoadingKey] = useState<string>("");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const filters: DocumentFilters = useMemo(() => {
    return {
      search,
      status,
    };
  }, [search, status]);

  const myDocuments = useMemo(() => {
    if (!currentUser?.id) return documents;

    return documents.filter(
      (document) => String(document.uploader?.id) === String(currentUser.id)
    );
  }, [documents, currentUser?.id]);

  async function loadCurrentUser(): Promise<void> {
    try {
      setLoadingUser(true);

      const user = await getCurrentUser();

      setCurrentUser(user);

      localStorage.setItem("dms_user", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
    } catch {
      setCurrentUser(fallbackUser);
    } finally {
      setLoadingUser(false);
    }
  }

  async function loadDocuments(): Promise<void> {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getDocuments(filters);

      setDocuments(data);

      setSelectedDocument((current) => {
        const list = currentUser?.id
          ? data.filter(
              (document) =>
                String(document.uploader?.id) === String(currentUser.id)
            )
          : data;

        if (!list.length) return null;

        if (!current) return list[0];

        const stillExists = list.find(
          (document) => document.id === current.id
        );

        return stillExists || list[0];
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function runDocumentAction(
    document: DmsDocument,
    action: DocumentAction
  ): Promise<void> {
    try {
      setActionLoadingKey(makeActionKey(document.id, action));
      setActionMessage(null);

      if (action === "check_access") {
        const response = await getDocumentAccessStatus(document.id);

        const isSafe = response.access?.is_safe_to_open;
        const canView = response.access?.can_view;
        const canDownload = response.access?.can_download;

        setActionMessage({
          type: isSafe && canView ? "success" : "info",
          message:
            isSafe && canView
              ? `Access allowed. View: ${canView ? "Yes" : "No"}, Download: ${
                  canDownload ? "Yes" : "No"
                }.`
              : response.access?.reason_blocked ||
                "Document is not ready for secure access yet.",
        });

        return;
      }

      if (action === "open") {
        await openDocumentInNewTab(document.id);

        setActionMessage({
          type: "success",
          message: "Document opened using secure access controller.",
        });

        return;
      }

      if (action === "download") {
        await saveDocumentToDevice(
          document.id,
          document.original_file_name || document.title || "document"
        );

        setActionMessage({
          type: "success",
          message: "Document downloaded using secure access controller.",
        });
      }
    } catch (error) {
      setActionMessage({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setActionLoadingKey("");
    }
  }

  useEffect(() => {
    loadCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentUser?.id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 450);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1b] font-sans text-slate-200 selection:bg-blue-500/30">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 items-center justify-between border-b border-slate-800/50 bg-[#0f0f1b]/80 px-8 backdrop-blur-md">
          <div className="max-w-2xl flex-1">
            <div className="group relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400"
                size={18}
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search my documents..."
                className="w-full rounded-lg border border-slate-800/50 bg-slate-900/50 py-2 pl-10 pr-12 text-sm text-slate-300 placeholder:text-slate-600 transition-all focus:border-blue-500/50 focus:bg-slate-900 focus:outline-none"
              />

              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                <Command size={10} />
                <span>K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-[#0f0f1b] bg-red-500" />
            </button>

            <div className="h-8 w-px bg-slate-800" />

            <div className="group flex cursor-pointer items-center gap-3 pl-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-none text-slate-200">
                  {currentUser?.name || "DMS User"}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  {loadingUser
                    ? "Loading..."
                    : currentUser?.role?.name ||
                      currentUser?.role?.slug ||
                      "Document Management"}
                </p>
              </div>

              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-800 bg-blue-700/40 text-xs font-semibold text-white transition-colors group-hover:border-slate-600">
                  {getInitials(currentUser?.name)}
                </div>

                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0f0f1b] bg-green-500" />
              </div>

              <ChevronDown
                size={14}
                className="text-slate-500 group-hover:text-slate-300"
              />
            </div>
          </div>
        </header>

        <div className="border-b border-slate-800/50 bg-slate-900/20 px-8 py-2 text-[11px] text-slate-400">
          <span>Home</span>
          <span className="mx-2">&gt;</span>
          <span>Documents</span>
          <span className="mx-2">&gt;</span>
          <span className="font-semibold text-slate-200">My Documents</span>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[1400px]">
            <DocumentsPageTabs />

            {actionMessage && (
              <AlertBox
                type={actionMessage.type}
                message={actionMessage.message}
                className="mb-5"
                onClose={() => setActionMessage(null)}
              />
            )}

            {errorMessage && (
              <AlertBox type="error" message={errorMessage} className="mb-5" />
            )}

            <section>
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    My Documents
                  </h1>
                  <p className="mt-1 text-xs text-slate-500">
                    Showing documents uploaded by{" "}
                    <span className="text-slate-300">
                      {currentUser?.name || "current user"}
                    </span>
                    .
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="relative">
                    <Filter
                      size={14}
                      className="absolute left-3 top-2.5 text-slate-500"
                    />

                    <select
                      value={status}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        setStatus(event.target.value)
                      }
                      className="rounded-lg border border-slate-800/50 bg-slate-900/50 py-2 pl-9 pr-4 text-xs text-slate-300 outline-none transition hover:border-slate-700 hover:bg-slate-800 focus:border-blue-500/50"
                    >
                      {statusOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-[#0f0f1b]"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={loadDocuments}
                    className="flex items-center gap-2 rounded-lg border border-slate-800/50 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
                  >
                    <RefreshCcw size={14} />
                    Refresh
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-slate-800/50 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
                  >
                    <FolderPlus size={14} />
                    New Folder
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-500"
                  >
                    <UploadCloud size={14} />
                    Upload
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800/50 bg-[#141426]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1180px] border-collapse text-left text-[12px]">
                    <thead className="bg-slate-900/30 text-[10px] uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="w-10 px-4 py-3">
                          <div className="h-3.5 w-3.5 rounded-sm border border-slate-700" />
                        </th>
                        <th className="px-2 py-3">Name</th>
                        <th className="px-2 py-3">Type</th>
                        <th className="px-2 py-3">Category</th>
                        <th className="px-2 py-3">Project</th>
                        <th className="px-2 py-3">Status</th>
                        <th className="px-2 py-3">Pipeline</th>
                        <th className="px-2 py-3">Size</th>
                        <th className="px-2 py-3">Date Modified</th>
                        <th className="w-18 px-2 py-3">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-12 text-center">
                            <div className="flex items-center justify-center gap-3 text-slate-400">
                              <Loader2 size={20} className="animate-spin" />
                              Loading my documents...
                            </div>
                          </td>
                        </tr>
                      ) : myDocuments.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                                <FileText size={22} className="text-slate-500" />
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  No documents found
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Upload a document or change your filters.
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        myDocuments.map((document) => {
                          const active = selectedDocument?.id === document.id;

                          return (
                            <tr
                              key={document.id}
                              onClick={() => setSelectedDocument(document)}
                              className={`cursor-pointer border-t border-slate-800/40 text-slate-200 transition-colors hover:bg-slate-800/20 ${
                                active ? "bg-slate-800/30" : ""
                              }`}
                            >
                              <td className="px-4 py-4">
                                <div
                                  className={`h-3.5 w-3.5 rounded-sm border transition-colors ${
                                    active
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-slate-700 hover:border-blue-500"
                                  }`}
                                />
                              </td>

                              <td className="px-2 py-4">
                                <div className="flex items-center gap-2.5">
                                  {getFileTypeIcon(document)}
                                  <div>
                                    <span className="block text-[12px] text-slate-200">
                                      {document.original_file_name ||
                                        document.title ||
                                        "Untitled document"}
                                    </span>
                                    <span className="mt-1 block text-[10px] text-slate-500">
                                      {document.document_code ||
                                        "No document code"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-2 py-4 text-slate-400">
                                {getFileTypeLabel(document)}
                              </td>

                              <td className="px-2 py-4">
                                <span className="rounded bg-blue-500/20 px-2 py-1 text-[10px] font-bold text-blue-400">
                                  {document.category?.name || "—"}
                                </span>
                              </td>

                              <td className="px-2 py-4">
                                <span className="rounded bg-purple-500/20 px-2 py-1 text-[10px] font-bold text-purple-300">
                                  {document.project?.name || "No Project"}
                                </span>
                              </td>

                              <td className="px-2 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-medium ${getStatusClass(
                                    document.status
                                  )}`}
                                >
                                  {getReadableStatus(document.status)}
                                </span>
                              </td>

                              <td className="px-2 py-4">
                                <div className="flex flex-wrap gap-1">
                                  <PipelineBadge
                                    label="Scan"
                                    value={document.scan_status}
                                  />
                                  <PipelineBadge
                                    label="Sandbox"
                                    value={document.sandbox_status}
                                  />
                                  <PipelineBadge
                                    label="Text"
                                    value={document.plaintext_status}
                                  />
                                  <PipelineBadge
                                    label="Encrypt"
                                    value={document.encryption_status}
                                  />
                                </div>
                              </td>

                              <td className="px-2 py-4 text-slate-400">
                                {formatBytes(document.file_size)}
                              </td>

                              <td className="px-2 py-4 text-slate-400">
                                {formatDate(
                                  document.updated_at || document.created_at
                                )}
                              </td>

                              <td className="px-2 py-4 text-slate-400">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedDocument(document);
                                  }}
                                  className="rounded p-1 transition hover:bg-slate-800 hover:text-slate-200"
                                >
                                  <MoreVertical size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between px-1 text-[10px] text-slate-500">
                <p>
                  Showing {myDocuments.length} document
                  {myDocuments.length === 1 ? "" : "s"}
                </p>

                <div className="space-x-2">
                  <button
                    type="button"
                    disabled
                    className="rounded-lg border border-slate-800/50 px-3 py-1.5 opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled
                    className="rounded-lg border border-slate-800/50 bg-slate-900/50 px-3 py-1.5 text-slate-300 opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <DocumentDetailsPanel
        selectedDocument={selectedDocument}
        actionLoadingKey={actionLoadingKey}
        onDocumentAction={runDocumentAction}
        onClose={() => setSelectedDocument(null)}
      />

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="relative h-[92vh] w-full max-w-7xl overflow-hidden rounded-2xl border border-slate-800 bg-[#0f0f1b] shadow-2xl">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-4 top-4 z-20 rounded-xl border border-slate-700 bg-slate-900/90 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="custom-scrollbar h-full overflow-y-auto">
              <Upload
                modalMode
                onClose={() => setIsUploadModalOpen(false)}
                onUploaded={() => {
                  setActionMessage({
                    type: "success",
                    message:
                      "Document uploaded successfully and is waiting for antivirus scan.",
                  });
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

function AlertBox({
  type,
  message,
  className = "",
  onClose,
}: {
  type: AlertState["type"];
  message: string;
  className?: string;
  onClose?: () => void;
}) {
  const style =
    type === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : type === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-blue-500/20 bg-blue-500/10 text-blue-300";

  const Icon =
    type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : ShieldCheck;

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${style} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>

      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 opacity-80">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function PipelineBadge({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(
        value
      )}`}
    >
      {label}
    </span>
  );
}

function DocumentsPageTabs() {
  const tabs = [
    {
      label: "All Documents",
      path: "/alldocuments",
      icon: Files,
    },
    {
      label: "My Documents",
      path: "/mydocs",
      icon: UserCircle2,
    },
    {
      label: "Shared with Me",
      path: "/shareddocs",
      icon: Share2,
    },
    {
      label: "Favorites",
      path: "/favorite",
      icon: Star,
    },
    {
      label: "Archive",
      path: "/archive",
      icon: ArchiveIcon,
    },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-slate-800/50 bg-[#141426] p-3">
      <div className="flex flex-wrap items-center gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-slate-900/70 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={16} />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function DocumentDetailsPanel({
  selectedDocument,
  actionLoadingKey,
  onDocumentAction,
  onClose,
}: {
  selectedDocument: DmsDocument | null;
  actionLoadingKey: string;
  onDocumentAction: (document: DmsDocument, action: DocumentAction) => void;
  onClose: () => void;
}) {
  if (!selectedDocument) {
    return (
      <aside className="hidden w-80 border-l border-slate-800/50 bg-[#0f0f1b] p-6 xl:block">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-white">Document Details</h2>
        </div>

        <div className="mt-20 text-center text-sm text-slate-500">
          Select a document to view details.
        </div>
      </aside>
    );
  }

  const tags = getTags(selectedDocument);

  const isLoading = (action: DocumentAction): boolean =>
    actionLoadingKey === makeActionKey(selectedDocument.id, action);

  return (
    <aside className="hidden w-80 overflow-y-auto border-l border-slate-800/50 bg-[#0f0f1b] p-6 xl:block">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-semibold text-white">Document Details</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="flex h-36 w-28 flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300">
          {getFileTypeIcon(selectedDocument)}
          <span className="mt-3 text-xs uppercase">
            {getFileExtension(selectedDocument) || "file"}
          </span>
        </div>
      </div>

      <div className="mb-6 text-center">
        <p className="break-words font-medium text-white">
          {selectedDocument.original_file_name ||
            selectedDocument.title ||
            "Untitled document"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {selectedDocument.document_code || "No document code"}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-2">
        <ActionButton
          label="Check Access"
          icon={<ShieldCheck size={15} />}
          loading={isLoading("check_access")}
          onClick={() => onDocumentAction(selectedDocument, "check_access")}
        />

        <ActionButton
          label="Open Securely"
          icon={<Eye size={15} />}
          loading={isLoading("open")}
          onClick={() => onDocumentAction(selectedDocument, "open")}
        />

        <ActionButton
          label="Download Securely"
          icon={<Download size={15} />}
          loading={isLoading("download")}
          onClick={() => onDocumentAction(selectedDocument, "download")}
        />
      </div>

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <LockKeyhole size={16} className="text-blue-400" />
          Security Pipeline
        </div>

        <div className="space-y-2">
          <MiniStatus label="Status" value={selectedDocument.status} />
          <MiniStatus label="Scan" value={selectedDocument.scan_status} />
          <MiniStatus label="Sandbox" value={selectedDocument.sandbox_status} />
          <MiniStatus label="Plaintext" value={selectedDocument.plaintext_status} />
          <MiniStatus label="Encryption" value={selectedDocument.encryption_status} />
          <MiniStatus label="AI" value={selectedDocument.ai_status} />
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <DetailRow label="Title" value={selectedDocument.title || "—"} />
        <DetailRow
          label="Type"
          value={getReadableStatus(selectedDocument.document_type)}
        />
        <DetailRow
          label="Category"
          value={selectedDocument.category?.name || "—"}
        />
        <DetailRow
          label="Project"
          value={selectedDocument.project?.name || "No Project"}
        />
        <DetailRow
          label="Security"
          value={getReadableStatus(selectedDocument.security_level)}
        />
        <DetailRow
          label="Status"
          value={getReadableStatus(selectedDocument.status)}
        />
        <DetailRow
          label="Scan"
          value={getReadableStatus(selectedDocument.scan_status)}
        />
        <DetailRow label="Size" value={formatBytes(selectedDocument.file_size)} />
        <DetailRow
          label="Uploaded By"
          value={selectedDocument.uploader?.name || "—"}
        />
        <DetailRow
          label="Created"
          value={formatDate(selectedDocument.created_at)}
        />
        <DetailRow
          label="Modified"
          value={formatDate(selectedDocument.updated_at)}
        />
      </div>

      {selectedDocument.description && (
        <div className="mt-6 border-t border-slate-800 pt-5">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
            Description
          </p>
          <p className="text-sm leading-6 text-slate-300">
            {selectedDocument.description}
          </p>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-6 border-t border-slate-800 pt-5">
          <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
            Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-blue-500/15 px-2 py-1 text-xs text-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function ActionButton({
  label,
  icon,
  loading,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

function MiniStatus({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(
          value
        )}`}
      >
        {getReadableStatus(value)}
      </span>
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
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="break-all text-right text-slate-300">{value || "—"}</span>
    </div>
  );
}