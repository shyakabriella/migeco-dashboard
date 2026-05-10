import {
  Search,
  FileText,
  Bell,
  History,
  MapPin,
  Database,
  SlidersHorizontal,
  Bookmark,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import AdminSidebar from "../AdminSidebar";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const searchTabs = [
  {
    label: "Smart Search",
    path: "/search",
    icon: Sparkles,
  },
  {
    label: "Advanced Filters",
    path: "/Advancedfilter",
    icon: SlidersHorizontal,
  },
  {
    label: "Saved Searches",
    path: "/SavedSearch",
    icon: Bookmark,
  },
];

export default function Smartsearch() {
  return (
    <div className="flex min-h-screen bg-[#0b0e14] font-sans text-gray-200">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#1e2532] px-8">
          <div>
            <h1 className="text-lg font-semibold">Search & Retrieval</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Smart search, advanced filters, and saved queries
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-400" />

            <div className="flex items-center gap-3 border-l border-[#1e2532] pl-4">
              <div className="text-right">
                <div className="text-sm font-medium">DMS User</div>
                <div className="text-xs text-gray-400">
                  Search Controller
                </div>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1e2532] bg-indigo-600/20 text-xs font-semibold text-white">
                DU
              </div>

              <ChevronDown size={14} className="text-gray-500" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <SearchRetrievalTabs />

          <div className="mx-auto mt-12 max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              <Search size={14} />
              Smart Search
            </div>

            <h2 className="mb-4 text-4xl font-bold">
              What are you looking for today?
            </h2>

            <p className="mb-8 text-gray-400">
              Search across technical documents, logs, reports, projects, and
              extracted document content.
            </p>

            <div className="relative mb-6">
              <Search
                className="absolute left-4 top-3.5 text-gray-500"
                size={20}
              />

              <input
                type="text"
                placeholder="Search by keywords, project ID, document code, or document content..."
                className="w-full rounded-xl border border-[#1e2532] bg-[#171c26] py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="mb-10 flex items-center justify-center gap-3 text-xs">
              <span className="text-gray-500">TRENDING SEARCHES:</span>

              {["Soil Density Report", "Site Alpha Maps", "Q3 Safety Logs"].map(
                (item) => (
                  <button
                    key={item}
                    className="flex items-center gap-1 rounded-full border border-[#1e2532] bg-[#171c26] px-3 py-1.5 text-blue-400 transition-colors hover:bg-[#1e2532]"
                  >
                    <span className="text-blue-500">↗</span>
                    {item}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
              <span className="text-[10px] leading-tight">
                RECENT
                <br />
                QUERIES:
              </span>

              <button className="flex items-center gap-2 rounded-full border border-[#1e2532] bg-[#171c26] px-3 py-2 hover:text-gray-300">
                <History size={14} />
                &quot;foundation crack analysis&quot;
              </button>

              <button className="flex items-center gap-2 rounded-full border border-[#1e2532] bg-[#171c26] px-3 py-2 hover:text-gray-300">
                <History size={14} />
                &quot;Gamma project budget&quot;
              </button>
            </div>
          </div>

          <div className="mt-20">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                ✨ Recommended for You
              </h3>

              <span className="rounded bg-[#171c26] px-3 py-1 text-xs text-gray-500">
                Based on recent geological surveys
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {[
                {
                  title: "Geotechnical Analysis 2023",
                  type: "REPORT",
                  icon: FileText,
                  color: "text-red-400",
                },
                {
                  title: "Sector 4 Topography",
                  type: "MAP",
                  icon: MapPin,
                  color: "text-blue-400",
                },
                {
                  title: "Q3 Excavation Logs",
                  type: "DATA",
                  icon: Database,
                  color: "text-green-400",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-[#1e2532] bg-[#171c26] p-5 transition-colors hover:border-blue-500/30"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <Icon className={item.color} size={24} />
                      <span className="text-[10px] font-bold tracking-wider text-gray-600">
                        {item.type}
                      </span>
                    </div>

                    <h4 className="mb-2 font-semibold">{item.title}</h4>

                    <p className="mb-6 text-xs leading-5 text-gray-400">
                      Comprehensive document recommendation from project records
                      and recent technical activity.
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-[10px]">
                          OC
                        </div>

                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#0b0e14] bg-gray-800 text-[10px]">
                          +{index * 2 + 1}
                        </div>
                      </div>

                      <span className="text-[10px] text-gray-500">
                        updated 2h ago
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SearchRetrievalTabs() {
  return (
    <div className="rounded-2xl border border-[#1e2532] bg-[#171c26] p-2">
      <div className="flex flex-wrap items-center gap-2">
        {searchTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === "/search"}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-gray-400 hover:bg-[#1e2532] hover:text-white"
                )
              }
            >
              <Icon size={16} />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}