import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Building2,
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
  Grid2x2,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", hasChevron: true },
  { icon: FileText, label: "Documents", hasChevron: false },
  { icon: Upload, label: "Upload & Digitization", hasChevron: false },
  { icon: Building2, label: "Organization", hasChevron: false },
  {
    icon: Search,
    label: "Search & Retrieval",
    hasChevron: true,
    active: true,
    expanded: true,
    children: ["Smart Search", "Advanced Filters", "Saved Searches"],
    activeChild: "Advanced Filters",
  },
  { icon: GitBranch, label: "Version Control", hasChevron: false },
  { icon: Lock, label: "Access & Permissions", hasChevron: true },
  { icon: BarChart2, label: "Reports", hasChevron: false },
  { icon: ClipboardList, label: "Audit & Logs", hasChevron: true },
  { icon: Users, label: "Users Management", hasChevron: false },
  { icon: Settings, label: "Settings", hasChevron: true },
];

export default function Sidebar() {
  const [expandedItem, setExpandedItem] = useState("Search & Retrieval");

  return (
    <aside className="w-[190px] min-w-[190px] bg-[#0d1117] border-r border-[#1e2433] flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#1e2433]">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Grid2x2 size={16} className="text-white" />
        </div>
        <span className="font-bold text-sm tracking-widest text-white uppercase">
          Migeco
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItem === item.label;

          return (
            <div key={item.label}>
              <button
                onClick={() =>
                  item.hasChevron &&
                  item.children &&
                  setExpandedItem(isExpanded ? "" : item.label)
                }
                className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm transition-colors group
                  ${
                    item.active
                      ? "text-white"
                      : "text-[#8b96a8] hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={15}
                    className={item.active ? "text-indigo-400" : "text-[#8b96a8] group-hover:text-white"}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                {item.hasChevron && item.children && (
                  isExpanded ? (
                    <ChevronDown size={12} className="text-[#8b96a8]" />
                  ) : (
                    <ChevronRight size={12} className="text-[#8b96a8]" />
                  )
                )}
              </button>

              {/* Children */}
              {item.children && isExpanded && (
                <div className="pl-10 pb-1">
                  {item.children.map((child) => (
                    <button
                      key={child}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded transition-colors
                        ${
                          child === item.activeChild
                            ? "text-white font-semibold bg-[#1e2433]"
                            : "text-[#8b96a8] hover:text-white"
                        }`}
                    >
                      {child}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Help */}
      <div className="border-t border-[#1e2433] px-4 py-3">
        <button className="flex items-center gap-3 text-[#8b96a8] hover:text-white text-xs">
          <HelpCircle size={15} />
          Help & Support
        </button>
      </div>

      {/* Storage */}
      <div className="mx-3 mb-3 bg-[#131924] rounded-xl p-3 border border-[#1e2433]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#8b96a8]">Storage</span>
          <span className="text-xs font-semibold text-white">78%</span>
        </div>
        <div className="w-full h-1.5 bg-[#1e2433] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
            style={{ width: "78%" }}
          />
        </div>
        <p className="text-[10px] text-[#8b96a8] mt-1.5">Using 3.9 TB of 5 TB</p>
      </div>
    </aside>
  );
}
