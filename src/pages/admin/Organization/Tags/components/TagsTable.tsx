
import { Search, Layers, Trash2, Plus, Edit2, ChevronDown } from 'lucide-react';

const TagRow = ({ name, usage, category, lastUsed }: { name: string, usage: number, category: string, lastUsed: string }) => (
  <tr className="border-b border-gray-800/50 hover:bg-[#1a1932]/50 transition-colors">
    <td className="py-4 px-4 text-center">
      <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-transparent text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
    </td>
    <td className="py-4 px-4">
      <span className="text-sm font-semibold text-white">#{name}</span>
    </td>
    <td className="py-4 px-4">
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-24 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: `${(usage / 500) * 100}%` }}></div>
        </div>
        <span className="text-xs font-semibold text-gray-400">{usage}</span>
      </div>
    </td>
    <td className="py-4 px-4 text-sm text-gray-400">{category}</td>
    <td className="py-4 px-4 text-sm text-gray-400">{lastUsed}</td>
    <td className="py-4 px-4">
      <button className="p-1.5 rounded-lg bg-[#252445] text-gray-400 hover:text-white transition-colors border border-gray-700">
        <Edit2 size={14} />
      </button>
    </td>
  </tr>
);

export const TagsTable = () => {
  const data = [
    { name: "soil-analysis", usage: 452, category: "Geotechnical", lastUsed: "2 mins ago" },
    { name: "site-survey", usage: 389, category: "Field Work", lastUsed: "1 hour ago" },
    { name: "drill-log", usage: 210, category: "Operations", lastUsed: "Yesterday" },
    { name: "temp-file-dump", usage: 2, category: "Uncategorized", lastUsed: "3 months ago" },
  ];

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search tags..." 
            className="w-full bg-[#1a1932] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-white bg-[#1a1932] rounded-lg border border-gray-800 transition-colors">
            <Layers size={16} />
            Merge Selected
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-400 hover:text-rose-300 bg-[#1a1932] rounded-lg border border-gray-800 transition-colors">
            <Trash2 size={16} />
            Delete
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-600/20 transition-all">
            <Plus size={16} />
            Create Tag
          </button>
        </div>
      </div>

      <div className="bg-[#121124] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">All Tags</h2>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            Sort by: 
            <button className="font-semibold text-white flex items-center gap-1.5 hover:text-indigo-400">
              Usage frequency <ChevronDown size={14} />
            </button>
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1a1932]/30 border-b border-gray-800">
              <th className="py-3 px-4 w-12 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-transparent text-indigo-500" />
              </th>
              <th className="py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Tag Name</th>
              <th className="py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Usage Count</th>
              <th className="py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Related Categories</th>
              <th className="py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Last Used</th>
              <th className="py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <TagRow key={idx} {...row} />
            ))}
          </tbody>
        </table>
        
        <div className="p-4 border-t border-gray-800 text-center">
          <button className="text-xs font-semibold text-gray-500 hover:text-indigo-400 uppercase tracking-widest">View More</button>
        </div>
      </div>
    </div>
  );
};
