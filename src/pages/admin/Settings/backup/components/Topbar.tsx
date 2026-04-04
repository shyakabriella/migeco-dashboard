export default function Topbar() {
  return (
    <header className="h-16 bg-[#0b0c14]/50 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md">
      {/* Left */}
      <div className="flex items-center gap-6">
        <h2 className="text-sm font-semibold text-slate-200">System Settings</h2>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Backup & Restore
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        {/* Bell */}
        <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-200 leading-tight">Alex Morgan</p>
            <p className="text-[10px] text-slate-500 leading-tight">Lead Geologist</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-white text-xs font-semibold">
            AM
          </div>
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
}
