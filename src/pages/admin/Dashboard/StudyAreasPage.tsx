import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Compass,
  Crosshair,
  Filter,
  Layers,
  Loader2,
  Map,
  MapPin,
  Plus,
  RefreshCcw,
  Route,
  Search,
  X,
} from "lucide-react";
import AdminSidebar from "../../admin/AdminSidebar";

type StudyAreaStatus = "active" | "planned" | "under_review" | "archived";

type StudyArea = {
  id: number;
  name: string;
  code: string;
  project: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  latitude: string;
  longitude: string;
  elevation: string;
  areaSize: string;
  mapTitle: string;
  mapType: string;
  mapReference: string;
  mapScale: string;
  coordinateSystem: string;
  locationAccuracy: string;
  accessRoute: string;
  fieldTeam: string;
  status: StudyAreaStatus;
  lastSurveyed: string;
  notes: string;
};

type StudyAreaFormState = {
  name: string;
  code: string;
  project: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  latitude: string;
  longitude: string;
  elevation: string;
  areaSize: string;
  mapTitle: string;
  mapType: string;
  mapReference: string;
  mapScale: string;
  coordinateSystem: string;
  locationAccuracy: string;
  accessRoute: string;
  fieldTeam: string;
  status: StudyAreaStatus;
  lastSurveyed: string;
  notes: string;
};

const initialStudyAreas: StudyArea[] = [
  {
    id: 1,
    name: "Nyagatare Granite Belt",
    code: "SA-NYG-001",
    project: "Eastern Exploration Project",
    province: "Eastern Province",
    district: "Nyagatare",
    sector: "Rwimiyaga",
    cell: "Gacundezi",
    village: "Kabeza",
    latitude: "-1.3088",
    longitude: "30.3344",
    elevation: "1,390 m",
    areaSize: "42.5 km2",
    mapTitle: "Nyagatare Granite Belt Field Map",
    mapType: "Geological field map",
    mapReference: "MAP-NYG-2026-A",
    mapScale: "1:50,000",
    coordinateSystem: "WGS 84 / UTM Zone 35S",
    locationAccuracy: "GPS verified",
    accessRoute: "RN13 to Rwimiyaga field road",
    fieldTeam: "Team Alpha",
    status: "active",
    lastSurveyed: "2026-06-12",
    notes: "Primary granite exposure with active sampling points.",
  },
  {
    id: 2,
    name: "Rulindo Tin Corridor",
    code: "SA-RLD-002",
    project: "Northern Mineral Survey",
    province: "Northern Province",
    district: "Rulindo",
    sector: "Base",
    cell: "Cyohoha",
    village: "Gitega",
    latitude: "-1.7094",
    longitude: "30.0138",
    elevation: "1,782 m",
    areaSize: "18.2 km2",
    mapTitle: "Rulindo Tin Corridor Location Map",
    mapType: "Mineral occurrence map",
    mapReference: "MAP-RLD-2026-B",
    mapScale: "1:25,000",
    coordinateSystem: "WGS 84",
    locationAccuracy: "Needs verification",
    accessRoute: "Base sector road, north access track",
    fieldTeam: "Team Beta",
    status: "under_review",
    lastSurveyed: "2026-05-29",
    notes: "Requires updated coordinate verification before final report.",
  },
  {
    id: 3,
    name: "Karongi Clay Basin",
    code: "SA-KRG-003",
    project: "Western Materials Study",
    province: "Western Province",
    district: "Karongi",
    sector: "Bwishyura",
    cell: "Kiniha",
    village: "Nyamishaba",
    latitude: "-2.0653",
    longitude: "29.3472",
    elevation: "1,520 m",
    areaSize: "25.0 km2",
    mapTitle: "Karongi Clay Basin Planning Map",
    mapType: "Material resource map",
    mapReference: "MAP-KRG-2025-C",
    mapScale: "1:10,000",
    coordinateSystem: "WGS 84",
    locationAccuracy: "Estimated",
    accessRoute: "Bwishyura lakeside access road",
    fieldTeam: "Team Gamma",
    status: "planned",
    lastSurveyed: "2025-11-04",
    notes: "Potential clay deposits near existing road access.",
  },
];

const emptyForm: StudyAreaFormState = {
  name: "",
  code: "",
  project: "",
  province: "",
  district: "",
  sector: "",
  cell: "",
  village: "",
  latitude: "",
  longitude: "",
  elevation: "",
  areaSize: "",
  mapTitle: "",
  mapType: "",
  mapReference: "",
  mapScale: "",
  coordinateSystem: "",
  locationAccuracy: "",
  accessRoute: "",
  fieldTeam: "",
  status: "planned",
  lastSurveyed: "",
  notes: "",
};

function getStatusClass(status: StudyAreaStatus): string {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "planned":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "under_review":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "archived":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function formatStatus(status: StudyAreaStatus): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StudyAreasPage() {
  const [studyAreas, setStudyAreas] = useState<StudyArea[]>(initialStudyAreas);
  const [selectedArea, setSelectedArea] = useState<StudyArea | null>(
    initialStudyAreas[0],
  );
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState<StudyAreaFormState>(emptyForm);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const filteredStudyAreas = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return studyAreas.filter((area) => {
      const matchesStatus = !status || area.status === status;

      const matchesSearch =
        !keyword ||
        [
          area.name,
          area.code,
          area.project,
          area.province,
          area.district,
          area.sector,
          area.cell,
          area.village,
          area.mapTitle,
          area.mapType,
          area.mapReference,
          area.mapScale,
          area.coordinateSystem,
          area.accessRoute,
          area.fieldTeam,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [search, status, studyAreas]);

  function handleFormChange(
    field: keyof StudyAreaFormState,
    value: string,
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

  async function handleCreateStudyArea(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Study area name is required.");
      return;
    }

    if (!form.district.trim()) {
      setError("District is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const newArea: StudyArea = {
        id: Date.now(),
        name: form.name.trim(),
        code:
          form.code.trim() ||
          `SA-${String(studyAreas.length + 1).padStart(3, "0")}`,
        project: form.project.trim() || "General Repository",
        province: form.province.trim() || "-",
        district: form.district.trim(),
        sector: form.sector.trim() || "-",
        cell: form.cell.trim() || "-",
        village: form.village.trim() || "-",
        latitude: form.latitude.trim() || "-",
        longitude: form.longitude.trim() || "-",
        elevation: form.elevation.trim() || "-",
        areaSize: form.areaSize.trim() || "-",
        mapTitle: form.mapTitle.trim() || "Untitled map",
        mapType: form.mapType.trim() || "General location map",
        mapReference: form.mapReference.trim() || "-",
        mapScale: form.mapScale.trim() || "-",
        coordinateSystem: form.coordinateSystem.trim() || "WGS 84",
        locationAccuracy: form.locationAccuracy.trim() || "Not verified",
        accessRoute: form.accessRoute.trim() || "-",
        fieldTeam: form.fieldTeam.trim() || "-",
        status: form.status,
        lastSurveyed: form.lastSurveyed || "-",
        notes: form.notes.trim() || "No notes added.",
      };

      setStudyAreas((current) => [newArea, ...current]);
      setSelectedArea(newArea);
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
              <span className="text-blue-600">Study Areas</span>
            </div>

            <h1 className="mt-1 truncate text-lg font-bold text-slate-900 lg:text-xl">
              Study Areas, Maps & Locations
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
              <span className="hidden sm:inline">New Study Area</span>
            </button>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 overflow-hidden p-3 lg:p-4">
          <div className="mx-auto grid min-h-0 w-full max-w-[1650px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
              <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <SummaryCard
                    label="Study Areas"
                    value={String(studyAreas.length)}
                    icon={<Map size={16} />}
                  />
                  <SummaryCard
                    label="Active Fields"
                    value={String(
                      studyAreas.filter((area) => area.status === "active")
                        .length,
                    )}
                    icon={<MapPin size={16} />}
                    tone="success"
                  />
                  <SummaryCard
                    label="Maps"
                    value={String(
                      studyAreas.filter((area) => area.mapReference !== "-")
                        .length,
                    )}
                    icon={<Layers size={16} />}
                    tone="info"
                  />
                  <SummaryCard
                    label="Under Review"
                    value={String(
                      studyAreas.filter(
                        (area) => area.status === "under_review",
                      ).length,
                    )}
                    icon={<Compass size={16} />}
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
                      placeholder="Search study area, map, district, sector, location..."
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
                      <option value="active">Active</option>
                      <option value="planned">Planned</option>
                      <option value="under_review">Under Review</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-slate-50/60 p-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Study Area</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Coordinates</th>
                        <th className="px-4 py-3">Map Layer</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStudyAreas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center">
                            <MapPin
                              size={28}
                              className="mx-auto text-slate-500"
                            />
                            <p className="mt-3 font-semibold text-slate-700">
                              No study areas found
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Try changing filters or create a new study area.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredStudyAreas.map((area) => {
                          const active = selectedArea?.id === area.id;

                          return (
                            <tr
                              key={area.id}
                              onClick={() => setSelectedArea(area)}
                              className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 ${
                                active ? "bg-blue-50/80" : "bg-white"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Map size={17} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="max-w-[240px] truncate font-semibold text-slate-800">
                                      {area.name}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                      {area.code} · {area.areaSize}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                <p className="max-w-[180px] truncate">
                                  {area.project}
                                </p>
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                <p className="max-w-[220px] truncate">
                                  {area.district}, {area.sector}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {area.cell}, {area.village}
                                </p>
                              </td>

                              <td className="px-4 py-3 text-xs text-slate-500">
                                <p>{area.latitude}, {area.longitude}</p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {area.coordinateSystem}
                                </p>
                              </td>

                              <td className="px-4 py-3">
                                <div className="max-w-[180px]">
                                  <p className="truncate text-xs font-semibold text-slate-700">
                                    {area.mapReference}
                                  </p>
                                  <p className="mt-1 truncate text-[11px] text-slate-400">
                                    {area.mapType}
                                  </p>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                    area.status,
                                  )}`}
                                >
                                  {formatStatus(area.status)}
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

            <StudyAreaDetails area={selectedArea} />
          </div>
        </section>
      </main>

      {isModalOpen && (
        <CreateStudyAreaModal
          form={form}
          saving={saving}
          error={error}
          onChange={handleFormChange}
          onSubmit={handleCreateStudyArea}
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
  icon: React.ReactNode;
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

function StudyAreaDetails({ area }: { area: StudyArea | null }) {
  if (!area) {
    return (
      <aside className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/40">
        <div>
          <Map size={30} className="mx-auto text-slate-500" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No study area selected
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Select a row to view map and location fields.
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
              Selected Study Area
            </p>
            <h2 className="mt-1 truncate text-base font-bold text-slate-900">
              {area.name}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{area.code}</p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
              area.status,
            )}`}
          >
            {formatStatus(area.status)}
          </span>
        </div>
      </div>

      <div className="custom-scrollbar max-h-[calc(100vh-140px)] overflow-y-auto p-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Map Workspace
              </p>
              <h3 className="mt-1 truncate text-sm font-bold text-slate-900">
                {area.mapTitle}
              </h3>
            </div>

            <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              {area.mapType}
            </span>
          </div>

          <div className="relative min-h-[310px] overflow-hidden bg-[#e8f1ff]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.16)_1px,transparent_1px),linear-gradient(rgba(59,130,246,0.16)_1px,transparent_1px)] bg-[size:34px_34px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_75%_25%,rgba(245,158,11,0.18),transparent_24%),radial-gradient(circle_at_65%_78%,rgba(59,130,246,0.16),transparent_26%)]" />

            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <MapLayer label="Boundary" color="blue" />
              <MapLayer label="Field route" color="emerald" />
              <MapLayer label="Sample points" color="amber" />
            </div>

            <div className="absolute right-5 top-5 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Scale
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {area.mapScale}
              </p>
            </div>

            <div className="absolute left-[52%] top-[48%] -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute h-16 w-16 rounded-full bg-blue-500/15" />
                <span className="absolute h-9 w-9 rounded-full bg-blue-500/25" />
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-lg shadow-blue-300">
                  <MapPin size={15} />
                </span>
              </div>
            </div>

            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Crosshair size={16} />
                  <p className="text-sm font-semibold">Primary Location Point</p>
                </div>

                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {area.locationAccuracy}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <MapInfo label="Latitude" value={area.latitude} />
                <MapInfo label="Longitude" value={area.longitude} />
                <MapInfo label="Elevation" value={area.elevation} />
                <MapInfo label="Coordinate System" value={area.coordinateSystem} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <DetailsBlock title="Map Details">
            <DetailRow label="Map Title" value={area.mapTitle} />
            <DetailRow label="Map Type" value={area.mapType} />
            <DetailRow label="Map Reference" value={area.mapReference} />
            <DetailRow label="Scale" value={area.mapScale} />
            <DetailRow label="Coordinate System" value={area.coordinateSystem} />
          </DetailsBlock>

          <DetailsBlock title="Location Fields">
            <DetailRow label="Province" value={area.province} />
            <DetailRow label="District" value={area.district} />
            <DetailRow label="Sector" value={area.sector} />
            <DetailRow label="Cell" value={area.cell} />
            <DetailRow label="Village" value={area.village} />
            <DetailRow label="Latitude" value={area.latitude} />
            <DetailRow label="Longitude" value={area.longitude} />
            <DetailRow label="Elevation" value={area.elevation} />
            <DetailRow label="Accuracy" value={area.locationAccuracy} />
          </DetailsBlock>

          <DetailsBlock title="Field Information">
            <DetailRow label="Project" value={area.project} />
            <DetailRow label="Field Team" value={area.fieldTeam} />
            <DetailRow label="Last Surveyed" value={area.lastSurveyed} />
            <DetailRow label="Area Size" value={area.areaSize} />
            <DetailRow label="Access Route" value={area.accessRoute} />
          </DetailsBlock>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Notes
            </p>
            <p className="text-xs leading-5 text-slate-600">{area.notes}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MapInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 truncate font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function MapLayer({
  label,
  color,
}: {
  label: string;
  color: "blue" | "emerald" | "amber";
}) {
  const colorClass = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  }[color];

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-sm ${colorClass}`}
    >
      {label}
    </span>
  );
}

function DetailsBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
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

function CreateStudyAreaModal({
  form,
  saving,
  error,
  onChange,
  onSubmit,
  onClose,
}: {
  form: StudyAreaFormState;
  saving: boolean;
  error: string;
  onChange: (field: keyof StudyAreaFormState, value: string) => void;
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
              Create Study Area
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Register maps, coordinates, location fields, and field team
              information.
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
              label="Study Area Name"
              value={form.name}
              required
              placeholder="Example: Nyagatare Granite Belt"
              onChange={(value) => onChange("name", value)}
            />
            <InputField
              label="Study Area Code"
              value={form.code}
              placeholder="Example: SA-NYG-001"
              onChange={(value) => onChange("code", value)}
            />
            <InputField
              label="Project / Repository"
              value={form.project}
              placeholder="Existing project or General Repository"
              onChange={(value) => onChange("project", value)}
            />
            <InputField
              label="Map Title"
              value={form.mapTitle}
              placeholder="Example: Nyagatare Granite Belt Field Map"
              onChange={(value) => onChange("mapTitle", value)}
            />
            <InputField
              label="Map Type"
              value={form.mapType}
              placeholder="Example: Geological field map"
              onChange={(value) => onChange("mapType", value)}
            />
            <InputField
              label="Map Reference"
              value={form.mapReference}
              placeholder="Example: MAP-NYG-2026-A"
              onChange={(value) => onChange("mapReference", value)}
            />
            <InputField
              label="Map Scale"
              value={form.mapScale}
              placeholder="Example: 1:50,000"
              onChange={(value) => onChange("mapScale", value)}
            />
            <InputField
              label="Coordinate System"
              value={form.coordinateSystem}
              placeholder="Example: WGS 84 / UTM Zone 35S"
              onChange={(value) => onChange("coordinateSystem", value)}
            />
            <InputField
              label="Province"
              value={form.province}
              placeholder="Province"
              onChange={(value) => onChange("province", value)}
            />
            <InputField
              label="District"
              value={form.district}
              required
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
              label="Cell"
              value={form.cell}
              placeholder="Cell"
              onChange={(value) => onChange("cell", value)}
            />
            <InputField
              label="Village"
              value={form.village}
              placeholder="Village"
              onChange={(value) => onChange("village", value)}
            />
            <InputField
              label="Area Size"
              value={form.areaSize}
              placeholder="Example: 42.5 km2"
              onChange={(value) => onChange("areaSize", value)}
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
              label="Elevation"
              value={form.elevation}
              placeholder="Example: 1,390 m"
              onChange={(value) => onChange("elevation", value)}
            />
            <InputField
              label="Location Accuracy"
              value={form.locationAccuracy}
              placeholder="Example: GPS verified"
              onChange={(value) => onChange("locationAccuracy", value)}
            />
            <InputField
              label="Field Team"
              value={form.fieldTeam}
              placeholder="Example: Team Alpha"
              onChange={(value) => onChange("fieldTeam", value)}
            />
            <InputField
              label="Access Route"
              value={form.accessRoute}
              placeholder="Example: RN13 to Rwimiyaga field road"
              onChange={(value) => onChange("accessRoute", value)}
            />
            <InputField
              label="Last Surveyed"
              type="date"
              value={form.lastSurveyed}
              onChange={(value) => onChange("lastSurveyed", value)}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(event) =>
                  onChange("status", event.target.value as StudyAreaStatus)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
              >
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="under_review">Under Review</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(event) => onChange("notes", event.target.value)}
                rows={4}
                placeholder="Write field notes, map remarks, access notes, or survey observations..."
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
            Save Study Area
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