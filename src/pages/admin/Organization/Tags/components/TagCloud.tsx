
import { Cloud, ChevronDown } from 'lucide-react';

const TagItem = ({ label, count, primary }: { label: string; count?: number; primary?: boolean }) => (
  <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
    primary 
      ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
      : 'bg-[#1a1932] text-gray-400 border-gray-700 hover:border-gray-500'
  }`}>
    {label} {count && <span className="text-gray-500 ml-1">({count})</span>}
  </span>
);

export const TagCloud = () => {
  const tags = [
    { label: "#soil-analysis", count: 452, primary: true },
    { label: "#site-survey", count: 389, primary: true },
    { label: "#drill-log", count: 210, primary: false },
    { label: "#geotechnical", primary: false },
    { label: "#foundation-check", primary: false },
    { label: "#safety-report", primary: false },
    { label: "#excavation", primary: false },
    { label: "#water-table", primary: false },
    { label: "#concrete-mix", primary: false },
    { label: "#sector-4-b", primary: false },
    { label: "#drone-footage", primary: false },
    { label: "#lab-results-pending", primary: false },
    { label: "#archived-2022", primary: false },
    { label: "#permit-approval", primary: false },
    { label: "#heavy-machinery", primary: false },
    { label: "#maintenance-log", primary: false },
    { label: "#topography", primary: false },
    { label: "#cad-drawing", primary: false },
  ];

  return (
    <div className="bg-[#1a1932] rounded-xl border border-gray-800 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Cloud size={18} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Popular Tags Cloud</h2>
        </div>
        <button className="flex items-center gap-2 text-xs text-gray-400 bg-[#252445] px-3 py-1.5 rounded-lg border border-gray-700">
          Last 30 Days <ChevronDown size={14} />
        </button>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {tags.map((tag, idx) => (
          <TagItem key={idx} {...tag} />
        ))}
      </div>
    </div>
  );
};
