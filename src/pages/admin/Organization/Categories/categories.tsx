import { 
  LayoutDashboard, 
  Folder, 
  CloudUpload, 
  Network, 
  Search, 
  History, 
  Lock, 
  BarChart2, 
  FileText, 
  Users, 
  Settings,
  HelpCircle,
  PlusSquare,
  Bell,
  List,
  Gavel,
  FlaskConical,
  Camera,
  MessageSquare,
  Shield,
  Plus,
  Database,
  ChevronDown,
  LayoutGrid,
  Settings2
} from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';



const SubMenuItem = ({ label, active = false }: any) => {
  return (
    <div className={`py-2 text-[13px] cursor-pointer mx-3 rounded-lg ${active ? 'text-white bg-[#181d29] pl-[46px] pr-4' : 'text-[#8b949e] pl-[46px] pr-4 hover:text-white hover:bg-[#181d29]/50'}`}>
      {label}
    </div>
  );
};

export default function Categories() {
  return (
    <div className="flex h-screen w-screen bg-[#0a0c14] text-gray-200 font-sans overflow-hidden selection:bg-[#5848e0] selection:text-white">
      {/* Sidebar */}
      <AdminSidebar/>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-[#1e2333] flex items-center justify-between px-8 bg-[#0a0c14] flex-shrink-0">
          <div className="flex items-center text-[13px]">
            <h1 className="text-white font-semibold text-[15px] mr-5 tracking-wide">Categories</h1>
            <span className="text-[#3b4358] mr-5">|</span>
            <span className="text-[#8b949e]">Organization</span>
            <span className="text-[#3b4358] mx-2 text-xs">&gt;</span>
            <span className="text-[#8b949e]">Categories</span>
          </div>

          <div className="flex items-center gap-7">
            <button className="bg-[#5848e0] hover:bg-[#6859e8] text-white px-4 py-2.5 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-colors">
              <PlusSquare size={16} />
              Create New Category
            </button>
            
            <button className="relative text-[#8b949e] hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute -top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0a0c14]"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-[#1e2333] cursor-pointer">
              <div className="text-right">
                <p className="text-white text-[13px] font-semibold leading-tight tracking-wide">Alex Morgan</p>
                <p className="text-[#8b949e] text-[11px] font-medium mt-0.5">Lead Geologist</p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
                alt="Alex Morgan" 
                className="w-8 h-8 rounded-full border border-[#1e2333] object-cover"
              />
              <ChevronDown size={14} className="text-[#8b949e] ml-1" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-[#181d29] p-5 rounded-xl border border-[#262d3d] flex items-center justify-between">
              <div>
                <p className="text-[#8b949e] text-[10px] font-bold uppercase tracking-wider mb-1">Total Categories</p>
                <p className="text-white text-[28px] font-bold tracking-tight">12</p>
              </div>
              <div className="w-[42px] h-[42px] rounded-lg bg-[#4A85F6]/10 flex items-center justify-center border border-[#4A85F6]/20">
                <Folder size={20} className="text-[#4A85F6]" />
              </div>
            </div>
            
            <div className="bg-[#181d29] p-5 rounded-xl border border-[#262d3d] flex items-center justify-between">
              <div>
                <p className="text-[#8b949e] text-[10px] font-bold uppercase tracking-wider mb-1">Total Documents</p>
                <p className="text-white text-[28px] font-bold tracking-tight">24,593</p>
              </div>
              <div className="w-[42px] h-[42px] rounded-lg bg-[#34D399]/10 flex items-center justify-center border border-[#34D399]/20">
                <FileText size={20} className="text-[#34D399]" />
              </div>
            </div>

            <div className="bg-[#181d29] p-5 rounded-xl border border-[#262d3d] flex items-center justify-between">
              <div>
                <p className="text-[#8b949e] text-[10px] font-bold uppercase tracking-wider mb-1">Storage Used</p>
                <p className="text-white text-[28px] font-bold tracking-tight">3.9 TB</p>
              </div>
              <div className="w-[42px] h-[42px] rounded-lg bg-[#A78BFA]/10 flex items-center justify-center border border-[#A78BFA]/20">
                <Database size={20} className="text-[#A78BFA]" />
              </div>
            </div>
          </div>

          {/* Primary Categories Section */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-white text-[17px] font-semibold tracking-wide">Primary Categories</h2>
            <div className="flex bg-[#181d29] rounded-lg p-1 border border-[#262d3d]">
              <button className="p-1.5 bg-[#252b3d] text-white rounded-md shadow-sm border border-[#3b4358]">
                <LayoutGrid size={15} />
              </button>
              <button className="p-1.5 text-[#8b949e] hover:text-white rounded-md transition-colors">
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-4 gap-6">
            {/* Field Surveys */}
            <div className="bg-[#181d29] rounded-xl border border-[#262d3d] p-6 flex flex-col hover:border-[#3b4358] transition-colors cursor-pointer group col-span-1">
              <div className="w-[42px] h-[42px] rounded-lg bg-[#4A85F6]/10 flex items-center justify-center border border-[#4A85F6]/20 mb-5">
                <Folder size={20} className="text-[#4A85F6]" fill="currentColor" fillOpacity={0.2} />
              </div>
              <h3 className="text-white font-semibold text-[15px] tracking-wide mb-2.5">Field Surveys</h3>
              <p className="text-[#8b949e] text-[13px] leading-relaxed mb-6 flex-1 line-clamp-2 pr-2">
                Site measurements, geological scans, and preliminary field...
              </p>
              <div className="flex items-center justify-between text-[#8b949e] text-[11px] pt-5 border-t border-[#262d3d] font-medium">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>4,285 files</span>
                </div>
                <span>Updated 2h ago</span>
              </div>
            </div>

            {/* Legal Compliance */}
            <div className="bg-[#181d29] rounded-xl border border-[#262d3d] p-6 flex flex-col hover:border-[#3b4358] transition-colors cursor-pointer group col-span-1">
              <div className="w-[42px] h-[42px] rounded-lg bg-[#FBBF24]/10 flex items-center justify-center border border-[#FBBF24]/20 mb-5">
                <Gavel size={20} className="text-[#FBBF24]" />
              </div>
              <h3 className="text-white font-semibold text-[15px] tracking-wide mb-2.5">Legal Compliance</h3>
              <p className="text-[#8b949e] text-[13px] leading-relaxed mb-6 flex-1 line-clamp-2 pr-2">
                Regulatory permits, environmental assessments,...
              </p>
              <div className="flex items-center justify-between text-[#8b949e] text-[11px] pt-5 border-t border-[#262d3d] font-medium">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>1,850 files</span>
                </div>
                <span>Updated 1d ago</span>
              </div>
            </div>

            {/* Engineering Specs */}
            <div className="bg-[#181d29] rounded-xl border border-[#262d3d] p-6 flex flex-col hover:border-[#3b4358] transition-colors cursor-pointer group col-span-1">
              <div className="w-[42px] h-[42px] rounded-lg bg-[#34D399]/10 flex items-center justify-center border border-[#34D399]/20 mb-5">
                <Settings2 size={20} className="text-[#34D399]" />
              </div>
              <h3 className="text-white font-semibold text-[15px] tracking-wide mb-2.5">Engineering Specs</h3>
              <p className="text-[#8b949e] text-[13px] leading-relaxed mb-6 flex-1 line-clamp-2 pr-2">
                Structural blueprints, material specifications, and technical...
              </p>
              <div className="flex items-center justify-between text-[#8b949e] text-[11px] pt-5 border-t border-[#262d3d] font-medium">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>8,340 files</span>
                </div>
                <span>Updated 5h ago</span>
              </div>
            </div>

            {/* Lab Reports */}
            <div className="bg-[#181d29] rounded-xl border border-[#262d3d] p-6 flex flex-col hover:border-[#3b4358] transition-colors cursor-pointer group col-span-1">
              <div className="w-[42px] h-[42px] rounded-lg bg-[#D946EF]/10 flex items-center justify-center border border-[#D946EF]/20 mb-5">
                <FlaskConical size={20} className="text-[#D946EF]" />
              </div>
              <h3 className="text-white font-semibold text-[15px] tracking-wide mb-2.5">Lab Reports</h3>
              <p className="text-[#8b949e] text-[13px] leading-relaxed mb-6 flex-1 line-clamp-2 pr-2">
                Soil composition analysis, water quality tests, and...
              </p>
              <div className="flex items-center justify-between text-[#8b949e] text-[11px] pt-5 border-t border-[#262d3d] font-medium">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>3,100 files</span>
                </div>
                <span>Updated 3d ago</span>
              </div>
            </div>

            {/* Site Multimedia */}
            <div className="bg-[#181d29] rounded-xl border border-[#262d3d] p-6 flex flex-col hover:border-[#3b4358] transition-colors cursor-pointer group col-span-1">
              <div className="w-[42px] h-[42px] rounded-lg bg-[#F43F5E]/10 flex items-center justify-center border border-[#F43F5E]/20 mb-5">
                <Camera size={20} className="text-[#F43F5E]" />
              </div>
              <h3 className="text-white font-semibold text-[15px] tracking-wide mb-2.5">Site Multimedia</h3>
              <p className="text-[#8b949e] text-[13px] leading-relaxed mb-6 flex-1 line-clamp-2 pr-2">
                Drone footage, site progression photos, and thermal imaging...
              </p>
              <div className="flex items-center justify-between text-[#8b949e] text-[11px] pt-5 border-t border-[#262d3d] font-medium">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>12,500 files</span>
                </div>
                <span>Updated 12m ago</span>
              </div>
            </div>

            {/* Client Communications - SPANS 2 COLUMNS */}
            <div className="bg-[#181d29] rounded-xl border border-[#262d3d] p-6 flex flex-col hover:border-[#3b4358] transition-colors cursor-pointer group col-span-2">
              <div className="w-[42px] h-[42px] rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center border border-[#0EA5E9]/20 mb-5">
                <MessageSquare size={20} className="text-[#0EA5E9]" />
              </div>
              <h3 className="text-white font-semibold text-[15px] tracking-wide mb-2.5">Client Communications</h3>
              <p className="text-[#8b949e] text-[13px] leading-relaxed mb-6 flex-1 line-clamp-2 w-2/3 pr-2">
                Official correspondence, meeting minutes, and project...
              </p>
              <div className="flex items-center justify-between text-[#8b949e] text-[11px] pt-5 border-t border-[#262d3d] font-medium">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>945 files</span>
                </div>
                <span>Updated 1w ago</span>
              </div>
            </div>

            {/* Safety Protocols */}
            <div className="bg-[#181d29] rounded-xl border border-[#262d3d] p-6 flex flex-col hover:border-[#3b4358] transition-colors cursor-pointer group col-span-1">
              <div className="w-[42px] h-[42px] rounded-lg bg-[#F97316]/10 flex items-center justify-center border border-[#F97316]/20 mb-5">
                <Shield size={20} className="text-[#F97316]" />
              </div>
              <h3 className="text-white font-semibold text-[15px] tracking-wide mb-2.5">Safety Protocols</h3>
              <p className="text-[#8b949e] text-[13px] leading-relaxed mb-6 flex-1 line-clamp-2 pr-2">
                HSE guidelines, incident reports, and safety training...
              </p>
              <div className="flex items-center justify-between text-[#8b949e] text-[11px] pt-5 border-t border-[#262d3d] font-medium">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>420 files</span>
                </div>
                <span>Updated 2d ago</span>
              </div>
            </div>

            {/* Create Category Action Area */}
            <div className="col-span-4 mt-2">
              <button className="w-full bg-[#0a0c14] border-[1.5px] border-dashed border-[#262d3d] rounded-xl py-12 flex flex-col items-center justify-center gap-4 hover:border-[#3b4358] hover:bg-[#11141e] transition-all group">
                <span className="text-[#8b949e] font-medium tracking-wide group-hover:text-white transition-colors">Create Category</span>
                <div className="w-[42px] h-[42px] rounded-full bg-[#181d29] flex items-center justify-center group-hover:bg-[#252b3d] border border-[#262d3d] group-hover:border-[#3b4358] transition-all">
                  <Plus size={20} className="text-[#8b949e] group-hover:text-white" />
                </div>
              </button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}