import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Filter,
  FlaskConical,
  Loader2,
  Microscope,
  Paperclip,
  Plus,
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
  | "not_started"
  | "received"
  | "testing"
  | "completed"
  | "approved"
  | "rejected";

type ResultDocumentCategory =
  | "result_report"
  | "certificate"
  | "raw_data"
  | "image"
  | "other";

type ResultDocument = {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  category: ResultDocumentCategory;
  uploadedAt: string;
};

type SampleRecord = {
  id: number;

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

const emptyForm: SampleFormState = {
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
  resultStatus: "not_started",
  testResults: "",
  resultSummary: "",
  interpretation: "",
  resultDocuments: [],
};

function createPlaceholderDocument(
  id: string,
  name: string,
  content: string,
  category: ResultDocumentCategory = "result_report",
): ResultDocument {
  return {
    id,
    name,
    url: `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`,
    size: content.length,
    type: "text/plain",
    category,
    uploadedAt: new Date().toISOString(),
  };
}

const initialSamples: SampleRecord[] = [
  {
    id: 1,
    sampleCode: "SMP-NYG-001",
    sampleName: "Granite Core Sample A",
    collectionDate: "2026-06-12",
    collector: "Team Alpha",
    locationName: "Nyagatare Granite Belt - exposed granite ridge",
    linkedProject: "Eastern Exploration Project",
    studyArea: "Nyagatare Granite Belt",
    sampleType: "Rock sample",
    material: "Granite",
    district: "Nyagatare",
    sector: "Rwimiyaga",
    latitude: "-1.308800",
    longitude: "30.334400",
    depth: "0.8 m",
    status: "testing",
    chainOfCustody: "Team Alpha > Lab Reception > Petrography Unit",
    notes: "Collected near exposed granite ridge. Keep for petrographic verification and possible geochemical follow-up.",
    laboratory: "MIGECO Central Laboratory",
    labReference: "LAB-2026-014",
    receivedDate: "2026-06-13",
    testType: "Petrographic analysis",
    testMethod: "Thin section microscopy",
    testedBy: "Petrography Unit",
    testDate: "",
    resultStatus: "testing",
    testResults: "Thin section preparation is in progress.",
    resultSummary: "Testing is ongoing. No final result has been approved yet.",
    interpretation: "Pending final petrographic interpretation.",
    resultDocuments: [
      createPlaceholderDocument(
        "doc-nyg-1",
        "LAB-2026-014-preparation-note.txt",
        "Thin section preparation started for SMP-NYG-001.",
        "raw_data",
      ),
    ],
  },
  {
    id: 2,
    sampleCode: "SMP-RLD-002",
    sampleName: "Tin Bearing Soil Sample",
    collectionDate: "2026-05-29",
    collector: "Team Beta",
    locationName: "Rulindo Tin Corridor - northern access track",
    linkedProject: "Northern Mineral Survey",
    studyArea: "Rulindo Tin Corridor",
    sampleType: "Soil sample",
    material: "Lateritic soil",
    district: "Rulindo",
    sector: "Base",
    latitude: "-1.709400",
    longitude: "30.013800",
    depth: "0.3 m",
    status: "completed",
    chainOfCustody: "Team Beta > Courier > GeoChem Lab Kigali",
    notes: "Sample point requires GPS verification before final technical report.",
    laboratory: "GeoChem Lab Kigali",
    labReference: "LAB-2026-009",
    receivedDate: "2026-05-30",
    testType: "Geochemical assay",
    testMethod: "XRF screening and wet chemistry confirmation",
    testedBy: "GeoChem Analyst",
    testDate: "2026-06-03",
    resultStatus: "completed",
    testResults: "Tin anomaly detected. Verification sample recommended.",
    resultSummary: "Result indicates elevated tin values compared to background samples.",
    interpretation: "The area needs a follow-up sampling grid to confirm continuity of the anomaly.",
    resultDocuments: [
      createPlaceholderDocument(
        "doc-rld-1",
        "LAB-2026-009-result-summary.txt",
        "Tin anomaly detected for sample SMP-RLD-002. Verification sample recommended.",
        "result_report",
      ),
      createPlaceholderDocument(
        "doc-rld-2",
        "LAB-2026-009-chain-of-custody.txt",
        "Team Beta > Courier > GeoChem Lab Kigali.",
        "certificate",
      ),
    ],
  },
  {
    id: 3,
    sampleCode: "SMP-KRG-003",
    sampleName: "Clay Basin Trial Sample",
    collectionDate: "2025-11-04",
    collector: "Team Gamma",
    locationName: "Karongi Clay Basin - lakeside access road",
    linkedProject: "Western Materials Study",
    studyArea: "Karongi Clay Basin",
    sampleType: "Clay sample",
    material: "Clay",
    district: "Karongi",
    sector: "Bwishyura",
    latitude: "-2.065300",
    longitude: "29.347200",
    depth: "1.2 m",
    status: "received",
    chainOfCustody: "Team Gamma > Materials Lab Reception",
    notes: "Potential ceramic-grade clay. More sampling needed around the basin boundary.",
    laboratory: "Construction Materials Lab",
    labReference: "LAB-2025-087",
    receivedDate: "2025-11-05",
    testType: "Plasticity index",
    testMethod: "Atterberg limits",
    testedBy: "Materials Lab Team",
    testDate: "",
    resultStatus: "received",
    testResults: "Awaiting test scheduling.",
    resultSummary: "No final laboratory result recorded yet.",
    interpretation: "Pending laboratory analysis.",
    resultDocuments: [],
  },
];

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
    case "approved":
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "testing":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "received":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    case "not_started":
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

function readFileAsDataUrl(file: File): Promise<ResultDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const isImage = file.type.startsWith("image/");

      resolve({
        id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        url: String(reader.result || ""),
        size: file.size,
        type: file.type,
        category: isImage ? "image" : "result_report",
        uploadedAt: new Date().toISOString(),
      });
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formToSample(form: SampleFormState, id: number): SampleRecord {
  return {
    id,
    sampleCode: form.sampleCode.trim(),
    sampleName: form.sampleName.trim() || form.sampleCode.trim(),
    collectionDate: form.collectionDate,
    collector: form.collector.trim(),
    locationName: form.locationName.trim(),
    linkedProject: form.linkedProject.trim(),
    studyArea: form.studyArea.trim() || "Unassigned Study Area",
    sampleType: form.sampleType.trim() || "General sample",
    material: form.material.trim() || "-",
    district: form.district.trim() || "-",
    sector: form.sector.trim() || "-",
    latitude: form.latitude.trim() || "-",
    longitude: form.longitude.trim() || "-",
    depth: form.depth.trim() || "-",
    status: form.status,
    chainOfCustody:
      form.chainOfCustody.trim() || "Chain of custody not recorded.",
    notes: form.notes.trim() || "No notes added.",
    laboratory: form.laboratory.trim() || "-",
    labReference: form.labReference.trim() || "-",
    receivedDate: form.receivedDate || "",
    testType: form.testType.trim() || "-",
    testMethod: form.testMethod.trim() || "-",
    testedBy: form.testedBy.trim() || "-",
    testDate: form.testDate || "",
    resultStatus: form.resultStatus,
    testResults: form.testResults.trim() || "No test result recorded yet.",
    resultSummary: form.resultSummary.trim() || "No result summary recorded yet.",
    interpretation: form.interpretation.trim() || "No interpretation recorded yet.",
    resultDocuments: form.resultDocuments,
  };
}

export default function SampleLaboratoryPage() {
  const [samples, setSamples] = useState<SampleRecord[]>(initialSamples);
  const [selectedSample, setSelectedSample] = useState<SampleRecord | null>(
    initialSamples[0],
  );
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState<SampleFormState>(emptyForm);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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
    setIsModalOpen(true);
  }

  function closeCreateModal(): void {
    if (saving) return;

    setIsModalOpen(false);
    setForm(emptyForm);
    setError("");
  }

  async function handleCreateSample(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!form.sampleCode.trim()) {
      setError("Sample code is required.");
      return;
    }

    if (!form.collectionDate) {
      setError("Collection date is required.");
      return;
    }

    if (!form.collector.trim()) {
      setError("Collector is required.");
      return;
    }

    if (!form.locationName.trim() && !form.district.trim()) {
      setError("Location or district is required.");
      return;
    }

    if (!form.linkedProject.trim()) {
      setError("Linked project is required.");
      return;
    }

    const duplicateSample = samples.some(
      (sample) =>
        sample.sampleCode.toLowerCase() === form.sampleCode.trim().toLowerCase(),
    );

    if (duplicateSample) {
      setError("Sample code already exists. Use a unique sample code.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const newSample = formToSample(form, Date.now());

      setSamples((current) => [newSample, ...current]);
      setSelectedSample(newSample);
      setIsModalOpen(false);
      setForm(emptyForm);
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
              }}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <RefreshCcw size={15} />
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
                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    Track sample code, collection date, collector, location,
                    linked project, laboratory test results, and result
                    documents in one workspace.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <SummaryCard
                    label="Samples"
                    value={String(samples.length)}
                    icon={<TestTube2 size={16} />}
                  />
                  <SummaryCard
                    label="Testing"
                    value={String(
                      samples.filter((sample) => sample.status === "testing")
                        .length,
                    )}
                    icon={<Microscope size={16} />}
                    tone="info"
                  />
                  <SummaryCard
                    label="Completed Results"
                    value={String(
                      samples.filter(
                        (sample) =>
                          sample.resultStatus === "completed" ||
                          sample.resultStatus === "approved",
                      ).length,
                    )}
                    icon={<CheckCircle2 size={16} />}
                    tone="success"
                  />
                  <SummaryCard
                    label="Result Documents"
                    value={String(getDocumentCount(samples))}
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
                      <option value="approved">Approved Result</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-slate-50/60 p-3">
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
                              key={sample.id}
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
          onChange={handleFormChange}
          onSubmit={handleCreateSample}
          onClose={closeCreateModal}
        />
      )}
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
            <p className="text-xs leading-5 text-emerald-800">
              {sample.testResults}
            </p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Interpretation
            </p>
            <p className="mt-1 text-xs leading-5 text-emerald-800">
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
            <p className="text-xs leading-5 text-slate-600">{sample.notes}</p>
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
          key={document.id}
          href={document.url}
          download={document.name}
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
  onChange,
  onSubmit,
  onClose,
}: {
  form: SampleFormState;
  saving: boolean;
  error: string;
  onChange: <K extends keyof SampleFormState>(
    field: K,
    value: SampleFormState[K],
  ) => void;
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
              Add sample code, collection date, collector, location, linked
              project, test results and result documents.
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
              description="Supervisor fields: sample code, collection date, collector, location and linked project."
              icon={<TestTube2 size={18} />}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Sample Code"
                  value={form.sampleCode}
                  required
                  placeholder="Example: SMP-NYG-001"
                  onChange={(value) => onChange("sampleCode", value)}
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
                <InputField
                  label="Linked Project"
                  value={form.linkedProject}
                  required
                  placeholder="Example: Eastern Exploration Project"
                  onChange={(value) => onChange("linkedProject", value)}
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
                  placeholder="Rock sample, soil sample, water sample..."
                  onChange={(value) => onChange("sampleType", value)}
                />
                <InputField
                  label="Material"
                  value={form.material}
                  placeholder="Granite, clay, lateritic soil..."
                  onChange={(value) => onChange("material", value)}
                />
                <InputField
                  label="Location / Site"
                  value={form.locationName}
                  required
                  placeholder="Nearest landmark, sample point, or GPS site"
                  onChange={(value) => onChange("locationName", value)}
                />
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
                <InputField
                  label="Latitude"
                  value={form.latitude}
                  placeholder="Example: -1.308800"
                  onChange={(value) => onChange("latitude", value)}
                />
                <InputField
                  label="Longitude"
                  value={form.longitude}
                  placeholder="Example: 30.334400"
                  onChange={(value) => onChange("longitude", value)}
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
                <InputField
                  label="Lab Reference"
                  value={form.labReference}
                  placeholder="Example: LAB-2026-014"
                  onChange={(value) => onChange("labReference", value)}
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
                    <option value="not_started">Not Started</option>
                    <option value="received">Received</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
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
            Save Sample
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
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleFiles(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    try {
      setUploading(true);
      setError("");

      const uploadedDocuments = await Promise.all(files.map(readFileAsDataUrl));

      onChange([...uploadedDocuments, ...documents]);
      event.target.value = "";
    } catch {
      setError("Some documents could not be loaded. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeDocument(documentId: string): void {
    onChange(documents.filter((document) => document.id !== documentId));
  }

  return (
    <div className="space-y-4">
      <label className="flex min-h-[155px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-5 text-center transition hover:bg-blue-100">
        <input
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
          {uploading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <UploadCloud size={22} />
          )}
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
              key={document.id}
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
                <button
                  type="button"
                  onClick={() => removeDocument(document.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50"
                  aria-label={`Remove ${document.name}`}
                >
                  <Trash2 size={14} />
                </button>
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