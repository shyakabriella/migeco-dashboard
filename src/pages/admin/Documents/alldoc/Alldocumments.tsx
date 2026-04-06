import { 
  FileText, UploadCloud, Search, 
  MoreVertical, Filter, 
  Database, X,
  Folder,
  Bell,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../../../../../../src/utils/cn';
import AdminSidebar from '../../AdminSidebar';
import { Link } from 'react-router-dom';

const documents = [
  { id: 1, name: 'Geo_Survey_Site_Alpha_Final.pdf', type: 'PDF Document', project: 'Site Alpha', date: 'Oct 26, 2023 14:30', author: 'AM' },
  { id: 2, name: 'Q3_Lab_Results', type: 'Folder', project: 'Project Beta', date: 'Oct 25, 2023 09:15', author: 'SL' },
  { id: 3, name: 'Foundation_Plan_v2.dwg', type: 'CAD Drawing', project: 'Site Alpha', date: 'Oct 24, 2023 16:45', author: 'MR' },
  { id: 4, name: 'Cost_Analysis_Q3.xlsx', type: 'Spreadsheet', project: 'Finance', date: 'Oct 24, 2023 11:20', author: 'JD' },
  { id: 5, name: 'Site_Inspection_North_Wall.jpg', type: 'Image', project: 'Site Alpha', date: 'Oct 23, 2023 14:10', author: 'AM' },
  { id: 6, name: 'Safety_Protocols_v4.docx', type: 'Word Document', project: 'Safety', date: 'Oct 22, 2023 09:45', author: 'SL' },
];

export default function Alldocuments() {
  return (
    <div className="flex h-screen bg-[#0B0E14] text-gray-300 font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-[#0B0E14]">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            <input placeholder="Search for documents, projects, or metadata..." className="w-full bg-[#1a1f29] rounded-md py-2 pl-10 pr-4 text-sm border border-gray-700" />
          </div>
          <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-400" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-white">Alex Morgan</div>
                <div className="text-xs text-gray-500">Lead Geologist</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-600" />
            </div>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-auto bg-[#0B0E14]">
          <div className="text-xs text-gray-500 mb-6">Home {'>'} Documents {'>'} <span className="text-white">All Documents</span></div>
          
          <div className="flex justify-end gap-2 mb-6">
            <button className="px-4 py-2 border border-gray-700 rounded-md text-sm flex items-center gap-2"><Filter size={16}/> Filter</button>
            <button className="px-4 py-2 border border-gray-700 rounded-md text-sm flex items-center gap-2"><Folder size={16}/> New Folder</button>
            <Link to="/upload&digitization/upload" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center gap-2"><UploadCloud size={16}/> Upload</Link>
          </div>

          <div className="bg-[#12161f] border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 border-b border-gray-800">
                <tr>
                  <th className="p-4 w-10"><input type="checkbox" className="rounded" /></th>
                  <th className="p-4">NAME</th>
                  <th className="p-4">TYPE</th>
                  <th className="p-4">PROJECT</th>
                  <th className="p-4">DATE MODIFIED</th>
                  <th className="p-4">AUTHOR</th>
                  <th className="p-4">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-800 hover:bg-[#1a1f29]">
                    <td className="p-4"><input type="checkbox" className="rounded" checked={doc.id===1} /></td>
                    <td className="p-4 flex items-center gap-3"><FileText size={18} className="text-red-500"/> {doc.name}</td>
                    <td className="p-4 text-gray-500">{doc.type}</td>
                    <td className="p-4"><span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-xs">{doc.project}</span></td>
                    <td className="p-4 text-gray-400">{doc.date}</td>
                    <td className="p-4 flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-blue-800 text-[10px] flex items-center justify-center text-white">{doc.author}</div></td>
                    <td className="p-4"><MoreVertical size={16} className="text-gray-500" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Right Details Sidebar */}
      <aside className="w-80 border-l border-gray-800 bg-[#0B0E14] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold">File Details</h2>
          <X size={18} className="text-gray-500 cursor-pointer" />
        </div>
        <div className="flex justify-center mb-6">
          <div className="w-32 h-40 bg-white rounded flex items-center justify-center text-red-600 font-bold">PDF</div>
        </div>
        <div className="text-center mb-6">
          <div className="font-medium">Geo_Survey_Site_Alpha_Final.pdf</div>
          <div className="text-xs text-gray-500">2.4 MB</div>
        </div>
        <div className="flex gap-2 mb-8">
          <button className="flex-1 bg-blue-600 py-2 rounded text-sm">Open</button>
          <button className="flex-1 border border-gray-700 py-2 rounded text-sm">Share</button>
          <button className="px-3 border border-gray-700 rounded text-sm"><UploadCloud size={16}/></button>
        </div>
        <div className="space-y-4 text-sm">
          <DetailRow label="Type" value="PDF Document" />
          <DetailRow label="Size" value="2.4 MB" />
          <DetailRow label="Created" value="Oct 20, 2023" />
          <DetailRow label="Modified" value="Oct 26, 2023" />
          <DetailRow label="Location" value="/Projects/Alpha/..." />
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6">
          <h3 className="font-medium mb-4 flex justify-between">METADATA <span className="text-xs text-blue-500">Edit</span></h3>
          <DetailRow label="Surveyor" value="James Bond" />
          <div className="mt-4">
            <div className="text-gray-500 text-xs mb-1">Coordinates</div>
            <div className="text-sm">34.0522° N, 118.2437° W</div>
          </div>
          <div className="mt-4">
            <div className="text-gray-500 text-xs mb-2">Soil Type</div>
            <div className="flex gap-2 text-xs">
              <span className="bg-gray-800 px-2 py-1 rounded">Clay</span>
              <span className="bg-gray-800 px-2 py-1 rounded">Limestone</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, hasSub }: any) {
  return (
    <div className={cn("flex items-center gap-3 px-2 py-2 cursor-pointer hover:text-white rounded-md", active ? "text-white bg-[#1a1f29]" : "text-gray-500")}>
      <Icon size={18} />
      <span className="flex-1 text-sm">{label}</span>
      {hasSub && <ChevronDown size={16} />}
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300">{value}</span>
    </div>
  );
}
