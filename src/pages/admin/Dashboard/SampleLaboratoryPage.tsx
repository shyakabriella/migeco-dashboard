import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Filter,
  FlaskConical,
  Layers,
  Loader2,
  MapPin,
  Microscope,
  Plus,
  RefreshCcw,
  Search,
  TestTube2,
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

type SampleRecord = {
  id: number;
  sampleCode: string;
  sampleName: string;
  project: string;
  studyArea: string;
  sampleType: string;
  material: string;
  district: string;
  sector: string;
  latitude: string;
  longitude: string;
  depth: string;
  collectedBy: string;
  collectedDate: string;
  laboratory: string;
  testType: string;
  labReference: string;
  status: SampleStatus;
  resultSummary: string;
  chainOfCustody: string;
  notes: string;
};

type SampleFormState = {
  sampleCode: string;
  sampleName: string;
  project: string;
  studyArea: string;
  sampleType: string;
  material: string;
  district: string;
  sector: string;
  latitude: string;
  longitude: string;
  depth: string;
  collectedBy: string;
  collectedDate: string;
  laboratory: string;
  testType: string;
  labReference: string;
  status: SampleStatus;
  resultSummary: string;
  chainOfCustody: string;
  notes: string;
};

const initialSamples: SampleRecord[] = [
  {
    id: 1,
    sampleCode: "SMP-NYG-001",
    sampleName: "Granite Core Sample A",
    project: "Eastern Exploration Project",
    studyArea: "Nyagatare Granite Belt",
    sampleType: "Rock sample",
    material: "Granite",
    district: "Nyagatare",
    sector: "Rwimiyaga",
    latitude: "-1.3088",
    longitude: "30.3344",
    depth: "0.8 m",
    collectedBy: "Team Alpha",
    collectedDate: "2026-06-12",
    laboratory: "MIGECO Central Laboratory",
    testType: "Petrographic analysis",
    labReference: "LAB-2026-014",
    status: "testing",
    resultSummary: "Thin section preparation in progress.",
    chainOfCustody: "Field Team Alpha > Lab Reception > Petrography Unit",
    notes: "Collected near exposed granite ridge.",
  },
  {
    id: 2,
    sampleCode: "SMP-RLD-002",
    sampleName: "Tin Bearing Soil Sample",
    project: "Northern Mineral Survey",
    studyArea: "Rulindo Tin Corridor",
    sampleType: "Soil sample",
    material: "Lateritic soil",
    district: "Rulindo",
    sector: "Base",
    latitude: "-1.7094",
    longitude: "30.0138",
    depth: "0.3 m",
    collectedBy: "Team Beta",
    collectedDate: "2026-05-29",
    laboratory: "GeoChem Lab Kigali",
    testType: "Geochemical assay",
    labReference: "LAB-2026-009",
    status: "completed",
    resultSummary: "Tin anomaly detected. Verification sample recommended.",
    chainOfCustody: "Team Beta > Courier > GeoChem Lab Kigali",
    notes: "Sample point requires GPS verification.",
  },
  {
    id: 3,
    sampleCode: "SMP-KRG-003",
    sampleName: "Clay Basin Trial Sample",
    project: "Western Materials Study",
    studyArea: "Karongi Clay Basin",
    sampleType: "Clay sample",
    material: "Clay",
    district: "Karongi",
    sector: "Bwishyura",
    latitude: "-2.0653",
    longitude: "29.3472",
    depth: "1.2 m",
    collectedBy: "Team Gamma",
    collectedDate: "2025-11-04",
    laboratory: "Construction Materials Lab",
    testType: "Plasticity index",
    labReference: "LAB-2025-087",
    status: "received",
    resultSummary: "Awaiting test scheduling.",
    chainOfCustody: "Team Gamma > Materials Lab Reception",
    notes: "Potential ceramic-grade clay. More sampling needed.",
  },
];

const emptyForm: SampleFormState = {
  sampleCode: "",
  sampleName: "",
  project: "",
  studyArea: "",
  sampleType: "",
  material: "",
  district: "",
  sector: "",
  latitude: "",
  longitude: "",
  depth: "",
  collectedBy: "",
  collectedDate: "",
  laboratory: "",
  testType: "",
  labReference: "",
  status: "collected",
  resultSummary: "",
  chainOfCustody: "",
  notes: "",
};

function getStatusClass(status: SampleStatus): string {
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

function formatStatus(status: SampleStatus): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
      const matchesStatus = !status || sample.status === status;
      const matchesSearch =
        !keyword ||
        [
          sample.sampleCode,
          sample.sampleName,
          sample.project,
          sample.studyArea,
          sample.sampleType,
          sample.material,
          sample.district,
          sample.sector,
          sample.laboratory,
          sample.testType,
          sample.labReference,
          sample.collectedBy,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [samples, search, status]);

  function handleFormChange(field: keyof SampleFormState, value: string): void {
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

    if (!form.sampleName.trim()) {
      setError("Sample name is required.");
      return;
    }

    if (!form.sampleType.trim()) {
      setError("Sample type is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const newSample: SampleRecord = {
        id: Date.now(),
        sampleCode:
          form.sampleCode.trim() ||
          `SMP-${String(samples.length + 1).padStart(3, "0")}`,
        sampleName: form.sampleName.trim(),
        project: form.project.trim() || "General Repository",
        studyArea: form.studyArea.trim() || "Unassigned Study Area",
        sampleType: form.sampleType.trim(),
        material: form.material.trim() || "-",
        district: form.district.trim() || "-",
        sector: form.sector.trim() || "-",
        latitude: form.latitude.trim() || "-",
        longitude: form.longitude.trim() || "-",
        depth: form.depth.trim() || "-",
        collectedBy: form.collectedBy.trim() || "-",
        collectedDate: form.collectedDate || "-",
        laboratory: form.laboratory.trim() || "-",
        testType: form.testType.trim() || "-",
        labReference: form.labReference.trim() || "-",
        status: form.status,
        resultSummary: form.resultSummary.trim() || "No result recorded yet.",
        chainOfCustody:
          form.chainOfCustody.trim() || "Chain of custody not recorded.",
        notes: form.notes.trim() || "No notes added.",
      };

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
          <div className="mx-auto grid min-h-0 w-full max-w-[1650px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
              <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-4">
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
                    label="Completed"
                    value={String(
                      samples.filter((sample) => sample.status === "completed")
                        .length,
                    )}
                    icon={<CheckCircle2 size={16} />}
                    tone="success"
                  />
                  <SummaryCard
                    label="Received"
                    value={String(
                      samples.filter((sample) => sample.status === "received")
                        .length,
                    )}
                    icon={<ClipboardList size={16} />}
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
                      placeholder="Search sample code, project, study area, lab, material, result..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div className="relative lg:w-48">
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
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-slate-50/60 p-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                  <table className="w-full min-w-[1040px] text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Sample</th>
                        <th className="px-4 py-3">Study Area</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Laboratory</th>
                        <th className="px-4 py-3">Test</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSamples.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center">
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
                              className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 ${
                                active ? "bg-blue-50/80" : "bg-white"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <TestTube2 size={17} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="max-w-[240px] truncate font-semibold text-slate-800">
                                      {sample.sampleName}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                      {sample.sampleCode} · {sample.material}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                <p className="max-w-[190px] truncate">
                                  {sample.studyArea}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {sample.project}
                                </p>
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                <p className="max-w-[180px] truncate">
                                  {sample.district}, {sample.sector}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {sample.latitude}, {sample.longitude}
                                </p>
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                <p className="max-w-[170px] truncate">
                                  {sample.laboratory}
                                </p>
                              </td>

                              <td className="px-4 py-3">
                                <p className="max-w-[170px] truncate text-xs font-semibold text-slate-700">
                                  {sample.testType}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {sample.labReference}
                                </p>
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                    sample.status,
                                  )}`}
                                >
                                  {formatStatus(sample.status)}
                                </span>
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
  tone?: "default" | "success" | "info" | "warning";
}) {
  const toneClass = {
    default: "border-slate-200 bg-white text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
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
            Select a sample to view laboratory and location details.
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
              {sample.sampleName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{sample.sampleCode}</p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
              sample.status,
            )}`}
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
              <p className="text-sm font-semibold">Laboratory Workflow</p>
            </div>
            <span className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              {sample.labReference}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <WorkflowMetric label="Laboratory" value={sample.laboratory} />
            <WorkflowMetric label="Test Type" value={sample.testType} />
            <WorkflowMetric label="Sample Type" value={sample.sampleType} />
            <WorkflowMetric label="Material" value={sample.material} />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <DetailsBlock title="Sample Details">
            <DetailRow label="Sample Code" value={sample.sampleCode} />
            <DetailRow label="Sample Name" value={sample.sampleName} />
            <DetailRow label="Sample Type" value={sample.sampleType} />
            <DetailRow label="Material" value={sample.material} />
            <DetailRow label="Depth" value={sample.depth} />
          </DetailsBlock>

          <DetailsBlock title="Location">
            <DetailRow label="Study Area" value={sample.studyArea} />
            <DetailRow label="District" value={sample.district} />
            <DetailRow label="Sector" value={sample.sector} />
            <DetailRow label="Latitude" value={sample.latitude} />
            <DetailRow label="Longitude" value={sample.longitude} />
          </DetailsBlock>

          <DetailsBlock title="Collection">
            <DetailRow label="Collected By" value={sample.collectedBy} />
            <DetailRow label="Collected Date" value={sample.collectedDate} />
            <DetailRow label="Project" value={sample.project} />
            <DetailRow label="Custody" value={sample.chainOfCustody} />
          </DetailsBlock>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Result Summary
            </p>
            <p className="text-xs leading-5 text-emerald-800">
              {sample.resultSummary}
            </p>
          </div>

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
      <span className="max-w-[230px] truncate text-right text-xs font-medium text-slate-900">
        {value || "-"}
      </span>
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
  onChange: (field: keyof SampleFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/45 px-4 py-6 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Register Sample / Laboratory Record
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track field samples, laboratory testing, custody and results.
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
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Sample Name"
              value={form.sampleName}
              required
              placeholder="Example: Granite Core Sample A"
              onChange={(value) => onChange("sampleName", value)}
            />
            <InputField
              label="Sample Code"
              value={form.sampleCode}
              placeholder="Example: SMP-NYG-001"
              onChange={(value) => onChange("sampleCode", value)}
            />
            <InputField
              label="Project / Repository"
              value={form.project}
              placeholder="Existing project or General Repository"
              onChange={(value) => onChange("project", value)}
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
              label="Latitude"
              value={form.latitude}
              placeholder="Example: -1.3088"
              onChange={(value) => onChange("latitude", value)}
            />
            <InputField
              label="Longitude"
              value={form.longitude}
              placeholder="Example: 30.3344"
              onChange={(value) => onChange("longitude", value)}
            />
            <InputField
              label="Depth"
              value={form.depth}
              placeholder="Example: 0.8 m"
              onChange={(value) => onChange("depth", value)}
            />
            <InputField
              label="Collected By"
              value={form.collectedBy}
              placeholder="Example: Team Alpha"
              onChange={(value) => onChange("collectedBy", value)}
            />
            <InputField
              label="Collected Date"
              type="date"
              value={form.collectedDate}
              onChange={(value) => onChange("collectedDate", value)}
            />
            <InputField
              label="Laboratory"
              value={form.laboratory}
              placeholder="Example: MIGECO Central Laboratory"
              onChange={(value) => onChange("laboratory", value)}
            />
            <InputField
              label="Test Type"
              value={form.testType}
              placeholder="Assay, petrography, plasticity index..."
              onChange={(value) => onChange("testType", value)}
            />
            <InputField
              label="Lab Reference"
              value={form.labReference}
              placeholder="Example: LAB-2026-014"
              onChange={(value) => onChange("labReference", value)}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
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

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Chain of Custody
              </label>
              <input
                value={form.chainOfCustody}
                onChange={(event) =>
                  onChange("chainOfCustody", event.target.value)
                }
                placeholder="Example: Team Alpha > Lab Reception > Petrography Unit"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Result Summary
              </label>
              <textarea
                value={form.resultSummary}
                onChange={(event) =>
                  onChange("resultSummary", event.target.value)
                }
                rows={3}
                placeholder="Write lab result summary or current testing status..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(event) => onChange("notes", event.target.value)}
                rows={3}
                placeholder="Write sampling notes, lab remarks, storage condition, or recommendations..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>
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