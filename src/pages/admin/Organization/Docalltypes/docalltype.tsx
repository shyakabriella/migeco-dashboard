import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  CloudUpload, 
  Building2, 
  Search, 
  History, 
  Lock, 
  BarChart3, 
  FileCheck, 
  Users, 
  Settings, 
  HelpCircle, 
  ChevronDown, 
  Plus, 
  Bell, 
  Filter, 
  Grid, 
  List,
  Mountain,
  HardHat,
  Wrench,
  Map,
  Image as ImageIcon,
  Beaker,
  ShieldCheck,
  FileText,
  Database
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminSidebar from '../../AdminSidebar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---



const SubmenuItem = ({ label, active = false }: { label: string, active?: boolean }) => (
  <button className={cn(
    "w-full text-left pl-11 pr-4 py-2 text-xs font-medium transition-colors",
    active ? "text-indigo-400" : "text-gray-500 hover:text-white"
  )}>
    {label}
  </button>
);

const DocTypeCard = ({ 
  title, 
  description, 
  icon: Icon, 
  iconBg, 
  filesCount, 
  lastAdded,
  color
}: { 
  title: string, 
  description: string, 
  icon: any, 
  iconBg: string, 
  filesCount: string, 
  lastAdded: string,
  color: string
}) => (
  <div className="bg-[#1a1f2e] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group cursor-pointer">
    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", iconBg)}>
      <Icon size={20} className={color} />
    </div>
    <h3 className="text-white font-semibold mb-1.5">{title}</h3>
    <p className="text-gray-500 text-xs leading-relaxed mb-6 line-clamp-2">
      {description}
    </p>
    <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
      <div className="flex items-center gap-1.5">
        <Files size={12} />
        <span>{filesCount} files</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span>Added {lastAdded}</span>
      </div>
    </div>
  </div>
);

// --- Main App ---

export default function Docalltype() {
  return (
    <div className="flex h-screen w-full bg-[#0b0e14] text-gray-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <AdminSidebar/>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0b0e14]">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 border-b border-white/5 flex items-center justify-between px-8 bg-[#0b0e14]">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">Document Types</h1>
            <div className="h-4 w-px bg-white/10" />
            <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>Organization</span>
              <span className="text-gray-700">/</span>
              <span className="text-gray-300">Document Types</span>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20">
              <Plus size={16} />
              Create New Type
            </button>
            
            <div className="relative">
              <Bell size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#0b0e14]" />
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-white/5">
              <div className="text-right">
                <div className="text-xs font-semibold text-white">Alex Morgan</div>
                <div className="text-[10px] text-gray-500">Lead Geologist</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Hero Stats Card */}
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-8 mb-8 relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2">Defined Document Types</h2>
                <p className="text-gray-400 text-sm">Manage specific document schemas and metadata requirements.</p>
             </div>
             
             <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-12">
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Types</div>
                  <div className="text-5xl font-bold text-white">8</div>
                </div>
                <div className="h-12 w-px bg-white/5" />
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Active Schemas</div>
                  <div className="text-5xl font-bold text-emerald-500">6</div>
                </div>
             </div>

             {/* Background decorative element */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -mr-32 -mt-32" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1 group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search types..."
                  className="w-full bg-[#1a1f2e] border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-[#1a1f2e] border border-white/5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>

            <div className="flex items-center bg-[#1a1f2e] border border-white/5 rounded-lg p-1">
              <button className="p-1.5 bg-[#252b3b] text-white rounded-md shadow-sm">
                <Grid size={16} />
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-300">
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DocTypeCard 
              title="Geological Reports"
              description="Field surveys, core logging data, and stratigraphy analysis reports."
              icon={Mountain}
              iconBg="bg-indigo-500/10"
              color="text-indigo-500"
              filesCount="1,240"
              lastAdded="4h ago"
            />
            <DocTypeCard 
              title="Geotechnical Reports"
              description="Soil mechanics, foundation engineering, and stability assessments."
              icon={HardHat}
              iconBg="bg-orange-500/10"
              color="text-orange-500"
              filesCount="856"
              lastAdded="1d ago"
            />
            <DocTypeCard 
              title="Construction Reports"
              description="Daily site logs, progress tracking, and material usage documentation."
              icon={Wrench}
              iconBg="bg-blue-500/10"
              color="text-blue-500"
              filesCount="3,402"
              lastAdded="2h ago"
            />
            <DocTypeCard 
              title="Maps & Drawings (CAD/PDF)"
              description="Topographical maps, architectural drawings, and utility layouts."
              icon={Map}
              iconBg="bg-emerald-500/10"
              color="text-emerald-500"
              filesCount="5,120"
              lastAdded="5m ago"
            />
            <DocTypeCard 
              title="Site Photos"
              description="Inspection images, drone surveys, and incident documentation."
              icon={ImageIcon}
              iconBg="bg-pink-500/10"
              color="text-pink-500"
              filesCount="15,300"
              lastAdded="12m ago"
            />
            <DocTypeCard 
              title="Lab Results"
              description="Chemical analysis, material strength testing, and sample reports."
              icon={Beaker}
              iconBg="bg-purple-500/10"
              color="text-purple-500"
              filesCount="2,900"
              lastAdded="3d ago"
            />
            <DocTypeCard 
              title="Permits & Compliance"
              description="Government approvals, environmental impact assessments, and safety permits."
              icon={ShieldCheck}
              iconBg="bg-yellow-500/10"
              color="text-yellow-500"
              filesCount="450"
              lastAdded="1w ago"
            />
            <DocTypeCard 
              title="Contracts & Letters"
              description="Legal agreements, subcontractor contracts, and official project correspondence."
              icon={FileText}
              iconBg="bg-cyan-500/10"
              color="text-cyan-500"
              filesCount="890"
              lastAdded="2d ago"
            />

            {/* Create New Placeholder */}
            <div className="col-span-full mt-4">
              <button className="w-full h-40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-white hover:border-white/10 hover:bg-white/5 transition-all group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <span className="font-semibold text-sm">Create New Type</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
