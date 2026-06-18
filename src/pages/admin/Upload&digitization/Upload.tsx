import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  DragEvent,
  FormEvent,
  KeyboardEvent,
  ReactNode,
} from "react";
import {
  AlertCircle,
  Bug,
  CheckCircle2,
  ChevronDown,
  FileText,
  FolderOpen,
  Info,
  Loader2,
  LockKeyhole,
  RefreshCcw,
  ScanSearch,
  ShieldCheck,
  Tags,
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

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

const documentTypeOptions: SelectOption<DocumentType>[] = [
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

const securityLevelOptions: Array<{
  label: string;
  value: DocumentSecurityLevel;
  helper: string;
}> = [
  {
    label: "Public",
    value: "public",
    helper: "Available to general users who have project access.",
  },
  {
    label: "Internal",
    value: "internal",
    helper: "Recommended for normal company documents.",
  },
  {
    label: "Confidential",
    value: "confidential",
    helper: "Limited to approved roles and project members.",
  },
  {
    label: "Restricted",
    value: "restricted",
    helper: "Highest protection with strict access controls.",
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

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop() : "";

  return extension ? `.${extension.toLowerCase()}` : "";
}

function isAllowedFile(file: File): boolean {
  return allowedFileExtensions.includes(getFileExtension(file.name));
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
    return dataMessage || "Your session expired. Please sign in again.";
  }

  if (apiError.status === 403) {
    return dataMessage || "You do not have permission to upload documents.";
  }

  if (apiError.status === 422) {
    return (
      dataMessage ||
      apiError.message ||
      "Some required information is missing or invalid."
    );
  }

  if (apiError.status === 500) {
    return (
      dataMessage ||
      apiError.message ||
      "The server could not process the upload."
    );
  }

  return dataMessage || apiError.message || "Upload failed. Please try again.";
}

function getSecurityHelper(level: DocumentSecurityLevel): string {
  return (
    securityLevelOptions.find((option) => option.value === level)?.helper ||
    "Document access follows system permission rules."
  );
}

function getProgressColor(
  progress: number,
  status: ProgressStatus
): string {
  if (status === "failed") return "bg-red-500";
  if (status === "success") return "bg-emerald-500";
  if (progress < 40) return "bg-blue-500";
  if (progress < 85) return "bg-amber-500";

  return "bg-emerald-500";
}

function getProgressTextClass(status: ProgressStatus): string {
  if (status === "failed") return "text-red-700";
  if (status === "success") return "text-emerald-700";

  return "text-blue-700";
}

function normalizeProjectsResponse(response: unknown): ProjectSummary[] {
  if (Array.isArray(response)) {
    return response as ProjectSummary[];
  }

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return record.data as ProjectSummary[];
    }

    if (
      record.data &&
      typeof record.data === "object" &&
      Array.isArray((record.data as Record<string, unknown>).data)
    ) {
      return (record.data as Record<string, unknown>)
        .data as ProjectSummary[];
    }

    if (Array.isArray(record.projects)) {
      return record.projects as ProjectSummary[];
    }
  }

  return [];
}

function normalizeCategoriesResponse(response: unknown): DocumentCategory[] {
  if (Array.isArray(response)) {
    return response as DocumentCategory[];
  }

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return record.data as DocumentCategory[];
    }

    if (
      record.data &&
      typeof record.data === "object" &&
      Array.isArray((record.data as Record<string, unknown>).data)
    ) {
      return (record.data as Record<string, unknown>)
        .data as DocumentCategory[];
    }

    if (Array.isArray(record.categories)) {
      return record.categories as DocumentCategory[];
    }
  }

  return [];
}

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function SelectField({
  label,
  value,
  disabled,
  required = false,
  children,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  required?: boolean;
  children: ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <FieldLabel required={required}>{label}</FieldLabel>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
        >
          {children}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

function AlertBox({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      )}
    >
      <Icon size={17} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function PipelineStep({
  number,
  title,
  text,
  icon,
}: {
  number: number;
  title: string;
  text: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-700">
          {number}. {title}
        </p>

        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}

function SecurityOption({
  title,
  description,
  checked,
  locked = false,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border px-4 py-3",
        checked
          ? "border-blue-200 bg-blue-50/70"
          : "border-slate-200 bg-white",
        locked ? "cursor-default" : "cursor-pointer"
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-700">{title}</p>

        <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        disabled={locked || disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600"
      />
    </label>
  );
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

  const [formData, setFormData] = useState<UploadFormState>({
    ...initialFormState,
    projectId: defaultProjectId ? String(defaultProjectId) : "",
  });

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

  const allowedFileText = useMemo(
    () => allowedFileExtensions.join(", "),
    []
  );

  const selectedSecurity = useMemo(
    () =>
      securityLevelOptions.find(
        (option) => option.value === formData.securityLevel
      ),
    [formData.securityLevel]
  );

  function resetForm(clearProgress = true): void {
    setFormData({
      ...initialFormState,
      projectId: defaultProjectId ? String(defaultProjectId) : "",
    });

    setSelectedFile(null);
    setErrorMessage("");
    setSuccessMessage("");

    if (clearProgress) {
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
    setFormData((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  }

  async function loadLookups(): Promise<void> {
    try {
      setLoadingLookups(true);
      setErrorMessage("");

      const [categoryResponse, projectResponse] = await Promise.all([
        getDocumentCategories({
          status: "active",
        }),
        getProjects(),
      ]);

      setCategories(normalizeCategoriesResponse(categoryResponse));
      setProjects(normalizeProjectsResponse(projectResponse));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingLookups(false);
    }
  }

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    setFormData((currentForm) => ({
      ...currentForm,
      projectId: defaultProjectId ? String(defaultProjectId) : "",
    }));
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

    const maximumSize = 100 * 1024 * 1024;

    if (file.size > maximumSize) {
      setSelectedFile(null);
      setErrorMessage("The file is too large. Maximum size is 100 MB.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage("");
    setSuccessMessage("");
    setScanProgress(0);
    setScanStage("Waiting for upload");
    setProgressStatus("idle");

    if (!formData.title.trim()) {
      const title = file.name.replace(/\.[^/.]+$/, "");

      setFormData((currentForm) => ({
        ...currentForm,
        title,
      }));
    }
  }

  function handleFileInputChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    handleFileSelect(event.target.files?.[0] || null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelect(event.dataTransfer.files?.[0] || null);
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

    setFormData((currentForm) => ({
      ...currentForm,
      tags: [...currentForm.tags, tag],
      tagInput: "",
    }));
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      handleAddTag();
    }

    if (
      event.key === "Backspace" &&
      !formData.tagInput &&
      formData.tags.length > 0
    ) {
      setFormData((currentForm) => ({
        ...currentForm,
        tags: currentForm.tags.slice(0, -1),
      }));
    }
  }

  function removeTag(tagToRemove: string): void {
    setFormData((currentForm) => ({
      ...currentForm,
      tags: currentForm.tags.filter((tag) => tag !== tagToRemove),
    }));
  }

  function validateForm(): string | null {
    if (!selectedFile) {
      return "Please select a document file.";
    }

    if (!formData.title.trim()) {
      return "Please enter the document title.";
    }

    if (!formData.categoryId) {
      return "Please select a document category.";
    }

    if (!formData.documentType) {
      return "Please select the document type.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError || !selectedFile) {
      setErrorMessage(validationError || "Please select a document file.");
      return;
    }

    let progressTimer: number | undefined;

    try {
      setUploading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setProgressStatus("running");
      setScanProgress(10);
      setScanStage("Uploading the file to quarantine...");

      progressTimer = window.setInterval(() => {
        setScanProgress((currentProgress) => {
          if (currentProgress < 35) {
            setScanStage("Uploading the file to quarantine...");
            return currentProgress + 5;
          }

          if (currentProgress < 65) {
            setScanStage("Running the mandatory antivirus scan...");
            return currentProgress + 4;
          }

          if (currentProgress < 90) {
            setScanStage("Finalizing security information...");
            return currentProgress + 2;
          }

          return currentProgress;
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
          uploaded_from: modalMode
            ? "project_or_documents_modal"
            : "web_dashboard",
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
        setScanStage("Upload completed. Antivirus scanning is pending.");
        setSuccessMessage(
          "The document was uploaded and placed in quarantine for mandatory scanning."
        );
      } else {
        setScanStage("Upload and security processing completed.");
        setSuccessMessage(
          "The document was uploaded successfully and its security status was updated."
        );
      }

      onUploaded?.();

      if (modalMode) {
        window.setTimeout(() => {
          onClose?.();
        }, 1100);
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

  const content = (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col bg-[#f8fafc]",
        modalMode ? "h-full" : "min-h-screen"
      )}
    >
      <div className="flex shrink-0 flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UploadCloud size={19} />
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900">
                Upload Document
              </h1>

              <p className="mt-0.5 text-xs text-slate-500">
                Add a document to the secure DMS workflow.
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {lockProjectSelection && defaultProjectId && (
            <span className="inline-flex max-w-[300px] items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <FolderOpen size={13} />
              <span className="truncate">
                {projectLabel || `Project #${defaultProjectId}`}
              </span>
            </span>
          )}

          <button
            type="button"
            onClick={loadLookups}
            disabled={loadingLookups || uploading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingLookups ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCcw size={14} />
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-5 lg:p-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <PipelineStep
                number={1}
                title="Upload"
                text="Select a file and add its metadata."
                icon={<UploadCloud size={16} />}
              />

              <PipelineStep
                number={2}
                title="Quarantine"
                text="The file remains isolated after upload."
                icon={<ShieldCheck size={16} />}
              />

              <PipelineStep
                number={3}
                title="Scan"
                text="Antivirus scanning is always required."
                icon={<Bug size={16} />}
              />

              <PipelineStep
                number={4}
                title="Extract"
                text="Optional OCR improves document search."
                icon={<ScanSearch size={16} />}
              />

              <PipelineStep
                number={5}
                title="Protect"
                text="Access and encryption rules are applied."
                icon={<LockKeyhole size={16} />}
              />
            </div>

            {errorMessage && (
              <AlertBox type="error" message={errorMessage} />
            )}

            {successMessage && (
              <AlertBox type="success" message={successMessage} />
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <section className="space-y-4 xl:col-span-5">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex min-h-[285px] cursor-pointer flex-col items-center justify-center",
                    "rounded-2xl border-2 border-dashed bg-white px-6 text-center",
                    "transition",
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={allowedFileExtensions.join(",")}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-2xl",
                      selectedFile
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                    )}
                  >
                    {selectedFile ? (
                      <CheckCircle2 size={29} />
                    ) : (
                      <UploadCloud size={29} />
                    )}
                  </div>

                  <h2 className="mt-5 text-base font-bold text-slate-900">
                    {selectedFile
                      ? "Document selected"
                      : "Drop a document here"}
                  </h2>

                  <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                    {selectedFile
                      ? selectedFile.name
                      : "Drag and drop one file, or click this area to browse your device."}
                  </p>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UploadCloud size={15} />
                    {selectedFile ? "Change file" : "Choose file"}
                  </button>

                  <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Maximum file size: 100 MB
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-semibold text-slate-800"
                        title={selectedFile?.name || "No file selected"}
                      >
                        {selectedFile?.name || "No file selected"}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {selectedFile
                          ? `${formatBytes(
                              selectedFile.size
                            )} · ${getFileExtension(
                              selectedFile.name
                            ).toUpperCase()}`
                          : "Waiting for a document file"}
                      </p>
                    </div>

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);

                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        disabled={uploading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label="Remove selected file"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-blue-800">
                        Secure upload rule
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        Every file enters quarantine first. It cannot be used
                        until the backend security checks approve it.
                      </p>
                    </div>
                  </div>
                </div>

                <details className="rounded-2xl border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                    Supported file formats
                  </summary>

                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    {allowedFileText}
                  </p>
                </details>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-7">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Document Information
                    </h2>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Add only the metadata needed to identify this document.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <FieldLabel required>Document title</FieldLabel>

                    <input
                      value={formData.title}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        updateField("title", event.target.value)
                      }
                      disabled={uploading}
                      placeholder="Example: Site Survey Report Phase 1"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Project association</FieldLabel>

                      {lockProjectSelection && defaultProjectId ? (
                        <div className="flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700">
                          <FolderOpen size={15} className="shrink-0" />

                          <span className="truncate">
                            {projectLabel || `Project #${defaultProjectId}`}
                          </span>
                        </div>
                      ) : (
                        <SelectField
                          label=""
                          value={formData.projectId}
                          disabled={uploading || loadingLookups}
                          onChange={(value) =>
                            updateField("projectId", value)
                          }
                        >
                          <option value="">
                            {loadingLookups
                              ? "Loading projects..."
                              : "No project / optional"}
                          </option>

                          {projects.map((project) => (
                            <option
                              key={String(project.id)}
                              value={String(project.id)}
                            >
                              {project.name}
                              {project.code ? ` (${project.code})` : ""}
                            </option>
                          ))}
                        </SelectField>
                      )}
                    </div>

                    <SelectField
                      label="Category"
                      value={formData.categoryId}
                      required
                      disabled={uploading || loadingLookups}
                      onChange={(value) =>
                        updateField("categoryId", value)
                      }
                    >
                      <option value="">
                        {loadingLookups
                          ? "Loading categories..."
                          : "Select a category"}
                      </option>

                      {categories.map((category) => (
                        <option
                          key={String(category.id)}
                          value={String(category.id)}
                        >
                          {category.name}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SelectField
                      label="Document type"
                      value={formData.documentType}
                      required
                      disabled={uploading}
                      onChange={(value) =>
                        updateField(
                          "documentType",
                          value as DocumentType
                        )
                      }
                    >
                      <option value="">Select a document type</option>

                      {documentTypeOptions.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </SelectField>

                    <SelectField
                      label="Security level"
                      value={formData.securityLevel}
                      disabled={uploading}
                      onChange={(value) =>
                        updateField(
                          "securityLevel",
                          value as DocumentSecurityLevel
                        )
                      }
                    >
                      {securityLevelOptions.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold text-slate-600">
                      {selectedSecurity?.label || "Security information"}
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-slate-400">
                      {getSecurityHelper(formData.securityLevel)}
                    </p>
                  </div>

                  <div>
                    <FieldLabel>Tags</FieldLabel>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
                      {formData.tags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => removeTag(tag)}
                              disabled={uploading}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                            >
                              <Tags size={11} />
                              {tag}
                              <X size={11} />
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
                        placeholder="Type a tag and press Enter"
                        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Description / remarks</FieldLabel>

                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(
                        event: ChangeEvent<HTMLTextAreaElement>
                      ) =>
                        updateField("description", event.target.value)
                      }
                      disabled={uploading}
                      placeholder="Add a short note about this document..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={17} className="text-blue-600" />

                      <h3 className="text-sm font-bold text-slate-800">
                        Security Processing
                      </h3>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <SecurityOption
                        title="Run OCR"
                        description="Extract text for search and retrieval."
                        checked={formData.runOcr}
                        disabled={uploading}
                        onChange={(checked) =>
                          updateField("runOcr", checked)
                        }
                      />

                      <SecurityOption
                        title="Virus scan required"
                        description="Mandatory and controlled by the backend."
                        checked
                        locked
                      />
                    </div>

                    {showProgress && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p
                              className={cn(
                                "text-xs font-semibold",
                                getProgressTextClass(progressStatus)
                              )}
                            >
                              {scanStage}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              The final security decision comes from the backend.
                            </p>
                          </div>

                          <span className="text-sm font-bold text-slate-800">
                            {scanProgress}%
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              getProgressColor(
                                scanProgress,
                                progressStatus
                              )
                            )}
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="sticky bottom-0 z-20 flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
            <p className="text-[11px] leading-4 text-slate-400">
              Required: file, title, category and document type.
            </p>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => resetForm()}
                disabled={uploading}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose?.();
                }}
                disabled={uploading}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {modalMode ? "Cancel" : "Close"}
              </button>

              <button
                type="submit"
                disabled={uploading || loadingLookups}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Upload document
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  if (modalMode) {
    return content;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {content}
      </main>
    </div>
  );
}