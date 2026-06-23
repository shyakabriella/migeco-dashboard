import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  ChevronRight,
  FileSearch,
  FileText,
  FolderOpen,
  LayoutDashboard,
  MapPinned,
  Search,
  ShieldCheck,
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

const overviewCards = [
  {
    label: "Available Documents",
    value: "Read-only",
    detail: "Browse documents you are permitted to view.",
    icon: FileText,
    tone: "blue",
  },
  {
    label: "Study Areas",
    value: "Maps",
    detail: "View locations, maps, and field areas.",
    icon: MapPinned,
    tone: "emerald",
  },
  {
    label: "Archives",
    value: "Reference",
    detail: "Access archived documents when permitted.",
    icon: Archive,
    tone: "amber",
  },
  {
    label: "Security",
    value: "Viewer",
    detail: "No editing, deleting, or admin actions.",
    icon: ShieldCheck,
    tone: "slate",
  },
];

const quickLinks = [
  {
    label: "All Documents",
    description: "Open the document library.",
    path: "/alldocuments",
    icon: FolderOpen,
  },
  {
    label: "Search Documents",
    description: "Find documents by title, code, or content.",
    path: "/search",
    icon: Search,
  },
  {
    label: "Study Areas",
    description: "View maps, locations, and field areas.",
    path: "/study-areas",
    icon: MapPinned,
  },
  {
    label: "Archives",
    description: "View archived records available to you.",
    path: "/archive",
    icon: Archive,
  },
];

const referenceItems = [
  {
    title: "Geological Survey Report",
    type: "PDF Document",
    location: "Study Area / North Block",
    status: "View only",
  },
  {
    title: "Field Mapping Notes",
    type: "Field Record",
    location: "Locations / Active Fields",
    status: "View only",
  },
  {
    title: "Sample Laboratory Summary",
    type: "Lab Record",
    location: "Samples & Laboratory",
    status: "View only",
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
    return "VU";
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
    case "amber":
      return {
        iconWrap: "bg-amber-50 border-amber-100",
        icon: "text-amber-600",
      };
    case "slate":
      return {
        iconWrap: "bg-slate-50 border-slate-200",
        icon: "text-slate-600",
      };
    default:
      return {
        iconWrap: "bg-blue-50 border-blue-100",
        icon: "text-blue-600",
      };
  }
}

export default function ViewerDashboard() {
  const navigate = useNavigate();

  const user = useMemo(() => getStoredUser(), []);
  const displayName = user?.name || "Viewer User";
  const roleName = user?.role?.name || "Viewer";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <LayoutDashboard className="h-4 w-4" />
              <span>Viewer Dashboard</span>
            </div>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              {getGreeting()}, {displayName}
            </h1>
          </div>

          <div className="hidden w-[360px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 lg:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
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
          <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <UserCircle className="h-3.5 w-3.5" />
                    Viewer access
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    Read-only workspace
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    This dashboard gives you read-only access to approved
                    documents, study areas, maps, archives, and searchable
                    project information.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/alldocuments"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
                  >
                    <FileSearch className="h-4 w-4" />
                    Browse Documents
                  </Link>

                  <Link
                    to="/study-areas"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <MapPinned className="h-4 w-4" />
                    Study Areas
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-blue-200" />
                </div>

                <div>
                  <p className="text-sm font-semibold">Permission Level</p>
                  <p className="text-xs text-slate-300">Read-only Viewer</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-xs text-slate-300">
                <p>Allowed: view documents, search records, view maps.</p>
                <p>Restricted: upload, edit, delete, approve, manage users.</p>
              </div>
            </div>
          </section>

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map((card) => {
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

          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Quick Access
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Common viewer actions.
                  </p>
                </div>

                <LayoutDashboard className="h-5 w-5 text-slate-300" />
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 group-hover:border-blue-100 group-hover:bg-white group-hover:text-blue-600">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {link.label}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {link.description}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="mt-1 h-4 w-4 text-slate-300 group-hover:text-blue-500" />
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
                    Reference Items
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Example areas available for viewing.
                  </p>
                </div>

                <BookOpen className="h-5 w-5 text-slate-300" />
              </div>

              <div className="divide-y divide-slate-100">
                {referenceItems.map((item) => (
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

                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 px-5 py-4">
                <Link
                  to="/search"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <BarChart3 className="h-4 w-4" />
                  Search Available Records
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}