import { useState } from "react";

const NavItem = ({
  icon,
  label,
  active = false,
  hasChevron = false,
  expanded = false,
  onClick,
  indent = false,
  highlight = false,
}: {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  hasChevron?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  indent?: boolean;
  highlight?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-[6px] rounded-md cursor-pointer text-sm transition-colors
      ${indent ? "pl-7" : ""}
      ${active ? "bg-[#1e2330] text-white" : "text-[#8b9bb4] hover:text-white hover:bg-[#1a1f2e]"}
      ${highlight ? "text-[#4f8ef7]" : ""}
    `}
  >
    {icon && <span className="text-base flex-shrink-0">{icon}</span>}
    <span className="flex-1 font-medium">{label}</span>
    {hasChevron && (
      <svg
        className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    )}
  </div>
);

export default function Sidebar() {
  const [docsExpanded, setDocsExpanded] = useState(true);

  return (
    <div className="w-[200px] flex-shrink-0 bg-[#0d1117] border-r border-[#1e2330] flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#1e2330]">
        <div className="w-8 h-8 bg-[#3b5bdb] rounded-lg flex items-center justify-center text-white font-bold text-sm">
          M
        </div>
        <span className="text-white font-bold text-base tracking-wide">MIGECO</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {/* Dashboard */}
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          }
          label="Dashboard"
          hasChevron
        />

        {/* Documents */}
        <div>
          <NavItem
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            }
            label="Documents"
            active
            hasChevron
            expanded={docsExpanded}
            onClick={() => setDocsExpanded(!docsExpanded)}
          />
          {docsExpanded && (
            <div className="mt-0.5 space-y-0.5">
              <NavItem label="All Documents" indent />
              <NavItem label="My Documents" indent />
              <NavItem label="Shared with Me" indent />
              <NavItem label="Favorites" indent />
              <NavItem label="Recent" indent />
              <NavItem label="Archive" indent active highlight />
            </div>
          )}
        </div>

        {/* Other nav items */}
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          }
          label="Upload & Digitization"
        />
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          label="Organization"
        />
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
          }
          label="Search & Retrieval"
        />
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
          label="Version Control"
        />
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          label="Access & Permissions"
          hasChevron
        />
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          label="Reports"
        />
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          label="Audit & Logs"
          hasChevron
        />
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          label="Users Management"
        />
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Settings"
          hasChevron
        />

        <div className="pt-1 border-t border-[#1e2330] mt-2">
          <NavItem
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="Help & Support"
          />
        </div>
      </nav>

      {/* Storage */}
      <div className="px-4 py-4 border-t border-[#1e2330]">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-[#8b9bb4]">Storage</span>
          <span className="text-xs text-white font-semibold">78%</span>
        </div>
        <div className="w-full bg-[#1e2330] rounded-full h-1.5 mb-1.5">
          <div className="bg-[#3b5bdb] h-1.5 rounded-full" style={{ width: "78%" }} />
        </div>
        <p className="text-[10px] text-[#8b9bb4]">Using 3.9 TB of 5 TB</p>
      </div>
    </div>
  );
}
