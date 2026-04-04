import AdminSidebar from '../AdminSidebar';
import Header from './systemlog/Header';
import SummaryCards from './systemlog/SummaryCards';
import LogTable from './systemlog/LogTable';
import { Download, RefreshCw } from 'lucide-react';

function SystemLog() {
  return (
    <div className="flex h-screen bg-[#0A0C14] text-white overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 bg-[#0f111a] custom-scrollbar">
          {/* Main Title Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-white">System Actions Log</h1>
              <p className="text-gray-400 text-sm">Detailed record of administrative changes, configuration updates, and system-level events.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1c1d2e] border border-[#2a2d42] rounded-md text-sm font-medium hover:bg-[#25273c] transition-colors shadow-sm text-gray-200">
                <Download size={16} className="text-gray-400" />
                Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors shadow-sm text-white">
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>

          <SummaryCards />
          <LogTable />
        </main>
      </div>
    </div>
  );
}

export default SystemLog;
