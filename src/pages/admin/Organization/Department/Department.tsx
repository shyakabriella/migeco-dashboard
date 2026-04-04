import React from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CloudUpload, 
  Settings2, 
  Search, 
  History, 
  Lock, 
  BarChart2, 
  FileText, 
  Users, 
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Building2,
  Users2,
  Mountain,
  Hammer,
  Scale,
  Compass,
  Network
} from 'lucide-react';
import AdminSidebar from '../../AdminSidebar';

export default function Department() {
  return (
    <div className="flex h-screen bg-[#0F111A] text-white font-sans overflow-hidden">
      {/* Left Sidebar */}
      <AdminSidebar/>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-gray-800/60 flex items-center justify-between px-8 bg-[#0F111A]">
          <h1 className="text-xl font-semibold text-gray-100">Departments Management</h1>
          <div className="flex items-center space-x-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#11121c]"></span>
            </button>
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-gray-200">Alex Morgan</div>
                <div className="text-xs text-gray-400">Lead Geologist</div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Alex Morgan" 
                className="w-10 h-10 rounded-full border-2 border-gray-700"
              />
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Department Overview</h2>
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Plus size={18} />
              <span>Add New Department</span>
            </button>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#1A1D2D] p-6 rounded-2xl border border-gray-800/60 flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#2a2d45] rounded-xl flex items-center justify-center text-indigo-400">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Departments</p>
                <p className="text-3xl font-bold text-white">8</p>
              </div>
            </div>
            
            <div className="bg-[#1A1D2D] p-6 rounded-2xl border border-gray-800/60 flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#1b2f3a] rounded-xl flex items-center justify-center text-teal-400">
                <Users2 size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Active Staff</p>
                <p className="text-3xl font-bold text-white">124</p>
              </div>
            </div>

            <div className="bg-[#1A1D2D] p-6 rounded-2xl border border-gray-800/60 flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#2f1f3a] rounded-xl flex items-center justify-center text-purple-400">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Recent Docs</p>
                <p className="text-sm font-bold text-white mt-1">Geology: <span className="text-gray-300 font-normal">+45 this week</span></p>
              </div>
            </div>
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <DepartmentCard 
              name="Geology" 
              created="Created 2018"
              icon={<Mountain size={20} />}
              iconBg="bg-[#3a2d1f]"
              iconColor="text-yellow-500"
              headName="Dr. Sarah\nJenkins"
              headAvatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              members="34 Staff"
              documents="12,450\nFiles"
              storage={85}
              storageColor="bg-yellow-500"
            />
            
            <DepartmentCard 
              name="Engineering" 
              created="Created 2019"
              icon={<Settings2 size={20} />}
              iconBg="bg-[#1f2845]"
              iconColor="text-indigo-400"
              headName="Mike\nRoss"
              headAvatar=""
              members="28 Staff"
              documents="8,230\nFiles"
              storage={65}
              storageColor="bg-indigo-500"
            />

            <DepartmentCard 
              name="Exploration" 
              created="Created 2020"
              icon={<Compass size={20} />}
              iconBg="bg-[#1b3a2f]"
              iconColor="text-emerald-500"
              headName="Elena\nVasquez"
              headAvatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              members="15 Staff"
              documents="5,100\nFiles"
              storage={45}
              storageColor="bg-emerald-500"
            />

            <DepartmentCard 
              name="Construction" 
              created="Created 2021"
              icon={<Hammer size={20} />}
              iconBg="bg-[#3a231b]"
              iconColor="text-orange-500"
              headName="David\nChen"
              headAvatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              members="42 Staff"
              documents="9,800\nFiles"
              storage={72}
              storageColor="bg-orange-500"
            />

            <DepartmentCard 
              name="Legal" 
              created="Created 2018"
              icon={<Scale size={20} />}
              iconBg="bg-[#3a1b24]"
              iconColor="text-rose-500"
              headName="Amanda\nPierce"
              headAvatar=""
              members="8 Staff"
              documents="3,450\nFiles"
              storage={30}
              storageColor="bg-rose-500"
            />

            <DepartmentCard 
              name="HR" 
              created="Created 2018"
              icon={<Users2 size={20} />}
              iconBg="bg-[#3a1b32]"
              iconColor="text-pink-500"
              headName="Tom\nHarris"
              headAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              members="12 Staff"
              documents="1,890\nFiles"
              storage={25}
              storageColor="bg-pink-500"
            />
          </div>
        </div>
      </main>

      {/* Right Sidebar - Activity */}
      <aside className="w-[320px] bg-[#131520] border-l border-gray-800/60 flex flex-col hidden xl:flex">
        <div className="p-6 border-b border-gray-800/60 h-20 flex items-center">
          <History className="text-gray-400 mr-3" size={20} />
          <h2 className="text-lg font-semibold text-white">Recent Department Activity</h2>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto relative custom-scrollbar">
          {/* Timeline Line */}
          <div className="absolute top-8 bottom-6 left-[28px] w-[2px] bg-gray-800"></div>
          
          <div className="space-y-8">
            <TimelineItem 
              time="10 minutes ago"
              content={<><span className="text-indigo-400 font-medium">Dr. Sarah Jenkins</span> updated the <strong>department policy for Geology</strong>.</>}
              borderColor="border-indigo-500"
            />
            <TimelineItem 
              time="2 hours ago"
              content="New member Liam Neeson added to Exploration."
              borderColor="border-emerald-500"
            />
            <TimelineItem 
              time="Yesterday"
              content="Construction exceeded 70% storage quota."
              borderColor="border-orange-500"
            />
            <TimelineItem 
              time="2 days ago"
              content={<><span className="text-indigo-400 font-medium">Mike Ross</span> archived <strong>200 documents from Engineering</strong>.</>}
              borderColor="border-blue-500"
            />
            <TimelineItem 
              time="3 days ago"
              content="Quarterly audit completed for Legal."
              borderColor="border-rose-500"
            />
            <TimelineItem 
              time="Last week"
              content="New department R&D structure initialized."
              borderColor="border-gray-500"
            />
          </div>
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #2a2d45;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}

// Components

function NavItem({ icon, label, hasSubmenu = false }: { icon: React.ReactNode, label: string, hasSubmenu?: boolean }) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
      <div className="flex items-center space-x-3">
        <span className="text-gray-500 group-hover:text-gray-300 transition-colors">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {hasSubmenu && <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />}
    </button>
  );
}

function SubNavItem({ label, hasSubmenu = false }: { label: string, hasSubmenu?: boolean }) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md transition-colors group">
      <span>{label}</span>
      {hasSubmenu && <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400" />}
    </button>
  );
}

function DepartmentCard({ 
  name, 
  created, 
  icon, 
  iconBg, 
  iconColor, 
  headName, 
  headAvatar, 
  members, 
  documents, 
  storage, 
  storageColor 
}: any) {
  return (
    <div className="bg-[#1A1D2D] rounded-2xl p-6 border border-gray-800/60 flex flex-col h-full hover:border-gray-700 transition-colors">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <p className="text-xs text-gray-500">{created}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-300">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="space-y-6 mb-8 flex-1 mt-4">
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-400 leading-tight">Head of<br/>Dept</div>
          <div className="flex items-center space-x-3 text-right">
            {headAvatar ? (
              <img src={headAvatar} alt={headName.replace('\n', ' ')} className="w-8 h-8 rounded-full shrink-0 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300 font-medium shrink-0">
                {headName.charAt(0)}
              </div>
            )}
            <span className="text-white font-medium max-w-[80px] leading-tight whitespace-pre-line text-left">{headName}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Members</span>
          <span className="text-white font-medium text-right">{members}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Documents</span>
          <span className="text-white font-medium text-right leading-tight max-w-[80px] whitespace-pre-line">{documents}</span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 font-medium">Storage Usage</span>
          <span className="text-xs text-gray-500 font-medium">{storage}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full ${storageColor} rounded-full`} style={{ width: `${storage}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ time, content, borderColor }: any) {
  return (
    <div className="relative pl-8">
      <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 ${borderColor} bg-[#131520] z-10`}></div>
      <div className="text-xs text-gray-500 mb-1 font-medium">{time}</div>
      <div className="text-sm text-gray-300 leading-relaxed">
        {content}
      </div>
    </div>
  );
}
