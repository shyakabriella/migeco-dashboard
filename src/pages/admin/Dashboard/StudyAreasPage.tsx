import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent, ReactNode } from "react";
import {
  Camera,
  Compass,
  Crosshair,
  Filter,
  ImagePlus,
  Layers,
  Loader2,
  LocateFixed,
  Map,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RefreshCcw,
  Search,
  UploadCloud,
  X,
} from "lucide-react";

import AdminSidebar from "../../admin/AdminSidebar";

import {
  API_BASE_URL,
  createStudyArea,
  getStudyAreaSummary,
  getStudyAreas,
} from "../../../services/dmsApi";

import type {
  CreateStudyAreaPayload,
  StudyAreaApiPhoto,
  StudyAreaApiRecord,
  StudyAreaSummary,
} from "../../../services/dmsApi";

type StudyAreaStatus = "active" | "planned" | "under_review" | "archived";

type StudyAreaPhoto = {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  capturedAt?: string;
  caption?: string;
  file?: File;
};

type StudyArea = {
  id: number | string;
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
  description: string;
  photos: StudyAreaPhoto[];
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
  description: string;
  photos: StudyAreaPhoto[];
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

type MapPreset = {
  label: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
};

type MapCoordinate = {
  latitude: number;
  longitude: number;
};

const TILE_SIZE = 256;
const DEFAULT_ZOOM = 12;
const DEFAULT_COORDINATE: MapCoordinate = {
  latitude: -1.9441,
  longitude: 30.0619,
};

const mapPresets: MapPreset[] = [
  {
    label: "Kigali",
    province: "Kigali City",
    district: "Nyarugenge",
    latitude: -1.9441,
    longitude: 30.0619,
  },
  {
    label: "Musanze",
    province: "Northern Province",
    district: "Musanze",
    latitude: -1.4998,
    longitude: 29.6349,
  },
  {
    label: "Rubavu",
    province: "Western Province",
    district: "Rubavu",
    latitude: -1.6792,
    longitude: 29.2632,
  },
  {
    label: "Huye",
    province: "Southern Province",
    district: "Huye",
    latitude: -2.5967,
    longitude: 29.7394,
  },
  {
    label: "Nyagatare",
    province: "Eastern Province",
    district: "Nyagatare",
    latitude: -1.3088,
    longitude: 30.3344,
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
  description: "",
  photos: [],
  mapTitle: "",
  mapType: "",
  mapReference: "",
  mapScale: "",
  coordinateSystem: "WGS 84",
  locationAccuracy: "Map selected",
  accessRoute: "",
  fieldTeam: "",
  status: "planned",
  lastSurveyed: "",
  notes: "",
};

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function toNumber(value?: string | number | null): number | null {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number(String(value).replace(/,/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatCoordinate(value?: string | number | null): string {
  const parsed = toNumber(value);

  if (parsed === null) return "-";

  return parsed.toFixed(6);
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

function latLngToWorldPixel(
  latitude: number,
  longitude: number,
  zoom: number,
): { x: number; y: number } {
  const sinLatitude = Math.sin((clamp(latitude, -85.05112878, 85.05112878) * Math.PI) / 180);
  const scale = TILE_SIZE * 2 ** zoom;

  return {
    x: ((longitude + 180) / 360) * scale,
    y:
      (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) *
      scale,
  };
}

function worldPixelToLatLng(x: number, y: number, zoom: number): MapCoordinate {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const latitude = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

  return {
    latitude: clamp(latitude, -85.05112878, 85.05112878),
    longitude: clamp(longitude, -180, 180),
  };
}

function getMapTiles(
  latitude: number,
  longitude: number,
  zoom: number,
  width = 920,
  height = 340,
): Array<{ key: string; url: string; left: number; top: number }> {
  const center = latLngToWorldPixel(latitude, longitude, zoom);
  const leftWorld = center.x - width / 2;
  const topWorld = center.y - height / 2;
  const startX = Math.floor(leftWorld / TILE_SIZE) - 1;
  const startY = Math.floor(topWorld / TILE_SIZE) - 1;
  const endX = Math.floor((leftWorld + width) / TILE_SIZE) + 1;
  const endY = Math.floor((topWorld + height) / TILE_SIZE) + 1;
  const maxTile = 2 ** zoom;
  const tiles: Array<{ key: string; url: string; left: number; top: number }> = [];

  for (let x = startX; x <= endX; x += 1) {
    for (let y = startY; y <= endY; y += 1) {
      if (y < 0 || y >= maxTile) continue;

      const wrappedX = ((x % maxTile) + maxTile) % maxTile;

      tiles.push({
        key: `${zoom}-${x}-${y}`,
        url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
        left: x * TILE_SIZE - leftWorld,
        top: y * TILE_SIZE - topWorld,
      });
    }
  }

  return tiles;
}

function getPhotoCount(studyAreas: StudyArea[]): number {
  return studyAreas.reduce((total, area) => total + area.photos.length, 0);
}

function readFileAsDataUrl(file: File): Promise<StudyAreaPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        url: String(reader.result || ""),
        size: file.size,
        type: file.type,
        capturedAt: new Date().toISOString(),
        file,
      });
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getApiAssetUrl(url?: string | null): string {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "");

  if (url.startsWith("/")) {
    return `${apiOrigin}${url}`;
  }

  return `${apiOrigin}/${url.replace(/^\/+/, "")}`;
}

function normalizeApiPhoto(photo: StudyAreaApiPhoto): StudyAreaPhoto {
  return {
    id: String(photo.id),
    name:
      photo.original_file_name ||
      photo.stored_file_name ||
      photo.caption ||
      `Study area photo ${photo.id}`,
    url: getApiAssetUrl(photo.url || photo.file_path),
    size: toNumber(photo.file_size) || undefined,
    type: photo.mime_type || undefined,
    capturedAt: photo.captured_at || photo.created_at || undefined,
    caption: photo.caption || undefined,
  };
}

function normalizeApiStudyArea(row: StudyAreaApiRecord): StudyArea {
  const photos = Array.isArray(row.photos)
    ? row.photos.map(normalizeApiPhoto)
    : [];

  return {
    id: row.id,
    name: row.name || "Untitled study area",
    code: row.code || `SA-${row.id}`,
    project: row.project?.name || row.project_name || "General Repository",
    province: row.province || "-",
    district: row.district || row.location_name || "-",
    sector: row.sector || "-",
    cell: row.cell || "-",
    village: row.village || "-",
    latitude: formatCoordinate(row.latitude),
    longitude: formatCoordinate(row.longitude),
    elevation: row.elevation ? String(row.elevation) : "-",
    areaSize: row.area_size || "-",
    description: row.description || "No description added.",
    photos,
    mapTitle: row.map_title || `${row.name || "Study area"} Location Map`,
    mapType: row.map_type || "Study area location map",
    mapReference: row.map_reference || "-",
    mapScale: row.map_scale || "-",
    coordinateSystem: row.coordinate_system || "WGS 84",
    locationAccuracy: row.location_accuracy || "Not verified",
    accessRoute: row.access_route || "-",
    fieldTeam: row.field_team || "-",
    status: (row.status as StudyAreaStatus) || "planned",
    lastSurveyed: row.last_surveyed || "-",
    notes: row.notes || "No field notes added.",
  };
}

function buildStudyAreaPayload(form: StudyAreaFormState): CreateStudyAreaPayload {
  return {
    name: form.name.trim(),
    code: form.code.trim() || null,
    project_name: form.project.trim() || "General Repository",
    description: form.description.trim(),
    province: form.province.trim() || null,
    district: form.district.trim() || null,
    sector: form.sector.trim() || null,
    cell: form.cell.trim() || null,
    village: form.village.trim() || null,
    location_name: [
      form.village.trim(),
      form.cell.trim(),
      form.sector.trim(),
      form.district.trim(),
      form.province.trim(),
    ]
      .filter(Boolean)
      .join(", ") || null,
    latitude: form.latitude.trim() || null,
    longitude: form.longitude.trim() || null,
    elevation: form.elevation.trim() || null,
    area_size: form.areaSize.trim() || null,
    map_title: form.mapTitle.trim() || `${form.name.trim()} Location Map`,
    map_type: form.mapType.trim() || "Study area location map",
    map_reference: form.mapReference.trim() || null,
    map_scale: form.mapScale.trim() || null,
    coordinate_system: form.coordinateSystem.trim() || "WGS 84",
    location_accuracy: form.locationAccuracy.trim() || "Map selected",
    access_route: form.accessRoute.trim() || null,
    field_team: form.fieldTeam.trim() || null,
    status: form.status,
    last_surveyed: form.lastSurveyed || null,
    notes: form.notes.trim() || null,
    metadata: {
      source: "study_area_management_page",
      supervisor_requirement: "Area name, GPS coordinates/location, description, photos",
    },
    photos: form.photos
      .map((photo) => photo.file)
      .filter((file): file is File => Boolean(file)),
    photo_captions: form.photos.map((photo) => photo.caption || photo.name),
  };
}

function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The study area action could not be completed.";
}

export default function StudyAreasPage() {
  const [studyAreas, setStudyAreas] = useState<StudyArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<StudyArea | null>(null);
  const [summary, setSummary] = useState<StudyAreaSummary | null>(null);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState<StudyAreaFormState>(emptyForm);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [pageError, setPageError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  async function loadStudyAreas(): Promise<void> {
    try {
      setLoading(true);
      setPageError("");

      const filters = {
        search: search.trim() || undefined,
        status: status || undefined,
        per_page: 200,
      };

      const [rows, summaryData] = await Promise.all([
        getStudyAreas(filters),
        getStudyAreaSummary().catch(() => null),
      ]);

      const normalizedRows = rows.map(normalizeApiStudyArea);

      setStudyAreas(normalizedRows);
      setSummary(summaryData);
      setSelectedArea((current) => {
        if (current) {
          const existing = normalizedRows.find(
            (area) => String(area.id) === String(current.id),
          );

          if (existing) return existing;
        }

        return normalizedRows[0] || null;
      });
    } catch (error) {
      setPageError(getApiErrorMessage(error));
      setStudyAreas([]);
      setSelectedArea(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadStudyAreas();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search, status]);

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
          area.description,
          area.province,
          area.district,
          area.sector,
          area.cell,
          area.village,
          area.latitude,
          area.longitude,
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

  function handleFormChange<K extends keyof StudyAreaFormState>(
    field: K,
    value: StudyAreaFormState[K],
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

    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!form.district.trim()) {
      setError("District or nearest location is required.");
      return;
    }

    if (!form.latitude.trim() || !form.longitude.trim()) {
      setError("Select GPS coordinates from the map before saving.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setPageError("");
      setSuccessMessage("");

      const createdArea = await createStudyArea(buildStudyAreaPayload(form));
      const normalizedArea = normalizeApiStudyArea(createdArea);

      setStudyAreas((current) => [
        normalizedArea,
        ...current.filter((area) => String(area.id) !== String(normalizedArea.id)),
      ]);
      setSelectedArea(normalizedArea);
      setSuccessMessage("Study area saved successfully.");
      setIsModalOpen(false);
      setForm(emptyForm);
      await loadStudyAreas();
    } catch (error) {
      setError(getApiErrorMessage(error));
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
              <span className="text-blue-600">Study Area Management</span>
            </div>

            <h1 className="mt-1 truncate text-lg font-bold text-slate-900 lg:text-xl">
              Study Area Management
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("");
                setSuccessMessage("");
                void loadStudyAreas();
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
              <span className="hidden sm:inline">New Study Area</span>
            </button>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 overflow-hidden p-3 lg:p-4">
          <div className="mx-auto grid min-h-0 w-full max-w-[1680px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
              <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-4">
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Study Area Management
                  </p>
                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    Register each field area with an area name, GPS coordinates,
                    physical location, description, and supporting photos.
                  </p>
                </div>

                {pageError && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {pageError}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {successMessage}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <SummaryCard
                    label="Study Areas"
                    value={String(summary?.total ?? studyAreas.length)}
                    icon={<Map size={16} />}
                  />
                  <SummaryCard
                    label="GPS Verified"
                    value={String(
                      summary?.gps_verified ??
                        studyAreas.filter((area) => area.locationAccuracy !== "-")
                          .length,
                    )}
                    icon={<Crosshair size={16} />}
                    tone="success"
                  />
                  <SummaryCard
                    label="Photos"
                    value={String(summary?.photos ?? getPhotoCount(studyAreas))}
                    icon={<Camera size={16} />}
                    tone="info"
                  />
                  <SummaryCard
                    label="Under Review"
                    value={String(
                      summary?.under_review ??
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
                      placeholder="Search area name, GPS, district, description, project..."
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
                  <table className="w-full min-w-[1080px] text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Area Name</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">GPS / Location</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Photos</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center">
                            <Loader2
                              size={28}
                              className="mx-auto animate-spin text-blue-600"
                            />
                            <p className="mt-3 font-semibold text-slate-700">
                              Loading study areas
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Retrieving saved records from the backend...
                            </p>
                          </td>
                        </tr>
                      ) : filteredStudyAreas.length === 0 ? (
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
                              className={cn(
                                "cursor-pointer border-b border-slate-100 transition hover:bg-slate-50",
                                active ? "bg-blue-50/80" : "bg-white",
                              )}
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
                                <p className="max-w-[230px] truncate">
                                  {area.district}, {area.sector}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {formatCoordinate(area.latitude)}, {formatCoordinate(area.longitude)}
                                </p>
                              </td>

                              <td className="px-4 py-3 text-xs text-slate-500">
                                <p className="line-clamp-2 max-w-[300px] leading-5">
                                  {area.description}
                                </p>
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Camera size={14} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-700">
                                      {area.photos.length} photo{area.photos.length === 1 ? "" : "s"}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      Field evidence
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    "rounded-full border px-2.5 py-1 text-xs font-medium",
                                    getStatusClass(area.status),
                                  )}
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
    <div className={cn("rounded-xl border p-3", toneClass)}>
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
            Select a row to view map, location, description, and photos.
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
            <p className="mt-1 text-xs text-slate-500">
              {area.code} · {area.district}
            </p>
          </div>

          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
              getStatusClass(area.status),
            )}
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
                GPS Workspace
              </p>
              <h3 className="mt-1 truncate text-sm font-bold text-slate-900">
                {area.mapTitle}
              </h3>
            </div>

            <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              {area.locationAccuracy}
            </span>
          </div>

          <MapPreview
            latitude={toNumber(area.latitude) ?? DEFAULT_COORDINATE.latitude}
            longitude={toNumber(area.longitude) ?? DEFAULT_COORDINATE.longitude}
            zoom={DEFAULT_ZOOM}
          />

          <div className="border-t border-slate-100 p-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MapInfo label="Latitude" value={formatCoordinate(area.latitude)} />
              <MapInfo label="Longitude" value={formatCoordinate(area.longitude)} />
              <MapInfo label="Elevation" value={area.elevation} />
              <MapInfo label="Coordinate System" value={area.coordinateSystem} />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <DetailsBlock title="Description">
            <p className="text-xs leading-5 text-slate-600">
              {area.description || "No description added."}
            </p>
          </DetailsBlock>

          <DetailsBlock title="Photos">
            <PhotoGallery photos={area.photos} />
          </DetailsBlock>

          <DetailsBlock title="Location Fields">
            <DetailRow label="Province" value={area.province} />
            <DetailRow label="District" value={area.district} />
            <DetailRow label="Sector" value={area.sector} />
            <DetailRow label="Cell" value={area.cell} />
            <DetailRow label="Village" value={area.village} />
            <DetailRow label="Accuracy" value={area.locationAccuracy} />
          </DetailsBlock>

          <DetailsBlock title="Map Details">
            <DetailRow label="Map Title" value={area.mapTitle} />
            <DetailRow label="Map Type" value={area.mapType} />
            <DetailRow label="Map Reference" value={area.mapReference} />
            <DetailRow label="Scale" value={area.mapScale} />
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
              Field Notes
            </p>
            <p className="text-xs leading-5 text-slate-600">{area.notes}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MapPreview({
  latitude,
  longitude,
  zoom,
}: {
  latitude: number;
  longitude: number;
  zoom: number;
}) {
  const tiles = useMemo(
    () => getMapTiles(latitude, longitude, zoom, 900, 330),
    [latitude, longitude, zoom],
  );

  return (
    <div className="relative h-[310px] overflow-hidden bg-slate-100">
      <div className="absolute inset-0 left-1/2 top-1/2 h-[330px] w-[900px] -translate-x-1/2 -translate-y-1/2">
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            draggable={false}
            className="absolute h-64 w-64 select-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_45%,rgba(15,23,42,0.12)_100%)]" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <div className="relative flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-lg shadow-blue-300">
            <MapPin size={18} />
          </div>
          <div className="h-3 w-3 rotate-45 bg-blue-600" />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Crosshair size={16} />
            <p className="text-sm font-semibold">Primary GPS Point</p>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            Zoom {zoom}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <MapInfo label="Latitude" value={latitude.toFixed(6)} />
          <MapInfo label="Longitude" value={longitude.toFixed(6)} />
        </div>
      </div>
    </div>
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
      <span className="max-w-[240px] truncate text-right text-xs font-medium text-slate-900">
        {value || "-"}
      </span>
    </div>
  );
}

function PhotoGallery({ photos }: { photos: StudyAreaPhoto[] }) {
  if (photos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
        <Camera size={24} className="mx-auto text-slate-400" />
        <p className="mt-2 text-xs font-semibold text-slate-600">
          No photos attached
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Add field photos when creating a study area.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
        >
          <img
            src={photo.url}
            alt={photo.name}
            className="h-28 w-full object-cover"
          />
          <div className="px-2 py-2">
            <p className="truncate text-[11px] font-semibold text-slate-700">
              {photo.name}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              {formatFileSize(photo.size)}
            </p>
          </div>
        </div>
      ))}
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
  onChange: <K extends keyof StudyAreaFormState>(
    field: K,
    value: StudyAreaFormState[K],
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
              Create Study Area
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add area name, GPS location, description, and field photos.
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

          <div className="space-y-6">
            <FormSection
              title="Core Study Area Information"
              description="The main information requested by the supervisor."
              icon={<Map size={18} />}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Area Name"
                  value={form.name}
                  required
                  placeholder="Example: Nyagatare Granite Belt"
                  onChange={(value) => onChange("name", value)}
                />
                <InputField
                  label="Area Code"
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
                  label="Area Size"
                  value={form.areaSize}
                  placeholder="Example: 42.5 km²"
                  onChange={(value) => onChange("areaSize", value)}
                />
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      onChange("description", event.target.value)
                    }
                    rows={4}
                    placeholder="Describe the study area, purpose, field condition, access, geology, samples, and any important observations..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="GPS Coordinates & Location"
              description="Click the map or use current location to fill latitude and longitude automatically."
              icon={<Crosshair size={18} />}
            >
              <MapPicker form={form} onChange={onChange} />

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <InputField
                  label="Province"
                  value={form.province}
                  placeholder="Province"
                  onChange={(value) => onChange("province", value)}
                />
                <InputField
                  label="District / Nearest Location"
                  value={form.district}
                  required
                  placeholder="District or nearest site"
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
                  label="Coordinate System"
                  value={form.coordinateSystem}
                  placeholder="Example: WGS 84"
                  onChange={(value) => onChange("coordinateSystem", value)}
                />
              </div>
            </FormSection>

            <FormSection
              title="Photos"
              description="Attach field photos, location photos, sample point photos, or access route photos."
              icon={<Camera size={18} />}
            >
              <PhotoUploadSection
                photos={form.photos}
                onChange={(photos) => onChange("photos", photos)}
              />
            </FormSection>

            <FormSection
              title="Map & Field Metadata"
              description="Optional information used for maps, field teams, and reporting."
              icon={<Layers size={18} />}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    Field Notes
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
            Save Study Area
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
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function MapPicker({
  form,
  onChange,
}: {
  form: StudyAreaFormState;
  onChange: <K extends keyof StudyAreaFormState>(
    field: K,
    value: StudyAreaFormState[K],
  ) => void;
}) {
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>("");

  const latitude = toNumber(form.latitude) ?? DEFAULT_COORDINATE.latitude;
  const longitude = toNumber(form.longitude) ?? DEFAULT_COORDINATE.longitude;
  const tiles = useMemo(
    () => getMapTiles(latitude, longitude, zoom, 980, 360),
    [latitude, longitude, zoom],
  );

  function setCoordinates(
    coordinate: MapCoordinate,
    accuracy: string,
    extra?: Partial<StudyAreaFormState>,
  ): void {
    onChange("latitude", coordinate.latitude.toFixed(6));
    onChange("longitude", coordinate.longitude.toFixed(6));
    onChange("locationAccuracy", accuracy);
    onChange("coordinateSystem", form.coordinateSystem || "WGS 84");

    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        onChange(
          key as keyof StudyAreaFormState,
          value as StudyAreaFormState[keyof StudyAreaFormState],
        );
      });
    }
  }

  function handleMapClick(event: MouseEvent<HTMLDivElement>): void {
    const rect = event.currentTarget.getBoundingClientRect();
    const center = latLngToWorldPixel(latitude, longitude, zoom);
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    const next = worldPixelToLatLng(center.x + dx, center.y + dy, zoom);

    setCoordinates(next, "Map selected");
    setLocationError("");
  }

  function useCurrentLocation(): void {
    if (!navigator.geolocation) {
      setLocationError("This browser does not support GPS location capture.");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          position.coords.accuracy
            ? `GPS captured ±${Math.round(position.coords.accuracy)} m`
            : "GPS captured",
        );
        setLocating(false);
      },
      () => {
        setLocationError(
          "Could not access current location. Use the map click or quick locations instead.",
        );
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Location Map Picker</p>
          <p className="mt-1 text-xs text-slate-500">
            Click on the map to set the study area GPS point.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {locating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LocateFixed size={14} />
            )}
            Use current location
          </button>

          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setZoom((value) => clamp(value - 1, 5, 18))}
              className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50"
              aria-label="Zoom out"
            >
              <Minus size={14} />
            </button>
            <div className="flex h-9 min-w-10 items-center justify-center border-x border-slate-200 px-2 text-xs font-bold text-slate-600">
              {zoom}
            </div>
            <button
              type="button"
              onClick={() => setZoom((value) => clamp(value + 1, 5, 18))}
              className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50"
              aria-label="Zoom in"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={handleMapClick}
        className="relative h-[360px] cursor-crosshair overflow-hidden bg-slate-100 outline-none"
      >
        <div className="absolute inset-0 left-1/2 top-1/2 h-[360px] w-[980px] -translate-x-1/2 -translate-y-1/2">
          {tiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              draggable={false}
              className="absolute h-64 w-64 select-none"
              style={{ left: tile.left, top: tile.top }}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <div className="relative flex flex-col items-center">
            <span className="absolute top-4 h-14 w-14 rounded-full bg-blue-600/20" />
            <div className="z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-lg shadow-blue-300">
              <MapPin size={18} />
            </div>
            <div className="z-10 h-3 w-3 rotate-45 bg-blue-600" />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            <MapInfo label="Latitude" value={latitude.toFixed(6)} />
            <MapInfo label="Longitude" value={longitude.toFixed(6)} />
            <MapInfo label="Accuracy" value={form.locationAccuracy || "Map selected"} />
            <MapInfo label="Coordinate System" value={form.coordinateSystem || "WGS 84"} />
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {mapPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setCoordinates(
                  {
                    latitude: preset.latitude,
                    longitude: preset.longitude,
                  },
                  "Preset coordinate",
                  {
                    province: preset.province,
                    district: preset.district,
                  },
                );
                setLocationError("");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Navigation size={12} />
              {preset.label}
            </button>
          ))}
        </div>

        {locationError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {locationError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Latitude"
            value={form.latitude}
            required
            readOnly
            placeholder="Click map to fill latitude"
            onChange={(value) => onChange("latitude", value)}
          />
          <InputField
            label="Longitude"
            value={form.longitude}
            required
            readOnly
            placeholder="Click map to fill longitude"
            onChange={(value) => onChange("longitude", value)}
          />
        </div>
      </div>
    </div>
  );
}

function PhotoUploadSection({
  photos,
  onChange,
}: {
  photos: StudyAreaPhoto[];
  onChange: (photos: StudyAreaPhoto[]) => void;
}) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleFiles(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setError("Please upload image files only.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");

      const uploadedPhotos = await Promise.all(imageFiles.map(readFileAsDataUrl));

      onChange([...uploadedPhotos, ...photos]);
      event.target.value = "";
    } catch {
      setError("Some photos could not be loaded. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(photoId: string): void {
    onChange(photos.filter((photo) => photo.id !== photoId));
  }

  return (
    <div className="space-y-4">
      <label className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-5 text-center transition hover:bg-blue-100">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
          {uploading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <ImagePlus size={22} />
          )}
        </div>
        <p className="mt-3 text-sm font-bold text-blue-900">
          Upload study area photos
        </p>
        <p className="mt-1 max-w-md text-xs leading-5 text-blue-700">
          Add field evidence such as site overview, GPS point, access route,
          outcrop, sampling point, or lab sample photos.
        </p>
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
          <UploadCloud size={13} />
          Select one or more images
        </p>
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="h-36 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow transition hover:bg-red-50 group-hover:opacity-100"
                  aria-label={`Remove ${photo.name}`}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {photo.name}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {formatFileSize(photo.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          No photos selected yet.
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
  readOnly = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
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
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white",
          readOnly && "cursor-not-allowed bg-slate-100 text-slate-500",
        )}
      />
    </div>
  );
}