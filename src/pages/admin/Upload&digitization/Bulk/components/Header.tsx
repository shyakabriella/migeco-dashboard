import { Search, Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0a0c14] sticky top-0 z-10">
      <div className="relative w-1/2 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search for documents, projects, or metadata..."
          className="w-full bg-[#151926] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded">⌘K</div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-white">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-[#0a0c14]" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">Alex Morgan</p>
            <p className="text-[10px] text-gray-500">Lead Geologist</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden border-2 border-gray-800">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
