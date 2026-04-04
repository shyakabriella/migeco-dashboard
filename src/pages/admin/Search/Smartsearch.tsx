import { Search, LayoutDashboard, FileText, UploadCloud, Building2, ChevronDown, Bell, Settings, User, BarChart3, ShieldCheck, FileClock, History, MapPin, Database } from 'lucide-react';
import { cn } from '../../../utils/cn';
import AdminSidebar from '../AdminSidebar';

const SidebarItem = ({ icon: Icon, label, active = false, hasSubmenu = false }: { icon: any, label: string, active?: boolean, hasSubmenu?: boolean }) => (
  <div className={cn(
    "flex items-center justify-between px-4 py-2.5 cursor-pointer rounded-lg transition-colors text-sm",
    active ? "bg-[#1e2532] text-white" : "text-gray-400 hover:bg-[#1e2532]/50 hover:text-white"
  )}>
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span>{label}</span>
    </div>
    {hasSubmenu && <ChevronDown size={16} />}
  </div>
);

export default function Smartsearch() {
  return (
    <div className="flex min-h-screen bg-[#0b0e14] text-gray-200 font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1">
        <header className="h-16 border-b border-[#1e2532] flex items-center justify-between px-8">
          <h1 className="font-semibold text-lg">Smart Search</h1>
          <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-400" />
            <div className="flex items-center gap-3 pl-4 border-l border-[#1e2532]">
              <div className="text-right">
                <div className="text-sm font-medium">Alex Morgan</div>
                <div className="text-xs text-gray-400">Lead Geologist</div>
              </div>
              <img src="https://ui-avatars.com/api/?name=Alex+Morgan&background=random" className="w-9 h-9 rounded-full" alt="User" />
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="max-w-3xl mx-auto text-center mt-12">
            <h2 className="text-4xl font-bold mb-4">What are you looking for today?</h2>
            <p className="text-gray-400 mb-8">Search across 12,400+ technical documents, logs, and reports.</p>
            
            <div className="relative mb-6">
              <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="Search by keywords, project ID, or document content..."
                className="w-full bg-[#171c26] border border-[#1e2532] rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="flex justify-center gap-3 mb-10 text-xs items-center">
              <span className="text-gray-500">TRENDING SEARCHES:</span>
              {['Soil Density Report', 'Site Alpha Maps', 'Q3 Safety Logs'].map(item => (
                <button key={item} className="bg-[#171c26] hover:bg-[#1e2532] border border-[#1e2532] px-3 py-1.5 rounded-full text-blue-400 transition-colors flex items-center gap-1">
                  <span className="text-blue-500">↗</span> {item}
                </button>
              ))}
            </div>

            <div className="flex justify-center items-center gap-3 text-xs text-gray-500">
              <span className="leading-tight text-[10px]">RECENT<br/>QUERIES:</span>
              <button className="flex items-center gap-2 hover:text-gray-300 bg-[#171c26] px-3 py-2 rounded-full border border-[#1e2532]">
                <History size={14} /> "foundation crack analysis"
              </button>
              <button className="flex items-center gap-2 hover:text-gray-300 bg-[#171c26] px-3 py-2 rounded-full border border-[#1e2532]">
                <History size={14} /> "Gamma project budget"
              </button>
            </div>
          </div>

          <div className="mt-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                ✨ Recommended for You
              </h3>
              <span className="text-xs text-gray-500 bg-[#171c26] px-3 py-1 rounded">Based on your recent geological surveys</span>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { title: 'Geotechnical Analysis 2023', type: 'REPORT', icon: FileText, color: 'text-red-400' },
                { title: 'Sector 4 Topography', type: 'MAP', icon: MapPin, color: 'text-blue-400' },
                { title: 'Q3 Excavation Logs', type: 'DATA', icon: Database, color: 'text-green-400' }
              ].map((item, i) => (
                <div key={i} className="bg-[#171c26] p-5 rounded-xl border border-[#1e2532] hover:border-blue-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <item.icon className={item.color} size={24} />
                    <span className="text-[10px] font-bold tracking-wider text-gray-600">{item.type}</span>
                  </div>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-xs text-gray-400 mb-6">Comprehensive soil composition study for Site Alpha extension with updated moisture conte...</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                       <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">OC</div>
                       <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] border border-[#0b0e14]">+{i * 2 + 1}</div>
                    </div>
                    <span className="text-[10px] text-gray-500">updated 2h ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
