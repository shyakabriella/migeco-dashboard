import React from 'react';
import { Search, Bell, ChevronDown, FileText } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 border-b border-[#1e2235] bg-[#0a0c1a] flex items-center justify-between px-8">
      <div className="flex items-center gap-6">
        <h1 className="text-white font-semibold text-lg">Help Center</h1>
        <div className="flex items-center gap-2 text-[#8e97a4] text-sm">
          <FileText size={16} />
          <span>Frequently Asked Questions</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6275]">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search for answers..." 
            className="bg-[#12162a] text-[#8e97a4] text-sm py-2 pl-10 pr-4 rounded-md border border-[#1e2235] w-64 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative p-2 text-[#8e97a4] hover:text-white cursor-pointer transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-[#0a0c1a]"></span>
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-[#1e2235] cursor-pointer group">
            <div className="text-right">
              <div className="text-sm font-medium text-white">Alex Morgan</div>
              <div className="text-[10px] text-[#5a6275]">Lead Geologist</div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#0a0c1a] rounded-full p-0.5">
                <ChevronDown size={10} className="text-[#8e97a4]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
