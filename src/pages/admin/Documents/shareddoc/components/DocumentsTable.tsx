import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, FolderPlus, Upload } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  sharedBy: string;
  sharedByInitials: string;
  sharedByColor: string;
  type: string;
  typeDetail?: string;
  tag: string;
  tagColor: string;
  iconColor: string;
  iconBg: string;
  iconLabel: string;
}

const documents: Document[] = [
  {
    id: 1,
    name: 'Geo_Survey_Site_Alpha_Final.pdf',
    sharedBy: 'James Bond',
    sharedByInitials: 'JB',
    sharedByColor: 'from-orange-400 to-orange-600',
    type: 'PDF',
    typeDetail: 'Document',
    tag: 'Site Alpha',
    tagColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/10 border-red-500/20',
    iconLabel: 'PDF',
  },
  {
    id: 2,
    name: 'Q3_Lab_Results_External',
    sharedBy: 'Mr. Klein',
    sharedByInitials: 'MK',
    sharedByColor: 'from-purple-400 to-purple-600',
    type: 'Folder',
    typeDetail: '',
    tag: 'Project Beta',
    tagColor: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10 border-yellow-500/20',
    iconLabel: 'DIR',
  },
  {
    id: 3,
    name: 'Foundation_Draft_Review.dwg',
    sharedBy: 'Alice Taylor',
    sharedByInitials: 'AT',
    sharedByColor: 'from-teal-400 to-teal-600',
    type: 'CAD',
    typeDetail: 'Drawing',
    tag: 'Site Alpha',
    tagColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    iconLabel: 'CAD',
  },
  {
    id: 4,
    name: 'Vendor_Pricing_Update.xlsx',
    sharedBy: 'Mark K.',
    sharedByInitials: 'MK',
    sharedByColor: 'from-green-400 to-green-600',
    type: 'Spreadsheet',
    typeDetail: '',
    tag: 'Procurement',
    tagColor: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10 border-green-500/20',
    iconLabel: 'XLS',
  },
  {
    id: 5,
    name: 'Drone_Survey_Area_51.jpg',
    sharedBy: 'James Bond',
    sharedByInitials: 'JB',
    sharedByColor: 'from-orange-400 to-orange-600',
    type: 'Image',
    typeDetail: '',
    tag: 'Site Alpha',
    tagColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    iconLabel: 'IMG',
  },
  {
    id: 6,
    name: 'Contract_Draft_MIGECO_v2.docx',
    sharedBy: 'Lisa Wong',
    sharedByInitials: 'LW',
    sharedByColor: 'from-pink-400 to-pink-600',
    type: 'Word',
    typeDetail: 'Document',
    tag: 'Legal',
    tagColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    iconLabel: 'DOC',
  },
];

const FileTypeIcon: React.FC<{ doc: Document }> = ({ doc }) => {
  return (
    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${doc.iconBg}`}>
      <span className={`text-[9px] font-bold tracking-wide ${doc.iconColor}`}>{doc.iconLabel}</span>
    </div>
  );
};

interface DocumentsTableProps {
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({ selectedId, setSelectedId }) => {
  const [checkedIds, setCheckedIds] = useState<number[]>([1]);
  const [allChecked, setAllChecked] = useState(false);

  const toggleCheck = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (allChecked) {
      setCheckedIds([]);
    } else {
      setCheckedIds(documents.map((d) => d.id));
    }
    setAllChecked(!allChecked);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Breadcrumb + Actions Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 flex-shrink-0 bg-[#0d1117]/60">
        <nav className="flex items-center gap-1.5 text-sm">
          <span className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Home</span>
          <span className="text-slate-600 text-xs">›</span>
          <span className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Documents</span>
          <span className="text-slate-600 text-xs">›</span>
          <span className="text-slate-200 font-medium">Shared with Me</span>
        </nav>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 text-sm hover:bg-white/5 transition-colors">
            <SlidersHorizontal size={13} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 text-sm hover:bg-white/5 transition-colors">
            <FolderPlus size={13} />
            <span>New Folder</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-600/20">
            <Upload size={13} />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        <div className="rounded-xl border border-white/8 overflow-hidden">
          {/* Table Header */}
          <div className="grid items-center border-b border-white/8 bg-[#111827]/60 px-4 py-2.5"
            style={{ gridTemplateColumns: '36px 1fr 200px 200px' }}>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="w-3.5 h-3.5 rounded cursor-pointer"
                style={{ accentColor: '#3b82f6' }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Name</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Shared By</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Type</span>
          </div>

          {/* Table Rows */}
          {documents.map((doc, idx) => {
            const isSelected = selectedId === doc.id;
            const isChecked = checkedIds.includes(doc.id);

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedId(isSelected ? null : doc.id)}
                className={`grid items-center px-4 py-3.5 border-b border-white/5 last:border-0 cursor-pointer transition-all duration-150 group
                  ${isSelected
                    ? 'bg-blue-600/10 border-blue-500/10'
                    : idx % 2 === 0
                    ? 'bg-[#0f1117]/40 hover:bg-white/3'
                    : 'bg-transparent hover:bg-white/3'
                  }`}
                style={{ gridTemplateColumns: '36px 1fr 200px 200px' }}
              >
                {/* Checkbox */}
                <div
                  className="flex items-center"
                  onClick={(e) => toggleCheck(doc.id, e)}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 rounded cursor-pointer"
                    style={{ accentColor: '#3b82f6' }}
                  />
                </div>

                {/* Name */}
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <FileTypeIcon doc={doc} />
                  <span className={`text-sm font-medium truncate transition-colors
                    ${isSelected ? 'text-blue-300' : 'text-slate-200 group-hover:text-white'}`}>
                    {doc.name}
                  </span>
                </div>

                {/* Shared By */}
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${doc.sharedByColor} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0`}>
                    {doc.sharedByInitials}
                  </div>
                  <span className="text-sm text-slate-400 truncate">{doc.sharedBy}</span>
                </div>

                {/* Type + Badge */}
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-300">{doc.type}</p>
                    {doc.typeDetail && (
                      <p className="text-xs text-slate-600 leading-tight">{doc.typeDetail}</p>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${doc.tagColor}`}>
                    {doc.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 flex-shrink-0 bg-[#0d1117]/40">
        <span className="text-xs text-slate-500">
          Showing 1-6 of 42 shared items
        </span>
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTable;
