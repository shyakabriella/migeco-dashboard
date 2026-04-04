
import { Lightbulb, ArrowRight, Tag } from 'lucide-react';

const Suggestion = ({ from, to, similarity }: { from: string; to: string; similarity: string }) => (
  <div className="bg-[#121124] p-4 rounded-xl border border-gray-800/50 mb-4 last:mb-0">
    <div className="flex justify-between items-center mb-3">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Similarity: {similarity}</span>
      <button className="text-xs font-bold text-indigo-400 uppercase tracking-wider hover:underline">Review</button>
    </div>
    <div className="flex items-center gap-3">
      <span className="bg-[#1a1932] px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 font-medium">#{from}</span>
      <ArrowRight size={14} className="text-gray-500" />
      <span className="bg-indigo-600/20 px-3 py-1.5 rounded-lg border border-indigo-500/30 text-sm text-indigo-400 font-medium">#{to}</span>
    </div>
  </div>
);

export const MergeSuggestions = () => {
  return (
    <div className="bg-[#1a1932] rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb size={18} className="text-amber-400" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Merge Suggestions</h2>
      </div>
      
      <Suggestion from="soil-comp" to="soil-composition" similarity="92%" />
      <Suggestion from="site-surv" to="site-survey" similarity="88%" />
    </div>
  );
};

export const AddTagForm = () => {
  return (
    <div className="bg-[#1a1932] rounded-xl border border-gray-800 p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Tag size={18} className="text-emerald-400" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Add New Tag</h2>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Tag Name</label>
          <input 
            type="text" 
            placeholder="#tag-name" 
            className="w-full bg-[#121124] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Category (Optional)</label>
          <div className="relative">
            <select className="w-full bg-[#121124] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none">
              <option>General</option>
              <option>Technical</option>
              <option>Administrative</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <ArrowRight size={14} className="text-gray-500 rotate-90" />
            </div>
          </div>
        </div>
        
        <button className="w-full bg-[#252445] text-white font-bold py-2.5 rounded-lg border border-indigo-500/20 hover:bg-[#2d2c55] transition-colors mt-2 uppercase text-xs tracking-widest">
          Create
        </button>
      </div>
    </div>
  );
};
