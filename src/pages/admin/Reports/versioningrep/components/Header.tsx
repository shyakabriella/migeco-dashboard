import { Bell, ChevronRight, ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-20 bg-[#0F1023] border-b border-[#1E203B] flex items-center justify-between px-8 text-slate-300">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-500 font-medium">Reports</span>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-white font-semibold">Versioning Report</span>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 rounded-full hover:bg-[#1E203B] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0F1023]"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-white leading-tight">Alex Morgan</p>
            <p className="text-xs text-slate-500 leading-tight">Lead Geologist</p>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" 
              alt="Alex Morgan" 
              className="w-10 h-10 rounded-full border-2 border-[#1E203B]"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0F1023]"></div>
          </div>
          <button className="p-1 hover:bg-[#1E203B] rounded-lg transition-colors">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
