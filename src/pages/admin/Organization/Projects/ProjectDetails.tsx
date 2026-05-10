import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BrainCircuit,
  Bug,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Loader2,
  LockKeyhole,
  MapPin,
  Radar,
  RefreshCcw,
  ScanSearch,
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
  getDocumentAccessStatus,
  getDocuments,
  getProject,
  openDocumentInNewTab,
  saveDocumentToDevice,
  scanDocument,
  testDocumentSandbox,
} from "../../../../services/dmsApi";
import type { DmsDocument, ProjectSummary } from "../../../../services/dmsApi";

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

function toLower(value?: string | null): string {
  return value ? value.toLowerCase() : "";
}

function getReadableStatus(value?: string | null): string {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function formatDate(date?: string | null): string {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "—";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size = size / 1024;
    index += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[index]}`;
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
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "planned":
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
    case "blocked":
    case "unsafe":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "archived":
    case "completed":
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";
    default:
      return "border-slate-700 bg-slate-900 text-slate-300";
  }
}

function getSecurityClass(value?: string | null): string {
  switch (toLower(value)) {
    case "public":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "internal":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "confidential":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    case "restricted":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-slate-700 bg-slate-900 text-slate-300";
  }
}

function isCleanDocument(document: DmsDocument): boolean {
  return ["clean", "passed"].includes(toLower(document.scan_status));
}

function isPendingDocument(document: DmsDocument): boolean {
  return (
    ["pending", "scanning", "suspicious"].includes(toLower(document.scan_status)) ||
    ["quarantined", "pending_scan", "scanning"].includes(toLower(document.status))
  );
}

function isBlockedDocument(document: DmsDocument): boolean {
  return (
    ["infected", "failed", "unsafe"].includes(toLower(document.scan_status)) ||
    ["infected", "rejected", "blocked"].includes(toLower(document.status))
  );
}

function getScanButtonLabel(document: DmsDocument): string {
  if (isCleanDocument(document)) return "Re-scan";
  if (toLower(document.scan_status) === "scanning") return "Scanning...";
  return "Scan Now";
}

function makeActionKey(id: number | string, action: DocumentAction): string {
  return `${id}-${action}`;
}

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError;

  if (apiError.status === 401) return "Your session expired. Please login again.";
  if (apiError.status === 403) return apiError.message || "Permission denied.";

  return apiError.message || "Action failed. Please try again.";
}

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DmsDocument | null>(null);

  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const [alert, setAlert] = useState<AlertState | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionLoadingKey, setActionLoadingKey] = useState("");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const projectNumberId = Number(projectId);

  async function loadProject(): Promise<void> {
    if (!projectId) return;

    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getProject(projectId);

      setProject(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadDocuments(): Promise<void> {
    if (!projectId) return;

    try {
      setDocumentsLoading(true);

      const data = await getDocuments({
        project_id: projectId,
      });

      setDocuments(data);

      setSelectedDocument((current) => {
        if (!data.length) return null;
        if (!current) return data[0];

        return data.find((document) => document.id === current.id) || data[0];
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setDocumentsLoading(false);
    }
  }

  async function loadAll(): Promise<void> {
    await Promise.all([loadProject(), loadDocuments()]);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function updateDocumentInState(updated: DmsDocument): void {
    setDocuments((current) =>
      current.map((document) => (document.id === updated.id ? updated : document))
    );

    setSelectedDocument((current) =>
      current?.id === updated.id ? updated : current
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
          type: response.access?.is_safe_to_open ? "success" : "info",
          message:
            response.access?.reason_blocked ||
            `Access checked. View: ${
              response.access?.can_view ? "Yes" : "No"
            }, Download: ${response.access?.can_download ? "Yes" : "No"}.`,
        });

        return;
      }

      if (action === "open") {
        await openDocumentInNewTab(document.id);
        setAlert({
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
        setAlert({
          type: "success",
          message: "Document downloaded using secure access controller.",
        });
        return;
      }

      if (action === "scan") {
        const response = await scanDocument(document.id);
        updateDocumentInState(response.document);
        setAlert({
          type: isCleanDocument(response.document) ? "success" : "info",
          message: `Scan completed. Status: ${getReadableStatus(
            response.document.scan_status
          )}.`,
        });
        await loadDocuments();
        return;
      }

      if (action === "sandbox") {
        const response = await testDocumentSandbox(document.id);
        updateDocumentInState(response.document);
        setAlert({
          type: "success",
          message: "Sandbox test completed.",
        });
        await loadDocuments();
        return;
      }

      if (action === "plaintext") {
        const response = await extractDocumentPlaintext(document.id);
        updateDocumentInState(response.document);
        setAlert({
          type: "success",
          message: "Plaintext / OCR extraction completed.",
        });
        await loadDocuments();
        return;
      }

      if (action === "encrypt") {
        const response = await encryptDocument(document.id);
        updateDocumentInState(response.document);
        setAlert({
          type: "success",
          message: "Document encryption completed.",
        });
        await loadDocuments();
        return;
      }

      if (action === "ai") {
        const response = await analyzeDocumentWithAi(document.id);
        updateDocumentInState(response.document);
        setAlert({
          type: "success",
          message: "AI analysis completed.",
        });
        await loadDocuments();
      }
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
  const pendingDocuments = documents.filter(isPendingDocument).length;
  const blockedDocuments = documents.filter(isBlockedDocument).length;

  const encryptedDocuments = useMemo(() => {
    return documents.filter((document) =>
      ["encrypted", "completed", "done"].includes(toLower(document.encryption_status))
    ).length;
  }, [documents]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#07111F] text-slate-300">
        <AdminSidebar />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 size={22} className="animate-spin" />
            Loading project workspace...
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen bg-[#07111F] text-slate-300">
        <AdminSidebar />
        <main className="flex flex-1 flex-col items-center justify-center">
          <AlertCircle size={42} className="mb-4 text-red-300" />
          <p className="text-lg font-semibold text-white">Project not found</p>
          <Link
            to="/projects"
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white"
          >
            Back to Projects
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#07111F] font-sans text-slate-300">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-800/80 bg-[#07111F]/95 px-4 py-4 backdrop-blur-xl lg:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Link to="/projects" className="hover:text-white">
                  Projects
                </Link>
                <span>{">"}</span>
                <span className="text-slate-200">{project.name}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-white lg:text-2xl">
                  {project.name}
                </h1>

                <span
                  className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(
                    project.status
                  )}`}
                >
                  {getReadableStatus(project.status)}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs ${getSecurityClass(
                    project.security_level
                  )}`}
                >
                  {getReadableStatus(project.security_level)}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {project.code || "No code"} •{" "}
                {getReadableStatus(project.project_type)} •{" "}
                {project.location_name || "No location"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft size={16} />
                Back
              </Link>

              <button
                type="button"
                onClick={loadAll}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
              >
                <UploadCloud size={16} />
                Upload Project Document
              </button>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-6">
          {alert && (
            <AlertBox
              type={alert.type}
              message={alert.message}
              className="mb-5"
              onClose={() => setAlert(null)}
            />
          )}

          {errorMessage && (
            <AlertBox type="error" message={errorMessage} className="mb-5" />
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              title="Documents"
              value={String(totalDocuments)}
              helper="All documents in project"
              icon={<FileText size={18} />}
            />

            <SummaryCard
              title="Scanned Clean"
              value={String(cleanDocuments)}
              helper="Green = scan passed"
              icon={<ShieldCheck size={18} />}
              tone="success"
            />

            <SummaryCard
              title="Pending"
              value={String(pendingDocuments)}
              helper="Waiting for security"
              icon={<Clock3 size={18} />}
              tone="warning"
            />

            <SummaryCard
              title="Blocked"
              value={String(blockedDocuments)}
              helper="Failed or infected"
              icon={<ShieldAlert size={18} />}
              tone="danger"
            />

            <SummaryCard
              title="Encrypted"
              value={String(encryptedDocuments)}
              helper="Protected at rest"
              icon={<LockKeyhole size={18} />}
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="mb-4 flex items-center gap-2 text-white">
                <Building2 size={18} className="text-blue-300" />
                <h2 className="font-semibold">Project Overview</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoBox
                  icon={<FolderOpen size={16} />}
                  label="Project Type"
                  value={getReadableStatus(project.project_type)}
                />
                <InfoBox
                  icon={<MapPin size={16} />}
                  label="Location"
                  value={project.location_name || "—"}
                />
                <InfoBox
                  icon={<ShieldCheck size={16} />}
                  label="Security Level"
                  value={getReadableStatus(project.security_level)}
                />
                <InfoBox
                  icon={<Clock3 size={16} />}
                  label="Timeline"
                  value={`${formatDate(project.start_date)} → ${formatDate(
                    project.end_date
                  )}`}
                />
              </div>

              {project.description && (
                <div className="mt-5 rounded-2xl border border-slate-800 bg-[#07111F] p-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                    Description
                  </p>
                  <p className="text-sm leading-6 text-slate-300">
                    {project.description}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-blue-100">
                <ShieldCheck size={18} />
                <h2 className="font-semibold">Project Document Rule</h2>
              </div>

              <p className="text-sm leading-7 text-blue-100/80">
                Documents uploaded here are automatically attached to this
                project. They must pass quarantine, scan, sandbox if needed,
                plaintext extraction, and encryption before active use.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_360px]">
            <ProjectDocumentsTable
              documents={documents}
              loading={documentsLoading}
              selectedDocument={selectedDocument}
              actionLoadingKey={actionLoadingKey}
              onSelectDocument={setSelectedDocument}
              onDocumentAction={runDocumentAction}
            />

            <SelectedDocumentPanel
              document={selectedDocument}
              actionLoadingKey={actionLoadingKey}
              onDocumentAction={runDocumentAction}
              onClose={() => setSelectedDocument(null)}
            />
          </div>
        </section>
      </main>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="relative h-[92vh] w-full max-w-7xl overflow-hidden rounded-3xl border border-slate-800 bg-[#0f172a] shadow-2xl">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-4 top-4 z-20 rounded-xl border border-slate-700 bg-slate-900/90 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X size={18} />
            </button>

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
                      "Document uploaded under this project and submitted to security pipeline.",
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

function ProjectDocumentsTable({
  documents,
  loading,
  selectedDocument,
  actionLoadingKey,
  onSelectDocument,
  onDocumentAction,
}: {
  documents: DmsDocument[];
  loading: boolean;
  selectedDocument: DmsDocument | null;
  actionLoadingKey: string;
  onSelectDocument: (document: DmsDocument) => void;
  onDocumentAction: (document: DmsDocument, action: DocumentAction) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60">
      <div className="border-b border-slate-800 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-white">Project Documents</h2>
            <p className="mt-1 text-xs text-slate-500">
              Documents attached to this project only.
            </p>
          </div>

          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
            {documents.length} document(s)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="p-4">Document</th>
              <th className="p-4">Category</th>
              <th className="p-4">Scan</th>
              <th className="p-4">Pipeline</th>
              <th className="p-4">Size</th>
              <th className="p-4">Modified</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-3 text-slate-400">
                    <Loader2 size={20} className="animate-spin" />
                    Loading project documents...
                  </div>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  <p className="font-medium text-white">No document yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload the first document for this project.
                  </p>
                </td>
              </tr>
            ) : (
              documents.map((document) => {
                const isSelected = selectedDocument?.id === document.id;
                const isScanning =
                  actionLoadingKey === makeActionKey(document.id, "scan");

                return (
                  <tr
                    key={document.id}
                    onClick={() => onSelectDocument(document)}
                    className={`cursor-pointer border-b border-slate-800 transition hover:bg-slate-900/80 ${
                      isSelected ? "bg-blue-950/30" : ""
                    }`}
                  >
                    <td className="p-4">
                      <p className="font-medium text-white">
                        {document.original_file_name || document.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {document.document_code || "No code"}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300">
                        {document.category?.name || "—"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs ${getStatusClass(
                          document.scan_status
                        )}`}
                      >
                        {getReadableStatus(document.scan_status)}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        <SmallBadge label="Text" value={document.plaintext_status} />
                        <SmallBadge label="Box" value={document.sandbox_status} />
                        <SmallBadge
                          label="Encrypt"
                          value={document.encryption_status}
                        />
                      </div>
                    </td>

                    <td className="p-4 text-slate-400">
                      {formatBytes(document.file_size)}
                    </td>

                    <td className="p-4 text-slate-400">
                      {formatDate(document.updated_at || document.created_at)}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        disabled={isScanning}
                        onClick={(event) => {
                          event.stopPropagation();
                          onDocumentAction(document, "scan");
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-60"
                      >
                        {isScanning ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Bug size={14} />
                        )}
                        {isScanning ? "Scanning..." : getScanButtonLabel(document)}
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
  );
}

function SelectedDocumentPanel({
  document,
  actionLoadingKey,
  onDocumentAction,
  onClose,
}: {
  document: DmsDocument | null;
  actionLoadingKey: string;
  onDocumentAction: (document: DmsDocument, action: DocumentAction) => void;
  onClose: () => void;
}) {
  if (!document) {
    return (
      <aside className="hidden rounded-3xl border border-slate-800 bg-slate-950/60 p-6 2xl:block">
        <div className="mt-20 text-center text-sm text-slate-500">
          Select a document to see security details.
        </div>
      </aside>
    );
  }

  const isLoading = (action: DocumentAction) =>
    actionLoadingKey === makeActionKey(document.id, action);

  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Document Details</h2>
          <p className="mt-1 text-xs text-slate-500">
            Security and project document actions.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-[#07111F] p-4">
        <p className="font-medium text-white">
          {document.original_file_name || document.title}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {document.document_code || "No code"}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2">
        <ActionButton
          label="Check"
          icon={<ShieldCheck size={15} />}
          loading={isLoading("check_access")}
          onClick={() => onDocumentAction(document, "check_access")}
        />

        <ActionButton
          label="Open"
          icon={<Eye size={15} />}
          loading={isLoading("open")}
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

      <div className="mb-6 rounded-2xl border border-slate-800 bg-[#07111F] p-4">
        <div className="mb-4 flex items-center gap-2 text-white">
          <ShieldCheck size={17} className="text-blue-300" />
          <h3 className="text-sm font-semibold">Security Pipeline</h3>
        </div>

        <div className="space-y-2">
          <PipelineRow label="Document" value={document.status} />
          <PipelineRow label="Antivirus" value={document.scan_status} />
          <PipelineRow label="Sandbox" value={document.sandbox_status} />
          <PipelineRow label="Plaintext" value={document.plaintext_status} />
          <PipelineRow label="Encryption" value={document.encryption_status} />
          <PipelineRow label="AI" value={document.ai_status} />
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-[#07111F] p-4">
        <div className="mb-4 flex items-center gap-2 text-white">
          <Radar size={17} className="text-emerald-300" />
          <h3 className="text-sm font-semibold">Controller Actions</h3>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <ActionButton
            label="Run Sandbox"
            icon={<Radar size={15} />}
            loading={isLoading("sandbox")}
            onClick={() => onDocumentAction(document, "sandbox")}
          />

          <ActionButton
            label="Extract Plaintext / OCR"
            icon={<ScanSearch size={15} />}
            loading={isLoading("plaintext")}
            onClick={() => onDocumentAction(document, "plaintext")}
          />

          <ActionButton
            label="Encrypt Document"
            icon={<LockKeyhole size={15} />}
            loading={isLoading("encrypt")}
            onClick={() => onDocumentAction(document, "encrypt")}
          />

          <ActionButton
            label="Analyze AI"
            icon={<BrainCircuit size={15} />}
            loading={isLoading("ai")}
            onClick={() => onDocumentAction(document, "ai")}
          />
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <DetailRow label="Title" value={document.title || "—"} />
        <DetailRow label="Category" value={document.category?.name || "—"} />
        <DetailRow label="Status" value={getReadableStatus(document.status)} />
        <DetailRow label="Scan" value={getReadableStatus(document.scan_status)} />
        <DetailRow label="Size" value={formatBytes(document.file_size)} />
        <DetailRow label="Uploader" value={document.uploader?.name || "—"} />
        <DetailRow label="Created" value={formatDate(document.created_at)} />
      </div>
    </aside>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#07111F] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        <span className="text-blue-300">{icon}</span>
        {label}
      </div>
      <p className="font-medium text-white">{value || "—"}</p>
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
      className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${style} ${className}`}
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

function SummaryCard({
  title,
  value,
  helper,
  icon,
  tone = "default",
}: {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    default: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    warning: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    danger: "bg-red-500/10 text-red-300 border-red-500/20",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-600">{helper}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SmallBadge({
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

function PipelineRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(
          value
        )}`}
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
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      {label}
    </button>
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
    <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3 last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[190px] break-words text-right text-slate-200">
        {value || "—"}
      </span>
    </div>
  );
}