
import { Bell, ChevronDown } from 'lucide-react';

export const Header = () => {
  return (
    <header className="h-20 bg-[#0d0c1d] border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-white">Tags & Keywords Management</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <Bell className="text-gray-400 hover:text-white" size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-semibold text-white group-hover:text-indigo-400">Alex Morgan</p>
            <p className="text-xs text-gray-400">Lead Geologist</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-gray-700 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
};
