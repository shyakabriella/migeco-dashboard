import { useState } from "react";
import type { ElementType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Archive,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  FlaskConical,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Mail,
  Map,
  MapPin,
  Search,
  Settings,
  UploadCloud,
  Users,
} from "lucide-react";

interface NavigationItem {
  icon: ElementType;
  label: string;
  path: string;
  activePaths?: string[];
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const LOGIN_PATH = "/login";

const navigationSections: NavigationSection[] = [
  {
    title: "Workspace",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/dashboard",
        activePaths: ["/dashboard", "/Mytasks", "/Recentactivity"],
      },
      {
        icon: FileText,
        label: "Documents",
        path: "/alldocuments",
        activePaths: ["/alldocuments", "/mydocs", "/shareddocs", "/favorite"],
      },
      {
        icon: UploadCloud,
        label: "Upload Document",
        path: "/upload-document",
        activePaths: [
          "/upload-document",
          "/upload&digitization",
          "/upload&digitization/bulk",
          "/upload&digitization/upload",
          "/upload&digitization/scan",
          "/upload&digitization/history",
        ],
      },
      {
        icon: Archive,
        label: "Archives",
        path: "/archive",
        activePaths: ["/archive", "/archives", "/document-archives"],
      },
      {
        icon: Search,
        label: "Search & Retrieval",
        path: "/search",
        activePaths: [
          "/search",
          "/Smartsearch",
          "/Advancedfilter",
          "/SavedSearch",
        ],
      },
      {
        icon: BarChart3,
        label: "Reports",
        path: "/reports",
        activePaths: [
          "/reports",
          "/reports/overview",
          "/reports/docreport",
          "/reports/uploadrep",
          "/reports/depreport",
          "/reports/versioningrep",
          "/reports/accessreport",
        ],
      },
    ],
  },
  {
    title: "Projects & Field",
    items: [
      {
        icon: FolderOpen,
        label: "Projects",
        path: "/projects",
        activePaths: ["/projects", "/Projects", "/project-details"],
      },
      {
        icon: Map,
        label: "Study Areas",
        path: "/study-areas",
        activePaths: [
          "/study-areas",
          "/study-areas/maps",
          "/study-areas/locations",
          "/study-areas/fields",
          "/maps",
          "/locations",
          "/fields",
        ],
      },
      {
        icon: MapPin,
        label: "Maps & Locations",
        path: "/study-areas/maps",
        activePaths: ["/maps", "/locations", "/study-areas/maps"],
      },
      {
        icon: FlaskConical,
        label: "Samples & Laboratory",
        path: "/samples-laboratory",
        activePaths: [
          "/samples-laboratory",
          "/samples",
          "/laboratory",
          "/lab-results",
        ],
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        icon: Users,
        label: "Users Management",
        path: "/usermanagement",
        activePaths: ["/usermanagement", "/users"],
      },
      {
        icon: Settings,
        label: "Settings",
        path: "/settings",
        activePaths: ["/settings"],
      },
      {
        icon: Bell,
        label: "Notifications",
        path: "/settings/notifications",
        activePaths: ["/settings/notifications", "/notifications"],
      },
      {
        icon: Mail,
        label: "Email Settings",
        path: "/settings/email",
        activePaths: ["/settings/email", "/email-settings"],
      },
    ],
  },
];

function pathMatches(currentPath: string, path: string): boolean {
  if (currentPath === path) {
    return true;
  }

  return currentPath.startsWith(`${path}/`);
}

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState<boolean>(false);

  function handleNavigation(path: string): void {
    navigate(path);
  }

  function handleLogout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth_user");

    navigate(LOGIN_PATH, {
      replace: true,
    });
  }

  function isItemActive(item: NavigationItem): boolean {
    const currentPath = location.pathname;

    if (pathMatches(currentPath, item.path)) {
      return true;
    }

    return (
      item.activePaths?.some((path) => pathMatches(currentPath, path)) ?? false
    );
  }

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? "w-[82px]" : "w-[250px]"
      }`}
    >
      <div
        className={`flex h-[78px] items-center border-b border-slate-100 ${
          collapsed ? "justify-center px-3" : "justify-between px-5"
        }`}
      >
        <button
          type="button"
          onClick={() => handleNavigation("/dashboard")}
          className="flex min-w-0 items-center gap-3"
          title="MIGECO DMS"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-200">
            M
          </div>

          {!collapsed && (
            <div className="min-w-0 text-left">
              <p className="truncate text-base font-bold tracking-wide text-slate-900">
                MIGECO
              </p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Document System
              </p>
            </div>
          )}
        </button>

        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-slate-100 py-3">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-5">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex > 0 ? "mt-7" : ""}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavigation(item.path)}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex w-full items-center rounded-xl transition-all duration-200 ${
                      collapsed
                        ? "justify-center px-2 py-3"
                        : "gap-3 px-3 py-2.5"
                    } ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
                    )}

                    <Icon
                      className={`h-[19px] w-[19px] shrink-0 ${
                        active
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />

                    {!collapsed && (
                      <span
                        className={`truncate text-sm ${
                          active ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-xs font-semibold text-slate-800">
              MIGECO Workspace
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Project, study area, and document records
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center rounded-xl border border-transparent text-red-600 transition-colors hover:border-red-100 hover:bg-red-50 ${
            collapsed
              ? "justify-center px-2 py-3"
              : "justify-center gap-2 px-4 py-2.5"
          }`}
        >
          <LogOut className="h-[18px] w-[18px]" />

          {!collapsed && <span className="text-sm font-semibold">Logout</span>}
        </button>
      </div>
    </aside>
  );
}