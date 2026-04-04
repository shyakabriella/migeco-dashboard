
import { Header } from './Header';
import { AccessRules } from './AccessRules';
import AdminSidebar from '../../AdminSidebar';


function Access() {
  return (
    <div className="flex h-screen bg-[#0a0c14] text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <AdminSidebar/>
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <AccessRules />
        </main>
      </div>
    </div>
  );
}

export default Access;
