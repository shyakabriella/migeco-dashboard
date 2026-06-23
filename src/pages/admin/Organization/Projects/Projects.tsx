import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ElementType,
  FormEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Archive,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  FlaskConical,
  FolderKanban,
  FolderOpen,
  Loader2,
  MapPin,
  Mountain,
  PenTool,
  Plus,
  Puzzle,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import AdminSidebar from "../../AdminSidebar";

import {
  createProject,
  deleteProject,
  getCurrentUser,
  getDocuments,
  getProjectRecords,
  getProjects,
  updateProject,
} from "../../../../services/dmsApi";

import type {
  DmsDocument,
  ProjectRecordsResponse,
  UserSummary,
} from "../../../../services/dmsApi";

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

type ProjectRecord = {
  id: number | string;
  name: string;
  code?: string | null;
  description?: string | null;
  location_name?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  project_type?: string | null;
  status?: string | null;
  security_level?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  creator?: {
    id?: number | string;
    name?: string;
    email?: string;
  } | null;
  documents_count?: number;
  document_count?: number;
  related_counts?: ProjectRelatedCounts | null;
  documents?: unknown[];
  metadata?: Record<string, unknown> | null;
};

type ProjectRelatedCounts = {
  documents?: number | string | null;
  active_documents?: number | string | null;
  archived_documents?: number | string | null;
  study_area_records?: number | string | null;
  sample_records?: number | string | null;
  laboratory_records?: number | string | null;
  geological_records?: number | string | null;
  security_alerts?: number | string | null;
};

type ProjectFormState = {
  name: string;
  code: string;
  description: string;
  location_name: string;
  latitude: string;
  longitude: string;
  project_type:
    | "geological_survey"
    | "construction"
    | "technical_study"
    | "mining"
    | "administration"
    | "other";
  status: "planned" | "active" | "completed" | "archived";
  security_level: "public" | "internal" | "confidential" | "restricted";
  start_date: string;
  end_date: string;
};

type SelectOption = {
  label: string;
  value: string;
};

type RelatedRecordSummary = {
  documents: number;
  activeDocuments: number;
  archivedDocuments: number;
  studyAreas: number;
  maps: number;
  samples: number;
  laboratory: number;
  geologicalRecords: number;
  securityAlerts: number;
  lastActivity: string | null;
};

type RelatedRecordTile = {
  key: keyof RelatedRecordSummary;
  label: string;
  helper: string;
  icon: ElementType;
  path: (project: ProjectRecord) => string;
};

const PAGE_SIZE = 6;

const emptyForm: ProjectFormState = {
  name: "",
  code: "",
  description: "",
  location_name: "",
  latitude: "",
  longitude: "",
  project_type: "other",
  status: "planned",
  security_level: "internal",
  start_date: "",
  end_date: "",
};

const statusOptions: SelectOption[] = [
  { label: "All statuses", value: "" },
  { label: "Planned", value: "planned" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

const projectTypeOptions: SelectOption[] = [
  { label: "All project types", value: "" },
  { label: "Geological Survey", value: "geological_survey" },
  { label: "Construction", value: "construction" },
  { label: "Technical Study", value: "technical_study" },
  { label: "Mining", value: "mining" },
  { label: "Administration", value: "administration" },
  { label: "Other", value: "other" },
];

const securityOptions: SelectOption[] = [
  { label: "All security levels", value: "" },
  { label: "Public", value: "public" },
  { label: "Internal", value: "internal" },
  { label: "Confidential", value: "confidential" },
  { label: "Restricted", value: "restricted" },
];

const relatedRecordTiles: RelatedRecordTile[] = [
  {
    key: "documents",
    label: "Documents",
    helper: "Reports, drawings, files",
    icon: FileText,
    path: (project) => `/alldocuments?project_id=${project.id}`,
  },
  {
    key: "studyAreas",
    label: "Study Areas",
    helper: "Locations and field areas",
    icon: MapPin,
    path: (project) => `/study-areas?project_id=${project.id}`,
  },
  {
    key: "samples",
    label: "Samples",
    helper: "Field and rock samples",
    icon: FlaskConical,
    path: (project) => `/samples-laboratory?project_id=${project.id}`,
  },
  {
    key: "laboratory",
    label: "Laboratory",
    helper: "Lab results and assays",
    icon: Activity,
    path: (project) => `/laboratory?project_id=${project.id}`,
  },
  {
    key: "geologicalRecords",
    label: "Geological",
    helper: "Structured geo records",
    icon: Mountain,
    path: (project) => `/geological-records?project_id=${project.id}`,
  },
  {
    key: "archivedDocuments",
    label: "Archive",
    helper: "Archived project records",
    icon: Archive,
    path: (project) => `/archive?project_id=${project.id}`,
  },
];

type MapCoordinate = {
  latitude: number;
  longitude: number;
};

type LocationPreset = MapCoordinate & {
  label: string;
};

type MapDragState = {
  startClientX: number;
  startClientY: number;
  startCenterPixel: PixelPoint;
  moved: boolean;
};

type PixelPoint = {
  x: number;
  y: number;
};

type TileRenderItem = {
  key: string;
  url: string;
  left: number;
  top: number;
};

const TILE_SIZE = 256;
const DEFAULT_MAP_ZOOM = 9;
const MIN_MAP_ZOOM = 6;
const MAX_MAP_ZOOM = 18;

const DEFAULT_MAP_CENTER: MapCoordinate = {
  latitude: -1.9403,
  longitude: 29.8739,
};

const LOCATION_PRESETS: LocationPreset[] = [
  { label: "Kigali", latitude: -1.9441, longitude: 30.0619 },
  { label: "Musanze", latitude: -1.4998, longitude: 29.6347 },
  { label: "Rubavu", latitude: -1.6792, longitude: 29.2611 },
  { label: "Huye", latitude: -2.5967, longitude: 29.7394 },
  { label: "Nyagatare", latitude: -1.2915, longitude: 30.3271 },
];

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseCoordinate(value: string): number | null {
  if (!value.trim()) return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

function normalizeLongitude(longitude: number): number {
  let normalized = longitude;

  while (normalized < -180) normalized += 360;
  while (normalized > 180) normalized -= 360;

  return normalized;
}

function latLngToWorldPixel(
  coordinate: MapCoordinate,
  zoom: number
): PixelPoint {
  const scale = TILE_SIZE * 2 ** zoom;
  const latitude = clampNumber(coordinate.latitude, -85.05112878, 85.05112878);
  const longitude = normalizeLongitude(coordinate.longitude);
  const sinLatitude = Math.sin((latitude * Math.PI) / 180);

  return {
    x: ((longitude + 180) / 360) * scale,
    y:
      (0.5 -
        Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) *
      scale,
  };
}

function worldPixelToLatLng(pixel: PixelPoint, zoom: number): MapCoordinate {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = normalizeLongitude((pixel.x / scale) * 360 - 180);
  const n = Math.PI - (2 * Math.PI * pixel.y) / scale;
  const latitude = (180 / Math.PI) * Math.atan(Math.sinh(n));

  return {
    latitude: clampNumber(latitude, -85.05112878, 85.05112878),
    longitude,
  };
}

function getSafeSelectedCoordinate(
  latitude: string,
  longitude: string
): MapCoordinate | null {
  const parsedLatitude = parseCoordinate(latitude);
  const parsedLongitude = parseCoordinate(longitude);

  if (parsedLatitude === null || parsedLongitude === null) {
    return null;
  }

  if (
    parsedLatitude < -90 ||
    parsedLatitude > 90 ||
    parsedLongitude < -180 ||
    parsedLongitude > 180
  ) {
    return null;
  }

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude,
  };
}

function buildMapTiles(
  center: MapCoordinate,
  zoom: number,
  size: { width: number; height: number }
): {
  topLeft: PixelPoint;
  tiles: TileRenderItem[];
} {
  const centerPixel = latLngToWorldPixel(center, zoom);
  const topLeft = {
    x: centerPixel.x - size.width / 2,
    y: centerPixel.y - size.height / 2,
  };

  const totalTiles = 2 ** zoom;
  const startTileX = Math.floor(topLeft.x / TILE_SIZE) - 1;
  const endTileX = Math.floor((topLeft.x + size.width) / TILE_SIZE) + 1;
  const startTileY = Math.floor(topLeft.y / TILE_SIZE) - 1;
  const endTileY = Math.floor((topLeft.y + size.height) / TILE_SIZE) + 1;
  const tiles: TileRenderItem[] = [];

  for (let tileX = startTileX; tileX <= endTileX; tileX += 1) {
    for (let tileY = startTileY; tileY <= endTileY; tileY += 1) {
      if (tileY < 0 || tileY >= totalTiles) continue;

      const wrappedTileX = ((tileX % totalTiles) + totalTiles) % totalTiles;

      tiles.push({
        key: `${zoom}-${tileX}-${tileY}`,
        url: `https://tile.openstreetmap.org/${zoom}/${wrappedTileX}/${tileY}.png`,
        left: tileX * TILE_SIZE - topLeft.x,
        top: tileY * TILE_SIZE - topLeft.y,
      });
    }
  }

  return {
    topLeft,
    tiles,
  };
}

function LocationMapPicker({
  latitude,
  longitude,
  onSelect,
  onClear,
}: {
  latitude: string;
  longitude: string;
  onSelect: (latitude: number, longitude: number, label?: string) => void;
  onClear: () => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<MapDragState | null>(null);
  const selectedCoordinate = getSafeSelectedCoordinate(latitude, longitude);

  const [center, setCenter] = useState<MapCoordinate>(
    selectedCoordinate || DEFAULT_MAP_CENTER
  );
  const [zoom, setZoom] = useState<number>(DEFAULT_MAP_ZOOM);
  const [mapSize, setMapSize] = useState({
    width: 720,
    height: 320,
  });
  const [locationMessage, setLocationMessage] = useState<string>("");
  const [isLocating, setIsLocating] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCoordinate) {
      setCenter(selectedCoordinate);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const mapElement = mapRef.current;

    if (!mapElement) return undefined;

    function updateSize(): void {
      const rect = mapElement.getBoundingClientRect();

      setMapSize({
        width: Math.max(280, rect.width),
        height: Math.max(260, rect.height),
      });
    }

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);

      return () => window.removeEventListener("resize", updateSize);
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(mapElement);

    return () => observer.disconnect();
  }, []);

  const mapLayout = useMemo(
    () => buildMapTiles(center, zoom, mapSize),
    [center, mapSize, zoom]
  );

  const selectedPixel = useMemo(() => {
    if (!selectedCoordinate) return null;

    const worldPixel = latLngToWorldPixel(selectedCoordinate, zoom);

    return {
      x: worldPixel.x - mapLayout.topLeft.x,
      y: worldPixel.y - mapLayout.topLeft.y,
    };
  }, [mapLayout.topLeft.x, mapLayout.topLeft.y, selectedCoordinate, zoom]);

  function selectCoordinate(
    coordinate: MapCoordinate,
    label?: string
  ): void {
    const safeCoordinate = {
      latitude: clampNumber(coordinate.latitude, -90, 90),
      longitude: normalizeLongitude(coordinate.longitude),
    };

    setCenter(safeCoordinate);
    setLocationMessage(label ? `${label} selected.` : "Location selected from map.");
    onSelect(safeCoordinate.latitude, safeCoordinate.longitude, label);
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>
  ): void {
    const centerPixel = latLngToWorldPixel(center, zoom);

    dragRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCenterPixel: centerPixel,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>
  ): void {
    const drag = dragRef.current;

    if (!drag) return;

    const deltaX = event.clientX - drag.startClientX;
    const deltaY = event.clientY - drag.startClientY;

    if (Math.abs(deltaX) + Math.abs(deltaY) > 4) {
      drag.moved = true;
    }

    const nextCenterPixel = {
      x: drag.startCenterPixel.x - deltaX,
      y: drag.startCenterPixel.y - deltaY,
    };

    setCenter(worldPixelToLatLng(nextCenterPixel, zoom));
  }

  function handlePointerUp(
    event: ReactPointerEvent<HTMLDivElement>
  ): void {
    const drag = dragRef.current;
    dragRef.current = null;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer may already be released by the browser.
    }

    if (drag?.moved) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const clickedPixel = {
      x: mapLayout.topLeft.x + event.clientX - rect.left,
      y: mapLayout.topLeft.y + event.clientY - rect.top,
    };

    selectCoordinate(worldPixelToLatLng(clickedPixel, zoom));
  }

  function handlePointerCancel(): void {
    dragRef.current = null;
  }

  function handleZoomIn(): void {
    setZoom((current) => Math.min(MAX_MAP_ZOOM, current + 1));
  }

  function handleZoomOut(): void {
    setZoom((current) => Math.max(MIN_MAP_ZOOM, current - 1));
  }

  function handleUseBrowserLocation(): void {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage("Browser location is not supported. Click the map instead.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        selectCoordinate(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          "Current browser location"
        );
      },
      () => {
        setIsLocating(false);
        setLocationMessage(
          "Could not read browser location. Click the map or choose a preset."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  function handleClearLocation(): void {
    setCenter(DEFAULT_MAP_CENTER);
    setLocationMessage("Location cleared.");
    onClear();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <MapPin size={17} />
            </div>
            <div>
              <p className="text-sm font-bold">Select project location on map</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Click a point to set latitude and longitude automatically. Drag the map to move it.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleUseBrowserLocation}
            disabled={isLocating}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLocating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <MapPin size={14} />
            )}
            Use current location
          </button>

          <button
            type="button"
            onClick={handleClearLocation}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {LOCATION_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => selectCoordinate(preset, preset.label)}
            className="inline-flex h-8 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div
        ref={mapRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="relative mt-4 h-[320px] select-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-inner touch-none cursor-crosshair"
      >
        {mapLayout.tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            draggable={false}
            className="pointer-events-none absolute h-64 w-64 select-none"
            style={{
              left: tile.left,
              top: tile.top,
            }}
          />
        ))}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-slate-900/10" />

        {selectedPixel &&
          selectedPixel.x >= -30 &&
          selectedPixel.x <= mapSize.width + 30 &&
          selectedPixel.y >= -40 &&
          selectedPixel.y <= mapSize.height + 40 && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
              style={{
                left: selectedPixel.x,
                top: selectedPixel.y,
              }}
            >
              <div className="relative flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-900/30 ring-4 ring-white">
                  <MapPin size={21} fill="currentColor" />
                </div>
                <div className="h-4 w-1 rounded-full bg-blue-600" />
              </div>
            </div>
          )}

        <div
          onPointerDown={(event) => event.stopPropagation()}
          className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-9 w-9 items-center justify-center text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            aria-label="Zoom in"
          >
            +
          </button>
          <div className="h-px bg-slate-200" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-9 w-9 items-center justify-center text-lg font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        <div className="absolute bottom-3 left-3 max-w-[calc(100%-24px)] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur">
          {selectedCoordinate ? (
            <span>
              Selected: {formatCoordinate(selectedCoordinate.latitude)}, {formatCoordinate(selectedCoordinate.longitude)}
            </span>
          ) : (
            <span>Click map to select project coordinates.</span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 hidden rounded-lg bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-500 shadow-sm sm:block">
          Map data © OpenStreetMap
        </div>
      </div>

      {locationMessage && (
        <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
          {locationMessage}
        </p>
      )}
    </section>
  );
}


function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function toLower(value?: string | number | null): string {
  return value === undefined || value === null
    ? ""
    : String(value).toLowerCase();
}

function getReadableStatus(value?: string | null): string {
  if (!value) return "Not specified";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function formatDate(date?: string | null): string {
  if (!date) return "Not set";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatRelativeTime(date?: string | null): string {
  if (!date) return "No activity";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "No activity";

  const difference = Date.now() - parsed.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return formatDate(date);
}


function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function getProjectRelatedCounts(
  project: ProjectRecord
): ProjectRelatedCounts | null {
  return project.related_counts || null;
}

function getProjectDocumentsCount(project: ProjectRecord): number {
  if (typeof project.documents_count === "number") {
    return project.documents_count;
  }

  if (typeof project.document_count === "number") {
    return project.document_count;
  }

  if (Array.isArray(project.documents)) {
    return project.documents.length;
  }

  return 0;
}

function getRecordedProgress(project: ProjectRecord): number | null {
  const value = project.metadata?.progress;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function getStatusClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "planned":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "completed":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "archived":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function getSecurityClass(securityLevel?: string | null): string {
  switch (toLower(securityLevel)) {
    case "public":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "internal":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "confidential":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "restricted":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getProjectVisual(project: ProjectRecord): {
  icon: ElementType;
  wrapperClass: string;
  progressClass: string;
} {
  const projectType = toLower(project.project_type);

  if (projectType === "geological_survey" || projectType === "mining") {
    return {
      icon: Mountain,
      wrapperClass: "bg-violet-50 text-violet-600",
      progressClass: "bg-violet-500",
    };
  }

  if (projectType === "construction") {
    return {
      icon: Building2,
      wrapperClass: "bg-blue-50 text-blue-600",
      progressClass: "bg-blue-600",
    };
  }

  if (projectType === "technical_study") {
    return {
      icon: Puzzle,
      wrapperClass: "bg-amber-50 text-amber-600",
      progressClass: "bg-amber-500",
    };
  }

  if (projectType === "administration") {
    return {
      icon: PenTool,
      wrapperClass: "bg-emerald-50 text-emerald-600",
      progressClass: "bg-emerald-500",
    };
  }

  return {
    icon: FolderOpen,
    wrapperClass: "bg-slate-100 text-slate-600",
    progressClass: "bg-slate-500",
  };
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getUserName(user: UserSummary | null): string {
  return user?.name || "DMS User";
}

function getRoleName(user: UserSummary | null): string {
  const role = (user as { role?: unknown } | null)?.role;

  if (!role) return "Project User";

  if (typeof role === "string") {
    return getReadableStatus(role);
  }

  if (typeof role === "object" && role !== null) {
    const roleObject = role as {
      name?: string;
      slug?: string;
    };

    return (
      roleObject.name ||
      getReadableStatus(roleObject.slug) ||
      "Project User"
    );
  }

  return "Project User";
}

function normalizeProjectsResponse(response: unknown): ProjectRecord[] {
  if (Array.isArray(response)) {
    return response as ProjectRecord[];
  }

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return record.data as ProjectRecord[];
    }

    if (
      record.data &&
      typeof record.data === "object" &&
      Array.isArray((record.data as Record<string, unknown>).data)
    ) {
      return (record.data as Record<string, unknown>).data as ProjectRecord[];
    }

    if (Array.isArray(record.projects)) {
      return record.projects as ProjectRecord[];
    }
  }

  return [];
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
    return apiError.message || "Validation failed. Check the project form.";
  }

  return apiError.message || "The action could not be completed.";
}

function projectToForm(project: ProjectRecord): ProjectFormState {
  return {
    name: project.name || "",
    code: project.code || "",
    description: project.description || "",
    location_name: project.location_name || "",
    latitude:
      project.latitude !== null && project.latitude !== undefined
        ? String(project.latitude)
        : "",
    longitude:
      project.longitude !== null && project.longitude !== undefined
        ? String(project.longitude)
        : "",
    project_type:
      (project.project_type as ProjectFormState["project_type"]) || "other",
    status: (project.status as ProjectFormState["status"]) || "planned",
    security_level:
      (project.security_level as ProjectFormState["security_level"]) ||
      "internal",
    start_date: project.start_date ? String(project.start_date).slice(0, 10) : "",
    end_date: project.end_date ? String(project.end_date).slice(0, 10) : "",
  };
}

function formToPayload(form: ProjectFormState) {
  return {
    name: form.name.trim(),
    code: form.code.trim() || null,
    description: form.description.trim() || null,
    location_name: form.location_name.trim() || null,
    latitude: form.latitude.trim() || null,
    longitude: form.longitude.trim() || null,
    project_type: form.project_type,
    status: form.status,
    security_level: form.security_level,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    metadata: {
      source: "dms_frontend",
      workflow: "project_management_related_records",
      supervisor_requirement:
        "Each project should contain all related records.",
    },
  };
}

function validateProjectForm(form: ProjectFormState): string | null {
  if (!form.name.trim()) {
    return "Project name is required.";
  }

  if (form.start_date && form.end_date) {
    const startDate = new Date(form.start_date);
    const endDate = new Date(form.end_date);

    if (endDate < startDate) {
      return "The end date cannot be earlier than the start date.";
    }
  }

  if (form.latitude.trim()) {
    const latitude = Number(form.latitude);

    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      return "Latitude must be a number between -90 and 90.";
    }
  }

  if (form.longitude.trim()) {
    const longitude = Number(form.longitude);

    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      return "Longitude must be a number between -180 and 180.";
    }
  }

  return null;
}

function getDocumentText(document: DmsDocument): string {
  const tags = Array.isArray(document.tags)
    ? document.tags.join(" ")
    : document.tags || "";

  return [
    document.title,
    document.description,
    document.document_type,
    document.original_file_name,
    tags,
    document.metadata ? JSON.stringify(document.metadata) : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isRelatedToProject(document: DmsDocument, project: ProjectRecord): boolean {
  const documentProjectId = document.project_id;

  if (
    documentProjectId !== null &&
    documentProjectId !== undefined &&
    String(documentProjectId) === String(project.id)
  ) {
    return true;
  }

  if (document.project?.id && String(document.project.id) === String(project.id)) {
    return true;
  }

  return false;
}

function hasWords(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

function isArchivedDocument(document: DmsDocument): boolean {
  return toLower(document.status) === "archived" || Boolean(document.archived_at);
}

function isActiveDocument(document: DmsDocument): boolean {
  return toLower(document.status) === "active" && !isArchivedDocument(document);
}

function isSecurityAlertDocument(document: DmsDocument): boolean {
  return [
    toLower(document.status),
    toLower(document.scan_status),
    toLower(document.sandbox_status),
  ].some((value) =>
    [
      "infected",
      "suspicious",
      "failed",
      "unsafe",
      "blocked",
      "rejected",
      "quarantined",
    ].includes(value)
  );
}

function hasGeologicalRecord(document: DmsDocument): boolean {
  return Boolean(
    document.geological_record ||
      document.geologicalRecord ||
      hasWords(getDocumentText(document), [
        "geological",
        "geology",
        "borehole",
        "mineral",
        "rock",
        "groundwater",
        "fault",
      ])
  );
}

function isSampleDocument(document: DmsDocument): boolean {
  return hasWords(getDocumentText(document), [
    "sample",
    "sampling",
    "specimen",
    "core",
    "rock sample",
  ]);
}

function isLaboratoryDocument(document: DmsDocument): boolean {
  return hasWords(getDocumentText(document), [
    "lab",
    "laboratory",
    "assay",
    "test result",
    "analysis result",
  ]);
}

function isMapDocument(document: DmsDocument): boolean {
  return hasWords(getDocumentText(document), [
    "map",
    "survey map",
    "location map",
    "coordinate",
    "gis",
  ]);
}

function getProjectStudyAreaCount(
  project: ProjectRecord,
  relatedDocuments: DmsDocument[]
): number {
  const names = new Set<string>();

  if (project.location_name) {
    names.add(project.location_name.toLowerCase());
  }

  relatedDocuments.forEach((document) => {
    const metadata = document.metadata || {};

    [
      metadata.study_area,
      metadata.study_area_name,
      metadata.study_area_code,
      metadata.location_name,
    ].forEach((value) => {
      if (typeof value === "string" && value.trim()) {
        names.add(value.trim().toLowerCase());
      }
    });

    if (isMapDocument(document)) {
      names.add(`map-${document.id}`);
    }
  });

  return names.size;
}

function getLatestDate(values: Array<string | null | undefined>): string | null {
  const timestamps = values
    .map((date) => (date ? new Date(date).getTime() : NaN))
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) return null;

  return new Date(Math.max(...timestamps)).toISOString();
}

function getRelatedDocuments(
  project: ProjectRecord,
  documents: DmsDocument[]
): DmsDocument[] {
  return documents.filter((document) => isRelatedToProject(document, project));
}

function getDocumentsFromProjectRecords(
  projectRecords: ProjectRecordsResponse | null
): DmsDocument[] {
  const documentsRecord = projectRecords?.records?.documents;

  if (Array.isArray(documentsRecord)) {
    return documentsRecord;
  }

  if (
    documentsRecord &&
    typeof documentsRecord === "object" &&
    Array.isArray((documentsRecord as { data?: DmsDocument[] }).data)
  ) {
    return (documentsRecord as { data?: DmsDocument[] }).data || [];
  }

  return [];
}

function buildRelatedSummaryFromBackendRecords(
  project: ProjectRecord,
  projectRecords: ProjectRecordsResponse | null,
  fallbackDocuments: DmsDocument[]
): RelatedRecordSummary {
  if (!projectRecords?.related_counts) {
    return buildRelatedSummary(project, fallbackDocuments);
  }

  const backendDocuments = getDocumentsFromProjectRecords(projectRecords);
  const relatedDocuments = backendDocuments.length > 0
    ? backendDocuments
    : getRelatedDocuments(project, fallbackDocuments);

  const counts = projectRecords.related_counts;

  return {
    documents: toSafeNumber(counts.documents, relatedDocuments.length),
    activeDocuments: toSafeNumber(
      counts.active_documents,
      relatedDocuments.filter(isActiveDocument).length
    ),
    archivedDocuments: toSafeNumber(
      counts.archived_documents,
      relatedDocuments.filter(isArchivedDocument).length
    ),
    studyAreas: toSafeNumber(
      counts.study_area_records,
      getProjectStudyAreaCount(project, relatedDocuments)
    ),
    maps: relatedDocuments.filter(isMapDocument).length,
    samples: toSafeNumber(
      counts.sample_records,
      relatedDocuments.filter(isSampleDocument).length
    ),
    laboratory: toSafeNumber(
      counts.laboratory_records,
      relatedDocuments.filter(isLaboratoryDocument).length
    ),
    geologicalRecords: toSafeNumber(
      counts.geological_records,
      relatedDocuments.filter(hasGeologicalRecord).length
    ),
    securityAlerts: toSafeNumber(
      counts.security_alerts,
      relatedDocuments.filter(isSecurityAlertDocument).length
    ),
    lastActivity: getLatestDate([
      projectRecords.project?.updated_at,
      projectRecords.project?.created_at,
      project.updated_at,
      project.created_at,
      ...relatedDocuments.map(
        (document) => document.updated_at || document.created_at
      ),
    ]),
  };
}

function buildRelatedSummary(
  project: ProjectRecord,
  documents: DmsDocument[]
): RelatedRecordSummary {
  const relatedDocuments = getRelatedDocuments(project, documents);
  const backendDocumentCount = getProjectDocumentsCount(project);
  const backendCounts = getProjectRelatedCounts(project);
  const documentCount = Math.max(
    relatedDocuments.length,
    backendDocumentCount,
    toSafeNumber(backendCounts?.documents)
  );

  const activeDocuments = relatedDocuments.filter(isActiveDocument).length;
  const archivedDocuments = relatedDocuments.filter(isArchivedDocument).length;
  const studyAreas = getProjectStudyAreaCount(project, relatedDocuments);
  const samples = relatedDocuments.filter(isSampleDocument).length;
  const laboratory = relatedDocuments.filter(isLaboratoryDocument).length;
  const geologicalRecords = relatedDocuments.filter(hasGeologicalRecord).length;
  const securityAlerts = relatedDocuments.filter(isSecurityAlertDocument).length;

  return {
    documents: documentCount,
    activeDocuments: toSafeNumber(
      backendCounts?.active_documents,
      activeDocuments
    ),
    archivedDocuments: toSafeNumber(
      backendCounts?.archived_documents,
      archivedDocuments
    ),
    studyAreas: toSafeNumber(
      backendCounts?.study_area_records,
      studyAreas
    ),
    maps: relatedDocuments.filter(isMapDocument).length,
    samples: toSafeNumber(backendCounts?.sample_records, samples),
    laboratory: toSafeNumber(
      backendCounts?.laboratory_records,
      laboratory
    ),
    geologicalRecords: toSafeNumber(
      backendCounts?.geological_records,
      geologicalRecords
    ),
    securityAlerts: toSafeNumber(
      backendCounts?.security_alerts,
      securityAlerts
    ),
    lastActivity: getLatestDate([
      project.updated_at,
      project.created_at,
      ...relatedDocuments.map(
        (document) => document.updated_at || document.created_at
      ),
    ]),
  };
}

function Header({ user }: { user: UserSummary | null }) {
  return (
    <header className="flex min-h-[78px] shrink-0 items-center justify-between gap-5 border-b border-slate-200 bg-white px-5 lg:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Organization</span>
          <ChevronRight size={13} />
          <span className="text-slate-700">Project Management</span>
        </div>

        <h1 className="mt-1 text-lg font-bold text-slate-900">
          Project Management
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-1.5 py-1 transition hover:bg-slate-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {getInitials(getUserName(user))}
          </div>

          <div className="hidden text-left lg:block">
            <p className="max-w-[150px] truncate text-sm font-semibold text-slate-800">
              {getUserName(user)}
            </p>

            <p className="mt-0.5 max-w-[150px] truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {getRoleName(user)}
            </p>
          </div>

          <ChevronDown size={14} className="hidden text-slate-400 lg:block" />
        </button>
      </div>
    </header>
  );
}

function AlertBox({
  alert,
  onClose,
}: {
  alert: AlertState;
  onClose?: () => void;
}) {
  const Icon =
    alert.type === "success"
      ? CheckCircle2
      : alert.type === "error"
        ? AlertCircle
        : ShieldCheck;

  const alertClass =
    alert.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : alert.type === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
        alertClass
      )}
    >
      <div className="flex items-start gap-2.5">
        <Icon size={17} className="mt-0.5 shrink-0" />
        <span>{alert.message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alert"
          className="shrink-0 opacity-70 transition hover:opacity-100"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: number;
  helper: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {formatNumber(value)}
          </p>

          <p className="mt-2 text-[11px] text-slate-400">{helper}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        >
          {options.map((option) => (
            <option key={option.value || option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

function MiniRecordCount({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-slate-500">
          <Icon size={13} className="shrink-0" />
          <span className="truncate text-[10px] font-semibold uppercase tracking-wide">
            {label}
          </span>
        </div>
        <span className="text-sm font-bold text-slate-900">
          {formatNumber(value)}
        </span>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  relatedSummary,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  project: ProjectRecord;
  relatedSummary: RelatedRecordSummary;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const visual = getProjectVisual(project);
  const Icon = visual.icon;
  const progress = getRecordedProgress(project);

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md",
        selected ? "border-blue-300 ring-4 ring-blue-50" : "border-slate-200"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            visual.wrapperClass
          )}
        >
          <Icon size={21} />
        </div>

        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-bold text-slate-900" title={project.name}>
            {project.name}
          </p>

          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {project.code || `Project #${project.id}`}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
            aria-label={`Edit ${project.name}`}
            title="Edit project"
          >
            <Edit3 size={14} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${project.name}`}
            title="Delete project"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-bold",
            getStatusClass(project.status)
          )}
        >
          {getReadableStatus(project.status)}
        </span>

        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-bold",
            getSecurityClass(project.security_level)
          )}
        >
          {getReadableStatus(project.security_level)}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
        {project.description || "No project description has been added."}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniRecordCount
          icon={FileText}
          label="Documents"
          value={relatedSummary.documents}
        />
        <MiniRecordCount
          icon={MapPin}
          label="Areas"
          value={relatedSummary.studyAreas}
        />
        <MiniRecordCount
          icon={FlaskConical}
          label="Samples"
          value={relatedSummary.samples}
        />
        <MiniRecordCount
          icon={Archive}
          label="Archived"
          value={relatedSummary.archivedDocuments}
        />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin size={13} className="shrink-0 text-slate-400" />
          <span className="truncate">{project.location_name || "No location"}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={13} className="shrink-0 text-slate-400" />
          <span className="truncate">
            {formatDate(project.start_date)} – {formatDate(project.end_date)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Activity size={13} className="shrink-0 text-slate-400" />
          <span>Updated {formatRelativeTime(relatedSummary.lastActivity)}</span>
        </div>
      </div>

      {progress !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-500">Recorded progress</span>
            <span className="font-bold text-slate-800">{progress}%</span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full", visual.progressClass)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          <Eye size={15} />
          Records
        </button>

        <Link
          to={`/Projects/${project.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FolderOpen size={15} />
          Open
        </Link>
      </div>
    </article>
  );
}

function RelatedRecordsPanel({
  project,
  relatedSummary,
  relatedDocuments,
  loading = false,
}: {
  project: ProjectRecord | null;
  relatedSummary: RelatedRecordSummary | null;
  relatedDocuments: DmsDocument[];
  loading?: boolean;
}) {
  if (!project || !relatedSummary) {
    return (
      <aside className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/40 xl:sticky xl:top-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <FolderKanban size={26} />
        </div>

        <h3 className="mt-4 text-sm font-bold text-slate-800">
          Select a project
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Choose a project to see all related records in one workspace.
        </p>
      </aside>
    );
  }

  const recentDocuments = [...relatedDocuments]
    .sort((first, second) => {
      const firstDate = new Date(first.updated_at || first.created_at || 0).getTime();
      const secondDate = new Date(second.updated_at || second.created_at || 0).getTime();
      return secondDate - firstDate;
    })
    .slice(0, 5);

  return (
    <aside className="space-y-4 xl:sticky xl:top-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">
              Project Records Container
            </p>

            <h3 className="mt-1 truncate text-base font-bold text-slate-900">
              {project.name}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              All records connected to this project are grouped here.
            </p>

            {loading && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
                <Loader2 size={12} className="animate-spin" />
                Loading latest backend records...
              </p>
            )}
          </div>

          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold",
              getStatusClass(project.status)
            )}
          >
            {getReadableStatus(project.status)}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {relatedRecordTiles.map((tile) => {
            const Icon = tile.icon;
            const value = relatedSummary[tile.key];
            const numericValue = typeof value === "number" ? value : 0;

            return (
              <Link
                key={tile.key}
                to={tile.path(project)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    <Icon size={15} />
                  </div>

                  <span className="text-lg font-bold text-slate-900">
                    {formatNumber(numericValue)}
                  </span>
                </div>

                <p className="mt-3 text-xs font-bold text-slate-800">
                  {tile.label}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  {tile.helper}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Project Actions
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Add and open project-related records.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <Link
            to={`/upload-document?project_id=${project.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <UploadCloud size={15} />
            Upload related document
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/search?project_id=${project.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Search size={14} />
              Search
            </Link>

            <Link
              to={`/reports?project_id=${project.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <BarChart3 size={14} />
              Reports
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Related Documents
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Latest files inside this project.
            </p>
          </div>

          <Link
            to={`/alldocuments?project_id=${project.id}`}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          {recentDocuments.length > 0 ? (
            recentDocuments.map((document) => (
              <Link
                key={String(document.id)}
                to={`/alldocuments?document_id=${document.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
                  <FileText size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {document.title || document.original_file_name || "Untitled document"}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    {getReadableStatus(document.document_type)} · Updated {formatRelativeTime(document.updated_at || document.created_at)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
              <FileText size={22} className="mx-auto text-slate-400" />
              <p className="mt-2 text-xs font-semibold text-slate-600">
                No related documents yet
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Upload files using this project as destination.
              </p>
            </div>
          )}
        </div>
      </section>

      {relatedSummary.securityAlerts > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Security attention required
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-700">
                {relatedSummary.securityAlerts} related record(s) have security,
                scan, sandbox or quarantine status that needs review.
              </p>
            </div>
          </div>
        </section>
      )}
    </aside>
  );
}

function FormField({
  label,
  required = false,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      {children}
    </label>
  );
}

function ProjectFormModal({
  title,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  title: string;
  form: ProjectFormState;
  saving: boolean;
  onChange: (form: ProjectFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  function updateField<K extends keyof ProjectFormState>(
    field: K,
    value: ProjectFormState[K]
  ): void {
    onChange({
      ...form,
      [field]: value,
    });
  }

  function handleMapLocationSelect(
    latitude: number,
    longitude: number,
    label?: string
  ): void {
    onChange({
      ...form,
      latitude: formatCoordinate(latitude),
      longitude: formatCoordinate(longitude),
      location_name:
        label && !form.location_name.trim() ? label : form.location_name,
    });
  }

  function handleClearMapLocation(): void {
    onChange({
      ...form,
      latitude: "",
      longitude: "",
    });
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>

            <p className="mt-1 text-xs text-slate-500">
              Create the main project container where all related records will be organized.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <FormField label="Project name" required>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={inputClass}
                placeholder="Example: Kigali Geological Survey"
              />
            </FormField>

            <FormField label="Project code">
              <input
                value={form.code}
                onChange={(event) => updateField("code", event.target.value)}
                className={inputClass}
                placeholder="Leave empty for automatic code"
              />
            </FormField>

            <FormField label="Project type">
              <div className="relative">
                <select
                  value={form.project_type}
                  onChange={(event) =>
                    updateField(
                      "project_type",
                      event.target.value as ProjectFormState["project_type"]
                    )
                  }
                  className={cn(inputClass, "appearance-none pr-9")}
                >
                  {projectTypeOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </FormField>

            <FormField label="Status">
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as ProjectFormState["status"])
                  }
                  className={cn(inputClass, "appearance-none pr-9")}
                >
                  {statusOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </FormField>

            <FormField label="Security level">
              <div className="relative">
                <select
                  value={form.security_level}
                  onChange={(event) =>
                    updateField(
                      "security_level",
                      event.target.value as ProjectFormState["security_level"]
                    )
                  }
                  className={cn(inputClass, "appearance-none pr-9")}
                >
                  {securityOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </FormField>

            <FormField label="Location / Site">
              <input
                value={form.location_name}
                onChange={(event) => updateField("location_name", event.target.value)}
                className={inputClass}
                placeholder="Example: Kigali, Rwanda"
              />
            </FormField>

            <div className="md:col-span-2">
              <LocationMapPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onSelect={handleMapLocationSelect}
                onClear={handleClearMapLocation}
              />
            </div>

            <FormField label="Latitude">
              <input
                value={form.latitude}
                readOnly
                className={cn(inputClass, "cursor-not-allowed bg-slate-100")}
                placeholder="Select from map"
              />
            </FormField>

            <FormField label="Longitude">
              <input
                value={form.longitude}
                readOnly
                className={cn(inputClass, "cursor-not-allowed bg-slate-100")}
                placeholder="Select from map"
              />
            </FormField>

            <FormField label="Start date">
              <input
                type="date"
                value={form.start_date}
                onChange={(event) => updateField("start_date", event.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="End date">
              <input
                type="date"
                value={form.end_date}
                onChange={(event) => updateField("end_date", event.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Description" className="md:col-span-2">
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                placeholder="Describe the project purpose, scope, and expected records..."
              />
            </FormField>

            <div className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-600" />

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Project-first record management
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    After saving, all related documents, samples, lab records,
                    study areas, geological records, archive items and reports
                    should be attached to this project workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={15} />
      </button>

      <span className="min-w-[78px] text-center text-xs font-semibold text-slate-600">
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onChange(currentPage + 1)}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center shadow-sm shadow-slate-200/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Loader2 size={23} className="animate-spin" />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">
        Loading projects
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Retrieving projects and related records...
      </p>
    </div>
  );
}

function EmptyPanel({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <FolderKanban size={26} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        No projects found
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
        Change the search filters or create the first project workspace where
        documents, samples, study areas and other records will be grouped.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <Plus size={16} />
        Create project
      </button>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [projectRecords, setProjectRecords] =
    useState<ProjectRecordsResponse | null>(null);
  const [recordsLoading, setRecordsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserSummary | null>(null);

  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [securityLevel, setSecurityLevel] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [alert, setAlert] = useState<AlertState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const apiFilters = useMemo(
    () => ({
      search,
      status,
      project_type: projectType,
      security_level: securityLevel,
    }),
    [projectType, search, securityLevel, status]
  );

  async function loadProjects(): Promise<void> {
    try {
      setLoading(true);
      setErrorMessage("");

      const [projectResponse, documentRows] = await Promise.all([
        getProjects(apiFilters),
        getDocuments({}),
      ]);

      const projectRows = normalizeProjectsResponse(projectResponse);

      setProjects(projectRows);
      setDocuments(documentRows);
      setCurrentPage(1);

      if (projectRows.length > 0) {
        setSelectedProjectId((current) => {
          const stillExists = projectRows.some(
            (project) => String(project.id) === current
          );

          return stillExists ? current : String(projectRows[0].id);
        });
      } else {
        setSelectedProjectId("");
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadUser(): Promise<void> {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadProjects();
  }, [apiFilters]);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectRecords(null);
      return;
    }

    let cancelled = false;

    async function loadSelectedProjectRecords(): Promise<void> {
      try {
        setRecordsLoading(true);

        const records = await getProjectRecords(selectedProjectId, {
          per_page: 25,
        });

        if (!cancelled) {
          setProjectRecords(records);
        }
      } catch {
        if (!cancelled) {
          setProjectRecords(null);
        }
      } finally {
        if (!cancelled) {
          setRecordsLoading(false);
        }
      }
    }

    loadSelectedProjectRecords();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const relatedSummaries = useMemo(() => {
    const map = new Map<string, RelatedRecordSummary>();

    projects.forEach((project) => {
      map.set(String(project.id), buildRelatedSummary(project, documents));
    });

    return map;
  }, [documents, projects]);

  const selectedProject = useMemo(() => {
    return (
      projects.find((project) => String(project.id) === selectedProjectId) ||
      projects[0] ||
      null
    );
  }, [projects, selectedProjectId]);

  const selectedRelatedDocuments = useMemo(() => {
    if (!selectedProject) return [];

    const backendDocuments = getDocumentsFromProjectRecords(projectRecords);

    if (backendDocuments.length > 0) {
      return backendDocuments;
    }

    return getRelatedDocuments(selectedProject, documents);
  }, [documents, projectRecords, selectedProject]);

  const selectedRelatedSummary = selectedProject
    ? buildRelatedSummaryFromBackendRecords(
        selectedProject,
        projectRecords,
        documents
      ) ||
      relatedSummaries.get(String(selectedProject.id)) ||
      buildRelatedSummary(selectedProject, documents)
    : null;

  const totalProjects = projects.length;

  const activeProjects = projects.filter(
    (project) => toLower(project.status) === "active"
  ).length;

  const totalRelatedRecords = Array.from(relatedSummaries.values()).reduce(
    (total, summary) => total + summary.documents + summary.studyAreas + summary.samples + summary.laboratory + summary.geologicalRecords,
    0
  );

  const securityAttention = Array.from(relatedSummaries.values()).reduce(
    (total, summary) => total + summary.securityAlerts,
    0
  );

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const paginatedProjects = projects.slice(startIndex, startIndex + PAGE_SIZE);

  const hasActiveFilters =
    searchInput.trim() !== "" ||
    status !== "" ||
    projectType !== "" ||
    securityLevel !== "";

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  function openCreateModal(): void {
    setEditingProject(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(project: ProjectRecord): void {
    setEditingProject(project);
    setForm(projectToForm(project));
    setIsModalOpen(true);
  }

  function closeModal(): void {
    if (saving) return;

    setIsModalOpen(false);
    setEditingProject(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const validationError = validateProjectForm(form);

    if (validationError) {
      setAlert({
        type: "error",
        message: validationError,
      });
      return;
    }

    try {
      setSaving(true);
      setAlert(null);

      if (editingProject) {
        const updatedProject = await updateProject(editingProject.id, formToPayload(form));

        setSelectedProjectId(String(updatedProject.id || editingProject.id));
        setAlert({
          type: "success",
          message: "Project updated successfully.",
        });
      } else {
        const createdProject = await createProject(formToPayload(form));

        setSelectedProjectId(String(createdProject.id));
        setAlert({
          type: "success",
          message: "Project created successfully. You can now attach related records.",
        });
      }

      closeModal();
      await loadProjects();
    } catch (error) {
      setAlert({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProject(project: ProjectRecord): Promise<void> {
    const confirmed = window.confirm(
      `Delete or archive "${project.name}"? Related records will remain linked to the project history.`
    );

    if (!confirmed) return;

    try {
      setAlert(null);

      await deleteProject(project.id);

      setAlert({
        type: "success",
        message: "Project deleted or archived successfully.",
      });

      await loadProjects();
    } catch (error) {
      setAlert({
        type: "error",
        message: getErrorMessage(error),
      });
    }
  }

  function clearFilters(): void {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setProjectType("");
    setSecurityLevel("");
    setCurrentPage(1);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header user={user} />

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] space-y-5 px-5 py-6 lg:px-8">
            {alert && <AlertBox alert={alert} onClose={() => setAlert(null)} />}

            {errorMessage && (
              <AlertBox
                alert={{
                  type: "error",
                  message: errorMessage,
                }}
              />
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="p-5 lg:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      

                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        Project Management Workspace
                      </h2>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        Create and manage projects.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={loadProjects}
                        disabled={loading}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <RefreshCcw size={16} />
                        )}
                        Refresh
                      </button>

                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
                      >
                        <Plus size={17} />
                        New project
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50 p-5 lg:border-l lg:border-t-0">
                  <div className="grid grid-cols-2 gap-3">
                    <MiniRecordCount
                      icon={FolderKanban}
                      label="Projects"
                      value={totalProjects}
                    />
                    <MiniRecordCount
                      icon={FileText}
                      label="Records"
                      value={totalRelatedRecords}
                    />
                    <MiniRecordCount
                      icon={Activity}
                      label="Active"
                      value={activeProjects}
                    />
                    <MiniRecordCount
                      icon={ShieldCheck}
                      label="Alerts"
                      value={securityAttention}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total Projects"
                value={totalProjects}
                helper="Projects registered in the system"
                icon={FolderKanban}
              />

              <MetricCard
                title="Active Projects"
                value={activeProjects}
                helper="Currently running workspaces"
                icon={Activity}
              />

              <MetricCard
                title="Related Records"
                value={totalRelatedRecords}
                helper="Records grouped inside projects"
                icon={FileText}
              />

              <MetricCard
                title="Security Attention"
                value={securityAttention}
                helper="Linked records needing review"
                icon={ShieldCheck}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                    Search projects
                  </label>

                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={searchInput}
                      onChange={(event) => {
                        setSearchInput(event.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Name, code, location or description..."
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <SelectField
                    label="Status"
                    value={status}
                    options={statusOptions}
                    onChange={(value) => {
                      setStatus(value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="lg:col-span-3">
                  <SelectField
                    label="Project type"
                    value={projectType}
                    options={projectTypeOptions}
                    onChange={(value) => {
                      setProjectType(value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="lg:col-span-2">
                  <SelectField
                    label="Security"
                    value={securityLevel}
                    options={securityOptions}
                    onChange={(value) => {
                      setSecurityLevel(value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div>
                {loading ? (
                  <LoadingPanel />
                ) : projects.length === 0 ? (
                  <EmptyPanel onCreate={openCreateModal} />
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      {paginatedProjects.map((project) => {
                        const projectId = String(project.id);
                        const relatedSummary =
                          relatedSummaries.get(projectId) ||
                          buildRelatedSummary(project, documents);

                        return (
                          <ProjectCard
                            key={projectId}
                            project={project}
                            relatedSummary={relatedSummary}
                            selected={String(selectedProject?.id) === projectId}
                            onSelect={() => setSelectedProjectId(projectId)}
                            onEdit={() => openEditModal(project)}
                            onDelete={() => handleDeleteProject(project)}
                          />
                        );
                      })}
                    </div>

                    <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                          {startIndex + 1}–
                          {Math.min(startIndex + paginatedProjects.length, projects.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                          {projects.length}
                        </span>{" "}
                        project workspaces
                      </p>

                      <Pagination
                        currentPage={safeCurrentPage}
                        totalPages={totalPages}
                        onChange={setCurrentPage}
                      />
                    </div>
                  </>
                )}
              </div>

              <RelatedRecordsPanel
                project={selectedProject}
                relatedSummary={selectedRelatedSummary}
                relatedDocuments={selectedRelatedDocuments}
                loading={recordsLoading}
              />
            </section>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <ProjectFormModal
          title={editingProject ? "Update Project" : "Create Project"}
          form={form}
          saving={saving}
          onChange={setForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}