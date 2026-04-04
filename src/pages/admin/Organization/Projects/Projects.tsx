import React from 'react';
import {
  Grid,
  LayoutDashboard,
  FolderOpen,
  CloudUpload,
  Network,
  Search,
  History,
  Lock,
  BarChart2,
  ClipboardList,
  Users,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  ChevronRight,
  Filter,
  Plus,
  Calendar,
  MapPin,
  ChevronLeft,
  Mountain,
  Building2,
  Puzzle,
  PenTool,
  CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminSidebar from '../../AdminSidebar';

// --- Utility ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data ---
const projects = [
  {
    id: 1,
    title: 'Site Alpha Exploration',
    status: 'Active',
    statusColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    description: 'Geological survey and initial soil testing ph...',
    startDate: 'Jan 12, 2023',
    location: 'Nevada Sector 4',
    progress: 65,
    progressColor: 'bg-purple-500',
    progressBg: 'bg-purple-500/20',
    estimatedCompletion: 'Dec 2023',
    documentCountStr: '1,245',
    icon: Mountain,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    avatars: ['https://i.pravatar.cc/150?u=a', 'https://i.pravatar.cc/150?u=b'],
    extraAvatars: 4,
    buttonText: 'Dashboard',
  },
  {
    id: 2,
    title: 'Project Beta Construction',
    status: 'Active',
    statusColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    description: 'Structural foundation and core infrastructur...',
    startDate: 'Mar 05, 2023',
    location: 'Texas HQ Site',
    progress: 32,
    progressColor: 'bg-blue-500',
    progressBg: 'bg-blue-500/20',
    estimatedCompletion: 'Aug 2024',
    documentCountStr: '856',
    icon: Building2,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    avatars: ['https://i.pravatar.cc/150?u=c', 'https://i.pravatar.cc/150?u=z'],
    extraAvatars: 12,
    buttonText: 'Dashboard',
  },
  {
    id: 3,
    title: 'Gamma Expansion',
    status: 'On Hold',
    statusColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    description: 'Secondary facility expansion and logistics plan...',
    startDate: 'Jun 10, 2023',
    location: 'Utah Facility',
    progress: 15,
    progressColor: 'bg-amber-500',
    progressBg: 'bg-amber-500/20',
    estimatedCompletion: 'Paused pending review',
    documentCountStr: '420',
    icon: Puzzle,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    avatars: ['https://i.pravatar.cc/150?u=d'],
    extraAvatars: 1,
    buttonText: 'Dashboard',
  },
  {
    id: 4,
    title: 'HQ Renovation',
    status: 'Active',
    statusColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    description: 'Interior redesign and sustainable materials i...',
    startDate: 'Sep 01, 2023',
    location: 'Main Campus',
    progress: 45,
    progressColor: 'bg-teal-500',
    progressBg: 'bg-teal-500/20',
    estimatedCompletion: 'Feb 2024',
    documentCountStr: '312',
    icon: PenTool,
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/10',
    avatars: ['https://i.pravatar.cc/150?u=e', 'https://i.pravatar.cc/150?u=f'],
    extraAvatars: 2,
    buttonText: 'Dashboard',
  },
  {
    id: 5,
    title: 'Project Delta (Phase 1)',
    status: 'Completed',
    statusColor: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    description: 'Preliminary environmental impact assessment c...',
    startDate: 'Finished: Dec 20, 2022',
    location: 'Coastline Sector',
    progress: 100,
    progressColor: 'bg-slate-500',
    progressBg: 'bg-slate-500/20',
    estimatedCompletion: 'Archived',
    documentCountStr: '982',
    icon: CheckCircle2,
    iconColor: 'text-slate-400',
    iconBg: 'bg-slate-500/10',
    avatars: ['https://i.pravatar.cc/150?u=g'],
    extraAvatars: 0,
    buttonText: 'Archive View',
  },
];

// --- Components ---


function NavItem({ icon, label, hasChevron, active }: { icon: React.ReactNode, label: string, hasChevron?: boolean, active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg group transition-colors",
      active ? "bg-white/5 text-white" : "hover:bg-white/5 hover:text-white"
    )}>
      <div className="flex items-center gap-3">
        <span className={cn("transition-colors", active ? "text-[#5051F9]" : "text-slate-500 group-hover:text-slate-400")}>
          {icon}
        </span>
        <span className={cn("font-medium", active && "text-white")}>{label}</span>
      </div>
      {hasChevron && <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />}
    </button>
  );
}

function SubNavItem({ label, active, hasChevron }: { label: string, active?: boolean, hasChevron?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
      active ? "bg-[#1a1d27] text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
    )}>
      <span>{label}</span>
      {hasChevron && <ChevronRight size={14} className="text-slate-600" />}
    </button>
  );
}

function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-[#1e2230] bg-[#13151b] shrink-0 text-sm">
      <div className="flex items-center text-slate-400">
        <span>Organization</span>
        <span className="mx-2">/</span>
        <span className="text-white font-medium">Projects</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-72 hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Quick find project..." 
            className="w-full bg-[#0d0f17] border border-[#1e2230] rounded-full pl-9 pr-4 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#5051F9]/50 transition-colors"
          />
        </div>

        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 border border-[#13151b] rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <div className="text-white font-medium text-sm leading-tight">Alex Morgan</div>
            <div className="text-slate-500 text-xs">Lead Geologist</div>
          </div>
          <img 
            src="https://i.pravatar.cc/150?u=x" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-[#2a2e3f] group-hover:border-slate-500 transition-colors"
          />
          <ChevronDown size={16} className="text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
}

function ProjectCard({ project }: { project: typeof projects[0] }) {
  const Icon = project.icon;

  return (
    <div className="group bg-[#161923] border border-[#1e2230] hover:border-[#2a2e3f] rounded-2xl p-5 flex items-center gap-6 transition-all duration-200">
      
      {/* Left Column: Icon & Details */}
      <div className="flex flex-1 items-start gap-4 min-w-0">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-sm", project.iconBg)}>
          <Icon className={project.iconColor} size={24} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className="text-white font-medium text-base truncate group-hover:text-white/90 transition-colors">{project.title}</h3>
            <span className={cn("px-2.5 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wider", project.statusColor)}>
              {project.status}
            </span>
          </div>
          <p className="text-slate-400 text-sm truncate mb-3">{project.description}</p>
          <div className="flex items-center gap-5 text-[13px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="opacity-70" />
              <span>{project.startDate.includes('Finished') ? project.startDate : `Started: ${project.startDate}`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="opacity-70" />
              <span className="truncate">{project.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Column: Progress */}
      <div className="w-56 shrink-0 px-4 flex flex-col justify-center border-l border-white/5 pl-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs font-bold text-white">{project.progress}%</span>
        </div>
        <div className={cn("h-1.5 w-full rounded-full overflow-hidden mb-2", project.progressBg)}>
          <div 
            className={cn("h-full rounded-full transition-all duration-500", project.progressColor)} 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        <div className="text-[11px] text-slate-500 truncate">
          {project.progress === 100 || project.estimatedCompletion.includes('Paused') || project.estimatedCompletion.includes('Archived') 
            ? project.estimatedCompletion 
            : `Estimated completion: ${project.estimatedCompletion}`}
        </div>
      </div>

      {/* Right Column: Stats & Actions */}
      <div className="w-[320px] shrink-0 flex items-center justify-end gap-6 pl-4 border-l border-white/5">
        <div className="text-center w-20 shrink-0">
          <div className="text-white font-bold text-lg leading-none mb-1">{project.documentCountStr}</div>
          <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Documents</div>
        </div>

        <div className="flex items-center justify-center w-24 shrink-0">
          {project.avatars.map((avatar, i) => (
            <img 
              key={i} 
              src={avatar} 
              alt="Avatar" 
              className={cn(
                "w-8 h-8 rounded-full border-2 border-[#161923] shadow-sm",
                i > 0 && "-ml-3"
              )}
            />
          ))}
          {project.extraAvatars > 0 && (
            <div className="-ml-3 w-8 h-8 rounded-full border-2 border-[#161923] bg-[#2a2e3f] flex items-center justify-center text-[10px] font-bold text-white z-10 shadow-sm">
              +{project.extraAvatars}
            </div>
          )}
        </div>

        <button className={cn(
          "w-[120px] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border shadow-sm",
          project.buttonText === 'Archive View' 
            ? "border-[#2a2e3f] text-slate-400 bg-[#1a1d27]/50 hover:bg-[#2a2e3f]/80 hover:text-white"
            : "border-[#2a2e3f] text-slate-300 bg-[#1a1d27] hover:bg-white/5 hover:text-white"
        )}>
          {project.buttonText}
        </button>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2e3f;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a3e52;
        }
      `}} />
      <div className="flex h-screen w-full bg-[#13151b] font-sans overflow-hidden selection:bg-[#5051F9]/30">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
          <Header />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="max-w-[1400px] mx-auto p-8">
              
              {/* Main Content Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1.5 tracking-tight">Active Projects</h1>
                  <p className="text-slate-400 text-sm">Manage and track documentation across 12 active sites.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1d27] border border-[#2a2e3f] rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors shadow-sm">
                    <Filter size={16} className="text-slate-400" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#5051F9] hover:bg-[#4344e6] rounded-lg text-sm font-medium text-white transition-colors shadow-lg shadow-[#5051F9]/25">
                    <Plus size={16} />
                    New Project
                  </button>
                </div>
              </div>

              {/* Project List */}
              <div className="flex flex-col gap-3">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-between pb-4">
                <div className="text-xs text-slate-500 font-medium">
                  Showing 1-5 of 12 active projects
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2e3f] bg-[#161923] text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 shadow-sm">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#5051F9] text-white text-sm font-medium transition-colors shadow-md shadow-[#5051F9]/20">
                    1
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2e3f] bg-[#161923] text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium shadow-sm">
                    2
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2e3f] bg-[#161923] text-slate-400 hover:text-white hover:bg-white/5 transition-colors shadow-sm">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}
