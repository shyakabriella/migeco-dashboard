import React, { useState } from 'react';
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
  Bell,
  ChevronDown,
  ChevronRight,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search as SearchIcon
} from 'lucide-react';
import AdminSidebar from '../AdminSidebar';

interface Task {
  id: number;
  priority: 'urgent' | 'high' | 'normal';
  dueDate: string;
  title: string;
  description: string;
  tags: { label: string; icon?: React.ReactNode }[];
  completed: boolean;
}

const tasks: Task[] = [
  {
    id: 1,
    priority: 'urgent',
    dueDate: 'Due Today, 5:00 PM',
    title: 'Review Site Alpha Safety Audit',
    description: 'Comprehensive safety protocol review for the northern sector excavation phase. Requires sign-off on section 4.1 regarding soil stability measures.',
    tags: [
      { label: 'Project Alpha' },
      { label: 'Assigned by: Sarah Connor' }
    ],
    completed: false
  },
  {
    id: 2,
    priority: 'high',
    dueDate: 'Due Tomorrow',
    title: 'Approve Q3 Budget Revision',
    description: 'Finance department requires approval for the revised geological survey budget adjustments. Check the attached Excel sheet for line-item changes.',
    tags: [
      { label: 'Finance Dept' }
    ],
    completed: false
  },
  {
    id: 3,
    priority: 'urgent',
    dueDate: 'Overdue (2h)',
    title: 'Sign-off: Core Sample Analysis #402',
    description: 'Lab results are in for the deep bore site. Requires geologist sign-off before construction can proceed to phase 2.',
    tags: [
      { label: 'Lab Results' },
      { label: 'Site B - Deep Bore' }
    ],
    completed: false
  },
  {
    id: 4,
    priority: 'normal',
    dueDate: 'Oct 28',
    title: 'Update Metadata for Bulk Upload #44',
    description: 'Tagging required for the 50 new site photos uploaded yesterday. Ensure location coordinates are accurate.',
    tags: [
      { label: 'Bulk Uploads' }
    ],
    completed: false
  },
  {
    id: 5,
    priority: 'normal',
    dueDate: 'Oct 29',
    title: 'Contract Review: Heavy Machinery Lease',
    description: 'Legal needs technical confirmation on the equipment specifications listed in Annex B.',
    tags: [
      { label: 'Legal / Contracts' }
    ],
    completed: false
  }
];

const SidebarItem = ({ 
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
}) => (
  <div>
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
      active ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`}>
      <Icon size={18} />
      <span className="text-sm font-medium flex-1">{label}</span>
      {hasSubmenu && (
        expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
      )}
    </div>
    {expanded && children && (
      <div className="ml-4 mt-1 space-y-1">
        {children}
      </div>
    )}
  </div>
);

const SubMenuItem = ({ label, active = false }: { label: string; active?: boolean }) => (
  <div className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
    active ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
  }`}>
    {label}
  </div>
);

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles = {
    urgent: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    normal: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };
  
  const labels = {
    urgent: 'URGENT',
    high: 'HIGH PRIORITY',
    normal: 'NORMAL'
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[priority as keyof typeof styles]}`}>
      {labels[priority as keyof typeof labels]}
    </span>
  );
};

const TaskCard = ({ task }: { task: Task }) => {
  const priorityColors = {
    urgent: 'border-l-rose-500',
    high: 'border-l-amber-500',
    normal: 'border-l-slate-500'
  };

  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-xl p-5 border-l-4 ${priorityColors[task.priority]} hover:border-slate-700 transition-colors`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <PriorityBadge priority={task.priority} />
            <span className="text-slate-500 text-sm flex items-center gap-1.5">
              <Clock size={14} />
              {task.dueDate}
            </span>
          </div>
          
          <h3 className="text-slate-200 font-semibold text-lg mb-2">{task.title}</h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">{task.description}</p>
          
          <div className="flex items-center gap-3">
            {task.tags.map((tag, idx) => (
              <span key={idx} className="flex items-center gap-1.5 text-slate-500 text-xs">
                <FolderTree size={12} />
                {tag.label}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
            <FileText size={16} />
            Go to Document
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-300 rounded-lg text-sm transition-colors">
            <CheckCircle2 size={16} />
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
};

function Mytask() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Tasks' },
    { id: 'pending', label: 'Pending Approval' },
    { id: 'assigned', label: 'Assigned to Me' },
    { id: 'review', label: 'Review Required' }
  ];

  return (
    <div className="flex h-screen bg-[#0a0a14] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-[#0a0a14] flex-shrink-0">
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder="Search tasks, documents, or projects..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-300 placeholder-slate-600 text-sm focus:outline-none focus:border-slate-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs border border-slate-700 rounded px-1.5 py-0.5">⌘K</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right">
                <p className="text-slate-200 text-sm font-medium">Alex Morgan</p>
                <p className="text-slate-500 text-xs">Lead Geologist</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                AM
              </div>
              <ChevronDown size={16} className="text-slate-500" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">My Tasks</h1>
              <p className="text-slate-400 text-sm">Manage your pending actions and approvals for the Document Management System.</p>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle size={18} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-rose-400">3</p>
                  <p className="text-rose-400/70 text-xs uppercase tracking-wide font-semibold">Urgent</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <ClipboardList size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">5</p>
                  <p className="text-blue-400/70 text-xs uppercase tracking-wide font-semibold">Total Tasks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-sm hover:text-slate-200 transition-colors">
                <Filter size={16} />
                Filter by Project
                <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-sm hover:text-slate-200 transition-colors">
                <ArrowUpDown size={16} />
                Sort by Date
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mytask;
