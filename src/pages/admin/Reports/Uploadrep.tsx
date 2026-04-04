import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  Network,
  Search,
  History,
  Shield,
  BarChart2,
  Activity,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  MoreVertical,
  Download,
  Calendar,
  Monitor,
  Cloud,
  Mail,
  Bell,
  Grid
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList
} from 'recharts';
import AdminSidebar from '../AdminSidebar';

const lineData = [
  { day: 'Day 1', total: 100, projected: 120 },
  { day: 'Day 5', total: 150, projected: 160 },
  { day: 'Day 10', total: 200, projected: 190 },
  { day: 'Day 15', total: 250, projected: 240 },
  { day: 'Day 20', total: 180, projected: 200 },
  { day: 'Day 25', total: 320, projected: 300 },
  { day: 'Day 30', total: 280, projected: 290 },
];

const barData = [
  { name: 'Lisa', uploads: 189 },
  { name: 'Mike', uploads: 245 },
  { name: 'Sarah', uploads: 312 },
  { name: 'Alex', uploads: 428 },
];

const tableData = [
  {
    id: '#UP-29481',
    source: 'Desktop Client',
    sourceIcon: Monitor,
    time: 'Today\n10:42 AM',
    count: '42 Files',
    status: 'Success',
  },
  {
    id: '#UP-29480',
    source: 'AWS S3 Connector',
    sourceIcon: Cloud,
    time: 'Today\n09:15 AM',
    count: '158 Files',
    status: 'Pending OCR',
  },
  {
    id: '#UP-29479',
    source: 'Email Attachment',
    sourceIcon: Mail,
    time: 'Yesterday\n04:30 PM',
    count: '3 Files',
    status: 'Success',
  },
  {
    id: '#UP-29478',
    source: 'Desktop Client',
    sourceIcon: Monitor,
    time: 'Yesterday\n02:12 PM',
    count: '12 Files',
    status: 'Success',
  },
];

const SidebarItem = ({ icon: Icon, label, active = false, hasSub = false, expanded = false, children }: any) => {
  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between px-4 py-2.5 mx-2 rounded-md cursor-pointer transition-colors ${
          active ? 'bg-[#222442] text-[#6366f1]' : 'text-[#8e95a3] hover:bg-[#1a1f2c] hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4" />
          <span className={`text-sm ${active ? 'font-medium' : ''}`}>{label}</span>
        </div>
        {hasSub && (
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? '' : '-rotate-90'}`} />
        )}
      </div>
      {expanded && children && (
        <div className="mt-1 mb-2 ml-[32px] border-l border-[#2e364f] pl-4 flex flex-col gap-2">
          {children}
        </div>
      )}
    </div>
  );
};

const SubItem = ({ label, active = false }: { label: string; active?: boolean }) => (
  <div
    className={`text-sm cursor-pointer py-1.5 transition-colors ${
      active ? 'text-white font-medium bg-[#1e2333] px-3 -ml-3 rounded-md' : 'text-[#8e95a3] hover:text-white'
    }`}
  >
    {label}
  </div>
);

function Uploadrep() {
  return (
    <div className="flex h-screen bg-[#0b0e14] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#11141e] border-b border-[#1e2333] flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center text-sm">
            <span className="font-semibold text-white mr-4">Reports</span>
            <UploadCloud className="w-4 h-4 mr-2 text-[#8e95a3]" />
            <span className="text-[#8e95a3]">Upload & Activity Report</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-[#8e95a3] hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#11141e]"></span>
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right flex flex-col justify-center">
                <span className="text-sm font-medium leading-tight">Alex Morgan</span>
                <span className="text-xs text-[#8e95a3] leading-tight">Lead Geologist</span>
              </div>
              <img
                src="https://i.pravatar.cc/150?u=alex"
                alt="Alex Morgan"
                className="w-8 h-8 rounded-full border border-[#2e364f]"
              />
              <ChevronDown className="w-4 h-4 text-[#8e95a3]" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0b0e14]">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Upload & Activity Report</h1>
                <p className="text-sm text-[#8e95a3]">Detailed analysis of system ingestion and user upload performance.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2c] border border-[#2e364f] rounded-lg text-sm text-white hover:bg-[#232a3b] transition-colors">
                  <Calendar className="w-4 h-4 text-[#8e95a3]" />
                  Last 30 Days
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#5b58f2] hover:bg-[#4f4ce3] rounded-lg text-sm font-medium text-white transition-colors">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Volume Trends Chart */}
              <div className="lg:col-span-2 bg-[#161b25] border border-[#1e2333] rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-base font-semibold text-white mb-1">Upload Volume Trends</h2>
                    <p className="text-xs text-[#8e95a3]">Daily file ingestion over the last 30 days</p>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#5b58f2]"></span>
                      <span className="text-[#8e95a3]">Total Files</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full border border-[#5b58f2] border-dashed"></span>
                      <span className="text-[#8e95a3]">Projected</span>
                    </div>
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={lineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5b58f2" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#5b58f2" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2333" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#8e95a3', fontSize: 11 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#8e95a3', fontSize: 11 }}
                        hide
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1f2c', border: '1px solid #2e364f', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#5b58f2" 
                        fillOpacity={1} 
                        fill="url(#colorTotal)"
                        strokeWidth={3} 
                        activeDot={{ r: 6, fill: '#5b58f2', stroke: '#1a1f2c', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Contributors Chart */}
              <div className="bg-[#161b25] border border-[#1e2333] rounded-xl p-6 shadow-sm flex flex-col">
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-white mb-1">Top Contributors</h2>
                  <p className="text-xs text-[#8e95a3]">Highest uploads by user</p>
                </div>
                <div className="flex-1 min-h-[250px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#8e95a3', fontSize: 11 }}
                        dy={10}
                      />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="uploads" radius={[4, 4, 4, 4]} barSize={32}>
                        {barData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === barData.length - 1 ? '#6366f1' : '#313650'} 
                          />
                        ))}
                        <LabelList dataKey="uploads" position="top" fill="#fff" fontSize={11} fontWeight="bold" dy={-5} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Table Section */}
            <div className="bg-[#161b25] border border-[#1e2333] rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-[#1e2333] flex justify-between items-center bg-[#181d2a]">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-white">Recent Ingestions</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1e2333] text-[#5b58f2] border border-[#2e364f]">Live</span>
                </div>
                <button className="text-sm text-[#5b58f2] hover:text-white transition-colors">
                  View All Batches
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] uppercase text-[#8e95a3] font-semibold bg-[#11141e] border-b border-[#1e2333]">
                    <tr>
                      <th className="px-6 py-4 w-48">BATCH ID</th>
                      <th className="px-6 py-4">SOURCE</th>
                      <th className="px-6 py-4">UPLOAD TIME</th>
                      <th className="px-6 py-4">FILE COUNT</th>
                      <th className="px-6 py-4">STATUS</th>
                      <th className="px-6 py-4 text-right w-24">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2333]">
                    {tableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#1a1f2c] transition-colors">
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded bg-[#1e2333] text-[#a1a8b6] text-xs font-mono border border-[#2e364f]">
                            {row.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-white">
                            <row.sourceIcon className="w-4 h-4 text-[#8e95a3]" />
                            <span className="text-sm">{row.source}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-sm">
                            <span className="text-white">{row.time.split('\n')[0]}</span>
                            <span className="text-xs text-[#8e95a3]">{row.time.split('\n')[1]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white text-sm">
                          {row.count}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                              row.status === 'Success' 
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Success' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                              {row.status}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[#8e95a3] hover:text-white transition-colors p-1 rounded hover:bg-[#2e364f]">
                            <MoreVertical className="w-4 h-4" />
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
      </main>
    </div>
  );
}

export default Uploadrep;
