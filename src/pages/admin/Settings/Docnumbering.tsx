import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Upload,
  FolderTree,
  Search,
  GitBranch,
  Shield,
  BarChart3,
  ClipboardList,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Bell,
  User,
  Hash,
  Cloud,
  BellRing,
  Check
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AdminSidebar from '../AdminSidebar';

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Toggle Switch Component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900',
        checked ? 'bg-indigo-500' : 'bg-slate-700'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

// Sidebar Menu Item Component
function SidebarItem({ 
  icon: Icon, 
  label, 
  active = false, 
  expanded = false, 
  hasSubmenu = false,
  children 
}: { 
  icon: React.ElementType; 
  label: string; 
  active?: boolean;
  expanded?: boolean;
  hasSubmenu?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
          active 
            ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500' 
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        )}
      >
        <Icon size={18} />
        <span className="flex-1 text-sm font-medium">{label}</span>
        {hasSubmenu && (
          expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        )}
      </div>
      {expanded && children && (
        <div className="ml-4 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

// Submenu Item Component
function SubmenuItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors',
        active 
          ? 'bg-indigo-600/20 text-indigo-400' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      )}
    >
      {label}
    </div>
  );
}

export default function Docnumbering() {
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [systemPopups, setSystemPopups] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [resetYearly, setResetYearly] = useState(false);
  const [globalUniqueness, setGlobalUniqueness] = useState(false);
  
  // Form states
  const [prefix, setPrefix] = useState('MIG-GEO');
  const [delimiter, setDelimiter] = useState('hyphen');
  const [dateFormat, setDateFormat] = useState('yyyy');
  const [sequenceNumber, setSequenceNumber] = useState('001');
  const [retentionPolicy, setRetentionPolicy] = useState('7years');

  // Generate preview based on current settings
  const getPreview = () => {
    const delimiters: Record<string, string> = {
      hyphen: '-',
      underscore: '_',
      dot: '.',
      slash: '/',
      none: ''
    };
    const delim = delimiters[delimiter] || '-';
    const year = dateFormat === 'yyyy' ? '2024' : dateFormat === 'yy' ? '24' : '';
    
    if (year) {
      return `${prefix}${delim}${year}${delim}${sequenceNumber}`;
    }
    return `${prefix}${delim}${sequenceNumber}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0c14] flex">
      {/* Sidebar */}
     <AdminSidebar/>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-[#0b0c14]/50 border-b border-slate-800 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">System Settings</span>
            <ChevronRight size={16} className="text-slate-600" />
            <span className="text-slate-300">Document Numbering Rules</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-200">Alex Morgan</p>
                <p className="text-xs text-slate-500">Lead Geologist</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white mb-1">Document Numbering Rules</h1>
                <p className="text-slate-400 text-sm">Configure automated ID generation patterns for new documents.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg border border-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors bg-[#1a1c2e]">
                  Cancel
                </button>
                <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                  <Check size={16} />
                  Save Rules
                </button>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - ID Configuration & Advanced Logic */}
              <div className="lg:col-span-2 space-y-6">
                {/* ID Configuration Card */}
                <div className="bg-[#1a1c2e] border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Hash size={18} className="text-indigo-400" />
                    <h2 className="text-white font-semibold">ID Configuration</h2>
                  </div>

                  {/* Live Preview */}
                  <div className="bg-[#0f111a] rounded-xl p-6 mb-6 border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Live Preview</p>
                    <div className="bg-[#1a1c2e] rounded-lg px-6 py-4 text-center border border-slate-800">
                      <code className="text-2xl font-mono text-white tracking-wider">{getPreview()}</code>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 text-center">
                      This format will be applied to all newly uploaded documents in the Geological category.
                    </p>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Prefix */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Prefix</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                          className="w-full bg-[#0f111a] border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="MIG-GEO"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-500">TEXT</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Company identifier or department code.</p>
                    </div>

                    {/* Delimiter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Delimiter</label>
                      <div className="relative">
                        <select
                          value={delimiter}
                          onChange={(e) => setDelimiter(e.target.value)}
                          className="w-full bg-[#0f111a] border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
                        >
                          <option value="hyphen">Hyphen ( - )</option>
                          <option value="underscore">Underscore ( _ )</option>
                          <option value="dot">Dot ( . )</option>
                          <option value="slash">Slash ( / )</option>
                          <option value="none">None</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Separator between ID segments.</p>
                    </div>

                    {/* Date Format */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date Format</label>
                      <div className="relative">
                        <select
                          value={dateFormat}
                          onChange={(e) => setDateFormat(e.target.value)}
                          className="w-full bg-[#0f111a] border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
                        >
                          <option value="yyyy">YYYY [Year Only]</option>
                          <option value="yy">YY [Short Year]</option>
                          <option value="yyyymm">YYYY-MM [Year-Month]</option>
                          <option value="yyyymmdd">YYYY-MM-DD [Full Date]</option>
                          <option value="none">None</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Include upload date in the ID.</p>
                    </div>

                    {/* Starting Sequence Number */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Starting Sequence Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={sequenceNumber}
                          onChange={(e) => setSequenceNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="w-full bg-[#0f111a] border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="001"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-500">#</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Auto-increments for each new file.</p>
                    </div>
                  </div>
                </div>

                {/* Advanced Logic Card */}
                <div className="bg-[#1a1c2e] border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Settings size={18} className="text-indigo-400" />
                      <h2 className="text-white font-semibold">Advanced Logic</h2>
                    </div>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full font-medium">Optional</span>
                  </div>

                  <div className="space-y-4">
                    {/* Reset Sequence Yearly */}
                    <div className="flex items-start gap-4 p-4 bg-[#0f111a] rounded-lg border border-slate-800">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={resetYearly}
                          onChange={(e) => setResetYearly(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-slate-300 cursor-pointer">Reset sequence yearly</label>
                        <p className="text-xs text-slate-500 mt-1">Sequence number will restart at 001 on January 1st.</p>
                      </div>
                    </div>

                    {/* Enforce Global Uniqueness */}
                    <div className="flex items-start gap-4 p-4 bg-[#0f111a] rounded-lg border border-slate-800">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={globalUniqueness}
                          onChange={(e) => setGlobalUniqueness(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-slate-300 cursor-pointer">Enforce global uniqueness</label>
                        <p className="text-xs text-slate-500 mt-1">Prevent duplicate IDs across all departments and projects.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Storage & Notifications */}
              <div className="space-y-6">
                {/* Storage Settings Card */}
                <div className="bg-[#1a1c2e] border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Cloud size={18} className="text-orange-400" />
                    <h2 className="text-white font-semibold">Storage Settings</h2>
                  </div>

                  {/* Cloud Storage Usage */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300 font-medium">Cloud Storage Usage</span>
                      <span className="text-sm font-bold text-indigo-400">78%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-2 rounded-full" style={{ width: '78%' }} />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase tracking-tighter">
                      <span>Used: 3.9 TB</span>
                      <span>Total: 5.0 TB</span>
                    </div>
                  </div>

                  {/* Retention Policy */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Retention Policy</label>
                    <div className="relative">
                      <select
                        value={retentionPolicy}
                        onChange={(e) => setRetentionPolicy(e.target.value)}
                        className="w-full bg-[#0f111a] border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none cursor-pointer transition-all"
                      >
                        <option value="7years">7 Years (Standard)</option>
                        <option value="5years">5 Years</option>
                        <option value="10years">10 Years</option>
                        <option value="indefinite">Indefinite</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-3">
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                      Deleted files are kept in recycle bin for 30 days before permanent deletion.
                    </p>
                  </div>

                  <button className="w-full mt-4 py-2 bg-[#1a1c2e] border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                    Manage Storage Plans
                  </button>
                </div>

                {/* Notifications Card */}
                <div className="bg-[#1a1c2e] border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <BellRing size={18} className="text-green-400" />
                    <h2 className="text-white font-semibold">Notifications</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Email Alerts */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-200">Email Alerts</p>
                        <p className="text-[10px] text-slate-500">Receive critical updates via email</p>
                      </div>
                      <Toggle checked={emailAlerts} onChange={setEmailAlerts} />
                    </div>

                    {/* System Popups */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-200">System Popups</p>
                        <p className="text-[10px] text-slate-500">In-app browser notifications</p>
                      </div>
                      <Toggle checked={systemPopups} onChange={setSystemPopups} />
                    </div>

                    {/* Weekly Digest */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-200">Weekly Digest</p>
                        <p className="text-[10px] text-slate-500">Summary of activity</p>
                      </div>
                      <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
