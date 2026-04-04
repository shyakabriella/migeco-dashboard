import {
  LayoutDashboard,
  FileText,
  Upload,
  Building2,
  Search,
  GitBranch,
  Lock,
  BarChart3,
  Shield,
  Users,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  Download,
  Filter,
  Search as SearchIcon,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import AdminSidebar from "../AdminSidebar";

const departmentData = [
  { name: "Geology", value: 45, color: "#10b981" },
  { name: "Engineering", value: 29, color: "#6366f1" },
  { name: "Construction", value: 18, color: "#f97316" },
  { name: "Others", value: 8, color: "#64748b" },
];

const documentDistribution = [
  {
    id: "geology",
    name: "Geology",
    projects: "12 Projects Active",
    documents: 4821,
    utilization: 65,
    storage: "2.1 TB",
    trend: "+12%",
    positive: true,
    color: "#10b981",
    icon: "⛰️",
  },
  {
    id: "engineering",
    name: "Engineering",
    projects: "8 Projects Active",
    documents: 3105,
    utilization: 42,
    storage: "1.4 TB",
    trend: "+5%",
    positive: true,
    color: "#6366f1",
    icon: "🛠️",
  },
  {
    id: "construction",
    name: "Construction",
    projects: "5 Projects Active",
    documents: 1940,
    utilization: 28,
    storage: "0.8 TB",
    trend: "-2%",
    positive: false,
    color: "#f97316",
    icon: "🏗️",
  },
  {
    id: "legal",
    name: "Legal & Admin",
    projects: "Internal Operations",
    documents: 850,
    utilization: 15,
    storage: "0.3 TB",
    trend: "+1%",
    positive: true,
    color: "#a855f7",
    icon: "📋",
  },
];

const siteStats = [
  {
    id: "SA",
    name: "Site Alpha (Mining)",
    projectId: "PRJ-2024-001",
    leadDept: "Geology",
    docs: 1245,
    storage: "450 GB",
    lastActivity: "2 mins ago",
    trend: "+12%",
    trendPositive: true,
  },
  {
    id: "BF",
    name: "Beta Facility",
    projectId: "PRJ-2023-088",
    leadDept: "Construction",
    docs: 892,
    storage: "320 GB",
    lastActivity: "1 hour ago",
    trend: "+5%",
    trendPositive: true,
  },
  {
    id: "GS",
    name: "Gamma Survey",
    projectId: "PRJ-2024-012",
    leadDept: "Engineering",
    docs: 2103,
    storage: "890 GB",
    lastActivity: "4 hours ago",
    trend: "-2%",
    trendPositive: false,
  },
  {
    id: "DR",
    name: "Delta Refinery",
    projectId: "PRJ-2023-055",
    leadDept: "Engineering",
    docs: 654,
    storage: "180 GB",
    lastActivity: "1 day ago",
    trend: "0%",
    trendPositive: null,
  },
];

const getDeptColor = (dept: string) => {
  switch (dept) {
    case "Geology":
      return "text-emerald-400 bg-emerald-400/10";
    case "Engineering":
      return "text-indigo-400 bg-indigo-400/10";
    case "Construction":
      return "text-orange-400 bg-orange-400/10";
    default:
      return "text-slate-400 bg-slate-400/10";
  }
};

export default function Depreport() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-300 font-sans flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen z-50">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Top Header */}
        <header className="h-16 bg-[#161922] border-b border-slate-800/50 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-medium">Reports</span>
              <span className="text-slate-600">/</span>
              <div className="flex items-center gap-2 text-slate-400">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">
                  Department & Project Analytics
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-200">
                  Alex Morgan
                </p>
                <p className="text-xs text-slate-500">Lead Geologist</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                AM
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">
                Department & Project Reports
              </h1>
              <p className="text-slate-400 text-sm">
                Compare document usage, storage allocation, and activity across
                departments and project sites.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1e212b] border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-[#252936] transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                <span>All Projects</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1e212b] border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-[#252936] transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Department Document Distribution */}
            <div className="col-span-2 bg-[#161922] rounded-xl border border-slate-800/50 p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    Department Document Distribution
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    total documents stored by department
                  </p>
                </div>
                <div className="flex bg-[#1e212b] rounded-lg p-1">
                  <button className="px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 rounded">
                    Volume
                  </button>
                  <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors">
                    Storage Size
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {documentDistribution.map((dept) => (
                  <div key={dept.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{dept.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {dept.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {dept.projects}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span
                          className={`text-xs ${
                            dept.positive ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {dept.trend} vs last month
                        </span>
                        <div className="text-right">
                          <p className="text-base font-semibold text-slate-200">
                            {dept.documents.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {dept.storage}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs text-slate-500 w-16"
                        style={{ color: dept.color }}
                      >
                        {dept.utilization}% Utilized
                      </span>
                      <div className="flex-1 h-2 bg-[#1e212b] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${dept.utilization}%`,
                            backgroundColor: dept.color,
                            opacity: 0.8,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Contribution Chart */}
            <div className="bg-[#161922] rounded-xl border border-slate-800/50 p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-4">
                Department Contribution
              </h3>

              <div className="relative h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">10.7k</span>
                  <span className="text-xs text-slate-500">total Docs</span>
                </div>
              </div>

              <div className="space-y-3">
                {departmentData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-400 flex-1">
                      {item.name}
                    </span>
                    <span className="text-sm font-medium text-slate-200">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Site-Level Activity Stats Table */}
          <div className="bg-[#161922] rounded-xl border border-slate-800/50">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
              <h3 className="text-base font-semibold text-slate-100">
                Site-Level Activity Stats
              </h3>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
                  <SearchIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/50">
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Lead Dept
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Docs
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Storage
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {siteStats.map((site) => (
                    <tr
                      key={site.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#1e212b] border border-slate-700 flex items-center justify-center text-xs font-medium text-slate-400">
                            {site.id}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">
                              {site.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              ID: {site.projectId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getDeptColor(
                            site.leadDept
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              site.leadDept === "Geology"
                                ? "bg-emerald-400"
                                : site.leadDept === "Engineering"
                                ? "bg-indigo-400"
                                : "bg-orange-400"
                            }`}
                          />
                          {site.leadDept}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-200">
                          {site.docs.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-200">
                          {site.storage}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-400">
                          {site.lastActivity}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-medium ${
                            site.trendPositive === true
                              ? "text-emerald-400"
                              : site.trendPositive === false
                              ? "text-red-400"
                              : "text-slate-400"
                          }`}
                        >
                          {site.trendPositive === true ? "↗ " : site.trendPositive === false ? "↘ " : "− "}
                          {site.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/50">
              <p className="text-sm text-slate-500">
                Showing 4 of 28 Active Projects
              </p>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
