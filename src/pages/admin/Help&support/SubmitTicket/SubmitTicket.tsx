import { useState, useRef } from "react";
import AdminSidebar from "../../AdminSidebar";

// ── Icons (inline SVG helpers) ──────────────────────────────────────────────
const Icon = ({ d, size = 16, className = "" }: { d: string; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const GridIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const ChevronDown = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUp = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const SearchIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const BellIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const UploadCloudIcon = () => (
  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const TicketIcon = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.16 6.16l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const MailIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const ClockIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const UserIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const SlidersIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

const LogOutIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ── Nav Data ────────────────────────────────────────────────────────────────
const navItems = [
  { label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", hasChildren: true },
  { label: "Documents", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" },
  { label: "Upload & Digitization", icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12" },
  { label: "Organization", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" },
  { label: "Search & Retrieval", icon: "M11 19A8 8 0 1 0 3 11a8 8 0 0 0 8 8z M21 21l-4.35-4.35" },
  { label: "Version Control", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" },
  { label: "Access & Permissions", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", hasChildren: true },
  { label: "Reports", icon: "M18 20V10 M12 20V4 M6 20v-6" },
  { label: "Audit & Logs", icon: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", hasChildren: true },
  { label: "Users Management", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" },
  { label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z", hasChildren: true },
  { label: "Help & Support", icon: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01", isActive: true, hasChildren: true },
];

export default function SubmitTicket() {
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [category, setCategory] = useState("Technical Issue");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const recentTickets = [
    { id: "#TKT-2994", title: "Cannot access Project Alpha folder", status: "In Progress", statusColor: "bg-amber-500", updated: "Updated 2h ago" },
    { id: "#TKT-2891", title: "Request for new CAD software license", status: "Resolved", statusColor: "bg-emerald-500", updated: "Closed yesterday" },
    { id: "#TKT-2845", title: "Login issues on mobile app", status: "Pending", statusColor: "bg-slate-500", updated: "Updated 3 days ago" },
  ];

  return (
    <div className="flex h-screen bg-[#0f1117] text-white overflow-hidden font-sans">

      {/* ── Sidebar ── */}
        <AdminSidebar/>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top Nav ── */}
        <header className="h-12 bg-[#13151f] border-b border-white/5 flex items-center px-5 gap-4 z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Help Center</span>
            <span className="text-slate-600">|</span>
            <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Submit Support Ticket
            </button>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="flex items-center gap-2 bg-[#1c1f2e] border border-white/8 rounded-lg px-3 py-1.5 w-56">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search knowledge base..."
              className="bg-transparent text-xs text-slate-300 placeholder-slate-500 outline-none w-full"
            />
          </div>

          {/* Bell */}
          <button className="relative p-1.5 text-slate-400 hover:text-white transition-colors">
            <BellIcon />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#13151f]" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-1 transition-colors"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div className="text-right">
                <p className="text-xs font-semibold text-white leading-tight">Alex Morgan</p>
                <p className="text-[10px] text-slate-400 leading-tight">Lead Geologist</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                AM
              </div>
              {showProfileDropdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#1a1d2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-sm font-semibold text-white">Alex Morgan</p>
                  <p className="text-xs text-slate-400">alex.morgan@migeco.com</p>
                </div>
                <div className="py-1">
                  {[
                    { icon: <UserIcon />, label: "My Profile" },
                    { icon: <SettingsIcon />, label: "Account Settings" },
                    { icon: <SlidersIcon />, label: "Preferences" },
                  ].map(({ icon, label }) => (
                    <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                      <span className="text-slate-400">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/8 py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOutIcon />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto p-5 bg-[#0f1117]">
          <div className="flex gap-5 max-w-[1200px] mx-auto">

            {/* ── Create Ticket Form ── */}
            <div className="flex-1 bg-[#13151f] rounded-2xl border border-white/8 p-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-6 pb-5 border-b border-white/8">
                <div className="w-11 h-11 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                  <TicketIcon />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create New Ticket</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Fill out the details below to submit a support request.</p>
                </div>
              </div>

              {/* Row: Category + Priority */}
              <div className="flex gap-4 mb-5">
                {/* Issue Category */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-300 mb-2">Issue Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#1c1f2e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white appearance-none outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <option>Technical Issue</option>
                      <option>Access Request</option>
                      <option>Software Request</option>
                      <option>Data Issue</option>
                      <option>Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Priority Level */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-300 mb-2">Priority Level</label>
                  <div className="flex bg-[#1c1f2e] border border-white/10 rounded-lg p-0.5">
                    {(["Low", "Medium", "High"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${
                          priority === p
                            ? p === "High"
                              ? "bg-red-500 text-white"
                              : p === "Medium"
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-500 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-300 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="Brief summary of the issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#1c1f2e] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-300 mb-2">Description</label>
                <div className="border border-white/10 rounded-lg overflow-hidden bg-[#1c1f2e] focus-within:border-indigo-500 transition-colors">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 px-3 py-2 border-b border-white/8">
                    {[
                      { label: "B", title: "Bold", active: boldActive, onClick: () => setBoldActive(!boldActive), style: "font-bold" },
                      { label: "I", title: "Italic", active: italicActive, onClick: () => setItalicActive(!italicActive), style: "italic" },
                      { label: "U", title: "Underline", active: underlineActive, onClick: () => setUnderlineActive(!underlineActive), style: "underline" },
                    ].map(({ label, title, active, onClick, style }) => (
                      <button
                        key={title}
                        onClick={onClick}
                        title={title}
                        className={`w-7 h-7 rounded text-xs flex items-center justify-center transition-colors ${style} ${active ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/8 hover:text-white"}`}
                      >
                        {label}
                      </button>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    {/* List icons */}
                    <button title="Unordered List" className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:bg-white/8 hover:text-white transition-colors">
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                      </svg>
                    </button>
                    <button title="Ordered List" className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:bg-white/8 hover:text-white transition-colors">
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
                        <path d="M4 6h1v4 M4 10h2 M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
                      </svg>
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button title="Link" className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:bg-white/8 hover:text-white transition-colors">
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                    </button>
                    <button title="Code" className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:bg-white/8 hover:text-white transition-colors">
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                      </svg>
                    </button>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe your issue in detail. Include error messages if applicable..."
                    rows={6}
                    className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-300 mb-2">Attachments</label>
                <div
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 transition-colors cursor-pointer ${
                    isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-indigo-500/50 hover:bg-white/2"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="w-14 h-14 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-400 mb-3">
                    <UploadCloudIcon />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">SVG, PNG, JPG or PDF (max. 10MB)</p>
                  {attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 justify-center">
                      {attachments.map((f, i) => (
                        <span key={i} className="text-xs bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded-md">{f.name}</span>
                      ))}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" multiple accept=".svg,.png,.jpg,.jpeg,.pdf" className="hidden" onChange={handleFileInput} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setSubject(""); setDescription(""); setAttachments([]); setPriority("Medium"); }}
                  className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Submit Ticket
                </button>
              </div>
            </div>

            {/* ── Right Panel ── */}
            <div className="w-[240px] min-w-[240px] flex flex-col gap-4">

              {/* Recent Tickets */}
              <div className="bg-[#13151f] rounded-2xl border border-white/8 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">My Recent Tickets</h3>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">View All</button>
                </div>

                <div className="flex flex-col gap-3">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-white/6 rounded-xl p-3 hover:border-white/12 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-slate-500">{ticket.id}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${ticket.statusColor}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 leading-tight mb-1.5">{ticket.title}</p>
                      <div className="flex items-center gap-1 text-slate-500">
                        <ClockIcon />
                        <span className="text-[10px]">{ticket.updated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Tip */}
              <div className="bg-[#13151f] rounded-2xl border border-white/8 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                    <LightbulbIcon />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Quick Tip</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Before submitting a ticket, try searching our{" "}
                  <button className="text-indigo-400 hover:text-indigo-300 transition-colors">Knowledge Base</button>
                  . Many common issues like password resets or permission errors have instant step-by-step guides available.
                </p>
              </div>

              {/* Support Contact */}
              <div className="bg-[#13151f] rounded-2xl border border-white/8 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Support Contact</h3>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <PhoneIcon />
                    <span className="text-xs text-slate-300">+1 (800) 555-0123</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <MailIcon />
                    <span className="text-xs text-slate-300">support@migeco.com</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <ClockIcon />
                    <span className="text-xs text-slate-300">Mon-Fri, 9am – 6pm EST</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Click outside dropdown */}
      {showProfileDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
      )}
    </div>
  );
}
