import React from 'react';
import { 
  UploadCloud, 
  Bell,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
  User,
  Plus,
  Download,
  FileWarning,
  AlertTriangle,
  Folder,
  Eye,
  Clock,
  Search
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminSidebar from '../AdminSidebar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Success': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Partial (2 Failed)': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Failed (Virus)': 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 w-fit", styles[status] || styles['Success'])}>
      <span className={cn("w-1.5 h-1.5 rounded-full", status === 'Success' ? 'bg-green-500' : status.includes('Partial') ? 'bg-yellow-500' : 'bg-red-500')} />
      {status}
    </span>
  );
};

// --- Main App ---

export default function History() {
  const tableData = [
    { id: '#BATCH-2023-10-45A', date: 'Oct 26, 2023 14:30', files: 45, status: 'Success', user: 'Alex Morgan', avatar: 'AM' },
    { id: '#BATCH-2023-10-44B', date: 'Oct 26, 2023 11:15', files: 128, status: 'Partial (2 Failed)', user: 'John Doe', avatar: 'JD', expanded: true },
    { id: '#BATCH-2023-10-43C', date: 'Oct 25, 2023 09:42', files: 12, status: 'Success', user: 'Sarah Lee', avatar: 'SL' },
    { id: '#BATCH-2023-10-42A', date: 'Oct 24, 2023 16:20', files: 210, status: 'Success', user: 'Alex Morgan', avatar: 'AM' },
    { id: '#BATCH-2023-10-41D', date: 'Oct 24, 2023 10:05', files: 8, status: 'Failed (Virus)', user: 'Mike Peters', avatar: 'MP' },
    { id: '#BATCH-2023-10-40B', date: 'Oct 23, 2023 13:15', files: 56, status: 'Success', user: 'John Doe', avatar: 'JD' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-gray-100 font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search upload history, batches, or users..." 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-gray-300"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-gray-500">
              ⌘ K
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell size={20} className="text-gray-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#020617] flex items-center justify-center text-[7px] font-bold">1</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Alex Morgan</p>
                <p className="text-[10px] text-gray-500">Lead Geologist</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden border-2 border-slate-700">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950/20">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Upload History</h1>
              <p className="text-sm text-gray-400">Review past batches, status reports, and user activity.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-800">
                <Download size={16} />
                Export Log
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                <Plus size={16} />
                New Upload
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#0f172a]/50 border border-slate-800 rounded-xl overflow-hidden">
            {/* Table Filters */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#1e293b]/20">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 border border-slate-700 rounded-md text-xs text-gray-300">
                  <Calendar size={14} /> Date Range <ChevronDown size={12} />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 border border-slate-700 rounded-md text-xs text-gray-300">
                  <Filter size={14} /> Status <ChevronDown size={12} />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 border border-slate-700 rounded-md text-xs text-gray-300">
                  <User size={14} /> User <ChevronDown size={12} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Showing 1-10 of 142 batches</span>
                <div className="flex gap-1">
                   <button className="p-1 hover:text-white"><ChevronDown className="rotate-90" size={14} /></button>
                   <button className="p-1 hover:text-white"><ChevronDown className="-rotate-90" size={14} /></button>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">Batch ID</th>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                  <th className="px-6 py-4 font-semibold">Files</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tableData.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className={cn(
                      "group hover:bg-slate-800/30 transition-colors",
                      row.expanded ? "bg-[#1e1b4b]/20" : ""
                    )}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Folder size={16} className="text-gray-500" />
                          <span className="font-semibold text-white">{row.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{row.date}</td>
                      <td className="px-6 py-4 text-gray-400 font-medium">{row.files}</td>
                      <td className="px-6 py-4">
                        <Badge status={row.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                            {row.avatar}
                          </div>
                          <span className="text-gray-300">{row.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-gray-500 hover:text-white transition-colors">
                          {row.expanded ? <ChevronUp size={16} /> : <Eye size={16} />}
                        </button>
                      </td>
                    </tr>
                    
                    {row.expanded && (
                      <tr>
                        <td colSpan={6} className="px-6 py-0">
                          <div className="bg-[#1e293b]/30 border-x-2 border-blue-500/50 rounded-b-lg mb-4 p-6 border-b border-slate-800/50 relative">
                            {/* Connector Line */}
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500/20 -ml-[2px]" />
                            
                            <div className="flex items-center gap-2 mb-6">
                              <AlertTriangle className="text-yellow-500" size={18} />
                              <h3 className="font-semibold text-white">Batch Summary - {row.id}</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-8">
                              <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                <p className="text-[10px] uppercase text-gray-500 mb-1">Processing Time</p>
                                <p className="text-lg font-bold text-white">12m 45s</p>
                              </div>
                              <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                <p className="text-[10px] uppercase text-gray-500 mb-1">Total Size</p>
                                <p className="text-lg font-bold text-white">1.4 GB</p>
                              </div>
                              <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                <p className="text-[10px] uppercase text-gray-500 mb-1">Project</p>
                                <p className="text-lg font-bold text-white">Project Beta - Infrastructure</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <p className="text-[10px] uppercase font-bold text-gray-500">Failed Files</p>
                              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 flex justify-between items-center group/item hover:bg-red-500/10 transition-colors">
                                <div className="flex items-center gap-3">
                                  <FileWarning size={16} className="text-red-500/60" />
                                  <span className="text-sm text-gray-300">site_survey_north_corrupted.pdf</span>
                                </div>
                                <span className="text-xs text-red-500/60 font-medium">File corrupted or unreadable</span>
                              </div>
                              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 flex justify-between items-center group/item hover:bg-red-500/10 transition-colors">
                                <div className="flex items-center gap-3">
                                  <FileWarning size={16} className="text-red-500/60" />
                                  <span className="text-sm text-gray-300">large_map_v2.dwg</span>
                                </div>
                                <span className="text-xs text-red-500/60 font-medium">Timeout during OCR processing</span>
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                               <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-gray-300 hover:bg-slate-700">
                                 Download Report
                               </button>
                               <button className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-medium text-white hover:bg-blue-700">
                                 Retry Failed
                               </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="p-4 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between text-xs text-gray-500">
              <p>Displaying results for last 30 days</p>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 border border-slate-700 rounded-md text-gray-300">
                10 per page <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
