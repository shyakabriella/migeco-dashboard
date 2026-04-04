import React, { useState } from 'react';
import AdminSidebar from '../../AdminSidebar';
import Topbar from './components/Topbar';
import DocumentsTable from './components/DocumentsTable';
import FileDetails from './components/FileDetails';

function SharedDoc() {
  const [activeSection, setActiveSection] = useState('shared');
  const [selectedFileId, setSelectedFileId] = useState<number | null>(1);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f1117]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Documents Table */}
          <DocumentsTable
            selectedId={selectedFileId}
            setSelectedId={setSelectedFileId}
          />

          {/* File Details Panel */}
          {selectedFileId !== null && (
            <FileDetails onClose={() => setSelectedFileId(null)} />
          )}
        </div>
      </div>
    </div>

  );
};

export default SharedDoc;
