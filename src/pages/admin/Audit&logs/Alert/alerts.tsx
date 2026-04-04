import {
  LayoutDashboard, FolderOpen, UploadCloud, Network,
  Search, History, Shield, BarChart2, FileText,
  Users, Settings, HelpCircle, ChevronDown,
  Bell, AlertTriangle, Lock, CloudOff, Eye, ShieldAlert, Ban
} from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';

function Sidebar() {
  return (
    <AdminSidebar />
  );
}

function Header() {
  return (
    <header className="border-b border-white/8 bg-[#11152d]/90 backdrop-blur flex-shrink-0">
      <div className="flex flex-col gap-4 px-5 py-4 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="font-semibold text-white">Audit & Logs</span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-2 text-[#F43F5E]">
            <ShieldAlert size={18} />
            <span>Alerts & Suspicious Activity</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-slate-800/80 text-slate-300 transition hover:border-indigo-400/30 hover:text-white">
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#11152d] bg-rose-500" />
          </button>

          <div className="hidden h-8 w-px bg-white/8 sm:block" />

          <button className="flex items-center gap-3 rounded-full border border-white/8 bg-slate-800/80 py-1.5 pl-1.5 pr-3 text-left transition hover:border-indigo-400/30 hover:bg-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-orange-100 to-slate-200 text-sm font-semibold text-slate-700">
              AM
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium text-white">Alex Morgan</div>
              <div className="text-xs text-slate-400">Lead Geologist</div>
            </div>
            <ChevronDown size={16} className="text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
}

function AlertCard({
  icon: Icon, title, description, badgeLabel, badgeColor,
  details, primaryAction, secondaryAction, tertiaryAction
}: any) {
  const badgeClasses = {
    'CRITICAL': 'bg-[#F43F5E] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider',
    'HIGH': 'bg-[#F97316] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider',
  };

  const primaryBtnClasses = {
    'danger': 'bg-[#E11D48] hover:bg-[#BE123C] text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors text-[14px]',
    'warning': 'bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors text-[14px]',
  };

  return (
    <div className={`bg-[#232943] border border-white/8 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-full shadow-[0_18px_48px_rgba(0,0,0,0.22)]`}>
      <div className={`absolute top-0 left-0 w-[4px] h-full ${badgeLabel === 'CRITICAL' ? 'bg-[#F43F5E]' : 'bg-[#F97316]'}`}></div>
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
              badgeLabel === 'CRITICAL' 
                ? 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/20' 
                : 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20'
            }`}>
              <Icon size={22} strokeWidth={2.5} />
            </div>
            <div className="mt-0.5">
              <h3 className="text-white text-[17px] font-semibold tracking-wide mb-1">{title}</h3>
              <p className={`text-[14px] font-medium ${badgeLabel === 'CRITICAL' ? 'text-[#F43F5E]' : 'text-[#FBBF24]'}`}>{description}</p>
            </div>
          </div>
          <span className={badgeClasses[badgeLabel as keyof typeof badgeClasses]}>{badgeLabel}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 bg-[#1c213d] p-5 rounded-xl border border-white/5 mb-8">
          {details.map((detail: any, i: number) => (
            <div key={i} className={`space-y-1.5 ${detail.fullWidth ? 'col-span-2' : ''}`}>
              <div className="text-[12px] text-slate-400 font-medium tracking-wide">{detail.label}</div>
              <div className="text-[14px] text-white font-medium break-all flex items-center gap-2">
                {detail.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-auto">
        <button className={primaryBtnClasses[badgeColor as keyof typeof primaryBtnClasses]}>
          {badgeColor === 'danger' ? <Ban size={18} /> : <Lock size={18} />}
          {primaryAction}
        </button>
        <button className="bg-[#1c213d] hover:bg-white/10 border border-white/8 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors text-[14px]">
          <Search size={18} />
          {secondaryAction}
        </button>
        <button className="text-slate-400 hover:text-white px-4 py-2.5 text-[14px] font-medium transition-colors ml-4">
          {tertiaryAction}
        </button>
      </div>
    </div>
  );
}

function EventsTable() {
  const events = [
    { time: '14:15:00', severity: 'MEDIUM', title: 'Off-hours admin login', user: 'admin_sys' },
    { time: '13:42:11', severity: 'LOW', title: 'Permission escalation attempt', user: 'guest_contractor' },
    { time: '11:20:05', severity: 'HIGH', title: 'Malware signature detected in upload', user: 'invoice_scan_exe.pdf' },
    { time: '09:05:33', severity: 'INFO', title: 'New unrecognized device', user: 'alex.morgan' },
  ];

  const severityColors: Record<string, string> = {
    'MEDIUM': 'bg-transparent text-[#F59E0B] border border-[#F59E0B]/50',
    'LOW': 'bg-transparent text-[#84CC16] border border-[#84CC16]/50',
    'HIGH': 'bg-transparent text-[#F43F5E] border border-[#F43F5E]/50',
    'INFO': 'bg-transparent text-[#3B82F6] border border-[#3B82F6]/50',
  };

  return (
    <div className="bg-[#232943] border border-white/8 rounded-xl overflow-hidden h-full flex flex-col shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
      <div className="p-6 border-b border-white/8 flex justify-between items-center bg-[#1c213d]/30">
        <div>
          <h3 className="text-white text-[17px] font-semibold tracking-wide">Flagged Events Log</h3>
          <p className="text-[14px] text-slate-400 mt-1.5">Recent events triggering heuristic algorithms</p>
        </div>
        <a href="#" className="text-indigo-400 text-[14px] hover:underline font-medium">View All Logs</a>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-[12px] uppercase text-slate-500 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider w-40">TIME</th>
              <th className="px-6 py-4 font-semibold tracking-wider w-40">SEVERITY</th>
              <th className="px-6 py-4 font-semibold tracking-wider">EVENT</th>
              <th className="px-6 py-4 font-semibold tracking-wider w-24 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {events.map((event, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-[13px] text-slate-400">{event.time}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold tracking-wider ${severityColors[event.severity]}`}>
                    {event.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white font-medium text-[14px] mb-1">{event.title}</div>
                  <div className="text-[12px] text-slate-400 flex items-center gap-1.5">
                    {event.severity === 'HIGH' ? 'File: ' : 'User: '} {event.user}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 mx-auto">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ThreatLevelWidget() {
  return (
    <div className="bg-[#232943] border border-white/8 rounded-xl p-7 h-full flex flex-col items-center shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
      <div className="w-full flex items-center gap-3 mb-6">
        <Shield className="text-white" size={18} />
        <h3 className="text-white text-[17px] font-semibold tracking-wide">System Threat Level</h3>
      </div>
      
      <div className="relative w-44 h-44 mb-6 mt-2 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full absolute top-0 left-0 -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1c213d" strokeWidth="12" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#F97316" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="100.48" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="text-[28px] font-bold text-white tracking-wide">Elevated</div>
          <div className="text-[#F97316] text-[12px] font-bold mt-1 uppercase tracking-widest">Level 3</div>
        </div>
      </div>
      
      <p className="text-center text-[13px] text-slate-400 mb-10 leading-relaxed px-6">
        Threat level is elevated due to recent brute force activity targeted at Engineering group.
      </p>
      
      <div className="w-full space-y-4 mt-auto">
        <div className="flex justify-between items-center text-[13px] border-b border-white/5 pb-3">
          <span className="text-slate-400">Firewall Status</span>
          <span className="text-[#10B981] flex items-center gap-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Active
          </span>
        </div>
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-slate-400">Auto-Block</span>
          <span className="text-[#10B981] flex items-center gap-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Enabled
          </span>
        </div>
      </div>
    </div>
  );
}


export default function Alert() {
  return (
    <div className="min-h-screen bg-[#0c1022] text-slate-100">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <Sidebar />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-10 lg:py-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-white flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="text-rose-500" size={24} />
                    Security Alerts Dashboard
                  </h1>
                  <p className="text-slate-400 text-[15px]">Monitor, investigate, and resolve high-priority security incidents affecting system integrity.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 bg-[#2d1b22] text-rose-500 px-4 py-2 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 transition-colors font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    3 Active Threats
                  </button>
                  <button className="flex items-center gap-2 bg-[#232943] text-white px-4 py-2 rounded-lg border border-white/8 hover:bg-white/5 transition-colors font-medium">
                    <Settings size={18} />
                    Alert Settings
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <AlertCard 
                    icon={Lock}
                    title="Brute Force Attempt Detected"
                    description="Multiple failed login attempts from single IP"
                    badgeLabel="CRITICAL"
                    badgeColor="danger"
                    details={[
                      { label: 'Source IP Address', value: <div className="flex items-center gap-2"><span>192.168.1.45</span><span className="text-[10px] bg-[#1D2136] px-1.5 py-0.5 rounded text-slate-400 border border-white/8 font-mono tracking-wide">VPN-Pool-3</span></div> },
                      { label: 'Target Account', value: 'm.ross@migeco.com' },
                      { label: 'Attempts', value: '28 failures in 45 seconds' },
                      { label: 'Time Detected', value: 'Today, 14:30:12' }
                    ]}
                    primaryAction="Block User / IP"
                    secondaryAction="Investigate"
                    tertiaryAction="Acknowledge"
                 />
                 <AlertCard 
                    icon={CloudOff}
                    title="Sensitive Document Bulk Export"
                    description="Unusual volume of restricted geological data downloaded"
                    badgeLabel="HIGH"
                    badgeColor="warning"
                    details={[
                      { label: 'User Activity', value: 'Sarah K. (Geologist)' },
                      { label: 'Data Volume', value: '4.2 GB (145 Files)' },
                      { label: 'Files Involved', value: 'Seismic_Raw_Data_Q3.zip, Geo_Survey_Site_B_Full.pdf...', fullWidth: true }
                    ]}
                    primaryAction="Suspend Access"
                    secondaryAction="Investigate"
                    tertiaryAction="Acknowledge"
                 />
              </div>

              <div className="grid grid-cols-3 gap-6 h-[400px]">
                 <div className="col-span-2">
                    <EventsTable />
                 </div>
                 <div className="col-span-1">
                    <ThreatLevelWidget />
                 </div>
              </div>
            </div>
          </main>
        </main>
      </div>
    </div>
  );
}
