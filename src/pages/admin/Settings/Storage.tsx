import { 
  LayoutDashboard, FileText, UploadCloud, Building2, Search, Settings, 
  ChevronDown, Server, Archive, AlertCircle, HardDrive, Package, Bell
} from 'lucide-react';
import AdminSidebar from '../AdminSidebar';

const SidebarItem = ({ icon: Icon, label, active = false, hasSubmenu = false }: any) => (
  <div className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium ${active ? 'bg-[#1a1f2e] text-white border-l-4 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-[#1a1f2e]'}`}>
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span>{label}</span>
    </div>
    {hasSubmenu && <ChevronDown size={14} />}
  </div>
);

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-[#1a1c2e] border border-slate-800 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

export default function Storage() {
  return (
    <div className="flex min-h-screen bg-[#0b0c14] text-slate-300 font-sans">
      {/* Sidebar */}
      <AdminSidebar/>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0b0c14]/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-6">
                <h2 className="text-sm font-semibold text-slate-200">System Settings</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Server size={14} />
                    <span>Storage Management</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <button className="text-slate-400 hover:text-slate-200">
                    <Bell size={18} />
                </button>
                <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-200">Alex Morgan</p>
                        <p className="text-[10px] text-slate-500">Lead Geologist</p>
                    </div>
                    <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
                        alt="Avatar" 
                        className="w-9 h-9 rounded-full bg-indigo-500/20"
                    />
                    <ChevronDown size={14} className="text-slate-500" />
                </div>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Storage Management</h2>
                        <p className="text-slate-500 text-sm mt-1">Monitor system capacity, manage retention policies, and view departmental usage.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2 text-sm font-medium text-slate-300 bg-[#1a1c2e] border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">Export Report</button>
                        <button className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all">+ Add Capacity</button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-8 space-y-6">
                        <Card className="col-span-12">
                            <h3 className="text-lg text-slate-400 mb-1">Total System Storage</h3>
                            <div className="text-4xl font-bold text-white mb-4">3.9 TB <span className="text-base text-slate-500 font-normal">used of 5 TB</span></div>
                            <div className="h-2 w-full bg-slate-800 rounded-full mb-6 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 w-[78%]" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Available', val: '1.1 TB' },
                                    { label: 'Documents', val: '2.4 TB' },
                                    { label: 'Media & Assets', val: '1.5 TB' }
                                ].map(stat => (
                                    <div key={stat.label} className="bg-[#0f111a] p-4 rounded-lg border border-slate-800">
                                        <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                                        <div className="text-lg font-semibold text-white">{stat.val}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="col-span-12">
                             <h3 className="text-lg font-semibold mb-4 text-white">Top Projects by Storage</h3>
                             {[
                                { name: 'Project Alpha-Deep', dept: 'Geology', last: '2d ago', size: '450 GB' },
                                { name: 'Skyline Bridge', dept: 'Construction', last: '5h ago', size: '380 GB' },
                                { name: 'Eco-Park Phase 2', dept: 'Engineering', last: '1w ago', size: '210 GB' },
                             ].map(proj => (
                                 <div key={proj.name} className="flex items-center justify-between p-3 hover:bg-[#0f111a] rounded-lg border-b border-slate-800 last:border-0">
                                     <div className="flex items-center gap-3">
                                         <div className="bg-slate-700 p-2 text-sm rounded font-bold text-white">P{proj.name[8]}</div>
                                         <div>
                                             <div className="text-sm font-medium text-white">{proj.name}</div>
                                             <div className="text-xs text-slate-500">{proj.dept} • Last active {proj.last}</div>
                                         </div>
                                     </div>
                                     <div className="text-sm text-slate-300">{proj.size}</div>
                                 </div>
                             ))}
                             <div className="text-center text-sm text-slate-500 mt-4 cursor-pointer hover:text-white">View all projects</div>
                        </Card>
                    </div>

                    <div className="col-span-4 space-y-6">
                        <Card>
                            <h3 className="text-lg font-semibold mb-4 text-white">Cloud Backup Status</h3>
                            <div className="flex flex-col gap-4">
                                {[
                                    { name: 'AWS S3 Glacier', desc: 'Last backup: 2h ago' },
                                    { name: 'Azure Blob Cold', desc: 'Redundancy Sync' }
                                ].map(backup => (
                                    <div key={backup.name} className="flex items-center gap-3 p-3 bg-[#0f111a] rounded-lg border border-slate-800">
                                        <Server className="text-indigo-400" size={20} />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-200">{backup.name}</div>
                                            <div className="text-xs text-slate-500">{backup.desc}</div>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    </div>
                                ))}
                            </div>
                            <button className="mt-6 text-sm text-indigo-400 hover:underline">Manage Backup Schedule</button>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-semibold mb-4 text-white">Usage by Department</h3>
                            <div className="flex flex-col gap-4">
                                {[
                                    { dept: 'Geology Dept.', bar: 'bg-green-500', val: '1.2 TB', width: '80%' },
                                    { dept: 'Engineering', bar: 'bg-blue-500', val: '0.9 TB', width: '60%' },
                                    { dept: 'Construction', bar: 'bg-orange-500', val: '0.8 TB', width: '50%' },
                                    { dept: 'Legal & HR', bar: 'bg-purple-500', val: '0.4 TB', width: '30%' },
                                    { dept: 'Finance', bar: 'bg-pink-500', val: '0.3 TB', width: '20%' },
                                ].map(item => (
                                    <div key={item.dept}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-200">{item.dept}</span>
                                            <span className="text-slate-500">{item.val}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div className={`${item.bar} h-full`} style={{ width: item.width }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-semibold mb-4 text-white">Auto-Archive Policies</h3>
                            <div className="flex flex-col gap-4">
                                {[
                                    { icon: Archive, title: 'Inactive Projects', desc: 'Move project files to cold storage if inactive for more than:', period: '12 Months' },
                                    { icon: FileText, title: 'Temp Files Cleanup', desc: 'Permanently delete temporary uploads older than:', period: '30 Days' },
                                    { icon: HardDrive, title: 'Large Media Compression', desc: 'Auto-compress video files larger than 1GB after:', period: 'Disabled' },
                                ].map((pol, i) => (
                                    <div key={pol.title} className="bg-[#0f111a] p-4 rounded-lg border border-slate-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <pol.icon size={20} className="text-slate-400" />
                                                <span className="font-medium text-sm text-white">{pol.title}</span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full ${i === 2 ? 'bg-slate-700' : 'bg-indigo-600'} relative`}>
                                                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 ${i === 2 ? 'left-0.5' : 'right-0.5'}`} />
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-4">{pol.desc}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">{pol.period}</span>
                                            <span className="text-xs text-indigo-400 cursor-pointer">Edit</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
