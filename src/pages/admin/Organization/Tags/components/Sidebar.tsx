import type { ElementType } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Users, 
  Search, 
  History, 
  ShieldCheck, 
  BarChart3, 
  ClipboardList, 
  UserCircle, 
  Settings, 
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../utils/cn';

interface NavItemProps {
  icon: ElementType;
  label: string;
  isActive?: boolean;
  hasSubmenu?: boolean;
  isSubmenuOpen?: boolean;
  indent?: boolean;
}

const NavItem = ({ icon: Icon, label, isActive, hasSubmenu, isSubmenuOpen, indent }: NavItemProps) => (
  <div className={cn(
    "flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors group",
    isActive ? "bg-[#252445] text-white border-r-4 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-[#1a1932]",
    indent && "pl-12"
  )}>
    <div className="flex items-center gap-3">
      <Icon size={18} className={isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    {hasSubmenu && (
      isSubmenuOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    )}
  </div>
);

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-[#0d0c1d] border-r border-gray-800 flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <span className="text-white font-bold tracking-wider text-lg uppercase">Migeco</span>
        </div>
      </div>

      <nav className="flex-1">
        <NavItem icon={LayoutDashboard} label="Dashboard" hasSubmenu />
        <NavItem icon={FileText} label="Documents" />
        <NavItem icon={Upload} label="Upload & Digitization" />
        
        <NavItem icon={Users} label="Organization" isActive hasSubmenu isSubmenuOpen />
        <div className="bg-[#121124]">
          <NavItem icon={() => null} label="Categories" indent />
          <NavItem icon={() => null} label="Document Types" indent hasSubmenu />
          <NavItem icon={() => null} label="Projects" indent />
          <NavItem icon={() => null} label="Departments" indent />
          <NavItem icon={() => null} label="Tags" isActive indent />
        </div>

        <NavItem icon={Search} label="Search & Retrieval" />
        <NavItem icon={History} label="Version Control" />
        <NavItem icon={ShieldCheck} label="Access & Permissions" hasSubmenu />
        <NavItem icon={BarChart3} label="Reports" />
        <NavItem icon={ClipboardList} label="Audit & Logs" hasSubmenu />
        <NavItem icon={UserCircle} label="User management" />
        <NavItem icon={Settings} label="Settings" hasSubmenu />
        
        <div className="mt-8 border-t border-gray-800 pt-4 mb-20">
          <NavItem icon={HelpCircle} label="Help & Support" />
        </div>
      </nav>

      <div className="p-4 bg-[#121124] border-t border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">Storage</span>
          <span className="text-xs text-white font-bold">78%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 w-[78%]"></div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 italic">Using 3.9 TB of 5 TB</p>
      </div>
    </aside>
  );
};
