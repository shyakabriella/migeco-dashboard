import { Bell, ChevronRight, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0f111a] flex items-center justify-between px-8 text-sm">
      <div className="flex items-center gap-4 text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-white">Access & Permissions</span>
        </div>
        <ChevronRight className="w-4 h-4 opacity-50" />
        <span className="opacity-70">Access Rules</span>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#0f111a] rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-800 pl-6 group cursor-pointer">
          <div className="text-right">
            <p className="font-bold text-white group-hover:text-blue-400 transition-colors">Alex Morgan</p>
            <p className="text-xs text-slate-400">Lead Geologist</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-blue-500/30 overflow-hidden ring-2 ring-blue-500/20">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
