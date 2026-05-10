import {
  Folder,
  Bell,
  List,
  Gavel,
  FlaskConical,
  Camera,
  MessageSquare,
  Shield,
  Plus,
  Database,
  ChevronDown,
  LayoutGrid,
  Settings2,
  FileText,
  PlusSquare,
  Search,
  Layers,
  MapPinned,
  Network,
  Building2,
  FolderOpen,
  UsersRound,
  Tags,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import AdminSidebar from "../../AdminSidebar";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const organizationButtons = [
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
    label: "All Types",
    path: "/Docalltype",
    icon: List,
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

export default function Categories() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0c14] font-sans text-gray-200 selection:bg-[#5848e0] selection:text-white">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1e2333] bg-[#0a0c14] px-8">
          <div className="flex items-center text-[13px]">
            <h1 className="mr-5 text-[15px] font-semibold tracking-wide text-white">
              Categories
            </h1>
            <span className="mr-5 text-[#3b4358]">|</span>
            <span className="text-[#8b949e]">Organization</span>
            <span className="mx-2 text-xs text-[#3b4358]">&gt;</span>
            <span className="text-[#8b949e]">Categories</span>
          </div>

          <div className="flex items-center gap-7">
            <div className="relative hidden w-72 md:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]"
              />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full rounded-lg border border-[#1e2333] bg-[#10131d] py-2 pl-9 pr-4 text-[13px] text-white outline-none placeholder:text-[#596273] focus:border-[#5848e0]/60"
              />
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-[#5848e0] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#6859e8]">
              <PlusSquare size={16} />
              Create New Category
            </button>

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

        <div className="flex-1 overflow-y-auto p-8">
          <OrganizationButtons />

          <section className="mb-8 overflow-hidden rounded-2xl border border-[#262d3d] bg-gradient-to-br from-[#181d29] via-[#11141e] to-[#0a0c14] p-7">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5848e0]/30 bg-[#5848e0]/10 px-3 py-1 text-xs font-medium text-[#b8b2ff]">
                <Folder size={14} />
                Organization / Categories
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white">
                Manage document categories
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#8b949e]">
                Categories help users classify documents before upload,
                scanning, OCR, encryption, search, and reporting. Use the
                buttons above to move between Organization modules without
                using sidebar submenus.
              </p>
            </div>
          </section>

          <div className="mb-8 grid grid-cols-3 gap-6">
            <div className="flex items-center justify-between rounded-xl border border-[#262d3d] bg-[#181d29] p-5">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
                  Total Categories
                </p>
                <p className="text-[28px] font-bold tracking-tight text-white">
                  12
                </p>
              </div>
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-[#4A85F6]/20 bg-[#4A85F6]/10">
                <Folder size={20} className="text-[#4A85F6]" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#262d3d] bg-[#181d29] p-5">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
                  Total Documents
                </p>
                <p className="text-[28px] font-bold tracking-tight text-white">
                  24,593
                </p>
              </div>
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-[#34D399]/20 bg-[#34D399]/10">
                <FileText size={20} className="text-[#34D399]" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#262d3d] bg-[#181d29] p-5">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
                  Storage Used
                </p>
                <p className="text-[28px] font-bold tracking-tight text-white">
                  3.9 TB
                </p>
              </div>
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-[#A78BFA]/20 bg-[#A78BFA]/10">
                <Database size={20} className="text-[#A78BFA]" />
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-semibold tracking-wide text-white">
                Primary Categories
              </h2>
              <p className="mt-1 text-[13px] text-[#8b949e]">
                Manage the main folders used to organize uploaded documents.
              </p>
            </div>

            <div className="flex rounded-lg border border-[#262d3d] bg-[#181d29] p-1">
              <button className="rounded-md border border-[#3b4358] bg-[#252b3d] p-1.5 text-white shadow-sm">
                <LayoutGrid size={15} />
              </button>
              <button className="rounded-md p-1.5 text-[#8b949e] transition-colors hover:text-white">
                <List size={15} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <CategoryCard
              title="Field Surveys"
              description="Site measurements, geological scans, and preliminary field records."
              files="4,285 files"
              updated="Updated 2h ago"
              color="#4A85F6"
              icon={<Folder size={20} className="text-[#4A85F6]" />}
            />

            <CategoryCard
              title="Legal Compliance"
              description="Regulatory permits, environmental assessments, and compliance documents."
              files="1,850 files"
              updated="Updated 1d ago"
              color="#FBBF24"
              icon={<Gavel size={20} className="text-[#FBBF24]" />}
            />

            <CategoryCard
              title="Engineering Specs"
              description="Structural blueprints, material specifications, and technical drawings."
              files="8,340 files"
              updated="Updated 5h ago"
              color="#34D399"
              icon={<Settings2 size={20} className="text-[#34D399]" />}
            />

            <CategoryCard
              title="Lab Reports"
              description="Soil composition analysis, water quality tests, and laboratory reports."
              files="3,100 files"
              updated="Updated 3d ago"
              color="#D946EF"
              icon={<FlaskConical size={20} className="text-[#D946EF]" />}
            />

            <CategoryCard
              title="Site Multimedia"
              description="Drone footage, site progression photos, and thermal imaging files."
              files="12,500 files"
              updated="Updated 12m ago"
              color="#F43F5E"
              icon={<Camera size={20} className="text-[#F43F5E]" />}
            />

            <CategoryCard
              title="Client Communications"
              description="Official correspondence, meeting minutes, and project communication files."
              files="945 files"
              updated="Updated 1w ago"
              color="#0EA5E9"
              icon={<MessageSquare size={20} className="text-[#0EA5E9]" />}
              wide
            />

            <CategoryCard
              title="Safety Protocols"
              description="HSE guidelines, incident reports, and safety training documents."
              files="420 files"
              updated="Updated 2d ago"
              color="#F97316"
              icon={<Shield size={20} className="text-[#F97316]" />}
            />

            <div className="col-span-4 mt-2">
              <button className="group flex w-full flex-col items-center justify-center gap-4 rounded-xl border-[1.5px] border-dashed border-[#262d3d] bg-[#0a0c14] py-12 transition-all hover:border-[#3b4358] hover:bg-[#11141e]">
                <span className="font-medium tracking-wide text-[#8b949e] transition-colors group-hover:text-white">
                  Create Category
                </span>

                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#262d3d] bg-[#181d29] transition-all group-hover:border-[#3b4358] group-hover:bg-[#252b3d]">
                  <Plus
                    size={20}
                    className="text-[#8b949e] transition-colors group-hover:text-white"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function OrganizationButtons() {
  return (
    <div className="mb-8 rounded-xl border border-[#262d3d] bg-[#181d29] p-2">
      <div className="flex flex-wrap items-center gap-2">
        {organizationButtons.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={`${item.label}-${item.path}`}
              to={item.path}
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
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function CategoryCard({
  title,
  description,
  files,
  updated,
  icon,
  color,
  wide = false,
}: {
  title: string;
  description: string;
  files: string;
  updated: string;
  icon: React.ReactNode;
  color: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex cursor-pointer flex-col rounded-xl border border-[#262d3d] bg-[#181d29] p-6 transition-colors hover:border-[#3b4358]",
        wide ? "col-span-2" : "col-span-1"
      )}
    >
      <div
        className="mb-5 flex h-[42px] w-[42px] items-center justify-center rounded-lg border"
        style={{
          backgroundColor: `${color}1A`,
          borderColor: `${color}33`,
        }}
      >
        {icon}
      </div>

      <h3 className="mb-2.5 text-[15px] font-semibold tracking-wide text-white">
        {title}
      </h3>

      <p
        className={cn(
          "mb-6 line-clamp-2 flex-1 pr-2 text-[13px] leading-relaxed text-[#8b949e]",
          wide ? "w-2/3" : ""
        )}
      >
        {description}
      </p>

      <div className="flex items-center justify-between border-t border-[#262d3d] pt-5 text-[11px] font-medium text-[#8b949e]">
        <div className="flex items-center gap-1.5">
          <FileText size={13} />
          <span>{files}</span>
        </div>
        <span>{updated}</span>
      </div>
    </div>
  );
}