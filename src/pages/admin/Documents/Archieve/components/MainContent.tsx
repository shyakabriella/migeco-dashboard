import { useEffect, useMemo, useState } from "react";
import FileIcon, { getExt } from "./FileIcon";

type ArchivedDocument = {
  id: number;
  document_code?: string;
  title?: string;
  original_file_name?: string;
  file_path?: string;
  extension?: string;
  file_size?: number;
  status?: string;
  archived_at?: string | null;
  archive_reason?: string | null;
  project?: {
    id: number;
    name: string;
    code?: string;
  } | null;
  category?: {
    id: number;
    name: string;
    slug?: string;
  } | null;
  uploader?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  archiver?: {
    id: number;
    name: string;
    email?: string;
  } | null;
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

type Props = {
  selectedFile: string | null;
  setSelectedFile: (name: string) => void;
  checkedFiles: string[];
  toggleCheck: (name: string) => void;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api";

function getAuthToken(): string | null {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token")
  );
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getDocumentName(document: ArchivedDocument): string {
  return (
    document.original_file_name ||
    document.title ||
    document.document_code ||
    `Document #${document.id}`
  );
}

function getOriginalLocation(document: ArchivedDocument): string {
  const project = document.project?.name;
  const category = document.category?.name;

  if (project && category) {
    return `/${project}/${category}`;
  }

  if (project) {
    return `/${project}`;
  }

  if (category) {
    return `/${category}`;
  }

  return document.file_path || "-";
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const json = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(json.message || "Request failed.");
  }

  return json.data as T;
}

export default function MainContent({
  selectedFile,
  setSelectedFile,
  checkedFiles,
  toggleCheck,
}: Props) {
  const [documents, setDocuments] = useState<ArchivedDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [restoring, setRestoring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => checkedFiles.map((id) => Number(id)).filter(Boolean),
    [checkedFiles]
  );

  async function loadArchivedDocuments(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const data = await apiRequest<ArchivedDocument[]>(
        "/document-archives/documents"
      );

      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load archived documents."
      );
    } finally {
      setLoading(false);
    }
  }

  async function restoreSelectedDocuments(): Promise<void> {
    if (selectedIds.length === 0) {
      setError("Please select at least one archived document to restore.");
      return;
    }

    try {
      setRestoring(true);
      setError(null);

      await Promise.all(
        selectedIds.map((id) =>
          apiRequest(`/document-archives/documents/${id}/restore`, {
            method: "POST",
            body: JSON.stringify({
              reason: "Document restored from archive.",
            }),
          })
        )
      );

      await loadArchivedDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to restore document."
      );
    } finally {
      setRestoring(false);
    }
  }

  useEffect(() => {
    loadArchivedDocuments();
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-white px-6 py-4">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <span className="cursor-pointer transition-colors hover:text-slate-900">
            Home
          </span>

          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>

          <span className="cursor-pointer transition-colors hover:text-slate-900">
            Documents
          </span>

          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>

          <span className="flex items-center gap-1.5 font-medium text-blue-600">
            Archive
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
            Archived documents are kept for audit
          </div>

          <button
            onClick={restoreSelectedDocuments}
            disabled={restoring || selectedIds.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {restoring ? "Restoring..." : "Restore"}
          </button>

          <button
            disabled
            title="Permanent delete endpoint is not enabled in the archive backend yet."
            className="flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400"
          >
            Delete Permanently
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[40px_1fr_200px_150px_50px] items-center border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <div>
            <div className="h-4 w-4 rounded border border-slate-300 bg-white" />
          </div>
          <div>Name</div>
          <div>Original Location</div>
          <div>Archived Date</div>
          <div></div>
        </div>

        {loading && (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            Loading archived documents...
          </div>
        )}

        {!loading && documents.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            No archived documents found.
          </div>
        )}

        {!loading &&
          documents.map((document) => {
            const id = String(document.id);
            const name = getDocumentName(document);
            const isSelected = selectedFile === id;
            const isChecked = checkedFiles.includes(id);
            const ext = document.extension || getExt(name);

            return (
              <div
                key={document.id}
                onClick={() => setSelectedFile(id)}
                className={`grid cursor-pointer grid-cols-[40px_1fr_200px_150px_50px] items-center border-b border-slate-100 px-4 py-3.5 transition-colors ${
                  isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCheck(id);
                  }}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      isChecked
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isChecked && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <FileIcon ext={ext} />
                  <span className={`truncate text-sm font-medium ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                    {name}
                  </span>
                </div>

                <div className="truncate text-sm text-slate-500">
                  {getOriginalLocation(document)}
                </div>

                <div className="whitespace-pre-line text-sm text-slate-500">
                  {formatDate(document.archived_at).replace(", ", ",\n")}
                </div>

                <div className="flex justify-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-blue-600" : "bg-slate-300"}`} />
                </div>
              </div>
            );
          })}

        <div className="flex items-center justify-between px-4 py-3.5 text-sm text-slate-500">
          <span>
            Showing {documents.length === 0 ? 0 : 1}-{documents.length} of{" "}
            {documents.length} archived items
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400"
            >
              Previous
            </button>
            <button
              disabled
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}