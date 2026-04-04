import { 
  Bell, 
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  AlertTriangle,
  Info,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  FileSpreadsheet,
  FileCode2,
  Clock,
  Command,
  Files,
  UploadCloud,
  Search,
  History,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  Settings,
  HelpCircle,
  Users,
  Building2,
  GitBranch,
  Archive,
  Star,
  Share2,
  UserCircle2,
  Layers
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminSidebar from '../AdminSidebar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const StatCard = ({ icon: Icon, value, label, trend, trendColor = "text-green-400", active = false }: any) => (
  <div className="bg-[#1a1a2e] border border-slate-800/50 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
    <div className="flex justify-between items-start">
      <div className={cn("p-2.5 rounded-lg", active ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500")}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-green-400/10", trendColor)}>
          {trend}
        </span>
      )}
      {active && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active</span>
      )}
    </div>
    <div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="text-xs text-slate-400 font-medium">{label}</div>
    </div>
  </div>
);

const TaskItem = ({ title, desc, date, tag, tagColor = "bg-slate-700", project }: any) => (
  <div className="flex items-start gap-4 p-4 border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors group">
    <div className="mt-1">
      <div className="w-5 h-5 border-2 border-slate-700 rounded-md group-hover:border-blue-500 transition-colors cursor-pointer" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider", tagColor)}>
          {tag}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Clock size={12} />
          {date}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Files size={12} />
          {project}
        </div>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ user, action, target, version, time, icon: Icon, iconBg }: any) => (
  <div className="flex items-start gap-4 p-4 hover:bg-slate-800/20 transition-colors">
    <div className={cn("p-2 rounded-lg mt-1", iconBg)}>
      <Icon size={16} className="text-white" />
    </div>
    <div className="flex-1">
      <div className="text-sm">
        <span className="font-semibold text-slate-200">{user}</span>
        <span className="text-slate-400 mx-1.5">{action}</span>
        <span className="text-blue-400 font-medium hover:underline cursor-pointer">{target}</span>
      </div>
      <p className="text-xs text-slate-500 mt-1">{time}</p>
      {version && (
        <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-2">
          <span className="bg-slate-800 px-1.5 py-0.5 rounded">{version}</span>
        </div>
      )}
    </div>
  </div>
);

const QuickAccessCard = ({ title, type, time, image }: any) => (
  <div className="bg-[#1a1a2e] border border-slate-800/50 rounded-xl overflow-hidden hover:border-slate-600 transition-all group cursor-pointer">
    <div className="aspect-[16/10] bg-slate-900 flex items-center justify-center overflow-hidden relative">
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          {type === 'pdf' && <FileText size={32} className="text-red-500" />}
          {type === 'xls' && <FileSpreadsheet size={32} className="text-green-500" />}
          {type === 'cad' && <FileCode2 size={32} className="text-blue-500" />}
        </div>
      )}
      {type && !image && <div className="absolute top-2 right-2 bg-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{type}</div>}
    </div>
    <div className="p-3">
      <h5 className="text-xs font-semibold text-slate-200 truncate">{title}</h5>
      <p className="text-[10px] text-slate-500 mt-1">Opened {time}</p>
    </div>
  </div>
);

const PinnedProject = ({ initial, color, name, subtitle }: any) => (
  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors group cursor-pointer">
    <div className="flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white", color)}>
        {initial}
      </div>
      <div>
        <h6 className="text-sm font-semibold text-slate-200">{name}</h6>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
    <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400" />
  </div>
);

// --- Main App ---

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#0f0f1b] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      <AdminSidebar />

      {/* Main Content */}
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
          <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
            
            {/* Left Column (Main) */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* Welcome Section */}
              <section className="bg-gradient-to-r from-blue-900/20 to-indigo-900/10 border border-blue-900/30 rounded-2xl p-8 relative overflow-hidden group">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back, Alex</h2>
                  <p className="text-slate-400 mt-2 max-w-xl leading-relaxed">Your dashboard overview for today. Check your pending tasks below.</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />
              </section>

              {/* Stats & Tasks Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <StatCard 
                    icon={Files} 
                    value="14,205" 
                    label="Total Documents" 
                    trend="+12%" 
                  />
                  <StatCard 
                    icon={AlertTriangle} 
                    value="5" 
                    label="Critical Alerts" 
                    active 
                  />
                </div>

                {/* System Info / Maintenance */}
                <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl p-5 flex gap-4">
                  <div className="mt-1">
                    <Info size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-blue-400">System Maintenance</h5>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Scheduled downtime for server upgrades on Saturday, Oct 28th from 02:00 AM to 06:00 AM UTC.
                    </p>
                  </div>
                </div>
              </div>

              {/* My Tasks Section */}
              <section className="bg-[#141426] border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                <div className="px-6 py-4 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <CheckCircle2 size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">My Tasks</h3>
                  </div>
                  <button className="text-xs font-bold text-blue-500 hover:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors">View All</button>
                </div>
                <div className="divide-y divide-slate-800/30">
                  <TaskItem 
                    title="Review Site Alpha Safety Audit" 
                    desc="Detailed review of safety protocols for the northern sector excavation." 
                    date="Due Today" 
                    tag="URGENT" 
                    tagColor="bg-red-500/20 text-red-500"
                    project="Project Alpha"
                  />
                  <TaskItem 
                    title="Approve Q3 Budget Revision" 
                    desc="Finance department requires approval for the revised geological survey budget." 
                    date="Due Tomorrow" 
                    tag="HIGH" 
                    tagColor="bg-amber-500/20 text-amber-500"
                    project="Finance"
                  />
                  <TaskItem 
                    title="Update Metadata for Bulk Upload #44" 
                    desc="Tagging required for the 50 new site photos uploaded yesterday." 
                    date="Oct 28" 
                    tag="NORMAL" 
                    tagColor="bg-slate-500/20 text-slate-400"
                    project="Uploads"
                  />
                </div>
              </section>

              {/* Recent Activity Section */}
              <section className="bg-[#141426] border border-slate-800/50 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/50 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <History size={18} className="text-slate-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity</h3>
                  </div>
                  <button className="text-xs font-semibold text-blue-400 hover:text-blue-300">View Full Log</button>
                </div>
                <div>
                  <ActivityItem 
                    user="Sarah L." 
                    action="edited" 
                    target="Geological_Survey_Report.pdf" 
                    version="v2.4" 
                    time="10 mins ago" 
                    icon={FileText} 
                    iconBg="bg-blue-600/20" 
                  />
                  <ActivityItem 
                    user="You" 
                    action="uploaded 12 files to" 
                    target="Project Beta / Site Photos" 
                    time="2 hours ago" 
                    icon={UploadCloud} 
                    iconBg="bg-green-600/20" 
                  />
                  <ActivityItem 
                    user="Mike R." 
                    action="shared" 
                    target="Q4 Strategy.pptx" 
                    time="4 hours ago" 
                    icon={ExternalLink} 
                    iconBg="bg-purple-600/20" 
                  />
                </div>
              </section>

            </div>

            {/* Right Column (Sidebar Content) */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              
              {/* Quick Access */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Access</h3>
                  <button className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <QuickAccessCard title="Geo Survey Site B..." type="pdf" time="10m ago" />
                  <QuickAccessCard title="Foundation Plan..." type="dwg" time="1h ago" image="/foundation-plan-thumb.jpg" />
                  <QuickAccessCard title="Cost Analysis Q3..." type="xls" time="4h ago" />
                  <div className="bg-[#1a1a2e]/50 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 min-h-[140px] hover:border-slate-700 hover:bg-slate-800/20 transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="text-slate-500" size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Doc</span>
                  </div>
                </div>
              </section>

              {/* Pinned Projects */}
              <section className="bg-[#141426] border border-slate-800/50 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pinned Projects</h3>
                  <button className="text-blue-500 hover:text-blue-400">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="space-y-2">
                  <PinnedProject 
                    initial="A" 
                    color="bg-amber-600" 
                    name="Site Alpha" 
                    subtitle="Geological Survey" 
                  />
                  <PinnedProject 
                    initial="B" 
                    color="bg-purple-600" 
                    name="Project Beta" 
                    subtitle="Infrastructure" 
                  />
                </div>
              </section>

              {/* Team Section Placeholder */}
              <section className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 relative overflow-hidden">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Team Availability</h3>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a14] bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-[#0a0a14] bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                    +3
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">
                  8 members are currently online and active in shared projects.
                </p>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl" />
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
