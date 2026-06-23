import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Compass,
  FileSearch,
  FileText,
  FlaskConical,
  FolderOpen,
  LayoutDashboard,
  MapPinned,
  Mountain,
  Search,
  UploadCloud,
  UserCircle,
} from "lucide-react";

import AdminSidebar from "../AdminSidebar";

type StoredUser = {
  id?: number | string;
  name?: string;
  email?: string;
  department?: string | null;
  role?: {
    id?: number | string;
    name?: string;
    slug?: string;
  } | null;
};

const userStorageKeys = ["dms_user", "user", "authUser", "auth_user"];

const metricCards = [
  {
    label: "Active Projects",
    value: "Projects",
    detail: "Review geological project records and linked documents.",
    icon: FolderOpen,
    tone: "blue",
  },
  {
    label: "Study Areas",
    value: "Maps",
    detail: "Open field locations, maps, and coordinate areas.",
    icon: MapPinned,
    tone: "emerald",
  },
  {
    label: "Samples",
    value: "Lab",
    detail: "Access sample tracking and laboratory summaries.",
    icon: FlaskConical,
    tone: "violet",
  },
  {
    label: "Reviews",
    value: "Pending",
    detail: "Track records that still need geological review.",
    icon: ClipboardCheck,
    tone: "amber",
  },
];

const quickActions = [
  {
    label: "Projects",
    description: "Open project records and linked geological documents.",
    path: "/projects",
    icon: FolderOpen,
  },
  {
    label: "Study Areas",
    description: "View maps, locations, and field areas.",
    path: "/study-areas",
    icon: MapPinned,
  },
  {
    label: "Samples & Laboratory",
    description: "Review samples, lab results, and test references.",
    path: "/samples-laboratory",
    icon: FlaskConical,
  },
  {
    label: "Upload Document",
    description: "Upload geological reports, maps, samples, or field notes.",
    path: "/upload-document",
    icon: UploadCloud,
  },
  {
    label: "All Documents",
    description: "Browse the complete document repository.",
    path: "/alldocuments",
    icon: FileText,
  },
  {
    label: "Search & Retrieval",
    description: "Search approved documents and extracted records.",
    path: "/search",
    icon: Search,
  },
];

const fieldWorkItems = [
  {
    title: "Field Mapping Notes",
    type: "Geological field record",
    location: "Study Areas / Active Fields",
    status: "Review",
  },
  {
    title: "Rock Sample Laboratory Result",
    type: "Sample analysis",
    location: "Samples & Laboratory",
    status: "Lab",
  },
  {
    title: "Borehole Description Sheet",
    type: "Structured geological record",
    location: "Projects / Borehole Data",
    status: "Record",
  },
  {
    title: "Geological Survey Report",
    type: "Technical report",
    location: "Documents / Geological",
    status: "Document",
  },
];

function getStoredUser(): StoredUser | null {
  for (const key of userStorageKeys) {
    const rawUser = localStorage.getItem(key) || sessionStorage.getItem(key);

    if (!rawUser) {
      continue;
    }

    try {
      return JSON.parse(rawUser) as StoredUser;
    } catch {
      return null;
    }
  }

  return null;
}

function getInitials(name?: string): string {
  if (!name) {
    return "GE";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getToneClasses(tone: string): {
  iconWrap: string;
  icon: string;
} {
  switch (tone) {
    case "emerald":
      return {
        iconWrap: "bg-emerald-50 border-emerald-100",
        icon: "text-emerald-600",
      };
    case "violet":
      return {
        iconWrap: "bg-violet-50 border-violet-100",
        icon: "text-violet-600",
      };
    case "amber":
      return {
        iconWrap: "bg-amber-50 border-amber-100",
        icon: "text-amber-600",
      };
    default:
      return {
        iconWrap: "bg-blue-50 border-blue-100",
        icon: "text-blue-600",
      };
  }
}

export default function GeologistDashboard() {
  const navigate = useNavigate();

  const user = useMemo(() => getStoredUser(), []);
  const displayName = user?.name || "Geologist User";
  const roleName = user?.role?.name || "Geologist";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <LayoutDashboard className="h-4 w-4" />
              <span>Geologist Dashboard</span>
            </div>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              {getGreeting()}, {displayName}
            </h1>
          </div>

          <div className="hidden w-[360px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 lg:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search geological records..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              onFocus={() => navigate("/search")}
              readOnly
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 md:block">
              {formatCurrentDate()}
            </div>

            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {getInitials(displayName)}
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold leading-tight text-slate-900">
                  {displayName}
                </p>
                <p className="text-[10px] leading-tight text-slate-500">
                  {roleName}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <section className="mb-6 grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <Compass className="h-3.5 w-3.5" />
                    Geological workspace
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    Field data, maps, samples, and documents
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Use this workspace to access geological projects, study
                    areas, field locations, sample records, laboratory outputs,
                    and uploaded technical documents.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/study-areas"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-emerald-700"
                  >
                    <MapPinned className="h-4 w-4" />
                    Open Maps
                  </Link>

                  <Link
                    to="/upload-document"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Upload Document
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Mountain className="h-5 w-5 text-emerald-200" />
                </div>

                <div>
                  <p className="text-sm font-semibold">Role Focus</p>
                  <p className="text-xs text-slate-300">Geological records</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-xs text-slate-300">
                <p>Manage: geological documents, samples, study references.</p>
                <p>Review: maps, field notes, boreholes, and lab summaries.</p>
              </div>
            </div>
          </section>

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => {
              const Icon = card.icon;
              const toneClasses = getToneClasses(card.tone);

              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.label}
                      </p>
                      <p className="mt-2 text-xl font-bold text-slate-950">
                        {card.value}
                      </p>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneClasses.iconWrap}`}
                    >
                      <Icon className={`h-5 w-5 ${toneClasses.icon}`} />
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    {card.detail}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Geologist Quick Actions
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Core geological modules and document workflows.
                  </p>
                </div>

                <Compass className="h-5 w-5 text-slate-300" />
              </div>

              <div className="grid gap-3 p-5 md:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.label}
                      to={action.path}
                      className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 group-hover:border-emerald-100 group-hover:bg-white group-hover:text-emerald-600">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {action.label}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {action.description}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="mt-1 h-4 w-4 text-slate-300 group-hover:text-emerald-500" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Field & Lab References
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Main records used in geological review.
                  </p>
                </div>

                <BookOpen className="h-5 w-5 text-slate-300" />
              </div>

              <div className="divide-y divide-slate-100">
                {fieldWorkItems.map((item) => (
                  <div key={item.title} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.type}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {item.location}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 px-5 py-4">
                <Link
                  to="/samples-laboratory"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <FlaskConical className="h-4 w-4" />
                  Samples
                </Link>

                <Link
                  to="/archive"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Archive className="h-4 w-4" />
                  Archives
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Geological Review Guidance
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Keep uploaded maps, reports, sample sheets, and lab outputs
                  linked to the correct project or study area. Use archive only
                  for inactive reference documents.
                </p>
              </div>

              <Link
                to="/reports"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <BarChart3 className="h-4 w-4" />
                View Reports
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}