import React from 'react';
import {
  LayoutDashboard,
  FileText,
  CloudUpload,
  FolderTree,
  Search,
  History,
  Lock,
  BarChart3,
  ClipboardList,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Bell,
  Eye,
  FolderOpen,
  Database,
  Download,
  Calendar,
  Activity,
  FilePlus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminSidebar from '../AdminSidebar';

// --- Types ---
type NavItem = {
  name: string;
  icon: React.ElementType;
  isExpanded?: boolean;
  subItems?: string[];
  isActive?: boolean;
};

// --- Mock Data ---
const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Documents', icon: FileText },
  { name: 'Upload & Digitization', icon: CloudUpload },
  { name: 'Organization', icon: FolderTree },
  { name: 'Search & Retrieval', icon: Search },
  { name: 'Version Control', icon: History },
  { name: 'Access & Permissions', icon: Lock },
  {
    name: 'Reports',
    icon: BarChart3,
    isActive: true,
    isExpanded: true,
    subItems: [
      'Overview',
      'Document Usage Report',
      'Upload & Activity Report',
      'Department/Project Reports',
      'Versioning Report',
      'Access/Permission Report',
    ],
  },
  { name: 'Audit & Logs', icon: ClipboardList },
  { name: 'User management', icon: Users },
  { name: 'Settings', icon: Settings },
];

const activityData = [
  { name: 'May 01', views: 2400, uploads: 1400 },
  { name: 'May 05', views: 3000, uploads: 1500 },
  { name: 'May 10', views: 4000, uploads: 2000 },
  { name: 'May 15', views: 3200, uploads: 2800 },
  { name: 'May 20', views: 4800, uploads: 2400 },
  { name: 'May 25', views: 6500, uploads: 3500 },
  { name: 'May 30', views: 4000, uploads: 2000 },
];

const recentReports = [
  {
    name: 'Monthly Site Alpha Audit',
    type: 'Audit Log',
    typeColor: 'text-blue-400 bg-blue-400/10',
    date: 'May 28, 2024 at 09:30 AM',
    user: 'Alex Morgan',
    userInitials: 'AM',
    userColor: 'bg-gray-600',
    fileType: 'PDF - 2.4 MB',
    fileIconColor: 'text-red-400 bg-red-400/10',
  },
  {
    name: 'User Access Matrix',
    type: 'Security',
    typeColor: 'text-purple-400 bg-purple-400/10',
    date: 'May 27, 2024 at 02:15 PM',
    user: 'Sarah Jenkins',
    userInitials: 'SJ',
    userColor: 'bg-purple-600',
    fileType: 'CSV - 450 KB',
    fileIconColor: 'text-green-400 bg-green-400/10',
  },
  {
    name: 'Q1 Geological Summary',
    type: 'Summary',
    typeColor: 'text-emerald-400 bg-emerald-400/10',
    date: 'May 25, 2024 at 11:45 AM',
    user: 'Alex Morgan',
    userInitials: 'AM',
    userColor: 'bg-gray-600',
    fileType: 'PDF - 8.1 MB',
    fileIconColor: 'text-red-400 bg-red-400/10',
  },
  {
    name: 'Storage Utilization Export',
    type: 'Infrastructure',
    typeColor: 'text-orange-400 bg-orange-400/10',
    date: 'May 22, 2024 at 04:00 PM',
    user: 'Mike Kovan',
    userInitials: 'MK',
    userColor: 'bg-indigo-600',
    fileType: 'XLSX - 120 KB',
    fileIconColor: 'text-green-400 bg-green-400/10',
  },
];

// --- Components ---


const Header = () => (
  <header className="h-16 bg-[#161824] border-b border-[#1f2231] flex items-center justify-between px-6 shrink-0 text-sm">
    <div className="flex items-center gap-3 text-gray-400 font-medium">
      <span className="text-white">Reports</span>
      <ChevronRight className="w-4 h-4" />
      <span className="flex items-center gap-2 text-gray-400">
        <BarChart3 className="w-4 h-4" />
        Overview
      </span>
    </div>

    <div className="flex items-center gap-6">
      <button className="relative text-gray-400 hover:text-white">
        <Bell className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#161824]" />
      </button>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-white font-medium text-sm">Alex Morgan</div>
          <div className="text-gray-500 text-xs">Lead Geologist</div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt="Profile"
          className="w-9 h-9 rounded-full object-cover"
        />
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  </header>
);

const KPICard = ({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  iconColor,
  iconBg,
  subtitle
}: any) => (
  <div className="bg-[#1e2130] p-5 rounded-2xl border border-[#2d3145] flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-400 text-xs font-semibold tracking-wider uppercase">{title}</h3>
      <div className={`w-8 h-8 rounded flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
    </div>
    <div className="mb-2">
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
    {trend !== undefined && (
      <div className="flex items-center gap-2 text-xs">
        <span className={`font-medium flex items-center ${trend >= 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          {trendValue}
        </span>
        <span className="text-gray-500">{subtitle}</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0f111a] p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Reports Dashboard</h1>
            <p className="text-gray-400 text-sm">
              Real-time insights on document activities, storage, and project usage.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1e2130] text-gray-300 text-sm font-medium rounded-lg border border-[#2d3145] hover:bg-[#2a2e41] transition-colors">
              <Calendar className="w-4 h-4" />
              Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#5d5fef] text-white text-sm font-medium rounded-lg hover:bg-[#4b4dc4] transition-colors">
              <Download className="w-4 h-4" />
              Export Summary
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="TOTAL DOCUMENT VIEWS"
            value="24,592"
            trend={1}
            trendValue="+12.5%"
            subtitle="vs last month"
            icon={Eye}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
          />
          <KPICard
            title="WEEKLY UPLOAD VOLUME"
            value="1,204"
            trend={1}
            trendValue="+5.2%"
            subtitle="vs last week"
            icon={CloudUpload}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
          />
          <KPICard
            title="ACTIVE PROJECT FILES"
            value="8,941"
            trend={-1}
            trendValue="−0.8%"
            subtitle="vs last month"
            icon={FolderOpen}
            iconColor="text-orange-500"
            iconBg="bg-orange-500/10"
          />
          <div className="bg-[#1e2130] p-5 rounded-2xl border border-[#2d3145] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-400 text-xs font-semibold tracking-wider uppercase">STORAGE UTILIZATION</h3>
              <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="mb-3">
              <span className="text-2xl font-bold text-white">3.9 TB</span>
            </div>
            <div className="mt-auto">
               <div className="w-full h-1.5 bg-[#2d3145] rounded-full mb-2 overflow-hidden flex">
                 <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                 <div className="h-full bg-transparent rounded-full" style={{ width: '22%' }} />
               </div>
               <p className="text-gray-500 text-xs">78% of 5 TB capacity used</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-[#1e2130] border border-[#2d3145] rounded-2xl p-5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-white font-semibold mb-1">Activity Trends</h3>
                <p className="text-gray-400 text-xs">System usage over the last 30 days</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-gray-400 text-xs">Views</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="text-gray-400 text-xs">Uploads</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3145" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e2130', borderColor: '#2d3145', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="uploads" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Chart */}
          <div className="bg-[#1e2130] border border-[#2d3145] rounded-2xl p-5 flex flex-col">
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-1">Top Documents by Type</h3>
              <p className="text-gray-400 text-xs">Distribution across categories</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {[
                { name: 'Geological Surveys', percent: 45, color: 'bg-emerald-500' },
                { name: 'Geotechnical Reports', percent: 28, color: 'bg-purple-500' },
                { name: 'CAD Drawings (DWG)', percent: 17, color: 'bg-orange-500' },
                { name: 'Environmental Docs', percent: 10, color: 'bg-pink-500' },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm font-medium">{item.name}</span>
                    <span className="text-gray-400 text-xs">{item.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1e2130] border border-[#2d3145] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex justify-between items-center border-b border-[#2d3145]">
            <h3 className="text-white font-semibold">Recent Generated Reports</h3>
            <button className="text-blue-500 text-sm font-medium hover:text-blue-400 transition-colors">
              View All Reports
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-gray-400 uppercase bg-[#181a25] border-b border-[#2d3145]">
                <tr>
                  <th className="px-5 py-3 font-semibold tracking-wider">Report Name</th>
                  <th className="px-5 py-3 font-semibold tracking-wider">Type</th>
                  <th className="px-5 py-3 font-semibold tracking-wider">Date Generated</th>
                  <th className="px-5 py-3 font-semibold tracking-wider">Generated By</th>
                  <th className="px-5 py-3 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3145]">
                {recentReports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-[#24283b] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${report.fileIconColor}`}>
                           {report.name.includes('Export') ? (
                              <FileText className="w-4 h-4" />
                           ) : (
                              <FilePlus className="w-4 h-4" />
                           )}
                        </div>
                        <div>
                          <div className="text-white font-medium">{report.name}</div>
                          <div className="text-gray-500 text-xs">{report.fileType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${report.typeColor}`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">
                      {report.date}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-medium ${report.userColor}`}>
                          {report.userInitials}
                        </div>
                        <span className="text-gray-300">{report.user}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors text-sm">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ReportsOverview() {
  return (
    <div className="flex h-screen w-full bg-[#0f111a] overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <Dashboard />
      </div>
    </div>
  );
}
