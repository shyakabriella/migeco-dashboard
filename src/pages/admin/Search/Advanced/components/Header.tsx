import { Bell, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="h-14 bg-[#0d1117] border-b border-[#1e2433] flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-white tracking-wide">
        Advanced Search &amp; Filters
      </h1>
      <div className="flex items-center gap-4">
        {/* Bell */}
        <div className="relative">
          <button className="w-8 h-8 rounded-lg bg-[#131924] border border-[#1e2433] flex items-center justify-center text-[#8b96a8] hover:text-white transition-colors">
            <Bell size={15} />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">
            2
          </span>
        </div>

        {/* User */}
        <button className="flex items-center gap-2 bg-[#131924] border border-[#1e2433] rounded-lg px-3 py-1.5 hover:border-indigo-500/50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
            AM
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-white leading-tight">Alex Morgan</p>
            <p className="text-[10px] text-[#8b96a8] leading-tight">Lead Geologist</p>
          </div>
          <ChevronDown size={12} className="text-[#8b96a8] ml-1" />
        </button>
      </div>
    </header>
  );
}
