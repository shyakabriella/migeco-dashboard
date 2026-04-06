import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Users, 
  Search, 
  ShieldCheck, 
  Lock, 
  BarChart3, 
  ClipboardList, 
  Settings, 
  HelpCircle,
  Bell,
  ChevronDown,
  Plus,
  Download,
  Eye,
  Copy,
  Trash2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../../../../../../src/utils/cn';
import AdminSidebar from '../../AdminSidebar';
const SidebarItem = ({ icon: Icon, label, active, subItems, isOpen }: { icon: any, label: string, active?: boolean, subItems?: string[], isOpen?: boolean }) => {
  return (
    <div className="mb-1">
      <div className={cn(
        "flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors group",
        active ? "text-indigo-400 bg-indigo-500/10 border-r-2 border-indigo-500" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      )}>
        <div className="flex items-center gap-3">
          <Icon size={18} className={cn(active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200")} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {subItems && <ChevronDown size={14} className={cn("transition-transform", isOpen ? "" : "-rotate-90")} />}
      </div>
      {isOpen && subItems && (
        <div className="mt-1">
          {subItems.map((item, idx) => (
            <div 
              key={idx} 
              className={cn(
                "pl-11 py-2 text-xs cursor-pointer transition-colors",
                item === 'Shared Links' ? "text-indigo-400 font-medium" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: 'Active' | 'Expired' }) => {
  const isActive = status === 'Active';
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
      isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
    )}>
      <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-400" : "bg-rose-400")} />
      {status}
    </div>
  );
};

export default function SharedLinks() {
  const sharedLinks = [
    {
      name: 'Geo_Survey_Site_A.pdf',
      size: '3.4 MB',
      type: 'pdf',
      recipient: 'j.doe@partner-eng.com',
      createdBy: 'Alex Morgan',
      expiryDate: 'Oct 24, 2023',
      expiryNote: 'Expiring in 2 days',
      accessLevel: 'View Only',
      status: 'Active',
      iconColor: 'bg-rose-500/20 text-rose-400'
    },
    {
      name: 'Project_Beta_Assets.zip',
      size: '145 MB',
      type: 'zip',
      recipient: 'audit@gov-reg.org',
      createdBy: 'Sarah Jenkins',
      expiryDate: 'Nov 01, 2023',
      accessLevel: 'Download',
      isPasswordProtected: true,
      status: 'Active',
      iconColor: 'bg-indigo-500/20 text-indigo-400'
    },
    {
      name: 'Contract_Draft_v3.docx',
      size: '45 KB',
      type: 'docx',
      recipient: 'legal@external-firm.com',
      createdBy: 'Mike Ross',
      expiryDate: 'Oct 15, 2023',
      accessLevel: 'View Only',
      status: 'Expired',
      iconColor: 'bg-emerald-500/20 text-emerald-400'
    },
    {
      name: 'Mineral_Analysis_Q3.pdf',
      size: '8.2 MB',
      type: 'pdf',
      recipient: 'investor.relations@fund.com',
      createdBy: 'Alex Morgan',
      expiryDate: 'Dec 12, 2023',
      accessLevel: 'Download',
      isPasswordProtected: true,
      status: 'Active',
      iconColor: 'bg-rose-500/20 text-rose-400'
    }
  ];

  return (
    <div className="flex h-screen bg-[#0a0b14] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0d0e1a]">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Access & Permissions</span>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2 text-slate-500">
              <ExternalLink size={14} />
              <span className="text-xs">Shared Links</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell size={20} className="text-slate-400" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0d0e1a]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold">Alex Morgan</div>
                <div className="text-[10px] text-slate-500">Lead Geologist</div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full border-2 border-slate-700"
                />
                <div className="absolute -bottom-1 -right-1">
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Shared Links Management</h1>
              <p className="text-slate-500 text-sm">Monitor and manage external access to sensitive documents via shared links.</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
              <Plus size={18} />
              Create New Shared Link
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by document, email or reference ID..." 
                className="w-full bg-[#161827] border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button className="bg-[#161827] border border-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors">
              All Statuses
            </button>
            <button className="bg-[#161827] border border-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2">
              All Access Levels
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Table */}
          <div className="bg-[#0d0e1a] border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Document Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recipient Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Created By</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expiry Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Level</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Link Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sharedLinks.map((link, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", link.iconColor)}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-200">{link.name}</div>
                          <div className="text-[11px] text-slate-500">{link.size}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center text-[8px] border border-slate-700">@</span>
                        {link.recipient}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-slate-400">{link.createdBy}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <div className="text-sm text-slate-400">{link.expiryDate}</div>
                        {link.expiryNote && (
                          <div className="text-[10px] text-amber-500 mt-0.5">
                            Expiring <br/> in 2 days
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors",
                          link.accessLevel === 'Download' 
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                            : "bg-slate-800/50 text-slate-300 border-slate-700"
                        )}>
                          {link.accessLevel === 'Download' ? <Download size={14} /> : <Eye size={14} />}
                          {link.accessLevel}
                        </div>
                        {link.isPasswordProtected && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 pl-1">
                            <Lock size={10} />
                            Password protected
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={link.status as any} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-4 text-slate-500">
                        {link.status === 'Expired' ? (
                          <RefreshCw size={16} className="cursor-pointer hover:text-indigo-400 transition-colors" />
                        ) : (
                          <Copy size={16} className="cursor-pointer hover:text-indigo-400 transition-colors" />
                        )}
                        <Settings size={16} className="cursor-pointer hover:text-indigo-400 transition-colors" />
                        <Trash2 size={16} className={cn(
                          "cursor-pointer transition-colors",
                          link.status === 'Expired' ? "text-rose-500/60 hover:text-rose-500" : "hover:text-rose-500"
                        )} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-800 bg-slate-900/10">
              <div className="text-sm text-slate-500">
                Showing <span className="text-slate-200 font-medium">1-4</span> of <span className="text-slate-200 font-medium">8</span> active links
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-slate-800/50 text-slate-500 rounded-md text-xs font-medium cursor-not-allowed">Previous</button>
                <button className="px-4 py-1.5 bg-slate-800/50 text-slate-300 hover:bg-slate-700 rounded-md text-xs font-medium transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
