import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  Archive as ArchiveIcon,
  BrainCircuit,
  Bug,
  CheckCircle2,
  Clock3,
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
  archiveDocument,
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
  restoreArchivedDocument,
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
  | "ai"
  | "archive"
  | "restore_archive";

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

function getReadableStatus(status?: string | null): string {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function getTags(document: DmsDocument): string[] {
  if (Array.isArray(document.tags)) {
    return document.tags.filter(
      (tag): tag is string => typeof tag === "string",
    );
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
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
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
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
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
      badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      iconClass: "text-emerald-600",
    };
  }

  if (scanStatus === "scanning" || documentStatus === "scanning") {
    return {
      label: "Scanning",
      helper: "Antivirus scan is currently running.",
      buttonLabel: "Scanning...",
      badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
      iconClass: "text-blue-600",
    };
  }

  if (scanStatus === "pending" || documentStatus === "quarantined") {
    return {
      label: "Not Scanned",
      helper: "This document is waiting for mandatory antivirus scan.",
      buttonLabel: "Scan Now",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      iconClass: "text-amber-600",
    };
  }

  if (scanStatus === "suspicious") {
    return {
      label: "Suspicious",
      helper: "This document needs security review or sandbox testing.",
      buttonLabel: "Re-scan",
      badgeClass: "border-orange-200 bg-orange-50 text-orange-700",
      iconClass: "text-orange-600",
    };
  }

  if (scanStatus === "infected") {
    return {
      label: "Infected",
      helper: "This document is blocked because malware was detected.",
      buttonLabel: "Re-scan",
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      iconClass: "text-red-600",
    };
  }

  if (scanStatus === "failed") {
    return {
      label: "Scan Failed",
      helper:
        "The previous scan failed. Run re-scan after fixing scanner issue.",
      buttonLabel: "Re-scan",
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      iconClass: "text-red-600",
    };
  }

  return {
    label: "Unknown",
    helper: "Scan status is unknown. You can run scan again.",
    buttonLabel: "Scan Now",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
    iconClass: "text-slate-600",
  };
}

function getAccessUiState(document: DmsDocument): AccessUiState {
  const status = toLower(document.status);
  const scanStatus = toLower(document.scan_status);
  const sandboxStatus = toLower(document.sandbox_status);

  if (["infected", "rejected", "blocked"].includes(status)) {
    return {
      label: "Access Blocked",
      helper:
        "This document cannot be opened because it is blocked or rejected.",
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      iconClass: "text-red-600",
    };
  }

  if (
    ["quarantined", "uploaded", "pending_scan", "scanning"].includes(status)
  ) {
    return {
      label: "Not Ready",
      helper:
        "The document is not ready for opening until security checks finish.",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      iconClass: "text-amber-600",
    };
  }

  if (scanStatus !== "clean" && scanStatus !== "passed") {
    return {
      label: "Scan Required",
      helper: "The document must pass antivirus scan before view or download.",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      iconClass: "text-amber-600",
    };
  }

  if (["unsafe", "failed"].includes(sandboxStatus)) {
    return {
      label: "Sandbox Blocked",
      helper: "Sandbox result blocks access to this document.",
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      iconClass: "text-red-600",
    };
  }

  if (sandboxStatus !== "safe") {
    return {
      label: "Sandbox Pending",
      helper: "The document must pass sandbox inspection before access.",
      badgeClass: "border-orange-200 bg-orange-50 text-orange-700",
      iconClass: "text-orange-600",
    };
  }

  return {
    label: "Access Ready",
    helper:
      "This document passed access safety checks locally. Server permission is still checked before opening.",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClass: "text-emerald-600",
  };
}

function isArchivedDocument(document: DmsDocument): boolean {
  return toLower(document.status) === "archived";
}

function canArchiveDocument(document: DmsDocument): boolean {
  const status = toLower(document.status);
  const scanStatus = toLower(document.scan_status);
  const sandboxStatus = toLower(document.sandbox_status);

  return (
    status === "active" &&
    scanStatus === "clean" &&
    !["pending", "unsafe", "failed"].includes(sandboxStatus)
  );
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
    [
      "uploaded",
      "pending_scan",
      "scanning",
      "quarantined",
      "suspicious",
    ].includes(status) ||
    ["pending", "scanning", "suspicious"].includes(scanStatus)
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
    null,
  );
  const [selectedAccessStatus, setSelectedAccessStatus] =
    useState<DocumentAccessStatus | null>(null);
  const [accessStatusLoading, setAccessStatusLoading] =
    useState<boolean>(false);
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
    null,
  );
  const [sandboxSummaryLoading, setSandboxSummaryLoading] =
    useState<boolean>(false);
  const [selectedSandboxLogs, setSelectedSandboxLogs] = useState<SandboxLog[]>(
    [],
  );
  const [sandboxLogsLoading, setSandboxLogsLoading] = useState<boolean>(false);

  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [scanStatus, setScanStatus] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [isCategoryModalOpen, setIsCategoryModalOpen] =
    useState<boolean>(false);
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
  const [batchPanelOpen, setBatchPanelOpen] = useState<boolean>(false);
  const [processingPanelOpen, setProcessingPanelOpen] =
    useState<boolean>(false);

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
        document.id === updatedDocument.id ? updatedDocument : document,
      ),
    );

    setSelectedDocument((currentDocument) =>
      currentDocument?.id === updatedDocument.id
        ? updatedDocument
        : currentDocument,
    );
  }

  async function loadDocuments(): Promise<void> {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getDocuments(filters);

      setDocuments(data);

      setSelectedDocument((current) => {
        if (!data.length || !current) return null;

        const stillExists = data.find((document) => document.id === current.id);

        return stillExists || null;
      });
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 401) {
        setErrorMessage("Your session expired. Please login again.");
      } else if (apiError.status === 403) {
        setErrorMessage("You do not have permission to view these documents.");
      } else {
        setErrorMessage(
          apiError.message || "Failed to load documents. Please try again.",
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
    value: string,
  ): void {
    setCategoryForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleCreateCategory(
    event: FormEvent<HTMLFormElement>,
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

  async function loadSelectedAccessStatus(
    document: DmsDocument,
  ): Promise<DocumentAccessStatus | null> {
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

  async function loadSelectedEncryptionLogs(
    document: DmsDocument,
  ): Promise<void> {
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
    payload: AiApplySuggestionsPayload,
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
    action: DocumentAction,
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

        if (
          !response.access?.can_download ||
          !response.access?.is_safe_to_open
        ) {
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
          document.original_file_name || document.title || "document",
        );

        setActionMessage({
          type: "success",
          message: response.access?.is_encrypted
            ? "Encrypted document was decrypted temporarily and downloaded securely."
            : "Document downloaded using secure access controller.",
        });

        return;
      }

      if (action === "archive") {
        if (isArchivedDocument(document)) {
          setActionMessage({
            type: "info",
            message: "This document is already archived.",
          });

          return;
        }

        if (!canArchiveDocument(document)) {
          setActionMessage({
            type: "info",
            message:
              "Only active documents that passed antivirus scan can be archived. Unsafe, pending, rejected, quarantined, or infected documents must stay in the security workflow.",
          });

          return;
        }

        const updatedDocument = await archiveDocument(document.id, {
          reason: "Document archived from document library.",
        });

        updateDocumentInState(updatedDocument);

        setActionMessage({
          type: "success",
          message: "Document archived successfully.",
        });

        await loadDocuments();
        return;
      }

      if (action === "restore_archive") {
        if (!isArchivedDocument(document)) {
          setActionMessage({
            type: "info",
            message: "Only archived documents can be restored.",
          });

          return;
        }

        const updatedDocument = await restoreArchivedDocument(document.id, {
          reason: "Document restored from archive in document library.",
        });

        updateDocumentInState(updatedDocument);

        setActionMessage({
          type: "success",
          message: "Archived document restored successfully.",
        });

        await loadDocuments();
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
            response.document.sandbox_status,
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
            message:
              "Only unsafe sandbox documents can be rejected from sandbox review.",
          });

          return;
        }

        const updatedDocument = await rejectUnsafeSandboxDocument(document.id);

        updateDocumentInState(updatedDocument);

        setActionMessage({
          type: "success",
          message:
            "Unsafe document rejected successfully after sandbox review.",
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
            message:
              "This document is not encrypted yet. Encrypt it before verification.",
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

          const extractionResponse = await extractDocumentPlaintext(
            documentForAi.id,
          );
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
  const archivedDocuments = documents.filter(isArchivedDocument).length;

  const encryptedDocuments = documents.filter((document) =>
    ["encrypted", "done", "completed", "yes"].includes(
      toLower(document.encryption_status),
    ),
  ).length;

  const plaintextReadyDocuments = documents.filter((document) =>
    ["ready", "done", "completed", "indexed", "extracted"].includes(
      toLower(document.plaintext_status),
    ),
  ).length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 lg:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <span>Documents</span>
              <span>/</span>
              <span className="text-blue-600">All Documents</span>
            </div>

            <h1 className="mt-1 truncate text-lg font-bold text-slate-900 lg:text-xl">
              Secure Document Library
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={loadDocuments}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <RefreshCcw size={15} />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/Projects"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <FolderOpen size={15} />
              <span className="hidden sm:inline">Projects</span>
            </Link>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 overflow-hidden p-3 lg:p-4">
          <div className="mx-auto flex min-h-0 w-full max-w-[1650px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
            <div className="shrink-0 border-b border-slate-100 bg-white px-3 py-3 lg:px-4">
              <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
                <DocumentsPageTabs />

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 2xl:w-auto">
                  <SummaryCard
                    title="Total"
                    value={String(totalDocuments)}
                    helper="Documents"
                    icon={<Files size={16} />}
                  />

                  <SummaryCard
                    title="Clean"
                    value={String(cleanDocuments)}
                    helper="Scanned"
                    icon={<ShieldCheck size={16} />}
                    tone="success"
                  />

                  <SummaryCard
                    title="Pipeline"
                    value={String(pendingDocuments)}
                    helper="Pending"
                    icon={<Clock3 size={16} />}
                    tone="warning"
                  />

                  <SummaryCard
                    title="Blocked"
                    value={String(blockedDocuments)}
                    helper="Unsafe"
                    icon={<ShieldAlert size={16} />}
                    tone="danger"
                  />

                  <SummaryCard
                    title="Archived"
                    value={String(archivedDocuments)}
                    helper="Inactive"
                    icon={<ArchiveIcon size={16} />}
                  />
                </div>
              </div>

              {(actionMessage || errorMessage) && (
                <div className="mt-3 space-y-2">
                  {actionMessage && (
                    <AlertBox
                      type={actionMessage.type}
                      message={actionMessage.message}
                      onClose={() => setActionMessage(null)}
                    />
                  )}

                  {errorMessage && (
                    <AlertBox type="error" message={errorMessage} />
                  )}
                </div>
              )}

              <div className="mt-3 flex flex-col gap-2 xl:flex-row xl:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />

                  <input
                    value={searchInput}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setSearchInput(event.target.value)
                    }
                    placeholder="Search documents, project, category, code or tag..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex xl:shrink-0">
                  <div className="relative">
                    <Filter
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={status}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        setStatus(event.target.value)
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-7 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 xl:w-40"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
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
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 xl:w-40"
                  >
                    {scanStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={categoryId}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      setCategoryId(event.target.value)
                    }
                    className="col-span-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 sm:col-span-1 xl:w-48"
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Loading categories..."
                        : "All Categories"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openCategoryModal}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <Plus size={15} />
                    Category
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchPanelOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Activity size={15} />
                    Batch
                  </button>

                  <button
                    type="button"
                    onClick={() => setProcessingPanelOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                  >
                    <Workflow size={15} />
                    Processing
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 bg-slate-50/60 p-3">
              <DocumentsTable
                documents={documents}
                loading={loading}
                selectedDocument={selectedDocument}
                onSelectDocument={setSelectedDocument}
              />
            </div>
          </div>
        </section>
      </main>

      {selectedDocument && (
        <div
          className="fixed inset-0 z-[70] flex justify-end bg-slate-950/35 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-label="Document details"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDocument(null);
            }
          }}
        >
          <div
            className="h-full w-full max-w-[560px] p-2 sm:p-4"
            onMouseDown={(event) => event.stopPropagation()}
          >
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
        </div>
      )}

      {batchPanelOpen && (
        <WorkspaceModal
          title="Batch Operations"
          description="Run one secure processing action across all eligible documents."
          icon={<Activity size={19} />}
          onClose={() => setBatchPanelOpen(false)}
        >
          <BatchOperationsPanel
            batchLoadingAction={batchLoadingAction}
            onBatchAction={runBatchAction}
          />
        </WorkspaceModal>
      )}

      {processingPanelOpen && (
        <WorkspaceModal
          title="Processing Overview"
          description={`${encryptedDocuments} encrypted · ${plaintextReadyDocuments} text ready · ${aiSummary?.analyzed_documents ?? 0} AI analyzed`}
          icon={<Workflow size={19} />}
          onClose={() => setProcessingPanelOpen(false)}
          wide
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <SandboxSummaryPanel
              summary={sandboxSummary}
              loading={sandboxSummaryLoading}
            />
            <EncryptionSummaryPanel
              summary={encryptionSummary}
              loading={encryptionSummaryLoading}
            />
            <AiSummaryPanel summary={aiSummary} loading={aiSummaryLoading} />
          </div>
        </WorkspaceModal>
      )}

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


function WorkspaceModal({
  title,
  description,
  icon,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[1px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[86vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${
          wide ? "max-w-6xl" : "max-w-3xl"
        }`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              {icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={`Close ${title}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-5">
          {children}
        </div>
      </div>
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
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : type === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-blue-200 bg-blue-50 text-blue-700";

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error"
        ? AlertCircle
        : ShieldCheck;

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${style} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 opacity-70 hover:opacity-100"
        >
          <X size={16} />
        </button>
      )}
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
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-violet-800">
          <BrainCircuit size={17} />
          <h2 className="text-sm font-semibold">AI Analysis</h2>
        </div>
        {loading && (
          <Loader2 size={15} className="animate-spin text-violet-500" />
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <AiSmallCard
          label="Ready"
          value={summary?.ready_for_ai ?? 0}
          tone="ready"
        />
        <AiSmallCard
          label="Analyzed"
          value={summary?.analyzed_documents ?? 0}
          tone="done"
        />
        <AiSmallCard
          label="Failed"
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
    ready: "border-blue-200 bg-white text-blue-700",
    done: "border-emerald-200 bg-white text-emerald-700",
    pending: "border-amber-200 bg-white text-amber-700",
    danger: "border-red-200 bg-white text-red-700",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="text-[11px] opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
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
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-orange-800">
          <Radar size={17} />
          <h2 className="text-sm font-semibold">Sandbox</h2>
        </div>
        {loading && (
          <Loader2 size={15} className="animate-spin text-orange-500" />
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
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
    ready: "border-blue-200 bg-white text-blue-700",
    done: "border-emerald-200 bg-white text-emerald-700",
    pending: "border-amber-200 bg-white text-amber-700",
    danger: "border-red-200 bg-white text-red-700",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="text-[11px] opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
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
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-800">
          <LockKeyhole size={17} />
          <h2 className="text-sm font-semibold">Encryption</h2>
        </div>
        {loading && (
          <Loader2 size={15} className="animate-spin text-emerald-500" />
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
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
    ready: "border-blue-200 bg-white text-blue-700",
    done: "border-emerald-200 bg-white text-emerald-700",
    pending: "border-amber-200 bg-white text-amber-700",
    danger: "border-red-200 bg-white text-red-700",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="text-[11px] opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function SandboxPanel({
  document,
  logs,
  loadingLogs,
}: {
  document: DmsDocument;
  logs: SandboxLog[];
  loadingLogs: boolean;
}) {
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-orange-800">
          <Radar size={17} />
          <h3 className="text-sm font-semibold">Sandbox History</h3>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(document.sandbox_status)}`}
        >
          {getReadableStatus(document.sandbox_status)}
        </span>
      </div>

      {loadingLogs ? (
        <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
          <Loader2 size={14} className="animate-spin" /> Loading logs...
        </div>
      ) : logs.length === 0 ? (
        <p className="text-xs text-slate-500">No sandbox logs found.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={String(log.id ?? `${log.status}-${log.created_at}`)}
              className="rounded-lg border border-orange-100 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Sandbox Test
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(log.status)}`}
                >
                  {getReadableStatus(log.status)}
                </span>
              </div>
              {log.message && (
                <p className="mt-1 text-[11px] text-slate-500">{log.message}</p>
              )}
              {log.created_at && (
                <p className="mt-1 text-[10px] text-slate-400">
                  {formatDate(log.created_at)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EncryptionPanel({
  document,
  logs,
  loadingLogs,
}: {
  document: DmsDocument;
  logs: EncryptionLog[];
  loadingLogs: boolean;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-800">
          <LockKeyhole size={17} />
          <h3 className="text-sm font-semibold">Encryption History</h3>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(document.encryption_status)}`}
        >
          {getReadableStatus(document.encryption_status)}
        </span>
      </div>

      {loadingLogs ? (
        <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
          <Loader2 size={14} className="animate-spin" /> Loading logs...
        </div>
      ) : logs.length === 0 ? (
        <p className="text-xs text-slate-500">No encryption logs found.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={String(log.id ?? `${log.status}-${log.created_at}`)}
              className="rounded-lg border border-emerald-100 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Encryption Event
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(log.status)}`}
                >
                  {getReadableStatus(log.status)}
                </span>
              </div>
              {log.message && (
                <p className="mt-1 text-[11px] text-slate-500">{log.message}</p>
              )}
              {log.created_at && (
                <p className="mt-1 text-[10px] text-slate-400">
                  {formatDate(log.created_at)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
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
    icon: ReactNode;
  }> = [
    { action: "scan_pending", title: "Scan Pending", icon: <Bug size={16} /> },
    { action: "sandbox_pending", title: "Sandbox", icon: <Radar size={16} /> },
    {
      action: "extract_pending",
      title: "Extract Text",
      icon: <ScanSearch size={16} />,
    },
    {
      action: "encrypt_clean",
      title: "Encrypt Clean",
      icon: <LockKeyhole size={16} />,
    },
    {
      action: "ai_pending",
      title: "Analyze AI",
      icon: <BrainCircuit size={16} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {actions.map((item) => {
        const isLoading = batchLoadingAction === item.action;
        return (
          <button
            type="button"
            key={item.action}
            onClick={() => onBatchAction(item.action)}
            disabled={Boolean(batchLoadingAction)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              item.icon
            )}
            {item.title}
          </button>
        );
      })}
    </div>
  );
}

function DocumentsTable({
  documents,
  loading,
  selectedDocument,
  onSelectDocument,
}: {
  documents: DmsDocument[];
  loading: boolean;
  selectedDocument: DmsDocument | null;
  onSelectDocument: (document: DmsDocument) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">Results</h2>
          <span className="text-xs text-slate-400">
            Click a row to open document controls
          </span>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {documents.length} records
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Scan</th>
              <th className="px-4 py-3">Pipeline</th>
              <th className="px-4 py-3">Modified</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-3 text-slate-400">
                    <Loader2 size={20} className="animate-spin" />
                    Loading documents...
                  </div>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <FolderOpen size={28} className="mx-auto text-slate-600" />
                  <p className="mt-3 font-semibold text-slate-700">
                    No documents found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Create a project and upload documents from its workspace.
                  </p>
                </td>
              </tr>
            ) : (
              documents.map((document) => {
                const isSelected = selectedDocument?.id === document.id;
                const scanUi = getScanUiState(document);

                return (
                  <tr
                    key={document.id}
                    onClick={() => onSelectDocument(document)}
                    className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 ${
                      isSelected ? "bg-blue-50/80" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                          {getFileIcon(document)}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[280px] truncate font-semibold text-slate-800">
                            {document.original_file_name ||
                              document.title ||
                              `Document #${document.id}`}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {document.document_code || "No code"} ·{" "}
                            {document.extension?.toUpperCase() || "FILE"} ·{" "}
                            {formatBytes(document.file_size)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <p className="max-w-[170px] truncate">
                        {document.project?.name || "No Project"}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {document.category?.name || "Uncategorized"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${scanUi.badgeClass}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {scanUi.label}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <SmallPipelineBadge
                          label="Sandbox"
                          value={document.sandbox_status}
                        />
                        <SmallPipelineBadge
                          label="Encrypt"
                          value={document.encryption_status}
                        />
                        <SmallPipelineBadge
                          label="Text"
                          value={document.plaintext_status}
                        />
                        <SmallPipelineBadge
                          label="AI"
                          value={document.ai_status}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500">
                      {isArchivedDocument(document)
                        ? formatDate(document.archived_at || document.updated_at)
                        : formatDate(document.updated_at || document.created_at)}
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
    payload: AiApplySuggestionsPayload,
  ) => void;
  onClose: () => void;
}) {
  if (!selectedDocument) {
    return (
      <aside className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <div>
          <FileText size={30} className="mx-auto text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No document selected
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Select a document from the table.
          </p>
        </div>
      </aside>
    );
  }

  const tags = getTags(selectedDocument);
  const scanUi = getScanUiState(selectedDocument);
  const isActionLoading = (action: DocumentAction): boolean =>
    actionLoadingKey === makeActionKey(selectedDocument.id, action);

  return (
    <aside className="h-full min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              {getFileIcon(selectedDocument)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-900">
                {selectedDocument.original_file_name || selectedDocument.title}
              </h2>
              <p className="mt-0.5 truncate text-[11px] text-slate-400">
                {selectedDocument.document_code || "No document code"} ·{" "}
                {formatBytes(selectedDocument.file_size)}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close document details"
        >
          <X size={17} />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <PipelineStatusRow
            label="Scan"
            value={selectedDocument.scan_status}
          />
          <PipelineStatusRow
            label="Sandbox"
            value={selectedDocument.sandbox_status}
          />
          <PipelineStatusRow
            label="Encryption"
            value={selectedDocument.encryption_status}
          />
          <PipelineStatusRow label="AI" value={selectedDocument.ai_status} />
        </div>

        <div className={`rounded-xl border p-3 ${scanUi.badgeClass}`}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} />
            <p className="text-sm font-semibold">{scanUi.label}</p>
          </div>
          <p className="mt-1 text-xs opacity-80">{scanUi.helper}</p>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Access
          </p>
          <div className="grid grid-cols-3 gap-2">
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
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workflow Actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <DocumentActionButton
              label={scanUi.buttonLabel}
              icon={<Bug size={15} className={scanUi.iconClass} />}
              loading={isActionLoading("scan")}
              onClick={() => onDocumentAction(selectedDocument, "scan")}
            />
            <DocumentActionButton
              label={
                isSandboxSafeDocument(selectedDocument)
                  ? "Sandbox Safe"
                  : "Run Sandbox"
              }
              icon={<Radar size={15} />}
              loading={isActionLoading("sandbox")}
              onClick={() => onDocumentAction(selectedDocument, "sandbox")}
            />
            {canRejectUnsafeSandbox(selectedDocument) && (
              <DocumentActionButton
                label="Reject Unsafe"
                icon={<ShieldAlert size={15} />}
                loading={isActionLoading("reject_unsafe")}
                onClick={() =>
                  onDocumentAction(selectedDocument, "reject_unsafe")
                }
              />
            )}
            <DocumentActionButton
              label={
                isEncryptedDocument(selectedDocument) ? "Encrypted" : "Encrypt"
              }
              icon={<LockKeyhole size={15} />}
              loading={isActionLoading("encrypt")}
              onClick={() => onDocumentAction(selectedDocument, "encrypt")}
            />
            <DocumentActionButton
              label="Verify"
              icon={<CheckCircle2 size={15} />}
              loading={isActionLoading("verify_encryption")}
              onClick={() =>
                onDocumentAction(selectedDocument, "verify_encryption")
              }
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Archive
          </p>
          <div className="grid grid-cols-2 gap-2">
            {isArchivedDocument(selectedDocument) ? (
              <DocumentActionButton
                label="Restore"
                icon={<RefreshCcw size={15} />}
                loading={isActionLoading("restore_archive")}
                onClick={() =>
                  onDocumentAction(selectedDocument, "restore_archive")
                }
              />
            ) : (
              <DocumentActionButton
                label="Archive"
                icon={<ArchiveIcon size={15} />}
                loading={isActionLoading("archive")}
                onClick={() => onDocumentAction(selectedDocument, "archive")}
              />
            )}
          </div>
        </div>

        <details className="group rounded-xl border border-slate-200">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700">
            Access Control
            <span className="text-xs text-blue-600 group-open:hidden">
              Open
            </span>
            <span className="hidden text-xs text-blue-600 group-open:inline">
              Close
            </span>
          </summary>
          <div className="border-t border-slate-100 p-3">
            <AccessStatusPanel
              document={selectedDocument}
              accessStatus={accessStatus}
              loading={accessStatusLoading}
            />
          </div>
        </details>

        <details className="group rounded-xl border border-slate-200">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700">
            Sandbox History
            <span className="text-xs text-blue-600 group-open:hidden">
              Open
            </span>
            <span className="hidden text-xs text-blue-600 group-open:inline">
              Close
            </span>
          </summary>
          <div className="border-t border-slate-100 p-3">
            <SandboxPanel
              document={selectedDocument}
              logs={sandboxLogs}
              loadingLogs={sandboxLogsLoading}
            />
          </div>
        </details>

        <details className="group rounded-xl border border-slate-200">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700">
            Encryption History
            <span className="text-xs text-blue-600 group-open:hidden">
              Open
            </span>
            <span className="hidden text-xs text-blue-600 group-open:inline">
              Close
            </span>
          </summary>
          <div className="border-t border-slate-100 p-3">
            <EncryptionPanel
              document={selectedDocument}
              logs={encryptionLogs}
              loadingLogs={encryptionLogsLoading}
            />
          </div>
        </details>

        <details className="group rounded-xl border border-slate-200">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700">
            AI Analysis
            <span className="text-xs text-blue-600 group-open:hidden">
              Open
            </span>
            <span className="hidden text-xs text-blue-600 group-open:inline">
              Close
            </span>
          </summary>
          <div className="border-t border-slate-100 p-3">
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
              onExtractText={() =>
                onDocumentAction(selectedDocument, "plaintext")
              }
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
                onApplyAiSuggestions(selectedDocument, { apply_tags: true })
              }
              onApplyCategory={() =>
                onApplyAiSuggestions(selectedDocument, { apply_category: true })
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
          </div>
        </details>

        <details className="group rounded-xl border border-slate-200">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700">
            Document Information
            <span className="text-xs text-blue-600 group-open:hidden">
              Open
            </span>
            <span className="hidden text-xs text-blue-600 group-open:inline">
              Close
            </span>
          </summary>
          <div className="space-y-3 border-t border-slate-100 p-3 text-sm">
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
              label="Uploaded By"
              value={selectedDocument.uploader?.name || "—"}
            />
            <DetailRow
              label="Status"
              value={getReadableStatus(selectedDocument.status)}
            />
            <DetailRow
              label="Modified"
              value={formatDate(selectedDocument.updated_at)}
            />

            {isArchivedDocument(selectedDocument) && (
              <>
                <DetailRow
                  label="Archived At"
                  value={formatDate(selectedDocument.archived_at)}
                />
                <DetailRow
                  label="Archive Reason"
                  value={selectedDocument.archive_reason || "—"}
                />
              </>
            )}

            {selectedDocument.description && (
              <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                {selectedDocument.description}
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </details>
      </div>
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
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-violet-800">
          <BrainCircuit size={18} className="text-violet-600" />
          <h3 className="text-sm font-semibold">AI Analysis</h3>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] ${getStatusClass(
            document.ai_status,
          )}`}
        >
          {getReadableStatus(document.ai_status)}
        </span>
      </div>

      {!plaintextExtracted && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-700">
          Extract plaintext/OCR first. AI reads safe extracted text, not the raw
          file directly.
        </div>
      )}

      {plaintextExtracted && !canRunAi && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
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
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Loading AI analysis...
        </div>
      )}

      {!loading && !analysis && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
          No AI analysis result found yet. Run AI after security processing is
          complete.
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
              Summary
            </p>
            <p className="text-sm leading-6 text-slate-700">
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
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
                Suggested Tags
              </p>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-violet-100 px-2 py-1 text-xs text-violet-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
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
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : accessStatus && reasonBlocked
        ? "border-red-200 bg-red-50 text-red-700"
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
        <AccessFlag
          label="Permission checked"
          enabled={Boolean(accessStatus)}
          neutral
        />
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
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-slate-50 text-slate-500"
    : enabled
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

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
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

function AiInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="max-w-[170px] break-words text-right text-xs font-medium text-slate-700">
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
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/45 px-4 py-6 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
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
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category Name <span className="text-red-600">*</span>
            </label>
            <input
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="Example: Geological Reports"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(event) =>
                  onChange(
                    "status",
                    event.target.value === "inactive" ? "inactive" : "active",
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
              >
                <option value="active" className="bg-white">
                  Active
                </option>
                <option value="inactive" className="bg-white">
                  Inactive
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sort Order
              </label>
              <input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(event) => onChange("sort_order", event.target.value)}
                placeholder="Example: 1"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              rows={4}
              placeholder="Short description about this category..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {saving ? "Saving..." : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DocumentsPageTabs() {
  const tabs = [
    { label: "All Documents", path: "/alldocuments", icon: Files },
    // { label: "My Documents", path: "/mydocs", icon: UserCircle2 },
    // { label: "Shared", path: "/shareddocs", icon: Share2 },
    // { label: "Favorites", path: "/favorite", icon: Star },
    // { label: "Archive", path: "/archive", icon: ArchiveIcon },
  ];

  return (
    <div className="min-w-0 overflow-x-auto">
      <div className="flex min-w-max items-center gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
                  isActive
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }`
              }
            >
              <Icon size={14} />
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
    default: "bg-blue-50 text-blue-600 border-blue-100",
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    danger: "bg-red-50 text-red-600 border-red-100",
  }[tone];

  return (
    <div className="flex min-w-[132px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${toneClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <p className="text-lg font-bold leading-none text-slate-900">{value}</p>
          <p className="truncate text-[11px] font-semibold text-slate-500">
            {title}
          </p>
        </div>
        <p className="mt-1 truncate text-[10px] text-slate-400">{helper}</p>
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
        value,
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <span
        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] ${getStatusClass(value)}`}
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
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[190px] break-words text-right font-medium text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}