import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  UploadCloud, 
  Users, 
  Search, 
  History, 
  Settings, 
  ShieldCheck, 
  BarChart3, 
  FileSearch, 
  HelpCircle,
  ChevronDown,
  Layers
} from 'lucide-react';
import { cn } from './utils';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#0a0c14] text-gray-400 flex flex-col border-r border-gray-800 h-screen sticky top-0">
      <div className="p-6 flex items-center gap-2">
        <div className="bg-indigo-600 p-1.5 rounded-lg">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">MIGECO</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
        <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active expanded>
          <SubNavItem label="Overview" active />
          <SubNavItem label="My Tasks" />
          <SubNavItem label="Recent Activity" />
        </NavItem>
        
        <NavItem icon={<FileText size={18} />} label="Documents" />
        
        <NavItem icon={<UploadCloud size={18} />} label="Upload & Digitization" expanded>
          <SubNavItem label="Upload" />
          <SubNavItem label="Bulk" active />
          <SubNavItem label="Scan" />
          <SubNavItem label="History" />
        </NavItem>

        <NavItem icon={<Users size={18} />} label="Organization" />
        <NavItem icon={<Search size={18} />} label="Search & Retrieval" />
        <NavItem icon={<History size={18} />} label="Version Control" />
        <NavItem icon={<ShieldCheck size={18} />} label="Access & Permissions" />
        <NavItem icon={<BarChart3 size={18} />} label="Reports" />
        <NavItem icon={<FileSearch size={18} />} label="Audit & Logs" />
        <NavItem icon={<Users size={18} />} label="Users Management" />
        <NavItem icon={<Settings size={18} />} label="Settings" />
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-[#151926] p-4 rounded-xl border border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-400">Storage</span>
            <span className="text-xs font-bold text-white">78%</span>
          </div>
          <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-[78%]" />
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Using 3.9 TB of 5 TB</p>
        </div>
        <button className="flex items-center gap-2 text-xs font-medium text-gray-400 mt-4 px-2">
          <HelpCircle size={16} /> Help & Support
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active, expanded, children }: any) => (
  <div className="mb-1">
    <button className={cn(
      "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
      active ? "bg-indigo-600/10 text-indigo-400" : "hover:bg-gray-800/50 hover:text-white"
    )}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {children && <ChevronDown size={14} className={expanded ? "" : "-rotate-90"} />}
    </button>
    {expanded && children && (
      <div className="mt-1 flex flex-col">
        {children}
      </div>
    )}
  </div>
);

const SubNavItem = ({ label, active }: any) => (
  <button className={cn(
    "w-full text-left pl-11 py-1.5 text-sm transition-colors",
    active ? "text-white font-medium" : "text-gray-500 hover:text-gray-300"
  )}>
    {label}
  </button>
);

export default Sidebar;
