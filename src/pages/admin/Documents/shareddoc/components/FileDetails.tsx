import React from 'react';
import { X, Download, Edit2, Share2, ExternalLink } from 'lucide-react';

interface FileDetailsProps {
  onClose: () => void;
}

const FileDetails: React.FC<FileDetailsProps> = ({ onClose }) => {
  return (
    <div className="w-[272px] min-w-[272px] h-full bg-[#0b0f16] border-l border-white/5 flex flex-col overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 flex-shrink-0">
        <span className="text-sm font-semibold text-white tracking-wide">File Details</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-200"
        >
          <X size={14} />
        </button>
      </div>

      {/* File Preview */}
      <div className="flex flex-col items-center px-4 py-5 border-b border-white/5">
        <div className="w-[80px] h-[80px] rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-3 shadow-xl">
          {/* PDF-like icon */}
          <div className="w-12 h-14 rounded-lg bg-gradient-to-b from-[#1e2a3a] to-[#162030] border border-white/10 flex flex-col items-center justify-center gap-1 relative overflow-hidden">
            {/* Corner fold */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500/30 border-l border-b border-white/10" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
            <span className="text-red-400 font-bold text-[10px] tracking-widest">PDF</span>
            <div className="space-y-0.5 px-2 w-full">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-0.5 rounded-full bg-red-400/30 ${i === 2 ? 'w-1/2' : 'w-full'}`} />
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs font-semibold text-white text-center leading-snug px-2 break-all">
          Geo_Survey_Site_Alpha_Final.pdf
        </p>
        <p className="text-xs text-slate-500 mt-1 font-medium">2.4 MB</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <button className="flex-1 py-1.5 rounded-lg bg-white/6 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors border border-white/8 flex items-center justify-center gap-1">
          <ExternalLink size={12} />
          Open
        </button>
        <button className="flex-1 py-1.5 rounded-lg bg-white/6 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors border border-white/8 flex items-center justify-center gap-1">
          <Share2 size={12} />
          Share
        </button>
        <button className="w-9 h-[30px] flex items-center justify-center rounded-lg bg-white/6 text-slate-400 hover:bg-white/10 transition-colors border border-white/8 flex-shrink-0">
          <Download size={13} />
        </button>
      </div>

      {/* Properties */}
      <div className="px-4 py-4 border-b border-white/5">
        <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em] mb-3">Properties</h4>
        <div className="space-y-2.5">
          {[
            { label: 'Type', value: 'PDF Document', isNode: false },
            { label: 'Size', value: '2.4 MB', isNode: false },
            { label: 'Shared', value: '3 Oct 26, 2023', isNode: false },
            { label: 'Modified', value: '3 Oct 26, 2023', isNode: false },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-600">{label}</span>
              <span className="text-xs text-slate-300 font-medium text-right">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-600">Owner</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
                J
              </div>
              <span className="text-xs text-slate-300 font-medium">James Bond</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em]">Metadata</h4>
          <button className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium">
            <Edit2 size={10} />
            Edit
          </button>
        </div>
        <div className="space-y-3.5">
          {/* Surveyor */}
          <div>
            <p className="text-[11px] text-slate-600 mb-1.5 font-medium">Surveyor</p>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
                J
              </div>
              <span className="text-xs text-slate-300 font-medium">James Bond</span>
            </div>
          </div>

          {/* Coordinates */}
          <div>
            <p className="text-[11px] text-slate-600 mb-1.5 font-medium">Coordinates</p>
            <div className="bg-white/4 rounded-lg px-3 py-2 border border-white/6">
              <p className="text-xs text-slate-300 font-mono tracking-tight">34.0522° N, 118.2437° W</p>
            </div>
          </div>

          {/* Soil Type */}
          <div>
            <p className="text-[11px] text-slate-600 mb-1.5 font-medium">Soil Type</p>
            <div className="flex gap-2 flex-wrap">
              {['Clay', 'Limestone'].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-white/8"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share History */}
      <div className="px-4 py-4">
        <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em] mb-3">Share History</h4>
        <div className="space-y-3.5">
          {/* Entry 1 */}
          <div className="flex items-start gap-2.5">
            <div className="relative flex-shrink-0 mt-0.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-[9px] font-bold text-white shadow-md">
                JB
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0b0f16] flex items-center justify-center">
                <Share2 size={6} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 leading-snug">
                Shared by <span className="font-semibold text-white">James Bond</span>
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">Oct 26, 2023, 10:23 AM</p>
            </div>
          </div>

          {/* Entry 2 */}
          <div className="flex items-start gap-2.5">
            <div className="relative flex-shrink-0 mt-0.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white shadow-md">
                AM
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#0b0f16] flex items-center justify-center">
                <ExternalLink size={6} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 leading-snug">
                Opened by <span className="font-semibold text-white">You</span>
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">Yesterday, 4:45 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetails;
