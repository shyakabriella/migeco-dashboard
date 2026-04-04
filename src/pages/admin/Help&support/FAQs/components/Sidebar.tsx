import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Building2, 
  Search, 
  History, 
  Lock, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Settings, 
  HelpCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#0a0c1a] text-[#8e97a4] flex flex-col h-screen border-r border-[#1e2235]">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="text-white font-bold text-lg tracking-wider">MIGECO</span>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto space-y-0.5 custom-scrollbar">
        <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" hasSubmenu />
        <NavItem icon={<FileText size={18} />} label="Documents" />
        <NavItem icon={<Upload size={18} />} label="Upload & Digitization" />
        <NavItem icon={<Building2 size={18} />} label="Organization" />
        <NavItem icon={<Search size={18} />} label="Search & Retrieval" />
        <NavItem icon={<History size={18} />} label="Version Control" />
        <NavItem icon={<Lock size={18} />} label="Access & Permissions" hasSubmenu />
        <NavItem icon={<BarChart3 size={18} />} label="Reports" />
        <NavItem icon={<ShieldCheck size={18} />} label="Audit & Logs" hasSubmenu />
        <NavItem icon={<Users size={18} />} label="Users Management" />
        <NavItem icon={<Settings size={18} />} label="Settings" hasSubmenu />

        <div className="pt-2">
          <div className="bg-[#1a1f3c] rounded-lg">
            <NavItem 
              icon={<HelpCircle size={18} />} 
              label="Help & Support" 
              active 
              hasSubmenu 
              expanded 
            />
            <div className="pl-11 pb-3 space-y-3 text-sm">
              <div className="text-white font-medium">FAQs</div>
              <div className="text-[#8e97a4] hover:text-white cursor-pointer transition-colors">User Manual</div>
              <div className="text-[#8e97a4] hover:text-white cursor-pointer transition-colors">Submit Ticket</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4">
        <div className="bg-[#12162a]/50 p-4 rounded-xl border border-[#1e2235]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-medium text-[#8e97a4]">Storage</span>
            <span className="text-[11px] text-white font-bold">78%</span>
          </div>
          <div className="w-full bg-[#1e2235] h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-400 h-full w-[78%] rounded-full"></div>
          </div>
          <p className="text-[10px] mt-2 text-[#5a6275]">Using 3.9 TB of 5 TB</p>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, hasSubmenu, active, expanded }: { 
  icon: React.ReactNode, 
  label: string, 
  hasSubmenu?: boolean, 
  active?: boolean,
  expanded?: boolean
}) => (
  <div className={`
    flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors
    ${active ? 'text-white' : 'hover:bg-[#12162a] hover:text-white'}
  `}>
    <div className="flex items-center gap-3">
      <span className={active ? 'text-blue-400' : ''}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    {hasSubmenu && (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
  </div>
);

export default Sidebar;
