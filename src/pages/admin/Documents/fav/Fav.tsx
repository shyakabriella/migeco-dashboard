import { useState } from "react";
import AdminSidebar from '../../AdminSidebar';
import TopBar from "./components/TopBar";
import MainContent from "./components/MainContent";
import FileDetails from "./components/FileDetails";

export default function Favorite() {
  const [selectedFile, setSelectedFile] = useState<string | null>(
    "Geo_Survey_Site_Alpha_Final.pdf"
  );
  const [checkedFiles, setCheckedFiles] = useState<string[]>([
    "Geo_Survey_Site_Alpha_Final.pdf",
  ]);

  const toggleCheck = (name: string) => {
    setCheckedFiles((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1a1f2e] text-white font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Content Row */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center Content */}
          <MainContent
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            checkedFiles={checkedFiles}
            toggleCheck={toggleCheck}
          />

          {/* File Details Panel */}
          {selectedFile && (
            <FileDetails
              fileName={selectedFile}
              onClose={() => setSelectedFile(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
