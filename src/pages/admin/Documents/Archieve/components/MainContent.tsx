import FileIcon, { getExt } from "./FileIcon";

const files = [
  {
    name: "Old_Survey_Draft_v1.pdf",
    location: "/Projects/Alpha/Survey",
    dateDeleted: "Oct 26, 2023",
  },
  {
    name: "Temp_Field_Notes",
    location: "/Personal/Temp",
    dateDeleted: "Oct 20, 2023",
  },
  {
    name: "Corrupted_Plan.dwg",
    location: "/Projects/Beta/CAD",
    dateDeleted: "Oct 15, 2023",
  },
  {
    name: "Obsolete_Budget_2022.xlsx",
    location: "/Finance/Archives",
    dateDeleted: "Oct 05, 2023",
  },
  {
    name: "Blurred_Site_Photo.jpg",
    location: "/Projects/Alpha/Photos",
    dateDeleted: "Sep 28, 2023",
  },
];

type Props = {
  selectedFile: string | null;
  setSelectedFile: (name: string) => void;
  checkedFiles: string[];
  toggleCheck: (name: string) => void;
};

export default function MainContent({ selectedFile, setSelectedFile, checkedFiles, toggleCheck }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-auto bg-[#0f1117] px-6 py-4">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1 text-sm text-[#8b9bb4]">
          <span className="hover:text-white cursor-pointer transition-colors">Home</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="hover:text-white cursor-pointer transition-colors">Documents</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="flex items-center gap-1.5 text-[#4f8ef7] font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Archive
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Info badge */}
          <div className="flex items-center gap-1.5 bg-[#1a1507] border border-[#3d2e08] rounded-md px-3 py-1.5 text-xs text-[#e8b84b]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
            Items are deleted after 30 days
          </div>

          {/* Restore button */}
          <button className="flex items-center gap-1.5 bg-[#0d2d1a] border border-[#1a5c35] hover:bg-[#163d25] rounded-md px-3 py-1.5 text-xs text-[#3dba6f] font-medium transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restore
          </button>

          {/* Delete Permanently button */}
          <button className="flex items-center gap-1.5 bg-[#2d0f0f] border border-[#5c1a1a] hover:bg-[#3d1515] rounded-md px-3 py-1.5 text-xs text-[#e05252] font-medium transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Permanently
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#131720] border border-[#1e2330] rounded-xl overflow-hidden flex-1">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_200px_150px_50px] items-center px-4 py-3 border-b border-[#1e2330] text-xs text-[#8b9bb4] font-semibold uppercase tracking-wider">
          <div>
            <div className="w-4 h-4 border border-[#2a3145] rounded bg-[#1a1f2e]" />
          </div>
          <div>NAME</div>
          <div>ORIGINAL LOCATION</div>
          <div>DATE DELETED</div>
          <div></div>
        </div>

        {/* Table rows */}
        {files.map((file) => {
          const isSelected = selectedFile === file.name;
          const isChecked = checkedFiles.includes(file.name);
          const ext = getExt(file.name);

          return (
            <div
              key={file.name}
              onClick={() => setSelectedFile(file.name)}
              className={`grid grid-cols-[40px_1fr_200px_150px_50px] items-center px-4 py-3.5 border-b border-[#1e2330] cursor-pointer transition-colors
                ${isSelected ? "bg-[#1a2035]" : "hover:bg-[#161b27]"}
              `}
            >
              {/* Checkbox */}
              <div onClick={(e) => { e.stopPropagation(); toggleCheck(file.name); }}>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors
                    ${isChecked ? "bg-[#3b5bdb] border-[#3b5bdb]" : "border-[#2a3145] bg-[#1a1f2e]"}
                  `}
                >
                  {isChecked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="flex items-center gap-3 min-w-0">
                <FileIcon ext={ext} />
                <span className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-[#c8d3e8]"}`}>
                  {file.name}
                </span>
              </div>

              {/* Location */}
              <div className="text-sm text-[#8b9bb4] truncate">{file.location}</div>

              {/* Date */}
              <div className="text-sm text-[#8b9bb4] whitespace-pre-line">{file.dateDeleted.replace(", ", ",\n")}</div>

              {/* Status dot */}
              <div className="flex justify-center">
                <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-[#3b5bdb]" : "bg-[#2a3145]"}`} />
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3.5 text-sm text-[#8b9bb4]">
          <span>Showing 1-5 of 42 archived items</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-[#1a1f2e] border border-[#2a3145] rounded-md text-xs text-[#8b9bb4] hover:text-white hover:bg-[#202535] transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-[#1a1f2e] border border-[#2a3145] rounded-md text-xs text-[#8b9bb4] hover:text-white hover:bg-[#202535] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
