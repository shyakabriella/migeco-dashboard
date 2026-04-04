// React imports not needed for this component structure

import { 
  RotateCcw,
  Bell, 
  ChevronDown,
  FileText,
  History
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminSidebar from '../AdminSidebar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const versions = [
  { id: 'V1.3', date: 'Today, 10:42 AM', author: 'J. Doe', summary: 'Updated sector C reinforcement layers...', status: 'In Review', current: true },
  { id: 'V1.2', date: 'Oct 24, 2023, 09:15 AM', author: 'A. Morgan', summary: 'Major structural adjustment to Sector B...', status: 'Approved', current: false },
  { id: 'V1.1', date: 'Oct 22, 2023, 04:30 PM', author: 'M. Ross', summary: 'Initial feedback incorporation from site ...', status: 'Archived', current: false },
  { id: 'V1.0', date: 'Oct 20, 2023, 02:00 PM', author: 'J. Doe', summary: 'Initial upload of foundation plans', status: 'Original', current: false },
];

export default function Restore() {
  return (
    <div className="flex h-screen bg-[#0B0E14] text-gray-300 font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0B0E14] sticky top-0 z-10">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white font-medium">Restore Version</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full text-xs">
              <FileText size={14} />
              Foundation_plan_section_A.dwg
              <span className="bg-blue-900 text-blue-300 px-2 py-0.5 rounded text-[10px]">IN REVIEW</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={18} />
            <div className="flex items-center gap-2">
              <img src="https://i.pravatar.cc/32" alt="Alex" className="w-8 h-8 rounded-full" />
              <div className="text-right leading-none">
                <div className="text-sm text-white">Alex Morgan</div>
                <div className="text-[10px] text-gray-500">Lead Geologist</div>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">Version History</h1>
            <p className="text-gray-500">Select a previous version to rollback the document state. This action will be logged.</p>
          </div>

          <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex justify-end gap-2 p-4 border-b border-gray-800">
              <button className="px-4 py-1.5 bg-gray-800 rounded text-sm text-white">List View</button>
              <button className="px-4 py-1.5 hover:bg-gray-800 rounded text-sm text-gray-500">Graph View</button>
            </div>
            
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase border-b border-gray-800 bg-gray-900/80">
                <tr>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">Date Modified</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Change Summary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {versions.map((v) => (
                  <tr key={v.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center bg-gray-800">
                        <History size={16} />
                      </div>
                      <div>
                        <div className="text-white font-medium">{v.id}</div>
                        {v.current && <div className="text-[10px] text-blue-500 uppercase font-semibold tracking-wider">Current</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">{v.date}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">
                        {v.author.charAt(0)}
                      </div>
                      {v.author}
                    </td>
                    <td className="px-6 py-4">{v.summary}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-1 rounded text-[10px] font-medium uppercase", 
                        v.status === 'In Review' ? 'bg-blue-900/30 text-blue-400' :
                        v.status === 'Approved' ? 'bg-green-900/30 text-green-400' :
                        v.status === 'Archived' ? 'bg-gray-700/30 text-gray-400' : 'bg-gray-800 text-gray-500'
                      )}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-blue-400">
                      {!v.current && (
                        <button className="flex items-center gap-1 text-xs underline decoration-blue-400/50 underline-offset-4">
                          <RotateCcw size={12} />
                          Restore to this Version
                        </button>
                      )}
                      {v.current && <span className="text-gray-600 text-xs">Current Version</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
