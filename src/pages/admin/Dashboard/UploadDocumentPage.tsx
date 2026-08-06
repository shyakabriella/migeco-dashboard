import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, ElementType, ReactNode } from "react";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  Layers,
  Loader2,
  MapPinned,
  RefreshCw,
  UploadCloud,
  X,
} from "lucide-react";
import AdminSidebar from "../../admin/AdminSidebar";

type DestinationType = "general" | "project" | "study_area" | "laboratory";
type FileStatus = "ready" | "needs_review";
type MessageType = "success" | "error" | null;

type UploadFile = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  status: FileStatus;
  issue?: string;
};

type DestinationOption = {
  id: DestinationType;
  title: string;
  description: string;
  icon: ElementType;
};

type DestinationTarget = {
  value: string;
  label: string;
};

type DocumentCategory = {
  id: number;
  name: string;
  slug?: string;
  status?: string;
};

type Project = {
  id: number;
  name: string;
  code?: string;
  status?: string;
};

type ApiPayload = {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: unknown;
  data?: unknown;
};

type DocumentTypeOption = {
  value:
    | "geological_report"
    | "technical_drawing"
    | "construction_record"
    | "survey_map"
    | "contract"
    | "plain_text"
    | "image"
    | "spreadsheet"
    | "presentation"
    | "other";
  label: string;
};

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);

const DOCUMENTS_URL = `${API_BASE_URL}/documents`;
const CATEGORIES_URL = `${API_BASE_URL}/document-categories?status=active`;
const PROJECTS_URL = `${API_BASE_URL}/projects?status=active`;

// DocumentController allows a maximum of 100 MB.
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// This list matches DocumentController::allowedExtensions().
const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
  "tif",
  "tiff",
  "txt",
  "csv",
  "dwg",
  "dxf",
]);

const FILE_ACCEPT = Array.from(ALLOWED_EXTENSIONS)
  .map((extension) => `.${extension}`)
  .join(",");

const destinationOptions: DestinationOption[] = [
  {
    id: "general",
    title: "General Repository",
    description: "Upload without linking the document to a project.",
    icon: Archive,
  },
  {
    id: "project",
    title: "Existing Project",
    description: "Attach the document to a registered project.",
    icon: FolderOpen,
  },
  {
    id: "study_area",
    title: "Study Area",
    description: "Save study-area information inside document metadata.",
    icon: MapPinned,
  },
  {
    id: "laboratory",
    title: "Samples & Laboratory",
    description: "Save laboratory information inside document metadata.",
    icon: ClipboardList,
  },
];

const studyAreas: DestinationTarget[] = [
  { value: "Northern Mapping Block", label: "Northern Mapping Block" },
  { value: "Kigali Field Zone A", label: "Kigali Field Zone A" },
  { value: "Western Drill Corridor", label: "Western Drill Corridor" },
  {
    value: "Southern Geotechnical Area",
    label: "Southern Geotechnical Area",
  },
];

const laboratoryItems: DestinationTarget[] = [
  {
    value: "LAB-2026-001 - Soil classification",
    label: "LAB-2026-001 - Soil classification",
  },
  {
    value: "LAB-2026-014 - Rock strength test",
    label: "LAB-2026-014 - Rock strength test",
  },
  {
    value: "SMP-ALPHA-009 - Core sample",
    label: "SMP-ALPHA-009 - Core sample",
  },
  {
    value: "SMP-KGL-031 - Aggregate sample",
    label: "SMP-KGL-031 - Aggregate sample",
  },
];

const documentTypes: DocumentTypeOption[] = [
  { value: "geological_report", label: "Geological Report" },
  { value: "technical_drawing", label: "Technical Drawing" },
  { value: "construction_record", label: "Construction Record" },
  { value: "survey_map", label: "Survey Map" },
  { value: "contract", label: "Contract" },
  { value: "plain_text", label: "Plain Text" },
  { value: "image", label: "Image" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "presentation", label: "Presentation" },
  { value: "other", label: "Other" },
];

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() ?? "" : "";
}

function removeFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
}

function getAuthToken(): string | null {
  const directToken =
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token");

  if (directToken) {
    return directToken.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "");
  }

  const possibleObjects = ["auth", "user", "auth-storage", "authStore"];

  for (const key of possibleObjects) {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      continue;
    }

    try {
      const parsed = JSON.parse(storedValue) as Record<string, unknown>;
      const nestedState =
        parsed.state && typeof parsed.state === "object"
          ? (parsed.state as Record<string, unknown>)
          : parsed;

      const token =
        nestedState.access_token ??
        nestedState.accessToken ??
        nestedState.auth_token ??
        nestedState.authToken ??
        nestedState.token;

      if (typeof token === "string" && token.trim()) {
        return token.replace(/^Bearer\s+/i, "");
      }
    } catch {
      // Ignore invalid JSON and continue checking other storage keys.
    }
  }

  return null;
}

function buildHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function parseJsonSafely(text: string): ApiPayload {
  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as ApiPayload;
  } catch {
    return { message: text };
  }
}

function collectMessages(value: unknown): string[] {
  if (typeof value === "string") {
    return value.trim() ? [value.trim()] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectMessages(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((item) =>
      collectMessages(item)
    );
  }

  return [];
}

function getApiErrorMessage(
  payload: ApiPayload,
  fallback: string
): string {
  // BaseController::sendError commonly puts validator errors inside data.
  const detailedMessages = [
    ...collectMessages(payload.errors),
    ...collectMessages(payload.data),
    ...collectMessages(payload.error),
  ];

  const uniqueMessages = Array.from(new Set(detailedMessages));

  if (uniqueMessages.length > 0) {
    return uniqueMessages.join(" ");
  }

  return payload.message || fallback;
}

function extractCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const objectPayload = payload as Record<string, unknown>;

  for (const key of ["data", "items", "results"]) {
    const candidate = objectPayload[key];

    if (Array.isArray(candidate)) {
      return candidate as T[];
    }

    if (candidate && typeof candidate === "object") {
      const nested = extractCollection<T>(candidate);

      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

async function fetchCollection<T>(url: string): Promise<T[]> {
  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(),
  });

  const text = await response.text();
  const payload = parseJsonSafely(text);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        payload,
        `Request failed with HTTP status ${response.status}.`
      )
    );
  }

  return extractCollection<T>(payload);
}

export default function UploadDocumentPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingReferences, setIsLoadingReferences] =
    useState<boolean>(true);
  const [referenceError, setReferenceError] = useState<string>("");

  const [destinationType, setDestinationType] =
    useState<DestinationType>("general");
  const [selectedDestination, setSelectedDestination] =
    useState<string>("general");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [documentType, setDocumentType] =
    useState<DocumentTypeOption["value"]>("geological_report");
  const [securityLevel, setSecurityLevel] = useState<string>("internal");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [ownerDepartment, setOwnerDepartment] =
    useState<string>("Geology");
  const [accessScope, setAccessScope] = useState<string>("department");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [messageType, setMessageType] = useState<MessageType>(null);
  const [message, setMessage] = useState<string>("");

  const destinationTargets = useMemo<DestinationTarget[]>(() => {
    if (destinationType === "project") {
      return projects.map((project) => ({
        value: String(project.id),
        label: project.code
          ? `${project.code} - ${project.name}`
          : project.name,
      }));
    }

    if (destinationType === "study_area") {
      return studyAreas;
    }

    if (destinationType === "laboratory") {
      return laboratoryItems;
    }

    return [
      {
        value: "general",
        label: "Main document repository",
      },
    ];
  }, [destinationType, projects]);

  const selectedDestinationLabel = useMemo(() => {
    return (
      destinationTargets.find(
        (destination) => destination.value === selectedDestination
      )?.label ?? "Not selected"
    );
  }, [destinationTargets, selectedDestination]);

  const readyFiles = files.filter((file) => file.status === "ready").length;
  const reviewFiles = files.filter(
    (file) => file.status === "needs_review"
  ).length;

  const canSubmit =
    !isSubmitting &&
    !isLoadingReferences &&
    !referenceError &&
    files.length > 0 &&
    reviewFiles === 0 &&
    documentTitle.trim().length > 0 &&
    selectedCategoryId !== "" &&
    (destinationType !== "project" || selectedDestination !== "");

  useEffect(() => {
    void loadReferenceData();
  }, []);

  useEffect(() => {
    const currentStillExists = destinationTargets.some(
      (destination) => destination.value === selectedDestination
    );

    if (!currentStillExists) {
      setSelectedDestination(destinationTargets[0]?.value ?? "");
    }
  }, [destinationTargets, selectedDestination]);

  async function loadReferenceData(): Promise<void> {
    setReferenceError("");
    setIsLoadingReferences(true);

    if (!API_BASE_URL) {
      setReferenceError(
        "VITE_API_BASE_URL is missing. Add it to the frontend .env file."
      );
      setIsLoadingReferences(false);
      return;
    }

    const [categoryResult, projectResult] = await Promise.allSettled([
      fetchCollection<DocumentCategory>(CATEGORIES_URL),
      fetchCollection<Project>(PROJECTS_URL),
    ]);

    if (categoryResult.status === "fulfilled") {
      const activeCategories = categoryResult.value.filter(
        (category) => !category.status || category.status === "active"
      );

      setCategories(activeCategories);
      setSelectedCategoryId((current) => {
        if (
          current &&
          activeCategories.some((category) => String(category.id) === current)
        ) {
          return current;
        }

        return activeCategories[0] ? String(activeCategories[0].id) : "";
      });

      if (activeCategories.length === 0) {
        setReferenceError(
          "No active document category was returned by the API. Create or activate a category first."
        );
      }
    } else {
      setCategories([]);
      setSelectedCategoryId("");
      setReferenceError(
        `Categories could not be loaded: ${categoryResult.reason instanceof Error ? categoryResult.reason.message : "Unknown error."}`
      );
    }

    if (projectResult.status === "fulfilled") {
      setProjects(
        projectResult.value.filter(
          (project) => !project.status || project.status !== "archived"
        )
      );
    } else {
      // A project is optional, so general repository uploads can still work.
      setProjects([]);
    }

    setIsLoadingReferences(false);
  }

  function clearMessage(): void {
    setMessageType(null);
    setMessage("");
  }

  function handleDestinationChange(type: DestinationType): void {
    setDestinationType(type);
    clearMessage();
  }

  function validateSelectedFile(file: File): UploadFile {
    const extension = getFileExtension(file.name);
    let issue: string | undefined;

    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      issue = `.${extension || "unknown"} is not allowed by the backend controller.`;
    } else if (file.size > MAX_FILE_SIZE) {
      issue = "File is larger than the controller limit of 100 MB.";
    }

    return {
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      extension,
      status: issue ? "needs_review" : "ready",
      issue,
    };
  }

  function handleFileSelection(fileList: FileList | null): void {
    if (!fileList || fileList.length === 0) {
      return;
    }

    clearMessage();

    const selectedFiles = Array.from(fileList).map(validateSelectedFile);

    setFiles((current) => {
      const existingIds = new Set(current.map((file) => file.id));
      const uniqueFiles = selectedFiles.filter(
        (file) => !existingIds.has(file.id)
      );

      return [...current, ...uniqueFiles];
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeFile(fileId: string): void {
    setFiles((current) => current.filter((file) => file.id !== fileId));
    clearMessage();
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();
    handleFileSelection(event.dataTransfer.files);
  }

  function handleSaveDraft(): void {
    const draft = {
      destinationType,
      selectedDestination,
      documentTitle,
      selectedCategoryId,
      documentType,
      securityLevel,
      description,
      tags,
      ownerDepartment,
      accessScope,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("document_upload_draft", JSON.stringify(draft));
    setMessageType("success");
    setMessage(
      "Draft details were saved in this browser. Files must be selected again later."
    );
  }

  function resetForm(): void {
    setDestinationType("general");
    setSelectedDestination("general");
    setFiles([]);
    setDocumentTitle("");
    setDocumentType("geological_report");
    setSecurityLevel("internal");
    setDescription("");
    setTags("");
    setOwnerDepartment("Geology");
    setAccessScope("department");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function createFormData(uploadFile: UploadFile): FormData {
    const formData = new FormData();

    const title =
      files.length === 1
        ? documentTitle.trim()
        : `${documentTitle.trim()} - ${removeFileExtension(uploadFile.name)}`;

    formData.append("title", title);
    formData.append("document_category_id", selectedCategoryId);
    formData.append("document_type", documentType);
    formData.append("security_level", securityLevel);
    formData.append("file", uploadFile.file, uploadFile.name);

    if (description.trim()) {
      formData.append("description", description.trim());
    }

    if (destinationType === "project" && selectedDestination) {
      formData.append("project_id", selectedDestination);
    }

    tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .forEach((tag) => formData.append("tags[]", tag));

    // These fields are not direct Document columns in DocumentController::store().
    // The controller validates metadata as an array, so send them here.
    formData.append("metadata[destination_type]", destinationType);
    formData.append(
      "metadata[destination_name]",
      selectedDestinationLabel
    );
    formData.append("metadata[owner_department]", ownerDepartment);
    formData.append("metadata[access_scope]", accessScope);
    formData.append("metadata[source]", "admin_document_upload_page");

    return formData;
  }

  async function uploadOneFile(uploadFile: UploadFile): Promise<ApiPayload> {
    const response = await fetch(DOCUMENTS_URL, {
      method: "POST",
      headers: buildHeaders(),
      body: createFormData(uploadFile),
    });

    const text = await response.text();
    const payload = parseJsonSafely(text);

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(
          payload,
          `${uploadFile.name} failed with HTTP status ${response.status}.`
        )
      );
    }

    return payload;
  }

  async function handleSubmit(): Promise<void> {
    clearMessage();

    if (!documentTitle.trim()) {
      setMessageType("error");
      setMessage("Please enter the document title.");
      return;
    }

    if (!selectedCategoryId) {
      setMessageType("error");
      setMessage("Please select a document category.");
      return;
    }

    if (files.length === 0) {
      setMessageType("error");
      setMessage("Please select at least one document file.");
      return;
    }

    const invalidFiles = files.filter(
      (uploadFile) => uploadFile.status === "needs_review"
    );

    if (invalidFiles.length > 0) {
      setMessageType("error");
      setMessage(
        `Remove or correct these files first: ${invalidFiles
          .map(
            (uploadFile) =>
              `${uploadFile.name}${uploadFile.issue ? ` (${uploadFile.issue})` : ""}`
          )
          .join(", ")}`
      );
      return;
    }

    if (destinationType === "project" && !selectedDestination) {
      setMessageType("error");
      setMessage("Select an active project before submitting.");
      return;
    }

    setIsSubmitting(true);

    const successfulFileIds: string[] = [];
    const failedUploads: string[] = [];

    for (const uploadFile of files) {
      try {
        await uploadOneFile(uploadFile);
        successfulFileIds.push(uploadFile.id);
      } catch (error) {
        failedUploads.push(
          `${uploadFile.name}: ${error instanceof Error ? error.message : "Upload failed."}`
        );
      }
    }

    setIsSubmitting(false);

    if (failedUploads.length === 0) {
      setMessageType("success");
      setMessage(
        `${successfulFileIds.length} document${successfulFileIds.length === 1 ? "" : "s"} uploaded successfully and placed in quarantine for scanning.`
      );
      localStorage.removeItem("document_upload_draft");
      resetForm();
      return;
    }

    if (successfulFileIds.length > 0) {
      setFiles((current) =>
        current.filter((file) => !successfulFileIds.includes(file.id))
      );
    }

    setMessageType("error");
    setMessage(
      `${successfulFileIds.length} uploaded and ${failedUploads.length} failed. ${failedUploads.join(" | ")}`
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Document intake
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                Upload Document
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Upload documents directly into the quarantine and security
                workflow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Submit Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {(message || referenceError) && (
          <div className="px-6 pt-5">
            <div
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                messageType === "success" && !referenceError
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {messageType === "success" && !referenceError ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}

              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {messageType === "success" && !referenceError
                    ? "Success"
                    : "Action required"}
                </p>
                <p className="mt-1 whitespace-pre-wrap leading-6">
                  {referenceError || message}
                </p>
              </div>

              {referenceError && (
                <button
                  type="button"
                  onClick={() => void loadReferenceData()}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        <section className="grid gap-4 border-b border-slate-200 bg-white px-6 py-4 md:grid-cols-3">
          <SummaryCard
            title="Files selected"
            value={files.length.toString()}
            detail={`${readyFiles} ready for upload`}
          />
          <SummaryCard
            title="Need review"
            value={reviewFiles.toString()}
            detail="Unsupported or oversized files"
          />
          <SummaryCard
            title="Destination"
            value={
              destinationOptions.find((item) => item.id === destinationType)
                ?.title || "General Repository"
            }
            detail={selectedDestinationLabel}
          />
        </section>

        <div className="grid flex-1 gap-6 overflow-auto p-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    Specify Document Destination
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Project links use project_id. Other destination information
                    is saved inside metadata.
                  </p>
                </div>
                <Layers className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {destinationOptions.map((option) => {
                  const Icon = option.icon;
                  const active = destinationType === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleDestinationChange(option.id)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span
                          className={`block text-sm font-bold ${
                            active ? "text-blue-800" : "text-slate-900"
                          }`}
                        >
                          {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Destination target">
                  <select
                    value={selectedDestination}
                    onChange={(event) =>
                      setSelectedDestination(event.target.value)
                    }
                    disabled={
                      isLoadingReferences || destinationTargets.length === 0
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    {destinationTargets.length === 0 ? (
                      <option value="">
                        {destinationType === "project"
                          ? "No active projects available"
                          : "No destination available"}
                      </option>
                    ) : (
                      destinationTargets.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))
                    )}
                  </select>
                </Field>

                <Field label="Owner department">
                  <select
                    value={ownerDepartment}
                    onChange={(event) =>
                      setOwnerDepartment(event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Geology</option>
                    <option>Geotechnical</option>
                    <option>Laboratory</option>
                    <option>Engineering</option>
                    <option>Administration</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-6 py-8 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-base font-bold text-slate-950">
                  Drop files here or browse
                </h2>
                <p className="mt-1 max-w-xl text-sm text-slate-500">
                  Allowed by the controller: PDF, Word, Excel, PowerPoint, JPG,
                  PNG, TIFF, TXT, CSV, DWG, and DXF. Maximum 100 MB per file.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={FILE_ACCEPT}
                  className="hidden"
                  onChange={(event) =>
                    handleFileSelection(event.target.files)
                  }
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Browse Files
                </button>
              </div>

              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                <div className="grid min-w-[680px] grid-cols-[1fr_120px_150px_40px] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <span>File name</span>
                  <span>Size</span>
                  <span>Status</span>
                  <span />
                </div>

                {files.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No files selected yet.
                  </div>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="grid min-w-[680px] grid-cols-[1fr_120px_150px_40px] items-center border-t border-slate-100 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {file.name}
                          </p>
                          {file.issue && (
                            <p className="mt-0.5 truncate text-xs text-red-600">
                              {file.issue}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-slate-500">
                        {formatFileSize(file.size)}
                      </span>
                      <span
                        className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${
                          file.status === "ready"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {file.status === "ready" ? "Ready" : "Review"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-950">
                  Document Details
                </h2>

                {isLoadingReferences && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-4">
                <Field label="Document title">
                  <input
                    value={documentTitle}
                    onChange={(event) => setDocumentTitle(event.target.value)}
                    placeholder="Enter document title"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>

                <Field label="Category">
                  <select
                    value={selectedCategoryId}
                    onChange={(event) =>
                      setSelectedCategoryId(event.target.value)
                    }
                    disabled={isLoadingReferences || categories.length === 0}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    {categories.length === 0 ? (
                      <option value="">No active categories available</option>
                    ) : (
                      categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </Field>

                <Field label="Document type">
                  <select
                    value={documentType}
                    onChange={(event) =>
                      setDocumentType(
                        event.target.value as DocumentTypeOption["value"]
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {documentTypes.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Security level">
                  <select
                    value={securityLevel}
                    onChange={(event) =>
                      setSecurityLevel(event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="public">Public</option>
                    <option value="internal">Internal</option>
                    <option value="confidential">Confidential</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </Field>

                <Field label="Access scope">
                  <select
                    value={accessScope}
                    onChange={(event) => setAccessScope(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="owner">Uploader only</option>
                    <option value="department">Department</option>
                    <option value="project_team">Project team</option>
                    <option value="management">Management</option>
                  </select>
                </Field>

                <Field label="Tags">
                  <input
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="survey, map, laboratory"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Add a short note about this document"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-700" />
                <div>
                  <h3 className="text-sm font-bold text-blue-950">
                    Security workflow
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    Each file is sent separately because your controller accepts
                    one field named <strong>file</strong>. The backend stores it
                    as quarantined with scan status pending.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 truncate text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}