import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Filter,
  FlaskConical,
  Loader2,
  MapPin,
  Microscope,
  Paperclip,
  Plus,
  Navigation,
  RefreshCcw,
  Search,
  TestTube2,
  Trash2,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import AdminSidebar from "../../admin/AdminSidebar";

type SampleStatus =
  | "collected"
  | "in_transit"
  | "received"
  | "testing"
  | "completed"
  | "rejected";

type ResultStatus =
  | "pending"
  | "received"
  | "testing"
  | "completed"
  | "rejected"
  | "cancelled";

type ResultDocumentCategory =
  | "result_report"
  | "certificate"
  | "raw_data"
  | "image"
  | "other";

type ResultDocument = {
  id: string | number;
  name: string;
  url: string;
  size?: number;
  type?: string;
  category: ResultDocumentCategory;
  uploadedAt: string;
  file?: File;
  laboratoryResultId?: string | number | null;
};

type ProjectOption = {
  id: string | number;
  name: string;
  code?: string;
  studyArea?: string;
};

type BackendProject = {
  id?: string | number;
  name?: string | null;
  title?: string | null;
  project_name?: string | null;
  projectName?: string | null;
  code?: string | null;
  project_code?: string | null;
  projectCode?: string | null;
  study_area_name?: string | null;
  studyArea?: string | null;
};

type SampleRecord = {
  id: number | string;
  projectId: string;

  // Supervisor requirement 4: Sample Management
  sampleCode: string;
  sampleName: string;
  collectionDate: string;
  collector: string;
  locationName: string;
  linkedProject: string;

  // Extra field metadata
  studyArea: string;
  sampleType: string;
  material: string;
  district: string;
  sector: string;
  latitude: string;
  longitude: string;
  depth: string;
  status: SampleStatus;
  chainOfCustody: string;
  notes: string;

  // Supervisor requirement 5: Laboratory Results
  laboratory: string;
  labReference: string;
  receivedDate: string;
  testType: string;
  testMethod: string;
  testedBy: string;
  testDate: string;
  resultStatus: ResultStatus;
  testResults: string;
  resultSummary: string;
  interpretation: string;
  resultDocuments: ResultDocument[];
};

type SampleFormState = Omit<SampleRecord, "id">;

type SummaryTone = "default" | "success" | "info" | "warning" | "danger";

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

type BackendPaginator<T> = {
  data?: T[];
  current_page?: number;
  total?: number;
};

type BackendResultDocument = {
  id?: string | number;
  laboratory_result_id?: string | number | null;
  document_type?: string | null;
  title?: string | null;
  original_file_name?: string | null;
  originalFileName?: string | null;
  file_size?: number | string | null;
  fileSize?: number | string | null;
  mime_type?: string | null;
  mimeType?: string | null;
  url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type BackendLaboratoryResult = {
  id?: string | number;
  laboratory?: string | null;
  lab_reference?: string | null;
  labReference?: string | null;
  received_date?: string | null;
  test_type?: string | null;
  testType?: string | null;
  test_method?: string | null;
  testMethod?: string | null;
  tested_by?: string | null;
  testedBy?: string | null;
  test_date?: string | null;
  testDate?: string | null;
  result_status?: string | null;
  resultStatus?: string | null;
  result_summary?: string | null;
  resultSummary?: string | null;
  test_results?: unknown;
  interpretation?: string | null;
  recommendation?: string | null;
  notes?: string | null;
  documents?: BackendResultDocument[] | null;
};

type BackendSample = {
  id?: string | number;
  sample_code?: string | null;
  sampleCode?: string | null;
  sample_name?: string | null;
  sampleName?: string | null;
  project_id?: string | number | null;
  project?: BackendProject | string | null;
  project_name?: string | null;
  studyArea?: string | null;
  study_area_name?: string | null;
  sample_type?: string | null;
  sampleType?: string | null;
  material?: string | null;
  collection_location?: string | null;
  province?: string | null;
  district?: string | null;
  sector?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  depth?: string | null;
  collected_by?: string | null;
  collectedBy?: string | null;
  collected_date?: string | null;
  collectedDate?: string | null;
  chain_of_custody?: string | null;
  chainOfCustody?: string | null;
  status?: string | null;
  notes?: string | null;
  laboratory?: string | null;
  lab_reference?: string | null;
  labReference?: string | null;
  received_date?: string | null;
  test_type?: string | null;
  testType?: string | null;
  test_method?: string | null;
  testMethod?: string | null;
  tested_by?: string | null;
  testedBy?: string | null;
  test_date?: string | null;
  testDate?: string | null;
  result_status?: string | null;
  resultStatus?: string | null;
  result_summary?: string | null;
  resultSummary?: string | null;
  test_results?: unknown;
  interpretation?: string | null;
  recommendation?: string | null;
  laboratory_results?: BackendLaboratoryResult[] | null;
  result_documents?: BackendResultDocument[] | null;
  resultDocuments?: BackendResultDocument[] | null;
  result_documents_count?: number | string | null;
  resultDocumentsCount?: number | string | null;
};

type BackendSummary = {
  total_samples?: number;
  collected_samples?: number;
  in_transit_samples?: number;
  received_samples?: number;
  testing_samples?: number;
  completed_samples?: number;
  rejected_samples?: number;
  laboratory_results?: number;
  completed_results?: number;
  result_documents?: number;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const emptyForm: SampleFormState = {
  projectId: "",
  sampleCode: "",
  sampleName: "",
  collectionDate: "",
  collector: "",
  locationName: "",
  linkedProject: "",
  studyArea: "",
  sampleType: "",
  material: "",
  district: "",
  sector: "",
  latitude: "",
  longitude: "",
  depth: "",
  status: "collected",
  chainOfCustody: "",
  notes: "",
  laboratory: "",
  labReference: "",
  receivedDate: "",
  testType: "",
  testMethod: "",
  testedBy: "",
  testDate: "",
  resultStatus: "pending",
  testResults: "",
  resultSummary: "",
  interpretation: "",
  resultDocuments: [],
};

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function formatDate(value?: string | null): string {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatStatus(value: string): string {
  if (!value) return "Not Set";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "-";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

function toSafeString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;

  const text = String(value).trim();
  return text || fallback;
}

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function getProjectDisplayName(project: BackendProject | string | null | undefined): string {
  if (!project) return "";

  if (typeof project === "string") {
    return project;
  }

  return toSafeString(
    project.name ||
      project.title ||
      project.project_name ||
      project.projectName ||
      project.code ||
      project.project_code ||
      project.projectCode,
  );
}

function normalizeProjectOption(raw: BackendProject): ProjectOption | null {
  if (!raw || raw.id === null || raw.id === undefined) return null;

  const name = getProjectDisplayName(raw);

  if (!name) return null;

  return {
    id: raw.id,
    name,
    code: toSafeString(raw.code || raw.project_code || raw.projectCode),
    studyArea: toSafeString(raw.study_area_name || raw.studyArea),
  };
}

function normalizeProjectsResponse(payload: unknown): ProjectOption[] {
  const data = unwrapApiData<BackendProject[] | BackendPaginator<BackendProject>>(payload);

  const rows = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as BackendPaginator<BackendProject>).data)
      ? ((data as BackendPaginator<BackendProject>).data || [])
      : [];

  return rows
    .map(normalizeProjectOption)
    .filter((project): project is ProjectOption => Boolean(project));
}

function createGoogleMapsUrl(latitude: string | number, longitude: string | number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function extractCoordinatesFromText(value: string): { latitude: string; longitude: string } | null {
  const text = value.trim();

  if (!text) return null;

  const patterns = [
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /ll=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match) continue;

    const latitude = Number(match[1]);
    const longitude = Number(match[2]);

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      return {
        latitude: latitude.toFixed(7),
        longitude: longitude.toFixed(7),
      };
    }
  }

  return null;
}

function normalizeSampleStatus(value?: string | null): SampleStatus {
  const status = String(value || "collected").toLowerCase();

  if (
    [
      "collected",
      "in_transit",
      "received",
      "testing",
      "completed",
      "rejected",
    ].includes(status)
  ) {
    return status as SampleStatus;
  }

  return "collected";
}

function normalizeResultStatus(value?: string | null): ResultStatus {
  const status = String(value || "pending").toLowerCase();

  if (
    ["pending", "received", "testing", "completed", "rejected", "cancelled"].includes(
      status,
    )
  ) {
    return status as ResultStatus;
  }

  if (status === "not_started") return "pending";
  if (status === "approved") return "completed";

  return "pending";
}

function stringifyTestResults(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "object" && item !== null
          ? JSON.stringify(item)
          : String(item),
      )
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        const valueText =
          typeof item === "object" && item !== null
            ? JSON.stringify(item)
            : String(item ?? "");
        return `${formatStatus(key)}: ${valueText}`;
      })
      .join("\n");
  }

  return String(value);
}

function getToken(): string | null {
  const keys = ["dms_token", "token", "auth_token", "authToken", "access_token"];

  for (const storage of [localStorage, sessionStorage]) {
    for (const key of keys) {
      const rawToken = storage.getItem(key);
      if (!rawToken) continue;

      const token = rawToken.replace(/^Bearer\s+/i, "").trim();
      if (token && token !== "undefined" && token !== "null") {
        return token;
      }
    }
  }

  return null;
}

function getAuthHeaders(json = true): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.message === "string") {
      const errors = record.data;

      if (errors && typeof errors === "object") {
        const firstError = Object.values(errors as Record<string, unknown>)[0];

        if (Array.isArray(firstError) && firstError.length > 0) {
          return String(firstError[0]);
        }

        if (typeof firstError === "string") {
          return firstError;
        }
      }

      return record.message;
    }

    if (typeof record.error === "string") {
      return record.error;
    }
  }

  return fallback;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  json = true,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(json),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      getApiErrorMessage(payload, `Request failed with status ${response.status}.`),
    ) as ApiError;
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload as T;
}

function unwrapApiData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function normalizeDocuments(
  documents: BackendResultDocument[] | null | undefined,
): ResultDocument[] {
  if (!Array.isArray(documents)) return [];

  return documents.map((document) => {
    const documentType = toSafeString(document.document_type, "result_report");
    const isImage = toSafeString(document.mime_type || document.mimeType).startsWith("image/");
    const category: ResultDocumentCategory = isImage
      ? "image"
      : documentType.includes("certificate")
        ? "certificate"
        : documentType.includes("raw")
          ? "raw_data"
          : documentType.includes("result")
            ? "result_report"
            : "other";

    return {
      id: document.id || `${document.original_file_name}-${document.created_at}`,
      laboratoryResultId: document.laboratory_result_id || null,
      name:
        document.originalFileName ||
        document.original_file_name ||
        document.title ||
        "Result document",
      url: document.url || "#",
      size: toSafeNumber(document.fileSize || document.file_size),
      type: document.mimeType || document.mime_type || undefined,
      category,
      uploadedAt: document.created_at || document.updated_at || "",
    };
  });
}

function normalizeSample(raw: BackendSample): SampleRecord {
  const laboratoryResults = Array.isArray(raw.laboratory_results)
    ? raw.laboratory_results
    : [];
  const latestResult = laboratoryResults[0] || null;
  const rawDocuments = Array.isArray(raw.result_documents)
    ? raw.result_documents
    : Array.isArray(raw.resultDocuments)
      ? raw.resultDocuments
      : latestResult?.documents || [];

  const resultStatus = normalizeResultStatus(
    raw.resultStatus || raw.result_status || latestResult?.resultStatus || latestResult?.result_status,
  );

  const laboratory =
    raw.laboratory || latestResult?.laboratory || "";
  const labReference =
    raw.labReference || raw.lab_reference || latestResult?.labReference || latestResult?.lab_reference || "";
  const receivedDate =
    raw.received_date || latestResult?.received_date || "";
  const testType =
    raw.testType || raw.test_type || latestResult?.testType || latestResult?.test_type || "";
  const testMethod =
    raw.testMethod || raw.test_method || latestResult?.testMethod || latestResult?.test_method || "";
  const testedBy =
    raw.testedBy || raw.tested_by || latestResult?.testedBy || latestResult?.tested_by || "";
  const testDate =
    raw.testDate || raw.test_date || latestResult?.testDate || latestResult?.test_date || "";
  const resultSummary =
    raw.resultSummary || raw.result_summary || latestResult?.resultSummary || latestResult?.result_summary || "";
  const testResults = stringifyTestResults(
    raw.test_results || latestResult?.test_results || "",
  );
  const interpretation =
    raw.interpretation || latestResult?.interpretation || raw.recommendation || latestResult?.recommendation || "";

  const projectName = getProjectDisplayName(raw.project) || toSafeString(raw.project_name, "General Repository");

  return {
    id: raw.id || `${raw.sample_code || raw.sampleCode || Date.now()}`,
    projectId: toSafeString(raw.project_id),
    sampleCode: toSafeString(raw.sampleCode || raw.sample_code, "-"),
    sampleName: toSafeString(raw.sampleName || raw.sample_name, "-"),
    collectionDate: toSafeString(raw.collectedDate || raw.collected_date),
    collector: toSafeString(raw.collectedBy || raw.collected_by, "-"),
    locationName: toSafeString(raw.collection_location || raw.district, "-"),
    linkedProject: projectName,
    studyArea: toSafeString(raw.studyArea || raw.study_area_name, "Unassigned Study Area"),
    sampleType: toSafeString(raw.sampleType || raw.sample_type, "General sample"),
    material: toSafeString(raw.material, "-"),
    district: toSafeString(raw.district, "-"),
    sector: toSafeString(raw.sector, "-"),
    latitude: toSafeString(raw.latitude, "-"),
    longitude: toSafeString(raw.longitude, "-"),
    depth: toSafeString(raw.depth, "-"),
    status: normalizeSampleStatus(raw.status),
    chainOfCustody: toSafeString(raw.chainOfCustody || raw.chain_of_custody, "-"),
    notes: toSafeString(raw.notes, "-"),
    laboratory: toSafeString(laboratory, "-"),
    labReference: toSafeString(labReference, "-"),
    receivedDate: toSafeString(receivedDate),
    testType: toSafeString(testType, "-"),
    testMethod: toSafeString(testMethod, "-"),
    testedBy: toSafeString(testedBy, "-"),
    testDate: toSafeString(testDate),
    resultStatus,
    testResults: toSafeString(testResults, "No test result recorded yet."),
    resultSummary: toSafeString(resultSummary, "No result summary recorded yet."),
    interpretation: toSafeString(interpretation, "No interpretation recorded yet."),
    resultDocuments: normalizeDocuments(rawDocuments),
  };
}

function normalizeSamplesResponse(payload: unknown): SampleRecord[] {
  const data = unwrapApiData<BackendSample[] | BackendPaginator<BackendSample>>(payload);

  if (Array.isArray(data)) {
    return data.map(normalizeSample);
  }

  if (data && typeof data === "object" && Array.isArray((data as BackendPaginator<BackendSample>).data)) {
    return ((data as BackendPaginator<BackendSample>).data || []).map(normalizeSample);
  }

  return [];
}

function getSampleStatusClass(status: SampleStatus): string {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "testing":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "received":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "in_transit":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "collected":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getResultStatusClass(status: ResultStatus): string {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "testing":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "received":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "rejected":
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";
    case "pending":
      return "border-slate-200 bg-slate-50 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getDocumentCount(samples: SampleRecord[]): number {
  return samples.reduce(
    (total, sample) => total + sample.resultDocuments.length,
    0,
  );
}

function createResultDocumentFromFile(file: File): ResultDocument {
  const isImage = file.type.startsWith("image/");

  return {
    id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
    name: file.name,
    url: URL.createObjectURL(file),
    size: file.size,
    type: file.type,
    category: isImage ? "image" : "result_report",
    uploadedAt: new Date().toISOString(),
    file,
  };
}

function buildSampleFormData(form: SampleFormState): FormData {
  const data = new FormData();

  function append(key: string, value: string | number | null | undefined): void {
    if (value === null || value === undefined) return;

    const text = String(value).trim();
    if (text === "") return;

    data.append(key, text);
  }

  // Sample code and lab reference are generated by Laravel backend.
  append("project_id", form.projectId);
  append("project_name", form.linkedProject);
  append("sample_name", form.sampleName);
  append("study_area_name", form.studyArea);
  append("sample_type", form.sampleType);
  append("material", form.material);
  append("collection_location", form.locationName);
  append("district", form.district);
  append("sector", form.sector);
  append("latitude", form.latitude);
  append("longitude", form.longitude);
  append("depth", form.depth);
  append("collected_by", form.collector);
  append("collected_date", form.collectionDate);
  append("chain_of_custody", form.chainOfCustody);
  append("status", form.status);
  append("notes", form.notes);

  append("laboratory", form.laboratory);
  append("received_date", form.receivedDate);
  append("test_type", form.testType);
  append("test_method", form.testMethod);
  append("tested_by", form.testedBy);
  append("test_date", form.testDate);
  append("result_status", form.resultStatus);
  append("result_summary", form.resultSummary);
  append("interpretation", form.interpretation);

  if (form.testResults.trim()) {
    data.append("test_results[details]", form.testResults.trim());
  }

  form.resultDocuments.forEach((document) => {
    if (document.file) {
      data.append("result_documents[]", document.file, document.file.name);
    }
  });

  return data;
}

function validateForm(form: SampleFormState): string | null {
  if (!form.collectionDate) return "Collection date is required.";
  if (!form.collector.trim()) return "Collector is required.";
  if (!form.projectId.trim()) return "Please select a linked project.";
  if (!form.sampleType.trim()) return "Sample type is required.";
  if (!form.locationName.trim()) return "Google Map location is required.";
  if (!form.latitude.trim() || !form.longitude.trim()) {
    return "Latitude and longitude must be collected from Google Map location.";
  }

  const latitude = Number(form.latitude);
  if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    return "Latitude must be a valid number between -90 and 90.";
  }

  const longitude = Number(form.longitude);
  if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    return "Longitude must be a valid number between -180 and 180.";
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError;

  if (apiError.status === 401) {
    return "Your session expired. Please sign in again.";
  }

  if (apiError.status === 403) {
    return apiError.message || "You do not have permission for this action.";
  }

  if (apiError.status === 422) {
    return apiError.message || "Validation failed. Please check the form.";
  }

  return apiError.message || "The action could not be completed.";
}

export default function SampleLaboratoryPage() {
  const [samples, setSamples] = useState<SampleRecord[]>([]);
  const [summary, setSummary] = useState<BackendSummary | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleRecord | null>(null);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState<SampleFormState>(emptyForm);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [pageError, setPageError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(false);

  async function loadSamples(): Promise<void> {
    try {
      setLoading(true);
      setPageError("");

      const query = new URLSearchParams();
      query.set("per_page", "200");

      const [samplesPayload, summaryPayload] = await Promise.all([
        apiRequest<unknown>(`/samples-laboratory?${query.toString()}`),
        apiRequest<unknown>("/samples-laboratory/summary").catch(() => null),
      ]);

      const rows = normalizeSamplesResponse(samplesPayload);
      const summaryData = summaryPayload ? unwrapApiData<BackendSummary>(summaryPayload) : null;

      setSamples(rows);
      setSummary(summaryData);
      setSelectedSample((current) => {
        if (!rows.length) return null;

        const existing = rows.find(
          (sample) => current && String(sample.id) === String(current.id),
        );

        return existing || rows[0];
      });
    } catch (error) {
      setPageError(getErrorMessage(error));
      setSamples([]);
      setSelectedSample(null);
    } finally {
      setLoading(false);
    }
  }



  async function loadProjects(): Promise<void> {
    try {
      setProjectsLoading(true);
      const payload = await apiRequest<unknown>("/samples-laboratory/projects");
      setProjects(normalizeProjectsResponse(payload));
    } catch {
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }

  useEffect(() => {
    loadSamples();
    loadProjects();
  }, []);

  const filteredSamples = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return samples.filter((sample) => {
      const matchesStatus =
        !status || sample.status === status || sample.resultStatus === status;

      const matchesSearch =
        !keyword ||
        [
          sample.sampleCode,
          sample.sampleName,
          sample.linkedProject,
          sample.studyArea,
          sample.sampleType,
          sample.material,
          sample.locationName,
          sample.district,
          sample.sector,
          sample.laboratory,
          sample.testType,
          sample.labReference,
          sample.collector,
          sample.testResults,
          sample.resultSummary,
          sample.interpretation,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [samples, search, status]);

  const sampleCount = summary?.total_samples ?? samples.length;
  const testingCount = summary?.testing_samples ?? samples.filter((sample) => sample.status === "testing").length;
  const completedResultCount = summary?.completed_results ?? samples.filter((sample) => sample.resultStatus === "completed").length;
  const resultDocumentCount = summary?.result_documents ?? getDocumentCount(samples);

  function handleFormChange<K extends keyof SampleFormState>(
    field: K,
    value: SampleFormState[K],
  ): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateModal(): void {
    setForm(emptyForm);
    setError("");
    setSuccessMessage("");
    setIsModalOpen(true);

    if (projects.length === 0 && !projectsLoading) {
      loadProjects();
    }
  }

  function closeCreateModal(): void {
    if (saving) return;

    setIsModalOpen(false);
    setForm(emptyForm);
    setError("");
  }

  function handleProjectSelect(projectId: string): void {
    const selectedProject = projects.find(
      (project) => String(project.id) === String(projectId),
    );

    setForm((current) => ({
      ...current,
      projectId,
      linkedProject: selectedProject?.name || "",
      studyArea: selectedProject?.studyArea || current.studyArea,
    }));
  }

  async function handleCreateSample(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const validationError = validateForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const formData = buildSampleFormData(form);

      const response = await apiRequest<unknown>(
        "/samples-laboratory",
        {
          method: "POST",
          body: formData,
        },
        false,
      );

      const savedSample = normalizeSample(unwrapApiData<BackendSample>(response));

      setSelectedSample(savedSample);
      setIsModalOpen(false);
      setForm(emptyForm);
      setSuccessMessage("Sample and laboratory result saved successfully.");
      await loadSamples();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 lg:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <span>Projects & Field</span>
              <span>/</span>
              <span className="text-blue-600">Samples & Laboratory</span>
            </div>

            <h1 className="mt-1 truncate text-lg font-bold text-slate-900 lg:text-xl">
              Samples, Laboratory Tests & Results
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("");
                loadSamples();
              }}
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

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Sample</span>
            </button>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 overflow-hidden p-3 lg:p-4">
          <div className="mx-auto grid min-h-0 w-full max-w-[1680px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
              <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-4">
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Sample Management & Laboratory Results
                  </p>
                  
                </div>

                {pageError && (
                  <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {pageError}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    {successMessage}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <SummaryCard
                    label="Samples"
                    value={String(sampleCount)}
                    icon={<TestTube2 size={16} />}
                  />
                  <SummaryCard
                    label="Testing"
                    value={String(testingCount)}
                    icon={<Microscope size={16} />}
                    tone="info"
                  />
                  <SummaryCard
                    label="Completed Results"
                    value={String(completedResultCount)}
                    icon={<CheckCircle2 size={16} />}
                    tone="success"
                  />
                  <SummaryCard
                    label="Result Documents"
                    value={String(resultDocumentCount)}
                    icon={<FileText size={16} />}
                    tone="warning"
                  />
                </div>

                <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      value={search}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search sample code, collector, project, location, lab, result..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div className="relative lg:w-56">
                    <Filter
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={status}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        setStatus(event.target.value)
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-7 text-xs font-medium text-slate-600 outline-none focus:border-blue-400"
                    >
                      <option value="">All Status</option>
                      <option value="collected">Collected</option>
                      <option value="in_transit">In Transit</option>
                      <option value="received">Received</option>
                      <option value="testing">Testing</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending Result</option>
                      <option value="cancelled">Cancelled Result</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-slate-50/60 p-3">
                {loading ? (
                  <LoadingPanel />
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                    <table className="w-full min-w-[1180px] text-left text-sm">
                      <thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Sample Code</th>
                          <th className="px-4 py-3">Collection</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Linked Project</th>
                          <th className="px-4 py-3">Laboratory Result</th>
                          <th className="px-4 py-3">Result Documents</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredSamples.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-10 text-center">
                              <FlaskConical
                                size={28}
                                className="mx-auto text-slate-500"
                              />
                              <p className="mt-3 font-semibold text-slate-700">
                                No samples found
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Create a new sample or change filters.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredSamples.map((sample) => {
                            const active = selectedSample?.id === sample.id;

                            return (
                              <tr
                                key={String(sample.id)}
                                onClick={() => setSelectedSample(sample)}
                                className={cn(
                                  "cursor-pointer border-b border-slate-100 transition hover:bg-slate-50",
                                  active ? "bg-blue-50/80" : "bg-white",
                                )}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                      <TestTube2 size={17} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="max-w-[220px] truncate font-semibold text-slate-800">
                                        {sample.sampleCode}
                                      </p>
                                      <p className="mt-1 text-[11px] text-slate-400">
                                        {sample.sampleName || sample.sampleType}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                  <p className="max-w-[180px] truncate">
                                    {formatDate(sample.collectionDate)}
                                  </p>
                                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                                    <UserRound size={11} />
                                    {sample.collector}
                                  </p>
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                  <p className="max-w-[220px] truncate">
                                    {sample.locationName || sample.district}
                                  </p>
                                  <p className="mt-1 text-[11px] text-slate-400">
                                    {sample.latitude}, {sample.longitude}
                                  </p>
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                  <p className="max-w-[190px] truncate font-medium">
                                    {sample.linkedProject}
                                  </p>
                                  <p className="mt-1 text-[11px] text-slate-400">
                                    {sample.studyArea}
                                  </p>
                                </td>

                                <td className="px-4 py-3">
                                  <p className="max-w-[190px] truncate text-xs font-semibold text-slate-700">
                                    {sample.testType}
                                  </p>
                                  <p className="mt-1 max-w-[220px] truncate text-[11px] text-slate-400">
                                    {sample.resultSummary}
                                  </p>
                                </td>

                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                      <Paperclip size={14} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-slate-700">
                                        {sample.resultDocuments.length} file
                                        {sample.resultDocuments.length === 1
                                          ? ""
                                          : "s"}
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        Results evidence
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  <div className="space-y-1.5">
                                    <span
                                      className={cn(
                                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                                        getSampleStatusClass(sample.status),
                                      )}
                                    >
                                      {formatStatus(sample.status)}
                                    </span>
                                    <span
                                      className={cn(
                                        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium",
                                        getResultStatusClass(sample.resultStatus),
                                      )}
                                    >
                                      Result: {formatStatus(sample.resultStatus)}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <SampleDetails sample={selectedSample} />
          </div>
        </section>
      </main>

      {isModalOpen && (
        <CreateSampleModal
          form={form}
          saving={saving}
          error={error}
          projects={projects}
          projectsLoading={projectsLoading}
          onChange={handleFormChange}
          onProjectSelect={handleProjectSelect}
          onSubmit={handleCreateSample}
          onClose={closeCreateModal}
        />
      )}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Loader2 size={23} className="animate-spin" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700">
        Loading samples
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Retrieving sample and laboratory records from the backend...
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: SummaryTone;
}) {
  const toneClass = {
    default: "border-slate-200 bg-white text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
  }[tone];

  return (
    <div className={cn("rounded-xl border p-3", toneClass)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium opacity-70">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function SampleDetails({ sample }: { sample: SampleRecord | null }) {
  if (!sample) {
    return (
      <aside className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/40">
        <div>
          <FlaskConical size={30} className="mx-auto text-slate-500" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No sample selected
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Select a sample to view collection, laboratory and result documents.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-blue-600">
              Selected Sample
            </p>
            <h2 className="mt-1 truncate text-base font-bold text-slate-900">
              {sample.sampleCode}
            </h2>
            <p className="mt-1 truncate text-xs text-slate-500">
              {sample.sampleName} · {sample.linkedProject}
            </p>
          </div>

          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
              getSampleStatusClass(sample.status),
            )}
          >
            {formatStatus(sample.status)}
          </span>
        </div>
      </div>

      <div className="custom-scrollbar max-h-[calc(100vh-140px)] overflow-y-auto p-4">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Microscope size={18} />
              <p className="text-sm font-semibold">Laboratory Result Summary</p>
            </div>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                getResultStatusClass(sample.resultStatus),
              )}
            >
              {formatStatus(sample.resultStatus)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <WorkflowMetric label="Laboratory" value={sample.laboratory} />
            <WorkflowMetric label="Test Type" value={sample.testType} />
            <WorkflowMetric label="Lab Reference" value={sample.labReference} />
            <WorkflowMetric
              label="Result Docs"
              value={String(sample.resultDocuments.length)}
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <DetailsBlock title="Sample Information">
            <DetailRow label="Sample Code" value={sample.sampleCode} />
            <DetailRow label="Sample Name" value={sample.sampleName} />
            <DetailRow label="Sample Type" value={sample.sampleType} />
            <DetailRow label="Material" value={sample.material} />
            <DetailRow label="Depth" value={sample.depth} />
          </DetailsBlock>

          <DetailsBlock title="Collection Details">
            <DetailRow label="Collection Date" value={formatDate(sample.collectionDate)} />
            <DetailRow label="Collector" value={sample.collector} />
            <DetailRow label="Linked Project" value={sample.linkedProject} />
            <DetailRow label="Study Area" value={sample.studyArea} />
            <DetailRow label="Custody" value={sample.chainOfCustody} />
          </DetailsBlock>

          <DetailsBlock title="Location">
            <DetailRow label="Location" value={sample.locationName} />
            <DetailRow label="District" value={sample.district} />
            <DetailRow label="Sector" value={sample.sector} />
            <DetailRow label="Latitude" value={sample.latitude} />
            <DetailRow label="Longitude" value={sample.longitude} />
          </DetailsBlock>

          <DetailsBlock title="Laboratory Test Details">
            <DetailRow label="Laboratory" value={sample.laboratory} />
            <DetailRow label="Received Date" value={formatDate(sample.receivedDate)} />
            <DetailRow label="Test Type" value={sample.testType} />
            <DetailRow label="Test Method" value={sample.testMethod} />
            <DetailRow label="Tested By" value={sample.testedBy} />
            <DetailRow label="Test Date" value={formatDate(sample.testDate)} />
          </DetailsBlock>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Test Results
            </p>
            <p className="whitespace-pre-line text-xs leading-5 text-emerald-800">
              {sample.testResults}
            </p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Interpretation
            </p>
            <p className="mt-1 whitespace-pre-line text-xs leading-5 text-emerald-800">
              {sample.interpretation}
            </p>
          </div>

          <DetailsBlock title="Result Documents">
            <DocumentList documents={sample.resultDocuments} />
          </DetailsBlock>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Notes
            </p>
            <p className="whitespace-pre-line text-xs leading-5 text-slate-600">
              {sample.notes}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function WorkflowMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}

function DetailsBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="max-w-[250px] truncate text-right text-xs font-medium text-slate-900">
        {value || "-"}
      </span>
    </div>
  );
}

function DocumentList({ documents }: { documents: ResultDocument[] }) {
  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
        <FileText size={24} className="mx-auto text-slate-400" />
        <p className="mt-2 text-xs font-semibold text-slate-600">
          No result documents attached
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Attach reports, certificates, raw data or result files when registering
          the sample.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((document) => (
        <a
          key={String(document.id)}
          href={document.url || "#"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
            <FileText size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-800">
              {document.name}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              {formatStatus(document.category)} · {formatFileSize(document.size)}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}

function CreateSampleModal({
  form,
  saving,
  error,
  projects,
  projectsLoading,
  onChange,
  onProjectSelect,
  onSubmit,
  onClose,
}: {
  form: SampleFormState;
  saving: boolean;
  error: string;
  projects: ProjectOption[];
  projectsLoading: boolean;
  onChange: <K extends keyof SampleFormState>(
    field: K,
    value: SampleFormState[K],
  ) => void;
  onProjectSelect: (projectId: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/45 px-4 py-6 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Register Sample & Laboratory Result
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sample code and lab reference are generated by the system. Select
              a project, collect Google Map location, and attach lab results.
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

        <div className="custom-scrollbar max-h-[calc(92vh-150px)] overflow-y-auto p-6">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            <FormSection
              title="Sample Management"
              description="System generates sample code. Select project from projects and collect Google Map location automatically."
              icon={<TestTube2 size={18} />}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SystemGeneratedField
                  label="Sample Code"
                  value="Generated automatically after saving"
                />
                <InputField
                  label="Sample Name / Information"
                  value={form.sampleName}
                  placeholder="Example: Granite Core Sample A"
                  onChange={(value) => onChange("sampleName", value)}
                />
                <InputField
                  label="Collection Date"
                  type="date"
                  value={form.collectionDate}
                  required
                  onChange={(value) => onChange("collectionDate", value)}
                />
                <InputField
                  label="Collector"
                  value={form.collector}
                  required
                  placeholder="Example: Team Alpha or staff name"
                  onChange={(value) => onChange("collector", value)}
                />
                <ProjectSelect
                  value={form.projectId}
                  projects={projects}
                  loading={projectsLoading}
                  required
                  onChange={onProjectSelect}
                />
                <InputField
                  label="Study Area"
                  value={form.studyArea}
                  placeholder="Example: Nyagatare Granite Belt"
                  onChange={(value) => onChange("studyArea", value)}
                />
                <InputField
                  label="Sample Type"
                  value={form.sampleType}
                  required
                  placeholder="Rock sample, soil sample, water sample..."
                  onChange={(value) => onChange("sampleType", value)}
                />
                <InputField
                  label="Material"
                  value={form.material}
                  placeholder="Granite, clay, lateritic soil..."
                  onChange={(value) => onChange("material", value)}
                />
                <div className="md:col-span-2">
                  <MapLocationField
                    value={form.locationName}
                    latitude={form.latitude}
                    longitude={form.longitude}
                    required
                    onLocationChange={(value) => onChange("locationName", value)}
                    onCoordinatesChange={(latitude, longitude) => {
                      onChange("latitude", latitude);
                      onChange("longitude", longitude);
                    }}
                  />
                </div>
                <InputField
                  label="District"
                  value={form.district}
                  placeholder="District"
                  onChange={(value) => onChange("district", value)}
                />
                <InputField
                  label="Sector"
                  value={form.sector}
                  placeholder="Sector"
                  onChange={(value) => onChange("sector", value)}
                />
                <InputField
                  label="Depth"
                  value={form.depth}
                  placeholder="Example: 0.8 m"
                  onChange={(value) => onChange("depth", value)}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Chain of Custody"
                    value={form.chainOfCustody}
                    placeholder="Example: Team Alpha > Lab Reception > Petrography Unit"
                    onChange={(value) => onChange("chainOfCustody", value)}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Laboratory Results"
              description="Supervisor fields: sample information, test results and result documents."
              icon={<Microscope size={18} />}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Laboratory"
                  value={form.laboratory}
                  placeholder="Example: MIGECO Central Laboratory"
                  onChange={(value) => onChange("laboratory", value)}
                />
                <SystemGeneratedField
                  label="Lab Reference"
                  value="Generated automatically when lab result is saved"
                />
                <InputField
                  label="Received Date"
                  type="date"
                  value={form.receivedDate}
                  onChange={(value) => onChange("receivedDate", value)}
                />
                <InputField
                  label="Test Date"
                  type="date"
                  value={form.testDate}
                  onChange={(value) => onChange("testDate", value)}
                />
                <InputField
                  label="Test Type"
                  value={form.testType}
                  placeholder="Assay, petrography, plasticity index..."
                  onChange={(value) => onChange("testType", value)}
                />
                <InputField
                  label="Test Method"
                  value={form.testMethod}
                  placeholder="XRF, thin section, Atterberg limits..."
                  onChange={(value) => onChange("testMethod", value)}
                />
                <InputField
                  label="Tested By"
                  value={form.testedBy}
                  placeholder="Laboratory technician or unit"
                  onChange={(value) => onChange("testedBy", value)}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Sample Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      onChange("status", event.target.value as SampleStatus)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                  >
                    <option value="collected">Collected</option>
                    <option value="in_transit">In Transit</option>
                    <option value="received">Received</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Result Status
                  </label>
                  <select
                    value={form.resultStatus}
                    onChange={(event) =>
                      onChange("resultStatus", event.target.value as ResultStatus)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="received">Received</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Test Results
                  </label>
                  <textarea
                    value={form.testResults}
                    onChange={(event) => onChange("testResults", event.target.value)}
                    rows={4}
                    placeholder="Write laboratory test values, observations, assay result, index values, or testing status..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Result Summary
                  </label>
                  <textarea
                    value={form.resultSummary}
                    onChange={(event) => onChange("resultSummary", event.target.value)}
                    rows={3}
                    placeholder="Summarize the result in simple terms for reports and dashboard display..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Interpretation / Recommendation
                  </label>
                  <textarea
                    value={form.interpretation}
                    onChange={(event) =>
                      onChange("interpretation", event.target.value)
                    }
                    rows={3}
                    placeholder="Write technical interpretation, recommendation, or follow-up action..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Result Documents"
              description="Upload laboratory result reports, certificates, raw data sheets, photos, PDFs, Word or Excel files."
              icon={<FileText size={18} />}
            >
              <ResultDocumentsUpload
                documents={form.resultDocuments}
                onChange={(documents) => onChange("resultDocuments", documents)}
              />
            </FormSection>

            <FormSection
              title="Notes"
              description="Optional sampling remarks, storage condition, or additional observations."
              icon={<ClipboardList size={18} />}
            >
              <textarea
                value={form.notes}
                onChange={(event) => onChange("notes", event.target.value)}
                rows={4}
                placeholder="Write sampling notes, laboratory remarks, storage condition, or recommendations..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </FormSection>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? "Saving..." : "Save Sample"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ResultDocumentsUpload({
  documents,
  onChange,
}: {
  documents: ResultDocument[];
  onChange: (documents: ResultDocument[]) => void;
}) {
  const [error, setError] = useState<string>("");

  function handleFiles(event: ChangeEvent<HTMLInputElement>): void {
    const files: File[] = event.target.files ? Array.from(event.target.files) : [];

    if (files.length === 0) return;

    const acceptedFiles = files.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      return [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "csv",
        "txt",
        "jpg",
        "jpeg",
        "png",
        "webp",
        "tif",
        "tiff",
      ].includes(extension);
    });

    if (acceptedFiles.length === 0) {
      setError("Please upload result documents only: PDF, Word, Excel, CSV, text, or image files.");
      event.target.value = "";
      return;
    }

    setError("");
    onChange([...acceptedFiles.map(createResultDocumentFromFile), ...documents]);
    event.target.value = "";
  }

  function removeDocument(documentId: string | number): void {
    onChange(documents.filter((document) => String(document.id) !== String(documentId)));
  }

  return (
    <div className="space-y-4">
      <label className="flex min-h-[155px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-5 text-center transition hover:bg-blue-100">
        <input
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.tif,.tiff"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
          <UploadCloud size={22} />
        </div>
        <p className="mt-3 text-sm font-bold text-blue-900">
          Upload result documents
        </p>
        <p className="mt-1 max-w-md text-xs leading-5 text-blue-700">
          Attach laboratory reports, test certificates, result sheets, raw data,
          photos or scanned documents.
        </p>
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {documents.map((document) => (
            <div
              key={String(document.id)}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 p-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {document.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatFileSize(document.size)} · {formatStatus(document.category)}
                  </p>
                </div>
                {document.file && (
                  <button
                    type="button"
                    onClick={() => removeDocument(document.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50"
                    aria-label={`Remove ${document.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          No result documents selected yet.
        </div>
      )}
    </div>
  );
}

function SystemGeneratedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex min-h-[46px] items-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500">
        {value}
      </div>
    </div>
  );
}

function ProjectSelect({
  value,
  projects,
  loading,
  required = false,
  onChange,
}: {
  value: string;
  projects: ProjectOption[];
  loading: boolean;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Linked Project {required && <span className="text-red-600">*</span>}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
      >
        <option value="">
          {loading ? "Loading projects..." : "Select linked project"}
        </option>
        {projects.map((project) => (
          <option key={String(project.id)} value={String(project.id)}>
            {project.code ? `${project.code} - ${project.name}` : project.name}
          </option>
        ))}
      </select>
      {projects.length === 0 && !loading && (
        <p className="mt-1 text-[11px] text-amber-600">
          No projects loaded. Confirm /api/samples-laboratory/projects is available.
        </p>
      )}
    </div>
  );
}

function MapLocationField({
  value,
  latitude,
  longitude,
  required = false,
  onLocationChange,
  onCoordinatesChange,
}: {
  value: string;
  latitude: string;
  longitude: string;
  required?: boolean;
  onLocationChange: (value: string) => void;
  onCoordinatesChange: (latitude: string, longitude: string) => void;
}) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  function handleLocationTextChange(text: string): void {
    onLocationChange(text);

    const coordinates = extractCoordinatesFromText(text);

    if (coordinates) {
      onCoordinatesChange(coordinates.latitude, coordinates.longitude);
    }
  }

  function useCurrentLocation(): void {
    setGeoError("");

    if (!navigator.geolocation) {
      setGeoError("Your browser does not support location access.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitudeValue = position.coords.latitude.toFixed(7);
        const longitudeValue = position.coords.longitude.toFixed(7);
        const mapsUrl = createGoogleMapsUrl(latitudeValue, longitudeValue);

        onCoordinatesChange(latitudeValue, longitudeValue);
        onLocationChange(mapsUrl);
        setLocating(false);
      },
      () => {
        setGeoError("Location permission was denied or unavailable. Paste a Google Maps link with coordinates instead.");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  const hasCoordinates = latitude.trim() !== "" && longitude.trim() !== "";
  const mapsUrl = hasCoordinates ? createGoogleMapsUrl(latitude, longitude) : "";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Google Map Location {required && <span className="text-red-600">*</span>}
      </label>

      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="relative min-w-0 flex-1">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={value}
            onChange={(event) => handleLocationTextChange(event.target.value)}
            placeholder="Click Use Current Location or paste Google Maps link"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
          />
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locating ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Navigation size={15} />
          )}
          {locating ? "Getting location..." : "Use Current Location"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
        <ReadOnlyCoordinate label="Latitude" value={latitude || "Auto"} />
        <ReadOnlyCoordinate label="Longitude" value={longitude || "Auto"} />
        <a
          href={mapsUrl || "#"}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold",
            mapsUrl
              ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              : "pointer-events-none border-slate-200 bg-slate-50 text-slate-400",
          )}
        >
          Open in Google Maps
        </a>
      </div>

      {geoError && (
        <p className="mt-2 text-xs text-red-600">{geoError}</p>
      )}
      <p className="mt-2 text-[11px] leading-5 text-slate-400">
        Latitude and longitude are read-only. They are collected from browser GPS or parsed from a Google Maps link.
      </p>
    </div>
  );
}

function ReadOnlyCoordinate({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
      />
    </div>
  );
}