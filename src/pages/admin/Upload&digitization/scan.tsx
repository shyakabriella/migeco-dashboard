import type { ReactNode, SVGProps } from "react";
import AdminSidebar from "../AdminSidebar";

type IconProps = SVGProps<SVGSVGElement>;

type NavItem = {
  label: string;
  icon: (props: IconProps) => ReactNode;
  active?: boolean;
  expanded?: boolean;
  children?: string[];
};

const primaryNav: NavItem[] = [
  {
    label: "Dashboard",
    icon: GridIcon,
    expanded: true,
    children: ["Overview", "My Tasks", "Recent Activity"],
  },
  { label: "Documents", icon: FolderIcon },
  {
    label: "Upload & Digitization",
    icon: UploadIcon,
    active: true,
    expanded: true,
    children: ["Upload", "Bulk", "Scan", "History"],
  },
  { label: "Organization", icon: BranchIcon },
  { label: "Search & Retrieval", icon: SearchIcon },
  { label: "Version Control", icon: RefreshIcon },
  { label: "Access & Permissions", icon: LockIcon },
];

const secondaryNav: NavItem[] = [
  { label: "Reports", icon: ReportIcon },
  { label: "Audit & Logs", icon: ClipboardIcon },
  { label: "Users Management", icon: UsersIcon },
  { label: "Settings", icon: GearIcon },
  { label: "Help & Support", icon: HelpIcon },
];

const quickTags = ["#urgent", "#confidential", "#invoice"];
const thumbnails = [
  { label: "7", active: true },
  { label: "landscape" },
  { label: "receipt" },
  { label: "+" },
];

export default function Scan() {
  return (
    <div className="min-h-screen bg-[#090d1d] text-slate-100">
      <div
        className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_32%),linear-gradient(180deg,_#11162c_0%,_#090d1d_60%,_#080b17_100%)]"
        style={{
          backgroundColor: "#090d1d",
        }}
      >
        <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
          <AdminSidebar />

          <div className="flex min-h-screen flex-col">
            <header className="border-b border-white/8 bg-[#11162b]/70 px-4 py-3 backdrop-blur-xl">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full max-w-xl">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    aria-label="Search"
                    defaultValue=""
                    placeholder="Search for documents, projects, or metadata..."
                    className="h-11 w-full rounded-xl border border-white/8 bg-white/[0.04] pl-10 pr-14 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-400/60"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    1K
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <button
                    type="button"
                    className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08]"
                  >
                    <BellIcon className="h-4 w-4" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.9)]" />
                  </button>

                  <div className="flex items-center gap-3 rounded-full border border-white/8 bg-white/[0.04] px-2 py-1.5">
                    <div className="text-right leading-tight">
                      <p className="text-xs font-medium text-white">Alex Morgan</p>
                      <p className="text-[10px] text-slate-400">Lead Ecologist</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-300 text-[10px] font-semibold text-slate-800">
                      AM
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <main className="grid flex-1 xl:grid-cols-[300px_minmax(0,1fr)_260px]">
              <section className="border-b border-white/8 bg-[#0f1327]/70 p-4 xl:border-b-0 xl:border-r">
                <div className="mx-auto max-w-md space-y-5 xl:max-w-none">
                  <div>
                    <h2 className="text-[17px] font-semibold text-white">Scanner Settings</h2>
                    <p className="mt-1 text-xs text-slate-500">Configure your digitization device.</p>
                  </div>

                  <PanelCard title="Select Device">
                    <div className="space-y-2">
                      <button
                        type="button"
                        className="flex h-11 w-full items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-3 text-left text-sm text-slate-200"
                      >
                        <span>MIGECO-FLOOR2-HP-25</span>
                        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                      </button>
                      <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Device Ready · Idle
                      </div>
                    </div>
                  </PanelCard>

                  <PanelCard title="Scan Profile">
                    <div className="grid grid-cols-3 gap-2">
                      <ProfileButton icon={<DocumentIcon className="h-4 w-4" />} label="Document" />
                      <ProfileButton active icon={<PhotoIcon className="h-4 w-4" />} label="Photo" />
                      <ProfileButton icon={<ReceiptIcon className="h-4 w-4" />} label="Receipt" />
                    </div>
                  </PanelCard>

                  <PanelCard title="Resolution (DPI)">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>72</span>
                        <span className="font-medium text-slate-200">300</span>
                        <span>1200</span>
                      </div>
                      <RangeSlider defaultValue={65} />
                    </div>
                  </PanelCard>

                  <PanelCard title="Color Mode">
                    <div className="grid grid-cols-3 gap-2">
                      <ChipButton label="B/W" />
                      <ChipButton label="Gray" />
                      <ChipButton label="Color" active />
                    </div>
                  </PanelCard>

                  <PanelCard title="Image Enhancement">
                    <div className="space-y-4">
                      <SliderRow label="Contrast" value="+10" defaultValue={58} />
                      <SliderRow label="Brightness" value="0" defaultValue={52} />
                    </div>
                  </PanelCard>

                  <PanelCard title="OCR Language">
                    <div className="space-y-3">
                      <button
                        type="button"
                        className="flex h-11 w-full items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-3 text-left text-sm text-slate-200"
                      >
                        <span>English (US)</span>
                        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                      </button>
                      <label className="flex items-center gap-2 text-[11px] text-slate-400">
                        <input
                          defaultChecked
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-white/12 bg-transparent accent-indigo-500"
                        />
                        Auto-detect orientation
                      </label>
                    </div>
                  </PanelCard>

                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.35)] transition hover:brightness-110"
                  >
                    <ScanIcon className="h-4 w-4" />
                    Start Scanning
                  </button>
                </div>
              </section>

              <section className="flex min-h-0 flex-col border-b border-white/8 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.08),_transparent_38%),linear-gradient(180deg,_#11162d_0%,_#0d1122_100%)] xl:border-b-0 xl:border-r">
                <div className="flex items-start justify-between border-b border-white/8 px-5 py-4">
                  <div>
                    <h2 className="text-[17px] font-semibold text-white">Scan Preview</h2>
                    <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-500">
                      Preview scanned pages before saving to the repository.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-slate-400">
                    <IconToolButton icon={<RotateLeftIcon className="h-4 w-4" />} />
                    <IconToolButton icon={<RotateRightIcon className="h-4 w-4" />} />
                    <span className="mx-1 text-slate-600">|</span>
                    <IconToolButton icon={<MinusIcon className="h-4 w-4" />} />
                    <span className="text-xs font-medium text-slate-300">45%</span>
                    <IconToolButton icon={<PlusIcon className="h-4 w-4" />} />
                    <IconToolButton icon={<ExpandIcon className="h-4 w-4" />} />
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-center p-6 md:p-10">
                  <div className="relative flex aspect-[0.72] w-full max-w-[360px] items-center justify-center rounded-[2px] border border-indigo-400/70 bg-white p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_28px_rgba(99,102,241,0.24),0_25px_80px_rgba(2,6,23,0.72)]">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.15),transparent_45%)]" />
                    <div className="relative flex h-full w-full items-center justify-center bg-[linear-gradient(90deg,#101813_0%,#121513_50%,#101813_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                      <span className="select-none text-[10rem] font-light leading-none tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.08)] md:text-[11rem]">
                        7
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/8 bg-[#171b31]/85 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {thumbnails.map((thumb, index) => (
                      <ThumbnailCard key={`${thumb.label}-${index}`} label={thumb.label} active={thumb.active} />
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-[#0f1327]/75 p-4">
                <div className="mx-auto max-w-md space-y-5 xl:max-w-none">
                  <div>
                    <h2 className="text-[17px] font-semibold text-white">Save Options</h2>
                  </div>

                  <PanelCard title="Filename Format">
                    <div className="space-y-2">
                      <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-3 text-sm text-slate-200">
                        2023-10-27_SiteScan_001
                      </div>
                      <p className="text-[10px] text-slate-500">Will generate: 2023-10-27_sitescan_001.pdf</p>
                    </div>
                  </PanelCard>

                  <PanelCard title="Output Format">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="rounded-xl border border-indigo-400/50 bg-indigo-500/20 px-3 py-3 text-center text-xs font-semibold text-indigo-200 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.15)]"
                      >
                        PDF (Searchable)
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-3 text-center text-xs font-medium text-slate-400"
                      >
                        JPG / PNG
                      </button>
                    </div>
                  </PanelCard>

                  <PanelCard title="Destination">
                    <div className="space-y-2 rounded-xl border border-white/8 bg-white/[0.04] p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <FolderIcon className="h-4 w-4 text-slate-400" />
                        Projects / Beta / Scans
                      </div>
                      <button type="button" className="text-[11px] font-medium text-indigo-300 transition hover:text-indigo-200">
                        Change location
                      </button>
                    </div>
                  </PanelCard>

                  <PanelCard title="Quick Tags">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {quickTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="rounded-lg border border-dashed border-white/12 px-3 py-2 text-[11px] font-medium text-slate-400 transition hover:border-indigo-400/40 hover:text-slate-200"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </PanelCard>

                  <div className="space-y-2 pt-48 xl:pt-56">
                    <button
                      type="button"
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.22)] transition hover:bg-emerald-400"
                    >
                      <SaveIcon className="h-4 w-4" />
                      Save to DMS
                    </button>
                    <button
                      type="button"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] text-sm font-medium text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Discard All
                    </button>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ item }: { item: NavItem }) {
  return (
    <div>
      <button
        type="button"
        className={[
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
          item.active
            ? "bg-indigo-500/18 text-indigo-200 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.15)]"
            : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
        ].join(" ")}
      >
        <item.icon className={item.active ? "h-4 w-4 text-indigo-300" : "h-4 w-4 text-slate-500"} />
        <span className="flex-1 text-[13px]">{item.label}</span>
        {item.children ? <ChevronDownIcon className="h-3.5 w-3.5 text-slate-500" /> : null}
      </button>
      {item.children ? (
        <div className="mt-1 ml-9 space-y-1 border-l border-white/6 pl-3">
          {item.children.map((child) => {
            const activeChild = item.active && child === "Scan";
            return (
              <button
                key={child}
                type="button"
                className={[
                  "block w-full rounded-lg px-2 py-1.5 text-left text-[12px] transition",
                  activeChild
                    ? "bg-white/[0.05] text-white"
                    : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300",
                ].join(" ")}
              >
                {child}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PanelCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-200">{title}</h3>
      <div className="rounded-2xl border border-white/8 bg-[#171b31]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
        {children}
      </div>
    </section>
  );
}

function ProfileButton({
  icon,
  label,
  active,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        "flex h-14 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-medium transition",
        active
          ? "border-indigo-400/45 bg-indigo-500/18 text-indigo-200"
          : "border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ChipButton({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={[
        "rounded-lg border px-3 py-2 text-xs font-medium transition",
        active
          ? "border-indigo-400/45 bg-indigo-500/18 text-indigo-200"
          : "border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function RangeSlider({ defaultValue }: { defaultValue: number }) {
  return (
    <input
      type="range"
      min={0}
      max={100}
      defaultValue={defaultValue}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-indigo-500"
    />
  );
}

function SliderRow({
  label,
  value,
  defaultValue,
}: {
  label: string;
  value: string;
  defaultValue: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span className="font-medium text-slate-300">{value}</span>
      </div>
      <RangeSlider defaultValue={defaultValue} />
    </div>
  );
}

function IconToolButton({ icon }: { icon: ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04] transition hover:bg-white/[0.08] hover:text-white"
    >
      {icon}
    </button>
  );
}

function ThumbnailCard({ label, active }: { label: string; active?: boolean }) {
  const isLandscape = label === "landscape";
  const isReceipt = label === "receipt";
  const isAdd = label === "+";

  return (
    <button
      type="button"
      className={[
        "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border text-xs font-medium transition",
        active
          ? "border-indigo-400/55 bg-white/[0.08] text-white shadow-[0_0_0_1px_rgba(99,102,241,0.35)]"
          : "border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200",
      ].join(" ")}
    >
      {active ? <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400" /> : null}
      {isLandscape ? (
        <div className="h-full w-full bg-[linear-gradient(135deg,#6a8c52,_#2f5d38_45%,_#7fb0da)]" />
      ) : isReceipt ? (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#2d334f,#1a1f37)]">
          <ReceiptIcon className="h-4 w-4 text-slate-300" />
        </div>
      ) : isAdd ? (
        <PlusIcon className="h-4 w-4" />
      ) : (
        <span className="text-2xl font-light text-white">{label}</span>
      )}
    </button>
  );
}

function GridIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </svg>
  );
}

function FolderIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
    </svg>
  );
}

function UploadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 17.5h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 8.5a4.5 4.5 0 0 0 0 9Z" />
      <path d="M12 7v8" />
      <path d="m8.5 10.5 3.5-3.5 3.5 3.5" />
    </svg>
  );
}

function BranchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H15.5" />
      <path d="M18 8.5v7" />
      <path d="M8.5 6c2 0 3.5 1.5 3.5 3.5V12" />
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function RefreshIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M20 11a8 8 0 1 0-2.34 5.66" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}

function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function ReportIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 19.5h12" />
      <path d="M8 16V10" />
      <path d="M12 16V6" />
      <path d="M16 16v-4" />
    </svg>
  );
}

function ClipboardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="6" y="5" width="12" height="16" rx="2" />
      <path d="M9 5.5h6" />
      <path d="M9 10h6" />
      <path d="M9 14h4" />
    </svg>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M16 19a4 4 0 0 0-8 0" />
      <circle cx="12" cy="9" r="3" />
      <path d="M19.5 18a3.5 3.5 0 0 0-2.3-3.28" />
      <path d="M17 6.5a2.5 2.5 0 1 1 0 5" />
    </svg>
  );
}

function GearIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m12 3 1.2 2.4 2.6.4-.9 2.5 1.8 1.8-1.8 1.8.9 2.5-2.6.4L12 21l-1.2-2.4-2.6-.4.9-2.5-1.8-1.8 1.8-1.8-.9-2.5 2.6-.4L12 3Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function HelpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.75 9a2.25 2.25 0 1 1 3.83 1.6c-.82.78-1.58 1.3-1.58 2.4" />
      <circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M15 17H5.5a1.5 1.5 0 0 1-1.2-2.4L6 12.5V10a6 6 0 1 1 12 0v2.5l1.7 2.1A1.5 1.5 0 0 1 18.5 17H15Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function DocumentIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
      <path d="M14 3.5V8h4" />
    </svg>
  );
}

function PhotoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m20 15-4.5-4.5L7 19" />
    </svg>
  );
}

function ReceiptIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 4h10v16l-2-1.5L13 20l-1-1.5L11 20l-2-1.5L7 20V4Z" />
      <path d="M9.5 8.5h5" />
      <path d="M9.5 12h5" />
    </svg>
  );
}

function ScanIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 8V5h3" />
      <path d="M18 8V5h-3" />
      <path d="M6 16v3h3" />
      <path d="M18 16v3h-3" />
      <path d="M4 12h16" />
    </svg>
  );
}

function RotateLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8 8H4V4" />
      <path d="M4 8a8 8 0 1 1-1 4" />
    </svg>
  );
}

function RotateRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M16 8h4V4" />
      <path d="M20 8a8 8 0 1 0 1 4" />
    </svg>
  );
}

function MinusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ExpandIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M9 4H4v5" />
      <path d="M15 4h5v5" />
      <path d="M9 20H4v-5" />
      <path d="M15 20h5v-5" />
    </svg>
  );
}

function SaveIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 4.5h11l3 3V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V4.5Z" />
      <path d="M8 4.5v5h7v-5" />
      <path d="M9 16h6" />
    </svg>
  );
}

function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 7h14" />
      <path d="M9 7V4h6v3" />
      <path d="M8 10v8" />
      <path d="M12 10v8" />
      <path d="M16 10v8" />
      <path d="M6 7l1 12a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 19l1-12" />
    </svg>
  );
}
