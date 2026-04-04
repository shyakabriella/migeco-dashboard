export default function Header() {
  return (
    <header className="h-[60px] min-h-[60px] bg-[#0f1623] border-b border-white/5 flex items-center justify-between px-6">
      {/* Left: Title + breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h1 className="text-white font-semibold text-sm leading-tight">Construction Reports</h1>
          <nav className="text-xs text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer">Organization</span>
            <span className="mx-1">›</span>
            <span className="hover:text-slate-300 cursor-pointer">Document Types</span>
            <span className="mx-1">›</span>
            <span className="text-slate-400">Construction</span>
          </nav>
        </div>
      </div>

      {/* Right: Upload + Bell + User */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-[#3b5bdb] hover:bg-[#3451c7] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Report
        </button>

        {/* Bell */}
        <div className="relative">
          <button className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            2
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-white/10" />

        {/* User */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div>
            <p className="text-white text-xs font-semibold text-right leading-tight">Alex Morgan</p>
            <p className="text-slate-500 text-xs text-right">Lead Geologist</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            AM
          </div>
          <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
}
