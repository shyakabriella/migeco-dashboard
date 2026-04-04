import { useState } from 'react';
import { 
  LayoutDashboard, 
  Files, 
  UploadCloud, 
  Users, 
  Search, 
  History, 
  ShieldCheck, 
  BarChart3, 
  FileText, 
  Settings, 
  HelpCircle,
  Bell,
  Mail,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Moon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminSidebar from '../AdminSidebar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, active = false, hasSubmenu = false, expanded = false }: any) => (
  <div className={cn(
    "flex items-center justify-between px-4 py-2.5 cursor-pointer rounded-lg transition-colors group",
    active ? "bg-indigo-600/20 text-indigo-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
  )}>
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    {hasSubmenu && (
      expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    )}
  </div>
);

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange?: () => void }) => (
  <button
    onClick={onChange}
    className={cn(
      "relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
      enabled ? "bg-indigo-600" : "bg-gray-700"
    )}
  >
    <span
      className={cn(
        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        enabled ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);

export default function Notifications() {
  const [notifications, setNotifications] = useState<Record<string, { email: boolean, inApp: boolean, push: boolean }>>({
    newDoc: { email: true, inApp: true, push: false },
    comment: { email: true, inApp: true, push: true },
    storage: { email: true, inApp: true, push: false },
    version: { email: true, inApp: false, push: true },
    mentioned: { email: true, inApp: true, push: true },
    expiry: { email: true, inApp: false, push: false },
  });

  const toggleNotification = (key: string, channel: 'email' | 'inApp' | 'push') => {
    setNotifications(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [channel]: !prev[key][channel]
      }
    }));
  };

  return (
    <div className="flex h-screen bg-[#0b0c14] text-gray-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
     <AdminSidebar/>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#0d0f1a] border-b border-white/5 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">System Settings</h1>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Bell size={14} className="text-gray-500" />
              <span>Global Notifications</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell size={20} className="text-gray-400 cursor-pointer" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0d0f1a]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Alex Morgan</p>
                <p className="text-[10px] text-gray-500">Lead Geologist</p>
              </div>
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
                alt="Avatar" 
                className="w-10 h-10 rounded-full bg-indigo-900 border border-white/10"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Global Notification Settings</h2>
                <p className="text-gray-500 text-sm">Configure how and when users receive system alerts across different channels.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-[#161929] border border-white/5 rounded-lg transition-colors">
                  Reset to Default
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Event Triggers Table */}
              <div className="col-span-8 bg-[#161929] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Event Triggers</h3>
                    <p className="text-xs text-gray-500 mt-1">Granular control over specific system events.</p>
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <button className="text-indigo-400 hover:text-indigo-300">Select All</button>
                    <button className="text-gray-500 hover:text-gray-400">Clear All</button>
                  </div>
                </div>

                <div className="w-full">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-white/5">
                        <th className="px-6 py-4 font-semibold">Event Name</th>
                        <th className="px-4 py-4 font-semibold text-center">Email</th>
                        <th className="px-4 py-4 font-semibold text-center">In-App</th>
                        <th className="px-4 py-4 font-semibold text-center">Push</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Object.entries({
                        newDoc: { name: "New Document Uploaded", desc: "When a new file is added to a shared folder" },
                        comment: { name: "Comment on My Document", desc: "When someone adds a comment to a document you own" },
                        storage: { name: "Storage Limit Warning", desc: "When personal or team storage exceeds 90%" },
                        version: { name: "Version Update Approval", desc: "Request for approval on a new document version" },
                        mentioned: { name: "Mentioned in Discussion", desc: "When you are @mentioned in a comment thread" },
                        expiry: { name: "Document Expiry Reminder", desc: "7 days before a document is set to expire" },
                      }).map(([key, data]) => (
                        <tr key={key} className="group hover:bg-white/5 transition-colors">
                          <td className="px-6 py-5">
                            <p className="text-sm font-medium text-gray-200">{data.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{data.desc}</p>
                          </td>
                          <td className="px-4 py-5 text-center">
                            <Toggle 
                              enabled={notifications[key].email} 
                              onChange={() => toggleNotification(key, 'email')}
                            />
                          </td>
                          <td className="px-4 py-5 text-center">
                            <Toggle 
                              enabled={notifications[key].inApp} 
                              onChange={() => toggleNotification(key, 'inApp')}
                            />
                          </td>
                          <td className="px-4 py-5 text-center">
                            <Toggle 
                              enabled={notifications[key].push} 
                              onChange={() => toggleNotification(key, 'push')}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery Channels and DND */}
              <div className="col-span-4 space-y-6">
                {/* Delivery Channels */}
                <div className="bg-[#161929] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                      <Bell size={18} className="text-indigo-400" />
                    </div>
                    <h3 className="font-semibold text-white">Delivery Channels</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-6">Configure the default behavior and frequency for each channel.</p>

                  <div className="space-y-4">
                    <div className="p-4 bg-[#0d0f1a] rounded-xl border border-white/5">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                          <Mail size={16} className="text-gray-400" />
                          <span>Email Digest</span>
                        </div>
                        <button className="text-[10px] text-indigo-400 font-medium">Edit</button>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-3">Daily summary sent at 9:00 AM EST</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-medium text-emerald-500">Active</span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#0d0f1a] rounded-xl border border-white/5">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                          <Smartphone size={16} className="text-gray-400" />
                          <span>Push Notifications</span>
                        </div>
                        <button className="text-[10px] text-indigo-400 font-medium">Edit</button>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-3">Instant delivery for high priority items</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-medium text-emerald-500">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Do Not Disturb */}
                <div className="bg-[#161929] border border-white/5 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-500/10 rounded-lg">
                        <Moon size={18} className="text-orange-400" />
                      </div>
                      <h3 className="font-semibold text-white">Do Not Disturb</h3>
                    </div>
                    <Toggle enabled={false} />
                  </div>
                  <p className="text-xs text-gray-500 mb-6">Pause all notifications during specific hours.</p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1.5 block">Start Time</label>
                      <div className="flex items-center justify-between p-2.5 bg-[#0d0f1a] rounded-lg border border-white/5 text-sm">
                        <span>10:00 PM</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1.5 block">End Time</label>
                      <div className="flex items-center justify-between p-2.5 bg-[#0d0f1a] rounded-lg border border-white/5 text-sm">
                        <span>07:00 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-xs font-medium bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                      Weekdays
                    </button>
                    <button className="flex-1 py-2 text-xs font-medium text-gray-500 hover:text-gray-400 bg-[#0d0f1a] rounded-lg border border-white/5 transition-colors">
                      Weekends
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
