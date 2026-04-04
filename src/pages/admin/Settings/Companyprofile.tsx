import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Users, 
  Search, 
  History, 
  Lock, 
  BarChart3, 
  ClipboardList, 
  UserCircle, 
  Settings, 
  HelpCircle,
  ChevronDown,
  Bell,
  MapPin,
  Pencil,
  Trash2,
  Plus,
  Cloud,
  Palette
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminSidebar from '../AdminSidebar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = () => {
  return (
    <AdminSidebar />
  );
};

const Card = ({ title, icon: Icon, children, className }: { title: string, icon: any, children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-[#1a1c2e] border border-slate-800 rounded-xl p-6", className)}>
    <div className="flex items-center gap-2 mb-6 text-indigo-400">
      <Icon size={20} />
      <h3 className="font-semibold text-slate-200">{title}</h3>
    </div>
    {children}
  </div>
);

const InputGroup = ({ label, value, type = "text", placeholder = "" }: { label: string, value: string, type?: string, placeholder?: string }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</label>
    <input 
      type={type} 
      defaultValue={value}
      placeholder={placeholder}
      className="bg-[#0f111a] border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
    />
  </div>
);

export default function Companyprofile() {
  return (
    <div className="flex min-h-screen bg-[#0b0c14] text-slate-300 font-sans">
      {/* Sidebar */}
      <SidebarItem />
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0b0c14]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-semibold text-slate-200">System Settings</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FileText size={14} />
              <span>Company Profile</span>
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Title & Actions */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Company Profile Settings</h2>
                <p className="text-slate-500 text-sm mt-1">Manage global branding, corporate details, and contact information.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2 text-sm font-medium text-slate-300 bg-[#1a1c2e] border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
                  <span className="w-4 h-4 rounded-sm bg-white/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </span>
                  Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="col-span-8 space-y-6">
                {/* Company Branding */}
                <Card title="Company Branding" icon={Palette}>
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-3">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">Company Logo</label>
                      <div className="aspect-square bg-[#0f111a] border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-slate-700 transition-colors cursor-pointer group">
                        <Upload size={24} className="text-slate-600 group-hover:text-indigo-400" />
                        <span className="text-[10px] uppercase font-bold text-slate-600 group-hover:text-slate-400">Upload</span>
                      </div>
                    </div>
                    <div className="col-span-9 space-y-4">
                      <InputGroup label="Company Name" value="MIGECO Ltd" />
                      <InputGroup label="Tagline / Description" value="Leading geological and construction solutions." />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Primary Color (Hex)</label>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-md bg-indigo-600 shrink-0" />
                          <input 
                            type="text" 
                            defaultValue="#3b82f6"
                            className="bg-[#0f111a] border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 w-full focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Office Locations */}
                <Card title="Office Locations & Contact Info" icon={MapPin}>
                  <p className="text-xs text-slate-500 mb-6">Manage headquarters and regional office contact details for official documents.</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <InputGroup label="Headquarters Address" value="892 Quartz Avenue, Geo District" />
                    <InputGroup label="City / State" value="Denver, CO" />
                    <InputGroup label="Official Email" value="contact@migeco.com" />
                    <InputGroup label="Support Phone" value="+1 (555) 123-4567" />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Regional Offices</p>
                    {[
                      'London Branch - 45 Thames St',
                      'Singapore Hub - 12 Marina Blvd'
                    ].map((office, idx) => (
                      <div key={idx} className="bg-[#0f111a] border border-slate-800 rounded-lg px-4 py-3 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-slate-700" />
                          <span className="text-sm text-slate-300">{office}</span>
                        </div>
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-slate-500 hover:text-indigo-400"><Pencil size={14} /></button>
                          <button className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-3 border-2 border-dashed border-slate-800 rounded-lg text-xs font-bold text-slate-500 hover:border-slate-700 hover:text-indigo-400 transition-all flex items-center justify-center gap-2">
                      <Plus size={14} />
                      Add New Location
                    </button>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="col-span-4 space-y-6">
                {/* Storage Settings */}
                <Card title="Storage Settings" icon={Cloud}>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300 font-medium">Cloud Storage Usage</span>
                        <span className="text-sm font-bold text-indigo-400">78%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400" style={{ width: '78%' }} />
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase tracking-tighter">
                        <span>Used: 3.9 TB</span>
                        <span>Total: 5.0 TB</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Retention Policy</label>
                      <div className="relative">
                        <select className="appearance-none w-full bg-[#0f111a] border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none">
                          <option>7 Years (Standard)</option>
                          <option>10 Years</option>
                          <option>Infinite</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      </div>
                    </div>

                    <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        Deleted files are kept in recycle bin for 30 days before permanent deletion.
                      </p>
                    </div>

                    <button className="w-full py-2 bg-[#1a1c2e] border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                      Manage Storage Plans
                    </button>
                  </div>
                </Card>

                {/* Notifications */}
                <Card title="Notifications" icon={Bell}>
                  <div className="space-y-4">
                    {[
                      { label: 'Email Alerts', sub: 'Receive critical updates via email', checked: true },
                      { label: 'System Popups', sub: 'In-app browser notifications', checked: true },
                      { label: 'Weekly Digest', sub: 'Summary of activity', checked: false },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{item.label}</p>
                          <p className="text-[10px] text-slate-500">{item.sub}</p>
                        </div>
                        <button className={cn(
                          "w-10 h-5 rounded-full relative transition-colors",
                          item.checked ? "bg-indigo-600" : "bg-slate-800"
                        )}>
                          <div className={cn(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                            item.checked ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
