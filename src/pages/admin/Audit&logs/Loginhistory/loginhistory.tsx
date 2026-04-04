import type { ReactNode } from "react";
import AdminSidebar from "../../AdminSidebar";
import { 
  Bell,
  Download,
  RotateCw,
  LogIn,
  TrendingUp,
  Search as SearchIcon,
  Filter,
  MoreHorizontal,
  Monitor
} from 'lucide-react';

type EventRow = {
  time: string;
  user: string;
  email: string;
  initials: string;
  initialsColor: string;
  device: string;
  ip: string;
  location: string;
  result: "Success" | "Failed" | "Bad pass";
  flagged?: boolean;
};

const eventRows: EventRow[] = [
  {
    time: "2023-10-24\n14:32:05",
    user: "John Doe",
    email: "john.doe@migeco.com",
    initials: "JD",
    initialsColor: "from-violet-500 to-indigo-500",
    device: "Windows 11 / Chrome",
    ip: "192.168.1.104",
    location: "New York, US",
    result: "Success",
  },
  {
    time: "2023-10-24\n14:15:33",
    user: "Sarah K.",
    email: "sarah.k@migeco.com",
    initials: "SK",
    initialsColor: "from-fuchsia-500 to-pink-500",
    device: "macOS / Safari",
    ip: "10.0.5.23",
    location: "London, UK",
    result: "Success",
  },
  {
    time: "2023-10-24\n13:58:12",
    user: "unknown_user",
    email: "attempted login",
    initials: "?",
    initialsColor: "from-slate-700 to-slate-800",
    device: "Unknown Device",
    ip: "45.22.19.112",
    location: "Moscow, RU",
    result: "Failed",
    flagged: true,
  },
  {
    time: "2023-10-24\n13:45:00",
    user: "Mike Ross",
    email: "mike.ross@migeco.com",
    initials: "MR",
    initialsColor: "from-amber-500 to-orange-500",
    device: "iOS / Mobile Safari",
    ip: "172.16.0.45",
    location: "Austin, US",
    result: "Success",
  },
  {
    time: "2023-10-24\n12:30:45",
    user: "John Doe",
    email: "john.doe@migeco.com",
    initials: "JD",
    initialsColor: "from-violet-500 to-indigo-500",
    device: "Android / Chrome",
    ip: "192.168.1.104",
    location: "New York, US",
    result: "Success",
  },
  {
    time: "2023-10-24\n11:15:22",
    user: "Alice Lee",
    email: "alice.lee@migeco.com",
    initials: "AL",
    initialsColor: "from-emerald-500 to-teal-500",
    device: "Windows 10 / Edge",
    ip: "10.0.5.55",
    location: "Toronto, CA",
    result: "Bad pass",
    flagged: true,
  },
  {
    time: "2023-10-24\n09:00:01",
    user: "Alice Lee",
    email: "alice.lee@migeco.com",
    initials: "AL",
    initialsColor: "from-emerald-500 to-teal-500",
    device: "Windows 10 / Edge",
    ip: "10.0.5.55",
    location: "Toronto, CA",
    result: "Success",
  },
  {
    time: "2023-10-24\n08:45:10",
    user: "Admin User",
    email: "admin@migeco.com",
    initials: "AD",
    initialsColor: "from-slate-400 to-slate-500",
    device: "Server Console",
    ip: "127.0.0.1",
    location: "Localhost",
    result: "Success",
  },
];

const successSeries = [42, 50, 34, 58, 82, 64, 67];
const failureSeries = [24, 26, 20, 27, 31, 18, 25];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildSmoothPath(values: number[], width: number, height: number, padding = 18) {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const max = 100;
  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * innerWidth;
    const y = padding + innerHeight - (value / max) * innerHeight;
    return { x, y };
  });

  return points.reduce((path, point, index, all) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const prev = all[index - 1];
    const midX = (prev.x + point.x) / 2;
    return `${path} C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function statusClasses(status: EventRow["result"]) {
  if (status === "Success") {
    return "flex items-center gap-1.5 text-emerald-500 text-xs";
  }

  if (status === "Failed") {
    return "flex items-center gap-1.5 text-red-500 text-xs";
  }

  return "flex items-center gap-1.5 text-pink-500 text-xs";
}

export default function LoginHistory() {
  const chartWidth = 860;
  const chartHeight = 170;
  const successPath = buildSmoothPath(successSeries, chartWidth, chartHeight, 22);
  const failurePath = buildSmoothPath(failureSeries, chartWidth, chartHeight, 22);

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
              <LogIn size={14} className="text-slate-400" />
              <span>Login History</span>
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
              <h1 className="text-2xl font-bold text-white">User Authentication Log</h1>
              <p className="text-slate-500 text-sm mt-1">Detailed history of user login attempts, locations, and device information.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors text-sm font-medium">
                <Download size={16} />
                <span>Export CSV</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium">
                <RotateCw size={16} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Chart Section */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <TrendingUp size={18} className="text-indigo-400" />
                Weekly Login Attempts
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Success
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Failed
                </span>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="relative h-[170px] w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full" preserveAspectRatio="none">
                  {[35, 80, 125].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="rgba(255,255,255,0.07)"
                      strokeDasharray="3 6"
                    />
                  ))}

                  <path d={successPath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <path d={failurePath} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

                  {successSeries.map((value, index) => {
                    const x = 22 + (index / (successSeries.length - 1)) * (chartWidth - 44);
                    const y = 22 + (126 - (value / 100) * 126);
                    return <circle key={`s-${index}`} cx={x} cy={y} r="3.2" fill="#10b981" opacity={index === 1 || index >= 3 ? 1 : 0} />;
                  })}
                </svg>

                <div className="absolute inset-x-4 bottom-3 grid grid-cols-7 text-[9px] uppercase tracking-[0.16em] text-slate-500 sm:text-[10px]">
                  {days.map((day) => (
                    <div key={day} className="text-center">
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Table Section */}
          <section className="bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#11141b]">
              <div>
                <h2 className="text-lg font-bold text-white">Authentication Events</h2>
                <p className="text-slate-500 text-xs mt-0.5">Showing latest login attempts first.</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search user, IP, or location..." 
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
                    <th className="px-6 py-4 font-semibold">Login Time</th>
                    <th className="px-6 py-4 font-semibold">User Name</th>
                    <th className="px-6 py-4 font-semibold">Device / Browser</th>
                    <th className="px-6 py-4 font-semibold">IP Address</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {eventRows.map((row) => (
                    <tr
                      key={`${row.user}-${row.time}`}
                      className={`hover:bg-slate-800/20 transition-colors ${
                        row.flagged ? "bg-red-500/[0.06]" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-pre-line">
                        <p className="text-slate-300 text-xs">{row.time.split('\n')[0]}</p>
                        <p className="text-slate-500 text-[10px]">{row.time.split('\n')[1]}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${row.initialsColor} flex items-center justify-center text-white text-xs font-bold`}>
                            {row.initials}
                          </div>
                          <div>
                            <p className="text-slate-200 font-medium">{row.user}</p>
                            <p className="text-[10px] text-slate-500">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Monitor size={14} className="text-slate-500" />
                          <span className="text-slate-300">{row.device}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-mono text-[13px] ${row.flagged ? "font-semibold text-white" : "text-slate-400"}`}>
                        {row.ip}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{row.location}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={statusClasses(row.result)}>
                          <span className={`w-1.5 h-1.5 rounded-full ${row.result === "Success" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                          {row.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#11141b] border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Showing 1-8 of 1,240 events</span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                  Next
                </button>
              </div>
            </div>
          </section>
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
}
