import { useState } from "react";
import type { ElementType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Users,
  Search,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Building2,
  LogOut,
} from "lucide-react";

interface SubItem {
  label: string;
  path: string;
  icon?: ElementType;
  hasSubmenu?: boolean;
  subItems?: SubItem[];
}

interface NavItem {
  icon: ElementType;
  label: string;
  path?: string;
  activePaths?: string[];
  hasSubmenu?: boolean;
  subItems?: SubItem[];
}

const LOGIN_PATH = "/login";

const navigationItems: NavItem[] = [
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
    activePaths: [
      "/alldocuments",
      "/mydocs",
      "/shareddocs",
      "/favorite",
      "/archive",
    ],
  },

  {
    icon: UploadCloud,
    label: "Upload & Digitization",
    path: "/upload&digitization",
    activePaths: [
      "/upload&digitization",
      "/upload&digitization/bulk",
      "/upload&digitization/upload",
      "/upload&digitization/scan",
      "/upload&digitization/history",
    ],
  },

  {
    icon: Building2,
    label: "Organization",
    path: "/organization",
    activePaths: [
      "/organization",
      "/categories",
      "/Docalltype",
      "/organization/geological",
      "/organization/geotechnical",
      "/organization/construction",
      "/Projects",
      "/projects",
      "/Department",
      "/Tags",
    ],
  },

  {
    icon: Search,
    label: "Search & Retrieval",
    path: "/search",
    activePaths: ["/search", "/Smartsearch", "/Advancedfilter", "/SavedSearch"],
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

  {
    icon: Users,
    label: "Users Management",
    path: "/usermanagement",
  },

  {
    icon: HelpCircle,
    label: "Help & Support",
    hasSubmenu: true,
    subItems: [
      {
        label: "FAQs",
        path: "/helpandsupport/faqs",
      },
      {
        label: "Manual",
        path: "/helpandsupport/manual",
      },
      {
        label: "Submit Ticket",
        path: "/helpandsupport/submitticket",
      },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    const currentPath = location.pathname;

    navigationItems.forEach((item) => {
      if (!item.hasSubmenu || !item.subItems) return;

      const shouldExpand = item.subItems.some((subItem) => {
        if (subItem.subItems) {
          return subItem.subItems.some((nestedSubItem) =>
            currentPath.startsWith(nestedSubItem.path)
          );
        }

        return currentPath.startsWith(subItem.path);
      });

      if (shouldExpand) {
        initialExpanded.add(item.label);
      }
    });

    return initialExpanded;
  });

  function toggleMenu(label: string): void {
    setExpandedMenus((previous) => {
      const next = new Set(previous);

      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }

      return next;
    });
  }

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

  function isActivePath(path?: string): boolean {
    if (!path) return false;

    return location.pathname === path;
  }

  function isParentActive(item: NavItem): boolean {
    const currentPath = location.pathname;

    if (item.path && currentPath === item.path) {
      return true;
    }

    if (item.activePaths) {
      return item.activePaths.some((path) => {
        if (path === "/dashboard") {
          return (
            currentPath === "/dashboard" ||
            currentPath === "/Mytasks" ||
            currentPath === "/Recentactivity"
          );
        }

        if (path === "/upload&digitization") {
          return currentPath.startsWith("/upload&digitization");
        }

        if (path === "/organization") {
          return (
            currentPath === "/organization" ||
            currentPath === "/categories" ||
            currentPath === "/Docalltype" ||
            currentPath.startsWith("/organization/") ||
            currentPath === "/Projects" ||
            currentPath.startsWith("/Projects/") ||
            currentPath === "/projects" ||
            currentPath.startsWith("/projects/") ||
            currentPath === "/Department" ||
            currentPath === "/Tags"
          );
        }

        if (path === "/search") {
          return (
            currentPath === "/search" ||
            currentPath === "/Smartsearch" ||
            currentPath === "/Advancedfilter" ||
            currentPath === "/SavedSearch"
          );
        }

        if (path === "/reports") {
          return currentPath.startsWith("/reports");
        }

        return currentPath === path || currentPath.startsWith(`${path}/`);
      });
    }

    if (item.subItems) {
      return item.subItems.some((subItem) => {
        if (subItem.subItems) {
          return subItem.subItems.some((nestedSubItem) =>
            isActivePath(nestedSubItem.path)
          );
        }

        return isActivePath(subItem.path);
      });
    }

    return false;
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-[#0f111a] text-sm text-slate-400">
      <div className="flex items-center gap-2 border-b border-slate-800 p-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <span className="text-xs font-bold text-white">M</span>
        </div>

        <span className="text-lg font-bold tracking-wider text-white">
          MIGECO
        </span>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedMenus.has(item.label);
          const active = isParentActive(item);

          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => {
                  if (item.hasSubmenu) {
                    toggleMenu(item.label);
                    return;
                  }

                  if (item.path) {
                    handleNavigation(item.path);
                  }
                }}
                className={`group flex w-full items-center justify-between rounded-lg p-2.5 transition-colors ${
                  active
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 ${
                      active ? "text-indigo-400" : "group-hover:text-white"
                    }`}
                  />

                  <span className="font-medium">{item.label}</span>
                </div>

                {item.hasSubmenu &&
                  (isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  ))}
              </button>

              {item.hasSubmenu && item.subItems && isExpanded && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.subItems.map((subItem) => {
                    const subIsActive = isActivePath(subItem.path);
                    const subIsExpanded = expandedMenus.has(subItem.label);

                    if (subItem.hasSubmenu && subItem.subItems) {
                      return (
                        <div key={subItem.label}>
                          <button
                            type="button"
                            onClick={() => toggleMenu(subItem.label)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                              subIsActive ||
                              subItem.subItems.some((nestedSubItem) =>
                                isActivePath(nestedSubItem.path)
                              )
                                ? "bg-slate-800 font-medium text-white"
                                : "text-slate-500 hover:bg-slate-800/50 hover:text-white"
                            }`}
                          >
                            <span>{subItem.label}</span>

                            {subIsExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>

                          {subIsExpanded && (
                            <div className="ml-3 mt-1 space-y-1">
                              {subItem.subItems.map((nestedSubItem) => {
                                const nestedIsActive = isActivePath(
                                  nestedSubItem.path
                                );

                                return (
                                  <button
                                    type="button"
                                    key={nestedSubItem.label}
                                    onClick={() =>
                                      handleNavigation(nestedSubItem.path)
                                    }
                                    className={`w-full rounded-lg px-3 py-1.5 text-left text-[11px] transition-colors ${
                                      nestedIsActive
                                        ? "bg-indigo-600/20 font-medium text-indigo-400"
                                        : "text-slate-500 hover:bg-slate-800/50 hover:text-white"
                                    }`}
                                  >
                                    {nestedSubItem.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        key={subItem.label}
                        onClick={() => handleNavigation(subItem.path)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                          subIsActive
                            ? "bg-slate-800 font-medium text-white"
                            : "text-slate-500 hover:bg-slate-800/50 hover:text-white"
                        }`}
                      >
                        {subItem.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-slate-800 p-4">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">Storage</span>
            <span className="text-xs font-bold text-white">78%</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: "78%" }}
            />
          </div>

          <p className="mt-2 text-[10px] text-slate-500">
            Using 3.9 TB of 5 TB
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}