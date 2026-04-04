import { Activity, Settings2, AlertTriangle, TrendingUp } from 'lucide-react';

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card 1 */}
      <div className="bg-[#1c1d2e] rounded-xl p-6 border border-[#2a2d42] shadow-sm flex items-start justify-between">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Total Admin Actions</h3>
          <div className="text-3xl font-bold text-white mb-2">1,892</div>
          <div className="flex items-center text-sm">
            <TrendingUp size={14} className="text-emerald-400 mr-1" />
            <span className="text-emerald-400 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Activity size={20} className="text-indigo-400" />
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-[#1c1d2e] rounded-xl p-6 border border-[#2a2d42] shadow-sm flex items-start justify-between">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Config Changes</h3>
          <div className="text-3xl font-bold text-white mb-2">45</div>
          <div className="text-sm text-gray-500">Last 30 days</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
          <Settings2 size={20} className="text-fuchsia-400" />
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-[#1c1d2e] rounded-xl p-6 border border-[#2a2d42] shadow-sm flex items-start justify-between">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Critical Updates</h3>
          <div className="text-3xl font-bold text-white mb-2">8</div>
          <div className="text-sm text-amber-500 font-medium">Requires review</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <AlertTriangle size={20} className="text-amber-500" />
        </div>
      </div>
    </div>
  );
}
