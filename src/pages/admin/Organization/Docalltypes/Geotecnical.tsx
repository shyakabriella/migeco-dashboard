import { Search, Bell, MoreVertical } from "lucide-react";
import AdminSidebar from "../../AdminSidebar";

const reports = [
  {
    name: "GEO-2023-Sector7-A",
    project: "Skyline Towers",
    classification: "Clayey Sand (SC)",
    bearing: "250 kPa",
    date: "Oct 24, 2023",
    author: "Alex Morgan",
  },
  {
    name: "Borehole_Log_BH-04",
    project: "River Bridge",
    classification: "Silty Gravel (GM)",
    bearing: "180 kPa",
    date: "Oct 23, 2023",
    author: "Sarah Chen",
  },
  {
    name: "Slope_Stability_V2",
    project: "North Highway",
    classification: "Lean Clay (CL)",
    bearing: "N/A",
    date: "Oct 21, 2023",
    author: "Mike Ross",
  },
  {
    name: "Lab_Results_Consolidation",
    project: "Skyline Towers",
    classification: "Fat Clay (CH)",
    bearing: "95 kPa",
    date: "Oct 20, 2023",
    author: "Alex Morgan",
  },
  {
    name: "Foundation_Rec_ZoneB",
    project: "River Bridge",
    classification: "Well-graded Sand (SW)",
    bearing: "320 kPa",
    date: "Oct 19, 2023",
    author: "John Doe",
  },
];

export default function Geotechnical() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d1320] font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main panel with blue top border accent */}
      <div className="flex flex-col flex-1 overflow-hidden border-l-2 border-[#3b5bdb]">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-6 bg-[#0d1320] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">Geotechnical Reports</h2>
            <p className="text-xs text-slate-400">Organization / Document Types / Geotechnical</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm text-white transition-colors">Upload Report</button>
            <Bell size={18} className="text-slate-400" />
            <div className="text-sm text-slate-300">Alex Morgan</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          {/* Stats */}
          <div className="bg-[#12162a] border border-[#1e2235] p-4 rounded-xl flex justify-between mb-6">
            <div>
              <h3 className="font-semibold text-white">Geotechnical Database</h3>
              <p className="text-xs text-[#8e97a4]">Soil mechanics, foundation engineering...</p>
            </div>
            <div className="flex gap-10 text-sm">
              <div>
                <p className="text-[#8e97a4]">Total Reports</p>
                <p className="text-lg text-white">856</p>
              </div>
              <div>
                <p className="text-[#8e97a4]">Pending Review</p>
                <p className="text-yellow-400">12</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-4">
            <div className="flex items-center bg-[#12162a] border border-[#1e2235] px-3 py-2 rounded-lg w-[300px]">
              <Search size={16} className="text-[#8e97a4]" />
              <input
                placeholder="Search by name..."
                className="bg-transparent outline-none ml-2 text-sm w-full text-white placeholder-[#8e97a4]"
              />
            </div>
            <button className="bg-[#12162a] border border-[#1e2235] px-4 py-2 rounded-lg text-sm text-[#c0c7d1] hover:text-white transition-colors">Advanced Filter</button>
          </div>

          {/* Table */}
          <div className="bg-[#12162a] border border-[#1e2235] rounded-xl overflow-hidden flex-1">
            <table className="w-full text-sm">
              <thead className="bg-[#0d1320] border-b border-[#1e2235]">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-[#8e97a4] uppercase tracking-wider">Report Name</th>
                  <th className="p-4 text-left text-xs font-semibold text-[#8e97a4] uppercase tracking-wider">Project</th>
                  <th className="p-4 text-left text-xs font-semibold text-[#8e97a4] uppercase tracking-wider">Classification</th>
                  <th className="p-4 text-left text-xs font-semibold text-[#8e97a4] uppercase tracking-wider">Bearing</th>
                  <th className="p-4 text-left text-xs font-semibold text-[#8e97a4] uppercase tracking-wider">Last Modified</th>
                  <th className="p-4 text-right text-xs font-semibold text-[#8e97a4] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2235]">
                {reports.map((r, i) => (
                  <tr key={i} className="hover:bg-[#1a203a] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <span className="text-blue-400 text-xs font-medium">GR</span>
                        </div>
                        <span className="text-white font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#c0c7d1]">{r.project}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium">
                        {r.classification}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-green-400 font-medium">{r.bearing}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-[#c0c7d1]">{r.date}</div>
                      <div className="text-xs text-[#8e97a4] mt-0.5">by {r.author}</div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 hover:bg-[#12162a] rounded-lg transition-colors text-[#8e97a4] hover:text-white">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
