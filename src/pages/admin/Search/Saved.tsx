import { useState } from "react";
import { Bell, ChevronDown, Search as SearchIcon, Filter, Play, Edit2, Trash2 } from 'lucide-react';
import AdminSidebar from "../AdminSidebar";

type SavedQuery = {
  id: number;
  title: string;
  lastRun: string;
  tags: string[];
  alertLabel: string;
  enabled: boolean;
  accent: string;
};

const savedQueriesSeed: SavedQuery[] = [
  {
    id: 1,
    title: "Soil Tests - Project Alpha",
    lastRun: "Last run: Today at 09:30 AM",
    tags: ["Type: Lab Result", "Project: Site Alpha", "Keyword: \"Soil Density\""],
    alertLabel: "Daily Summary",
    enabled: true,
    accent: "bg-blue-500/20 text-blue-400",
  },
  {
    id: 2,
    title: "Q3 Site Photos",
    lastRun: "Last run: Yesterday",
    tags: ["Type: Photo", "Date: Q3 2023"],
    alertLabel: "Off",
    enabled: false,
    accent: "bg-fuchsia-500/20 text-fuchsia-400",
  },
  {
    id: 3,
    title: "Critical Incident Reports",
    lastRun: "Last run: Oct 20, 2023",
    tags: ["Type: Report", "Tag: Critical", "Content: \"Safety Violation\""],
    alertLabel: "Instant Alert",
    enabled: true,
    accent: "bg-emerald-500/20 text-emerald-400",
  },
  {
    id: 4,
    title: "Project Beta Excavation Logs",
    lastRun: "Last run: Sep 15, 2023",
    tags: ["Project: Project Beta", "Type: Logs", "Dept: Engineering"],
    alertLabel: "Off",
    enabled: false,
    accent: "bg-amber-500/20 text-amber-400",
  },
];

const topMenu = [
  "Dashboard",
  "Documents",
  "Upload & Digitization",
  "Organization",
  "Search & Retrieval",
  "Version Control",
  "Access & Permissions",
  "Reports",
  "Audit & Logs",
  "Users Management",
  "Settings",
  "Help & Support",
];

const subMenu = ["Smart Search", "Advanced Filters", "Saved Searches"];

function Icon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SavedSearch() {
  const [savedQueries, setSavedQueries] = useState(savedQueriesSeed);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = savedQueries.filter((query) => {
    const bundle = `${query.title} ${query.tags.join(" ")}`.toLowerCase();
    return bundle.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-[#0b0e14] text-gray-200 font-sans overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#1e2532] flex items-center justify-between px-8 bg-[#0b0e14]/80 backdrop-blur-md z-10">
          <h1 className="font-semibold text-lg">Saved Searches & Alerts</h1>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-[#1e2532] rounded-lg transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0b0e14]" />
            </button>
            
            <div className="h-8 w-px bg-[#1e2532]" />

            <div className="flex items-center gap-3 pl-2 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-200 leading-none">Alex Morgan</p>
                <p className="text-xs text-gray-400 mt-1">Lead Geologist</p>
              </div>
              <img src="https://ui-avatars.com/api/?name=Alex+Morgan&background=random" className="w-9 h-9 rounded-full border-2 border-[#1e2532] group-hover:border-gray-600 transition-colors" alt="User" />
              <ChevronDown size={14} className="text-gray-500 group-hover:text-gray-300" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            <section>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-semibold text-gray-100">My Saved Queries</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Manage your frequently used search criteria and email alerts.
                  </p>
                </div>

                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
                  + Create New Search
                </button>
              </div>

              <div className="rounded-xl border border-[#1e2532] bg-[#171c26] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <label className="relative block w-full max-w-md">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <SearchIcon size={16} />
                    </span>
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Filter saved searches..."
                      className="w-full rounded-lg border border-[#1e2532] bg-[#171c26] py-2 pr-4 pl-10 text-sm text-gray-100 outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <button className="flex items-center gap-2 rounded-lg border border-[#1e2532] px-3 py-2 text-sm text-gray-300 transition hover:border-gray-600 hover:text-gray-100 hover:bg-[#1e2532]">
                    <Filter size={16} />
                    Sort
                  </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-[#1e2532]">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-[#0b0e14]/50 text-[11px] uppercase tracking-wider text-gray-400">
                      <tr>
                        <th className="px-5 py-3 font-medium">Search Title</th>
                        <th className="px-4 py-3 font-medium">Filters Applied</th>
                        <th className="px-4 py-3 font-medium">Email Alerts</th>
                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((query, idx) => (
                        <tr
                          key={query.id}
                          className="border-t border-[#1e2532] text-gray-200 transition-colors hover:bg-blue-500/5"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-start gap-3">
                              <span className={`mt-0.5 rounded-md px-1.5 py-1 ${query.accent}`}>
                                <SearchIcon size={12} />
                              </span>
                              <div>
                                <p className="font-medium text-gray-100">{query.title}</p>
                                <p className="text-xs text-gray-400">{query.lastRun}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                              {query.tags.map((tag) => (
                                <span key={tag} className="rounded-md border border-[#1e2532] px-2 py-1 bg-[#0b0e14]/30">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <button
                              onClick={() =>
                                setSavedQueries((current) =>
                                  current.map((item) =>
                                    item.id === query.id
                                      ? {
                                          ...item,
                                          enabled: !item.enabled,
                                          alertLabel: !item.enabled ? "Instant Alert" : "Off",
                                        }
                                      : item
                                  )
                                )
                              }
                              className="group"
                            >
                              <span
                                className={`relative block h-5 w-10 rounded-full p-0.5 transition-colors duration-200 ${
                                  query.enabled ? "bg-emerald-500" : "bg-gray-600"
                                }`}
                              >
                                <span
                                  className={`block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                                    query.enabled ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </span>
                              <span className="mt-1 block text-xs text-gray-400 group-hover:text-gray-300">{query.alertLabel}</span>
                            </button>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <div className="inline-flex gap-3 text-gray-400">
                              <button className="transition hover:text-gray-100 p-1 hover:bg-[#1e2532] rounded" aria-label="Run query">
                                <Play size={16} />
                              </button>
                              <button className="transition hover:text-gray-100 p-1 hover:bg-[#1e2532] rounded" aria-label="Edit query">
                                <Edit2 size={16} />
                              </button>
                              <button className="transition hover:text-red-400 p-1 hover:bg-[#1e2532] rounded" aria-label="Delete query">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between border-t border-[#1e2532] bg-[#0b0e14]/20 px-4 py-3 text-xs text-gray-400">
                    <p>Showing {filtered.length} saved searches</p>
                    <div className="flex items-center gap-2">
                      <button className="rounded-md border border-[#1e2532] px-2 py-1 text-gray-500 hover:bg-[#1e2532] transition">&lt;</button>
                      <button className="rounded-md bg-blue-600 px-2.5 py-1 text-white">1</button>
                      <button className="rounded-md border border-[#1e2532] px-2 py-1 text-gray-500 hover:bg-[#1e2532] transition">&gt;</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
