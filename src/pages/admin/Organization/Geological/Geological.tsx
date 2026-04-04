import { useState } from 'react';
import AdminSidebar from '../../AdminSidebar';

interface Document {
  id: string;
  name: string;
  docId: string;
  date: string;
  location: string;
  analyst: string;
  analystInitials: string;
  status: 'Approved' | 'Pending Review' | 'Rejected' | 'Draft';
  type: 'pdf' | 'docx' | 'xlsx';
}

const documents: Document[] = [
  {
    id: '1',
    name: 'GEO-2023-A-001_Site_Survey_Final.pdf',
    docId: 'DOC-8922',
    date: 'Oct 24, 2023',
    location: 'Sector 4, North Ridge',
    analyst: 'Dr. Sarah Roberts',
    analystInitials: 'DR',
    status: 'Approved',
    type: 'pdf',
  },
  {
    id: '2',
    name: 'Core_Logging_BH-05_Preliminary.docx',
    docId: 'DOC-8945',
    date: 'Nov 02, 2023',
    location: 'Borehole 05, Valley East',
    analyst: 'Michael Jennings',
    analystInitials: 'MJ',
    status: 'Pending Review',
    type: 'docx',
  },
  {
    id: '3',
    name: 'Soil_Permeability_Analysis_Q3.xlsx',
    docId: 'DOC-9001',
    date: 'Oct 15, 2023',
    location: 'Sector 2, Clay Formation',
    analyst: 'Emma Liu',
    analystInitials: 'EL',
    status: 'Approved',
    type: 'xlsx',
  },
  {
    id: '4',
    name: 'Seismic_Refraction_Report_V2.pdf',
    docId: 'DOC-8876',
    date: 'Sep 28, 2023',
    location: 'Fault Line Alpha',
    analyst: 'Dr. Sarah Roberts',
    analystInitials: 'DR',
    status: 'Rejected',
    type: 'pdf',
  },
  {
    id: '5',
    name: 'Lithology_Log_Borehole_09.pdf',
    docId: 'DOC-9102',
    date: 'Nov 10, 2023',
    location: 'Borehole 09, South Ridge',
    analyst: 'Kevin Anderson',
    analystInitials: 'KA',
    status: 'Draft',
    type: 'pdf',
  },
];

const menuItems = [
  { icon: 'dashboard', label: 'Dashboard', active: false },
  { icon: 'documents', label: 'Documents', active: false },
  { icon: 'upload', label: 'Upload & Digitization', active: false },
  { icon: 'organization', label: 'Organization', active: true, expanded: true },
  { icon: 'search', label: 'Search & Retrieval', active: false },
  { icon: 'version', label: 'Version Control', active: false },
  { icon: 'access', label: 'Access & Permissions', active: false },
  { icon: 'reports', label: 'Reports', active: false },
  { icon: 'audit', label: 'Audit & Logs', active: false },
  { icon: 'users', label: 'User management', active: false },
  { icon: 'settings', label: 'Settings', active: false },
  { icon: 'help', label: 'Help & Support', active: false },
];

const subMenuItems = [
  { label: 'Categories', nested: false },
  { label: 'Document Types', nested: true, items: ['All Types', 'Geological', 'Geotechnical', 'Construction'] },
  { label: 'Projects', nested: false },
  { label: 'Departments', nested: false },
  { label: 'Tags', nested: false },
];

export default function Geological() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Pending Review':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Draft':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-slate-400';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            <path d="M14 3v5h5M8 13h2M8 17h2M14 13h2M14 17h2" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        );
      case 'docx':
        return (
          <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            <path d="M14 3v5h5M8 12h8M8 16h8M8 20h4" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        );
      case 'xlsx':
        return (
          <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            <path d="M14 3v5h5M8 12h8M8 16h8M8 20h8" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        );
      default:
        return null;
    }
  };

  const toggleDocSelection = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <AdminSidebar/>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-white">Geological Reports</h1>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Organization</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <span>Document Types</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <span>Geological Reports</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                New Report
              </button>
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Alex Morgan</p>
                  <p className="text-xs text-slate-400">Lead Geologist</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">AM</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Stats Card */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Geological Reports Database</h2>
                  <p className="text-sm text-slate-400">Centralized repository for field surveys, core logging data, and stratigraphy.</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Total Reports</p>
                  <p className="text-3xl font-bold text-white">1,240</p>
                </div>
                <div className="border-l border-slate-700 pl-8">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Pending Approval</p>
                  <p className="text-3xl font-bold text-amber-400">14</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, site, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">METADATA:</span>
              <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option>Soil Type (All)</option>
                <option>Clay</option>
                <option>Sand</option>
                <option>Silt</option>
              </select>
              <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option>Drill Depth</option>
                <option>0-50m</option>
                <option>50-100m</option>
                <option>100-200m</option>
              </select>
              <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option>Stratigraphy Phase</option>
                <option>Phase 1</option>
                <option>Phase 2</option>
                <option>Phase 3</option>
              </select>
            </div>
            <button className="ml-auto bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              Advanced Filter
            </button>
          </div>

          {/* Documents Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocs(documents.map(d => d.id));
                        } else {
                          setSelectedDocs([]);
                        }
                      }}
                      checked={selectedDocs.length === documents.length}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Document Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Survey Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Site Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Stratigraphy Analyst</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => toggleDocSelection(doc.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.type)}
                        <div>
                          <p className="text-sm font-medium text-white">{doc.name}</p>
                          <p className="text-xs text-slate-400">ID: {doc.docId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{doc.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{doc.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                          <span className="text-xs text-white font-medium">{doc.analystInitials}</span>
                        </div>
                        <span className="text-sm text-slate-300">{doc.analyst}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
              <p className="text-sm text-slate-400">
                Showing 5 of 1,240 results
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1.5 text-sm text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
