import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ChevronDown, 
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
  Bell,
  Loader2,
  Search as SearchIcon,
  Command,
  PenLine,
  FileUp,
  Share2,
  CheckCircle,
  Lock,
  MessageCircle,
  Trash2,
  FileImage
} from 'lucide-react';
import AdminSidebar from '../AdminSidebar';

interface ActivityItem {
  id: string;
  type: 'edit' | 'upload' | 'share' | 'approve' | 'permission' | 'comment' | 'delete';
  user: string;
  userInitials?: string;
  action: string;
  target: string;
  targetColor: string;
  description?: string;
  timestamp: string;
  files?: { name: string; type: string }[];
  status?: string;
  statusColor?: string;
  metadata?: string[];
}

const todayActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'edit',
    user: 'Sarah L.',
    userInitials: 'SL',
    action: 'edited',
    target: 'Geological_Survey_Report.pdf',
    targetColor: 'text-indigo-400',
    description: 'Updated section 4.2 regarding soil composition analysis based on new lab results from Site B.',
    timestamp: '10 mins ago',
    metadata: ['v2.4', 'Geological Reports']
  },
  {
    id: '2',
    type: 'upload',
    user: 'You',
    action: 'uploaded 12 files to',
    target: 'Project Beta / Site Photos',
    targetColor: 'text-indigo-400',
    timestamp: '2 hours ago',
    files: [
      { name: 'IMG_2023_001.jpg', type: 'image' },
      { name: 'IMG_2023_002.jpg', type: 'image' },
      { name: '+10 more files', type: 'more' }
    ]
  },
  {
    id: '3',
    type: 'share',
    user: 'Mike R.',
    userInitials: 'MR',
    action: 'shared',
    target: 'Q4_Strategy.pptx',
    targetColor: 'text-indigo-400',
    description: 'with the Engineering Team',
    timestamp: '4 hours ago'
  },
  {
    id: '4',
    type: 'approve',
    user: 'Director Chen',
    userInitials: 'DC',
    action: 'approved',
    target: 'Site Alpha Safety Audit',
    targetColor: 'text-indigo-400',
    description: '"Approved with conditions. Proceed with excavation but monitor vibration levels daily."',
    timestamp: '5 hours ago',
    status: 'Status: Approved',
    statusColor: 'text-emerald-400'
  }
];

const yesterdayActivities: ActivityItem[] = [
  {
    id: '5',
    type: 'permission',
    user: 'System Admin',
    action: 'updated permissions for',
    target: 'Confidential Vault',
    targetColor: 'text-indigo-400',
    description: 'Restricted access to Senior Management only.',
    timestamp: 'Yesterday, 4:30 PM'
  },
  {
    id: '6',
    type: 'comment',
    user: 'Elena O.',
    userInitials: 'EO',
    action: 'commented on',
    target: 'Foundation Plan - Site B',
    targetColor: 'text-indigo-400',
    description: '"Are we sure about the pile depth here? It contradicts the initial geo report."',
    timestamp: 'Yesterday, 2:15 PM'
  },
  {
    id: '7',
    type: 'delete',
    user: 'Alex Morgan',
    userInitials: 'AM',
    action: 'deleted',
    target: 'Draft_Proposal_v1.docx',
    targetColor: 'text-indigo-400',
    description: 'Moved to Trash.',
    timestamp: 'Yesterday, 11:00 AM'
  }
];

const typeConfig = {
  edit: { icon: PenLine, color: 'bg-indigo-500', dotColor: 'bg-indigo-500' },
  upload: { icon: FileUp, color: 'bg-emerald-500', dotColor: 'bg-emerald-500' },
  share: { icon: Share2, color: 'bg-purple-500', dotColor: 'bg-purple-500' },
  approve: { icon: CheckCircle, color: 'bg-amber-500', dotColor: 'bg-amber-500' },
  permission: { icon: Lock, color: 'bg-slate-500', dotColor: 'bg-slate-500' },
  comment: { icon: MessageCircle, color: 'bg-indigo-500', dotColor: 'bg-indigo-500' },
  delete: { icon: Trash2, color: 'bg-rose-500', dotColor: 'bg-rose-500' }
};

function Recent() {
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [auditOpen, setAuditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All Activity');

  const tabs = ['All Activity', 'My Activity', 'Uploads', 'Approvals'];

  const renderActivityItem = (activity: ActivityItem, isLast: boolean) => {
    const config = typeConfig[activity.type];
    const Icon = config.icon;

    return (
      <div key={activity.id} className="relative flex gap-4">
        {/* Timeline line */}
        {!isLast && (
          <div className="absolute left-[19px] top-10 bottom-0 w-px bg-slate-800" />
        )}
        
        {/* Icon/Dot */}
        <div className="relative z-10 flex-shrink-0">
          <div className={`w-10 h-10 rounded-full ${config.color} bg-opacity-20 flex items-center justify-center`}>
            <div className={`w-3 h-3 rounded-full ${config.dotColor}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Main action line */}
              <div className="flex items-center gap-2 mb-1">
                {activity.userInitials ? (
                  <div className={`w-6 h-6 rounded-full ${config.color} flex items-center justify-center text-white text-[10px] font-medium`}>
                    {activity.userInitials}
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full ${config.color} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <span className="text-slate-300 text-sm">
                  <span className="font-medium text-white">{activity.user}</span>
                  {' '}{activity.action}{' '}
                  <span className={`font-medium ${activity.targetColor}`}>{activity.target}</span>
                </span>
              </div>

              {/* Description */}
              {activity.description && (
                <p className="text-slate-500 text-sm ml-8 mb-2">{activity.description}</p>
              )}

              {/* Files */}
              {activity.files && activity.files.length > 0 && (
                <div className="flex items-center gap-3 ml-8 mt-2">
                  {activity.files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
                      <FileImage className="w-4 h-4 text-amber-500" />
                      <span className="text-slate-400 text-xs">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Status */}
              {activity.status && (
                <p className={`text-xs ml-8 mt-2 ${activity.statusColor}`}>{activity.status}</p>
              )}

              {/* Metadata */}
              {activity.metadata && (
                <div className="flex items-center gap-3 ml-8 mt-2">
                  {activity.metadata.map((item, i) => (
                    <React.Fragment key={i}>
                      <span className="text-slate-600 text-xs">{item}</span>
                      {i < activity.metadata!.length - 1 && (
                        <span className="text-slate-700 text-xs">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamp */}
            <span className="text-slate-600 text-xs whitespace-nowrap">{activity.timestamp}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#0a0a14] overflow-hidden">
      {/* Sidebar */}
         <AdminSidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-6 bg-[#0a0a14] flex-shrink-0">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search activity logs, user actions, or files..."
                className="w-full h-10 pl-10 pr-12 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Command className="w-3 h-3 text-slate-600" />
                <span className="text-xs text-slate-600">K</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Alex Morgan</p>
                <p className="text-xs text-slate-500">Lead Geologist</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                AM
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">Recent Activity</h1>
              <p className="text-slate-400 text-sm">Chronological timeline of system-wide actions and updates.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-[#13131f] rounded-xl border border-slate-800/50 p-6">
            {/* Today Section */}
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">Today</h2>
              <div className="space-y-0">
                {todayActivities.map((activity, index) => 
                  renderActivityItem(activity, index === todayActivities.length - 1)
                )}
              </div>
            </div>

            {/* Yesterday Section */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">Yesterday</h2>
              <div className="space-y-0">
                {yesterdayActivities.map((activity, index) => 
                  renderActivityItem(activity, index === yesterdayActivities.length - 1)
                )}
              </div>
            </div>
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-6">
            <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
              <Loader2 className="w-4 h-4" />
              <span>Load older activity</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recent;
