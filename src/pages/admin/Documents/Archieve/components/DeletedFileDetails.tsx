import { useState } from "react";

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
  document: ArchivedDocument | null;
  onClose: () => void;
  onRestored?: () => void;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api"
).replace(/\/+$/, "");

function getAuthToken(): string | null {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token")
  );
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

function formatFileSize(size?: number): string {
  if (!size) {
    return "-";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name?: string): string {
  if (!name) {
    return "NA";
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

export default function DeletedFileDetails({
  document,
  onClose,
  onRestored,
}: Props) {
  const [restoring, setRestoring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!document) {
    return null;
  }

  const selectedDocument = document;
  const fileName = getDocumentName(selectedDocument);
  const extension =
    selectedDocument.extension || fileName.split(".").pop() || "FILE";
  const archiverName = selectedDocument.archiver?.name || "Unknown user";

  async function handleRestore(): Promise<void> {
    try {
      setRestoring(true);
      setError(null);

      await apiRequest(
        `/document-archives/documents/${selectedDocument.id}/restore`,
        {
          method: "POST",
          body: JSON.stringify({
            reason: "Document restored from archive.",
          }),
        }
      );

      onRestored?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to restore document."
      );
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="flex h-full w-[270px] flex-shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
        <span className="text-sm font-semibold text-slate-900">
          Archived File Details
        </span>

        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4 px-4 py-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex h-20 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-blue-100 bg-blue-50">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-[9px] font-bold uppercase text-blue-600">
              {extension}
            </span>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold leading-tight text-slate-900">
              {fileName}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Archived on {formatDate(selectedDocument.archived_at)}
            </p>
          </div>

          <div className="mt-1 flex w-full gap-2">
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {restoring ? "Restoring..." : "Restore"}
            </button>

            <button
              disabled
              title="Permanent delete endpoint is not enabled yet."
              className="flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 py-1.5 text-xs font-medium text-slate-400"
            >
              Purge
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Document Properties
          </p>

          <div className="space-y-2">
            <PropertyRow label="Type" value={extension.toUpperCase()} />
            <PropertyRow
              label="Size"
              value={formatFileSize(selectedDocument.file_size)}
            />
            <PropertyRow
              label="Status"
              value={selectedDocument.status || "-"}
            />
            <PropertyRow
              label="Location"
              value={getOriginalLocation(selectedDocument)}
            />
          </div>
        </div>

        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Archive Metadata
          </p>

          <div className="space-y-2">
            <span className="text-xs text-slate-500">Archived By</span>

            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-[8px] font-bold text-white">
                {getInitials(archiverName)}
              </div>
              <span className="text-xs font-medium text-slate-900">
                {archiverName}
              </span>
            </div>

            <div className="mt-1">
              <span className="mb-1.5 block text-xs text-slate-500">
                Archive Reason
              </span>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs italic text-slate-600">
                "{selectedDocument.archive_reason || "No reason provided."}"
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
          </svg>

          <p className="text-[10px] leading-relaxed text-blue-700">
            Restoring this document will return it to active documents. It will
            remain linked to{" "}
            <span className="font-medium text-blue-800">
              {getOriginalLocation(selectedDocument)}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="truncate text-right text-xs font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}