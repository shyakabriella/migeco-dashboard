import { Search, Plus, Filter, Edit2, Copy, Trash2, ChevronLeft, ChevronRight, Users, Folder, Lock, FileCode, Play } from 'lucide-react';
import { cn } from '../../../../../../../src/utils/cn';
interface Rule {
  id: string;
  name: string;
  ruleCode: string;
  description: string;
  target: string;
  targetIcon: any;
  targetColor: string;
  scope: string;
  scopeIcon: any;
  status: 'Active' | 'Disabled';
  icon: any;
  iconBg: string;
}

const rules: Rule[] = [
  {
    id: '1',
    name: 'Site Alpha Exclusive',
    ruleCode: '#RULE-224',
    description: 'Only Geologists can access Site Alpha reports. Restricted for all other departments.',
    target: 'Geologists',
    targetIcon: Users,
    targetColor: 'bg-blue-500/20 text-blue-400',
    scope: '/Projects/Site Alpha/Reports',
    scopeIcon: Folder,
    status: 'Active',
    icon: Lock,
    iconBg: 'bg-purple-500/20 text-purple-400'
  },
  {
    id: '2',
    name: 'DWG Edit Rights',
    ruleCode: '#RULE-891',
    description: 'Project Managers have full edit and delete rights to all DWG engineering files.',
    target: 'Project Managers',
    targetIcon: Users,
    targetColor: 'bg-purple-500/20 text-purple-400',
    scope: '*.dwg (Global)',
    scopeIcon: FileCode,
    status: 'Active',
    icon: Lock,
    iconBg: 'bg-teal-500/20 text-teal-400'
  },
  {
    id: '3',
    name: 'Finance Folder Lock',
    ruleCode: '#RULE-104',
    description: 'Prevent all non-finance staff from viewing the quarterly budget folder.',
    target: 'Everyone (excl. Finance)',
    targetIcon: Users,
    targetColor: 'bg-orange-500/20 text-orange-400',
    scope: '/Internal/Finance/Budgets',
    scopeIcon: Folder,
    status: 'Disabled',
    icon: Lock,
    iconBg: 'bg-slate-500/20 text-slate-400'
  },
  {
    id: '4',
    name: 'Contractor Read-Only',
    ruleCode: '#RULE-332',
    description: 'External contractors can only view documents in the shared collaboration space. No downloads.',
    target: 'Contractors',
    targetIcon: Users,
    targetColor: 'bg-slate-700/50 text-slate-300',
    scope: '/External/Collaboration',
    scopeIcon: Folder,
    status: 'Active',
    icon: Lock,
    iconBg: 'bg-cyan-500/20 text-cyan-400'
  }
];

export function AccessRules() {
  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full bg-[#0a0c14]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Rules Management</h1>
          <p className="text-slate-400 text-sm">Define and enforce granular access policies across projects and folders.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20">
          <Plus className="w-4 h-4" />
          Create New Access Rule
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search rules, roles, or scopes..." 
            className="w-full bg-[#161b2a] border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="bg-[#161b2a] border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
          All Statuses
        </button>
        <button className="bg-[#161b2a] border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
          All Roles
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-[#161b2a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-5">Rule Name</th>
                <th className="px-6 py-5">Description</th>
                <th className="px-6 py-5">Target Group/Role</th>
                <th className="px-6 py-5">Assigned Scope</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {rules.map((rule) => (
                <tr key={rule.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-6 align-top">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner", rule.iconBg)}>
                        <rule.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-[15px] mb-0.5">{rule.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono tracking-wider">ID: {rule.ruleCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <p className="text-sm text-slate-400 leading-relaxed max-w-[280px]">
                      {rule.description}
                    </p>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold", rule.targetColor)}>
                      <rule.targetIcon className="w-3.5 h-3.5" />
                      {rule.target}
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <rule.scopeIcon className="w-4 h-4 text-slate-500" />
                      {rule.scope}
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                      rule.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", rule.status === 'Active' ? "bg-emerald-400" : "bg-rose-400")} />
                      {rule.status}
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className="flex items-center gap-3">
                      <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
                        {rule.status === 'Active' ? <Edit2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-800 bg-[#161b2a] flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing <span className="text-white font-semibold">1-4</span> of <span className="text-white font-semibold">12</span> rules
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-slate-400 bg-slate-800/50 rounded-lg cursor-not-allowed border border-slate-700/50 flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
