import { Bell, ChevronDown, Search } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#161b27] border-b border-[#252d3d] shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-[#1e2435] border border-[#2a3347] rounded-lg px-3 py-2 w-[360px]">
        <Search size={14} className="text-slate-500" />
        <input
          type="text"
          placeholder="Search favorites..."
          className="bg-transparent text-xs text-slate-300 placeholder-slate-500 outline-none flex-1"
        />
        <span className="text-[10px] border border-[#3a4460] rounded px-1 py-0.5 text-slate-500 font-mono">
          1K
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-full bg-[#1e2435] border border-[#2a3347]">
          <Bell size={15} className="text-slate-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#161b27]" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-semibold text-white leading-tight">
              Alex Morgan
            </p>
            <p className="text-[10px] text-slate-400">Lead Geologist</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
            AM
          </div>
          <ChevronDown size={13} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}
