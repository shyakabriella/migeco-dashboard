import { NavLink } from "react-router-dom";
import {
  UploadCloud,
  CheckCircle2,
  ScanLine,
  History,
  FileUp,
  FolderUp,
  Search,
  Bell,
  ChevronDown,
  X,
  FileText,
  Image as ImageIcon,
  FileArchive,
} from "lucide-react";
import AdminSidebar from "../../AdminSidebar";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const uploadTabs = [
  {
    label: "Bulk Upload",
    path: "/upload&digitization",
    icon: FolderUp,
  },
  {
    label: "Single Upload",
    path: "/upload&digitization/upload",
    icon: UploadCloud,
  },
  {
    label: "Scan",
    path: "/upload&digitization/scan",
    icon: ScanLine,
  },
  {
    label: "History",
    path: "/upload&digitization/history",
    icon: History,
  },
];

const previewFiles = [
  {
    id: "001",
    status: "scanned" as const,
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "002",
    status: "scanned" as const,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "003",
    status: "ready" as const,
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "004",
    status: "ready" as const,
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Bulk() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f111a] text-slate-300">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopHeader />

        <section className="custom-scrollbar flex-1 overflow-y-auto p-6">
          <UploadDigitizationTabs />

          <BulkUploadHeader />

          <SecurityNotice />

          <Dropzone />

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Prepared Batch Files
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Files will be uploaded into quarantine, scanned, then attached
                to selected projects.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-[#151926] px-3 py-2 text-xs text-gray-400">
              <FileUp size={15} className="text-indigo-400" />
              4 files ready
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {previewFiles.map((file) => (
              <ImageCard
                key={file.id}
                id={file.id}
                status={file.status}
                image={file.image}
              />
            ))}
          </div>

          <BatchMetadataPanel />
        </section>
      </main>
    </div>
  );
}

function TopHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-[#0f111a] px-8">
      <div className="relative hidden w-80 md:block">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="text"
          placeholder="Search upload batches..."
          className="w-full rounded-full border border-slate-800 bg-[#0a0c14] py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/60"
        />
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          className="relative text-slate-400 transition hover:text-white"
        >
          <Bell size={20} />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-[#0f111a] bg-red-500" />
        </button>

        <div className="flex cursor-pointer items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium leading-tight text-white">
              DMS User
            </div>
            <div className="text-xs text-slate-500">Upload Controller</div>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-indigo-600/20 text-xs font-semibold text-white">
            DU
          </div>

          <ChevronDown size={16} className="text-slate-500" />
        </div>
      </div>
    </header>
  );
}

function UploadDigitizationTabs() {
  return (
    <div className="mb-6 rounded-2xl border border-gray-800 bg-[#151926] p-2">
      <div className="flex flex-wrap items-center gap-2">
        {uploadTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === "/upload&digitization"}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
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

export const BulkUploadHeader = () => (
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-white">Bulk Upload</h1>
      <p className="text-sm text-gray-500">
        Manage and tag large batches of project files.
      </p>
    </div>

    <div className="flex gap-3">
      <button className="px-5 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white">
        Cancel
      </button>

      <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        <UploadCloud size={18} />
        Start Upload
      </button>
    </div>
  </div>
);

function SecurityNotice() {
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-200">
          <UploadCloud size={17} />
          Step 1: Upload Batch
        </div>
        <p className="text-xs leading-5 text-indigo-100/70">
          Files are prepared and uploaded as one batch.
        </p>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-200">
          <ScanLine size={17} />
          Step 2: Quarantine & Scan
        </div>
        <p className="text-xs leading-5 text-yellow-100/70">
          Files are not trusted until antivirus scanning is completed.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-200">
          <CheckCircle2 size={17} />
          Step 3: Ready
        </div>
        <p className="text-xs leading-5 text-emerald-100/70">
          Clean files become available for OCR, encryption, search, and AI.
        </p>
      </div>
    </div>
  );
}

export const Dropzone = () => (
  <div className="group relative mb-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-800 bg-[#0a0c14]/30 py-16 transition-all hover:border-indigo-600/50">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-500 transition-transform group-hover:scale-110">
      <UploadCloud size={32} />
    </div>

    <h3 className="mb-1 text-xl font-semibold text-white">
      Drag & Drop files here
    </h3>

    <p className="text-sm text-gray-500">
      or{" "}
      <span className="cursor-pointer text-indigo-400 hover:underline">
        browse files
      </span>{" "}
      from your computer
    </p>

    <p className="mt-6 text-[11px] text-gray-600">
      Supports JPG, PNG, PDF, DWG (Max 500MB per batch)
    </p>
  </div>
);

export const ImageCard = ({
  id,
  status,
  image,
}: {
  id: string;
  status: "ready" | "scanned";
  image: string;
}) => (
  <div className="group overflow-hidden rounded-xl border border-gray-800 bg-[#151926] transition-all hover:border-indigo-500">
    <div className="relative aspect-video">
      <img
        src={image}
        alt={`Upload ${id}`}
        className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
      />

      <div className="absolute left-2 top-2">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600 shadow-lg border border-indigo-400">
          <CheckCircle2 size={12} className="text-white" />
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-1",
          status === "scanned" ? "bg-green-500" : "bg-yellow-500"
        )}
      />
    </div>

    <div className="p-3">
      <div className="mb-1 flex items-start justify-between">
        <div>
          <p className="w-32 truncate text-[11px] font-medium text-white">
            IMG_2023102_{id}.jpg
          </p>
          <p className="text-[10px] text-gray-500">2.4 MB</p>
        </div>

        {status === "scanned" ? (
          <CheckCircle2 size={14} className="text-green-500" />
        ) : (
          <ScanLine size={14} className="text-yellow-400" />
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <div className="flex flex-1 flex-col items-center justify-center rounded border border-indigo-900/30 bg-indigo-900/10 px-2 py-1">
          <span className="text-[8px] font-bold uppercase text-indigo-400">
            OCR
          </span>
          <span className="text-[9px] text-indigo-300">Ready</span>
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col items-center justify-center rounded px-2 py-1",
            status === "scanned"
              ? "border border-green-900/30 bg-green-900/10"
              : "border border-yellow-900/30 bg-yellow-900/10"
          )}
        >
          <span
            className={cn(
              "text-[9px] font-medium",
              status === "scanned" ? "text-green-400" : "text-yellow-400"
            )}
          >
            {status === "scanned" ? "Scanned" : "Ready"}
          </span>
        </div>
      </div>
    </div>
  </div>
);

function BatchMetadataPanel() {
  return (
    <div className="mt-8 rounded-2xl border border-gray-800 bg-[#151926] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Batch Metadata</h2>
          <p className="mt-1 text-sm text-gray-500">
            Apply common information to all files in this batch.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg border border-gray-800 p-2 text-gray-500 hover:bg-gray-800 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <FieldCard
          icon={<FileText size={17} />}
          label="Document Type"
          value="Technical Drawing"
        />

        <FieldCard
          icon={<ImageIcon size={17} />}
          label="Processing"
          value="OCR + Scan"
        />

        <FieldCard
          icon={<FileArchive size={17} />}
          label="Security"
          value="Internal"
        />

        <FieldCard
          icon={<FolderUp size={17} />}
          label="Destination"
          value="Project Archive"
        />
      </div>
    </div>
  );
}

function FieldCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0a0c14]/40 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
        <span className="text-indigo-400">{icon}</span>
        {label}
      </div>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}