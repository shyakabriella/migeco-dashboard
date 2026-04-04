import React from 'react';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Layers,
  Search,
  History,
  Shield,
  BarChart2,
  List,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#141523] h-screen flex flex-col border-r border-[#26283b] text-gray-300">
      <div className="h-16 flex items-center px-6 border-b border-[#26283b]">
        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="text-white font-bold text-lg tracking-wide">MIGEC3</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1 px-3">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" hasSubmenu />
          <NavItem icon={<FileText size={18} />} label="Documents" />
          <NavItem icon={<UploadCloud size={18} />} label="Upload & Digitization" />
          <NavItem icon={<Layers size={18} />} label="Organization" />
          <NavItem icon={<Search size={18} />} label="Search & Retrieval" />
          <NavItem icon={<History size={18} />} label="Version Control" />
          <NavItem icon={<Shield size={18} />} label="Access & Permissions" hasSubmenu />
          <NavItem icon={<BarChart2 size={18} />} label="Reports" />
          
          <div className="pt-2">
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-[#1d1f33] text-indigo-400">
              <div className="flex items-center">
                <List size={18} className="mr-3" />
                Audit & Logs
              </div>
              <ChevronUp size={16} />
            </button>
            <div className="mt-1 space-y-1 pl-11">
              <SubNavItem label="Overview" />
              <SubNavItem label="Audit Trail" />
              <SubNavItem label="Login History" />
              <SubNavItem label="System Actions Log" active />
              <SubNavItem label="Alerts / Suspicious" />
            </div>
          </div>

          <NavItem icon={<Users size={18} />} label="Users Management" />
          <NavItem icon={<Settings size={18} />} label="Settings" hasSubmenu />
        </nav>
      </div>

      <div className="p-4 border-t border-[#26283b]">
        <button className="flex items-center text-sm text-gray-400 hover:text-white mb-4 px-2">
          <HelpCircle size={18} className="mr-3" />
          Help & Support
        </button>
        
        <div className="bg-[#1c1d2e] rounded-lg p-4 mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Storage</span>
            <span className="text-xs text-white font-medium">78%</span>
          </div>
          <div className="w-full bg-[#2a2d42] rounded-full h-1.5 mb-2">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
          </div>
          <p className="text-[10px] text-gray-500">Using 3.9 TB of 5 TB</p>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, hasSubmenu, active }: { icon: React.ReactNode; label: string; hasSubmenu?: boolean; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active ? 'bg-[#1d1f33] text-indigo-400' : 'text-gray-400 hover:bg-[#1d1f33] hover:text-white'
      }`}
    >
      <div className="flex items-center">
        <span className={`mr-3 ${active ? 'text-indigo-400' : 'text-gray-500'}`}>
          {icon}
        </span>
        {label}
      </div>
      {hasSubmenu && <ChevronDown size={16} className="text-gray-600" />}
    </button>
  );
}

function SubNavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
        active ? 'bg-[#1e2035] text-white border-l-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  );
}
