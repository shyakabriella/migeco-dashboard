import { X, Download, Star, CheckCircle2, Edit3 } from "lucide-react";

interface Props {
  fileName: string;
  onClose: () => void;
}

export default function FileDetails({ fileName, onClose }: Props) {
  const isPdf = fileName.endsWith(".pdf");

  return (
    <aside className="w-[272px] min-w-[272px] bg-[#161b27] border-l border-[#252d3d] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#252d3d]">
        <span className="text-sm font-semibold text-white">File Details</span>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Preview */}
      <div className="flex flex-col items-center px-4 py-5 border-b border-[#252d3d]">
        <div className="w-[90px] h-[110px] rounded-lg bg-white flex items-center justify-center shadow-lg mb-3">
          {isPdf ? (
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect
                    x="3"
                    y="1"
                    width="14"
                    height="18"
                    rx="2"
                    fill="white"
                    stroke="#dc2626"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6 8h10M6 12h10M6 16h6"
                    stroke="#dc2626"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <text x="3" y="19" fontSize="6" fill="#dc2626" fontWeight="bold">
                    PDF
                  </text>
                </svg>
              </div>
              <span className="text-red-600 text-[10px] font-bold">PDF</span>
            </div>
          ) : (
            <div className="text-slate-400 text-xs">Preview</div>
          )}
        </div>
        <p className="text-xs font-semibold text-white text-center break-all leading-snug mb-1">
          {fileName}
        </p>
        <p className="text-xs text-slate-400 mb-3">2.4 MB</p>
        <span className="flex items-center gap-1 text-[11px] bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full px-2.5 py-0.5">
          <Star size={11} className="fill-amber-400" />
          Favorited
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#252d3d]">
        <button className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors">
          Open
        </button>
        <button className="flex-1 py-1.5 rounded-lg bg-[#1e2435] border border-[#2a3347] text-xs text-slate-300 hover:text-white transition-colors">
          Share
        </button>
        <button className="w-8 h-8 rounded-lg bg-[#1e2435] border border-[#2a3347] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <Download size={14} />
        </button>
      </div>

      {/* Properties */}
      <div className="px-4 py-4 border-b border-[#252d3d]">
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">
          Properties
        </p>
        <div className="space-y-2.5">
          {[
            { label: "Type", value: "PDF Document" },
            { label: "Size", value: "2.4 MB" },
            { label: "Created", value: "Oct 20, 2023" },
            { label: "Modified", value: "Oct 26, 2023" },
            { label: "Location", value: "/Projects/Alpha/..." },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start">
              <span className="text-xs text-slate-500">{label}</span>
              <span
                className={`text-xs font-medium text-right max-w-[150px] ${
                  label === "Location" ? "text-indigo-400" : "text-slate-200"
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="px-4 py-4 border-b border-[#252d3d]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Metadata
          </p>
          <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            <Edit3 size={11} />
            Edit
          </button>
        </div>

        <div className="space-y-3">
          {/* Surveyor */}
          <div>
            <p className="text-xs text-slate-500 mb-1">Surveyor</p>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">
                GB
              </div>
              <span className="text-xs text-slate-300">James Bond</span>
            </div>
          </div>

          {/* Coordinates */}
          <div>
            <p className="text-xs text-slate-500 mb-1">Coordinates</p>
            <div className="bg-[#1e2435] border border-[#2a3347] rounded-lg px-2.5 py-1.5">
              <span className="text-xs font-mono text-slate-300">
                34.0522° N, 118.2437° W
              </span>
            </div>
          </div>

          {/* Soil Type */}
          <div>
            <p className="text-xs text-slate-500 mb-1">Soil Type</p>
            <div className="flex gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-[#1e2435] border border-[#2a3347] text-xs text-slate-300">
                Clay
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#1e2435] border border-[#2a3347] text-xs text-slate-300">
                Limestone
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 py-4">
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">
          Recent Activity
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 size={12} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-200 font-medium">
                Approved by Sarah Lee
              </p>
              <p className="text-[10px] text-slate-500">Today, 10:23 AM</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Edit3 size={11} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-200 font-medium">
                Modified by You
              </p>
              <p className="text-[10px] text-slate-500">Yesterday, 4:45 PM</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
