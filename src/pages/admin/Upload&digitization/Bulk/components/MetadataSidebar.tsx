import { ChevronDown, Tag, Trash2, CheckCircle2 } from 'lucide-react';

const MetadataSidebar = () => {
  return (
    <aside className="w-80 bg-[#0a0c14] border-l border-gray-800 p-6 overflow-y-auto h-screen sticky top-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Metadata Editor</h2>
        <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">12 Selected</span>
      </div>

      <div className="space-y-6">
        {/* Bulk Actions */}
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3">Bulk Actions</label>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 py-2 px-3 bg-[#151926] border border-gray-800 rounded-lg text-xs text-white hover:bg-gray-800 transition-colors">
              <CheckCircle2 size={14} /> Select All
            </button>
            <button className="flex items-center justify-center gap-2 py-2 px-3 bg-[#151926] border border-gray-800 rounded-lg text-xs text-white hover:bg-gray-800 transition-colors">
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Project Association */}
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Project Association</label>
          <div className="relative">
            <select className="w-full bg-[#151926] border border-gray-800 rounded-lg py-2.5 px-3 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>Project Beta - Infrastructure</option>
              <option>Project Alpha - Commercial</option>
              <option>Project Gamma - Logistics</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
          </div>
          <p className="text-[10px] text-gray-600 mt-2 italic flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-gray-600"></span> Applies to all selected items
          </p>
        </div>

        {/* Document Type */}
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Document Type</label>
          <div className="relative">
            <select className="w-full bg-[#151926] border border-gray-800 rounded-lg py-2.5 px-3 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>Site Photos</option>
              <option>Engineering Drawing</option>
              <option>Progress Report</option>
              <option>Field Survey</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <TagBadge label="excavation" />
            <TagBadge label="phase_1" />
            <TagBadge label="inspection" />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Type and press Enter to add..."
              className="w-full bg-[#151926] border border-gray-800 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Description / Notes</label>
          <textarea 
            rows={4}
            placeholder="Enter batch description here..."
            className="w-full bg-[#151926] border border-gray-800 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-600 resize-none"
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          <Checkbox label="Auto-run OCR Processing" checked />
          <Checkbox label="Perform Virus Scan" checked />
        </div>
      </div>

      <div className="mt-12">
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
           Apply & Save Metadata
        </button>
      </div>
    </aside>
  );
};

const TagBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-600/10 border border-indigo-500/30 rounded text-[10px] font-medium text-indigo-400">
    {label} <button className="hover:text-white">×</button>
  </span>
);

const Checkbox = ({ label, checked }: { label: string, checked?: boolean }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${checked ? 'bg-indigo-600 border-indigo-500' : 'bg-[#151926] border-gray-800'}`}>
      {checked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
    </div>
    <span className="text-xs font-medium text-gray-300 group-hover:text-white">{label}</span>
  </label>
);

export default MetadataSidebar;
