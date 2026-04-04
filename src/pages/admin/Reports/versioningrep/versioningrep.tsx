import { 
  FileText, 
  RotateCcw, 
  Layers, 
  HardDrive, 
  SlidersHorizontal, 
  Download 
} from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';
import Header from './components/Header';
import KPICard from './components/KPICard';
import TopDocuments from './components/TopDocuments';
import RevisionTypes from './components/RevisionTypes';
import RecentRestoration from './components/RecentRestoration';

function VersioningRep() {
  return (
    <div className="flex h-screen bg-[#0B0C1A] text-slate-200 overflow-hidden font-sans">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          {/* Dashboard Title & Actions */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Versioning Analysis</h1>
              <p className="text-slate-500 text-sm max-w-2xl font-medium">
                Detailed breakdown of document revisions, restorations, and lifecycle trends.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-[#15162B] hover:bg-[#1E203B] border border-[#1E203B] rounded-xl text-xs font-bold text-slate-300 transition-all active:scale-95">
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              label="Avg Versions per File"
              value="3.4"
              trend="+0.2"
              trendLabel="vs last quarter"
              trendUp={true}
              icon={FileText}
              iconColor="text-indigo-400"
              iconBgColor="bg-indigo-500/10"
            />
            <KPICard 
              label="Restoration Frequency"
              value="1.2%"
              trend="-0.5%"
              trendLabel="vs last month"
              trendUp={false}
              icon={RotateCcw}
              iconColor="text-orange-500"
              iconBgColor="bg-orange-500/10"
            />
            <KPICard 
              label="Total Revisions"
              value="12,840"
              trend="+145"
              trendLabel="new this week"
              trendUp={true}
              icon={Layers}
              iconColor="text-purple-400"
              iconBgColor="bg-purple-500/10"
            />
            <KPICard 
              label="Storage Growth"
              value="+240 GB"
              icon={HardDrive}
              iconColor="text-rose-400"
              iconBgColor="bg-rose-500/10"
              progress={45}
              progressBarColor="bg-rose-500"
              description="Due to version history retention"
            />
          </div>

          {/* Middle Section: Table & Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <TopDocuments />
            </div>
            <div className="xl:col-span-1">
              <RevisionTypes />
            </div>
          </div>

          {/* Bottom Section: Full-width Table */}
          <div className="pb-8">
            <RecentRestoration />
          </div>
        </main>
      </div>
    </div>
  );
}

export default VersioningRep;
