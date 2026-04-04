import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  UploadCloud, 
  Users, 
  Search, 
  GitBranch, 
  Lock, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  HelpCircle,
  Bell,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Search as SearchIcon,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  RotateCw,
  FileText,
  LogIn
} from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminSidebar from '../../AdminSidebar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  hasSubmenu = false, 
  expanded = false,
  isSubItem = false
}: { 
  icon?: any, 
  label: string, 
  active?: boolean, 
  hasSubmenu?: boolean,
  expanded?: boolean,
  isSubItem?: boolean
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors",
      active ? "bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
      isSubItem && "pl-12 py-2"
    )}>
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} className={active ? "text-indigo-400" : "text-slate-500"} />}
        <span className={cn("text-sm font-medium", active && "font-semibold")}>{label}</span>
      </div>
      {hasSubmenu && (
        expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
      )}
    </div>
  );
};

const DashboardCard = ({ title, icon: Icon, children, color = "bg-slate-900/40" }: { title: string, icon?: any, children: React.ReactNode, color?: string }) => (
  <div className={cn("rounded-xl border border-slate-800 p-5 flex flex-col h-full", color)}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-indigo-400" />}
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      </div>
      {title === "File Actions" && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">24h</span>}
      {title === "Login Activity" && <span className="text-[10px] text-slate-500">Today</span>}
      {title === "Admin Actions" && <button className="text-[10px] text-indigo-400 hover:underline">View Log</button>}
    </div>
    {children}
  </div>
);

const loginData = [
  { name: 'Success', value: 96.6, color: '#10b981' },
  { name: 'Failed', value: 3.4, color: '#ef4444' },
];

const Overview = () => {
  return (
    <div className="flex h-screen bg-[#0b0e14] text-slate-300 font-inter overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar/>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0b0e14]/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Audit & Logs</span>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-slate-200">
              <LayoutDashboard size={14} className="text-slate-400" />
              <span>Overview</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell size={20} className="text-slate-400 cursor-pointer hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-semibold text-white leading-none">Alex Morgan</p>
                <p className="text-[10px] text-slate-500 mt-1">Lead Geologist</p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-slate-800"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Title and Action Buttons */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">System Audit Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">Real-time monitoring of document access, system authentication, and administrative actions.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors text-sm font-medium">
                <Download size={16} />
                <span>Export Logs</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium">
                <RotateCw size={16} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* File Actions */}
            <DashboardCard title="File Actions" icon={FileText}>
              <div className="flex justify-between items-end flex-1">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">452</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Opened</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">89</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Edited</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">34</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Dls</div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800/50">
                <p className="text-[10px] text-slate-500 mb-2">Most accessed file:</p>
                <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                  <FileText size={14} className="text-indigo-400" />
                  <span className="text-xs text-slate-300 truncate">Geo_Survey_Q1_Final....</span>
                </div>
              </div>
            </DashboardCard>

            {/* Login Activity */}
            <DashboardCard title="Login Activity" icon={LogIn}>
              <div className="flex-1 flex flex-col">
                <div className="h-32 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={loginData}>
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {loginData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                      <XAxis dataKey="name" hide />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-around mt-2">
                  <span className="text-[10px] text-slate-500">Success</span>
                  <span className="text-[10px] text-slate-500">Failed</span>
                </div>
                <div className="mt-auto pt-2 text-center">
                  <p className="text-xs font-semibold text-slate-400">96.6% Authentication Success Rate</p>
                </div>
              </div>
            </DashboardCard>

            {/* Admin Actions */}
            <DashboardCard title="Admin Actions" icon={Settings}>
              <div className="space-y-4 flex-1">
                <div className="flex gap-3">
                  <div className="mt-1"><Users size={14} className="text-slate-500" /></div>
                  <div>
                    <p className="text-xs text-slate-300"><span className="text-white font-medium">Role updated for</span> <span className="text-indigo-400">J. Doe</span></p>
                    <p className="text-[10px] text-slate-500">10 mins ago • by Admin</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1"><ExternalLink size={14} className="text-slate-500" /></div>
                  <div>
                    <p className="text-xs text-slate-300">New shared drive created</p>
                    <p className="text-[10px] text-slate-500">1 hr ago • by SysOp</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1"><Lock size={14} className="text-slate-500" /></div>
                  <div>
                    <p className="text-xs text-slate-300">Password policy revised</p>
                    <p className="text-[10px] text-slate-500">3 hrs ago • by Security</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1"><Users size={14} className="text-slate-500" /></div>
                  <div>
                    <p className="text-xs text-slate-300">Batch user import (15)</p>
                    <p className="text-[10px] text-slate-500">5 hrs ago • by Admin</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1"><GitBranch size={14} className="text-slate-500" /></div>
                  <div>
                    <p className="text-xs text-slate-300">API Key Revoked</p>
                    <p className="text-[10px] text-slate-500">Yesterday • by System</p>
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* Suspicious Activity */}
            <div className="rounded-xl border border-red-900/30 p-5 flex flex-col h-full bg-red-950/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  <h3 className="text-sm font-semibold text-red-100">Suspicious Activity</h3>
                </div>
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">3 New</span>
              </div>

              <div className="bg-slate-900/60 rounded-lg p-3 border border-red-900/20 mb-4 relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white uppercase">Multiple Failed Logins</span>
                  <span className="text-[8px] bg-red-500 text-white px-1 rounded">CRITICAL</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-3">IP 192.168.1.45 attempted login 15 times in 2 minutes.</p>
                <button className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded transition-colors">
                  Investigate IP
                </button>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Unusual Export Volume</span>
                  <span className="text-orange-500 font-medium uppercase">Warning</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Off-hours Access</span>
                  <span className="text-orange-500 font-medium uppercase">Warning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#11141b]">
              <div>
                <h2 className="text-lg font-bold text-white">Recent Combined Logs</h2>
                <p className="text-slate-500 text-xs mt-0.5">Unified view of all system events sorted by timestamp.</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 text-slate-300"
                  />
                </div>
                <button className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-800/30 text-slate-500 text-[10px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Timestamp</th>
                    <th className="px-6 py-4 font-semibold">User / Actor</th>
                    <th className="px-6 py-4 font-semibold">Event Type</th>
                    <th className="px-6 py-4 font-semibold">Details</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-xs">2023-10-24</p>
                      <p className="text-slate-500 text-[10px]">14:32:05</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">JD</div>
                        <span className="text-slate-200 font-medium">John Doe</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-medium border border-indigo-500/20">
                        <FileText size={12} />
                        File Open
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400">Opened "Site_B_Safety_Protocol.pdf"</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-500 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Success
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-xs">2023-10-24</p>
                      <p className="text-slate-500 text-[10px]">14:30:12</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 text-xs font-bold">MR</div>
                        <span className="text-slate-200 font-medium">M. Ross</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 text-[10px] font-medium border border-red-500/20">
                        <Lock size={12} />
                        Login Failed
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400">Invalid password attempt from IP 192.168.1.45</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-red-500 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Failed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-xs">2023-10-24</p>
                      <p className="text-slate-500 text-[10px]">14:15:00</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">AD</div>
                        <span className="text-slate-200 font-medium">Admin</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-orange-500/10 text-orange-400 text-[10px] font-medium border border-orange-500/20">
                        <Settings size={12} />
                        Config Change
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400">Updated user permissions for Group "Engineers"</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-500 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Success
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-xs">2023-10-24</p>
                      <p className="text-slate-500 text-[10px]">13:45:22</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">SK</div>
                        <span className="text-slate-200 font-medium">Sarah K.</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                        <Download size={12} />
                        Download
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400">Bulk exported "Q3_Financials.zip"</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-500 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Success
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#11141b] border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Showing 4 of 1,240 events</span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global CSS for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default Overview;
