import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  DragEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import {
  AlertCircle,
  Bell,
  Bug,
  CheckCircle2,
  ChevronDown,
  Command,
  FileText,
  Info,
  Loader2,
  LockKeyhole,
  ScanSearch,
  Search,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import AdminSidebar from "../AdminSidebar";
import {
  getDocumentCategories,
  getProjects,
  uploadDocument,
} from "../../../services/dmsApi";
import type {
  DocumentCategory,
  DocumentType,
  ProjectSummary,
  SecurityLevel as DocumentSecurityLevel,
} from "../../../services/dmsApi";

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

type UploadProps = {
  modalMode?: boolean;
  onClose?: () => void;
  onUploaded?: () => void;

  defaultProjectId?: number | string | null;
  lockProjectSelection?: boolean;
  projectLabel?: string;
};

type UploadFormState = {
  title: string;
  projectId: string;
  categoryId: string;
  documentType: DocumentType | "";
  securityLevel: DocumentSecurityLevel;
  description: string;
  tagInput: string;
  tags: string[];
  runOcr: boolean;
};

type ProgressStatus = "idle" | "running" | "success" | "failed";

const documentTypeOptions: {
  label: string;
  value: DocumentType;
}[] = [
  { label: "Geological Report", value: "geological_report" },
  { label: "Technical Drawing", value: "technical_drawing" },
  { label: "Construction Record", value: "construction_record" },
  { label: "Survey Map", value: "survey_map" },
  { label: "Contract", value: "contract" },
  { label: "Plain Text", value: "plain_text" },
  { label: "Image", value: "image" },
  { label: "Spreadsheet", value: "spreadsheet" },
  { label: "Presentation", value: "presentation" },
  { label: "Other", value: "other" },
];

const securityLevelOptions: {
  label: string;
  value: DocumentSecurityLevel;
  helper: string;
}[] = [
  {
    label: "Public",
    value: "public",
    helper: "Can be accessed by allowed general users.",
  },
  {
    label: "Internal",
    value: "internal",
    helper: "Default company internal document.",
  },
  {
    label: "Confidential",
    value: "confidential",
    helper: "Sensitive document for approved roles only.",
  },
  {
    label: "Restricted",
    value: "restricted",
    helper: "Highly sensitive document with strict access.",
  },
];

const allowedFileExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".jpg",
  ".jpeg",
  ".png",
  ".tif",
  ".tiff",
  ".txt",
  ".csv",
  ".dwg",
  ".dxf",
];

const initialFormState: UploadFormState = {
  title: "",
  projectId: "",
  categoryId: "",
  documentType: "",
  securityLevel: "internal",
  description: "",
  tagInput: "",
  tags: [],
  runOcr: false,
};

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size = size / 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop() : "";

  return extension ? `.${extension.toLowerCase()}` : "";
}

function isAllowedFile(file: File): boolean {
  const extension = getFileExtension(file.name);

  return allowedFileExtensions.includes(extension);
}

function getApiErrorDataMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;

  if (typeof record.message === "string") {
    return record.message;
  }

  if (record.errors && typeof record.errors === "object") {
    const errors = record.errors as Record<string, unknown>;
    const firstError = Object.values(errors)[0];

    if (Array.isArray(firstError) && typeof firstError[0] === "string") {
      return firstError[0];
    }

    if (typeof firstError === "string") {
      return firstError;
    }
  }

  if (record.data && typeof record.data === "object") {
    const nestedData = record.data as Record<string, unknown>;

    if (typeof nestedData.error === "string") {
      return nestedData.error;
    }
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError;
  const dataMessage = getApiErrorDataMessage(apiError.data);

  if (apiError.status === 401) {
    return dataMessage || "Your session expired. Please login again.";
  }

  if (apiError.status === 403) {
    return dataMessage || "You do not have permission to upload documents.";
  }

  if (apiError.status === 422) {
    return dataMessage || apiError.message || "Some required information is missing or invalid.";
  }

  if (apiError.status === 500) {
    return dataMessage || apiError.message || "Server error during upload. Please check Laravel logs.";
  }

  return dataMessage || apiError.message || "Upload failed. Please try again.";
}

function getSecurityHelper(level: DocumentSecurityLevel): string {
  const item = securityLevelOptions.find((option) => option.value === level);

  return item?.helper || "Document access will follow system permission rules.";
}

function getProgressColor(progress: number, status: ProgressStatus): string {
  if (status === "failed") return "bg-red-500";
  if (status === "success") return "bg-emerald-500";

  if (progress < 40) return "bg-red-500";
  if (progress < 85) return "bg-yellow-500";

  return "bg-emerald-500";
}

function getProgressTextColor(progress: number, status: ProgressStatus): string {
  if (status === "failed") return "text-red-300";
  if (status === "success") return "text-emerald-300";

  if (progress < 40) return "text-red-300";
  if (progress < 85) return "text-yellow-300";

  return "text-emerald-300";
}

export default function Upload({
  modalMode = false,
  onClose,
  onUploaded,
  defaultProjectId = null,
  lockProjectSelection = false,
  projectLabel = "",
}: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);

  const [formData, setFormData] =
    useState<UploadFormState>(initialFormState);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [loadingLookups, setLoadingLookups] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);

  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStage, setScanStage] = useState<string>("Waiting for upload");
  const [progressStatus, setProgressStatus] =
    useState<ProgressStatus>("idle");

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const allowedFileText = useMemo(() => {
    return allowedFileExtensions.join(", ");
  }, []);

  function resetForm(clearMessages = true): void {
    setFormData({
      ...initialFormState,
      projectId: defaultProjectId ? String(defaultProjectId) : "",
    });
    setSelectedFile(null);

    if (clearMessages) {
      setErrorMessage("");
      setSuccessMessage("");
      setScanProgress(0);
      setScanStage("Waiting for upload");
      setProgressStatus("idle");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function updateField<K extends keyof UploadFormState>(
    field: K,
    value: UploadFormState[K]
  ): void {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  }

  async function loadLookups(): Promise<void> {
    try {
      setLoadingLookups(true);
      setErrorMessage("");

      const [categoryData, projectData] = await Promise.all([
        getDocumentCategories({
          status: "active",
        }),
        getProjects(),
      ]);

      setCategories(categoryData);
      setProjects(projectData);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error) ||
          "Failed to load projects and categories. Please refresh."
      );
    } finally {
      setLoadingLookups(false);
    }
  }

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    if (defaultProjectId) {
      setFormData((previous) => ({
        ...previous,
        projectId: String(defaultProjectId),
      }));
    }
  }, [defaultProjectId]);

  function handleFileSelect(file: File | null): void {
    if (!file) return;

    if (!isAllowedFile(file)) {
      setSelectedFile(null);
      setErrorMessage(
        `This file type is not allowed. Allowed files: ${allowedFileText}`
      );
      return;
    }

    const maxSizeInBytes = 100 * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      setSelectedFile(null);
      setErrorMessage("File is too large. Maximum allowed size is 100MB.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage("");
    setSuccessMessage("");
    setScanProgress(0);
    setScanStage("Waiting for upload");
    setProgressStatus("idle");

    if (!formData.title.trim()) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");

      setFormData((previous) => ({
        ...previous,
        title: nameWithoutExtension,
      }));
    }
  }

  function handleFileInputChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    const file = event.target.files?.[0] || null;

    handleFileSelect(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0] || null;

    handleFileSelect(file);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(): void {
    setIsDragging(false);
  }

  function handleAddTag(): void {
    const tag = formData.tagInput.trim();

    if (!tag) return;

    if (formData.tags.includes(tag)) {
      updateField("tagInput", "");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      tags: [...previous.tags, tag],
      tagInput: "",
    }));

    if (errorMessage) setErrorMessage("");
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }

    if (
      event.key === "Backspace" &&
      !formData.tagInput &&
      formData.tags.length > 0
    ) {
      setFormData((previous) => ({
        ...previous,
        tags: previous.tags.slice(0, -1),
      }));
    }
  }

  function removeTag(tagToRemove: string): void {
    setFormData((previous) => ({
      ...previous,
      tags: previous.tags.filter((tag) => tag !== tagToRemove),
    }));
  }

  function validateForm(): boolean {
    if (!selectedFile) {
      setErrorMessage("Please select a document file first.");
      return false;
    }

    if (!formData.title.trim()) {
      setErrorMessage("Please enter the document title.");
      return false;
    }

    if (!formData.categoryId) {
      setErrorMessage("Please select a document category.");
      return false;
    }

    if (!formData.documentType) {
      setErrorMessage("Please select the document type.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!validateForm() || !selectedFile) return;

    let progressTimer: number | undefined;

    try {
      setUploading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setProgressStatus("running");

      setScanProgress(10);
      setScanStage("Uploading file to quarantine...");

      progressTimer = window.setInterval(() => {
        setScanProgress((current) => {
          if (current < 35) {
            setScanStage("Uploading file to quarantine...");
            return current + 5;
          }

          if (current < 65) {
            setScanStage("File is quarantined. Mandatory antivirus scan running...");
            return current + 4;
          }

          if (current < 90) {
            setScanStage("Checking scan result and security status...");
            return current + 2;
          }

          return current;
        });
      }, 400);

      const resolvedProjectId = defaultProjectId
        ? Number(defaultProjectId)
        : formData.projectId
        ? Number(formData.projectId)
        : null;

      const uploadedDocument = await uploadDocument({
        file: selectedFile,
        project_id: resolvedProjectId,
        document_category_id: Number(formData.categoryId),
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        document_type: formData.documentType || "other",
        security_level: formData.securityLevel || "internal",
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        metadata: {
          run_ocr: formData.runOcr,
          virus_scan_required: true,
          uploaded_from: modalMode ? "project_or_documents_modal" : "web_dashboard",
          intake_step: "quarantine_auto_scan",
          intake_note:
            "Uploaded document is placed in quarantine and scanning is mandatory before active use.",
        },
      });

      if (progressTimer) {
        window.clearInterval(progressTimer);
      }

      resetForm(false);

      setProgressStatus("success");
      setScanProgress(100);

      if (uploadedDocument?.scan_status === "pending") {
        setScanStage("Document saved in quarantine. Manual scan may be required.");
        setSuccessMessage(
          "Document uploaded successfully and placed in quarantine. It is waiting for mandatory antivirus scan."
        );
      } else {
        setScanStage("Upload completed. Document security status updated.");
        setSuccessMessage(
          "Document uploaded successfully. The backend security pipeline updated the document status."
        );
      }

      onUploaded?.();

      if (modalMode) {
        window.setTimeout(() => {
          onClose?.();
        }, 1200);
      }
    } catch (error) {
      if (progressTimer) {
        window.clearInterval(progressTimer);
      }

      const message = getErrorMessage(error);

      setProgressStatus("failed");
      setScanProgress(100);
      setScanStage(message);
      setErrorMessage(message);
    } finally {
      setUploading(false);
    }
  }

  const showProgress = uploading || scanProgress > 0;

  return (
    <div
      className={
        modalMode
          ? "bg-[#0f0f1b] font-sans text-slate-200 selection:bg-blue-500/30"
          : "flex h-screen overflow-hidden bg-[#0f0f1b] font-sans text-slate-200 selection:bg-blue-500/30"
      }
    >
      {!modalMode && <AdminSidebar />}

      <main
        className={
          modalMode
            ? "flex min-w-0 flex-col"
            : "flex min-w-0 flex-1 flex-col overflow-hidden"
        }
      >
        {!modalMode && (
          <header className="z-10 flex h-16 items-center justify-between border-b border-slate-800/50 bg-[#0f0f1b]/80 px-8 backdrop-blur-md">
            <div className="max-w-2xl flex-1">
              <div className="group relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400"
                  size={18}
                />

                <input
                  type="text"
                  placeholder="Search for documents, projects, or metadata..."
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
                    DMS User
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Document Management
                  </p>
                </div>

                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-800 bg-blue-700/40 text-xs font-semibold text-white transition-colors group-hover:border-slate-600">
                    DU
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
        )}

        <div
          className={
            modalMode
              ? "p-6"
              : "custom-scrollbar flex-1 overflow-y-auto p-8"
          }
        >
          <div className="w-full">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  Upload Document
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Upload records into the secure DMS pipeline.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();

                  if (modalMode) {
                    onClose?.();
                  }
                }}
                disabled={uploading}
                className="rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {modalMode ? "Close" : "Cancel"}
              </button>
            </div>

            <div className="mb-6 grid gap-3 lg:grid-cols-5">
              <PipelineHint
                icon={<UploadCloud size={17} />}
                title="1. Upload"
                text="User uploads document with metadata."
              />
              <PipelineHint
                icon={<ShieldCheck size={17} />}
                title="2. Quarantine"
                text="File is isolated and not trusted yet."
              />
              <PipelineHint
                icon={<Bug size={17} />}
                title="3. Scan"
                text="Antivirus scan is mandatory."
              />
              <PipelineHint
                icon={<ScanSearch size={17} />}
                title="4. Extract"
                text="Safe plaintext and OCR text support search."
              />
              <PipelineHint
                icon={<LockKeyhole size={17} />}
                title="5. Protect"
                text="Clean documents are encrypted and controlled."
              />
            </div>

            {errorMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid gap-6 xl:grid-cols-[1fr_1.2fr]"
            >
              <div className="space-y-5">
                <div className="rounded-xl border border-dashed border-slate-700 bg-[#141426] p-6">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-8 text-center transition ${
                      isDragging
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 bg-slate-900/30 hover:border-blue-500/60 hover:bg-slate-900/60"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={allowedFileExtensions.join(",")}
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                      <UploadCloud size={36} />
                    </div>

                    <h2 className="text-2xl font-semibold text-white">
                      {selectedFile ? "File selected" : "Drag file here"}
                    </h2>

                    <p className="mt-3 max-w-[300px] text-sm leading-6 text-slate-500">
                      {selectedFile
                        ? selectedFile.name
                        : "Drop your file here or click to browse from your device."}
                    </p>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      disabled={uploading}
                      className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Select File
                    </button>

                    <p className="mt-4 text-[11px] uppercase tracking-wider text-slate-600">
                      Max file size: 100MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-[#141426] px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-blue-400">
                      <FileText size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-200">
                        {selectedFile ? selectedFile.name : "No file selected"}
                      </div>

                      <div className="text-xs text-slate-500">
                        {selectedFile
                          ? `${formatBytes(selectedFile.size)} • ${getFileExtension(
                              selectedFile.name
                            ).toUpperCase()}`
                          : "Waiting for upload..."}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      selectedFile ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                  />
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-200">
                    <Info size={16} />
                    Important security rule
                  </div>
                  <p className="text-xs leading-6 text-blue-100/80">
                    After upload, the document is placed in quarantine. It
                    cannot be opened or downloaded until the backend security
                    pipeline approves it.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800/50 bg-[#141426] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Allowed files
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    {allowedFileText}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/50 bg-[#141426] p-6">
                <div className="mb-6 flex items-center gap-2 border-b border-slate-800/50 pb-4">
                  <FileText size={20} className="text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Metadata Entry
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Document Title <span className="text-red-400">*</span>
                    </label>

                    <input
                      value={formData.title}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        updateField("title", event.target.value)
                      }
                      disabled={uploading}
                      className="w-full rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="e.g. Site Survey Report Phase 1"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Project Association
                      </label>

                      {lockProjectSelection && defaultProjectId ? (
                        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
                          {projectLabel || `Project #${defaultProjectId}`}
                          <p className="mt-1 text-[11px] text-blue-200/70">
                            This document will be uploaded under this project.
                          </p>
                        </div>
                      ) : (
                        <select
                          value={formData.projectId}
                          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                            updateField("projectId", event.target.value)
                          }
                          disabled={uploading || loadingLookups}
                          className="w-full rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">
                            {loadingLookups
                              ? "Loading projects..."
                              : "No Project / Optional"}
                          </option>

                          {projects.map((project) => (
                            <option key={project.id} value={String(project.id)}>
                              {project.name}
                              {project.code ? ` (${project.code})` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Category <span className="text-red-400">*</span>
                      </label>

                      <select
                        value={formData.categoryId}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          updateField("categoryId", event.target.value)
                        }
                        disabled={uploading || loadingLookups}
                        className="w-full rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {loadingLookups
                            ? "Loading categories..."
                            : "Select Category..."}
                        </option>

                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Document Type <span className="text-red-400">*</span>
                      </label>

                      <select
                        value={formData.documentType}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          updateField(
                            "documentType",
                            event.target.value as DocumentType
                          )
                        }
                        disabled={uploading}
                        className="w-full rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Select Type...</option>

                        {documentTypeOptions.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Security Level
                      </label>

                      <select
                        value={formData.securityLevel}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          updateField(
                            "securityLevel",
                            event.target.value as DocumentSecurityLevel
                          )
                        }
                        disabled={uploading}
                        className="w-full rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {securityLevelOptions.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>

                      <p className="mt-2 text-[11px] leading-5 text-slate-600">
                        {getSecurityHelper(formData.securityLevel)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Tags
                    </label>

                    <div className="rounded-lg border border-slate-800/50 bg-slate-900/50 px-3 py-2.5 focus-within:border-blue-500/50">
                      {formData.tags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => removeTag(tag)}
                              disabled={uploading}
                              className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2.5 py-1 text-xs text-blue-400 hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {tag}
                              <X size={12} />
                            </button>
                          ))}
                        </div>
                      )}

                      <input
                        value={formData.tagInput}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          updateField("tagInput", event.target.value)
                        }
                        onKeyDown={handleTagKeyDown}
                        onBlur={handleAddTag}
                        disabled={uploading}
                        className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="Type tag and press Enter..."
                      />
                    </div>

                    <p className="mt-2 text-[11px] text-slate-600">
                      Use tags for easier retrieval later.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Description / Remarks
                    </label>

                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                        updateField("description", event.target.value)
                      }
                      disabled={uploading}
                      className="w-full resize-none rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Enter any additional notes about this document..."
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800/50 bg-slate-950/40 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                      <ShieldCheck size={17} className="text-emerald-400" />
                      Security Processing
                    </div>

                    <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.runOcr}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            updateField("runOcr", event.target.checked)
                          }
                          disabled={uploading}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-600 disabled:cursor-not-allowed"
                        />
                        Run OCR
                      </label>

                      <label className="flex items-center gap-2 text-slate-300">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-600 disabled:cursor-not-allowed"
                        />
                        Virus Scan Required
                      </label>
                    </div>

                    <p className="mt-3 text-xs leading-6 text-slate-500">
                      Virus scanning is mandatory. The user cannot bypass it.
                      The backend places the file in quarantine and controls the
                      real scan/security decision.
                    </p>

                    {showProgress && (
                      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                        <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                          <span
                            className={getProgressTextColor(
                              scanProgress,
                              progressStatus
                            )}
                          >
                            {scanStage}
                          </span>
                          <span className="font-semibold text-white">
                            {scanProgress}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                              scanProgress,
                              progressStatus
                            )}`}
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>

                        <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                          <span>Not scanned</span>
                          <span>Scanning</span>
                          <span>Scanned</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => resetForm()}
                      disabled={uploading}
                      className="rounded-xl border border-slate-800 px-5 py-3 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reset Form
                    </button>

                    <button
                      type="submit"
                      disabled={uploading || loadingLookups}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Uploading & Scanning...
                        </>
                      ) : (
                        <>
                          <UploadCloud size={17} />
                          Upload Document
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function PipelineHint({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800/50 bg-[#141426] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
        <span className="text-blue-400">{icon}</span>
        {title}
      </div>
      <p className="text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}