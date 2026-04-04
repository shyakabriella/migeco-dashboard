import { UploadCloud, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from './utils';

export const BulkUploadHeader = () => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl font-bold text-white">Bulk Upload</h1>
      <p className="text-sm text-gray-500">Manage and tag large batches of project files.</p>
    </div>
    <div className="flex gap-3">
      <button className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
      <button className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2">
        <UploadCloud size={18} /> Start Upload
      </button>
    </div>
  </div>
);

export const Dropzone = () => (
  <div className="border-2 border-dashed border-gray-800 rounded-2xl bg-[#0a0c14]/30 py-16 flex flex-col items-center justify-center mb-8 relative group hover:border-indigo-600/50 transition-all">
    <div className="w-16 h-16 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-4 text-indigo-500 group-hover:scale-110 transition-transform">
      <UploadCloud size={32} />
    </div>
    <h3 className="text-xl font-semibold text-white mb-1">Drag & Drop files here</h3>
    <p className="text-sm text-gray-500">or <span className="text-indigo-400 cursor-pointer hover:underline">browse files</span> from your computer</p>
    <p className="text-[11px] text-gray-600 mt-6">Supports JPG, PNG, PDF, DWG (Max 500MB per batch)</p>
  </div>
);

export const ImageCard = ({ id, status, image }: { id: string, status: 'ready' | 'scanned', image: string }) => (
  <div className="bg-[#151926] border border-gray-800 rounded-xl overflow-hidden group hover:border-indigo-500 transition-all">
    <div className="relative aspect-video">
      <img src={image} alt={`Upload ${id}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-2 left-2">
        <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center border border-indigo-400 shadow-lg">
          <CheckCircle2 size={12} className="text-white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
    </div>
    
    <div className="p-3">
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="text-[11px] font-medium text-white truncate w-32">IMG_2023102_{id}.jpg</p>
          <p className="text-[10px] text-gray-500">2.4 MB</p>
        </div>
        <CheckCircle2 size={14} className="text-green-500" />
      </div>
      
      <div className="flex gap-2 mt-3">
        <div className="flex-1 bg-indigo-900/10 border border-indigo-900/30 rounded px-2 py-1 flex flex-col items-center justify-center">
          <span className="text-[8px] text-indigo-400 font-bold uppercase">OCR</span>
          <span className="text-[9px] text-indigo-300">Ready</span>
        </div>
        <div className="flex-1 bg-green-900/10 border border-green-900/30 rounded px-2 py-1 flex flex-col items-center justify-center">
          <span className="text-[9px] text-green-400 font-medium">Scanned</span>
        </div>
      </div>
    </div>
  </div>
);
