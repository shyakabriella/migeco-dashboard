import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  Building2,
  Search,
  GitBranch,
  History,
  Shield,
  BarChart2,
  ClipboardList,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Bell,
  Printer,
  Eye,
  Download,
  ArrowLeftRight,
  Clock,
  User,
  FileText,
  Filter,
  Calendar,
  LogIn,
} from "lucide-react";
import AdminSidebar from '../AdminSidebar';

// ── Types ──────────────────────────────────────────────────────────────────
type StatusType = "Approved" | "Pending Review" | "Rejected" | "Initial Draft";

interface Version {
  id: string;
  version: string;
  status: StatusType;
  uploadedBy: string;
  date: string;
  fileType: string;
  fileSize: string;
  description: string;
  tags?: string[];
  isCurrent?: boolean;
  icon: "pin" | "clock" | "rejected" | "upload";
}

// ── Data ───────────────────────────────────────────────────────────────────
const versions: Version[] = [
  {
    id: "v14",
    version: "Version 1.4",
    status: "Approved",
    uploadedBy: "Alex Morgan",
    date: "Today, 10:42 AM",
    fileType: "DWG",
    fileSize: "12.4 MB",
    description:
      "Final approval for Sector C foundation plan. Incorporated feedback from the structural engineering team regarding load-bearing walls in the north wing. Updated reinforcement details on Layer 3.",
    tags: ["#Structural", "#Foundation", "#Approved"],
    isCurrent: true,
    icon: "pin",
  },
  {
    id: "v13",
    version: "Version 1.3",
    status: "Pending Review",
    uploadedBy: "Sarah Jenkins",
    date: "Oct 24, 2023, 2:15 PM",
    fileType: "DWG",
    fileSize: "12.3 MB",
    description:
      "Adjusted width of main corridor in Sector B from 2.5m to 2.8m. Updated metadata tags for search optimization.",
    icon: "clock",
  },
  {
    id: "v12",
    version: "Version 1.2",
    status: "Rejected",
    uploadedBy: "John Doe",
    date: "Oct 22, 2023, 09:30 AM",
    fileType: "DWG",
    fileSize: "12.1 MB",
    description:
      "Added new reinforcement wall to Sector C specifications. Note: Needs review against geological survey #452.",
    icon: "rejected",
  },
  {
    id: "v10",
    version: "Version 1.0",
    status: "Initial Draft",
    uploadedBy: "Alex Morgan",
    date: "Oct 15, 2023, 11:00 AM",
    fileType: "DWG",
    fileSize: "11.8 MB",
    description:
      "Initial upload of the foundation plan for Sector C. Based on survey data from Q3 2023.",
    icon: "upload",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const statusConfig: Record<StatusType, { label: string; className: string }> = {
  Approved: {
    label: "Approved",
    className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  },
  "Pending Review": {
    label: "Pending Review",
    className: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  },
  Rejected: {
    label: "Rejected",
    className: "bg-red-500/20 text-red-400 border border-red-500/30",
  },
  "Initial Draft": {
    label: "Initial Draft",
    className: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  },
};

function StatusBadge({ status }: { status: StatusType }) {
  const cfg = statusConfig[status];
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ── Timeline Icon ──────────────────────────────────────────────────────────
function TimelineIcon({ type }: { type: Version["icon"] }) {
  const base =
    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10";

  if (type === "pin")
    return (
      <div className={`${base} bg-violet-600`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </div>
    );

  if (type === "clock")
    return (
      <div className={`${base} bg-[#1e2a3a] border border-slate-600`}>
        <History size={18} className="text-slate-400" />
      </div>
    );

  if (type === "rejected")
    return (
      <div className={`${base} bg-[#1e2a3a] border border-slate-600`}>
        <History size={18} className="text-slate-400" />
      </div>
    );

  return (
    <div className={`${base} bg-[#1e2a3a] border border-slate-600`}>
      <LogIn size={18} className="text-slate-400" />
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
interface NavItem {
  icon: React.ReactNode;
  label: string;
  hasChildren?: boolean;
  active?: boolean;
  children?: { label: string; active?: boolean }[];
}

function Sidebar() {
  const [versionOpen, setVersionOpen] = useState(true);
  const [auditOpen, setAuditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const topItems: NavItem[] = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", hasChildren: true },
    { icon: <FolderOpen size={18} />, label: "Documents" },
    { icon: <Upload size={18} />, label: "Upload & Digitization" },
    { icon: <Building2 size={18} />, label: "Organization" },
    { icon: <Search size={18} />, label: "Search & Retrieval" },
  ];

  const bottomItems: NavItem[] = [
    { icon: <Shield size={18} />, label: "Access & Permissions", hasChildren: true },
    { icon: <BarChart2 size={18} />, label: "Reports" },
    {
      icon: <ClipboardList size={18} />,
      label: "Audit & Logs",
      hasChildren: true,
    },
    { icon: <Users size={18} />, label: "User management" },
    {
      icon: <Settings size={18} />,
      label: "Settings",
      hasChildren: true,
    },
    { icon: <HelpCircle size={18} />, label: "Help & Support" },
  ];

  return (
    <aside className="w-[210px] min-w-[210px] bg-[#0f172a] flex flex-col h-screen border-r border-slate-800">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <rect x="3" y="3" width="8" height="8" rx="1" />
            <rect x="13" y="3" width="8" height="8" rx="1" />
            <rect x="3" y="13" width="8" height="8" rx="1" />
            <rect x="13" y="13" width="8" height="8" rx="1" />
          </svg>
        </div>
        <span className="text-white font-bold text-base tracking-wide">MIGECO</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {topItems.map((item) => (
          <NavRow key={item.label} item={item} />
        ))}

        {/* Version Control */}
        <div>
          <button
            onClick={() => setVersionOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-violet-400 bg-violet-900/30 font-medium text-sm group hover:bg-violet-900/40 transition-colors"
          >
            <GitBranch size={18} />
            <span className="flex-1 text-left">Version Control</span>
            {versionOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {versionOpen && (
            <div className="ml-8 mt-0.5 space-y-0.5">
              <SubNavRow label="History" active />
              <SubNavRow label="Compare" />
              <SubNavRow label="Restore" />
            </div>
          )}
        </div>

        {bottomItems.map((item) => {
          if (item.label === "Audit & Logs") {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setAuditOpen((v) => !v)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 text-sm transition-colors"
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {auditOpen ? <ChevronDown size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            );
          }
          if (item.label === "Settings") {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setSettingsOpen((v) => !v)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 text-sm transition-colors"
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {settingsOpen ? <ChevronDown size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            );
          }
          return <NavRow key={item.label} item={item} />;
        })}
      </nav>

      {/* Storage */}
      <div className="m-3 p-3 rounded-xl bg-[#1a2540] border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs font-medium">Storage</span>
          <span className="text-slate-200 text-xs font-semibold">78%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
            style={{ width: "78%" }}
          />
        </div>
        <p className="text-slate-500 text-[11px] mt-2">Using 3.9 TB of 5 TB</p>
      </div>
    </aside>
  );
}

function NavRow({ item }: { item: NavItem }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 text-sm transition-colors">
      {item.icon}
      <span className="flex-1 text-left">{item.label}</span>
      {item.hasChildren && <ChevronDown size={14} />}
    </button>
  );
}

function SubNavRow({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        active
          ? "text-white bg-slate-700/60 font-medium"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
      }`}
    >
      {label}
    </button>
  );
}

// ── Top Bar ────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header className="h-14 bg-[#0f172a] border-b border-slate-800 flex items-center px-5 gap-4 flex-shrink-0">
      {/* Title */}
      <div className="mr-4">
        <p className="text-white font-semibold text-sm leading-tight">Document</p>
        <p className="text-white font-semibold text-sm leading-tight">History</p>
      </div>

      <div className="w-px h-6 bg-slate-700" />

      {/* File chip */}
      <div className="flex items-center gap-2 bg-[#1e2a3a] border border-slate-700 rounded-lg px-3 py-1.5">
        <FileText size={14} className="text-slate-400" />
        <span className="text-slate-200 text-xs font-medium">foundation_plan_sector_c.dwg</span>
        <span className="ml-1 text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
          IN REVIEW
        </span>
      </div>

      <div className="flex-1" />

      {/* Print Log */}
      <button className="flex items-center gap-2 bg-[#1e2a3a] border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors">
        <Printer size={14} />
        <span>
          Print
          <br />
          Log
        </span>
      </button>

      {/* Upload New Version */}
      <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
        <Upload size={14} />
        <span>
          Upload New
          <br />
          Version
        </span>
      </button>

      <div className="w-px h-6 bg-slate-700" />

      {/* Bell */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors">
        <Bell size={18} className="text-slate-400" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      <div className="w-px h-6 bg-slate-700" />

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-white text-xs font-semibold leading-tight">Alex Morgan</p>
          <p className="text-slate-400 text-[11px] leading-tight">Lead Geologist</p>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">AM</span>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </div>
    </header>
  );
}

// ── Version Card ───────────────────────────────────────────────────────────
function VersionCard({ v, isLast }: { v: Version; isLast: boolean }) {
  return (
    <div className="flex gap-4 relative">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <TimelineIcon type={v.icon} />
        {!isLast && <div className="w-px flex-1 bg-slate-700/60 mt-1" />}
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-6 rounded-xl border ${
          v.isCurrent
            ? "border-violet-500/50 bg-[#151f32]"
            : "border-slate-700/60 bg-[#131c2e]"
        } overflow-hidden`}
      >
        {/* Current Version Badge */}
        {v.isCurrent && (
          <div className="flex justify-end">
            <div className="bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase">
              Current Version
            </div>
          </div>
        )}

        <div className="flex">
          {/* Left content */}
          <div className="flex-1 p-4">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-white font-semibold text-base">{v.version}</h3>
              <StatusBadge status={v.status} />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-5 text-slate-400 text-xs mb-3">
              <span className="flex items-center gap-1.5">
                <User size={12} />
                Uploaded by{" "}
                <span className="text-slate-200 font-medium">{v.uploadedBy}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {v.date}
              </span>
              <span className="flex items-center gap-1.5">
                <FileText size={12} />
                {v.fileType}, {v.fileSize}
              </span>
            </div>

            {/* Description */}
            <div className="bg-[#0f172a] rounded-lg p-3 text-slate-300 text-sm leading-relaxed mb-3">
              {v.description}
            </div>

            {/* Tags */}
            {v.tags && (
              <div className="flex gap-2 flex-wrap">
                {v.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-400 bg-slate-700/50 border border-slate-600/50 px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex flex-col gap-2 p-4 pl-0 justify-start min-w-[120px]">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                v.isCurrent
                  ? "bg-violet-600 hover:bg-violet-700 text-white"
                  : "bg-[#1e2a3a] border border-slate-600/60 hover:border-slate-500 text-slate-200"
              }`}
            >
              <Eye size={14} />
              View
            </button>
            <button className="flex items-center gap-2 bg-[#1e2a3a] border border-slate-600/60 hover:border-slate-500 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Download size={14} />
              Download
            </button>
            <button className="flex items-center gap-2 bg-[#1e2a3a] border border-slate-600/60 hover:border-slate-500 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <ArrowLeftRight size={14} />
              Compare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function VersionHistory() {
  return (
    <div className="flex h-screen bg-[#0d1525] text-white overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">Version Timeline</h1>
              <p className="text-slate-400 text-sm">
                Track all revisions and modifications for this document.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-[#1e2a3a] border border-slate-700 hover:border-slate-500 text-slate-200 text-sm px-3 py-2 rounded-lg transition-colors">
                <Filter size={14} className="text-slate-400" />
                All Versions
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              <button className="flex items-center gap-2 bg-[#1e2a3a] border border-slate-700 hover:border-slate-500 text-slate-200 text-sm px-3 py-2 rounded-lg transition-colors">
                <Calendar size={14} className="text-slate-400" />
                Last 30 Days
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="w-full">
            {versions.map((v, i) => (
              <VersionCard key={v.id} v={v} isLast={i === versions.length - 1} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
