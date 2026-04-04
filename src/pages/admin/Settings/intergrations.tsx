import AdminSidebar from "../AdminSidebar";

type MenuItem = {
  label: string;
  icon: string;
  active?: boolean;
  expanded?: boolean;
  nested?: string[];
};

type Integration = {
  name: string;
  description: string;
  status: "connected" | "pending" | "disconnected";
  detail: string;
  action: string;
  icon: string;
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: "grid", expanded: true },
  { label: "Documents", icon: "folder" },
  { label: "Upload & Digitization", icon: "upload" },
  { label: "Organization", icon: "blocks" },
  { label: "Search & Retrieval", icon: "search" },
  { label: "Version Control", icon: "history" },
  { label: "Access & Permissions", icon: "lock", expanded: true },
  { label: "Reports", icon: "bars" },
  { label: "Audit & Logs", icon: "checklist", expanded: true },
  { label: "Users Management", icon: "users" },
  {
    label: "Settings",
    icon: "settings",
    active: true,
    expanded: true,
    nested: [
      "Company Profile",
      "Document Numbering Rules",
      "Storage Settings",
      "Backup & Restore",
      "Notifications",
      "Integrations",
    ],
  },
];

const integrations: Integration[] = [
  {
    name: "SMTP Email Server",
    description: "Configured for system notifications and alerts via corporate mail server.",
    status: "connected",
    detail: "Last synced: 2m ago",
    action: "Configure",
    icon: "mail",
  },
  {
    name: "Google Drive",
    description: "Two-way sync for project documents and external sharing capabilities.",
    status: "connected",
    detail: "Last synced: 1h ago",
    action: "Configure",
    icon: "drive",
  },
  {
    name: "Microsoft SharePoint",
    description: "Integration with corporate SharePoint sites for archival storage.",
    status: "pending",
    detail: "Token expired",
    action: "Configure",
    icon: "share",
  },
  {
    name: "Slack Notifications",
    description: "Send document workflow updates directly to Slack channels.",
    status: "disconnected",
    detail: "Optional",
    action: "Setup",
    icon: "message",
  },
  {
    name: "Azure AD SSO",
    description: "Single Sign-On authentication management for enterprise users.",
    status: "connected",
    detail: "Active",
    action: "Configure",
    icon: "shield",
  },
  {
    name: "OCR Cloud Service",
    description: "External optical character recognition for scanned PDFs.",
    status: "disconnected",
    detail: "Requires API Key",
    action: "Setup",
    icon: "scan",
  },
];

function Icon({ name, className }: { name: string; className?: string }) {
  const base = "h-4 w-4";
  const classes = `${base} ${className ?? ""}`;

  const props = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: classes,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "grid":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="6" height="6" />
          <rect x="14" y="4" width="6" height="6" />
          <rect x="4" y="14" width="6" height="6" />
          <rect x="14" y="14" width="6" height="6" />
        </svg>
      );
    case "folder":
      return (
        <svg {...props}>
          <path d="M3 8h7l2 2h9v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
          <path d="M3 8V6a2 2 0 0 1 2-2h4l2 2h4" />
        </svg>
      );
    case "upload":
      return (
        <svg {...props}>
          <path d="M7 17a4 4 0 1 1 .7-7.9A5 5 0 0 1 18 11h1a3 3 0 0 1 0 6H7z" />
          <path d="M12 16V9" />
          <path d="m9 12 3-3 3 3" />
        </svg>
      );
    case "blocks":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="7" height="7" />
          <rect x="13" y="4" width="7" height="5" />
          <rect x="13" y="11" width="7" height="9" />
          <rect x="4" y="13" width="7" height="7" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "history":
      return (
        <svg {...props}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "bars":
      return (
        <svg {...props}>
          <path d="M5 19V9" />
          <path d="M12 19V5" />
          <path d="M19 19v-7" />
        </svg>
      );
    case "checklist":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="m8 10 2 2 4-4" />
          <path d="M8 16h8" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.9" />
          <path d="M14 4.1a3 3 0 0 1 0 5.8" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1 1a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0l-1-1a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4l1-1a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1 1a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6Z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props} className={`h-5 w-5 ${className ?? ""}`}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "drive":
      return (
        <svg {...props} className={`h-5 w-5 ${className ?? ""}`}>
          <path d="m9 3 6 0 6 10-3 5H6l-3-5 6-10z" />
          <path d="m9 3 3 5-3 5H3" />
          <path d="m15 3-3 5h9" />
        </svg>
      );
    case "share":
      return (
        <svg {...props} className={`h-5 w-5 ${className ?? ""}`}>
          <circle cx="18" cy="5" r="2" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="18" cy="19" r="2" />
          <path d="m8 12 8-6" />
          <path d="m8 12 8 6" />
        </svg>
      );
    case "message":
      return (
        <svg {...props} className={`h-5 w-5 ${className ?? ""}`}>
          <path d="M21 14a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8Z" />
          <path d="M8 9h8" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props} className={`h-5 w-5 ${className ?? ""}`}>
          <path d="M12 3 5 6v6c0 5 3.5 8.7 7 10 3.5-1.3 7-5 7-10V6l-7-3z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "scan":
      return (
        <svg {...props} className={`h-5 w-5 ${className ?? ""}`}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M16 3h3a2 2 0 0 1 2 2v3" />
          <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          <rect x="7" y="7" width="10" height="10" rx="1" />
          <path d="M10 10h4v4h-4z" />
        </svg>
      );
    default:
      return null;
  }
}

function statusStyles(status: Integration["status"]) {
  if (status === "connected") {
    return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20";
  }

  if (status === "pending") {
    return "bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/20";
  }

  return "bg-indigo-400/10 text-indigo-200 ring-1 ring-indigo-300/20";
}

function statusLabel(status: Integration["status"]) {
  if (status === "connected") return "Connected";
  if (status === "pending") return "Re-auth Required";
  return "Not Connected";
}

export default function Integrations() {
  return (
    <div className="min-h-screen bg-[#0b0c14] text-slate-300">
      <div className="flex min-h-screen">
       <AdminSidebar/>

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0b0c14]/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-6">
              <h2 className="text-sm font-semibold text-slate-200">System Settings</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Integrations</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button type="button" className="relative text-slate-400 hover:text-slate-200 transition-colors">
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="h-5 w-5"
                >
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
                  <path d="M10 17a2 2 0 0 0 4 0" />
                </svg>
              </button>
              <button type="button" className="flex items-center gap-3 text-left pl-6 border-l border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-200">Alex Morgan</p>
                  <p className="text-[10px] text-slate-500">Lead Geologist</p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-500/20 text-sm font-semibold text-slate-200">
                  AM
                </div>
              </button>
            </div>
          </header>

          <section className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">System Integrations</h2>
                  <p className="text-slate-500 text-sm">Connect third-party services and configure data exchange protocols.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-800 bg-[#1a1c2e] px-5 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                  >
                    ↻ Refresh Status
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                  >
                    + Add Integration
                  </button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {integrations.map((integration, index) => (
                  <article
                    key={integration.name}
                    className="group rounded-xl border border-slate-800 bg-[#1a1c2e] p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-indigo-600/10"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-800 text-slate-200">
                        <Icon name={integration.icon} />
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] ${statusStyles(integration.status)}`}>
                        {statusLabel(integration.status)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold leading-tight text-white">{integration.name}</h3>
                    <p className="mt-2 min-h-14 text-sm leading-relaxed text-slate-400">{integration.description}</p>

                    <div className="mt-5 border-t border-slate-800 pt-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{integration.detail}</span>
                        <button type="button" className="font-medium text-indigo-400 transition hover:text-indigo-300">
                          {integration.action}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
