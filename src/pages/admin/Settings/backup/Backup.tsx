import AdminSidebar from '../../AdminSidebar';
import Topbar from "./components/Topbar";
import BackupRestore from "./components/BackupRestore";

export default function Backup() {
  return (
    <div className="flex h-screen bg-[#0b0c14] overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <BackupRestore />
      </div>
    </div>
  );
}
