import { 
  Search, 
  Bell, 
  ChevronDown,
  Command,
  Filter,
  FolderPlus,
  UploadCloud,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  Folder,
  Eye
} from 'lucide-react';
import AdminSidebar from "../../AdminSidebar";
import { Link } from 'react-router-dom';

type FileItem = {
  name: string;
  type: string;
  project: string;
  projectTone: "blue" | "orange" | "teal" | "purple";
  modified: string;
  author: string;
  fileKind: "pdf" | "image" | "sheet" | "doc" | "folder";
};

const documents: FileItem[] = [
  {
    name: "Geo_Survey_Site_Alpha_Final.pdf",
    type: "PDF Document",
    project: "Site Alpha",
    projectTone: "blue",
    modified: "Oct 26, 2023 14:30",
    author: "Alex Morgan",
    fileKind: "pdf",
  },
  {
    name: "Site_Inspection_North_Wall.jpg",
    type: "Image",
    project: "Site Alpha",
    projectTone: "blue",
    modified: "Oct 23, 2023 14:10",
    author: "Alex Morgan",
    fileKind: "image",
  },
  {
    name: "Q3_Budget_Draft_v1.xlsx",
    type: "Spreadsheet",
    project: "Finance",
    projectTone: "orange",
    modified: "Oct 20, 2023 11:15",
    author: "Alex Morgan",
    fileKind: "sheet",
  },
  {
    name: "Geological_Report_Preliminary.docx",
    type: "Word Document",
    project: "Research",
    projectTone: "teal",
    modified: "Oct 18, 2023 09:30",
    author: "Alex Morgan",
    fileKind: "doc",
  },
  {
    name: "Field_Notes_Oct_2023",
    type: "Folder",
    project: "Site Alpha",
    projectTone: "blue",
    modified: "Oct 15, 2023 16:20",
    author: "Alex Morgan",
    fileKind: "folder",
  },
  {
    name: "Equipment_List_Calibration.pdf",
    type: "PDF Document",
    project: "Operations",
    projectTone: "purple",
    modified: "Oct 12, 2023 13:45",
    author: "Alex Morgan",
    fileKind: "pdf",
  },
];

const navigation = [
  "Dashboard",
  "Documents",
  "Upload & Digitization",
  "Organization",
  "Search & Retrieval",
  "Version Control",
  "Access & Permissions",
  "Reports",
  "Audit & Logs",
  "Users Management",
  "Settings",
  "Help & Support",
];

const documentSubmenu = ["All Documents", "My Documents", "Shared with Me", "Favorites", "Recent", "Archive"];

const projectToneClass: Record<FileItem["projectTone"], string> = {
  blue: "bg-blue-500/20 text-blue-400",
  orange: "bg-amber-500/20 text-amber-400",
  teal: "bg-teal-500/20 text-teal-400",
  purple: "bg-purple-500/20 text-purple-400",
};

function FileTypeIcon({ kind }: { kind: FileItem["fileKind"] }) {
  const iconMap: Record<FileItem["fileKind"], any> = {
    pdf: { Icon: FileText, color: "text-red-500" },
    image: { Icon: ImageIcon, color: "text-fuchsia-500" },
    sheet: { Icon: FileSpreadsheet, color: "text-green-500" },
    doc: { Icon: FileCode, color: "text-blue-500" },
    folder: { Icon: Folder, color: "text-amber-400" },
  };

  const { Icon, color } = iconMap[kind];
  return <Icon size={18} className={color} />;
}

export default function Mydocs() {
  return (
    <div className="flex h-screen bg-[#0f0f1b] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#0f0f1b]/80 backdrop-blur-md z-10">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search my documents..." 
                className="w-full bg-slate-900/50 border border-slate-800/50 rounded-lg py-2 pl-10 pr-12 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                <Command size={10} />
                <span>K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f0f1b]" />
            </button>
            
            <div className="h-8 w-px bg-slate-800" />

            <div className="flex items-center gap-3 pl-2 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200 leading-none">Alex Morgan</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-medium">Lead Geologist</p>
              </div>
              <div className="relative">
                <img src="/avatar-alex.jpg" alt="Alex Morgan" className="w-9 h-9 rounded-full object-cover border-2 border-slate-800 group-hover:border-slate-600 transition-colors" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f1b]" />
              </div>
              <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300" />
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="border-b border-slate-800/50 bg-slate-900/20 px-8 py-2 text-[11px] text-slate-400">
          <span>Home</span>
          <span className="mx-2">&gt;</span>
          <span>Documents</span>
          <span className="mx-2">&gt;</span>
          <span className="font-semibold text-slate-200">My Documents</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            <section>
              <div className="mb-4 flex items-center justify-end gap-2">
                <button className="rounded-lg border border-slate-800/50 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800 hover:border-slate-700 flex items-center gap-2">
                  <Filter size={14} />
                  Filter
                </button>
                <button className="rounded-lg border border-slate-800/50 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800 hover:border-slate-700 flex items-center gap-2">
                  <FolderPlus size={14} />
                  New Folder
                </button>
                <Link to="/upload&digitization/upload" className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-500 flex items-center gap-2">
                  <UploadCloud size={14} />
                  Upload
                </Link>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800/50 bg-[#141426]">
                <table className="w-full border-collapse text-left text-[12px]">
                  <thead className="bg-slate-900/30 text-[10px] uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="w-10 px-4 py-3">
                        <div className="h-3.5 w-3.5 rounded-sm border border-slate-700" />
                      </th>
                      <th className="px-2 py-3">Name</th>
                      <th className="px-2 py-3">Type</th>
                      <th className="px-2 py-3">Project</th>
                      <th className="px-2 py-3">Date Modified</th>
                      <th className="px-2 py-3">Author</th>
                      <th className="w-18 px-2 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((item) => (
                      <tr key={item.name} className="border-t border-slate-800/40 hover:bg-slate-800/20 transition-colors text-slate-200">
                        <td className="px-4 py-4">
                          <div className="h-3.5 w-3.5 rounded-sm border border-slate-700 hover:border-blue-500 cursor-pointer transition-colors" />
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex items-center gap-2.5">
                            <FileTypeIcon kind={item.fileKind} />
                            <span className="text-[12px] text-slate-200">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-slate-400">{item.type}</td>
                        <td className="px-2 py-4">
                          <span className={`rounded px-2 py-1 text-[10px] font-bold ${projectToneClass[item.projectTone]}`}>{item.project}</span>
                        </td>
                        <td className="px-2 py-4 text-slate-400">{item.modified}</td>
                        <td className="px-2 py-4 text-slate-300">{item.author}</td>
                        <td className="px-2 py-4 text-slate-400">
                          <button className="transition hover:text-slate-200 p-1 hover:bg-slate-800 rounded">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between px-1 text-[10px] text-slate-500">
                <p>Showing 1-6 of 342 personal items</p>
                <div className="space-x-2">
                  <button className="rounded-lg border border-slate-800/50 px-3 py-1.5 hover:bg-slate-800 transition-colors">Previous</button>
                  <button className="rounded-lg border border-slate-800/50 bg-slate-900/50 px-3 py-1.5 text-slate-300 hover:bg-slate-800 transition-colors">Next</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
