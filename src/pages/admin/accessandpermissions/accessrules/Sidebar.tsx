import { 
  LayoutDashboard, 
  FileText, 
  UploadCloud, 
  Users, 
  Search, 
  ShieldCheck, 
  BarChart3, 
  History, 
  Settings, 
  HelpCircle,
  ChevronDown,
  Lock
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', hasSub: true },
  { icon: FileText, label: 'Documents' },
  { icon: UploadCloud, label: 'Upload & Digitization' },
  { icon: Users, label: 'Organization' },
  { icon: Search, label: 'Search & Retrieval' },
  { icon: History, label: 'Version Control' },
  { 
    icon: ShieldCheck, 
    label: 'Access & Permissions', 
    active: true, 
    expanded: true,
    subItems: ['Roles & Permissions', 'Access Rules', 'Shared Links']
  },
  { icon: BarChart3, label: 'Reports' },
  { icon: History, label: 'Audit & Logs', hasSub: true },
  { icon: Users, label: 'User management' },
  { icon: Settings, label: 'Settings', hasSub: true },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-[#0f111a] border-r border-slate-800 flex flex-col h-screen text-slate-400 text-sm">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-white tracking-wider text-lg">MIGECO</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {navItems.map((item) => (
          <div key={item.label}>
            <button
              className={cn(
                "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors group",
                item.active ? "bg-blue-600/10 text-blue-400" : "hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", item.active ? "text-blue-500" : "group-hover:text-white")} />
                <span className="font-medium">{item.label}</span>
              </div>
              {(item.hasSub || item.expanded) && <ChevronDown className={cn("w-4 h-4", item.expanded && "rotate-180")} />}
            </button>
            
            {item.expanded && item.subItems && (
              <div className="mt-1 ml-9 space-y-1">
                {item.subItems.map((sub) => (
                  <button
                    key={sub}
                    className={cn(
                      "w-full text-left py-2 px-3 rounded-lg transition-colors",
                      sub === 'Access Rules' ? "bg-slate-800 text-white" : "hover:text-white"
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-slate-800/50 transition-colors mb-4">
          <HelpCircle className="w-5 h-5" />
          <span>Help & Support</span>
        </button>

        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400">Storage</span>
            <span className="text-xs font-bold text-white">78%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
          </div>
          <p className="text-[10px] mt-2 text-slate-500">Using 3.9 TB of 5 TB</p>
        </div>
      </div>
    </div>
  );
}
