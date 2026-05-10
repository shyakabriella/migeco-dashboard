import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronDown,
  Database,
  FileText,
  Folder,
  FolderOpen,
  Layers,
  MapPinned,
  Network,
  Plus,
  Search,
  ShieldCheck,
  Tags,
  UsersRound,
} from "lucide-react";
import AdminSidebar from "../AdminSidebar";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const organizationTabs = [
  {
    label: "Categories",
    path: "/categories",
    icon: Folder,
  },
  {
    label: "Document Types",
    path: "/Docalltype",
    icon: Layers,
  },
  {
    label: "Geological",
    path: "/organization/geological",
    icon: MapPinned,
  },
  {
    label: "Geotechnical",
    path: "/organization/geotechnical",
    icon: Network,
  },
  {
    label: "Construction",
    path: "/organization/construction",
    icon: Building2,
  },
  {
    label: "Projects",
    path: "/Projects",
    icon: FolderOpen,
  },
  {
    label: "Departments",
    path: "/Department",
    icon: UsersRound,
  },
  {
    label: "Tags",
    path: "/Tags",
    icon: Tags,
  },
];

const moduleCards = [
  {
    title: "Categories",
    path: "/categories",
    description: "Create and manage categories for uploaded documents.",
    icon: Folder,
    color: "#4A85F6",
  },
  {
    title: "Document Types",
    path: "/Docalltype",
    description: "Manage all document type groups used in the DMS.",
    icon: Layers,
    color: "#A78BFA",
  },
  {
    title: "Geological",
    path: "/organization/geological",
    description: "Organize geological reports, maps, and survey documents.",
    icon: MapPinned,
    color: "#D946EF",
  },
  {
    title: "Geotechnical",
    path: "/organization/geotechnical",
    description: "Manage geotechnical reports, soil tests, and field data.",
    icon: Network,
    color: "#0EA5E9",
  },
  {
    title: "Construction",
    path: "/organization/construction",
    description: "Manage construction drawings, site records, and reports.",
    icon: Building2,
    color: "#34D399",
  },
  {
    title: "Projects",
    path: "/Projects",
    description: "Create projects first, then upload documents under them.",
    icon: FolderOpen,
    color: "#FBBF24",
  },
  {
    title: "Departments",
    path: "/Department",
    description: "Manage departments that own and control documents.",
    icon: UsersRound,
    color: "#F97316",
  },
  {
    title: "Tags",
    path: "/Tags",
    description: "Manage tags used for search, filtering, and reporting.",
    icon: Tags,
    color: "#F43F5E",
  },
];

export default function Organization() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0c14] font-sans text-gray-200 selection:bg-[#5848e0] selection:text-white">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1e2333] bg-[#0a0c14] px-8">
          <div className="flex items-center text-[13px]">
            <h1 className="mr-5 text-[15px] font-semibold tracking-wide text-white">
              Organization
            </h1>
            <span className="mr-5 text-[#3b4358]">|</span>
            <span className="text-[#8b949e]">Home</span>
            <span className="mx-2 text-xs text-[#3b4358]">&gt;</span>
            <span className="text-[#8b949e]">Organization</span>
          </div>

          <div className="flex items-center gap-7">
            <div className="relative hidden w-72 md:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]"
              />
              <input
                type="text"
                placeholder="Search organization modules..."
                className="w-full rounded-lg border border-[#1e2333] bg-[#10131d] py-2 pl-9 pr-4 text-[13px] text-white outline-none placeholder:text-[#596273] focus:border-[#5848e0]/60"
              />
            </div>

            <button className="relative text-[#8b949e] transition-colors hover:text-white">
              <Bell size={18} />
              <span className="absolute -top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0a0c14]" />
            </button>

            <div className="flex cursor-pointer items-center gap-3 border-l border-[#1e2333] pl-6">
              <div className="text-right">
                <p className="text-[13px] font-semibold leading-tight tracking-wide text-white">
                  DMS User
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-[#8b949e]">
                  Organization Controller
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1e2333] bg-[#5848e0]/20 text-xs font-semibold text-white">
                DU
              </div>

              <ChevronDown size={14} className="ml-1 text-[#8b949e]" />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <OrganizationTabs />

          <div className="mb-8 overflow-hidden rounded-2xl border border-[#262d3d] bg-gradient-to-br from-[#181d29] via-[#11141e] to-[#0a0c14] p-8">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5848e0]/30 bg-[#5848e0]/10 px-3 py-1 text-xs font-medium text-[#b8b2ff]">
                <Building2 size={14} />
                Organization Center
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white">
                Manage how documents are organized
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#8b949e]">
                Use this page to manage categories, document types, projects,
                departments, and tags. This keeps project documents easy to
                upload, scan, search, retrieve, and report.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/Projects"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#5848e0] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#6859e8]"
                >
                  <FolderOpen size={16} />
                  Open Projects
                </Link>

                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#262d3d] bg-[#181d29] px-4 py-2.5 text-[13px] font-medium text-[#8b949e] transition-colors hover:bg-[#252b3d] hover:text-white"
                >
                  <Plus size={16} />
                  Manage Categories
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <SummaryCard
              title="Organization Modules"
              value="8"
              icon={<Building2 size={20} className="text-[#4A85F6]" />}
              color="#4A85F6"
            />

            <SummaryCard
              title="Project Workflow"
              value="Project First"
              icon={<FolderOpen size={20} className="text-[#34D399]" />}
              color="#34D399"
            />

            <SummaryCard
              title="Security Structure"
              value="Controlled"
              icon={<ShieldCheck size={20} className="text-[#A78BFA]" />}
              color="#A78BFA"
            />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-semibold tracking-wide text-white">
                Organization Modules
              </h2>
              <p className="mt-1 text-[13px] text-[#8b949e]">
                These buttons replace the old sidebar submenu.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {moduleCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.path}
                  to={card.path}
                  className="group flex flex-col rounded-xl border border-[#262d3d] bg-[#181d29] p-6 transition-colors hover:border-[#3b4358]"
                >
                  <div
                    className="mb-5 flex h-[42px] w-[42px] items-center justify-center rounded-lg border"
                    style={{
                      backgroundColor: `${card.color}1A`,
                      borderColor: `${card.color}33`,
                    }}
                  >
                    <Icon size={20} style={{ color: card.color }} />
                  </div>

                  <h3 className="mb-2.5 text-[15px] font-semibold tracking-wide text-white">
                    {card.title}
                  </h3>

                  <p className="mb-6 flex-1 pr-2 text-[13px] leading-relaxed text-[#8b949e]">
                    {card.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-[#262d3d] pt-5 text-[11px] font-medium text-[#8b949e]">
                    <div className="flex items-center gap-1.5">
                      <FileText size={13} />
                      <span>Open module</span>
                    </div>
                    <span className="transition-colors group-hover:text-white">
                      View →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <section className="mt-8 rounded-xl border border-[#262d3d] bg-[#181d29] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-[#34D399]/20 bg-[#34D399]/10">
                <Database size={20} className="text-[#34D399]" />
              </div>

              <div>
                <h2 className="text-[17px] font-semibold tracking-wide text-white">
                  Recommended Process
                </h2>
                <p className="text-[13px] text-[#8b949e]">
                  This is how users should use the organization module.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <ProcessStep
                number="01"
                title="Create Project"
                text="Start by creating a project or site."
              />

              <ProcessStep
                number="02"
                title="Prepare Categories"
                text="Create categories and document types."
              />

              <ProcessStep
                number="03"
                title="Upload Documents"
                text="Upload files under the correct project."
              />

              <ProcessStep
                number="04"
                title="Search & Report"
                text="Use tags and project filters for reporting."
              />
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function OrganizationTabs() {
  return (
    <div className="mb-8 rounded-xl border border-[#262d3d] bg-[#181d29] p-2">
      <div className="flex flex-wrap items-center gap-2">
        {organizationTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all",
                  isActive
                    ? "bg-[#5848e0] text-white shadow-lg shadow-[#5848e0]/20"
                    : "text-[#8b949e] hover:bg-[#252b3d] hover:text-white"
                )
              }
            >
              <Icon size={15} />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#262d3d] bg-[#181d29] p-5">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
          {title}
        </p>
        <p className="text-[24px] font-bold tracking-tight text-white">
          {value}
        </p>
      </div>

      <div
        className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border"
        style={{
          backgroundColor: `${color}1A`,
          borderColor: `${color}33`,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-[#262d3d] bg-[#0a0c14]/50 p-4">
      <p className="mb-3 text-[11px] font-bold text-[#5848e0]">{number}</p>
      <h3 className="text-[14px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[12px] leading-5 text-[#8b949e]">{text}</p>
    </div>
  );
}