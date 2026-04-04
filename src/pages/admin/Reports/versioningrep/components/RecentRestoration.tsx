import { Table as TableIcon, Layout, FileText } from 'lucide-react';

const restorationData = [
  {
    document: 'Geo_Survey_Section_4.pdf',
    dept: 'Geology',
    from: 'v4.2',
    to: 'v4.1',
    date: 'May 29, 2024 at 10:45 AM',
    restoredBy: 'Sarah Jenkins',
    restoredByInitials: 'SJ',
    restoredByColor: 'bg-indigo-500',
    icon: TableIcon,
    iconColor: 'bg-emerald-500/20 text-emerald-400'
  },
  {
    document: 'Contract_Draft_MIGECO.docx',
    dept: 'Legal',
    from: 'v12.5',
    to: 'v12.3',
    date: 'May 28, 2024 at 03:20 PM',
    restoredBy: 'Alex Morgan',
    restoredByInitials: 'AM',
    restoredByColor: 'bg-slate-500',
    icon: FileText,
    iconColor: 'bg-indigo-500/20 text-indigo-400'
  },
  {
    document: 'Elevation_Map_Zone_C.dwg',
    dept: 'Engineering',
    from: 'v8.1',
    to: 'v8.0',
    date: 'May 26, 2024 at 09:15 AM',
    restoredBy: 'Mike Kovan',
    restoredByInitials: 'MK',
    restoredByColor: 'bg-purple-500',
    icon: Layout,
    iconColor: 'bg-purple-500/20 text-purple-400'
  }
];

const RecentRestoration = () => {
  return (
    <div className="bg-[#15162B] border border-[#1E203B] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">Recent Restoration Activity</h3>
        <button className="text-indigo-400 text-sm font-medium hover:underline transition-all">View All Logs</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-[#1E203B]">
              <th className="pb-4 w-1/3">Document</th>
              <th className="pb-4">Restored From</th>
              <th className="pb-4">Restored To</th>
              <th className="pb-4">Date</th>
              <th className="pb-4">Restored By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E203B]">
            {restorationData.map((item, idx) => (
              <tr key={idx} className="group hover:bg-[#1E203B]/30 transition-colors">
                <td className="py-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.iconColor}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors cursor-pointer">{item.document}</p>
                      <p className="text-[10px] text-slate-500">{item.dept}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5">
                  <span className="text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                    {item.from}
                  </span>
                </td>
                <td className="py-5">
                  <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    {item.to}
                  </span>
                </td>
                <td className="py-5">
                  <p className="text-xs text-slate-400 max-w-[150px]">{item.date}</p>
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${item.restoredByColor} flex items-center justify-center text-[10px] font-bold text-white`}>
                      {item.restoredByInitials}
                    </div>
                    <p className="text-xs font-medium text-slate-300">{item.restoredBy}</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentRestoration;
