import AdminSidebar from "../AdminSidebar";

type IconProps = {
  className?: string;
};

type IconComponent = (props: IconProps) => React.ReactNode;

type NavItem = {
  label: string;
  active?: boolean;
  expanded?: boolean;
  children?: string[];
  icon: IconComponent;
};

type MetricCard = {
  title: string;
  value: string;
  subtitle?: string;
  accent: string;
  iconBg: string;
  icon: IconComponent;
};

type ChangeItem = {
  title: string;
  detail: string;
  meta: string;
  accent: string;
  icon: IconComponent;
};

type AccessLog = {
  user: string;
  initials: string;
  avatarBg: string;
  action: string;
  resource: string;
  date: string;
  result: "Allowed" | "Denied";
};

function GridIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </svg>
  );
}

function FolderIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2h7A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
      <path d="M3 9h18" />
    </svg>
  );
}

function UploadIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 19.5A2.5 2.5 0 0 0 7.5 22h9a2.5 2.5 0 0 0 2.5-2.5" />
    </svg>
  );
}

function LayersIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5z" />
      <path d="m4 12 8 4.5 8-4.5" />
      <path d="m4 16.5 8 4.5 8-4.5" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function LockIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function ReportIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M6 18V9" />
      <path d="M12 18V5" />
      <path d="M18 18v-7" />
    </svg>
  );
}

function AuditIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M7 4h10" />
      <path d="M9 2v4" />
      <path d="M15 2v4" />
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

function UsersIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M16.5 18.5a4.5 4.5 0 0 0-9 0" />
      <circle cx="12" cy="9" r="3" />
      <path d="M19.5 18.5a4 4 0 0 0-3-3.87" />
      <path d="M16.5 6.5a2.5 2.5 0 1 1 0 5" />
    </svg>
  );
}

function SettingsIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-.4-1 1.7 1.7 0 0 0-1-.5 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1-.4 1.7 1.7 0 0 0 .5-1A1.7 1.7 0 0 0 4.3 6.3l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 .4 1 1.7 1.7 0 0 0 1 .5 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1 .4h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1 .4 1.7 1.7 0 0 0-.6 1Z" />
    </svg>
  );
}

function HelpIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.36 1.65c-.65.74-1.36 1.14-1.82 1.65-.33.36-.54.74-.54 1.7" />
      <circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function PersonAddIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M15 19a4 4 0 0 0-8 0" />
      <circle cx="11" cy="9" r="3" />
      <path d="M19 8v6" />
      <path d="M16 11h6" />
    </svg>
  );
}

function SafeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 7v1" />
      <path d="M12 15v1" />
    </svg>
  );
}

function ShareIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="m8 11 8-4" />
      <path d="m8 13 8 4" />
    </svg>
  );
}

function PermissionIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M15 19a4 4 0 0 0-8 0" />
      <circle cx="11" cy="9" r="3" />
      <path d="M18 8v8" />
      <path d="M14 12h8" />
    </svg>
  );
}

function BellIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M6.5 9a5.5 5.5 0 1 1 11 0c0 6 2 7 2 7h-15s2-1 2-7" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function FilterIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 4v10" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function CrownIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m4 8 4.5 4L12 6l3.5 6L20 8l-2 9H6z" />
    </svg>
  );
}

function BanIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function KeyIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="8.5" cy="14.5" r="3.5" />
      <path d="M12 14.5h8" />
      <path d="M17 14.5v-2" />
      <path d="M20 14.5v-2" />
    </svg>
  );
}

function EyeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function FileDownloadIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M12 11v5" />
      <path d="m9.5 13.5 2.5 2.5 2.5-2.5" />
    </svg>
  );
}

function ExternalShareIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="17.5" cy="6.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
      <path d="m7.6 11.1 8.2-3.5" />
      <path d="m7.6 12.9 8.2 3.5" />
    </svg>
  );
}

function PencilIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m4 20 4.5-1 9-9-3.5-3.5-9 9z" />
      <path d="m13 5.5 3.5 3.5" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: GridIcon },
  { label: "Documents", icon: FolderIcon },
  { label: "Upload & Digitization", icon: UploadIcon },
  { label: "Organization", icon: LayersIcon },
  { label: "Search & Retrieval", icon: SearchIcon },
  { label: "Version Control", icon: ClockIcon },
  { label: "Access & Permissions", icon: LockIcon },
  {
    label: "Reports",
    icon: ReportIcon,
    active: true,
    expanded: true,
    children: [
      "Overview",
      "Document Usage Report",
      "Upload & Activity Report",
      "Department/Project Reports",
      "Versioning Report",
      "Access/Permission Report",
    ],
  },
  { label: "Audit & Logs", icon: AuditIcon },
  { label: "User management", icon: UsersIcon },
  { label: "Settings", icon: SettingsIcon },
];

const metricCards: MetricCard[] = [
  {
    title: "Access Requests",
    value: "142",
    subtitle: "Granted (118)        Denied (24)",
    accent: "from-cyan-400 to-sky-500",
    iconBg: "bg-indigo-500/12 text-indigo-300",
    icon: PersonAddIcon,
  },
  {
    title: "Sensitive Vault Access",
    value: "56",
    subtitle: "+8.5% vs last month",
    accent: "from-fuchsia-500 to-rose-500",
    iconBg: "bg-rose-500/12 text-rose-300",
    icon: SafeIcon,
  },
  {
    title: "Active Sharing Links",
    value: "203",
    subtitle: "-2.1% vs last month",
    accent: "from-amber-400 to-orange-500",
    iconBg: "bg-orange-500/12 text-orange-300",
    icon: ShareIcon,
  },
  {
    title: "Permission Changes",
    value: "18",
    subtitle: "Last change: 2h ago by Admin",
    accent: "from-violet-500 to-purple-500",
    iconBg: "bg-violet-500/12 text-violet-300",
    icon: PermissionIcon,
  },
];

const changeItems: ChangeItem[] = [
  {
    title: "Elevated to Admin",
    detail: "User: J. Doe",
    meta: "Changed by SuperAdmin • 2h ago",
    accent: "bg-amber-500/15 text-amber-300",
    icon: CrownIcon,
  },
  {
    title: "Access Revoked",
    detail: "User: M. Smith (Contractor)",
    meta: "Expired Contract • 5h ago",
    accent: "bg-rose-500/15 text-rose-300",
    icon: BanIcon,
  },
  {
    title: "Added to 'Geology'",
    detail: "User: K. Lee",
    meta: "Project Assignment • 1d ago",
    accent: "bg-indigo-500/15 text-indigo-300",
    icon: UsersIcon,
  },
  {
    title: "Password Reset",
    detail: "User: R. Gomez",
    meta: "Self-service • 1d ago",
    accent: "bg-emerald-500/15 text-emerald-300",
    icon: KeyIcon,
  },
];

const accessLogs: AccessLog[] = [
  {
    user: "Sarah Jenkins",
    initials: "SJ",
    avatarBg: "bg-fuchsia-600/90",
    action: "View",
    resource: "Project_Alpha_Specs.pdf",
    date: "May 28, 10:42 AM",
    result: "Allowed",
  },
  {
    user: "Guest User (Ext)",
    initials: "GU",
    avatarBg: "bg-slate-500/80",
    action: "Download",
    resource: "Confidential_Survey_2023.xls",
    date: "May 28, 09:15 AM",
    result: "Denied",
  },
  {
    user: "Mike Kovan",
    initials: "MK",
    avatarBg: "bg-indigo-600/90",
    action: "Share Link",
    resource: "Site_Photos_Batch_04.zip",
    date: "May 27, 04:30 PM",
    result: "Allowed",
  },
  {
    user: "Emma Liu",
    initials: "EL",
    avatarBg: "bg-purple-600/90",
    action: "Edit Metadata",
    resource: "Geotech_Report_Final_v2.docx",
    date: "May 27, 02:10 PM",
    result: "Allowed",
  },
];

const chartPoints = [
  [0, 136],
  [52, 130],
  [104, 148],
  [156, 112],
  [208, 96],
  [260, 104],
  [312, 116],
  [364, 58],
  [416, 102],
  [468, 30],
  [520, 126],
  [572, 18],
  [624, 72],
];

const chartPath = `M ${chartPoints
  .map(([x, y], index, arr) => {
    if (index === 0) return `${x} ${y}`;
    const [prevX, prevY] = arr[index - 1];
    const cp1x = prevX + (x - prevX) / 2;
    const cp1y = prevY;
    const cp2x = prevX + (x - prevX) / 2;
    const cp2y = y;
    return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
  })
  .join(" ")}`;

const chartArea = `${chartPath} L 624 176 L 0 176 Z`;

const actionIcons: Record<AccessLog["action"], IconComponent> = {
  View: EyeIcon,
  Download: FileDownloadIcon,
  "Share Link": ExternalShareIcon,
  "Edit Metadata": PencilIcon,
};

function MetricsSection() {
  return (
    <section className="grid gap-4 xl:grid-cols-4">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        const isFirst = index === 0;
        const isSecond = index === 1;
        const isThird = index === 2;
        return (
          <article
            key={card.title}
            className="rounded-2xl border border-white/8 bg-[#232943] px-4 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">{card.title}</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{card.value}</div>
              </div>
              <div className={`rounded-xl p-2 ${card.iconBg}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>

            {isFirst ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[11px] font-medium">
                  <span className="text-emerald-300">Granted (118)</span>
                  <span className="text-rose-300">Denied (24)</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/80">
                  <div className="flex h-full w-full">
                    <div className="w-[82%] bg-emerald-400" />
                    <div className="w-[18%] bg-rose-500" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-xs text-slate-400">
                {isSecond ? <span className="text-rose-300">↗ +8.5%</span> : null}
                {isThird ? <span className="text-emerald-300">↘ -2.1%</span> : null}
                {!isSecond && !isThird ? null : <span className="mx-1 text-slate-600">•</span>}
                <span>{card.subtitle}</span>
              </div>
            )}

            {!isFirst && !isSecond && !isThird ? (
              <div className="mt-4 text-xs text-slate-400">{card.subtitle}</div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

function ChartPanel() {
  return (
    <article className="rounded-2xl border border-white/8 bg-[#232943] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Document Sharing</h2>
          <p className="mt-1 text-sm text-slate-400">Internal vs External access distribution</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            Internal
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            External
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent px-4 pb-3 pt-4">
        <svg viewBox="0 0 624 176" className="h-[240px] w-full">
          <defs>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6073ff" />
              <stop offset="100%" stopColor="#4e5fff" />
            </linearGradient>
            <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5265ff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#5265ff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[22, 58, 94, 130, 166].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="624"
              y2={y}
              stroke="rgba(148,163,184,0.10)"
              strokeDasharray="4 7"
            />
          ))}

          <path d={chartArea} fill="url(#areaGlow)" />
          <path
            d={chartPath}
            fill="none"
            stroke="url(#lineGlow)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="mt-2 grid grid-cols-7 gap-2 text-center text-[11px] text-slate-500">
          {[
            ["Day 1", "Mon"],
            ["Day 5", "Tue"],
            ["Day 10", "Wed"],
            ["Day 15", "Thu"],
            ["Day 20", "Fri"],
            ["Day 25", "Sat"],
            ["Day 30", "Sun"],
          ].map(([day, label]) => (
            <div key={day} className="space-y-2">
              <div>{day}</div>
              <div className="text-slate-600">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function RecentChangesPanel() {
  return (
    <aside className="rounded-2xl border border-white/8 bg-[#232943] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
      <div>
        <h2 className="text-xl font-semibold text-white">Recent Permission Changes</h2>
        <p className="mt-1 text-sm text-slate-400">High-level modifications</p>
      </div>

      <div className="mt-5 space-y-3">
        {changeItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3 rounded-2xl bg-white/[0.02] px-3 py-3">
              <div className={`mt-0.5 rounded-full p-2 ${item.accent}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="mt-1 text-xs text-slate-400">{item.detail}</div>
                <div className="mt-1 text-[11px] text-slate-500">{item.meta}</div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function AccessLogTable() {
  return (
    <section className="rounded-2xl border border-white/8 bg-[#232943] shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
      <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Detailed Access Log</h2>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block w-full max-w-sm">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <SearchIcon className="h-4 w-4" />
            </span>
            <input
              placeholder="Search user or document..."
              className="h-11 w-full rounded-xl border border-white/8 bg-[#1c213d] pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400/35"
            />
          </label>
          <button className="rounded-lg border border-white/8 bg-[#1c213d] px-3 py-2 text-xs text-slate-400 transition hover:text-white">
            Filters
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/6 text-left text-[11px] uppercase tracking-[0.12em] text-slate-500">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Resource</th>
              <th className="px-5 py-3 font-medium">Timestamp</th>
              <th className="px-5 py-3 font-medium">Result</th>
              <th className="px-5 py-3 font-medium text-right">Response</th>
            </tr>
          </thead>
          <tbody>
            {accessLogs.map((entry) => {
              const ActionIcon = actionIcons[entry.action];
              return (
                <tr key={`${entry.user}-${entry.resource}`} className="border-b border-white/8 text-sm text-slate-200 transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold text-white ${entry.avatarBg}`}>
                        {entry.initials}
                      </div>
                      <span className="whitespace-nowrap">{entry.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <ActionIcon className="h-3.5 w-3.5" />
                      <span>{entry.action}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-200">{entry.resource}</td>
                  <td className="px-5 py-4 text-slate-400">{entry.date}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${
                        entry.result === "Allowed"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-300"
                      }`}
                    >
                      {entry.result}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200">
                      View Log
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Showing 1 to {Math.min(4, accessLogs.length)} of {accessLogs.length || 0} entries</p>
        <div className="flex items-center gap-2 self-end">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-[#1c213d] text-slate-500 transition hover:border-indigo-400/30 hover:text-white">
            <ChevronIcon className="h-4 w-4" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 transition ${
                page === 1
                  ? "border-indigo-400/20 bg-indigo-500 text-white shadow-[0_10px_24px_rgba(99,102,241,0.35)]"
                  : "border-white/8 bg-[#1c213d] text-slate-500 hover:border-indigo-400/30 hover:text-white"
              }`}
            >
              {page}
            </button>
          ))}
          <span className="px-1 text-slate-500">...</span>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-[#1c213d] text-slate-500 transition hover:border-indigo-400/30 hover:text-white">
            <ChevronIcon className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Accessreport() {
  return (
    <div className="min-h-screen bg-[#0c1022] text-slate-100">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <AdminSidebar />

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="border-b border-white/8 bg-[#11152d]/90 backdrop-blur flex-shrink-0">
            <div className="flex flex-col gap-4 px-5 py-4 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="font-semibold text-white">Reports</span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-2">
                  <LockIcon className="h-4 w-4" />
                  <span>Access & Permissions</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-slate-800/80 text-slate-300 transition hover:border-indigo-400/30 hover:text-white">
                  <BellIcon className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#11152d] bg-rose-500" />
                </button>

                <div className="hidden h-8 w-px bg-white/8 sm:block" />

                <button className="flex items-center gap-3 rounded-full border border-white/8 bg-slate-800/80 py-1.5 pl-1.5 pr-3 text-left transition hover:border-indigo-400/30 hover:bg-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-orange-100 to-slate-200 text-sm font-semibold text-slate-700">
                    AM
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-medium text-white">Alex Morgan</div>
                    <div className="text-xs text-slate-400">Lead Geologist</div>
                  </div>
                  <ChevronIcon className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>
          </header>

          <section className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-10 lg:py-8 custom-scrollbar">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">Access & Permission Report</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Security audit logs, permission changes, and access distribution analysis.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-slate-800/90 px-4 py-2.5 text-sm text-slate-300 shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition hover:border-indigo-400/30 hover:bg-slate-800">
                  <FilterIcon className="h-4 w-4" />
                  Filter
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(93,92,255,0.35)] transition hover:brightness-110">
                  <DownloadIcon className="h-4 w-4" />
                  Export Log
                </button>
              </div>
            </div>

            <MetricsSection />

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_294px]">
              <ChartPanel />
              <RecentChangesPanel />
            </div>

            <div className="mt-6">
              <AccessLogTable />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
