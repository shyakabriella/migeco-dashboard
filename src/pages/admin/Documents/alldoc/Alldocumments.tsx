import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  Archive as ArchiveIcon,
  Bell,
  BrainCircuit,
  Bug,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Eye,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Files,
  Filter,
  FolderOpen,
  Loader2,
  LockKeyhole,
  Plus,
  Radar,
  RefreshCcw,
  ScanSearch,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Star,
  UploadCloud,
  UserCircle2,
  Workflow,
  X,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import AdminSidebar from "../../AdminSidebar";
import {
  analyzeDocumentWithAi,
  analyzePendingDocumentsWithAi,
  applyAiSuggestions,
  createDocumentCategory,
  encryptCleanDocuments,
  encryptDocument,
  extractDocumentPlaintext,
  extractPendingDocumentsPlaintext,
  getAiSummary,
  getEncryptionLogs,
  getEncryptionSummary,
  getSandboxLogs,
  getSandboxSummary,
  getDocumentAccessStatus,
  getDocumentAiAnalysis,
  getDocumentCategories,
  getDocuments,
  openDocumentInNewTab,
  saveDocumentToDevice,
  verifyEncryptedDocument,
  rejectUnsafeSandboxDocument,
  scanDocument,
  scanPendingDocuments,
  testDocumentSandbox,
  testPendingDocumentsSandbox,
} from "../../../../services/dmsApi";
import type {
  AiApplySuggestionsPayload,
  AiSummary,
  CreateDocumentCategoryPayload,
  DocumentAccessStatus,
  DocumentAiAnalysisResponse,
  DmsDocument,
  DocumentCategory,
  DocumentFilters,
  EncryptionLog,
  EncryptionSummary,
  SandboxLog,
  SandboxSummary,
} from "../../../../services/dmsApi";

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

type CategoryFormState = {
  name: string;
  description: string;
  status: "active" | "inactive";
  sort_order: string;
};

const emptyCategoryForm: CategoryFormState = {
  name: "",
  description: "",
  status: "active",
  sort_order: "0",
};

type DocumentAction =
  | "check_access"
  | "open"
  | "download"
  | "scan"
  | "sandbox"
  | "reject_unsafe"
  | "plaintext"
  | "encrypt"
  | "verify_encryption"
  | "ai";

type BatchAction =
  | "scan_pending"
  | "sandbox_pending"
  | "extract_pending"
  | "encrypt_clean"
  | "ai_pending";

type ScanUiState = {
  label: string;
  helper: string;
  buttonLabel: string;
  badgeClass: string;
  iconClass: string;
};

type AccessUiState = {
  label: string;
  helper: string;
  badgeClass: string;
  iconClass: string;
};

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Uploaded", value: "uploaded" },
  { label: "Pending Scan", value: "pending_scan" },
  { label: "Scanning", value: "scanning" },
  { label: "Clean / Active", value: "active" },
  { label: "Quarantined", value: "quarantined" },
  { label: "Suspicious", value: "suspicious" },
  { label: "Infected", value: "infected" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
];

const scanStatusOptions = [
  { label: "All Scan Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Clean", value: "clean" },
  { label: "Suspicious", value: "suspicious" },
  { label: "Infected", value: "infected" },
  { label: "Failed", value: "failed" },
];

function toLower(value?: string | null): string {
  return value ? value.toLowerCase() : "";
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "—";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size = size / 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(date?: string | null): string {
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

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const names = name.trim().split(" ").filter(Boolean);

  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }

  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
}

function getReadableStatus(status?: string | null): string {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
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

function normalizeAiTags(tags?: string[] | string | null): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function getFileIcon(document: DmsDocument): ReactNode {
  const extension = document.extension?.toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "tif", "tiff"].includes(extension || "")) {
    return <FileImage size={18} className="text-emerald-400" />;
  }

  if (["xls", "xlsx", "csv"].includes(extension || "")) {
    return <FileSpreadsheet size={18} className="text-green-400" />;
  }

  if (["dwg", "dxf", "zip", "rar"].includes(extension || "")) {
    return <FileArchive size={18} className="text-orange-400" />;
  }

  if (extension === "pdf") {
    return <FileText size={18} className="text-red-400" />;
  }

  return <FileText size={18} className="text-blue-400" />;
}

function getStatusClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
    case "clean":
    case "approved":
    case "published":
    case "safe":
    case "extracted":
    case "encrypted":
    case "analyzed":
    case "passed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "pending_scan":
    case "uploaded":
    case "scanning":
    case "under_review":
    case "submitted":
    case "pending":
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
      return "border-gray-500/20 bg-gray-500/10 text-gray-300";
    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }
}

function getScanUiState(document: DmsDocument): ScanUiState {
  const scanStatus = toLower(document.scan_status);
  const documentStatus = toLower(document.status);

  if (scanStatus === "clean" || scanStatus === "passed") {
    return {
      label: "Scanned Clean",
      helper: "This document has passed antivirus scan.",
      buttonLabel: "Re-scan",
      badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      iconClass: "text-emerald-300",
    };
  }

  if (scanStatus === "scanning" || documentStatus === "scanning") {
    return {
      label: "Scanning",
      helper: "Antivirus scan is currently running.",
      buttonLabel: "Scanning...",
      badgeClass: "border-blue-500/20 bg-blue-500/10 text-blue-300",
      iconClass: "text-blue-300",
    };
  }

  if (scanStatus === "pending" || documentStatus === "quarantined") {
    return {
      label: "Not Scanned",
      helper: "This document is waiting for mandatory antivirus scan.",
      buttonLabel: "Scan Now",
      badgeClass: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
      iconClass: "text-yellow-300",
    };
  }

  if (scanStatus === "suspicious") {
    return {
      label: "Suspicious",
      helper: "This document needs security review or sandbox testing.",
      buttonLabel: "Re-scan",
      badgeClass: "border-orange-500/20 bg-orange-500/10 text-orange-300",
      iconClass: "text-orange-300",
    };
  }

  if (scanStatus === "infected") {
    return {
      label: "Infected",
      helper: "This document is blocked because malware was detected.",
      buttonLabel: "Re-scan",
      badgeClass: "border-red-500/20 bg-red-500/10 text-red-300",
      iconClass: "text-red-300",
    };
  }

  if (scanStatus === "failed") {
    return {
      label: "Scan Failed",
      helper: "The previous scan failed. Run re-scan after fixing scanner issue.",
      buttonLabel: "Re-scan",
      badgeClass: "border-red-500/20 bg-red-500/10 text-red-300",
      iconClass: "text-red-300",
    };
  }

  return {
    label: "Unknown",
    helper: "Scan status is unknown. You can run scan again.",
    buttonLabel: "Scan Now",
    badgeClass: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    iconClass: "text-slate-300",
  };
}


function getAccessUiState(document: DmsDocument): AccessUiState {
  const status = toLower(document.status);
  const scanStatus = toLower(document.scan_status);
  const sandboxStatus = toLower(document.sandbox_status);

  if (["infected", "rejected", "blocked"].includes(status)) {
    return {
      label: "Access Blocked",
      helper: "This document cannot be opened because it is blocked or rejected.",
      badgeClass: "border-red-500/20 bg-red-500/10 text-red-300",
      iconClass: "text-red-300",
    };
  }

  if (["quarantined", "uploaded", "pending_scan", "scanning"].includes(status)) {
    return {
      label: "Not Ready",
      helper: "The document is not ready for opening until security checks finish.",
      badgeClass: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
      iconClass: "text-yellow-300",
    };
  }

  if (scanStatus !== "clean" && scanStatus !== "passed") {
    return {
      label: "Scan Required",
      helper: "The document must pass antivirus scan before view or download.",
      badgeClass: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
      iconClass: "text-yellow-300",
    };
  }

  if (["unsafe", "failed"].includes(sandboxStatus)) {
    return {
      label: "Sandbox Blocked",
      helper: "Sandbox result blocks access to this document.",
      badgeClass: "border-red-500/20 bg-red-500/10 text-red-300",
      iconClass: "text-red-300",
    };
  }

  if (sandboxStatus !== "safe") {
    return {
      label: "Sandbox Pending",
      helper: "The document must pass sandbox inspection before access.",
      badgeClass: "border-orange-500/20 bg-orange-500/10 text-orange-300",
      iconClass: "text-orange-300",
    };
  }

  return {
    label: "Access Ready",
    helper: "This document passed access safety checks locally. Server permission is still checked before opening.",
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    iconClass: "text-emerald-300",
  };
}

function isCleanDocument(document: DmsDocument): boolean {
  const status = toLower(document.status);
  const scanStatus = toLower(document.scan_status);

  return (
    status === "active" ||
    status === "clean" ||
    scanStatus === "clean" ||
    scanStatus === "passed"
  );
}

function isPendingDocument(document: DmsDocument): boolean {
  const status = toLower(document.status);
  const scanStatus = toLower(document.scan_status);

  return (
    ["uploaded", "pending_scan", "scanning", "quarantined", "suspicious"].includes(
      status
    ) || ["pending", "scanning", "suspicious"].includes(scanStatus)
  );
}

function isBlockedDocument(document: DmsDocument): boolean {
  const status = toLower(document.status);
  const scanStatus = toLower(document.scan_status);
  const sandboxStatus = toLower(document.sandbox_status);

  return (
    ["infected", "rejected", "blocked"].includes(status) ||
    ["infected", "failed", "unsafe"].includes(scanStatus) ||
    ["unsafe", "failed"].includes(sandboxStatus)
  );
}

function isPlaintextExtracted(document: DmsDocument): boolean {
  return toLower(document.plaintext_status) === "extracted";
}

function canExtractPlaintext(document: DmsDocument): boolean {
  return (
    toLower(document.status) === "active" &&
    toLower(document.scan_status) === "clean" &&
    !["infected", "rejected", "blocked"].includes(toLower(document.status))
  );
}

function canRunAi(document: DmsDocument): boolean {
  return (
    toLower(document.status) === "active" &&
    toLower(document.scan_status) === "clean" &&
    toLower(document.sandbox_status) === "safe" &&
    isPlaintextExtracted(document)
  );
}

function isSandboxSafeDocument(document: DmsDocument): boolean {
  return toLower(document.sandbox_status) === "safe";
}

function canRunSandbox(document: DmsDocument): boolean {
  const sandboxStatus = toLower(document.sandbox_status);

  return (
    toLower(document.status) === "active" &&
    toLower(document.scan_status) === "clean" &&
    !["infected", "rejected", "blocked"].includes(toLower(document.status)) &&
    !["safe", "pending"].includes(sandboxStatus)
  );
}

function canRejectUnsafeSandbox(document: DmsDocument): boolean {
  return toLower(document.sandbox_status) === "unsafe";
}

function isEncryptedDocument(document: DmsDocument): boolean {
  return toLower(document.encryption_status) === "encrypted";
}

function canEncryptDocument(document: DmsDocument): boolean {
  const encryptionStatus = toLower(document.encryption_status);

  return (
    toLower(document.status) === "active" &&
    toLower(document.scan_status) === "clean" &&
    ["not_encrypted", "failed", "", "unknown"].includes(encryptionStatus || "")
  );
}

function canVerifyEncryption(document: DmsDocument): boolean {
  return isEncryptedDocument(document);
}

function makeActionKey(id: number | string, action: DocumentAction): string {
  return `${id}-${action}`;
}

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError;

  if (apiError?.message) return apiError.message;

  return "Action failed. Please try again.";
}

export default function Alldocuments() {
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DmsDocument | null>(
    null
  );
  const [selectedAccessStatus, setSelectedAccessStatus] =
    useState<DocumentAccessStatus | null>(null);
  const [accessStatusLoading, setAccessStatusLoading] = useState<boolean>(false);
  const [encryptionSummary, setEncryptionSummary] =
    useState<EncryptionSummary | null>(null);
  const [encryptionSummaryLoading, setEncryptionSummaryLoading] =
    useState<boolean>(false);
  const [selectedEncryptionLogs, setSelectedEncryptionLogs] = useState<
    EncryptionLog[]
  >([]);
  const [encryptionLogsLoading, setEncryptionLogsLoading] =
    useState<boolean>(false);

  const [sandboxSummary, setSandboxSummary] = useState<SandboxSummary | null>(
    null
  );
  const [sandboxSummaryLoading, setSandboxSummaryLoading] =
    useState<boolean>(false);
  const [selectedSandboxLogs, setSelectedSandboxLogs] = useState<SandboxLog[]>(
    []
  );
  const [sandboxLogsLoading, setSandboxLogsLoading] =
    useState<boolean>(false);

  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [scanStatus, setScanStatus] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [categoryForm, setCategoryForm] =
    useState<CategoryFormState>(emptyCategoryForm);
  const [categoryFormError, setCategoryFormError] = useState<string>("");
  const [categorySaving, setCategorySaving] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [actionMessage, setActionMessage] = useState<AlertState | null>(null);
  const [actionLoadingKey, setActionLoadingKey] = useState<string>("");
  const [batchLoadingAction, setBatchLoadingAction] =
    useState<BatchAction | null>(null);

  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState<boolean>(false);
  const [selectedAiAnalysis, setSelectedAiAnalysis] =
    useState<DocumentAiAnalysisResponse | null>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState<boolean>(false);
  const [aiApplyLoading, setAiApplyLoading] = useState<boolean>(false);

  const filters: DocumentFilters = useMemo(() => {
    return {
      search,
      status,
      scan_status: scanStatus,
      document_category_id: categoryId,
    };
  }, [search, status, scanStatus, categoryId]);

  function updateDocumentInState(updatedDocument: DmsDocument): void {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === updatedDocument.id ? updatedDocument : document
      )
    );

    setSelectedDocument((currentDocument) =>
      currentDocument?.id === updatedDocument.id
        ? updatedDocument
        : currentDocument
    );
  }

  async function loadDocuments(): Promise<void> {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getDocuments(filters);

      setDocuments(data);

      setSelectedDocument((current) => {
        if (!data.length) return null;

        if (!current) return data[0];

        const stillExists = data.find((document) => document.id === current.id);

        return stillExists || data[0];
      });
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 401) {
        setErrorMessage("Your session expired. Please login again.");
      } else if (apiError.status === 403) {
        setErrorMessage("You do not have permission to view these documents.");
      } else {
        setErrorMessage(
          apiError.message || "Failed to load documents. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories(): Promise<void> {
    try {
      setCategoriesLoading(true);

      const data = await getDocumentCategories({});

      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }

  function openCategoryModal(): void {
    setCategoryForm(emptyCategoryForm);
    setCategoryFormError("");
    setIsCategoryModalOpen(true);
  }

  function closeCategoryModal(): void {
    if (categorySaving) return;

    setIsCategoryModalOpen(false);
    setCategoryForm(emptyCategoryForm);
    setCategoryFormError("");
  }

  function handleCategoryFormChange(
    field: keyof CategoryFormState,
    value: string
  ): void {
    setCategoryForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleCreateCategory(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const name = categoryForm.name.trim();

    if (!name) {
      setCategoryFormError("Category name is required.");
      return;
    }

    try {
      setCategorySaving(true);
      setCategoryFormError("");

      const payload: CreateDocumentCategoryPayload = {
        name,
        description: categoryForm.description.trim() || null,
        status: categoryForm.status,
        sort_order: Number(categoryForm.sort_order || 0),
      };

      const newCategory = await createDocumentCategory(payload);

      await loadCategories();
      setCategoryId(String(newCategory.id));
      setIsCategoryModalOpen(false);
      setCategoryForm(emptyCategoryForm);

      setActionMessage({
        type: "success",
        message: "Category created successfully and selected for filtering.",
      });
    } catch (error) {
      setCategoryFormError(getErrorMessage(error));
    } finally {
      setCategorySaving(false);
    }
  }

  async function loadSelectedAccessStatus(document: DmsDocument): Promise<DocumentAccessStatus | null> {
    try {
      setAccessStatusLoading(true);

      const data = await getDocumentAccessStatus(document.id);

      setSelectedAccessStatus(data);

      return data;
    } catch (error) {
      setSelectedAccessStatus(null);

      setActionMessage({
        type: "error",
        message: getErrorMessage(error),
      });

      return null;
    } finally {
      setAccessStatusLoading(false);
    }
  }


  async function loadSandboxSummary(): Promise<void> {
    try {
      setSandboxSummaryLoading(true);

      const data = await getSandboxSummary();

      setSandboxSummary(data);
    } catch {
      setSandboxSummary(null);
    } finally {
      setSandboxSummaryLoading(false);
    }
  }

  async function loadSelectedSandboxLogs(document: DmsDocument): Promise<void> {
    try {
      setSandboxLogsLoading(true);

      const data = await getSandboxLogs({
        document_id: document.id,
      });

      setSelectedSandboxLogs(data.slice(0, 5));
    } catch {
      setSelectedSandboxLogs([]);
    } finally {
      setSandboxLogsLoading(false);
    }
  }

  async function loadEncryptionSummary(): Promise<void> {
    try {
      setEncryptionSummaryLoading(true);

      const data = await getEncryptionSummary();

      setEncryptionSummary(data);
    } catch {
      setEncryptionSummary(null);
    } finally {
      setEncryptionSummaryLoading(false);
    }
  }

  async function loadSelectedEncryptionLogs(document: DmsDocument): Promise<void> {
    try {
      setEncryptionLogsLoading(true);

      const data = await getEncryptionLogs({
        document_id: document.id,
      });

      setSelectedEncryptionLogs(data.slice(0, 5));
    } catch {
      setSelectedEncryptionLogs([]);
    } finally {
      setEncryptionLogsLoading(false);
    }
  }

  async function loadAiSummary(): Promise<void> {
    try {
      setAiSummaryLoading(true);

      const data = await getAiSummary();

      setAiSummary(data);
    } catch {
      setAiSummary(null);
    } finally {
      setAiSummaryLoading(false);
    }
  }

  async function loadSelectedAiAnalysis(document: DmsDocument): Promise<void> {
    try {
      setAiAnalysisLoading(true);
      setSelectedAiAnalysis(null);

      const data = await getDocumentAiAnalysis(document.id);

      setSelectedAiAnalysis(data);
    } catch {
      setSelectedAiAnalysis(null);
    } finally {
      setAiAnalysisLoading(false);
    }
  }

  async function handleApplyAiSuggestions(
    document: DmsDocument,
    payload: AiApplySuggestionsPayload
  ): Promise<void> {
    try {
      setAiApplyLoading(true);
      setActionMessage(null);

      const updatedDocument = await applyAiSuggestions(document.id, payload);

      updateDocumentInState(updatedDocument);

      setActionMessage({
        type: "success",
        message: "AI suggestions applied to document metadata successfully.",
      });

      await loadDocuments();
      await loadSelectedAiAnalysis(updatedDocument);
    } catch (error) {
      setActionMessage({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setAiApplyLoading(false);
    }
  }

  async function runDocumentAction(
    document: DmsDocument,
    action: DocumentAction
  ): Promise<void> {
    const actionKey = makeActionKey(document.id, action);

    try {
      setActionLoadingKey(actionKey);
      setActionMessage(null);

      if (action === "check_access") {
        const response = await getDocumentAccessStatus(document.id);

        setSelectedAccessStatus(response);

        const isSafe = response.access?.is_safe_to_open;
        const canView = response.access?.can_view;
        const canDownload = response.access?.can_download;
        const isEncrypted = response.access?.is_encrypted;
        const isSandboxSafe = response.access?.is_sandbox_safe;

        setActionMessage({
          type: isSafe && canView ? "success" : "info",
          message:
            isSafe && canView
              ? `Access allowed. View: ${canView ? "Yes" : "No"}, Download: ${
                  canDownload ? "Yes" : "No"
                }, Encrypted: ${isEncrypted ? "Yes" : "No"}, Sandbox safe: ${
                  isSandboxSafe ? "Yes" : "No"
                }.`
              : response.access?.reason_blocked ||
                "Document access is not ready yet. Please check scan and sandbox status.",
        });

        return;
      }

      if (action === "open") {
        const response = await getDocumentAccessStatus(document.id);

        setSelectedAccessStatus(response);

        if (!response.access?.can_view || !response.access?.is_safe_to_open) {
          setActionMessage({
            type: "info",
            message:
              response.access?.reason_blocked ||
              "You cannot open this document yet. It must be safe and you must have view permission.",
          });

          return;
        }

        await openDocumentInNewTab(document.id);

        setActionMessage({
          type: "success",
          message: response.access?.is_encrypted
            ? "Encrypted document was decrypted temporarily and opened securely."
            : "Document opened using secure access controller.",
        });

        return;
      }

      if (action === "download") {
        const response = await getDocumentAccessStatus(document.id);

        setSelectedAccessStatus(response);

        if (!response.access?.can_download || !response.access?.is_safe_to_open) {
          setActionMessage({
            type: "info",
            message:
              response.access?.reason_blocked ||
              "You cannot download this document yet. It must be safe and you must have download permission.",
          });

          return;
        }

        await saveDocumentToDevice(
          document.id,
          document.original_file_name || document.title || "document"
        );

        setActionMessage({
          type: "success",
          message: response.access?.is_encrypted
            ? "Encrypted document was decrypted temporarily and downloaded securely."
            : "Document downloaded using secure access controller.",
        });

        return;
      }

      if (action === "scan") {
        const scanUi = getScanUiState(document);
        const response = await scanDocument(document.id);

        updateDocumentInState(response.document);

        const updatedScanUi = getScanUiState(response.document);

        setActionMessage({
          type:
            toLower(response.document.scan_status) === "clean" ||
            toLower(response.document.scan_status) === "passed"
              ? "success"
              : "info",
          message:
            scanUi.buttonLabel === "Re-scan"
              ? `Re-scan completed. New status: ${updatedScanUi.label}.`
              : `Scan completed. New status: ${updatedScanUi.label}.`,
        });

        await loadDocuments();
        return;
      }

      if (action === "sandbox") {
        if (isSandboxSafeDocument(document)) {
          setActionMessage({
            type: "info",
            message: "This document is already sandbox safe.",
          });

          return;
        }

        if (!canRunSandbox(document)) {
          setActionMessage({
            type: "info",
            message:
              "Sandbox test can run only after the document is active and scanned clean. Safe or pending sandbox documents cannot be tested again here.",
          });

          return;
        }

        const response = await testDocumentSandbox(document.id);

        updateDocumentInState(response.document);

        setActionMessage({
          type:
            toLower(response.document.sandbox_status) === "safe"
              ? "success"
              : "info",
          message: `Sandbox test completed. New status: ${getReadableStatus(
            response.document.sandbox_status
          )}.`,
        });

        await loadDocuments();
        await loadSandboxSummary();
        await loadSelectedSandboxLogs(response.document);
        return;
      }

      if (action === "reject_unsafe") {
        if (!canRejectUnsafeSandbox(document)) {
          setActionMessage({
            type: "info",
            message: "Only unsafe sandbox documents can be rejected from sandbox review.",
          });

          return;
        }

        const updatedDocument = await rejectUnsafeSandboxDocument(document.id);

        updateDocumentInState(updatedDocument);

        setActionMessage({
          type: "success",
          message: "Unsafe document rejected successfully after sandbox review.",
        });

        await loadDocuments();
        await loadSandboxSummary();
        await loadSelectedSandboxLogs(updatedDocument);
        return;
      }

      if (action === "plaintext") {
        if (isPlaintextExtracted(document)) {
          setActionMessage({
            type: "info",
            message: "Plaintext/OCR is already extracted for this document.",
          });

          return;
        }

        if (!canExtractPlaintext(document)) {
          setActionMessage({
            type: "info",
            message:
              "Plaintext extraction can run only after the document is active and scanned clean.",
          });

          return;
        }

        const response = await extractDocumentPlaintext(document.id);

        updateDocumentInState(response.document);

        setActionMessage({
          type: "success",
          message:
            "Plaintext/OCR extraction completed successfully. AI can now run if sandbox status is safe.",
        });

        await loadDocuments();
        await loadAiSummary();
        return;
      }

      if (action === "encrypt") {
        if (isEncryptedDocument(document)) {
          setActionMessage({
            type: "info",
            message: "This document is already encrypted.",
          });

          return;
        }

        if (!canEncryptDocument(document)) {
          setActionMessage({
            type: "info",
            message:
              "Encryption can run only for active documents that passed antivirus scan and are not already encrypted.",
          });

          return;
        }

        const response = await encryptDocument(document.id);

        updateDocumentInState(response.document);

        setActionMessage({
          type: "success",
          message:
            "Document encryption completed successfully. Secure access will temporarily decrypt it when opening or downloading.",
        });

        await loadDocuments();
        await loadEncryptionSummary();
        await loadSelectedEncryptionLogs(response.document);
        return;
      }

      if (action === "verify_encryption") {
        if (!canVerifyEncryption(document)) {
          setActionMessage({
            type: "info",
            message: "This document is not encrypted yet. Encrypt it before verification.",
          });

          return;
        }

        await verifyEncryptedDocument(document.id);

        setActionMessage({
          type: "success",
          message: "Encrypted document verified successfully.",
        });

        await loadEncryptionSummary();
        await loadSelectedEncryptionLogs(document);
        return;
      }

      if (action === "ai") {
        let documentForAi = document;
        let extractedFirst = false;

        if (!isPlaintextExtracted(documentForAi)) {
          if (!canExtractPlaintext(documentForAi)) {
            setActionMessage({
              type: "info",
              message:
                "AI cannot run yet. First the document must be active and scanned clean so plaintext/OCR can be extracted.",
            });

            return;
          }

          const extractionResponse = await extractDocumentPlaintext(documentForAi.id);
          documentForAi = extractionResponse.document;
          extractedFirst = true;

          updateDocumentInState(documentForAi);
        }

        if (!canRunAi(documentForAi)) {
          setActionMessage({
            type: "info",
            message:
              "Plaintext/OCR is ready, but AI still needs the document to be active, scanned clean, and sandbox safe.",
          });

          await loadDocuments();
          return;
        }

        const response = await analyzeDocumentWithAi(documentForAi.id);

        updateDocumentInState(response.document);

        setActionMessage({
          type: "success",
          message: extractedFirst
            ? "Plaintext/OCR was extracted first, then AI analysis completed successfully."
            : "AI analysis completed successfully.",
        });

        await loadDocuments();
        await loadAiSummary();
        await loadSelectedAiAnalysis(response.document);
        return;
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

  async function runBatchAction(action: BatchAction): Promise<void> {
    try {
      setBatchLoadingAction(action);
      setActionMessage(null);

      if (action === "scan_pending") {
        const response = await scanPendingDocuments();

        setActionMessage({
          type: "success",
          message: `Pending scan completed. Total scanned: ${
            response.total_scanned ?? 0
          }.`,
        });
      }

      if (action === "sandbox_pending") {
        const response = await testPendingDocumentsSandbox();

        setActionMessage({
          type: "success",
          message: `Pending sandbox test completed. Total processed: ${
            response.total_processed ?? 0
          }.`,
        });

        await loadSandboxSummary();
      }

      if (action === "extract_pending") {
        const response = await extractPendingDocumentsPlaintext();

        setActionMessage({
          type: "success",
          message: `Pending plaintext extraction completed. Total processed: ${
            response.total_processed ?? 0
          }.`,
        });

        await loadAiSummary();
      }

      if (action === "encrypt_clean") {
        const response = await encryptCleanDocuments();

        setActionMessage({
          type: "success",
          message: `Clean document encryption completed. Total processed: ${
            response.total_processed ?? 0
          }.`,
        });

        await loadEncryptionSummary();
      }

      if (action === "ai_pending") {
        const response = await analyzePendingDocumentsWithAi();

        setActionMessage({
          type: "success",
          message: `Pending AI analysis completed. Total processed: ${
            response.total_processed ?? 0
          }.`,
        });

        await loadAiSummary();
      }

      await loadDocuments();
    } catch (error) {
      setActionMessage({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setBatchLoadingAction(null);
    }
  }

  useEffect(() => {
    loadCategories();
    loadAiSummary();
    loadEncryptionSummary();
    loadSandboxSummary();
  }, []);

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 450);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  useEffect(() => {
    if (!selectedDocument) {
      setSelectedAccessStatus(null);
      return;
    }

    loadSelectedAccessStatus(selectedDocument);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedDocument?.id,
    selectedDocument?.status,
    selectedDocument?.scan_status,
    selectedDocument?.sandbox_status,
    selectedDocument?.encryption_status,
  ]);


  useEffect(() => {
    if (!selectedDocument) {
      setSelectedSandboxLogs([]);
      return;
    }

    loadSelectedSandboxLogs(selectedDocument);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocument?.id, selectedDocument?.sandbox_status]);

  useEffect(() => {
    if (!selectedDocument) {
      setSelectedEncryptionLogs([]);
      return;
    }

    loadSelectedEncryptionLogs(selectedDocument);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocument?.id, selectedDocument?.encryption_status]);

  useEffect(() => {
    if (!selectedDocument) {
      setSelectedAiAnalysis(null);
      return;
    }

    if (toLower(selectedDocument.ai_status) === "analyzed") {
      loadSelectedAiAnalysis(selectedDocument);
    } else {
      setSelectedAiAnalysis(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocument?.id, selectedDocument?.ai_status]);

  const totalDocuments = documents.length;
  const cleanDocuments = documents.filter(isCleanDocument).length;
  const pendingDocuments = documents.filter(isPendingDocument).length;
  const blockedDocuments = documents.filter(isBlockedDocument).length;

  const encryptedDocuments = documents.filter((document) =>
    ["encrypted", "done", "completed", "yes"].includes(
      toLower(document.encryption_status)
    )
  ).length;

  const plaintextReadyDocuments = documents.filter((document) =>
    ["ready", "done", "completed", "indexed", "extracted"].includes(
      toLower(document.plaintext_status)
    )
  ).length;

  return (
    <div className="flex h-screen bg-[#07111F] font-sans text-slate-300">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-800/80 bg-[#07111F]/95 px-4 py-4 backdrop-blur-xl lg:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Home</span>
                <span>{">"}</span>
                <span>Secure DMS</span>
                <span>{">"}</span>
                <span className="text-slate-200">All Documents</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-white lg:text-2xl">
                  MIGECO Secure Document Management System
                </h1>

                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <ShieldCheck size={14} />
                  Project first, then secure upload
                </span>
              </div>

              <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
                Documents are controlled by project. Create or select a project
                first, then upload project documents through the project
                workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={loadDocuments}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>

              <button
                type="button"
                className="relative rounded-xl border border-slate-700 bg-slate-900/70 p-2.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-400" />
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">DMS User</div>
                  <div className="text-xs text-slate-500">
                    Secure Document Control
                  </div>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-700/40 text-xs font-semibold text-white">
                  DU
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-[#07111F] p-4 lg:p-6">
          <DocumentsPageTabs />

          <ProposalHeroPanel />

          <ProjectFirstNotice />

          <SandboxSummaryPanel
            summary={sandboxSummary}
            loading={sandboxSummaryLoading}
          />

          <AiSummaryPanel summary={aiSummary} loading={aiSummaryLoading} />

          <EncryptionSummaryPanel
            summary={encryptionSummary}
            loading={encryptionSummaryLoading}
          />

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

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
            <SummaryCard
              title="Total Documents"
              value={String(totalDocuments)}
              helper="All project records"
              icon={<Files size={18} />}
            />

            <SummaryCard
              title="Scanned Clean"
              value={String(cleanDocuments)}
              helper="Green = antivirus passed"
              icon={<ShieldCheck size={18} />}
              tone="success"
            />

            <SummaryCard
              title="In Pipeline"
              value={String(pendingDocuments)}
              helper="Waiting for scan/security"
              icon={<Clock3 size={18} />}
              tone="warning"
            />

            <SummaryCard
              title="Blocked"
              value={String(blockedDocuments)}
              helper="Rejected or infected"
              icon={<ShieldAlert size={18} />}
              tone="danger"
            />

            <SummaryCard
              title="Encrypted"
              value={String(encryptedDocuments)}
              helper="Protected at rest"
              icon={<LockKeyhole size={18} />}
            />

            <SummaryCard
              title="Plaintext Ready"
              value={String(plaintextReadyDocuments)}
              helper="Safe search / AI text"
              icon={<ScanSearch size={18} />}
            />
          </div>

          <BatchOperationsPanel
            batchLoadingAction={batchLoadingAction}
            onBatchAction={runBatchAction}
          />

          <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="relative w-full 2xl:max-w-xl">
                <Search
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={18}
                />

                <input
                  value={searchInput}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Search title, code, metadata, category, project, tag..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pl-11 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <div className="relative">
                  <Filter
                    size={15}
                    className="absolute left-3 top-3.5 text-slate-500"
                  />

                  <select
                    value={status}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      setStatus(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 py-3 pl-9 pr-4 text-sm text-slate-200 outline-none focus:border-blue-500 sm:w-48"
                  >
                    {statusOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-slate-950"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={scanStatus}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setScanStatus(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-200 outline-none focus:border-blue-500 sm:w-48"
                >
                  {scanStatusOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-950"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={categoryId}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setCategoryId(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-200 outline-none focus:border-blue-500 sm:w-56"
                >
                  <option value="" className="bg-slate-950">
                    {categoriesLoading ? "Loading categories..." : "All Categories"}
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={String(category.id)}
                      className="bg-slate-950"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={openCategoryModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20"
                >
                  <Plus size={16} />
                  Create Category
                </button>

                <Link
                  to="/Projects"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <FolderOpen size={16} />
                  Open Projects
                </Link>

                <Link
                  to="/Projects"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                >
                  <Plus size={16} />
                  Create Project First
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_380px]">
            <DocumentsTable
              documents={documents}
              loading={loading}
              selectedDocument={selectedDocument}
              actionLoadingKey={actionLoadingKey}
              onSelectDocument={setSelectedDocument}
              onDocumentAction={runDocumentAction}
            />

            <DocumentDetailsPanel
              selectedDocument={selectedDocument}
              actionLoadingKey={actionLoadingKey}
              aiAnalysis={selectedAiAnalysis}
              aiAnalysisLoading={aiAnalysisLoading}
              aiApplyLoading={aiApplyLoading}
              accessStatus={selectedAccessStatus}
              accessStatusLoading={accessStatusLoading}
              encryptionLogs={selectedEncryptionLogs}
              encryptionLogsLoading={encryptionLogsLoading}
              sandboxLogs={selectedSandboxLogs}
              sandboxLogsLoading={sandboxLogsLoading}
              onDocumentAction={runDocumentAction}
              onLoadAiAnalysis={loadSelectedAiAnalysis}
              onApplyAiSuggestions={handleApplyAiSuggestions}
              onClose={() => setSelectedDocument(null)}
            />
          </div>
        </section>
      </main>

      {isCategoryModalOpen && (
        <CreateCategoryModal
          form={categoryForm}
          saving={categorySaving}
          errorMessage={categoryFormError}
          onChange={handleCategoryFormChange}
          onSubmit={handleCreateCategory}
          onClose={closeCategoryModal}
        />
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

function ProposalHeroPanel() {
  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/70 via-slate-950 to-emerald-950/40 p-5 shadow-2xl shadow-blue-950/20 lg:p-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
            <Database size={14} />
            Project-Based Technical and Geological Records Archive
          </div>

          <h2 className="text-2xl font-bold leading-tight text-white lg:text-3xl">
            Secure digital archive for MIGECO project documents
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
            The correct workflow starts with a project. After a project is
            created, documents are uploaded under that project, placed in
            quarantine, scanned, sandbox-tested, encrypted, indexed, analyzed
            with AI, and made available for secure retrieval.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <MiniFeature
              icon={<FolderOpen size={17} />}
              title="1. Project First"
              text="Create/select project before adding documents."
            />

            <MiniFeature
              icon={<ShieldCheck size={17} />}
              title="2. Security Pipeline"
              text="Quarantine, scan, sandbox, hash, encrypt."
            />

            <MiniFeature
              icon={<BrainCircuit size={17} />}
              title="3. AI Intelligence"
              text="Analyze only extracted safe plaintext."
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                AI Readiness Rule
              </p>
              <p className="text-xs text-slate-500">
                AI only runs after the document is safe
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
              <BrainCircuit size={22} />
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <RuleLine
              icon={<ShieldCheck size={16} />}
              title="Step 1"
              text="Document must be active and scanned clean."
              tone="success"
            />

            <RuleLine
              icon={<Radar size={16} />}
              title="Step 2"
              text="Sandbox status must be safe."
              tone="success"
            />

            <RuleLine
              icon={<ScanSearch size={16} />}
              title="Step 3"
              text="Plaintext/OCR must be extracted."
              tone="warning"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectFirstNotice() {
  return (
    <div className="mb-6 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
            <FolderOpen size={22} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              Project must be created before document upload
            </h2>

            <p className="mt-1 max-w-4xl text-sm leading-6 text-amber-100/80">
              This page is for viewing and controlling documents. To add a new
              document, first create or select a project, then upload the file
              from that project. This keeps every document connected to a site,
              department, security level, scan history, AI result, and report
              context.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/Projects"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-slate-950/60 px-4 py-2.5 text-sm font-medium text-amber-100 hover:bg-slate-900"
          >
            <FolderOpen size={16} />
            Open Projects
          </Link>

          <Link
            to="/Projects"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400"
          >
            <Plus size={16} />
            Create Project First
          </Link>
        </div>
      </div>
    </div>
  );
}

function AiSummaryPanel({
  summary,
  loading,
}: {
  summary: AiSummary | null;
  loading: boolean;
}) {
  return (
    <div className="mb-6 rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <BrainCircuit size={19} className="text-purple-300" />
            <h2 className="text-base font-semibold">
              AI Document Intelligence
            </h2>
          </div>

          <p className="mt-1 text-sm text-purple-100/70">
            AI analyzes only active, clean, sandbox-safe documents after
            plaintext/OCR extraction is completed.
          </p>
        </div>

        {loading && (
          <div className="inline-flex items-center gap-2 text-sm text-purple-200">
            <Loader2 size={15} className="animate-spin" />
            Loading AI summary...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <AiSmallCard
          label="Ready for AI"
          value={summary?.ready_for_ai ?? 0}
          tone="ready"
        />

        <AiSmallCard
          label="Analyzed"
          value={summary?.analyzed_documents ?? 0}
          tone="done"
        />

        <AiSmallCard
          label="Pending AI"
          value={summary?.pending_ai_documents ?? 0}
          tone="pending"
        />

        <AiSmallCard
          label="Failed AI"
          value={summary?.failed_ai_documents ?? 0}
          tone="danger"
        />
      </div>
    </div>
  );
}

function AiSmallCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ready" | "done" | "pending" | "danger";
}) {
  const toneClass = {
    ready: "border-blue-500/20 bg-blue-500/10 text-blue-200",
    done: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
    danger: "border-red-500/20 bg-red-500/10 text-red-200",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}


function SandboxSummaryPanel({
  summary,
  loading,
}: {
  summary: SandboxSummary | null;
  loading: boolean;
}) {
  return (
    <div className="mb-6 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <Radar size={19} className="text-orange-300" />
            <h2 className="text-base font-semibold">Document Sandbox</h2>
          </div>

          <p className="mt-1 text-sm text-orange-100/70">
            Sandbox testing runs after antivirus scan. Safe files can continue to access, encryption, plaintext extraction, and AI.
          </p>
        </div>

        {loading && (
          <div className="inline-flex items-center gap-2 text-sm text-orange-200">
            <Loader2 size={15} className="animate-spin" />
            Loading sandbox summary...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <SandboxSmallCard
          label="Clean Active"
          value={summary?.clean_active_documents ?? 0}
          tone="ready"
        />

        <SandboxSmallCard
          label="Safe"
          value={summary?.safe_documents ?? 0}
          tone="done"
        />

        <SandboxSmallCard
          label="Not Tested"
          value={summary?.not_tested_documents ?? 0}
          tone="pending"
        />

        <SandboxSmallCard
          label="Unsafe"
          value={summary?.unsafe_documents ?? 0}
          tone="danger"
        />

        <SandboxSmallCard
          label="Failed"
          value={summary?.failed_documents ?? 0}
          tone="danger"
        />
      </div>
    </div>
  );
}

function SandboxSmallCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ready" | "done" | "pending" | "danger";
}) {
  const toneClass = {
    ready: "border-blue-500/20 bg-blue-500/10 text-blue-200",
    done: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
    danger: "border-red-500/20 bg-red-500/10 text-red-200",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function EncryptionSummaryPanel({
  summary,
  loading,
}: {
  summary: EncryptionSummary | null;
  loading: boolean;
}) {
  return (
    <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <LockKeyhole size={19} className="text-emerald-300" />
            <h2 className="text-base font-semibold">Document Encryption</h2>
          </div>

          <p className="mt-1 text-sm text-emerald-100/70">
            Encryption runs only for active documents that passed antivirus scan.
            Secure access decrypts encrypted files temporarily for viewing or download.
          </p>
        </div>

        {loading && (
          <div className="inline-flex items-center gap-2 text-sm text-emerald-200">
            <Loader2 size={15} className="animate-spin" />
            Loading encryption summary...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <EncryptionSmallCard
          label="Clean Active"
          value={summary?.clean_active_documents ?? 0}
          tone="ready"
        />

        <EncryptionSmallCard
          label="Encrypted"
          value={summary?.encrypted_documents ?? 0}
          tone="done"
        />

        <EncryptionSmallCard
          label="Not Encrypted"
          value={summary?.not_encrypted_documents ?? 0}
          tone="pending"
        />

        <EncryptionSmallCard
          label="Failed"
          value={summary?.failed_encryption_documents ?? 0}
          tone="danger"
        />
      </div>
    </div>
  );
}

function EncryptionSmallCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ready" | "done" | "pending" | "danger";
}) {
  const toneClass = {
    ready: "border-blue-500/20 bg-blue-500/10 text-blue-200",
    done: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
    danger: "border-red-500/20 bg-red-500/10 text-red-200",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function SandboxPanel({
  document,
  logs,
  loadingLogs,
  isTesting,
  isRejecting,
  onTest,
  onReject,
}: {
  document: DmsDocument;
  logs: SandboxLog[];
  loadingLogs: boolean;
  isTesting: boolean;
  isRejecting: boolean;
  onTest: () => void;
  onReject: () => void;
}) {
  const sandboxSafe = isSandboxSafeDocument(document);
  const canTest = canRunSandbox(document);
  const canReject = canRejectUnsafeSandbox(document);

  return (
    <div className="mb-6 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <Radar size={18} className="text-orange-300" />
          <h3 className="text-sm font-semibold">Sandbox Control</h3>
        </div>

        <span className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(document.sandbox_status)}`}>
          {getReadableStatus(document.sandbox_status)}
        </span>
      </div>

      <div className="mb-4 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
        {sandboxSafe
          ? "This document passed sandbox testing and is safe for the next workflow steps."
          : canTest
          ? "This document can be tested because it is active and scanned clean."
          : canReject
          ? "This document is unsafe. Review it and reject if the sandbox result is confirmed."
          : "Sandbox is locked until the document is active and scanned clean, or the current sandbox state allows review."}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2">
        <button
          type="button"
          disabled={!canTest || isTesting}
          onClick={onTest}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isTesting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Radar size={15} />
          )}
          {sandboxSafe ? "Sandbox Safe" : "Run Sandbox Test"}
        </button>

        <button
          type="button"
          disabled={!canReject || isRejecting}
          onClick={onReject}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 px-3 py-2 text-sm text-red-100 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRejecting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <ShieldAlert size={15} />
          )}
          Reject Unsafe Document
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Recent Sandbox Logs
          </p>

          {loadingLogs && (
            <Loader2 size={14} className="animate-spin text-slate-500" />
          )}
        </div>

        {!loadingLogs && logs.length === 0 && (
          <p className="text-xs leading-5 text-slate-500">
            No sandbox logs found for this document yet.
          </p>
        )}

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={String(log.id ?? `${log.status}-${log.created_at}`)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-200">
                  Sandbox Test
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(log.status)}`}>
                  {getReadableStatus(log.status)}
                </span>
              </div>

              <p className="mt-1 text-[11px] leading-4 text-slate-500">
                {log.message || "No message"}
              </p>

              {log.score !== undefined && log.score !== null && (
                <p className="mt-1 text-[10px] text-slate-600">
                  Score: {String(log.score)}
                </p>
              )}

              {log.created_at && (
                <p className="mt-1 text-[10px] text-slate-600">
                  {formatDate(log.created_at)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EncryptionPanel({
  document,
  logs,
  loadingLogs,
  isEncrypting,
  isVerifying,
  onEncrypt,
  onVerify,
}: {
  document: DmsDocument;
  logs: EncryptionLog[];
  loadingLogs: boolean;
  isEncrypting: boolean;
  isVerifying: boolean;
  onEncrypt: () => void;
  onVerify: () => void;
}) {
  const encrypted = isEncryptedDocument(document);
  const canEncrypt = canEncryptDocument(document);
  const canVerify = canVerifyEncryption(document);

  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <LockKeyhole size={18} className="text-emerald-300" />
          <h3 className="text-sm font-semibold">Encryption Control</h3>
        </div>

        <span className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(document.encryption_status)}`}>
          {getReadableStatus(document.encryption_status)}
        </span>
      </div>

      <div className="mb-4 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
        {encrypted
          ? "This document is encrypted. Open/download uses the secure access controller and temporary decryption."
          : canEncrypt
          ? "This document can be encrypted because it is active and scanned clean."
          : "Encryption is locked until the document is active, scanned clean, and not already encrypted."}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2">
        <button
          type="button"
          disabled={!canEncrypt || isEncrypting}
          onClick={onEncrypt}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isEncrypting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <LockKeyhole size={15} />
          )}
          {encrypted ? "Already Encrypted" : "Encrypt Document"}
        </button>

        <button
          type="button"
          disabled={!canVerify || isVerifying}
          onClick={onVerify}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerifying ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <CheckCircle2 size={15} />
          )}
          Verify Encryption
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Recent Encryption Logs
          </p>

          {loadingLogs && (
            <Loader2 size={14} className="animate-spin text-slate-500" />
          )}
        </div>

        {!loadingLogs && logs.length === 0 && (
          <p className="text-xs leading-5 text-slate-500">
            No encryption logs found for this document yet.
          </p>
        )}

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={String(log.id ?? `${log.action}-${log.created_at}`)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-200">
                  {getReadableStatus(log.action)}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(log.status)}`}>
                  {getReadableStatus(log.status)}
                </span>
              </div>

              <p className="mt-1 text-[11px] leading-4 text-slate-500">
                {log.message || "No message"}
              </p>

              {log.created_at && (
                <p className="mt-1 text-[10px] text-slate-600">
                  {formatDate(log.created_at)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BatchOperationsPanel({
  batchLoadingAction,
  onBatchAction,
}: {
  batchLoadingAction: BatchAction | null;
  onBatchAction: (action: BatchAction) => void;
}) {
  const actions: Array<{
    action: BatchAction;
    title: string;
    text: string;
    icon: ReactNode;
  }> = [
    {
      action: "scan_pending",
      title: "Scan Pending",
      text: "Run antivirus on pending/quarantined documents.",
      icon: <Bug size={17} />,
    },
    {
      action: "sandbox_pending",
      title: "Sandbox Pending",
      text: "Test clean untested files.",
      icon: <Radar size={17} />,
    },
    {
      action: "extract_pending",
      title: "Extract Text",
      text: "Create safe searchable plaintext.",
      icon: <ScanSearch size={17} />,
    },
    {
      action: "encrypt_clean",
      title: "Encrypt Clean",
      text: "Encrypt clean unencrypted files.",
      icon: <LockKeyhole size={17} />,
    },
    {
      action: "ai_pending",
      title: "Analyze AI",
      text: "Analyze only AI-ready documents.",
      icon: <BrainCircuit size={17} />,
    },
  ];

  return (
    <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <Activity size={18} className="text-emerald-400" />
            <h2 className="text-base font-semibold">
              Controller Batch Operations
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Use these buttons for bulk security and AI processing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {actions.map((item) => {
          const isLoading = batchLoadingAction === item.action;

          return (
            <button
              type="button"
              key={item.action}
              onClick={() => onBatchAction(item.action)}
              disabled={Boolean(batchLoadingAction)}
              className="rounded-2xl border border-slate-800 bg-[#07111F] p-4 text-left transition-all hover:border-blue-500/40 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
                {isLoading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  item.icon
                )}
              </div>

              <p className="font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.text}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DocumentsTable({
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
            <h2 className="font-semibold text-white">Secure Document Library</h2>
            <p className="mt-1 text-xs text-slate-500">
              New documents must be uploaded from a project workspace.
            </p>
          </div>

          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
            {documents.length} document(s)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 p-4">
                <input type="checkbox" className="rounded" readOnly />
              </th>
              <th className="p-4">Document</th>
              <th className="p-4">Category</th>
              <th className="p-4">Project</th>
              <th className="p-4">Scan Status</th>
              <th className="p-4">Security Pipeline</th>
              <th className="p-4">Workflow</th>
              <th className="p-4">Modified</th>
              <th className="p-4">Author</th>
              <th className="p-4">Scan / AI</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-3 text-slate-400">
                    <Loader2 size={20} className="animate-spin" />
                    Loading secure documents...
                  </div>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-10 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
                      <FolderOpen size={24} className="text-slate-500" />
                    </div>

                    <div>
                      <p className="font-medium text-white">
                        No documents found
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Create a project first, then upload documents from that
                        project workspace.
                      </p>
                    </div>

                    <Link
                      to="/Projects"
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                      <Plus size={16} />
                      Create Project First
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((document) => {
                const isSelected = selectedDocument?.id === document.id;
                const scanUi = getScanUiState(document);
                const isScanning =
                  actionLoadingKey === makeActionKey(document.id, "scan");
                const isPlaintextExtracting =
                  actionLoadingKey === makeActionKey(document.id, "plaintext");
                const isSandboxTesting =
                  actionLoadingKey === makeActionKey(document.id, "sandbox");
                const isUnsafeRejecting =
                  actionLoadingKey === makeActionKey(document.id, "reject_unsafe");
                const isAiAnalyzing =
                  actionLoadingKey === makeActionKey(document.id, "ai");
                const plaintextExtracted = isPlaintextExtracted(document);
                const canExtractText =
                  canExtractPlaintext(document) && !plaintextExtracted;
                const workflowStatus = document.status;

                return (
                  <tr
                    key={document.id}
                    onClick={() => onSelectDocument(document)}
                    className={`cursor-pointer border-b border-slate-800 transition-colors hover:bg-slate-900/80 ${
                      isSelected ? "bg-blue-950/30" : ""
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={isSelected}
                        readOnly
                      />
                    </td>

                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getFileIcon(document)}</div>

                        <div>
                          <div className="max-w-xs truncate font-medium text-slate-100">
                            {document.original_file_name || document.title}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{document.document_code || "No code"}</span>
                            <span>•</span>
                            <span>
                              {document.extension?.toUpperCase() || "FILE"}
                            </span>
                            <span>•</span>
                            <span>{formatBytes(document.file_size)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300">
                        {document.category?.name || "—"}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400">
                      {document.project?.name || (
                        <span className="text-amber-300">No Project</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${scanUi.badgeClass}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {scanUi.label}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        <SmallPipelineBadge
                          label="Text"
                          value={document.plaintext_status}
                        />
                        <SmallPipelineBadge
                          label="Sandbox"
                          value={document.sandbox_status}
                        />
                        <SmallPipelineBadge
                          label="Encrypt"
                          value={document.encryption_status}
                        />
                        <SmallPipelineBadge label="AI" value={document.ai_status} />
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${getStatusClass(
                          workflowStatus
                        )}`}
                      >
                        {getReadableStatus(workflowStatus)}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400">
                      {formatDate(document.updated_at || document.created_at)}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-800 text-[10px] font-semibold text-white">
                          {getInitials(document.uploader?.name)}
                        </div>

                        <span className="max-w-[120px] truncate text-xs text-slate-500">
                          {document.uploader?.name || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDocumentAction(document, "check_access");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-200 hover:bg-blue-500/20"
                        >
                          <ShieldCheck size={14} />
                          Access
                        </button>

                        <button
                          type="button"
                          disabled={isScanning}
                          onClick={(event) => {
                            event.stopPropagation();
                            onDocumentAction(document, "scan");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isScanning ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Bug size={14} className={scanUi.iconClass} />
                          )}
                          {isScanning ? "Scanning..." : scanUi.buttonLabel}
                        </button>

                        <button
                          type="button"
                          disabled={!canRunSandbox(document) || isSandboxTesting}
                          onClick={(event) => {
                            event.stopPropagation();
                            onDocumentAction(document, "sandbox");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-200 hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSandboxTesting ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Radar size={14} />
                          )}
                          Sandbox
                        </button>

                        {canRejectUnsafeSandbox(document) && (
                          <button
                            type="button"
                            disabled={isUnsafeRejecting}
                            onClick={(event) => {
                              event.stopPropagation();
                              onDocumentAction(document, "reject_unsafe");
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUnsafeRejecting ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <ShieldAlert size={14} />
                            )}
                            Reject
                          </button>
                        )}

                        {!plaintextExtracted && (
                          <button
                            type="button"
                            disabled={!canExtractText || isPlaintextExtracting}
                            onClick={(event) => {
                              event.stopPropagation();
                              onDocumentAction(document, "plaintext");
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-200 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPlaintextExtracting ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <ScanSearch size={14} />
                            )}
                            Extract Text
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={!canEncryptDocument(document) || actionLoadingKey === makeActionKey(document.id, "encrypt")}
                          onClick={(event) => {
                            event.stopPropagation();
                            onDocumentAction(document, "encrypt");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoadingKey === makeActionKey(document.id, "encrypt") ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <LockKeyhole size={14} />
                          )}
                          Encrypt
                        </button>

                        <button
                          type="button"
                          disabled={!canVerifyEncryption(document) || actionLoadingKey === makeActionKey(document.id, "verify_encryption")}
                          onClick={(event) => {
                            event.stopPropagation();
                            onDocumentAction(document, "verify_encryption");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoadingKey === makeActionKey(document.id, "verify_encryption") ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Verify
                        </button>

                        {plaintextExtracted && (
                          <button
                            type="button"
                            disabled={!canRunAi(document) || isAiAnalyzing}
                            onClick={(event) => {
                              event.stopPropagation();
                              onDocumentAction(document, "ai");
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-200 hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isAiAnalyzing ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <BrainCircuit size={14} />
                            )}
                            AI
                          </button>
                        )}
                      </div>
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

function DocumentDetailsPanel({
  selectedDocument,
  actionLoadingKey,
  aiAnalysis,
  aiAnalysisLoading,
  aiApplyLoading,
  accessStatus,
  accessStatusLoading,
  encryptionLogs,
  encryptionLogsLoading,
  sandboxLogs,
  sandboxLogsLoading,
  onDocumentAction,
  onLoadAiAnalysis,
  onApplyAiSuggestions,
  onClose,
}: {
  selectedDocument: DmsDocument | null;
  actionLoadingKey: string;
  aiAnalysis: DocumentAiAnalysisResponse | null;
  aiAnalysisLoading: boolean;
  aiApplyLoading: boolean;
  accessStatus: DocumentAccessStatus | null;
  accessStatusLoading: boolean;
  encryptionLogs: EncryptionLog[];
  encryptionLogsLoading: boolean;
  sandboxLogs: SandboxLog[];
  sandboxLogsLoading: boolean;
  onDocumentAction: (document: DmsDocument, action: DocumentAction) => void;
  onLoadAiAnalysis: (document: DmsDocument) => void;
  onApplyAiSuggestions: (
    document: DmsDocument,
    payload: AiApplySuggestionsPayload
  ) => void;
  onClose: () => void;
}) {
  if (!selectedDocument) {
    return (
      <aside className="hidden rounded-3xl border border-slate-800 bg-slate-950/60 p-6 2xl:block">
        <div className="mt-20 text-center text-sm text-slate-500">
          Select a document to view scan, security, and AI details.
        </div>
      </aside>
    );
  }

  const tags = getTags(selectedDocument);
  const scanUi = getScanUiState(selectedDocument);

  const isActionLoading = (action: DocumentAction): boolean =>
    actionLoadingKey === makeActionKey(selectedDocument.id, action);

  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Document Security Details</h2>
          <p className="mt-1 text-xs text-slate-500">
            Scan result, workflow, encryption, AI, and audit status.
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

      <div className="mb-6 flex justify-center">
        <div className="flex h-40 w-32 flex-col items-center justify-center rounded-2xl border border-slate-700 bg-white text-center font-bold text-red-600">
          {selectedDocument.extension?.toUpperCase() || "FILE"}
          <span className="mt-2 text-xs font-medium text-slate-500">
            {formatBytes(selectedDocument.file_size)}
          </span>
        </div>
      </div>

      <div className="mb-6 text-center">
        <div className="break-words font-medium text-white">
          {selectedDocument.original_file_name || selectedDocument.title}
        </div>

        <div className="mt-1 text-xs text-slate-500">
          {selectedDocument.document_code || "No document code"}
        </div>
      </div>

      <div className={`mb-6 rounded-2xl border p-4 ${scanUi.badgeClass}`}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} />
            <p className="font-semibold">{scanUi.label}</p>
          </div>

          <span className="rounded-full border border-current/20 px-2.5 py-1 text-[11px]">
            {getReadableStatus(selectedDocument.scan_status)}
          </span>
        </div>

        <p className="text-xs leading-5 opacity-90">{scanUi.helper}</p>
      </div>

      <AccessStatusPanel
        document={selectedDocument}
        accessStatus={accessStatus}
        loading={accessStatusLoading}
      />

      <SandboxPanel
        document={selectedDocument}
        logs={sandboxLogs}
        loadingLogs={sandboxLogsLoading}
        isTesting={isActionLoading("sandbox")}
        isRejecting={isActionLoading("reject_unsafe")}
        onTest={() => onDocumentAction(selectedDocument, "sandbox")}
        onReject={() => onDocumentAction(selectedDocument, "reject_unsafe")}
      />

      <EncryptionPanel
        document={selectedDocument}
        logs={encryptionLogs}
        loadingLogs={encryptionLogsLoading}
        isEncrypting={isActionLoading("encrypt")}
        isVerifying={isActionLoading("verify_encryption")}
        onEncrypt={() => onDocumentAction(selectedDocument, "encrypt")}
        onVerify={() => onDocumentAction(selectedDocument, "verify_encryption")}
      />

      <div className="mb-6 grid grid-cols-2 gap-2">
        <DocumentActionButton
          label="Check"
          icon={<ShieldCheck size={15} />}
          loading={isActionLoading("check_access")}
          onClick={() => onDocumentAction(selectedDocument, "check_access")}
        />

        <DocumentActionButton
          label="Open"
          icon={<Eye size={15} />}
          loading={isActionLoading("open")}
          onClick={() => onDocumentAction(selectedDocument, "open")}
        />

        <DocumentActionButton
          label="Download"
          icon={<Download size={15} />}
          loading={isActionLoading("download")}
          onClick={() => onDocumentAction(selectedDocument, "download")}
        />

        <DocumentActionButton
          label={scanUi.buttonLabel}
          icon={<Bug size={15} className={scanUi.iconClass} />}
          loading={isActionLoading("scan")}
          onClick={() => onDocumentAction(selectedDocument, "scan")}
        />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-[#07111F] p-4">
        <div className="mb-4 flex items-center gap-2 text-white">
          <Workflow size={17} className="text-blue-400" />
          <h3 className="text-sm font-semibold">Selected File Pipeline</h3>
        </div>

        <div className="space-y-2">
          <PipelineStatusRow
            label="Document Status"
            value={selectedDocument.status}
          />
          <PipelineStatusRow
            label="Antivirus"
            value={selectedDocument.scan_status}
          />
          <PipelineStatusRow
            label="Sandbox"
            value={selectedDocument.sandbox_status}
          />
          <PipelineStatusRow
            label="Plaintext / OCR"
            value={selectedDocument.plaintext_status}
          />
          <PipelineStatusRow
            label="Encryption"
            value={selectedDocument.encryption_status}
          />
          <PipelineStatusRow label="AI Ready" value={selectedDocument.ai_status} />
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-[#07111F] p-4">
        <div className="mb-4 flex items-center gap-2 text-white">
          <Activity size={17} className="text-emerald-400" />
          <h3 className="text-sm font-semibold">Controller Actions</h3>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <DocumentActionButton
            label={scanUi.buttonLabel}
            icon={<Bug size={15} className={scanUi.iconClass} />}
            loading={isActionLoading("scan")}
            onClick={() => onDocumentAction(selectedDocument, "scan")}
          />

          <DocumentActionButton
            label={isSandboxSafeDocument(selectedDocument) ? "Sandbox Safe" : "Run Sandbox Test"}
            icon={<Radar size={15} />}
            loading={isActionLoading("sandbox")}
            onClick={() => onDocumentAction(selectedDocument, "sandbox")}
          />

          {canRejectUnsafeSandbox(selectedDocument) && (
            <DocumentActionButton
              label="Reject Unsafe Document"
              icon={<ShieldAlert size={15} />}
              loading={isActionLoading("reject_unsafe")}
              onClick={() => onDocumentAction(selectedDocument, "reject_unsafe")}
            />
          )}

          <DocumentActionButton
            label="Extract Plaintext / OCR"
            icon={<ScanSearch size={15} />}
            loading={isActionLoading("plaintext")}
            onClick={() => onDocumentAction(selectedDocument, "plaintext")}
          />

          <DocumentActionButton
            label={isEncryptedDocument(selectedDocument) ? "Already Encrypted" : "Encrypt Document"}
            icon={<LockKeyhole size={15} />}
            loading={isActionLoading("encrypt")}
            onClick={() => onDocumentAction(selectedDocument, "encrypt")}
          />

          <DocumentActionButton
            label="Verify Encryption"
            icon={<CheckCircle2 size={15} />}
            loading={isActionLoading("verify_encryption")}
            onClick={() => onDocumentAction(selectedDocument, "verify_encryption")}
          />

          <DocumentActionButton
            label={
              isPlaintextExtracted(selectedDocument)
                ? "Analyze with AI"
                : "Extract Plaintext First"
            }
            icon={
              isPlaintextExtracted(selectedDocument) ? (
                <BrainCircuit size={15} />
              ) : (
                <ScanSearch size={15} />
              )
            }
            loading={
              isPlaintextExtracted(selectedDocument)
                ? isActionLoading("ai")
                : isActionLoading("plaintext")
            }
            onClick={() =>
              onDocumentAction(
                selectedDocument,
                isPlaintextExtracted(selectedDocument) ? "ai" : "plaintext"
              )
            }
          />
        </div>
      </div>

      <AiDocumentPanel
        document={selectedDocument}
        aiAnalysis={aiAnalysis}
        loading={aiAnalysisLoading}
        applying={aiApplyLoading}
        canRunAi={canRunAi(selectedDocument)}
        canExtractText={
          canExtractPlaintext(selectedDocument) &&
          !isPlaintextExtracted(selectedDocument)
        }
        isAnalyzing={isActionLoading("ai")}
        isExtracting={isActionLoading("plaintext")}
        onAnalyze={() => onDocumentAction(selectedDocument, "ai")}
        onExtractText={() => onDocumentAction(selectedDocument, "plaintext")}
        onRefresh={() => onLoadAiAnalysis(selectedDocument)}
        onApplyAll={() =>
          onApplyAiSuggestions(selectedDocument, {
            apply_tags: true,
            apply_category: true,
            apply_document_type: true,
            apply_security_level: true,
          })
        }
        onApplyTags={() =>
          onApplyAiSuggestions(selectedDocument, {
            apply_tags: true,
          })
        }
        onApplyCategory={() =>
          onApplyAiSuggestions(selectedDocument, {
            apply_category: true,
          })
        }
        onApplyDocumentType={() =>
          onApplyAiSuggestions(selectedDocument, {
            apply_document_type: true,
          })
        }
        onApplySecurity={() =>
          onApplyAiSuggestions(selectedDocument, {
            apply_security_level: true,
          })
        }
      />

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
        <DetailRow
          label="Uploaded By"
          value={selectedDocument.uploader?.name || "—"}
        />
        <DetailRow label="Created" value={formatDate(selectedDocument.created_at)} />
        <DetailRow label="Modified" value={formatDate(selectedDocument.updated_at)} />
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

function AiDocumentPanel({
  document,
  aiAnalysis,
  loading,
  applying,
  canRunAi,
  canExtractText,
  isAnalyzing,
  isExtracting,
  onAnalyze,
  onExtractText,
  onRefresh,
  onApplyAll,
  onApplyTags,
  onApplyCategory,
  onApplyDocumentType,
  onApplySecurity,
}: {
  document: DmsDocument;
  aiAnalysis: DocumentAiAnalysisResponse | null;
  loading: boolean;
  applying: boolean;
  canRunAi: boolean;
  canExtractText: boolean;
  isAnalyzing: boolean;
  isExtracting: boolean;
  onAnalyze: () => void;
  onExtractText: () => void;
  onRefresh: () => void;
  onApplyAll: () => void;
  onApplyTags: () => void;
  onApplyCategory: () => void;
  onApplyDocumentType: () => void;
  onApplySecurity: () => void;
}) {
  const analysis = aiAnalysis?.analysis;
  const tags = normalizeAiTags(analysis?.suggested_tags);
  const aiStatus = toLower(document.ai_status);
  const plaintextExtracted = isPlaintextExtracted(document);

  return (
    <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <BrainCircuit size={18} className="text-purple-300" />
          <h3 className="text-sm font-semibold">AI Analysis</h3>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(
            document.ai_status
          )}`}
        >
          {getReadableStatus(document.ai_status)}
        </span>
      </div>

      {!plaintextExtracted && (
        <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs leading-5 text-blue-100/80">
          Extract plaintext/OCR first. AI reads safe extracted text, not the raw
          file directly.
        </div>
      )}

      {plaintextExtracted && !canRunAi && (
        <div className="mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-100/80">
          Plaintext is ready, but AI is still locked until the document is
          active, scanned clean, and sandbox safe.
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-2">
        {!plaintextExtracted ? (
          <button
            type="button"
            disabled={!canExtractText || isExtracting}
            onClick={onExtractText}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExtracting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ScanSearch size={15} />
            )}
            Extract Plaintext / OCR First
          </button>
        ) : (
          <button
            type="button"
            disabled={!canRunAi || isAnalyzing}
            onClick={onAnalyze}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAnalyzing ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <BrainCircuit size={15} />
            )}
            {aiStatus === "analyzed" ? "Re-analyze with AI" : "Analyze with AI"}
          </button>
        )}

        <button
          type="button"
          disabled={loading || aiStatus !== "analyzed"}
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-400/20 px-3 py-2 text-sm text-purple-100 hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <RefreshCcw size={15} />
          )}
          Load AI Result
        </button>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
          Loading AI analysis...
        </div>
      )}

      {!loading && !analysis && (
        <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm leading-6 text-slate-400">
          No AI analysis result found yet. Run AI after security processing is
          complete.
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
              Summary
            </p>
            <p className="text-sm leading-6 text-slate-200">
              {analysis.summary || "No summary returned."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <AiInfoRow
              label="Detected Language"
              value={String(analysis.detected_language || "—")}
            />

            <AiInfoRow
              label="Suggested Type"
              value={String(analysis.suggested_document_type || "—")}
            />

            <AiInfoRow
              label="Sensitivity"
              value={String(analysis.sensitivity_level || "—")}
            />

            <AiInfoRow
              label="Confidence"
              value={
                analysis.confidence_score !== undefined &&
                analysis.confidence_score !== null
                  ? String(analysis.confidence_score)
                  : "—"
              }
            />
          </div>

          {tags.length > 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
              <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
                Suggested Tags
              </p>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-purple-500/15 px-2 py-1 text-xs text-purple-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
              Apply AI Suggestions
            </p>

            <div className="grid grid-cols-1 gap-2">
              <AiApplyButton
                label="Apply All Suggestions"
                loading={applying}
                onClick={onApplyAll}
              />

              <div className="grid grid-cols-2 gap-2">
                <AiApplyButton
                  label="Tags"
                  loading={applying}
                  onClick={onApplyTags}
                />

                <AiApplyButton
                  label="Category"
                  loading={applying}
                  onClick={onApplyCategory}
                />

                <AiApplyButton
                  label="Type"
                  loading={applying}
                  onClick={onApplyDocumentType}
                />

                <AiApplyButton
                  label="Security"
                  loading={applying}
                  onClick={onApplySecurity}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccessStatusPanel({
  document,
  accessStatus,
  loading,
}: {
  document: DmsDocument;
  accessStatus: DocumentAccessStatus | null;
  loading: boolean;
}) {
  const fallbackAccess = getAccessUiState(document);
  const access = accessStatus?.access;
  const canView = Boolean(access?.can_view);
  const canDownload = Boolean(access?.can_download);
  const isSafe = Boolean(access?.is_safe_to_open);
  const isEncrypted = Boolean(access?.is_encrypted);
  const isSandboxSafe = Boolean(access?.is_sandbox_safe);
  const reasonBlocked = access?.reason_blocked;

  const panelClass =
    accessStatus && canView && isSafe
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
      : accessStatus && reasonBlocked
      ? "border-red-500/20 bg-red-500/10 text-red-200"
      : fallbackAccess.badgeClass;

  return (
    <div className={`mb-6 rounded-2xl border p-4 ${panelClass}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ShieldCheck size={18} />
          )}
          <p className="font-semibold">
            {accessStatus
              ? canView && isSafe
                ? "Access Allowed"
                : "Access Restricted"
              : fallbackAccess.label}
          </p>
        </div>

        <span className="rounded-full border border-current/20 px-2.5 py-1 text-[11px]">
          Server checked
        </span>
      </div>

      <p className="mb-3 text-xs leading-5 opacity-90">
        {accessStatus
          ? reasonBlocked ||
            "Access is controlled by permission, security level, scan status, sandbox status, and encryption status."
          : fallbackAccess.helper}
      </p>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <AccessFlag label="View" enabled={canView} />
        <AccessFlag label="Download" enabled={canDownload} />
        <AccessFlag label="Safe to open" enabled={isSafe} />
        <AccessFlag label="Sandbox safe" enabled={isSandboxSafe} />
        <AccessFlag label="Encrypted" enabled={isEncrypted} neutral />
        <AccessFlag label="Permission checked" enabled={Boolean(accessStatus)} neutral />
      </div>
    </div>
  );
}

function AccessFlag({
  label,
  enabled,
  neutral = false,
}: {
  label: string;
  enabled: boolean;
  neutral?: boolean;
}) {
  const className = neutral
    ? enabled
      ? "border-blue-500/20 bg-blue-500/10 text-blue-200"
      : "border-slate-700 bg-slate-900 text-slate-500"
    : enabled
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
    : "border-red-500/20 bg-red-500/10 text-red-200";

  return (
    <div className={`rounded-xl border px-3 py-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <span>{enabled ? "Yes" : "No"}</span>
      </div>
    </div>
  );
}

function DocumentActionButton({
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

function AiInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="max-w-[170px] break-words text-right text-xs text-slate-200">
        {value}
      </span>
    </div>
  );
}

function AiApplyButton({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-400/20 px-3 py-2 text-xs font-medium text-purple-100 hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <CheckCircle2 size={14} />
      )}
      {label}
    </button>
  );
}

function CreateCategoryModal({
  form,
  saving,
  errorMessage,
  onChange,
  onSubmit,
  onClose,
}: {
  form: CategoryFormState;
  saving: boolean;
  errorMessage: string;
  onChange: (field: keyof CategoryFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-[#07111F] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Create Document Category
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a category used to classify project documents.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Category Name <span className="text-red-300">*</span>
            </label>
            <input
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="Example: Geological Reports"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Status
              </label>
              <select
                value={form.status}
                onChange={(event) =>
                  onChange(
                    "status",
                    event.target.value === "inactive" ? "inactive" : "active"
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="active" className="bg-slate-950">
                  Active
                </option>
                <option value="inactive" className="bg-slate-950">
                  Inactive
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Sort Order
              </label>
              <input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(event) => onChange("sort_order", event.target.value)}
                placeholder="Example: 1"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              rows={4}
              placeholder="Short description about this category..."
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {saving ? "Saving..." : "Create Category"}
          </button>
        </div>
      </form>
    </div>
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
    <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
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
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
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

function MiniFeature({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-950/50 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="text-blue-300">{icon}</span>
        {title}
      </div>
      <p className="text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function RuleLine({
  icon,
  title,
  text,
  tone,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  tone: "success" | "warning" | "danger";
}) {
  const toneClass = {
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    warning: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    danger: "bg-red-500/10 text-red-300 border-red-500/20",
  }[tone];

  return (
    <div className={`rounded-2xl border p-3 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5 opacity-90">{text}</p>
        </div>
      </div>
    </div>
  );
}

function SmallPipelineBadge({
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

function PipelineStatusRow({
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
      <span className="max-w-[180px] break-words text-right text-slate-200">
        {value || "—"}
      </span>
    </div>
  );
}