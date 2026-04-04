import { useState } from "react";

const DocumentTypesNav = () => {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <span>Document Types</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-0.5 ml-2 border-l border-white/10 pl-2 space-y-0.5">
          {["All Types", "Geological", "Geotechnical"].map((item) => (
            <div key={item} className="px-3 py-1.5 text-xs text-slate-500 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
              {item}
            </div>
          ))}
          <div className="px-3 py-1.5 text-xs text-white font-semibold bg-[#3b5bdb] rounded-lg cursor-pointer">
            Construction
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({
  icon,
  label,
  children,
  active = false,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
  active?: boolean;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => children && setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors ${
          active
            ? "text-white bg-white/10"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
          <span>{label}</span>
        </div>
        {children && (
          <svg
            className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {children && open && <div className="mt-1 ml-3">{children}</div>}
    </div>
  );
};

const SubItem = ({
  label,
  active = false,
  indent = false,
}: {
  label: string;
  active?: boolean;
  indent?: boolean;
}) => (
  <div
    className={`px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
      indent ? "ml-4" : ""
    } ${
      active
        ? "text-white bg-[#3b5bdb] font-medium"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    }`}
  >
    {label}
  </div>
);

export default function Sidebar() {
  return (
    <aside className="w-[185px] min-w-[185px] bg-[#0f1623] flex flex-col h-screen border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/5">
        <div className="w-8 h-8 bg-[#3b5bdb] rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <span className="text-white font-bold text-base tracking-wide">MIGECO</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
          label="Dashboard"
          defaultOpen={false}
        />

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          label="Documents"
        />

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          }
          label="Upload & Digitization"
        />

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          label="Organization"
          active
          defaultOpen
        >
          <SubItem label="Categories" />
          <DocumentTypesNav />
          <SubItem label="Projects" />
          <SubItem label="Departments" />
          <SubItem label="Tags" />
        </NavItem>

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          label="Search & Retrieval"
        />

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Version Control"
        />

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          label="Access & Permissions"
        />

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          label="Reports"
        />

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          label="Audit & Logs"
          defaultOpen={false}
        />

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="User management"
        />

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Settings"
          defaultOpen={false}
        />

        <NavItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Help & Support"
        />
      </nav>

      {/* Storage */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs">Storage</span>
          <span className="text-white text-xs font-semibold">78%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[78%] bg-[#3b5bdb] rounded-full" />
        </div>
        <p className="text-slate-500 text-xs mt-2">Using 3.9 TB of 5 TB</p>
      </div>
    </aside>
  );
}
