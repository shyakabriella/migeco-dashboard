import { SlidersHorizontal, Plus, Star, ChevronRight } from "lucide-react";

interface FileRow {
  name: string;
  type: string;
  subtype: string;
  project: string | null;
  projectColor: string;
  icon: "pdf" | "cad" | "xlsx" | "img";
}

const FILES: FileRow[] = [
  {
    name: "Geo_Survey_Site_Alpha_Final.pdf",
    type: "PDF",
    subtype: "Document",
    project: "Site Alpha",
    projectColor: "text-indigo-400",
    icon: "pdf",
  },
  {
    name: "Foundation_Plan_v2.dwg",
    type: "CAD",
    subtype: "Drawing",
    project: "Site Alpha",
    projectColor: "text-indigo-400",
    icon: "cad",
  },
  {
    name: "Cost_Analysis_Q3.xlsx",
    type: "Spreadsheet",
    subtype: "",
    project: "Finance",
    projectColor: "text-orange-400",
    icon: "xlsx",
  },
  {
    name: "Site_Inspection_North_Wall.jpg",
    type: "Image",
    subtype: "",
    project: "Site Alpha",
    projectColor: "text-indigo-400",
    icon: "img",
  },
];

function FileIcon({ type }: { type: FileRow["icon"] }) {
  if (type === "pdf") {
    return (
      <div className="w-7 h-7 rounded bg-red-100 flex items-center justify-center">
        <span className="text-red-600 text-[9px] font-bold">PDF</span>
      </div>
    );
  }
  if (type === "cad") {
    return (
      <div className="w-7 h-7 rounded bg-blue-100 flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="1" stroke="#2563eb" strokeWidth="1.5" />
          <path d="M5 11L11 5" stroke="#2563eb" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }
  if (type === "xlsx") {
    return (
      <div className="w-7 h-7 rounded bg-green-100 flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="1" stroke="#16a34a" strokeWidth="1.5" />
          <path d="M5 6h6M5 9h6M5 12h3" stroke="#16a34a" strokeWidth="1.2" />
        </svg>
      </div>
    );
  }
  // img
  return (
    <div className="w-7 h-7 rounded bg-purple-100 flex items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="1" stroke="#7c3aed" strokeWidth="1.5" />
        <circle cx="6" cy="7" r="1.2" fill="#7c3aed" />
        <path d="M2 11l3-3 3 3 2-2 4 3" stroke="#7c3aed" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

function ProjectBadge({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  const isFinance = label === "Finance";
  if (isFinance) {
    return (
      <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-medium">
        Finance
      </span>
    );
  }
  return (
    <div className="text-center">
      <p className={`text-xs font-medium ${colorClass}`}>Site</p>
      <p className={`text-xs font-medium ${colorClass}`}>Alpha</p>
    </div>
  );
}

interface Props {
  selectedFile: string | null;
  setSelectedFile: (name: string) => void;
  checkedFiles: string[];
  toggleCheck: (name: string) => void;
}

export default function MainContent({
  selectedFile,
  setSelectedFile,
  checkedFiles,
  toggleCheck,
}: Props) {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between mb-5">
        <nav className="flex items-center gap-1 text-xs text-slate-400">
          <span className="hover:text-white cursor-pointer">Home</span>
          <ChevronRight size={13} />
          <span className="hover:text-white cursor-pointer">Documents</span>
          <ChevronRight size={13} />
          <span className="text-white font-medium">Favorites</span>
        </nav>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e2435] border border-[#2a3347] text-xs text-slate-300 hover:text-white transition-colors">
            <SlidersHorizontal size={13} />
            Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
            <Plus size={13} />
            Add to Favorites
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1f2e] border border-[#252d3d] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_160px_140px] px-4 py-3 border-b border-[#252d3d] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded accent-indigo-500"
            />
          </div>
          <div>Name</div>
          <div>Type</div>
          <div>Project</div>
        </div>

        {/* Rows */}
        {FILES.map((file) => {
          const isSelected = selectedFile === file.name;
          const isChecked = checkedFiles.includes(file.name);
          return (
            <div
              key={file.name}
              onClick={() => setSelectedFile(file.name)}
              className={`grid grid-cols-[40px_1fr_160px_140px] px-4 py-3 border-b border-[#252d3d] last:border-0 cursor-pointer transition-colors ${
                isSelected ? "bg-[#1e2a3d]" : "hover:bg-[#1e2435]"
              }`}
            >
              {/* Checkbox */}
              <div
                className="flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCheck(file.name);
                }}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-indigo-500 border-indigo-500"
                      : "border-slate-600 bg-transparent"
                  }`}
                >
                  {isChecked && (
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 9 9"
                      fill="none"
                    >
                      <path
                        d="M1.5 4.5L3.5 6.5L7.5 2.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="flex items-center gap-2.5">
                <Star
                  size={14}
                  className="text-amber-400 fill-amber-400 shrink-0"
                />
                <FileIcon type={file.icon} />
                <span className="text-sm text-slate-200 truncate">
                  {file.name}
                </span>
              </div>

              {/* Type */}
              <div className="flex flex-col justify-center">
                <span className="text-sm text-slate-300">{file.type}</span>
                {file.subtype && (
                  <span className="text-xs text-slate-500">{file.subtype}</span>
                )}
              </div>

              {/* Project */}
              <div className="flex items-center">
                <ProjectBadge
                  label={file.project ?? ""}
                  colorClass={file.projectColor}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-slate-500">Showing 1-4 of 32 favorites</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs rounded-lg bg-[#1e2435] border border-[#2a3347] text-slate-400 hover:text-white transition-colors">
            Previous
          </button>
          <button className="px-3 py-1 text-xs rounded-lg bg-[#1e2435] border border-[#2a3347] text-slate-300 hover:text-white transition-colors">
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
