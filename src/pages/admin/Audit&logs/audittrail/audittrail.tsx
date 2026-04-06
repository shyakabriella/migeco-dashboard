import { type ReactNode, useMemo, useState } from "react";
import { cn } from "../../../../../../../src/utils/cn"
import AdminSidebar from "../../AdminSidebar";

type AuditAction = "Opened" | "Edited" | "Downloaded";

type AuditRecord = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  initials: string;
  avatarClassName: string;
  action: AuditAction;
  fileName: string;
  project: string;
  ipAddress: string;
};

type SidebarItem = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  hasChevron?: boolean;
  children?: string[];
  activeChild?: string;
};

const records: AuditRecord[] = [
  {
    id: "AUD-1001",
    timestamp: "2023-10-24T14:32:05",
    user: "John Doe",
    role: "Site Engineer",
    initials: "JD",
    avatarClassName: "from-indigo-500 to-blue-500",
    action: "Opened",
    fileName: "Site_A_Survey_Report.pdf",
    project: "PRJ-Alpha",
    ipAddress: "192.168.1.102",
  },
  {
    id: "AUD-1002",
    timestamp: "2023-10-24T14:15:11",
    user: "M. Ross",
    role: "Geologist",
    initials: "MR",
    avatarClassName: "from-fuchsia-500 to-violet-500",
    action: "Edited",
    fileName: "Soil_Samples_Log_Q3.docx",
    project: "PRJ-Beta",
    ipAddress: "192.168.1.45",
  },
  {
    id: "AUD-1003",
    timestamp: "2023-10-24T13:48:02",
    user: "Sarah K.",
    role: "Compliance",
    initials: "SK",
    avatarClassName: "from-pink-500 to-rose-500",
    action: "Downloaded",
    fileName: "Q3_Financials_Archive.zip",
    project: "FIN-2023",
    ipAddress: "10.0.5.22",
  },
  {
    id: "AUD-1004",
    timestamp: "2023-10-24T13:30:45",
    user: "David L.",
    role: "Contractor",
    initials: "DL",
    avatarClassName: "from-cyan-500 to-sky-500",
    action: "Opened",
    fileName: "Aerial_View_Sector_7.jpg",
    project: "PRJ-Alpha",
    ipAddress: "203.0.113.88",
  },
  {
    id: "AUD-1005",
    timestamp: "2023-10-24T12:15:33",
    user: "John Doe",
    role: "Site Engineer",
    initials: "JD",
    avatarClassName: "from-indigo-500 to-blue-500",
    action: "Edited",
    fileName: "Material_Costs_v4.xlsx",
    project: "PRJ-Gamma",
    ipAddress: "192.168.1.102",
  },
  {
    id: "AUD-1006",
    timestamp: "2023-10-24T11:05:10",
    user: "R. James",
    role: "Auditor",
    initials: "RJ",
    avatarClassName: "from-violet-500 to-indigo-600",
    action: "Opened",
    fileName: "Safety_Protocol_Internal.pdf",
    project: "GEN-Docs",
    ipAddress: "172.16.254.1",
  },
  {
    id: "AUD-1007",
    timestamp: "2023-10-24T10:55:00",
    user: "John Doe",
    role: "Site Engineer",
    initials: "JD",
    avatarClassName: "from-indigo-500 to-blue-500",
    action: "Downloaded",
    fileName: "Blueprint_Block_C.pdf",
    project: "PRJ-Alpha",
    ipAddress: "192.168.1.102",
  },
  {
    id: "AUD-1008",
    timestamp: "2023-10-23T17:08:19",
    user: "Alex Morgan",
    role: "Lead Geologist",
    initials: "AM",
    avatarClassName: "from-amber-400 to-orange-500",
    action: "Opened",
    fileName: "Mineral_Deposit_Model_Rev2.pptx",
    project: "GEO-Atlas",
    ipAddress: "10.11.3.40",
  },
  {
    id: "AUD-1009",
    timestamp: "2023-10-23T16:42:11",
    user: "Lina Perez",
    role: "Project Admin",
    initials: "LP",
    avatarClassName: "from-emerald-500 to-green-500",
    action: "Edited",
    fileName: "Vendor_Compliance_Checklist.xlsx",
    project: "OPS-204",
    ipAddress: "172.31.8.14",
  },
  {
    id: "AUD-1010",
    timestamp: "2023-10-23T15:17:28",
    user: "Noah Kim",
    role: "Survey Analyst",
    initials: "NK",
    avatarClassName: "from-sky-500 to-indigo-500",
    action: "Downloaded",
    fileName: "Terrain_Model_East_Block.dwg",
    project: "PRJ-Delta",
    ipAddress: "198.51.100.17",
  },
  {
    id: "AUD-1011",
    timestamp: "2023-10-23T14:08:07",
    user: "Priya N.",
    role: "Legal Reviewer",
    initials: "PN",
    avatarClassName: "from-purple-500 to-pink-500",
    action: "Opened",
    fileName: "NDA_Draft_Partner_03.pdf",
    project: "LEGAL-7",
    ipAddress: "10.21.9.11",
  },
  {
    id: "AUD-1012",
    timestamp: "2023-10-22T13:04:52",
    user: "John Doe",
    role: "Site Engineer",
    initials: "JD",
    avatarClassName: "from-indigo-500 to-blue-500",
    action: "Downloaded",
    fileName: "Core_Sample_Batch_12.csv",
    project: "PRJ-Beta",
    ipAddress: "192.168.1.102",
  },
  {
    id: "AUD-1013",
    timestamp: "2023-10-22T11:55:16",
    user: "M. Ross",
    role: "Geologist",
    initials: "MR",
    avatarClassName: "from-fuchsia-500 to-violet-500",
    action: "Opened",
    fileName: "Field_Observations_West_Ridge.txt",
    project: "GEO-Atlas",
    ipAddress: "192.168.1.45",
  },
  {
    id: "AUD-1014",
    timestamp: "2023-10-21T18:25:41",
    user: "Sarah K.",
    role: "Compliance",
    initials: "SK",
    avatarClassName: "from-pink-500 to-rose-500",
    action: "Edited",
    fileName: "Environmental_Audit_Remediation.docx",
    project: "ENV-12",
    ipAddress: "10.0.5.22",
  },
  {
    id: "AUD-1015",
    timestamp: "2023-10-20T16:18:54",
    user: "David L.",
    role: "Contractor",
    initials: "DL",
    avatarClassName: "from-cyan-500 to-sky-500",
    action: "Opened",
    fileName: "Equipment_Maintenance_Log.pdf",
    project: "OPS-204",
    ipAddress: "203.0.113.88",
  },
  {
    id: "AUD-1016",
    timestamp: "2023-10-19T14:44:09",
    user: "R. James",
    role: "Auditor",
    initials: "RJ",
    avatarClassName: "from-violet-500 to-indigo-600",
    action: "Downloaded",
    fileName: "Quarterly_Access_Review.pdf",
    project: "SEC-11",
    ipAddress: "172.16.254.1",
  },
  {
    id: "AUD-1017",
    timestamp: "2023-10-18T12:10:31",
    user: "Alex Morgan",
    role: "Lead Geologist",
    initials: "AM",
    avatarClassName: "from-amber-400 to-orange-500",
    action: "Edited",
    fileName: "Reserve_Model_Adjustments.xlsx",
    project: "GEO-Atlas",
    ipAddress: "10.11.3.40",
  },
  {
    id: "AUD-1018",
    timestamp: "2023-10-18T09:23:14",
    user: "Lina Perez",
    role: "Project Admin",
    initials: "LP",
    avatarClassName: "from-emerald-500 to-green-500",
    action: "Opened",
    fileName: "Subcontractor_Onboarding_Packet.pdf",
    project: "OPS-204",
    ipAddress: "172.31.8.14",
  },
  {
    id: "AUD-1019",
    timestamp: "2023-10-17T15:16:44",
    user: "Noah Kim",
    role: "Survey Analyst",
    initials: "NK",
    avatarClassName: "from-sky-500 to-indigo-500",
    action: "Downloaded",
    fileName: "Drone_Flight_Grid_04.kml",
    project: "PRJ-Delta",
    ipAddress: "198.51.100.17",
  },
  {
    id: "AUD-1020",
    timestamp: "2023-10-16T11:51:22",
    user: "Priya N.",
    role: "Legal Reviewer",
    initials: "PN",
    avatarClassName: "from-purple-500 to-pink-500",
    action: "Opened",
    fileName: "Contract_Annexure_Resource_Sharing.pdf",
    project: "LEGAL-7",
    ipAddress: "10.21.9.11",
  },
  {
    id: "AUD-1021",
    timestamp: "2023-10-15T08:34:49",
    user: "John Doe",
    role: "Site Engineer",
    initials: "JD",
    avatarClassName: "from-indigo-500 to-blue-500",
    action: "Edited",
    fileName: "Construction_Progress_Week_42.docx",
    project: "PRJ-Gamma",
    ipAddress: "192.168.1.102",
  },
];

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    icon: <GridIcon className="h-4 w-4" />,
    hasChevron: true,
  },
  {
    label: "Documents",
    icon: <FolderIcon className="h-4 w-4" />,
  },
  {
    label: "Upload & Digitization",
    icon: <UploadIcon className="h-4 w-4" />,
  },
  {
    label: "Organization",
    icon: <OrganizationIcon className="h-4 w-4" />,
  },
  {
    label: "Search & Retrieval",
    icon: <SearchIcon className="h-4 w-4" />,
  },
  {
    label: "Version Control",
    icon: <HistoryIcon className="h-4 w-4" />,
  },
  {
    label: "Access & Permissions",
    icon: <LockIcon className="h-4 w-4" />,
    hasChevron: true,
  },
  {
    label: "Reports",
    icon: <ReportsIcon className="h-4 w-4" />,
  },
  {
    label: "Audit & Logs",
    icon: <AuditTrailIcon className="h-4 w-4" />,
    active: true,
    hasChevron: true,
    children: [
      "Overview",
      "Audit Trail",
      "Login History",
      "System Actions Log",
      "Alerts / Suspicious",
    ],
    activeChild: "Audit Trail",
  },
  {
    label: "Users Management",
    icon: <UsersIcon className="h-4 w-4" />,
  },
  {
    label: "Settings",
    icon: <SettingsIcon className="h-4 w-4" />,
    hasChevron: true,
  },
];

const actionOptions: Array<AuditAction | "All Actions"> = [
  "All Actions",
  "Opened",
  "Edited",
  "Downloaded",
];

const pageSize = 7;

function IconBase({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </IconBase>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
    </IconBase>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 16V5" />
      <path d="m8 9 4-4 4 4" />
      <path d="M5 19a3 3 0 0 1 0-6 4.5 4.5 0 0 1 8.5-1.5A3.5 3.5 0 1 1 19 19z" />
    </IconBase>
  );
}

function OrganizationIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <rect x="10" y="3" width="4" height="4" rx="1" />
      <rect x="4" y="17" width="4" height="4" rx="1" />
      <rect x="16" y="17" width="4" height="4" rx="1" />
      <rect x="10" y="10" width="4" height="4" rx="1" />
      <path d="M12 7v3" />
      <path d="M12 14v3" />
      <path d="M8 19h8" />
    </IconBase>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </IconBase>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      <path d="M12 15v2" />
    </IconBase>
  );
}

function ReportsIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20v-4" />
    </IconBase>
  );
}

function AuditTrailIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M5 7h14" />
      <path d="M7 12h10" />
      <path d="M9 17h6" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </IconBase>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M16 19a4 4 0 0 0-8 0" />
      <circle cx="12" cy="9" r="3" />
      <path d="M5 19a3 3 0 0 1 3-3" />
      <path d="M19 19a3 3 0 0 0-3-3" />
    </IconBase>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2H9A1 1 0 0 0 9.7 4V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1V9c0 .4.2.8.6.9h.2a2 2 0 1 1 0 4H20a1 1 0 0 0-.6.7" />
    </IconBase>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M15 17H9" />
      <path d="M18 17V11a6 6 0 1 0-12 0v6l-2 2h16z" />
    </IconBase>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 19h14" />
    </IconBase>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M20 11a8 8 0 0 0-14.9-3" />
      <path d="M4 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14.9 3" />
      <path d="M20 20v-5h-5" />
    </IconBase>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </IconBase>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  );
}

function EllipsisIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </IconBase>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </IconBase>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="m12 20 8-8" />
      <path d="M18 6a2.8 2.8 0 1 1 4 4l-10 10-5 1 1-5Z" />
    </IconBase>
  );
}

function DownloadMiniIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 4v9" />
      <path d="m8.5 10 3.5 3.5 3.5-3.5" />
      <path d="M6 18h12" />
    </IconBase>
  );
}

function SidebarRow({ item }: { item: SidebarItem }) {
  return (
    <div className="space-y-1">
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
          item.active
            ? "bg-indigo-500/10 text-indigo-300 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.25)]"
            : "text-slate-300 hover:bg-white/5 hover:text-white",
        )}
      >
        <span className={cn("text-slate-400", item.active && "text-indigo-400")}>{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {item.hasChevron ? (
          <ChevronDownIcon className={cn("h-4 w-4 text-slate-500", item.active && "text-indigo-400")} />
        ) : null}
      </button>

      {item.children ? (
        <div className="ml-7 space-y-1 border-l border-white/5 pl-3">
          {item.children.map((child) => {
            const isActiveChild = child === item.activeChild;
            return (
              <button
                key={child}
                type="button"
                className={cn(
                  "block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                  isActiveChild
                    ? "bg-white/6 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                )}
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

function ActionBadge({ action }: { action: AuditAction }) {
  const styles = {
    Opened: {
      className: "border border-blue-500/20 bg-blue-500/10 text-blue-300",
      icon: <EyeIcon className="h-3.5 w-3.5" />,
    },
    Edited: {
      className: "border border-amber-500/20 bg-amber-500/10 text-amber-300",
      icon: <EditIcon className="h-3.5 w-3.5" />,
    },
    Downloaded: {
      className: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      icon: <DownloadMiniIcon className="h-3.5 w-3.5" />,
    },
  } satisfies Record<AuditAction, { className: string; icon: ReactNode }>;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium tracking-wide",
        styles[action].className,
      )}
    >
      {styles[action].icon}
      {action}
    </span>
  );
}

function LegendDot({ label, colorClassName, value }: { label: string; colorClassName: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-400">
      <span className={cn("h-2.5 w-2.5 rounded-full", colorClassName)} />
      <span>{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  );
}

function formatDateBlock(timestamp: string) {
  const date = new Date(timestamp);
  const datePart = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return { datePart, timePart };
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function Audittrail() {
  const [startDate, setStartDate] = useState("2023-10-01");
  const [endDate, setEndDate] = useState("2023-10-24");
  const [userQuery, setUserQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "All Actions">("All Actions");
  const [projectQuery, setProjectQuery] = useState("");
  const [page, setPage] = useState(1);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const recordDate = record.timestamp.slice(0, 10);
      const matchesStart = startDate ? recordDate >= startDate : true;
      const matchesEnd = endDate ? recordDate <= endDate : true;
      const matchesUser = userQuery
        ? `${record.user} ${record.role}`.toLowerCase().includes(userQuery.toLowerCase())
        : true;
      const matchesAction = actionFilter === "All Actions" ? true : record.action === actionFilter;
      const matchesProject = projectQuery
        ? `${record.project} ${record.fileName}`.toLowerCase().includes(projectQuery.toLowerCase())
        : true;

      return matchesStart && matchesEnd && matchesUser && matchesAction && matchesProject;
    });
  }, [actionFilter, endDate, projectQuery, startDate, userQuery]);

  const counts = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => {
        acc[record.action] += 1;
        return acc;
      },
      {
        Opened: 0,
        Edited: 0,
        Downloaded: 0,
      } as Record<AuditAction, number>,
    );
  }, [filteredRecords]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const currentRows = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredRecords.length);
  const visiblePages = Array.from({ length: pageCount }, (_, index) => index + 1).slice(0, 5);

  const resetFilters = () => {
    setStartDate("2023-10-01");
    setEndDate("2023-10-24");
    setUserQuery("");
    setActionFilter("All Actions");
    setProjectQuery("");
    setPage(1);
  };

  const handleExport = () => {
    const csvRows = [
      ["Timestamp", "User", "Role", "Action", "File Name", "Project", "IP Address"].join(","),
      ...filteredRecords.map((record) =>
        [
          csvEscape(record.timestamp),
          csvEscape(record.user),
          csvEscape(record.role),
          csvEscape(record.action),
          csvEscape(record.fileName),
          csvEscape(record.project),
          csvEscape(record.ipAddress),
        ].join(","),
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document-audit-trail.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const refreshRecords = () => {
    setLastRefreshedAt(new Date());
  };

  return (
    <div className="min-h-screen bg-[#090d18] text-slate-100">
      <div className="xl:grid xl:grid-cols-[288px_minmax(0,1fr)]">
        <AdminSidebar/>
      

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-indigo-500/20 bg-[#0d1220]/90 backdrop-blur">
            <div className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <h1 className="text-xl font-semibold text-white">Audit &amp; Logs</h1>
                <span className="text-slate-600">|</span>
                <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                  <HistoryIcon className="h-4 w-4" />
                  Audit Trail
                </div>
              </div>

              <div className="hidden min-w-[260px] flex-1 lg:block">
                <div className="h-11 rounded-xl border border-white/8 bg-white/4 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]" />
              </div>

              <div className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  className="relative rounded-xl border border-white/8 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/8 hover:text-white"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-4.5 w-4.5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pink-500" />
                </button>

                <button
                  type="button"
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-2.5 py-1.5 text-left transition hover:bg-white/8"
                >
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-white">Alex Morgan</p>
                    <p className="text-xs text-slate-400">Lead Geologist</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-slate-200 text-sm font-bold text-slate-900">
                    AM
                  </div>
                  <ChevronDownIcon className="hidden h-4 w-4 text-slate-500 sm:block" />
                </button>
              </div>
            </div>
          </header>

          <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
            <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">Document Audit Trail</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
                  Detailed tracking log of all document access, modifications, and download activities
                  across projects.
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.28em] text-slate-500">
                  Last refreshed {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-700/50 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-slate-700"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={refreshRecords}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-950/40 transition hover:brightness-110"
                >
                  <RefreshIcon className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-white/8 bg-[#1d2439] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.15fr_1.15fr_0.95fr_0.95fr_0.8fr]">
                <label className="space-y-2">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    Date Range
                  </span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="relative">
                      <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => {
                          setStartDate(event.target.value);
                          setPage(1);
                        }}
                        className="h-12 w-full rounded-xl border border-white/8 bg-[#11162a] pl-10 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60"
                      />
                    </div>
                    <div className="relative">
                      <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(event) => {
                          setEndDate(event.target.value);
                          setPage(1);
                        }}
                        className="h-12 w-full rounded-xl border border-white/8 bg-[#11162a] pl-10 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60"
                      />
                    </div>
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    User / Personnel
                  </span>
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      value={userQuery}
                      onChange={(event) => {
                        setUserQuery(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search user..."
                      className="h-12 w-full rounded-xl border border-white/8 bg-[#11162a] pl-10 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    Action Type
                  </span>
                  <div className="relative">
                    <select
                      value={actionFilter}
                      onChange={(event) => {
                        setActionFilter(event.target.value as AuditAction | "All Actions");
                        setPage(1);
                      }}
                      className="h-12 w-full appearance-none rounded-xl border border-white/8 bg-[#11162a] px-4 pr-10 text-sm text-slate-200 outline-none transition focus:border-indigo-400/60"
                    >
                      {actionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    Project ID
                  </span>
                  <input
                    type="text"
                    value={projectQuery}
                    onChange={(event) => {
                      setProjectQuery(event.target.value);
                      setPage(1);
                    }}
                    placeholder="e.g. PRJ-2024-X"
                    className="h-12 w-full rounded-xl border border-white/8 bg-[#11162a] px-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60"
                  />
                </label>

                <div className="space-y-2">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    Controls
                  </span>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#11162a] px-4 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
                  >
                    <RefreshIcon className="h-4 w-4 opacity-75" />
                    Reset
                  </button>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/8 bg-[#141a2c] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex flex-col gap-3 border-b border-white/6 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 text-white">
                    <AuditTrailIcon className="h-4.5 w-4.5 text-slate-300" />
                    <span className="font-semibold">Audit Records</span>
                  </div>
                  <span className="rounded-full bg-indigo-500/12 px-2.5 py-1 text-xs font-medium text-indigo-300">
                    {filteredRecords.length.toLocaleString()} Total
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <LegendDot label="Opened" colorClassName="bg-blue-400" value={counts.Opened} />
                  <LegendDot label="Edited" colorClassName="bg-amber-400" value={counts.Edited} />
                  <LegendDot label="Downloaded" colorClassName="bg-emerald-400" value={counts.Downloaded} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[1150px]">
                  <div className="grid grid-cols-[170px_230px_150px_minmax(260px,1fr)_130px_140px_56px] border-b border-white/6 bg-[#171d31] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:px-5">
                    <div>Timestamp</div>
                    <div>User</div>
                    <div>Status</div>
                    <div>File Name</div>
                    <div>Project</div>
                    <div>IP Address</div>
                    <div>Action</div>
                  </div>

                  {currentRows.length === 0 ? (
                    <div className="px-5 py-16 text-center text-slate-400">
                      No audit records match the current filter combination.
                    </div>
                  ) : (
                    currentRows.map((record) => {
                      const { datePart, timePart } = formatDateBlock(record.timestamp);

                      return (
                        <div
                          key={record.id}
                          className="grid grid-cols-[170px_230px_150px_minmax(260px,1fr)_130px_140px_56px] items-center border-b border-white/6 px-4 py-3 transition hover:bg-white/[0.02] sm:px-5"
                        >
                          <div className="text-sm text-slate-400">
                            <div>{datePart}</div>
                            <div className="mt-1 font-mono text-xs text-slate-500">{timePart}</div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white",
                                record.avatarClassName,
                              )}
                            >
                              {record.initials}
                            </div>
                            <div>
                              <div className="font-medium text-white">{record.user}</div>
                              <div className="text-xs text-slate-500">{record.role}</div>
                            </div>
                          </div>

                          <div>
                            <ActionBadge action={record.action} />
                          </div>

                          <div className="flex items-center gap-2 text-slate-200">
                            <FileIcon className="h-4 w-4 text-slate-500" />
                            <span className="truncate">{record.fileName}</span>
                          </div>

                          <div>
                            <span className="inline-flex rounded-lg border border-white/8 bg-white/5 px-2 py-1 font-mono text-xs text-slate-400">
                              {record.project}
                            </span>
                          </div>

                          <div className="font-mono text-sm text-slate-400">{record.ipAddress}</div>

                          <div>
                            <button
                              type="button"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/6 hover:text-white"
                              aria-label={`More actions for ${record.fileName}`}
                            >
                              <EllipsisIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-white/6 bg-white/[0.02] px-4 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span>
                    Showing {rangeStart}-{rangeEnd} of {filteredRecords.length.toLocaleString()} records
                  </span>
                  <span className="rounded-lg bg-[#11162a] px-2.5 py-1 text-xs text-slate-300">7 per page</span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-lg border border-white/8 px-3 py-2 text-slate-400 transition hover:border-white/15 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={currentPage === 1 || filteredRecords.length === 0}
                  >
                    Previous
                  </button>

                  {visiblePages.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={cn(
                        "h-9 min-w-9 rounded-lg border px-3 text-sm transition",
                        currentPage === pageNumber
                          ? "border-indigo-400/60 bg-indigo-500 text-white"
                          : "border-white/8 text-slate-400 hover:border-white/15 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  {pageCount > visiblePages.length ? <span className="px-1 text-slate-500">…</span> : null}

                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                    className="rounded-lg border border-white/8 px-3 py-2 text-slate-400 transition hover:border-white/15 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={currentPage === pageCount || filteredRecords.length === 0}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-.8.8-1.8 1.3-1.8 2.8" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </IconBase>
  );
}
