import { Bell, ChevronDown, Search } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      {/* Search */}
      <div className="flex w-[360px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <Search size={14} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search archives..."
          className="flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
        />
        <span className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] text-slate-400">
          1K
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white transition-colors hover:bg-slate-50">
          <Bell size={15} className="text-slate-500" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-semibold leading-tight text-slate-900">
              Alex Morgan
            </p>
            <p className="text-[10px] text-slate-500">Lead Geologist</p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
            AM
          </div>

          <ChevronDown size={13} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}