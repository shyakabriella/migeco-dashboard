const env = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env ?? {};

export const API_BASE_URL = (
  env.VITE_API_BASE_URL ||
  env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

type Primitive = string | number | boolean | null | undefined;

export type QueryValue = Primitive | Array<string | number | boolean>;

export type QueryParams = Record<string, QueryValue>;

export type LaravelSuccessResponse<T> = {
  success?: boolean;
  data: T;
  message?: string;
};

export type LaravelErrorResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
  errors?: unknown;
};

export type ApiError = Error & {
  status?: number;
  data?: unknown;
};

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  query?: QueryParams;
};

export type UserRole = {
  id?: number | string;
  name?: string;
  slug?: string;
};

export type UserSummary = {
  id: number | string;
  name: string;
  email?: string;
  phone?: string | null;
  department?: string | null;
  status?: string;
  role?: UserRole | null;
};

export type DocumentCategory = {
  id: number | string;
  parent_id?: number | string | null;
  created_by?: number | string | null;
  name: string;
  slug?: string;
  description?: string | null;
  status?: "active" | "inactive" | string;
  sort_order?: number | null;
  parent?: Pick<DocumentCategory, "id" | "name" | "slug"> | null;
  children?: DocumentCategory[];
  creator?: UserSummary | null;
  created_at?: string;
  updated_at?: string;
};

export type ProjectSummary = {
  id: number | string;
  created_by?: number | string | null;
  name: string;
  code?: string | null;
  slug?: string | null;
  description?: string | null;
  location_name?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  project_type?:
    | "geological_survey"
    | "construction"
    | "technical_study"
    | "mining"
    | "administration"
    | "other"
    | string;
  status?: "planned" | "active" | "completed" | "archived" | string;
  security_level?: "public" | "internal" | "confidential" | "restricted" | string;
  start_date?: string | null;
  end_date?: string | null;
  metadata?: Record<string, unknown> | null;
  creator?: UserSummary | null;
  documents_count?: number;
  document_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type DocumentType =
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

export type SecurityLevel =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";

export type DmsDocument = {
  id: number | string;
  project_id?: number | string | null;
  document_category_id?: number | string | null;
  uploaded_by?: number | string | null;
  approved_by?: number | string | null;

  document_code?: string | null;
  title: string;
  slug?: string | null;
  description?: string | null;
  document_type?: DocumentType | string | null;

  original_file_name?: string | null;
  stored_file_name?: string | null;
  file_path?: string | null;
  disk?: string | null;
  mime_type?: string | null;
  extension?: string | null;
  file_size?: number | null;
  readable_file_size?: string | null;
  sha256_hash?: string | null;

  version_number?: number | null;
  security_level?: SecurityLevel | string | null;

  status?: string | null;
  scan_status?: string | null;
  scan_message?: string | null;

  encryption_status?: string | null;
  encryption_algorithm?: string | null;
  encryption_key_id?: string | null;

  plaintext_status?: string | null;
  sandbox_status?: string | null;
  sandbox_score?: number | null;
  sandbox_message?: string | null;
  sandbox_tested_at?: string | null;

  ai_status?: string | null;
  ai_sensitivity_level?: SecurityLevel | string | null;

  tags?: string[] | string | null;
  metadata?: Record<string, unknown> | null;

  project?: ProjectSummary | null;
  category?: DocumentCategory | null;
  uploader?: UserSummary | null;
  approver?: UserSummary | null;
  aiAnalysis?: DocumentAiAnalysis | null;
  aiSuggestedCategory?: DocumentCategory | null;
  aiAnalysisLogs?: AiAnalysisLog[];

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type DocumentFilters = {
  project_id?: string | number;
  document_category_id?: string | number;
  document_type?: DocumentType | string;
  security_level?: SecurityLevel | string;
  status?: string;
  scan_status?: string;
  search?: string;
};

export type CategoryFilters = {
  status?: "active" | "inactive" | string;
  search?: string;
};

export type ProjectFilters = {
  status?: string;
  project_type?: string;
  security_level?: string;
  search?: string;
};

export type CreateDocumentCategoryPayload = {
  parent_id?: number | string | null;
  name: string;
  description?: string | null;
  status?: "active" | "inactive";
  sort_order?: number;
};

export type UpdateDocumentCategoryPayload =
  Partial<CreateDocumentCategoryPayload>;

export type CreateProjectPayload = {
  name: string;
  code?: string | null;
  description?: string | null;
  location_name?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  project_type?:
    | "geological_survey"
    | "construction"
    | "technical_study"
    | "mining"
    | "administration"
    | "other";
  status?: "planned" | "active" | "completed" | "archived";
  security_level?: SecurityLevel;
  start_date?: string | null;
  end_date?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export type UploadDocumentPayload = {
  project_id?: number | string | null;
  document_category_id: number | string;
  title: string;
  description?: string | null;
  document_type?: DocumentType;
  security_level?: SecurityLevel;
  tags?: string[];
  metadata?: Record<string, string | number | boolean | null | undefined>;
  file: File;
};

export type UpdateDocumentPayload = {
  project_id?: number | string | null;
  document_category_id?: number | string | null;
  title?: string;
  description?: string | null;
  document_type?: DocumentType;
  security_level?: SecurityLevel;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
};

export type DocumentAccessStatus = {
  document: Partial<DmsDocument>;
  access: {
    can_view: boolean;
    can_download: boolean;
    is_safe_to_open: boolean;
    is_encrypted: boolean;
    is_sandbox_safe: boolean;
    reason_blocked?: string | null;
  };
};

export type BlobFileResponse = {
  blob: Blob;
  filename?: string;
  contentType?: string;
};

/*
|--------------------------------------------------------------------------
| AI Types
|--------------------------------------------------------------------------
*/

export type AiSummary = {
  total_documents: number;
  ready_for_ai: number;
  analyzed_documents: number;
  not_analyzed_documents: number;
  pending_ai_documents: number;
  failed_ai_documents: number;
  restricted_suggested: number;
  confidential_suggested: number;
};

export type DocumentAiAnalysis = {
  id?: number | string;
  document_id?: number | string;
  summary?: string | null;
  detected_language?: string | null;
  suggested_document_type?: string | null;
  suggested_category_id?: number | string | null;
  suggested_tags?: string[] | string | null;
  sensitivity_level?: SecurityLevel | string | null;
  confidence_score?: number | string | null;
  key_points?: string[] | string | null;
  risks?: string[] | string | null;
  recommendations?: string[] | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type DocumentAiAnalysisResponse = {
  document: {
    id: number | string;
    document_code?: string | null;
    title?: string | null;
    ai_status?: string | null;
  };
  analysis: DocumentAiAnalysis;
};

export type AiSearchResponse = {
  query: string;
  total: number;
  results: Array<
    DocumentAiAnalysis & {
      document?: Partial<DmsDocument>;
      suggestedCategory?: DocumentCategory | null;
    }
  >;
};

export type AiAnalysisLog = {
  id?: number | string;
  document_id?: number | string;
  performer_id?: number | string | null;
  status?: string | null;
  message?: string | null;
  source?: string | null;
  document?: Partial<DmsDocument> | null;
  performer?: UserSummary | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type EncryptionSummary = {
  total_documents: number;
  clean_active_documents: number;
  encrypted_documents: number;
  not_encrypted_documents: number;
  failed_encryption_documents: number;
  pending_encryption_documents: number;
};

export type EncryptionLog = {
  id?: number | string;
  document_id?: number | string;
  performer_id?: number | string | null;
  action?: string | null;
  status?: string | null;
  message?: string | null;
  algorithm?: string | null;
  key_id?: string | null;
  document?: Partial<DmsDocument> | null;
  performer?: UserSummary | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type SandboxSummary = {
  total_documents: number;
  clean_active_documents: number;
  not_tested_documents: number;
  pending_documents: number;
  safe_documents: number;
  unsafe_documents: number;
  failed_documents: number;
};

export type SandboxLog = {
  id?: number | string;
  document_id?: number | string;
  tester_id?: number | string | null;
  status?: string | null;
  message?: string | null;
  score?: number | string | null;
  source?: string | null;
  document?: Partial<DmsDocument> | null;
  tester?: UserSummary | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type AiApplySuggestionsPayload = {
  apply_tags?: boolean;
  apply_category?: boolean;
  apply_document_type?: boolean;
  apply_security_level?: boolean;
  security_level?: SecurityLevel;
};

function normalizeEndpoint(endpoint: string): string {
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

export function getAuthToken(): string | null {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token")
  );
}

export function setAuthToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearAuthToken(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("access_token");
}

export function buildQueryString(params?: QueryParams): string {
  if (!params) return "";

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        query.append(`${key}[]`, String(item));
      });
      return;
    }

    query.append(key, String(value));
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : "";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof FormData) &&
    !(value instanceof Blob) &&
    !(value instanceof URLSearchParams)
  );
}

function extractErrorMessage(
  data: LaravelErrorResponse | string | unknown,
  fallback: string
): string {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (isPlainObject(data)) {
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (
      isPlainObject(data.data) &&
      typeof data.data.error === "string" &&
      data.data.error.trim()
    ) {
      return data.data.error;
    }

    if (isPlainObject(data.errors)) {
      const firstError = Object.values(data.errors)[0];

      if (Array.isArray(firstError) && typeof firstError[0] === "string") {
        return firstError[0];
      }

      if (typeof firstError === "string") {
        return firstError;
      }
    }
  }

  return fallback;
}

export function unwrapLaravelData<T>(response: LaravelSuccessResponse<T> | T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return (response as LaravelSuccessResponse<T>).data;
  }

  return response as T;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { query, headers, body, ...requestOptions } = options;

  const url = `${API_BASE_URL}${normalizeEndpoint(endpoint)}${buildQueryString(
    query
  )}`;

  const token = getAuthToken();

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body instanceof Blob || body instanceof URLSearchParams) {
    requestBody = body;
  } else if (body !== undefined && body !== null) {
    finalHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...requestOptions,
    headers: finalHeaders,
    body: requestBody,
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let errorData: unknown = null;

    try {
      errorData = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch {
      errorData = null;
    }

    const error = new Error(
      extractErrorMessage(errorData, response.statusText || "Request failed.")
    ) as ApiError;

    error.status = response.status;
    error.data = errorData;

    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

async function apiBlobRequest(endpoint: string): Promise<BlobFileResponse> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${normalizeEndpoint(endpoint)}`, {
    method: "GET",
    headers: {
      Accept: "application/octet-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    let errorData: unknown = null;

    try {
      errorData = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch {
      errorData = null;
    }

    const error = new Error(
      extractErrorMessage(errorData, response.statusText || "File request failed.")
    ) as ApiError;

    error.status = response.status;
    error.data = errorData;

    throw error;
  }

  const contentDisposition = response.headers.get("content-disposition") || "";
  const filenameMatch =
    contentDisposition.match(/filename\*=UTF-8''([^;]+)/i) ||
    contentDisposition.match(/filename="?([^"]+)"?/i);

  const filename = filenameMatch
    ? decodeURIComponent(filenameMatch[1])
    : undefined;

  return {
    blob: await response.blob(),
    filename,
    contentType: response.headers.get("content-type") || undefined,
  };
}

function appendFormValue(
  formData: FormData,
  key: string,
  value: unknown
): void {
  if (value === undefined || value === null || value === "") return;

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item !== undefined && item !== null && item !== "") {
        formData.append(`${key}[]`, String(item));
      }
    });
    return;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([childKey, childValue]) => {
      if (childValue !== undefined && childValue !== null && childValue !== "") {
        formData.append(`${key}[${childKey}]`, String(childValue));
      }
    });
    return;
  }

  formData.append(key, String(value));
}

function buildDocumentFormData(payload: UploadDocumentPayload): FormData {
  const formData = new FormData();

  appendFormValue(formData, "project_id", payload.project_id);
  appendFormValue(formData, "document_category_id", payload.document_category_id);
  appendFormValue(formData, "title", payload.title);
  appendFormValue(formData, "description", payload.description);
  appendFormValue(formData, "document_type", payload.document_type);
  appendFormValue(formData, "security_level", payload.security_level);
  appendFormValue(formData, "tags", payload.tags);
  appendFormValue(formData, "metadata", payload.metadata);
  appendFormValue(formData, "file", payload.file);

  return formData;
}

function unwrapDocumentUploadResponse(response: unknown): DmsDocument {
  const data = unwrapLaravelData(response as LaravelSuccessResponse<unknown> | unknown);

  if (isPlainObject(data) && "document" in data) {
    return data.document as DmsDocument;
  }

  return data as DmsDocument;
}

/*
|--------------------------------------------------------------------------
| User / Auth
|--------------------------------------------------------------------------
*/

export async function getCurrentUser(): Promise<UserSummary> {
  const response = await apiRequest<
    LaravelSuccessResponse<UserSummary> | UserSummary
  >("/user", {
    method: "GET",
  });

  return unwrapLaravelData<UserSummary>(response);
}

/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
*/

export async function getDocumentCategories(
  filters?: CategoryFilters
): Promise<DocumentCategory[]> {
  const response = await apiRequest<
    LaravelSuccessResponse<DocumentCategory[]> | DocumentCategory[]
  >("/document-categories", {
    method: "GET",
    query: filters,
  });

  return unwrapLaravelData<DocumentCategory[]>(response);
}

export async function getDocumentCategory(
  id: number | string
): Promise<DocumentCategory> {
  const response = await apiRequest<
    LaravelSuccessResponse<DocumentCategory> | DocumentCategory
  >(`/document-categories/${id}`, {
    method: "GET",
  });

  return unwrapLaravelData<DocumentCategory>(response);
}

export async function createDocumentCategory(
  payload: CreateDocumentCategoryPayload
): Promise<DocumentCategory> {
  const response = await apiRequest<
    LaravelSuccessResponse<DocumentCategory> | DocumentCategory
  >("/document-categories", {
    method: "POST",
    body: payload,
  });

  return unwrapLaravelData<DocumentCategory>(response);
}

export async function updateDocumentCategory(
  id: number | string,
  payload: UpdateDocumentCategoryPayload
): Promise<DocumentCategory> {
  const response = await apiRequest<
    LaravelSuccessResponse<DocumentCategory> | DocumentCategory
  >(`/document-categories/${id}`, {
    method: "PUT",
    body: payload,
  });

  return unwrapLaravelData<DocumentCategory>(response);
}

export async function deleteDocumentCategory(
  id: number | string
): Promise<unknown> {
  const response = await apiRequest<LaravelSuccessResponse<unknown> | unknown>(
    `/document-categories/${id}`,
    {
      method: "DELETE",
    }
  );

  return unwrapLaravelData<unknown>(response);
}

/*
|--------------------------------------------------------------------------
| Projects
|--------------------------------------------------------------------------
*/

export async function getProjects(
  filters?: ProjectFilters
): Promise<ProjectSummary[]> {
  const response = await apiRequest<
    LaravelSuccessResponse<ProjectSummary[]> | ProjectSummary[]
  >("/projects", {
    method: "GET",
    query: filters,
  });

  return unwrapLaravelData<ProjectSummary[]>(response);
}

export async function getProject(
  id: number | string
): Promise<ProjectSummary> {
  const response = await apiRequest<
    LaravelSuccessResponse<ProjectSummary> | ProjectSummary
  >(`/projects/${id}`, {
    method: "GET",
  });

  return unwrapLaravelData<ProjectSummary>(response);
}

export async function createProject(
  payload: CreateProjectPayload
): Promise<ProjectSummary> {
  const response = await apiRequest<
    LaravelSuccessResponse<ProjectSummary> | ProjectSummary
  >("/projects", {
    method: "POST",
    body: payload,
  });

  return unwrapLaravelData<ProjectSummary>(response);
}

export async function updateProject(
  id: number | string,
  payload: UpdateProjectPayload
): Promise<ProjectSummary> {
  const response = await apiRequest<
    LaravelSuccessResponse<ProjectSummary> | ProjectSummary
  >(`/projects/${id}`, {
    method: "PUT",
    body: payload,
  });

  return unwrapLaravelData<ProjectSummary>(response);
}

export async function deleteProject(id: number | string): Promise<unknown> {
  const response = await apiRequest<LaravelSuccessResponse<unknown> | unknown>(
    `/projects/${id}`,
    {
      method: "DELETE",
    }
  );

  return unwrapLaravelData<unknown>(response);
}

/*
|--------------------------------------------------------------------------
| Documents
|--------------------------------------------------------------------------
*/

export async function getDocuments(
  filters?: DocumentFilters
): Promise<DmsDocument[]> {
  const response = await apiRequest<
    LaravelSuccessResponse<DmsDocument[]> | DmsDocument[]
  >("/documents", {
    method: "GET",
    query: filters,
  });

  return unwrapLaravelData<DmsDocument[]>(response);
}

export async function getDocument(id: number | string): Promise<DmsDocument> {
  const response = await apiRequest<
    LaravelSuccessResponse<DmsDocument> | DmsDocument
  >(`/documents/${id}`, {
    method: "GET",
  });

  return unwrapLaravelData<DmsDocument>(response);
}

export async function uploadDocument(
  payload: UploadDocumentPayload | FormData
): Promise<DmsDocument> {
  const body = payload instanceof FormData ? payload : buildDocumentFormData(payload);

  const response = await apiRequest<unknown>("/documents", {
    method: "POST",
    body,
  });

  return unwrapDocumentUploadResponse(response);
}

export async function updateDocument(
  id: number | string,
  payload: UpdateDocumentPayload
): Promise<DmsDocument> {
  const response = await apiRequest<
    LaravelSuccessResponse<DmsDocument> | DmsDocument
  >(`/documents/${id}`, {
    method: "PUT",
    body: payload,
  });

  return unwrapLaravelData<DmsDocument>(response);
}

export async function deleteDocument(id: number | string): Promise<unknown> {
  const response = await apiRequest<LaravelSuccessResponse<unknown> | unknown>(
    `/documents/${id}`,
    {
      method: "DELETE",
    }
  );

  return unwrapLaravelData<unknown>(response);
}

/*
|--------------------------------------------------------------------------
| Document Security / Antivirus
|--------------------------------------------------------------------------
*/

export async function scanDocument(
  id: number | string
): Promise<{
  scan_result: unknown;
  document: DmsDocument;
}> {
  const response = await apiRequest<
    | LaravelSuccessResponse<{
        scan_result: unknown;
        document: DmsDocument;
      }>
    | {
        scan_result: unknown;
        document: DmsDocument;
      }
  >(`/document-security/documents/${id}/scan`, {
    method: "POST",
  });

  return unwrapLaravelData(response);
}

export async function scanPendingDocuments(): Promise<{
  total_scanned: number;
  results: unknown[];
}> {
  const response = await apiRequest<
    | LaravelSuccessResponse<{
        total_scanned: number;
        results: unknown[];
      }>
    | {
        total_scanned: number;
        results: unknown[];
      }
  >("/document-security/scan-pending", {
    method: "POST",
  });

  return unwrapLaravelData(response);
}

export async function getQuarantinedDocuments(): Promise<DmsDocument[]> {
  const response = await apiRequest<
    LaravelSuccessResponse<DmsDocument[]> | DmsDocument[]
  >("/document-security/quarantine", {
    method: "GET",
  });

  return unwrapLaravelData<DmsDocument[]>(response);
}

export async function rejectQuarantinedDocument(
  id: number | string
): Promise<DmsDocument> {
  const response = await apiRequest<
    LaravelSuccessResponse<DmsDocument> | DmsDocument
  >(`/document-security/quarantine/${id}/reject`, {
    method: "POST",
  });

  return unwrapLaravelData<DmsDocument>(response);
}

/*
|--------------------------------------------------------------------------
| Secure Document Access
|--------------------------------------------------------------------------
*/

export async function getDocumentAccessStatus(
  id: number | string
): Promise<DocumentAccessStatus> {
  const response = await apiRequest<
    LaravelSuccessResponse<DocumentAccessStatus> | DocumentAccessStatus
  >(`/document-access/documents/${id}/status`, {
    method: "GET",
  });

  return unwrapLaravelData<DocumentAccessStatus>(response);
}

export async function viewDocumentFile(
  id: number | string
): Promise<BlobFileResponse> {
  return apiBlobRequest(`/document-access/documents/${id}/view`);
}

export async function downloadDocumentFile(
  id: number | string
): Promise<BlobFileResponse> {
  return apiBlobRequest(`/document-access/documents/${id}/download`);
}

export async function openDocumentInNewTab(id: number | string): Promise<void> {
  const response = await viewDocumentFile(id);
  const url = window.URL.createObjectURL(response.blob);

  window.open(url, "_blank", "noopener,noreferrer");

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 60_000);
}

export async function saveDocumentToDevice(
  id: number | string,
  fallbackFilename = "document"
): Promise<void> {
  const response = await downloadDocumentFile(id);
  const url = window.URL.createObjectURL(response.blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = response.filename || fallbackFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

/*
|--------------------------------------------------------------------------
| Plaintext / OCR
|--------------------------------------------------------------------------
*/

export async function extractDocumentPlaintext(
  id: number | string
): Promise<{
  result: unknown;
  document: DmsDocument;
}> {
  const response = await apiRequest<
    | LaravelSuccessResponse<{
        result: unknown;
        document: DmsDocument;
      }>
    | {
        result: unknown;
        document: DmsDocument;
      }
  >(`/document-plaintext/documents/${id}/extract`, {
    method: "POST",
  });

  return unwrapLaravelData(response);
}

export async function extractPendingDocumentsPlaintext(): Promise<{
  total_processed: number;
  results: unknown[];
}> {
  const response = await apiRequest<
    | LaravelSuccessResponse<{
        total_processed: number;
        results: unknown[];
      }>
    | {
        total_processed: number;
        results: unknown[];
      }
  >("/document-plaintext/extract-pending", {
    method: "POST",
  });

  return unwrapLaravelData(response);
}

export async function getDocumentPlaintext(
  id: number | string
): Promise<unknown> {
  const response = await apiRequest<LaravelSuccessResponse<unknown> | unknown>(
    `/document-plaintext/documents/${id}`,
    {
      method: "GET",
    }
  );

  return unwrapLaravelData<unknown>(response);
}

export async function searchPlaintext(q: string): Promise<unknown[]> {
  const response = await apiRequest<
    LaravelSuccessResponse<unknown[]> | unknown[]
  >("/document-plaintext/search", {
    method: "GET",
    query: { q },
  });

  return unwrapLaravelData<unknown[]>(response);
}

/*
|--------------------------------------------------------------------------
| Sandbox
|--------------------------------------------------------------------------
*/

export async function testDocumentSandbox(
  id: number | string
): Promise<{
  result: unknown;
  document: DmsDocument;
}> {
  const response = await apiRequest<
    | LaravelSuccessResponse<{
        result: unknown;
        document: DmsDocument;
      }>
    | {
        result: unknown;
        document: DmsDocument;
      }
  >(`/document-sandbox/documents/${id}/test`, {
    method: "POST",
  });

  return unwrapLaravelData(response);
}

export async function testPendingDocumentsSandbox(): Promise<{
  total_processed: number;
  results: unknown[];
}> {
  const response = await apiRequest<
    | LaravelSuccessResponse<{
        total_processed: number;
        results: unknown[];
      }>
    | {
        total_processed: number;
        results: unknown[];
      }
  >("/document-sandbox/test-pending", {
    method: "POST",
  });

  return unwrapLaravelData(response);
}

export async function getUnsafeSandboxDocuments(): Promise<DmsDocument[]> {
  const response = await apiRequest<
    LaravelSuccessResponse<DmsDocument[]> | DmsDocument[]
  >("/document-sandbox/unsafe", {
    method: "GET",
  });

  return unwrapLaravelData<DmsDocument[]>(response);
}

export async function rejectUnsafeSandboxDocument(
  id: number | string
): Promise<DmsDocument> {
  const response = await apiRequest<
    LaravelSuccessResponse<DmsDocument> | DmsDocument
  >(`/document-sandbox/unsafe/${id}/reject`, {
    method: "POST",
  });

  return unwrapLaravelData<DmsDocument>(response);
}

export async function getSandboxSummary(): Promise<SandboxSummary> {
  const response = await apiRequest<
    LaravelSuccessResponse<SandboxSummary> | SandboxSummary
  >("/document-sandbox/summary", {
    method: "GET",
  });

  return unwrapLaravelData<SandboxSummary>(response);
}

export async function getSandboxLogs(
  filters?: QueryParams
): Promise<SandboxLog[]> {
  const response = await apiRequest<
    LaravelSuccessResponse<SandboxLog[]> | SandboxLog[]
  >("/document-sandbox/logs", {
    method: "GET",
    query: filters,
  });

  return unwrapLaravelData<SandboxLog[]>(response);
}

/*
|--------------------------------------------------------------------------
| Encryption
|--------------------------------------------------------------------------
*/

export async function encryptDocument(
  id: number | string
): Promise<{
  result: unknown;
  document: DmsDocument;
}> {
  const response = await apiRequest<
    | LaravelSuccessResponse<{
        result: unknown;
        document: DmsDocument;
      }>
    | {
        result: unknown;
        document: DmsDocument;
      }
  >(`/document-encryption/documents/${id}/encrypt`, {
    method: "POST",
  });

  return unwrapLaravelData(response);
}

export async function encryptCleanDocuments(): Promise<{
  total_processed: number;
  results: unknown[];
}> {
  const response = await apiRequest<
    | LaravelSuccessResponse<{
        total_processed: number;
        results: unknown[];
      }>
    | {
        total_processed: number;
        results: unknown[];
      }
  >("/document-encryption/encrypt-clean", {
    method: "POST",
  });

  return unwrapLaravelData(response);
}

export async function verifyEncryptedDocument(
  id: number | string
): Promise<unknown> {
  const response = await apiRequest<LaravelSuccessResponse<unknown> | unknown>(
    `/document-encryption/documents/${id}/verify`,
    {
      method: "POST",
    }
  );

  return unwrapLaravelData<unknown>(response);
}

export async function getEncryptionSummary(): Promise<EncryptionSummary> {
  const response = await apiRequest<
    LaravelSuccessResponse<EncryptionSummary> | EncryptionSummary
  >("/document-encryption/summary", {
    method: "GET",
  });

  return unwrapLaravelData<EncryptionSummary>(response);
}

export async function getEncryptionLogs(
  filters?: QueryParams
): Promise<EncryptionLog[]> {
  const response = await apiRequest<
    LaravelSuccessResponse<EncryptionLog[]> | EncryptionLog[]
  >("/document-encryption/logs", {
    method: "GET",
    query: filters,
  });

  return unwrapLaravelData<EncryptionLog[]>(response);
}

/*
|--------------------------------------------------------------------------
| Document AI
|--------------------------------------------------------------------------
*/

export async function getAiSummary(): Promise<AiSummary> {
  const response = await apiRequest<
    LaravelSuccessResponse<AiSummary> | AiSummary
  >("/document-ai/summary", {
    method: "GET",
  });

  return unwrapLaravelData<AiSummary>(response);
}

export async function analyzeDocumentWithAi(
  id: number | string
): Promise<{
  result: unknown;
  document: DmsDocument;
}> {
  const response = await apiRequest<
    | LaravelSuccessResponse<{
        result: unknown;
        document: DmsDocument;
      }>
    | {
        result: unknown;
        document: DmsDocument;
      }
  >(`/document-ai/documents/${id}/analyze`, {
    method: "POST",
  });

  return unwrapLaravelData(response);
}

export async function analyzePendingDocumentsWithAi(): Promise<{
  total_processed: number;
  results: Array<{
    document_id?: number | string;
    document_code?: string | null;
    title?: string | null;
    result?: unknown;
  }>;
}> {
  const response = await apiRequest<
    | LaravelSuccessResponse<{
        total_processed: number;
        results: Array<{
          document_id?: number | string;
          document_code?: string | null;
          title?: string | null;
          result?: unknown;
        }>;
      }>
    | {
        total_processed: number;
        results: Array<{
          document_id?: number | string;
          document_code?: string | null;
          title?: string | null;
          result?: unknown;
        }>;
      }
  >("/document-ai/analyze-pending", {
    method: "POST",
  });

  return unwrapLaravelData(response);
}

export async function getDocumentAiAnalysis(
  id: number | string
): Promise<DocumentAiAnalysisResponse> {
  const response = await apiRequest<
    LaravelSuccessResponse<DocumentAiAnalysisResponse> | DocumentAiAnalysisResponse
  >(`/document-ai/documents/${id}`, {
    method: "GET",
  });

  return unwrapLaravelData<DocumentAiAnalysisResponse>(response);
}

export async function searchAiAnalysis(q: string): Promise<AiSearchResponse> {
  const response = await apiRequest<
    LaravelSuccessResponse<AiSearchResponse> | AiSearchResponse
  >("/document-ai/search", {
    method: "GET",
    query: { q },
  });

  return unwrapLaravelData<AiSearchResponse>(response);
}

export async function applyAiSuggestions(
  id: number | string,
  payload: AiApplySuggestionsPayload
): Promise<DmsDocument> {
  const response = await apiRequest<
    LaravelSuccessResponse<DmsDocument> | DmsDocument
  >(`/document-ai/documents/${id}/apply-suggestions`, {
    method: "POST",
    body: payload,
  });

  return unwrapLaravelData<DmsDocument>(response);
}

export async function getAiLogs(filters?: QueryParams): Promise<AiAnalysisLog[]> {
  const response = await apiRequest<
    LaravelSuccessResponse<AiAnalysisLog[]> | AiAnalysisLog[]
  >("/document-ai/logs", {
    method: "GET",
    query: filters,
  });

  return unwrapLaravelData<AiAnalysisLog[]>(response);
}
