import {
  Search,
  Filter,
  ChevronDown,
  UserPlus,
  Database,
  ShieldAlert,
  Settings,
  UserMinus,
  Share2,
  HardDrive,
  Calendar
} from 'lucide-react';

const logs = [
  {
    id: 1,
    timestamp: '2023-10-24 15:42:10',
    admin: { name: 'Sarah Jenkins', role: 'SysAdmin', initials: 'SJ', color: 'bg-indigo-600' },
    action: { label: 'New User Added', icon: UserPlus, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    description: 'Created account for\nd.mitchell@migeco.com\nRole: Senior Engineer, Dept: Civil',
    impact: 'Low',
  },
  {
    id: 2,
    timestamp: '2023-10-24 14:15:33',
    admin: { name: 'Michael Ross', role: 'IT Lead', initials: 'MR', color: 'bg-amber-600' },
    action: { label: 'Storage Quota', icon: Database, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    description: 'Increased quota for Geology\nDept\nChanged from 5TB to 8TB',
    impact: 'Medium',
  },
  {
    id: 3,
    timestamp: '2023-10-24 11:05:00',
    admin: { name: 'System Auto', role: 'Automated', initials: 'SYS', color: 'bg-rose-600' },
    action: { label: 'Policy Enforcement', icon: ShieldAlert, color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
    description: 'Global Password Policy\nUpdate\nEnforced 2FA for all admin\naccounts',
    impact: 'High',
  },
  {
    id: 4,
    timestamp: '2023-10-23 16:20:12',
    admin: { name: 'Sarah Jenkins', role: 'SysAdmin', initials: 'SJ', color: 'bg-indigo-600' },
    action: { label: 'Global Settings', icon: Settings, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
    description: 'Modified API Rate Limits\nIncreased burst limit to 500\nreq/min',
    impact: 'Medium',
  },
  {
    id: 5,
    timestamp: '2023-10-23 09:15:45',
    admin: { name: 'David Kim', role: 'Security Ops', initials: 'DK', color: 'bg-fuchsia-600' },
    action: { label: 'User Suspension', icon: UserMinus, color: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20' },
    description: 'Suspended User:\ncontractor_04\nReason: Contract Expired',
    impact: 'Low',
  },
  {
    id: 6,
    timestamp: '2023-10-22 13:30:22',
    admin: { name: 'Ana Lopez', role: 'Data Mgr', initials: 'AL', color: 'bg-emerald-600' },
    action: { label: 'Share Config', icon: Share2, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    description: 'Created external share link\nProject Alpha - External Auditors\n(Read Only)',
    impact: 'Low',
  },
  {
    id: 7,
    timestamp: '2023-10-22 08:00:05',
    admin: { name: 'System Auto', role: 'Automated', initials: 'SYS', color: 'bg-rose-600' },
    action: { label: 'Backup Job', icon: HardDrive, color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
    description: 'Daily Incremental Backup\nCompleted successfully (Size:\n42GB)',
    impact: 'Low',
  },
];

const impactColor = {
  Low: 'text-gray-400',
  Medium: 'text-amber-500',
  High: 'text-rose-500',
};

export default function LogTable() {
  return (
    <div className="bg-[#1c1d2e] border border-[#2a2d42] rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-[#2a2d42] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full bg-[#141523] border border-[#2a2d42] text-white rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#141523] border border-[#2a2d42] text-white px-4 py-2 rounded-md text-sm hover:bg-[#1a1b2a] transition-colors">
            All Event Types
            <ChevronDown size={14} className="text-gray-400 ml-2" />
          </button>
          <button className="flex items-center gap-2 bg-[#141523] border border-[#2a2d42] text-white px-4 py-2 rounded-md text-sm hover:bg-[#1a1b2a] transition-colors">
            Last 30 Days
            <Calendar size={14} className="text-gray-400 ml-2" />
          </button>
        </div>
        <button className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 text-sm transition-colors">
          <Filter size={16} />
          More Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2a2d42] text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">Administrator</th>
              <th className="px-6 py-4 font-medium">Action Category</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium">Impact</th>
              <th className="px-6 py-4 font-medium text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d42]">
            {logs.map((log) => {
              const ActionIcon = log.action.icon;
              return (
                <tr key={log.id} className="hover:bg-[#1f2135] transition-colors group">
                  <td className="px-6 py-5 text-sm font-mono text-gray-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${log.admin.color} mr-3 shadow-sm`}>
                        {log.admin.initials}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{log.admin.name}</div>
                        <div className="text-xs text-gray-500">{log.admin.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded border text-xs font-medium ${log.action.color}`}>
                      <ActionIcon size={12} className="mr-1.5" />
                      {log.action.label}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-gray-300">
                      {log.description.split('\n').map((line, i) => (
                        <div key={i} className={i === 0 ? 'font-medium text-white mb-0.5' : 'text-xs text-gray-500'}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium">
                    <span className={impactColor[log.impact as keyof typeof impactColor]}>{log.impact}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-[#2a2d42] flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>Showing 1-7 of 1,892 records</span>
          <span className="w-px h-4 bg-[#2a2d42]"></span>
          <span>Page 1 of 271</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded bg-[#141523] border border-[#2a2d42] text-gray-500 cursor-not-allowed">
            Previous
          </button>
          <button className="px-3 py-1.5 rounded bg-[#141523] border border-[#2a2d42] text-gray-300 hover:bg-[#1a1b2a] transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
