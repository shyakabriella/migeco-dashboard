import { useState } from "react";
import { MoreVertical, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface SearchResultsProps {
  currentPage: number;
  setCurrentPage: (p: number) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}

interface Document {
  id: number;
  icon: string;
  iconBg: string;
  name: string;
  modified: string;
  project: string;
  projectColor: string;
  type: string;
  relevance: number;
  relevanceColor: string;
  snippet: string;
  keyword: string;
  snippetSuffix: string;
}

const documents: Document[] = [
  {
    id: 1,
    icon: "PDF",
    iconBg: "bg-red-600",
    name: "Geological_Survey_Report_Alpha_v2.pdf",
    modified: "Modified: Oct 24, 2023 by Sarah L.",
    project: "Site Alpha",
    projectColor: "bg-[#1e2a3a] text-[#7dd3fc] border border-[#2a3f5a]",
    type: "Report",
    relevance: 95,
    relevanceColor: "from-green-500 to-green-400",
    snippet: '...found "',
    keyword: "soil composition",
    snippetSuffix: '" on page 4...',
  },
  {
    id: 2,
    icon: "DOC",
    iconBg: "bg-blue-600",
    name: "Soil_Test_Results_Lab_B.docx",
    modified: "Modified: Oct 20, 2023 by Lab Team",
    project: "Project Beta",
    projectColor: "bg-[#1e2a3a] text-[#7dd3fc] border border-[#2a3f5a]",
    type: "Lab Result",
    relevance: 82,
    relevanceColor: "from-green-500 to-green-400",
    snippet: "...analysis of ",
    keyword: "soil",
    snippetSuffix: " density and moisture...",
  },
  {
    id: 3,
    icon: "XLS",
    iconBg: "bg-green-700",
    name: "Excavation_Log_Q3.xlsx",
    modified: "Modified: Sep 15, 2023 by Mike R.",
    project: "Site Alpha",
    projectColor: "bg-[#1e2a3a] text-[#7dd3fc] border border-[#2a3f5a]",
    type: "Log",
    relevance: 45,
    relevanceColor: "from-yellow-500 to-yellow-400",
    snippet: "...tags: ",
    keyword: "soil",
    snippetSuffix: ", excavation, heavy...",
  },
  {
    id: 4,
    icon: "JPG",
    iconBg: "bg-purple-600",
    name: "Site_Photo_Sector_4_Soil.jpg",
    modified: "Modified: Oct 01, 2023 by Drone #4",
    project: "Site Alpha",
    projectColor: "bg-[#1e2a3a] text-[#7dd3fc] border border-[#2a3f5a]",
    type: "Photo",
    relevance: 30,
    relevanceColor: "from-blue-500 to-blue-400",
    snippet: "...metadata: ",
    keyword: "soil",
    snippetSuffix: " erosion visible...",
  },
];

function RelevanceBar({
  value,
  colorClass,
}: {
  value: number;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 w-24 h-1.5 bg-[#1e2433] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={`text-xs font-semibold ${
          value >= 80
            ? "text-green-400"
            : value >= 50
            ? "text-yellow-400"
            : "text-blue-400"
        }`}
      >
        {value}%
      </span>
    </div>
  );
}

function DocIcon({ icon, bg }: { icon: string; bg: string }) {
  return (
    <div
      className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}
    >
      {icon}
    </div>
  );
}

export default function SearchResults({
  currentPage,
  setCurrentPage,
  sortBy,
  setSortBy,
}: SearchResultsProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const totalResults = 24;
  const totalPages = 3;

  const toggleAll = () => {
    if (allSelected) {
      setSelected([]);
      setAllSelected(false);
    } else {
      setSelected(documents.map((d) => d.id));
      setAllSelected(true);
    }
  };

  const toggleRow = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#8b96a8] uppercase tracking-widest">
            Search Results
          </span>
          <span className="text-xs font-bold text-white bg-[#1e2433] rounded px-2 py-0.5">
            {totalResults} Found
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8b96a8]">
          <span>Sort by:</span>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 text-white font-medium hover:text-indigo-400 transition-colors"
            >
              {sortBy}
              <ChevronDown size={12} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-7 bg-[#111827] border border-[#1e2a3a] rounded-lg shadow-xl z-10 min-w-[120px]">
                {["Relevance", "Date", "Name", "Type"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortBy(opt);
                      setShowSortMenu(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-xs hover:bg-[#1e2433] transition-colors
                      ${opt === sortBy ? "text-indigo-400" : "text-[#8b96a8]"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl overflow-hidden">
        {/* Table Head */}
        <div className="grid grid-cols-[40px_1fr_140px_100px_200px_80px] items-center border-b border-[#1e2a3a] px-4 py-2.5">
          <div>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-3.5 h-3.5 rounded accent-indigo-500 cursor-pointer"
            />
          </div>
          <div className="text-[10px] font-semibold text-[#8b96a8] uppercase tracking-wider pl-10">
            Document Name
          </div>
          <div className="text-[10px] font-semibold text-[#8b96a8] uppercase tracking-wider">
            Project
          </div>
          <div className="text-[10px] font-semibold text-[#8b96a8] uppercase tracking-wider">
            Type
          </div>
          <div className="text-[10px] font-semibold text-[#8b96a8] uppercase tracking-wider">
            Relevance / Match
          </div>
          <div className="text-[10px] font-semibold text-[#8b96a8] uppercase tracking-wider text-right">
            Actions
          </div>
        </div>

        {/* Rows */}
        {documents.map((doc, idx) => (
          <div
            key={doc.id}
            className={`grid grid-cols-[40px_1fr_140px_100px_200px_80px] items-center px-4 py-3 border-b border-[#1e2433] last:border-b-0 transition-colors
              ${
                selected.includes(doc.id)
                  ? "bg-indigo-900/10"
                  : idx % 2 === 0
                  ? "bg-transparent hover:bg-[#0d1117]/60"
                  : "bg-[#0d1117]/30 hover:bg-[#0d1117]/60"
              }`}
          >
            {/* Checkbox */}
            <div>
              <input
                type="checkbox"
                checked={selected.includes(doc.id)}
                onChange={() => toggleRow(doc.id)}
                className="w-3.5 h-3.5 rounded accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Name + Icon */}
            <div className="flex items-center gap-3 min-w-0">
              <DocIcon icon={doc.icon} bg={doc.iconBg} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate leading-tight">
                  {doc.name}
                </p>
                <p className="text-[10px] text-[#8b96a8] mt-0.5">{doc.modified}</p>
              </div>
            </div>

            {/* Project */}
            <div>
              <span
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${doc.projectColor}`}
              >
                {doc.project}
              </span>
            </div>

            {/* Type */}
            <div className="text-xs text-[#8b96a8]">{doc.type}</div>

            {/* Relevance */}
            <div>
              <RelevanceBar
                value={doc.relevance}
                colorClass={doc.relevanceColor}
              />
              <p className="text-[10px] text-[#8b96a8] mt-1 truncate">
                {doc.snippet}
                <span className="text-yellow-400 font-semibold">{doc.keyword}</span>
                {doc.snippetSuffix}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button className="w-7 h-7 rounded-md hover:bg-[#1e2433] flex items-center justify-center text-[#8b96a8] hover:text-white transition-colors">
                <MoreVertical size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-1">
        <span className="text-xs text-[#8b96a8]">
          Showing 1-{documents.length} of {totalResults} results
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#111827] border border-[#1e2a3a] text-[#8b96a8] hover:text-white hover:border-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors border
                ${
                  currentPage === page
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-[#111827] border-[#1e2a3a] text-[#8b96a8] hover:text-white hover:border-indigo-500"
                }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#111827] border border-[#1e2a3a] text-[#8b96a8] hover:text-white hover:border-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
