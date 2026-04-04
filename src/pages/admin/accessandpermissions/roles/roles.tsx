import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Building2,
  Search,
  GitBranch,
  Shield,
  BarChart3,
  ClipboardList,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Bell,
  MoreVertical,
  Filter,
  Plus,
  User,
  ShieldCheck,
  Lock,
  Mountain,
  HardHat,
  ClipboardCheck
} from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';

// Types
interface Role {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  };
  members: number;
  memberImages: string[];
}

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
      checked ? 'bg-indigo-500' : 'bg-slate-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
);

// Avatar Group Component
const AvatarGroup = ({ count, images }: { count: number; images: string[] }) => (
  <div className="flex items-center -space-x-2">
    {images.slice(0, 3).map((color, idx) => (
      <div
        key={idx}
        className={`h-7 w-7 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-medium text-white ${color}`}
      >
        {idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}
      </div>
    ))}
    {count > 3 && (
      <div className="h-7 w-7 rounded-full border-2 border-slate-800 bg-slate-600 flex items-center justify-center text-xs font-medium text-white">
        +{count - 3}
      </div>
    )}
  </div>
);

// Stat Card Component
const StatCard = ({ icon, label, value, iconBg }: { icon: React.ReactNode; label: string; value: string | number; iconBg: string }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex items-center gap-4">
    <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-white text-xl font-semibold">{value}</p>
    </div>
  </div>
);

// Sidebar Item Component
const SidebarItem = ({ 
  icon, 
  label, 
  active = false, 
  hasSubmenu = false, 
  expanded = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  hasSubmenu?: boolean;
  expanded?: boolean;
}) => (
  <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
    active ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
  }`}>
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    {hasSubmenu && (
      expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
    )}
  </div>
);

// Submenu Item Component
const SubmenuItem = ({ label, active = false }: { label: string; active?: boolean }) => (
  <div className={`pl-10 pr-3 py-2 text-sm cursor-pointer transition-colors ${
    active ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
  }`}>
    {label}
  </div>
);

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Admin',
      description: 'Full system access',
      icon: <Shield className="h-4 w-4 text-red-400" />,
      iconBg: 'bg-red-500/20',
      permissions: { view: true, edit: true, delete: true, approve: true },
      members: 12,
      memberImages: ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500']
    },
    {
      id: '2',
      name: 'Project Manager',
      description: 'Oversees project docs',
      icon: <User className="h-4 w-4 text-blue-400" />,
      iconBg: 'bg-blue-500/20',
      permissions: { view: true, edit: true, delete: false, approve: true },
      members: 8,
      memberImages: ['bg-orange-500', 'bg-pink-500', 'bg-cyan-500']
    },
    {
      id: '3',
      name: 'Geologist',
      description: 'Technical field reports',
      icon: <Mountain className="h-4 w-4 text-emerald-400" />,
      iconBg: 'bg-emerald-500/20',
      permissions: { view: true, edit: true, delete: false, approve: false },
      members: 15,
      memberImages: ['bg-yellow-500', 'bg-indigo-500', 'bg-rose-500']
    },
    {
      id: '4',
      name: 'Engineer',
      description: 'Construction & planning',
      icon: <HardHat className="h-4 w-4 text-orange-400" />,
      iconBg: 'bg-orange-500/20',
      permissions: { view: true, edit: true, delete: false, approve: false },
      members: 24,
      memberImages: ['bg-teal-500', 'bg-violet-500', 'bg-amber-500']
    },
    {
      id: '5',
      name: 'Auditor',
      description: 'Compliance review',
      icon: <ClipboardCheck className="h-4 w-4 text-purple-400" />,
      iconBg: 'bg-purple-500/20',
      permissions: { view: true, edit: false, delete: false, approve: false },
      members: 4,
      memberImages: ['bg-lime-500', 'bg-fuchsia-500', 'bg-sky-500']
    }
  ]);

  const togglePermission = (roleId: string, permission: keyof Role['permissions']) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId 
        ? { ...role, permissions: { ...role.permissions, [permission]: !role.permissions[permission] } }
        : role
    ));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">

        {/* Navigation */}
        <AdminSidebar />
        {/* Storage Indicator */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Storage</span>
              <span className="text-indigo-400 text-sm font-medium">78%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-[78%] bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" />
            </div>
            <p className="text-slate-500 text-xs mt-2">Using 3.9 TB of 5 TB</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Access & Permissions</span>
            <ChevronRight className="h-4 w-4 text-slate-600" />
            <span className="text-white">Roles & Permissions</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white text-sm font-medium">Alex Morgan</p>
                <p className="text-slate-400 text-xs">Lead Geologist</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                AM
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">Roles & Permissions</h1>
              <p className="text-slate-400 text-sm">Define roles and manage granular access permissions for all system users.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors">
              <Plus className="h-4 w-4" />
              Create New Role
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard 
              icon={<Users className="h-5 w-5 text-indigo-400" />}
              label="Total Roles"
              value={5}
              iconBg="bg-indigo-500/20"
            />
            <StatCard 
              icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
              label="Active Users"
              value={142}
              iconBg="bg-emerald-500/20"
            />
            <StatCard 
              icon={<Lock className="h-5 w-5 text-orange-400" />}
              label="Pending Review"
              value={3}
              iconBg="bg-orange-500/20"
            />
          </div>

          {/* Table Container */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search roles..."
                    className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 text-sm hover:text-slate-200 transition-colors">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-slate-400">Live updates enabled</span>
              </div>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Role Name</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">View</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Edit</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Delete</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Approve</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Members</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg ${role.iconBg} flex items-center justify-center`}>
                          {role.icon}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{role.name}</p>
                          <p className="text-slate-500 text-xs">{role.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <ToggleSwitch 
                          checked={role.permissions.view} 
                          onChange={() => togglePermission(role.id, 'view')}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <ToggleSwitch 
                          checked={role.permissions.edit} 
                          onChange={() => togglePermission(role.id, 'edit')}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <ToggleSwitch 
                          checked={role.permissions.delete} 
                          onChange={() => togglePermission(role.id, 'delete')}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <ToggleSwitch 
                          checked={role.permissions.approve} 
                          onChange={() => togglePermission(role.id, 'approve')}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <AvatarGroup count={role.members} images={role.memberImages} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Footer */}
            <div className="p-4 flex items-center justify-between border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">Showing {roles.length} of {roles.length} roles</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 text-sm hover:text-slate-200 transition-colors disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 text-sm hover:text-slate-200 transition-colors disabled:opacity-50" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
