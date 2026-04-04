type Props = {
  fileName: string;
  onClose: () => void;
};

export default function DeletedFileDetails({ fileName, onClose }: Props) {
  return (
    <div className="w-[270px] flex-shrink-0 bg-[#0d1117] border-l border-[#1e2330] flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1e2330]">
        <span className="text-sm font-semibold text-white">Deleted File Details</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#1e2330] text-[#8b9bb4] hover:text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* File preview card */}
        <div className="bg-[#131720] border border-[#1e2330] rounded-xl p-4 flex flex-col items-center gap-3">
          {/* PDF icon big */}
          <div className="w-16 h-20 bg-[#3d1515] border border-[#e0525233] rounded-lg flex flex-col items-center justify-center gap-1">
            <svg className="w-8 h-8 text-[#e05252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[9px] font-bold text-[#e05252]">PDF</span>
          </div>
          <div className="text-center">
            <p className="text-white text-xs font-semibold leading-tight">{fileName}</p>
            <p className="text-[#e8a43d] text-[10px] mt-1">Scheduled for purge in 28 days</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full mt-1">
            <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#0d2d1a] border border-[#1a5c35] hover:bg-[#163d25] rounded-md py-1.5 text-xs text-[#3dba6f] font-medium transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restore
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#2d0f0f] border border-[#5c1a1a] hover:bg-[#3d1515] rounded-md py-1.5 text-xs text-[#e05252] font-medium transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Purge
            </button>
          </div>
        </div>

        {/* Original Properties */}
        <div>
          <p className="text-[10px] font-semibold text-[#8b9bb4] uppercase tracking-widest mb-2.5">Original Properties</p>
          <div className="space-y-2">
            <PropertyRow label="Type" value="PDF Document" />
            <PropertyRow label="Size" value="4.1 MB" />
            <PropertyRow label="Originally Created" value="Aug 12, 2023" />
            <PropertyRow label="Last Location" value="/Projects/Alpha/..." />
          </div>
        </div>

        {/* Deletion Metadata */}
        <div>
          <p className="text-[10px] font-semibold text-[#8b9bb4] uppercase tracking-widest mb-2.5">Deletion Metadata</p>
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-xs text-[#8b9bb4]">Deleted By</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#4f8ef7] to-[#3b5bdb] flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                AM
              </div>
              <span className="text-xs text-white font-medium">Alex Morgan</span>
            </div>
            <div className="mt-1">
              <span className="text-xs text-[#8b9bb4] block mb-1.5">Deletion Reason</span>
              <div className="bg-[#131720] border border-[#1e2330] rounded-md px-3 py-2 text-xs text-[#c8d3e8] italic">
                "Replaced by FinalLv2.pdf"
              </div>
            </div>
          </div>
        </div>

        {/* Info notice */}
        <div className="bg-[#1a1507] border border-[#3d2e08] rounded-lg p-3 flex gap-2">
          <svg className="w-4 h-4 text-[#e8b84b] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
          </svg>
          <p className="text-[10px] text-[#c8b87a] leading-relaxed">
            Restoring this file will place it back into{" "}
            <span className="text-[#e8c97a] font-medium">/Projects/Alpha/Survey</span>. If the folder no longer exists, it will be placed in your root directory.
          </p>
        </div>
      </div>
    </div>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-[#8b9bb4]">{label}</span>
      <span className="text-xs text-white font-medium text-right">{value}</span>
    </div>
  );
}
