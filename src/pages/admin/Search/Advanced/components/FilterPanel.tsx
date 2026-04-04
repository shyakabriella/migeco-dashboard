import { SlidersHorizontal, Calendar, User, Search, ChevronDown } from "lucide-react";

interface FilterPanelProps {
  searchWithinContent: boolean;
  setSearchWithinContent: (v: boolean) => void;
  includeArchived: boolean;
  setIncludeArchived: (v: boolean) => void;
  keyword: string;
  setKeyword: (v: string) => void;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none
        ${checked ? "bg-indigo-600" : "bg-[#2a3347]"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow
          ${checked ? "translate-x-4" : "translate-x-1"}`}
      />
    </button>
  );
}

export default function FilterPanel({
  searchWithinContent,
  setSearchWithinContent,
  includeArchived,
  setIncludeArchived,
  keyword,
  setKeyword,
}: FilterPanelProps) {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-indigo-400" />
          <span className="text-sm font-semibold text-white">Filter Parameters</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 text-xs font-medium text-[#8b96a8] hover:text-white border border-[#1e2a3a] rounded-lg transition-colors bg-transparent">
            Reset
          </button>
          <button className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {/* Project Name */}
        <div>
          <label className="block text-[10px] font-semibold text-[#8b96a8] uppercase tracking-wider mb-1.5">
            Project Name
          </label>
          <div className="relative">
            <select className="w-full appearance-none bg-[#0d1117] border border-[#1e2a3a] text-white text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer">
              <option>All Projects</option>
              <option>Site Alpha</option>
              <option>Project Beta</option>
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b96a8] pointer-events-none"
            />
          </div>
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-[10px] font-semibold text-[#8b96a8] uppercase tracking-wider mb-1.5">
            Document Type
          </label>
          <div className="relative">
            <select className="w-full appearance-none bg-[#0d1117] border border-[#1e2a3a] text-[#8b96a8] text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer">
              <option value="">Select Types...</option>
              <option>Report</option>
              <option>Lab Result</option>
              <option>Log</option>
              <option>Photo</option>
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b96a8] pointer-events-none"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-[10px] font-semibold text-[#8b96a8] uppercase tracking-wider mb-1.5">
            Date Range
          </label>
          <div className="relative">
            <Calendar
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a8] pointer-events-none"
            />
            <input
              type="text"
              defaultValue="Oct 01 – Oct 31, 2023"
              className="w-full bg-[#0d1117] border border-[#1e2a3a] text-white text-xs rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Author */}
        <div>
          <label className="block text-[10px] font-semibold text-[#8b96a8] uppercase tracking-wider mb-1.5">
            Author
          </label>
          <div className="relative">
            <User
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a8] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Enter name or ID"
              className="w-full bg-[#0d1117] border border-[#1e2a3a] text-white text-xs rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:border-indigo-500 placeholder-[#4a5568]"
            />
          </div>
        </div>
      </div>

      {/* Bottom row: Toggles + Keyword */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <Toggle
              checked={searchWithinContent}
              onChange={() => setSearchWithinContent(!searchWithinContent)}
            />
            <span className="text-xs text-[#8b96a8]">Search within content (OCR)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <Toggle
              checked={includeArchived}
              onChange={() => setIncludeArchived(!includeArchived)}
            />
            <span className="text-xs text-[#8b96a8]">Include Archived</span>
          </label>
        </div>

        {/* Keyword Search */}
        <div className="relative w-64">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a8] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Keyword search..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#1e2a3a] text-white text-xs rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:border-indigo-500 placeholder-[#4a5568]"
          />
        </div>
      </div>
    </div>
  );
}
