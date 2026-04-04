
import AdminSidebar from '../../AdminSidebar';
import { Header } from './components/Header';
import { StatsGrid } from './components/StatsGrid';
import { TagCloud } from './components/TagCloud';
import { MergeSuggestions, AddTagForm } from './components/ActionCards';
import { TagsTable } from './components/TagsTable';

function Tags() {
  return (
    <div className="flex h-screen bg-[#0f0f1b] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-8">
            <section>
              <StatsGrid />
            </section>

            <section className="grid grid-cols-12 gap-8">
              <div className="col-span-8">
                <TagCloud />
              </div>
              <div className="col-span-4 flex flex-col h-full">
                <MergeSuggestions />
                <AddTagForm />
              </div>
            </section>

            <section className="pb-8">
              <TagsTable />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Tags;
