import { 
  Search, 
  Bell, 
  ChevronDown,
  Command,
  FileText,
  UploadCloud
} from 'lucide-react';
import AdminSidebar from "../AdminSidebar";

const sidebarSections = [
  {
    title: 'Dashboard',
    items: ['Overview', 'My Tasks', 'Recent Activity'],
    active: 'Overview',
  },
  {
    title: 'Documents',
    items: [],
  },
  {
    title: 'Upload & Digitization',
    items: ['Upload', 'Bulk', 'Scan', 'History'],
    active: 'Upload',
  },
  {
    title: 'Organization',
    items: [],
  },
  {
    title: 'Search & Retrieval',
    items: [],
  },
  {
    title: 'Version Control',
    items: [],
  },
  {
    title: 'Access & Permissions',
    items: [],
  },
  {
    title: 'Reports',
    items: [],
  },
  {
    title: 'Audit & Logs',
    items: [],
  },
  {
    title: 'Users Management',
    items: [],
  },
  {
    title: 'Settings',
    items: [],
  },
  {
    title: 'Help & Support',
    items: [],
  },
];

const projects = ['Site Survey Report Phase 1', 'Core Archive Set', 'Geological Mapping'];
const documentTypes = ['Survey', 'Contract', 'Blueprint', 'Compliance'];

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <path d="M20 11a8 8 0 1 0-2.35 5.65" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 19h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-4" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 4.13a3 3 0 0 1 0 5.74" />
    </svg>
  );
}

function IconCog() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3l1.2 2.6 2.85.44-2.02 2.04.48 2.87L12 9.7 9.5 10.95l.48-2.87-2.02-2.04 2.85-.44z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M20 12a8 8 0 0 1-.1 1.2l2.1 1.6-2 3.46-2.48-.9a8 8 0 0 1-2.08 1.2L15 21h-6l-.44-2.44a8 8 0 0 1-2.08-1.2l-2.48.9-2-3.46 2.1-1.6A8 8 0 0 1 4 12c0-.4.03-.8.1-1.2L2 9.2l2-3.46 2.48.9a8 8 0 0 1 2.08-1.2L9 3h6l.44 2.44a8 8 0 0 1 2.08 1.2l2.48-.9 2 3.46-2.1 1.6c.07.4.1.8.1 1.2Z" />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <IconGrid />,
  Documents: <IconFolder />,
  'Upload & Digitization': <IconFile />,
  Organization: <IconUsers />,
  'Search & Retrieval': <IconSearch />,
  'Version Control': <IconRefresh />,
  'Access & Permissions': <IconLock />,
  Reports: <IconChart />,
  'Audit & Logs': <IconFile />,
  'Users Management': <IconUsers />,
  Settings: <IconCog />,
  'Help & Support': <IconHelp />,
};

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.8">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function Upload() {
  return (
    <div className="flex h-screen bg-[#0f0f1b] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      <AdminSidebar/>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#0f0f1b]/80 backdrop-blur-md z-10">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search for documents, projects, or metadata..." 
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="w-full">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Upload Document</h1>
                <p className="mt-1 text-sm text-slate-500">Upload and classify a single record into the system.</p>
              </div>
              <button className="rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:border-slate-700">
                Cancel
              </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
              <div className="space-y-5">
                <div className="rounded-xl border border-dashed border-slate-700 bg-[#141426] p-6">
                  <div className="flex min-h-[330px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/30 px-8 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                      <UploadCloud size={36} />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Drag file here</h2>
                    <p className="mt-3 max-w-[260px] text-sm leading-6 text-slate-500">
                      Drop your file here or click to browse from your device.
                    </p>
                    <button className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
                      Select File
                    </button>
                    <p className="mt-4 text-[11px] uppercase tracking-wider text-slate-600">Max file size: 500MB</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-[#141426] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-blue-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">No file selected</div>
                      <div className="text-xs text-slate-500">Waiting for upload...</div>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/50 bg-[#141426] p-6">
                <div className="mb-6 flex items-center gap-2 border-b border-slate-800/50 pb-4">
                  <FileText size={20} className="text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Metadata Entry</h2>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Document Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900"
                      placeholder="e.g. Site Survey Report Phase 1"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Project Association <span className="text-red-400">*</span>
                      </label>
                      <select className="w-full rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50">
                        <option>Select Project...</option>
                        {projects.map((project) => (
                          <option key={project}>{project}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Document Type <span className="text-red-400">*</span>
                      </label>
                      <select className="w-full rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50">
                        <option>Select Type...</option>
                        {documentTypes.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">Tags</label>
                    <div className="rounded-lg border border-slate-800/50 bg-slate-900/50 px-3 py-2.5 focus-within:border-blue-500/50">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-md bg-blue-500/20 px-2.5 py-1 text-xs text-blue-400">confidential ×</span>
                      </div>
                      <input
                        className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
                        placeholder="Type tag and press Enter..."
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-600">Use tags for easier retrieval later.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">Description / Remarks</label>
                    <textarea
                      rows={5}
                      className="w-full resize-none rounded-lg border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900"
                      placeholder="Enter any additional notes about this document..."
                    />
                  </div>

                  <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-600" />
                        Run OCR
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-600" />
                        Virus Scan
                      </label>
                    </div>

                    <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
                      <UploadCloud size={18} />
                      Upload Document
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
