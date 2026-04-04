import React from 'react';
import { Search, Bell, Command } from 'lucide-react';

const Topbar: React.FC = () => {
  return (
    <div className="h-14 flex items-center justify-between px-5 bg-[#0d1117] border-b border-white/5 flex-shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-2 w-[380px] hover:border-white/15 transition-colors cursor-text">
        <Search size={15} className="text-slate-500 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search for documents, projects, or metadata..."
          className="bg-transparent text-sm text-slate-400 placeholder-slate-600 outline-none flex-1 min-w-0"
        />
        <div className="flex items-center gap-0.5 bg-white/8 rounded px-1.5 py-0.5 flex-shrink-0">
          <Command size={10} className="text-slate-500" />
          <span className="text-slate-500 text-xs">K</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
          <Bell size={18} className="text-slate-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-[#0d1117]" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
          <div className="text-right">
            <p className="text-sm font-semibold text-white leading-tight">Alex Morgan</p>
            <p className="text-xs text-slate-500 leading-tight">Lead Geologist</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            AM
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
