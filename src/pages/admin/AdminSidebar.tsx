import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Users,
  Search,
  GitBranch,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Archive,
  Files,
  UserCircle2,
  Share2,
  Building2,
  Layers,
  History,
} from 'lucide-react';

interface SubItem {
  label: string;
  path: string;
  icon?: React.ElementType;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  hasSubmenu?: boolean;
  subItems?: SubItem[];
}

const navigationItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    hasSubmenu: true,
    subItems: [
      { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
      { label: 'My Tasks', path: '/Mytasks', icon: Files },
      { label: 'Recent Activity', path: '/Recentactivity', icon: Clock },
    ],
  },
  {
    icon: FileText,
    label: 'Documents',
    hasSubmenu: true,
    subItems: [
      { label: 'All Documents', path: '/alldocuments', icon: Files },
      { label: 'My Documents', path: '/mydocs', icon: UserCircle2 },
      { label: 'Shared with Me', path: '/shareddocs', icon: Share2 },
      { label: 'Favorites', path: '/favorite', icon: Star },
      { label: 'Archive', path: '/archive', icon: Archive },
    ],
  },
  {
    icon: UploadCloud,
    label: 'Upload & Digitization',
    hasSubmenu: true,
    subItems: [
      { label: 'Upload', path: '/upload&digitization/upload' },
      { label: 'Bulk Upload', path: '/upload&digitization/bulk' },
      { label: 'Scan', path: '/upload&digitization/scan' },
      { label: 'History', path: '/upload&digitization/history' },
    ],
  },
  {
    icon: Building2,
    label: 'Organization',
    hasSubmenu: true,
    subItems: [
      { label: 'Categories', path: '/categories' },
      { label: 'Document Types', path: '/Docalltype', icon: Layers },
      { label: 'Projects', path: '/Projects' },
      { label: 'Departments', path: '/Department' },
      { label: 'Tags', path: '/Tags' },
    ],
  },
  {
    icon: Search,
    label: 'Search & Retrieval',
    hasSubmenu: true,
    subItems: [
      { label: 'Smart Search', path: '/Smartsearch' },
      { label: 'Advanced Filters', path: '/Advancedfilter' },
      { label: 'Saved Searches', path: '/SavedSearch' },
    ],
  },
  {
    icon: GitBranch,
    label: 'Version Control',
    hasSubmenu: true,
    subItems: [
      { label: 'Version History', path: '/versioncontrol/history' },
      { label: 'Compare', path: '/versioncontrol/compare' },
      { label: 'Restore', path: '/versioncontrol/restore' },
    ],
  },
  {
    icon: ShieldCheck,
    label: 'Access & Permissions',
    hasSubmenu: true,
    subItems: [
      { label: 'Roles & Permissions', path: '/role' },
      { label: 'Access Rules', path: '/access' },
      { label: 'Shared Links', path: '/sharedlinks' },
    ],
  },
  {
    icon: BarChart3,
    label: 'Reports',
    hasSubmenu: true,
    subItems: [
      { label: 'Overview', path: '/reports/overview' },
      { label: 'Document Usage Report', path: '/reports/docreport' },
      { label: 'Upload & Activity Report', path: '/reports/uploadrep' },
      { label: 'Department/Project Reports', path: '/reports/depreport' },
      { label: 'Versioning Report', path: '/reports/versioningrep' },
      { label: 'Access/Permission Report', path: '/reports/accessreport' },
    ],
  },
  {
    icon: ClipboardList,
    label: 'Audit & Logs',
    hasSubmenu: true,
    subItems: [
      { label: 'Overview', path: '/overview' },
      { label: 'Audit Trail', path: '/audittrail' },
      { label: 'Login History', path: '/loginhistory' },
      { label: 'System Actions Log', path: '/systemlog' },
      { label: 'Alerts / Suspicious', path: '/alerts' },
    ],
  },
  {
    icon: Users,
    label: 'Users Management',
    path: '/usermanagement',
  },
  {
    icon: Settings,
    label: 'Settings',
    hasSubmenu: true,
    subItems: [
      { label: 'Company Profile', path: '/settings/companyprofile' },
      { label: 'Document Numbering Rules', path: '/settings/docnumbering' },
      { label: 'Storage Settings', path: '/settings/storage' },
      { label: 'Backup & Restore', path: '/settings/backuprestore' },
      { label: 'Notifications', path: '/settings/notifications' },
      { label: 'Integrations', path: '/settings/integrations' },
    ],
  },
  {
    icon: HelpCircle,
    label: 'Help & Support',
    hasSubmenu: true,
    subItems: [
      { label: 'FAQs', path: '/helpandsupport/faqs' },
      { label: 'Manual', path: '/helpandsupport/manual' },
      { label: 'Submit Ticket', path: '/helpandsupport/submitticket' },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => {
    // Initialize expanded menus based on current route
    const initialExpanded = new Set<string>();
    const currentPath = location.pathname;
    
    navigationItems.forEach((item) => {
      if (item.subItems) {
        const isActive = item.subItems.some((sub) => currentPath.startsWith(sub.path));
        if (isActive) {
          initialExpanded.add(item.label);
        }
      }
    });
    
    return initialExpanded;
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActivePath = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (item: NavItem) => {
    if (item.path && isActivePath(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some((sub) => isActivePath(sub.path));
    }
    return false;
  };

  return (
    <aside className="w-64 bg-[#0f111a] border-r border-slate-800 flex flex-col h-screen text-slate-400 text-sm">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">M</span>
        </div>
        <span className="text-white font-bold tracking-wider text-lg">MIGECO</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedMenus.has(item.label);
          const active = isParentActive(item);

          return (
            <div key={item.label}>
              {/* Main Menu Item */}
              <button
                onClick={() => {
                  if (item.hasSubmenu) {
                    toggleMenu(item.label);
                  } else if (item.path) {
                    handleNavigation(item.path);
                  }
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors group ${
                  active
                    ? 'bg-indigo-600/10 text-indigo-400'
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      active ? 'text-indigo-400' : 'group-hover:text-white'
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.hasSubmenu &&
                  (isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  ))}
              </button>

              {/* Submenu Items */}
              {item.hasSubmenu && item.subItems && isExpanded && (
                <div className="mt-1 ml-9 space-y-1">
                  {item.subItems.map((sub) => {
                    const subIsActive = isActivePath(sub.path);
                    return (
                      <button
                        key={sub.label}
                        onClick={() => handleNavigation(sub.path)}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-colors text-xs ${
                          subIsActive
                            ? 'bg-slate-800 text-white font-medium'
                            : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto border-t border-slate-800">
        {/* Storage Indicator */}
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400">Storage</span>
            <span className="text-xs font-bold text-white">78%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: '78%' }}
            ></div>
          </div>
          <p className="text-[10px] mt-2 text-slate-500">Using 3.9 TB of 5 TB</p>
        </div>
      </div>
    </aside>
  );
}
