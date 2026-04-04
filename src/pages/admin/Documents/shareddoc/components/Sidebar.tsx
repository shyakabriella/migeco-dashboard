import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  ChevronDown,
  ChevronRight,
  Upload,
  Building2,
  Search,
  GitBranch,
  Shield,
  BarChart2,
  ClipboardList,
  Users,
  Settings,
  HelpCircle,
  Files,
  User,
  Star,
  Clock,
  Archive,
  Share2,
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  hasChildren?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  indent?: boolean;
  subActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  active,
  hasChildren,
  expanded,
  onClick,
  indent,
  subActive,
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 text-sm select-none
      ${indent ? 'pl-9' : ''}
      ${active
        ? 'bg-blue-600/20 text-blue-300'
        : subActive
        ? 'text-slate-200 bg-white/6'
        : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
  >
    <span className={`flex-shrink-0 ${active ? 'text-blue-400' : subActive ? 'text-slate-400' : 'text-slate-600'}`}>
      {icon}
    </span>
    <span className={`flex-1 ${active || subActive ? 'font-medium' : ''}`}>{label}</span>
    {hasChildren && (
      <span className="text-slate-600 ml-auto">
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </span>
    )}
  </div>
);

interface SidebarProps {
  activeSection: string;
  setActiveSection: (s: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const [docsExpanded, setDocsExpanded] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [accessExpanded, setAccessExpanded] = useState(false);
  const [auditExpanded, setAuditExpanded] = useState(false);

  const docSubSections = ['all-docs', 'my-docs', 'shared', 'favorites', 'recent', 'archive'];
  const isDocActive = docSubSections.includes(activeSection);

  return (
    <div className="w-[210px] min-w-[210px] h-full flex flex-col bg-[#0b0f16] border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-[17px] border-b border-white/5">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
          <div className="grid grid-cols-2 gap-0.5 p-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-white rounded-[1px]" />
            ))}
          </div>
        </div>
        <span className="text-white font-bold text-base tracking-widest">MIGECO</span>
      </div>

      {/* Nav scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-3 space-y-0.5">
        {/* Dashboard */}
        <NavItem
          icon={<LayoutDashboard size={15} />}
          label="Dashboard"
          hasChildren
          expanded={false}
          onClick={() => setActiveSection('dashboard')}
          subActive={activeSection === 'dashboard'}
        />

        {/* Documents group */}
        <NavItem
          icon={<FileText size={15} />}
          label="Documents"
          hasChildren
          expanded={docsExpanded}
          onClick={() => setDocsExpanded(!docsExpanded)}
          subActive={isDocActive && !docsExpanded}
          active={false}
        />
        {docsExpanded && (
          <div className="space-y-0.5 mt-0.5">
            <NavItem
              icon={<Files size={13} />}
              label="All Documents"
              indent
              onClick={() => setActiveSection('all-docs')}
              subActive={activeSection === 'all-docs'}
            />
            <NavItem
              icon={<User size={13} />}
              label="My Documents"
              indent
              onClick={() => setActiveSection('my-docs')}
              subActive={activeSection === 'my-docs'}
            />
            <NavItem
              icon={<Share2 size={13} />}
              label="Shared with Me"
              indent
              onClick={() => setActiveSection('shared')}
              active={activeSection === 'shared'}
            />
            <NavItem
              icon={<Star size={13} />}
              label="Favorites"
              indent
              onClick={() => setActiveSection('favorites')}
              subActive={activeSection === 'favorites'}
            />
            <NavItem
              icon={<Clock size={13} />}
              label="Recent"
              indent
              onClick={() => setActiveSection('recent')}
              subActive={activeSection === 'recent'}
            />
            <NavItem
              icon={<Archive size={13} />}
              label="Archive"
              indent
              onClick={() => setActiveSection('archive')}
              subActive={activeSection === 'archive'}
            />
          </div>
        )}

        <div className="h-px bg-white/5 my-2" />

        <NavItem
          icon={<Upload size={15} />}
          label="Upload & Digitization"
          onClick={() => setActiveSection('upload')}
          subActive={activeSection === 'upload'}
        />
        <NavItem
          icon={<Building2 size={15} />}
          label="Organization"
          onClick={() => setActiveSection('org')}
          subActive={activeSection === 'org'}
        />
        <NavItem
          icon={<Search size={15} />}
          label="Search & Retrieval"
          onClick={() => setActiveSection('search')}
          subActive={activeSection === 'search'}
        />
        <NavItem
          icon={<GitBranch size={15} />}
          label="Version Control"
          onClick={() => setActiveSection('version')}
          subActive={activeSection === 'version'}
        />

        <NavItem
          icon={<Shield size={15} />}
          label="Access & Permissions"
          hasChildren
          expanded={accessExpanded}
          onClick={() => setAccessExpanded(!accessExpanded)}
          subActive={activeSection === 'access'}
        />

        <div className="h-px bg-white/5 my-2" />

        <NavItem
          icon={<BarChart2 size={15} />}
          label="Reports"
          onClick={() => setActiveSection('reports')}
          subActive={activeSection === 'reports'}
        />
        <NavItem
          icon={<ClipboardList size={15} />}
          label="Audit & Logs"
          hasChildren
          expanded={auditExpanded}
          onClick={() => setAuditExpanded(!auditExpanded)}
          subActive={activeSection === 'audit'}
        />
        <NavItem
          icon={<Users size={15} />}
          label="Users Management"
          onClick={() => setActiveSection('users')}
          subActive={activeSection === 'users'}
        />
        <NavItem
          icon={<Settings size={15} />}
          label="Settings"
          hasChildren
          expanded={settingsExpanded}
          onClick={() => setSettingsExpanded(!settingsExpanded)}
          subActive={activeSection === 'settings'}
        />
      </div>

      {/* Bottom */}
      <div className="px-2.5 py-3 border-t border-white/5 space-y-1">
        <NavItem
          icon={<HelpCircle size={15} />}
          label="Help & Support"
          onClick={() => setActiveSection('help')}
          subActive={activeSection === 'help'}
        />
        {/* Storage */}
        <div className="mx-1 px-3 py-3 mt-1.5 rounded-xl bg-white/4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Storage</span>
            <span className="text-xs text-blue-400 font-bold">78%</span>
          </div>
          <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full w-[78%] bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-sm shadow-blue-500/50" />
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5">Using 3.9 TB of 5 TB</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
