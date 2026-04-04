import type { ReactNode } from "react";
import AdminSidebar from "../../AdminSidebar";

type NavItem = {
  label: string;
  icon: string;
  active?: boolean;
  hasChildren?: boolean;
  indented?: boolean;
};

type TocGroup = {
  title: string;
  items: string[];
  activeItem?: string;
};

const primaryNav: NavItem[] = [
  { label: "Dashboard", icon: "grid", hasChildren: true },
  { label: "Documents", icon: "folder", hasChildren: true },
  { label: "Upload & Digitization", icon: "upload" },
  { label: "Organization", icon: "nodes" },
  { label: "Search & Retrieval", icon: "search" },
  { label: "Version Control", icon: "clock" },
  { label: "Access & Permissions", icon: "lock", hasChildren: true },
  { label: "Reports", icon: "chart" },
  { label: "Audit & Logs", icon: "shield", hasChildren: true },
  { label: "Users Management", icon: "users", hasChildren: true },
  { label: "Settings", icon: "settings" },
  { label: "Help & Support", icon: "help", active: true, hasChildren: true },
  { label: "FAQs", icon: "dot", indented: true },
  { label: "User Manual", icon: "dot", active: true, indented: true },
  { label: "Submit Ticket", icon: "dot", indented: true },
];

const tocGroups: TocGroup[] = [
  {
    title: "1. Getting Started",
    items: ["System Requirements", "Logging In", "Navigating the Sidebar"],
  },
  {
    title: "2. Document Management",
    activeItem: "Managing Geological Records",
    items: [
      "Managing Geological Records",
      "Uploading Bulk Files",
      "Metadata Tagging",
      "Version Control",
    ],
  },
  {
    title: "3. Search & Retrieval",
    items: [],
  },
  {
    title: "4. Security & Permissions",
    items: [],
  },
];

const relatedArticles = [
  {
    badge: "GUIDE",
    title: "Importing Seismic Data",
    text: "Learn how to import and validate SEG-Y seismic data files in the viewer.",
  },
  {
    badge: "TROUBLESHOOTING",
    title: "Fixing Metadata Sync Errors",
    text: "Common solutions after record metadata fails to update across the network.",
  },
];

function Icon({ type, className = "h-4 w-4" }: { type: string; className?: string }) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "logo":
      return (
        <svg {...props}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
          <path d="M8 9h3" />
          <path d="M13 9h3" />
          <path d="M8 13h3" />
          <path d="M13 13h3" />
        </svg>
      );
    case "grid":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="6" height="6" rx="1.2" />
          <rect x="14" y="4" width="6" height="6" rx="1.2" />
          <rect x="4" y="14" width="6" height="6" rx="1.2" />
          <rect x="14" y="14" width="6" height="6" rx="1.2" />
        </svg>
      );
    case "folder":
      return (
        <svg {...props}>
          <path d="M4 7.5h5l2 2H20" />
          <path d="M4 7.5h16v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
        </svg>
      );
    case "upload":
      return (
        <svg {...props}>
          <path d="M12 16V6" />
          <path d="m8.5 9.5 3.5-3.5 3.5 3.5" />
          <path d="M5 18.5h14" />
        </svg>
      );
    case "nodes":
      return (
        <svg {...props}>
          <circle cx="6" cy="7" r="2" />
          <circle cx="18" cy="7" r="2" />
          <circle cx="12" cy="17" r="2" />
          <path d="M7.7 8.2 10.3 15" />
          <path d="M16.3 8.2 13.7 15" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.2-4.2" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8.8a4 4 0 0 1 8 0V11" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props}>
          <path d="M5 18.5h14" />
          <path d="M8 16V10" />
          <path d="M12 16V7" />
          <path d="M16 16v-4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 4.5 18 7v4.8c0 3.5-2.3 6.7-6 7.7-3.7-1-6-4.2-6-7.7V7z" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <circle cx="9" cy="9" r="3" />
          <circle cx="16.5" cy="10" r="2.5" />
          <path d="M4.5 18a5 5 0 0 1 9 0" />
          <path d="M14 18a4 4 0 0 1 5 0" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 4.5v2" />
          <path d="M12 17.5v2" />
          <path d="m5.6 6.1 1.4 1.4" />
          <path d="m17 17.5 1.4 1.4" />
          <path d="M4.5 12h2" />
          <path d="M17.5 12h2" />
          <path d="m5.6 17.9 1.4-1.4" />
          <path d="M17 6.5l1.4-1.4" />
        </svg>
      );
    case "help":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M9.7 9.4a2.8 2.8 0 1 1 4.6 2.2c-.9.7-1.6 1.2-1.6 2.4" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "download":
      return (
        <svg {...props}>
          <path d="M12 5v9" />
          <path d="m8.5 10.5 3.5 3.5 3.5-3.5" />
          <path d="M5 18.5h14" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v15H7.5A2.5 2.5 0 0 0 5 21z" />
          <path d="M5 6.5V19" />
          <path d="M9 8h6" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...props}>
          <path d="M12 4.5 13.3 8l3.2 1.3-3.2 1.3L12 14l-1.3-3.4L7.5 9.3 10.7 8z" />
          <path d="m18.5 4.8.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M8 18h8" />
          <path d="M10 20a2 2 0 0 0 4 0" />
          <path d="M6.5 16.5h11c-1.1-1.1-1.5-3-1.5-5V10a4 4 0 1 0-8 0v1.5c0 2-0.4 3.9-1.5 5Z" />
        </svg>
      );
    case "share":
      return (
        <svg {...props}>
          <circle cx="18" cy="6" r="2" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
          <path d="m7.8 11 8.4-4" />
          <path d="m7.8 13 8.4 4" />
        </svg>
      );
    case "link":
      return (
        <svg {...props}>
          <path d="M10.5 13.5 13.5 10.5" />
          <path d="M8 15a3.5 3.5 0 0 1 0-5l2-2a3.5 3.5 0 1 1 5 5l-.5.5" />
          <path d="M16 9a3.5 3.5 0 0 1 0 5l-2 2a3.5 3.5 0 1 1-5-5l.5-.5" />
        </svg>
      );
    case "info":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 10v5" />
          <path d="M12 7.5h.01" />
        </svg>
      );
    case "tip":
      return (
        <svg {...props}>
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path d="M12 3.8a5.5 5.5 0 0 0-3.7 9.6c.8.7 1.2 1.4 1.4 2.1h4.6c.2-.7.6-1.4 1.4-2.1A5.5 5.5 0 0 0 12 3.8Z" />
        </svg>
      );
    case "image":
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m6.5 16 3.5-3.5 2.5 2.5 2-2 3 3" />
        </svg>
      );
    case "caret":
      return (
        <svg {...props}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...props}>
          <path d="m8 10 4 4 4-4" />
        </svg>
      );
    case "dot":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}


function SectionStep({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-white/6 pt-8 first:border-t-0 first:pt-0 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
      <div className="flex items-start gap-3 lg:sticky lg:top-24">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-[11px] font-semibold text-slate-300">
          {number}
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <div>{children}</div>
    </section>
  );
}

export default function Manual() {
  return (
    <div className="flex h-screen bg-[#0a0c1a] text-white font-sans overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-[#1e2235] bg-[#0a0c1a]/85 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-white">User Manual</span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-2 text-xs text-[#8e97a4]">
                <Icon type="book" className="h-3.5 w-3.5" />
                Documentation Guide
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-[#1e2235] bg-[#12162a] px-3 py-2 text-[#8e97a4] sm:w-[320px]">
                <Icon type="search" className="h-4 w-4 shrink-0" />
                <input
                  aria-label="Search guide topics"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8e97a4]"
                  placeholder="Search user guide topics..."
                />
                <span className="rounded-md border border-[#1e2235] px-1.5 py-0.5 text-[10px] text-[#8e97a4]">/</span>
              </div>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e2235] bg-[#12162a] text-[#8e97a4] transition hover:text-white"
                aria-label="Notifications"
              >
                <Icon type="bell" className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-[#1e2235] bg-[#12162a] px-3 py-2">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-amber-400 to-orange-500 text-xs font-bold text-white">
                  AM
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#0a0c1a] bg-emerald-400" />
                </div>
                <div className="min-w-0 hidden sm:block">
                  <div className="truncate text-sm font-medium text-white">Alex Morgan</div>
                  <div className="truncate text-xs text-[#8e97a4]">Lead Geologist</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#0a0c1a]">
          <div className="flex">
            {/* Manual Sidebar - Table of Contents */}
            <aside className="w-[280px] border-r border-[#1e2235] bg-[#12162a] flex-shrink-0">
              <div className="h-full px-5 py-6">
                <div className="flex items-center justify-between pb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#8e97a4]">Table of contents</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {tocGroups.map((group) => (
                    <div key={group.title} className="space-y-2">
                      <button
                        className="flex w-full items-center justify-between rounded-lg py-1 text-left text-[13px] font-medium text-[#c0c7d1]"
                        type="button"
                      >
                        <span>{group.title}</span>
                        <Icon type="chevron" className="h-3.5 w-3.5 text-[#8e97a4]" />
                      </button>
                      {group.items.length > 0 ? (
                        <div className="space-y-1 border-l border-[#1e2235] pl-3">
                          {group.items.map((item) => {
                            const active = item === group.activeItem;

                            return (
                              <button
                                key={item}
                                className={[
                                  "block w-full rounded-lg px-2 py-2 text-left text-[12px] transition",
                                  active
                                    ? "bg-[#4f6bff]/15 text-white ring-1 ring-inset ring-[#4f6bff]/20"
                                    : "text-[#8e97a4] hover:bg-[#1a203a] hover:text-[#c0c7d1]",
                                ].join(" ")}
                                type="button"
                              >
                                {item}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-[#1e2235] bg-[#0a0c1a] p-3">
                  <div className="flex items-center justify-between text-[11px] text-[#8e97a4]">
                    <span>Storage</span>
                    <span className="font-medium text-[#c0c7d1]">78%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1e2235]">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-indigo-500 to-blue-400" />
                  </div>
                  <div className="mt-2 text-[10px] text-[#8e97a4]">Used 3.9 TB of 5 TB</div>
                  <button
                    type="button"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e2235] bg-[#0a0c1a] px-3 py-2 text-[12px] font-medium text-[#c0c7d1] transition hover:border-[#4f6bff]/30 hover:text-white"
                  >
                    <Icon type="download" className="h-3.5 w-3.5" />
                    Download PDF Manual
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[#0a0c1a]">
              <div className="px-6 py-8 lg:px-10">
                <div className="mx-auto max-w-5xl">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8e97a4]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>User Manual</span>
                      <span>/</span>
                      <span>Document Management</span>
                      <span>/</span>
                      <span className="font-medium text-[#c0c7d1]">Managing Geological Records</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8e97a4]">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e2235] bg-[#12162a] transition hover:text-white"
                        aria-label="Copy link"
                      >
                        <Icon type="link" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e2235] bg-[#12162a] transition hover:text-white"
                        aria-label="Share"
                      >
                        <Icon type="share" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-w-3xl space-y-4">
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      Managing Geological Records
                    </h1>
                    <p className="text-sm leading-7 text-[#8e97a4] sm:text-[15px]">
                      Geological records form the core of MIGECO&apos;s project database. This section explains
                      how to create, categorize, and archive survey logs and seismic datasets effectively
                      within the DMS structure.
                    </p>
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#4f6bff]/20 bg-[#4f6bff]/8 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4f6bff]/15 text-[#4f6bff]">
                        <Icon type="info" className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-indigo-100">Prerequisite</div>
                        <p className="mt-1 text-sm leading-6 text-[#c0c7d1]">
                          You must have either <span className="text-white">Editor</span> or{' '}
                          <span className="text-white">Project Manager</span> permissions to create new record
                          sets. View-only users cannot modify these entries.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-10">
                    <SectionStep number={1} title="Creating a New Record Entry">
                      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
                        <div className="space-y-3 text-sm leading-7 text-[#8e97a4]">
                          <p>
                            To start logging a new geological survey, navigate to the specific project folder
                            where the data belongs.
                          </p>
                          <ol className="space-y-1.5 text-[#8e97a4]">
                            <li>Click on the <span className="text-[#c0c7d1]">+ New</span> button in the top toolbar.</li>
                            <li>Select <span className="text-[#c0c7d1]">Geological Record</span> from the dropdown menu.</li>
                            <li>A modal window will appear requesting initial metadata.</li>
                          </ol>
                        </div>

                        <div className="rounded-2xl border border-[#1e2235] bg-[#12162a] p-3">
                          <div className="flex aspect-[1.25/1] items-center justify-center rounded-xl border border-[#1e2235] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1e2235] bg-[#0a0c1a] text-[#8e97a4]">
                              <Icon type="image" className="h-6 w-6" />
                            </div>
                          </div>
                          <p className="mt-3 text-[11px] leading-5 text-[#8e97a4]">
                            Figure 3.1: The <span className="text-[#c0c7d1]">&ldquo;New Record&rdquo;</span> button is located
                            in the top-right action bar.
                          </p>
                        </div>
                      </div>
                    </SectionStep>

                    <SectionStep number={2} title="Filling Mandatory Metadata">
                      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                        <p className="max-w-2xl text-sm leading-7 text-[#8e97a4]">
                          Accurate metadata is crucial for future retrieval. Ensure all fields marked with an
                          asterisk (*) are completed.
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
                          <div className="rounded-2xl border border-[#1e2235] bg-[#12162a] p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8e97a4]">
                              Survey Coordinates
                            </div>
                            <p className="mt-2 text-xs leading-5 text-[#8e97a4]">
                              Enter latitude/longitude or UTM coordinates. The system validates formatting
                              automatically.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-[#1e2235] bg-[#12162a] p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8e97a4]">
                              Depth Range
                            </div>
                            <p className="mt-2 text-xs leading-5 text-[#8e97a4]">
                              Specify the start and end depth in meters. Negative values indicate elevation
                              above sea level.
                            </p>
                          </div>
                        </div>
                      </div>
                    </SectionStep>

                    <SectionStep number={3} title="Attaching Raw Data Files">
                      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
                        <p className="text-sm leading-7 text-[#8e97a4]">
                          If you upload raw data files such as .LAS, .CSV, or .DLIS logs associated with
                          this record, they should follow the naming structure defined in the organization
                          guide.
                        </p>

                        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/8 p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                              <Icon type="tip" className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-amber-200">Pro Tip</div>
                              <p className="mt-1 text-xs leading-6 text-[#c0c7d1]">
                                Naming your files according to the <span className="text-indigo-300">MIGECO Naming Convention</span>{' '}
                                will allow the system to auto-populate some metadata fields.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SectionStep>
                  </div>

                  <div className="mt-12 border-t border-[#1e2235] pt-8">
                    <div className="text-center">
                      <div className="text-xs text-[#8e97a4]">Was this article helpful?</div>
                      <div className="mt-3 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          className="rounded-full border border-[#1e2235] bg-[#12162a] px-4 py-2 text-sm text-[#c0c7d1] transition hover:border-[#4f6bff]/30 hover:text-white"
                        >
                          👍 Yes
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-[#1e2235] bg-[#12162a] px-4 py-2 text-sm text-[#c0c7d1] transition hover:border-[#4f6bff]/30 hover:text-white"
                        >
                          👎 No
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    <div className="mb-4 text-sm font-semibold text-white">Related Articles</div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {relatedArticles.map((article) => (
                        <button
                          key={article.title}
                          type="button"
                          className="group rounded-2xl border border-[#1e2235] bg-[#12162a] p-5 text-left transition hover:border-[#4f6bff]/20 hover:bg-[#1a203a]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4f6bff]/80">
                                {article.badge}
                              </div>
                              <div className="mt-2 text-base font-medium text-white">{article.title}</div>
                              <p className="mt-2 max-w-md text-sm leading-6 text-[#8e97a4]">{article.text}</p>
                            </div>
                            <span className="mt-1 text-[#8e97a4] transition group-hover:text-[#c0c7d1]">
                              <Icon type="caret" className="h-4 w-4" />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </main>
      </div>
    </div>
  );
}
