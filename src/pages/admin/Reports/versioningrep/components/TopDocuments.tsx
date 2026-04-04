import { FileText, Table as TableIcon, Layout, FileType, Eye } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const documents = [
  {
    name: 'Site_B_Safety_Protocol.docx',
    dept: 'Safety Dept',
    owner: 'Maria G.',
    versions: 'v42.0',
    lastModified: '2 hours ago',
    icon: FileText,
    iconColor: 'bg-indigo-500/20 text-indigo-400',
    versionColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
  },
  {
    name: 'Project_Alpha_Budget.xlsx',
    dept: 'Finance',
    owner: 'John D.',
    versions: 'v38.5',
    lastModified: 'Yesterday',
    icon: TableIcon,
    iconColor: 'bg-emerald-500/20 text-emerald-400',
    versionColor: 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
  },
  {
    name: 'Main_Foundation_Plan.dwg',
    dept: 'Engineering',
    owner: 'Sarah J.',
    versions: 'v24.1',
    lastModified: 'May 20',
    icon: Layout,
    iconColor: 'bg-purple-500/20 text-purple-400',
    versionColor: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
  },
  {
    name: 'Env_Impact_Assessment.pdf',
    dept: 'Legal',
    owner: 'Mike K.',
    versions: 'v15.0',
    lastModified: 'May 18',
    icon: FileType,
    iconColor: 'bg-rose-500/20 text-rose-400',
    versionColor: 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
  },
  {
    name: 'Q3_Strategy_Draft.docx',
    dept: 'Executive',
    owner: 'Alex M.',
    versions: 'v12.2',
    lastModified: 'May 15',
    icon: FileText,
    iconColor: 'bg-indigo-500/20 text-indigo-400',
    versionColor: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
  }
];

const TopDocuments = () => {
  return (
    <div className="bg-[#15162B] border border-[#1E203B] rounded-2xl p-6 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">Top Documents by Revision Count</h3>
        <p className="text-sm text-slate-500">Files undergoing frequent modifications</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-[#1E203B]">
              <th className="pb-4">Document Name</th>
              <th className="pb-4">Owner</th>
              <th className="pb-4">Versions</th>
              <th className="pb-4">Last Modified</th>
              <th className="pb-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E203B]">
            {documents.map((doc, idx) => (
              <tr key={idx} className="group hover:bg-[#1E203B]/30 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", doc.iconColor)}>
                      <doc.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors cursor-pointer">{doc.name}</p>
                      <p className="text-[10px] text-slate-500">{doc.dept}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <p className="text-sm font-medium text-slate-300">{doc.owner}</p>
                </td>
                <td className="py-4">
                  <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full", doc.versionColor)}>
                    {doc.versions}
                  </span>
                </td>
                <td className="py-4">
                  <p className="text-xs text-slate-400">{doc.lastModified}</p>
                </td>
                <td className="py-4 text-right">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopDocuments;
