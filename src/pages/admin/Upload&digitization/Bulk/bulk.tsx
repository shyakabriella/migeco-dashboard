import AdminSidebar from '../../AdminSidebar';
import Header from './components/Header';
import MetadataSidebar from './components/MetadataSidebar';
import { BulkUploadHeader, Dropzone, ImageCard } from './components/UploadComponents';

const IMAGES = [
  'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1449156006070-eb8545e8869c?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
];

function Bulk() {
  return (
    <div className="flex h-screen bg-[#06080d] text-gray-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      {/* Left Sidebar */}
      <AdminSidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-5xl mx-auto">
            <BulkUploadHeader />
            <Dropzone />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
              {[...Array(15)].map((_, i) => (
                <ImageCard 
                  key={i} 
                  id={String(i + 1).padStart(3, '0')} 
                  status={i % 3 === 0 ? 'scanned' : 'ready'}
                  image={IMAGES[i % IMAGES.length]} 
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar */}
      <MetadataSidebar />
    </div>
  );
}

export default Bulk;
