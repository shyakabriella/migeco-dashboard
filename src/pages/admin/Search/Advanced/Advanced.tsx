import { useState } from "react";
import AdminSidebar from '../../AdminSidebar';
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import SearchResults from "./components/SearchResults";

export default function Advancedfilter() {
  const [searchWithinContent, setSearchWithinContent] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [keyword, setKeyword] = useState("soil");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("Relevance");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d1117] text-white">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          <FilterPanel
            searchWithinContent={searchWithinContent}
            setSearchWithinContent={setSearchWithinContent}
            includeArchived={includeArchived}
            setIncludeArchived={setIncludeArchived}
            keyword={keyword}
            setKeyword={setKeyword}
          />
          <SearchResults
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </main>
      </div>
    </div>
  );
}
