import { useState } from "react";
import AdminSidebar from '../../AdminSidebar';
import TopBar from "./components/TopBar";
import MainContent from "./components/MainContent";
import DeletedFileDetails from "./components/DeletedFileDetails";

export default function Archive() {
  const [selectedFile, setSelectedFile] = useState<string | null>("Old_Survey_Draft_v1.pdf");
  const [checkedFiles, setCheckedFiles] = useState<string[]>(["Old_Survey_Draft_v1.pdf"]);

  const toggleCheck = (name: string) => {
    setCheckedFiles((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex h-screen w-screen bg-[#0f1117] text-white overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <MainContent
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            checkedFiles={checkedFiles}
            toggleCheck={toggleCheck}
          />
          {selectedFile && (
            <DeletedFileDetails
              fileName={selectedFile}
              onClose={() => setSelectedFile(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
