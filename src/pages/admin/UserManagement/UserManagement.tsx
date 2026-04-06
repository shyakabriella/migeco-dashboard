import { useState } from 'react';
import { cn } from '../../../../../../src/utils/cn';
import AdminSidebar from '../AdminSidebar';

// Icons as SVG components
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Documents: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Organization: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  VersionControl: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Access: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Reports: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Audit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Help: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
};

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'disabled';
  lastLogin: string;
  avatar?: string;
  initials: string;
  avatarColor: string;
}

const usersData: User[] = [
  {
    id: 1,
    name: 'Alex Morgan',
    email: 'alex.morgan@migeco.com',
    role: 'Lead Geologist',
    department: 'Geology',
    status: 'active',
    lastLogin: 'Just now',
    initials: 'AM',
    avatarColor: 'bg-purple-500',
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    email: 'sarah.j@migeco.com',
    role: 'Senior Engineer',
    department: 'Technical',
    status: 'active',
    lastLogin: '2 hours ago',
    initials: 'SJ',
    avatarColor: 'bg-blue-400',
  },
  {
    id: 3,
    name: 'David Kim',
    email: 'david.kim@migeco.com',
    role: 'Project Manager',
    department: 'Construction',
    status: 'disabled',
    lastLogin: 'Oct 24, 2023',
    initials: 'DK',
    avatarColor: 'bg-green-500',
  },
  {
    id: 4,
    name: 'Elena Rodriguez',
    email: 'elena.r@migeco.com',
    role: 'Exploration Lead',
    department: 'Exploration',
    status: 'active',
    lastLogin: 'Yesterday',
    initials: 'ER',
    avatarColor: 'bg-gray-600',
  },
  {
    id: 5,
    name: 'Michael Scott',
    email: 'm.scott@migeco.com',
    role: 'System Admin',
    department: 'IT / Admin',
    status: 'active',
    lastLogin: '5 mins ago',
    initials: 'MS',
    avatarColor: 'bg-red-500',
  },
  {
    id: 6,
    name: 'James Lee',
    email: 'james.lee@migeco.com',
    role: 'Internal Auditor',
    department: 'Compliance',
    status: 'active',
    lastLogin: 'Last week',
    initials: 'JL',
    avatarColor: 'bg-indigo-500',
  },
];

const sidebarItems = [
  { icon: Icons.Dashboard, label: 'Dashboard', active: false, hasSubmenu: true },
  { icon: Icons.Documents, label: 'Documents', active: false, hasSubmenu: false },
  { icon: Icons.Upload, label: 'Upload & Digitization', active: false, hasSubmenu: false },
  { icon: Icons.Organization, label: 'Organization', active: false, hasSubmenu: false },
  { icon: Icons.Search, label: 'Search & Retrieval', active: false, hasSubmenu: false },
  { icon: Icons.VersionControl, label: 'Version Control', active: false, hasSubmenu: false },
  { icon: Icons.Access, label: 'Access & Permissions', active: false, hasSubmenu: true },
  { icon: Icons.Reports, label: 'Reports', active: false, hasSubmenu: false },
  { icon: Icons.Audit, label: 'Audit & Logs', active: false, hasSubmenu: true },
  { icon: Icons.Users, label: 'Users Management', active: true, hasSubmenu: false },
  { icon: Icons.Settings, label: 'Settings', active: false, hasSubmenu: true },
  { icon: Icons.Help, label: 'Help & Support', active: false, hasSubmenu: false },
];

const departmentColors: Record<string, string> = {
  Geology: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Technical: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Construction: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Exploration: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'IT / Admin': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Compliance: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const roleIcons: Record<string, string> = {
  'Lead Geologist': '⛰️',
  'Senior Engineer': '⚙️',
  'Project Manager': '📋',
  'Exploration Lead': '🔍',
  'System Admin': '🔧',
  'Internal Auditor': '📊',
};

function Usermanagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment] = useState('All Departments');
  const [selectedStatus] = useState('Status');

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All Departments' || user.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'Status' || 
      (selectedStatus === 'Active' && user.status === 'active') ||
      (selectedStatus === 'Disabled' && user.status === 'disabled');
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#0f0f23] border-b border-blue-900/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-white font-semibold">Admin Portal</h1>
              <div className="flex items-center gap-2 text-gray-400">
                <Icons.ChevronDown />
                <span className="text-sm">User Management</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Icons.Bell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">Alex Morgan</p>
                  <p className="text-gray-400 text-xs">Lead Geologist</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">AM</span>
                </div>
                <Icons.ChevronDown />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Users List</h2>
                <p className="text-gray-400">Manage user access, roles, and account status across the organization.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25">
                <Icons.Plus />
                Add / Invite User
              </button>
            </div>

            {/* Users Table Card */}
            <div className="bg-[#12122a] rounded-xl border border-blue-900/30 overflow-hidden">
              {/* Filters */}
              <div className="p-4 border-b border-blue-900/30">
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <Icons.Search />
                    <input
                      type="text"
                      placeholder="Search users by name, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-[#0a0a1a] border border-blue-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-80"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Icons.Search />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">Filter by:</span>
                    <button className="px-3 py-2 bg-[#0a0a1a] border border-blue-900/30 rounded-lg text-white text-sm hover:border-blue-500/50 transition-colors">
                      All Departments
                    </button>
                    <button className="px-3 py-2 bg-[#0a0a1a] border border-blue-900/30 rounded-lg text-white text-sm hover:border-blue-500/50 transition-colors flex items-center gap-2">
                      All Roles
                      <Icons.ChevronDown />
                    </button>
                    <button className="px-3 py-2 bg-[#0a0a1a] border border-blue-900/30 rounded-lg text-white text-sm hover:border-blue-500/50 transition-colors flex items-center gap-2">
                      Status
                      <Icons.ChevronDown />
                    </button>
                    <button className="p-2.5 bg-[#0a0a1a] border border-blue-900/30 rounded-lg text-gray-400 hover:text-white hover:border-blue-500/50 transition-colors">
                      <Icons.Download />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-900/30">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Login</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={cn(
                          'border-b border-blue-900/20 hover:bg-white/5 transition-colors',
                          index === filteredUsers.length - 1 && 'border-b-0'
                        )}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold', user.avatarColor)}>
                              {user.initials}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.name}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-white">
                            <span>{roleIcons[user.role]}</span>
                            <span className="text-sm">{user.role}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium border',
                            departmentColors[user.department]
                          )}>
                            {user.department}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button className={cn(
                              'relative w-11 h-6 rounded-full transition-colors duration-200',
                              user.status === 'active' ? 'bg-green-500' : 'bg-gray-600'
                            )}>
                              <span className={cn(
                                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200',
                                user.status === 'active' ? 'left-6' : 'left-1'
                              )}></span>
                            </button>
                            <span className={cn(
                              'text-sm font-medium',
                              user.status === 'active' ? 'text-green-400' : 'text-gray-400'
                            )}>
                              {user.status === 'active' ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-400 text-sm">{user.lastLogin}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                              <Icons.Edit />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Icons.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-blue-900/30 flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Showing <span className="text-white font-medium">1 to 6</span> of <span className="text-white font-medium">42</span> results
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-[#0a0a1a] border border-blue-900/30 rounded-lg text-gray-400 text-sm hover:text-white hover:border-blue-500/50 transition-colors disabled:opacity-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-[#0a0a1a] border border-blue-900/30 rounded-lg text-gray-400 text-sm hover:text-white hover:border-blue-500/50 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Usermanagement;
