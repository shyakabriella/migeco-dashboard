import { useState } from 'react';
import { 
  LayoutDashboard, 
  Files, 
  Upload, 
  Users, 
  Search, 
  History, 
  ShieldCheck, 
  BarChart3, 
  FileText, 
  Settings, 
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const [reportsOpen, setReportsOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Files, label: 'Documents' },
    { icon: Upload, label: 'Upload & Digitization' },
    { icon: Users, label: 'Organization' },
    { icon: Search, label: 'Search & Retrieval' },
    { icon: History, label: 'Version Control' },
    { icon: ShieldCheck, label: 'Access & Permissions', hasSubmenu: true },
  ];

  const reportItems = [
    'Overview',
    'Document Usage Report',
    'Upload & Activity Report',
    'Department/Project Reports',
    'Versioning Report',
    'Access/Permission Report',
  ];

  const bottomItems = [
    { icon: BarChart3, label: 'Reports', hasSubmenu: true },
    { icon: FileText, label: 'Audit & Logs', hasSubmenu: true },
    { icon: Users, label: 'User management' },
    { icon: Settings, label: 'Settings', hasSubmenu: true },
  ];

  return (
    <aside className="w-64 bg-[#0F1023] border-r border-[#1E203B] flex flex-col h-screen text-slate-400 overflow-y-auto shrink-0">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
          <Files className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-white tracking-wider">MIGECO</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <div key={item.label} className="group">
            <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1E203B] hover:text-white transition-colors">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.hasSubmenu && <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        ))}

        <div className="pt-2">
          <button 
            onClick={() => setReportsOpen(!reportsOpen)}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
              reportsOpen ? "bg-[#1E203B] text-indigo-400" : "hover:bg-[#1E203B] hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Reports</span>
            </div>
            {reportsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {reportsOpen && (
            <div className="mt-1 ml-9 space-y-1">
              {reportItems.map((item) => (
                <button
                  key={item}
                  className={cn(
                    "w-full text-left p-2 rounded-lg text-sm transition-colors",
                    item === 'Versioning Report' 
                      ? "text-indigo-400 font-medium" 
                      : "text-slate-500 hover:text-white"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {bottomItems.slice(1).map((item) => (
          <div key={item.label} className="group">
            <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1E203B] hover:text-white transition-colors">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.hasSubmenu && <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </nav>

      <div className="mt-auto px-4 pb-6 space-y-4">
        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E203B] hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Help & Support</span>
        </button>

        <div className="bg-[#15162B] p-4 rounded-xl border border-[#1E203B]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">Storage</span>
            <span className="text-xs font-bold text-white">78%</span>
          </div>
          <div className="w-full bg-[#1E203B] rounded-full h-1.5 mb-3">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">Using 3.9 TB of 5 TB</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
