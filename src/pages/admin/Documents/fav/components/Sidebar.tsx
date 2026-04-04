import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Upload,
  FolderOpen,
  Search,
  GitBranch,
  Lock,
  BarChart2,
  ClipboardList,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Archive,
  Files,
  UserCircle2,
} from "lucide-react";

const NAV = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    expandable: true,
    active: false,
  },
  {
    icon: FileText,
    label: "Documents",
    expandable: true,
    active: true,
    children: [
      { label: "All Documents", icon: Files },
      { label: "My Documents", icon: UserCircle2 },
      { label: "Shared with Me", icon: Users },
      { label: "Favorites", icon: Star, active: true },
      { label: "Recent", icon: Clock },
      { label: "Archive", icon: Archive },
    ],
  },
  { icon: Upload, label: "Upload & Digitization", active: false },
  { icon: FolderOpen, label: "Organization", active: false },
  { icon: Search, label: "Search & Retrieval", active: false },
  { icon: GitBranch, label: "Version Control", active: false },
  {
    icon: Lock,
    label: "Access & Permissions",
    expandable: true,
    active: false,
  },
  { icon: BarChart2, label: "Reports", active: false },
  {
    icon: ClipboardList,
    label: "Audit & Logs",
    expandable: true,
    active: false,
  },
  { icon: Users, label: "Users Management", active: false },
  { icon: Settings, label: "Settings", expandable: true, active: false },
];

export default function Sidebar() {
  const [docsOpen, setDocsOpen] = useState(true);

  return (
    <aside className="w-[168px] min-w-[168px] bg-[#161b27] flex flex-col h-full border-r border-[#252d3d]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#252d3d]">
        <div className="w-7 h-7 rounded bg-indigo-500 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" fill="white" />
            <rect x="9" y="1" width="6" height="6" rx="1" fill="white" />
            <rect x="1" y="9" width="6" height="6" rx="1" fill="white" />
            <rect x="9" y="9" width="6" height="6" rx="1" fill="white" />
          </svg>
        </div>
        <span className="font-bold text-sm tracking-widest text-white">
          MIGECO
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isDocuments = item.label === "Documents";

          if (isDocuments) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setDocsOpen((o) => !o)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors ${
                    item.active
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={15} className="text-indigo-400" />
                    <span>{item.label}</span>
                  </div>
                  {docsOpen ? (
                    <ChevronDown size={13} />
                  ) : (
                    <ChevronRight size={13} />
                  )}
                </button>
                {docsOpen && item.children && (
                  <div className="ml-4 border-l border-[#2a3347]">
                    {item.children.map((child) => {
                      const CIcon = child.icon;
                      return (
                        <button
                          key={child.label}
                          className={`w-full flex items-center gap-2 pl-4 pr-2 py-[6px] text-xs transition-colors ${
                            child.active
                              ? "text-white bg-[#1e2a3d] rounded-r font-semibold border-l-2 border-indigo-500 -ml-[2px]"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <CIcon size={13} />
                          <span>{child.label}</span>
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
              key={item.label}
              className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors ${
                item.active
                  ? "text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={15} className="text-slate-500" />
                <span>{item.label}</span>
              </div>
              {item.expandable && <ChevronRight size={13} />}
            </button>
          );
        })}

        <div className="mt-2">
          <button className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors">
            <HelpCircle size={15} className="text-slate-500" />
            <span>Help &amp; Support</span>
          </button>
        </div>
      </nav>

      {/* Storage */}
      <div className="px-4 py-3 border-t border-[#252d3d]">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">Storage</span>
          <span className="text-xs font-semibold text-white">78%</span>
        </div>
        <div className="w-full h-1.5 bg-[#2a3347] rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: "78%" }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Using 3.9 TB of 5 TB</p>
      </div>
    </aside>
  );
}
