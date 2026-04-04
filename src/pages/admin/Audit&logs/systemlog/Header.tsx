import { Bell, ChevronRight, Monitor } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 border-b border-[#26283b] bg-[#141523] px-6 flex items-center justify-between text-gray-300">
      <div className="flex items-center text-sm">
        <span className="font-semibold text-white">Audit & Logs</span>
        <ChevronRight size={16} className="mx-2 text-gray-500" />
        <Monitor size={14} className="mr-1 text-gray-400" />
        <span className="text-gray-400">System Actions Log</span>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#141523]"></span>
        </button>

        <div className="flex items-center border-l border-[#26283b] pl-6">
          <div className="text-right mr-3">
            <div className="text-sm font-semibold text-white">Alex Morgan</div>
            <div className="text-xs text-gray-400">Lead Geologist</div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Alex Morgan"
            className="w-10 h-10 rounded-full object-cover border-2 border-[#26283b]"
          />
        </div>
      </div>
    </header>
  );
}
