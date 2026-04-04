import AdminSidebar from '../../AdminSidebar';
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import ReportsTable from "./components/ReportsTable";

export default function Construction() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d1320] font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main panel with blue top border accent */}
      <div className="flex flex-col flex-1 overflow-hidden border-l-2 border-[#3b5bdb]">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          <StatsCards />
          <ReportsTable />
        </main>
      </div>
    </div>
  );
}
