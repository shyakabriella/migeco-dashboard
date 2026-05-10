import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Archive,
  BarChart3,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Command,
  Database,
  Download,
  Eye,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  Files,
  FolderOpen,
  GitBranch,
  History,
  Info,
  Loader2,
  LockKeyhole,
  MoreVertical,
  Plus,
  Radar,
  RefreshCcw,
  ScanSearch,
  Search,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  Users,
} from "lucide-react";
import AdminSidebar from "../AdminSidebar";
import {
  apiRequest,
  getCurrentUser,
  getDocuments,
  getProjects,
} from "../../../services/dmsApi";
import type {
  DmsDocument,
  ProjectSummary,
  UserSummary,
} from "../../../services/dmsApi";

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

type AiSummary = {
  total_documents?: number;
  ready_for_ai?: number;
  analyzed_documents?: number;
  not_analyzed_documents?: number;
  pending_ai_documents?: number;
  failed_ai_documents?: number;
};

type EncryptionSummary = {
  total_documents?: number;
  clean_active_documents?: number;
  encrypted_documents?: number;
  not_encrypted_documents?: number;
  failed_encryption_documents?: number;
};

type SandboxSummary = {
  total_documents?: number;
  clean_active_documents?: number;
  not_tested_documents?: number;
  pending_documents?: number;
  safe_documents?: number;
  unsafe_documents?: number;
  failed_documents?: number;
};

type PlaintextSummary = {
  total_documents?: number;
  clean_documents?: number;
  extracted_documents?: number;
  not_extracted_documents?: number;
  failed_documents?: number;
};

type DashboardData = {
  user: UserSummary | null;
  documents: DmsDocument[];
  projects: ProjectSummary[];
  aiSummary: AiSummary | null;
  encryptionSummary: EncryptionSummary | null;
  sandboxSummary: SandboxSummary | null;
  plaintextSummary: PlaintextSummary | null;
};

type DashboardTask = {
  id: string;
  title: string;
  desc: string;
  date: string;
  tag: string;
  tagClass: string;
  project: string;
  icon: ReactNode;
  href: string;
};

type DashboardActivity = {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  version?: string;
  icon: ReactNode;
  iconBg: string;
};

type QuickDocument = {
  id: number | string;
  title: string;
  type: string;
  time: string;
  status?: string | null;
  icon: ReactNode;
};

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function toLower(value?: string | null): string {
  return value ? String(value).toLowerCase() : "";
}

function getReadableStatus(status?: string | null): string {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function unwrapData<T>(response: unknown, fallback: T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return (response as { data: T }).data ?? fallback;
  }

  return (response as T) ?? fallback;
}

async function safeRequest<T>(
  request: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await request();
  } catch {
    return fallback;
  }
}

function formatRelativeTime(date?: string | null): string {
  if (!date) return "Unknown time";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown time";

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) return `${diffDays}d ago`;

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatDate(date?: string | null): string {
  if (!date) return "Not set";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not set";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getRoleName(user: UserSummary | null): string {
  const role = (user as { role?: unknown } | null)?.role;

  if (!role) return "DMS User";

  if (typeof role === "string") {
    return getReadableStatus(role);
  }

  if (typeof role === "object" && role !== null) {
    const roleObject = role as { name?: string; slug?: string };

    return roleObject.name || getReadableStatus(roleObject.slug) || "DMS User";
  }

  return "DMS User";
}

function getUserName(user: UserSummary | null): string {
  return user?.name || "DMS User";
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const names = name.trim().split(" ").filter(Boolean);

  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }

  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
}

function isActiveDocument(document: DmsDocument): boolean {
  return toLower(document.status) === "active";
}

function isScanClean(document: DmsDocument): boolean {
  return ["clean", "passed"].includes(toLower(document.scan_status));
}

function isSandboxSafe(document: DmsDocument): boolean {
  return toLower(document.sandbox_status) === "safe";
}

function isSandboxUnsafe(document: DmsDocument): boolean {
  return ["unsafe", "failed"].includes(toLower(document.sandbox_status));
}

function isPlaintextExtracted(document: DmsDocument): boolean {
  return toLower(document.plaintext_status) === "extracted";
}

function isEncrypted(document: DmsDocument): boolean {
  return toLower(document.encryption_status) === "encrypted";
}

function isAiAnalyzed(document: DmsDocument): boolean {
  return toLower(document.ai_status) === "analyzed";
}

function isBlocked(document: DmsDocument): boolean {
  return (
    ["infected", "rejected", "blocked"].includes(toLower(document.status)) ||
    ["infected", "failed"].includes(toLower(document.scan_status)) ||
    ["unsafe", "failed"].includes(toLower(document.sandbox_status))
  );
}

function isPendingScan(document: DmsDocument): boolean {
  return (
    ["uploaded", "pending_scan", "quarantined", "scanning"].includes(
      toLower(document.status)
    ) ||
    ["pending", "scanning", "not_scanned", ""].includes(
      toLower(document.scan_status)
    )
  );
}

function needsSandbox(document: DmsDocument): boolean {
  return (
    isActiveDocument(document) &&
    isScanClean(document) &&
    ["not_tested", "failed", "pending", ""].includes(
      toLower(document.sandbox_status)
    )
  );
}

function needsPlaintext(document: DmsDocument): boolean {
  return (
    isActiveDocument(document) &&
    isScanClean(document) &&
    isSandboxSafe(document) &&
    !isPlaintextExtracted(document)
  );
}

function needsEncryption(document: DmsDocument): boolean {
  return (
    isActiveDocument(document) &&
    isScanClean(document) &&
    ["not_encrypted", "failed", "", "unknown"].includes(
      toLower(document.encryption_status)
    )
  );
}

function readyForAi(document: DmsDocument): boolean {
  return (
    isActiveDocument(document) &&
    isScanClean(document) &&
    isSandboxSafe(document) &&
    isPlaintextExtracted(document) &&
    !isAiAnalyzed(document)
  );
}

function getProjectName(document: DmsDocument): string {
  return document.project?.name || "No project";
}

function getDocumentTitle(document: DmsDocument): string {
  return (
    document.original_file_name ||
    document.title ||
    document.document_code ||
    `Document #${document.id}`
  );
}

function getDocumentTypeLabel(document: DmsDocument): string {
  const extension = document.extension?.toLowerCase();

  if (extension) return extension.toUpperCase();

  if (document.document_type) return getReadableStatus(document.document_type);

  return "FILE";
}

function getDocumentIcon(document: DmsDocument): ReactNode {
  const extension = document.extension?.toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "tif", "tiff"].includes(extension || "")) {
    return <FileImage size={24} className="text-emerald-400" />;
  }

  if (["xls", "xlsx", "csv"].includes(extension || "")) {
    return <FileSpreadsheet size={24} className="text-green-400" />;
  }

  if (["dwg", "dxf"].includes(extension || "")) {
    return <FileCode2 size={24} className="text-blue-400" />;
  }

  if (extension === "pdf") {
    return <FileText size={24} className="text-red-400" />;
  }

  return <FileText size={24} className="text-slate-400" />;
}

function sortByDate<T extends { updated_at?: string; created_at?: string }>(
  rows: T[]
): T[] {
  return [...rows].sort((first, second) => {
    const firstDate = new Date(first.updated_at || first.created_at || 0).getTime();
    const secondDate = new Date(
      second.updated_at || second.created_at || 0
    ).getTime();

    return secondDate - firstDate;
  });
}

function countProjectDocuments(
  project: ProjectSummary,
  documents: DmsDocument[]
): number {
  const projectCounter =
    project.documents_count ?? project.document_count ?? undefined;

  if (typeof projectCounter === "number") return projectCounter;

  return documents.filter(
    (document) => String(document.project_id) === String(project.id)
  ).length;
}

function getProjectStatusClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
      return "bg-emerald-600";
    case "planned":
      return "bg-blue-600";
    case "completed":
      return "bg-purple-600";
    case "archived":
      return "bg-slate-600";
    default:
      return "bg-amber-600";
  }
}

function getAlertFromError(error: unknown): AlertState {
  const message =
    error instanceof Error
      ? error.message
      : "Failed to load dashboard data. Please try again.";

  return {
    type: "error",
    message,
  };
}

function StatCard({
  icon,
  value,
  label,
  helper,
  trend,
  trendColor = "text-green-400",
  active = false,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  helper?: string;
  trend?: string;
  trendColor?: string;
  active?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-800/50 bg-[#1a1a2e] p-5 transition-colors hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "rounded-lg p-2.5",
            active
              ? "bg-amber-500/10 text-amber-400"
              : "bg-blue-500/10 text-blue-400"
          )}
        >
          {icon}
        </div>

        {trend && (
          <span
            className={cn(
              "rounded-full bg-green-400/10 px-2 py-0.5 text-xs font-bold",
              trendColor
            )}
          >
            {trend}
          </span>
        )}

        {active && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Attention
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-white">
          {value}
        </div>
        <div className="text-xs font-medium text-slate-400">{label}</div>
        {helper && <p className="mt-2 text-[11px] text-slate-600">{helper}</p>}
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: DashboardTask }) {
  return (
    <Link
      to={task.href}
      className="group flex items-start gap-4 border-b border-slate-800/40 p-4 transition-colors last:border-0 hover:bg-slate-800/20"
    >
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 group-hover:border-blue-500 group-hover:text-blue-400">
        {task.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold text-slate-200">{task.title}</h4>
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              task.tagClass
            )}
          >
            {task.tag}
          </span>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {task.desc}
        </p>

        <div className="mt-3 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock size={12} />
            {task.date}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Files size={12} />
            {task.project}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActivityItem({ activity }: { activity: DashboardActivity }) {
  return (
    <div className="flex items-start gap-4 p-4 transition-colors hover:bg-slate-800/20">
      <div className={cn("mt-1 rounded-lg p-2", activity.iconBg)}>
        {activity.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm">
          <span className="font-semibold text-slate-200">{activity.user}</span>
          <span className="mx-1.5 text-slate-400">{activity.action}</span>
          <span className="font-medium text-blue-400">{activity.target}</span>
        </div>

        <p className="mt-1 text-xs text-slate-500">{activity.time}</p>

        {activity.version && (
          <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span className="rounded bg-slate-800 px-1.5 py-0.5">
              {activity.version}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAccessCard({ document }: { document: QuickDocument }) {
  return (
    <Link
      to="/alldocuments"
      className="group cursor-pointer overflow-hidden rounded-xl border border-slate-800/50 bg-[#1a1a2e] transition-all hover:border-slate-600"
    >
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-slate-900">
        <div className="flex flex-col items-center gap-2">{document.icon}</div>

        <div className="absolute right-2 top-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-300">
          {document.type}
        </div>

        {document.status && (
          <div
            className={cn(
              "absolute bottom-2 left-2 rounded-full border px-2 py-0.5 text-[10px]",
              getStatusBadgeClass(document.status)
            )}
          >
            {getReadableStatus(document.status)}
          </div>
        )}
      </div>

      <div className="p-3">
        <h5 className="truncate text-xs font-semibold text-slate-200">
          {document.title}
        </h5>
        <p className="mt-1 text-[10px] text-slate-500">
          Updated {document.time}
        </p>
      </div>
    </Link>
  );
}

function PinnedProject({
  project,
  count,
}: {
  project: ProjectSummary;
  count: number;
}) {
  return (
    <Link
      to={`/Projects/${project.id}`}
      className="group flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-slate-800/30"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white",
            getProjectStatusClass(project.status)
          )}
        >
          {(project.name || "P").slice(0, 1).toUpperCase()}
        </div>

        <div>
          <h6 className="line-clamp-1 text-sm font-semibold text-slate-200">
            {project.name}
          </h6>
          <p className="text-xs text-slate-500">
            {count} document{count === 1 ? "" : "s"} •{" "}
            {getReadableStatus(project.status)}
          </p>
        </div>
      </div>

      <ChevronRight
        size={16}
        className="text-slate-600 group-hover:text-slate-400"
      />
    </Link>
  );
}

function getStatusBadgeClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
    case "clean":
    case "safe":
    case "encrypted":
    case "extracted":
    case "analyzed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "pending":
    case "pending_scan":
    case "uploaded":
    case "not_tested":
    case "not_encrypted":
    case "not_extracted":
    case "not_analyzed":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    case "unsafe":
    case "infected":
    case "rejected":
    case "failed":
    case "blocked":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }
}

function AlertBox({
  type,
  message,
  onClose,
}: {
  type: AlertState["type"];
  message: string;
  onClose: () => void;
}) {
  const style =
    type === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : type === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-blue-500/20 bg-blue-500/10 text-blue-300";

  const Icon =
    type === "success" ? CheckCircle2 : type === "error" ? AlertTriangle : Info;

  return (
    <div
      className={cn(
        "mb-6 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm",
        style
      )}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>

      <button type="button" onClick={onClose} className="shrink-0 opacity-80">
        ×
      </button>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center">
      <div className="mb-3 text-slate-500">{icon}</div>
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData>({
    user: null,
    documents: [],
    projects: [],
    aiSummary: null,
    encryptionSummary: null,
    sandboxSummary: null,
    plaintextSummary: null,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  async function loadDashboard(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const [
        user,
        documents,
        projects,
        aiSummary,
        encryptionSummary,
        sandboxSummary,
        plaintextSummary,
      ] = await Promise.all([
        safeRequest(() => getCurrentUser(), null),
        safeRequest(() => getDocuments({}), []),
        safeRequest(() => getProjects({}), []),
        safeRequest(
          async () =>
            unwrapData<AiSummary>(
              await apiRequest("/document-ai/summary", {
                method: "GET",
              }),
              {}
            ),
          null
        ),
        safeRequest(
          async () =>
            unwrapData<EncryptionSummary>(
              await apiRequest("/document-encryption/summary", {
                method: "GET",
              }),
              {}
            ),
          null
        ),
        safeRequest(
          async () =>
            unwrapData<SandboxSummary>(
              await apiRequest("/document-sandbox/summary", {
                method: "GET",
              }),
              {}
            ),
          null
        ),
        safeRequest(
          async () =>
            unwrapData<PlaintextSummary>(
              await apiRequest("/document-plaintext/summary", {
                method: "GET",
              }),
              {}
            ),
          null
        ),
      ]);

      setData({
        user,
        documents,
        projects,
        aiSummary,
        encryptionSummary,
        sandboxSummary,
        plaintextSummary,
      });
    } catch (error) {
      setAlert(getAlertFromError(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const dashboardStats = useMemo(() => {
    const totalDocuments = data.documents.length;
    const activeProjects = data.projects.filter(
      (project) => toLower(project.status) === "active"
    ).length;

    const criticalAlerts = data.documents.filter(isBlocked).length;
    const pendingSecurity = data.documents.filter(
      (document) =>
        isPendingScan(document) || needsSandbox(document) || isSandboxUnsafe(document)
    ).length;

    const encryptedCount =
      data.encryptionSummary?.encrypted_documents ??
      data.documents.filter(isEncrypted).length;

    const safeSandboxCount =
      data.sandboxSummary?.safe_documents ??
      data.documents.filter(isSandboxSafe).length;

    const plaintextCount =
      data.plaintextSummary?.extracted_documents ??
      data.documents.filter(isPlaintextExtracted).length;

    const aiReady =
      data.aiSummary?.ready_for_ai ?? data.documents.filter(readyForAi).length;

    return {
      totalDocuments,
      activeProjects,
      criticalAlerts,
      pendingSecurity,
      encryptedCount,
      safeSandboxCount,
      plaintextCount,
      aiReady,
    };
  }, [data]);

  const tasks = useMemo<DashboardTask[]>(() => {
    const pendingScanDocuments = data.documents.filter(isPendingScan);
    const sandboxDocuments = data.documents.filter(needsSandbox);
    const unsafeDocuments = data.documents.filter(
      (document) => toLower(document.sandbox_status) === "unsafe"
    );
    const plaintextDocuments = data.documents.filter(needsPlaintext);
    const encryptionDocuments = data.documents.filter(needsEncryption);
    const aiDocuments = data.documents.filter(readyForAi);

    const rows: DashboardTask[] = [];

    if (pendingScanDocuments.length > 0) {
      rows.push({
        id: "scan-pending",
        title: `Scan ${pendingScanDocuments.length} pending document${
          pendingScanDocuments.length === 1 ? "" : "s"
        }`,
        desc: "These files are not trusted yet. Run antivirus scan before sandbox, plaintext, encryption, or AI.",
        date: "Security pipeline",
        tag: "SCAN",
        tagClass: "bg-red-500/20 text-red-400",
        project: "Document Security",
        icon: <ShieldCheck size={16} />,
        href: "/alldocuments",
      });
    }

    if (sandboxDocuments.length > 0) {
      rows.push({
        id: "sandbox-pending",
        title: `Sandbox test ${sandboxDocuments.length} clean document${
          sandboxDocuments.length === 1 ? "" : "s"
        }`,
        desc: "These files passed antivirus scan but still need sandbox inspection before secure access and AI.",
        date: "Next step",
        tag: "SANDBOX",
        tagClass: "bg-orange-500/20 text-orange-400",
        project: "Sandbox Review",
        icon: <Radar size={16} />,
        href: "/alldocuments",
      });
    }

    if (unsafeDocuments.length > 0) {
      rows.push({
        id: "unsafe-documents",
        title: `Review ${unsafeDocuments.length} unsafe sandbox document${
          unsafeDocuments.length === 1 ? "" : "s"
        }`,
        desc: "Unsafe documents should be rejected or reviewed by a security/controller user.",
        date: "Requires action",
        tag: "UNSAFE",
        tagClass: "bg-red-500/20 text-red-400",
        project: "Sandbox Review",
        icon: <ShieldAlert size={16} />,
        href: "/alldocuments",
      });
    }

    if (plaintextDocuments.length > 0) {
      rows.push({
        id: "plaintext-pending",
        title: `Extract plaintext for ${plaintextDocuments.length} document${
          plaintextDocuments.length === 1 ? "" : "s"
        }`,
        desc: "Plaintext/OCR is needed for smart search and AI analysis.",
        date: "Before AI",
        tag: "TEXT",
        tagClass: "bg-blue-500/20 text-blue-400",
        project: "OCR / Search",
        icon: <ScanSearch size={16} />,
        href: "/alldocuments",
      });
    }

    if (encryptionDocuments.length > 0) {
      rows.push({
        id: "encryption-pending",
        title: `Encrypt ${encryptionDocuments.length} clean document${
          encryptionDocuments.length === 1 ? "" : "s"
        }`,
        desc: "Clean active documents should be encrypted at rest for secure storage.",
        date: "Protection",
        tag: "ENCRYPT",
        tagClass: "bg-emerald-500/20 text-emerald-400",
        project: "Encryption",
        icon: <LockKeyhole size={16} />,
        href: "/alldocuments",
      });
    }

    if (aiDocuments.length > 0) {
      rows.push({
        id: "ai-ready",
        title: `Analyze ${aiDocuments.length} AI-ready document${
          aiDocuments.length === 1 ? "" : "s"
        }`,
        desc: "These documents are active, clean, sandbox safe, and plaintext extracted.",
        date: "AI ready",
        tag: "AI",
        tagClass: "bg-purple-500/20 text-purple-400",
        project: "Document AI",
        icon: <BrainCircuit size={16} />,
        href: "/alldocuments",
      });
    }

    return rows.slice(0, 5);
  }, [data.documents]);

  const recentActivities = useMemo<DashboardActivity[]>(() => {
    return sortByDate(data.documents)
      .slice(0, 6)
      .map((document) => {
        const title = getDocumentTitle(document);
        const uploader = document.uploader?.name || "System";

        let action = "updated";
        let icon: ReactNode = <FileText size={16} className="text-white" />;
        let iconBg = "bg-blue-600/20";

        if (toLower(document.scan_status) === "clean") {
          action = "scanned clean";
          icon = <ShieldCheck size={16} className="text-white" />;
          iconBg = "bg-emerald-600/20";
        }

        if (toLower(document.sandbox_status) === "safe") {
          action = "passed sandbox";
          icon = <Radar size={16} className="text-white" />;
          iconBg = "bg-orange-600/20";
        }

        if (isEncrypted(document)) {
          action = "encrypted";
          icon = <LockKeyhole size={16} className="text-white" />;
          iconBg = "bg-emerald-600/20";
        }

        if (isAiAnalyzed(document)) {
          action = "analyzed with AI";
          icon = <BrainCircuit size={16} className="text-white" />;
          iconBg = "bg-purple-600/20";
        }

        return {
          id: String(document.id),
          user: uploader,
          action,
          target: title,
          version: document.version_number
            ? `v${document.version_number}`
            : undefined,
          time: formatRelativeTime(document.updated_at || document.created_at),
          icon,
          iconBg,
        };
      });
  }, [data.documents]);

  const quickDocuments = useMemo<QuickDocument[]>(() => {
    return sortByDate(data.documents)
      .slice(0, 4)
      .map((document) => ({
        id: document.id,
        title: getDocumentTitle(document),
        type: getDocumentTypeLabel(document),
        time: formatRelativeTime(document.updated_at || document.created_at),
        status: document.status,
        icon: getDocumentIcon(document),
      }));
  }, [data.documents]);

  const pinnedProjects = useMemo(() => {
    return sortByDate(data.projects)
      .slice(0, 4)
      .map((project) => ({
        project,
        count: countProjectDocuments(project, data.documents),
      }));
  }, [data.projects, data.documents]);

  function submitSearch(): void {
    const trimmedSearch = searchText.trim();

    if (!trimmedSearch) {
      navigate("/search");
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmedSearch)}`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1b] font-sans text-slate-200 selection:bg-blue-500/30">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-800/50 bg-[#0f0f1b]/80 px-8 backdrop-blur-md">
          <div className="max-w-2xl flex-1">
            <div className="group relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400"
                size={18}
              />

              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitSearch();
                  }
                }}
                placeholder="Search for documents, projects, or metadata..."
                className="w-full rounded-lg border border-slate-800/50 bg-slate-900/50 py-2 pl-10 pr-24 text-sm text-slate-300 transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900 focus:outline-none"
              />

              <button
                type="button"
                onClick={submitSearch}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-slate-200"
              >
                <Command size={10} />
                <span>Enter</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-[#0f0f1b] bg-red-500" />
            </button>

            <div className="h-8 w-px bg-slate-800" />

            <div className="group flex cursor-pointer items-center gap-3 pl-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-none text-slate-200">
                  {getUserName(data.user)}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  {getRoleName(data.user)}
                </p>
              </div>

              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-800 bg-blue-600 text-xs font-bold text-white transition-colors group-hover:border-slate-600">
                  {getInitials(getUserName(data.user))}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0f0f1b] bg-green-500" />
              </div>

              <ChevronDown
                size={14}
                className="text-slate-500 group-hover:text-slate-300"
              />
            </div>
          </div>
        </header>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
          <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8">
            <div className="col-span-12 space-y-8 lg:col-span-8">
              <section className="group relative overflow-hidden rounded-2xl border border-blue-900/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/10 p-8">
                <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                      Welcome back, {getUserName(data.user).split(" ")[0] || "DMS User"}
                    </h2>
                    <p className="mt-2 max-w-xl leading-relaxed text-slate-400">
                      Real-time dashboard from your database: documents,
                      projects, sandbox, encryption, plaintext, and AI status.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadDashboard}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-200 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={16} />
                    )}
                    Refresh
                  </button>
                </div>

                <div className="pointer-events-none absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-blue-600/5 to-transparent" />
              </section>

              {alert && (
                <AlertBox
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
                />
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={<Files size={20} />}
                  value={loading ? "..." : dashboardStats.totalDocuments}
                  label="Total Documents"
                  helper="Loaded from documents table"
                  trend={`${dashboardStats.activeProjects} active projects`}
                />

                <StatCard
                  icon={<AlertTriangle size={20} />}
                  value={loading ? "..." : dashboardStats.criticalAlerts}
                  label="Critical Alerts"
                  helper="Rejected, infected, unsafe, or failed"
                  active={dashboardStats.criticalAlerts > 0}
                />

                <StatCard
                  icon={<Radar size={20} />}
                  value={loading ? "..." : dashboardStats.safeSandboxCount}
                  label="Sandbox Safe"
                  helper="Documents that passed sandbox"
                  trend={`${data.sandboxSummary?.not_tested_documents ?? 0} not tested`}
                  trendColor="text-orange-400"
                />

                <StatCard
                  icon={<LockKeyhole size={20} />}
                  value={loading ? "..." : dashboardStats.encryptedCount}
                  label="Encrypted"
                  helper="Protected at rest"
                  trend={`${dashboardStats.aiReady} AI ready`}
                  trendColor="text-purple-400"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-blue-500/20 bg-blue-600/5 p-5">
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <Info size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-blue-400">
                        Security Pipeline
                      </h5>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {dashboardStats.pendingSecurity} document
                        {dashboardStats.pendingSecurity === 1 ? "" : "s"} need
                        scan, sandbox, or security review.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-600/5 p-5">
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <ScanSearch size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-emerald-400">
                        Search Ready
                      </h5>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {dashboardStats.plaintextCount} document
                        {dashboardStats.plaintextCount === 1 ? "" : "s"} have
                        plaintext/OCR extracted.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-purple-600/5 p-5">
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <BrainCircuit size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-purple-400">
                        AI Intelligence
                      </h5>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {data.aiSummary?.analyzed_documents ?? 0} analyzed,{" "}
                        {dashboardStats.aiReady} ready for AI.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <section className="overflow-hidden rounded-2xl border border-slate-800/50 bg-[#141426] shadow-xl shadow-black/20">
                <div className="flex items-center justify-between border-b border-slate-800/50 bg-slate-900/30 px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <CheckCircle2 size={18} />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      My Tasks From Database
                    </h3>
                  </div>

                  <Link
                    to="/alldocuments"
                    className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-500 transition-colors hover:text-blue-400"
                  >
                    Open Documents
                  </Link>
                </div>

                <div className="divide-y divide-slate-800/30">
                  {loading ? (
                    <div className="flex items-center justify-center gap-3 p-8 text-sm text-slate-500">
                      <Loader2 size={18} className="animate-spin" />
                      Loading tasks...
                    </div>
                  ) : tasks.length > 0 ? (
                    tasks.map((task) => <TaskItem key={task.id} task={task} />)
                  ) : (
                    <div className="p-6">
                      <EmptyState
                        icon={<CheckCircle2 size={28} />}
                        title="No pending document task"
                        text="All loaded documents are currently clear for the main security and AI workflow checks."
                      />
                    </div>
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-800/50 bg-[#141426]">
                <div className="flex items-center justify-between border-b border-slate-800/50 px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <History size={18} className="text-slate-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Recent Document Activity
                    </h3>
                  </div>

                  <Link
                    to="/alldocuments"
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    View Library
                  </Link>
                </div>

                <div>
                  {loading ? (
                    <div className="flex items-center justify-center gap-3 p-8 text-sm text-slate-500">
                      <Loader2 size={18} className="animate-spin" />
                      Loading activity...
                    </div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <div className="p-6">
                      <EmptyState
                        icon={<History size={28} />}
                        title="No recent activity"
                        text="Upload documents under a project to start seeing real activity here."
                      />
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="col-span-12 space-y-8 lg:col-span-4">
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Quick Access From Documents
                  </h3>
                  <button className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800">
                    <MoreVertical size={16} />
                  </button>
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="h-36 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50"
                      />
                    ))}
                  </div>
                ) : quickDocuments.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {quickDocuments.map((document) => (
                      <QuickAccessCard
                        key={String(document.id)}
                        document={document}
                      />
                    ))}

                    <Link
                      to="/Projects"
                      className="group flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-800 bg-[#1a1a2e]/50 transition-all hover:border-slate-700 hover:bg-slate-800/20"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition-transform group-hover:scale-110">
                        <Plus className="text-slate-500" size={24} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        New Project
                      </span>
                    </Link>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Files size={28} />}
                    title="No documents yet"
                    text="Create a project first, then upload documents to see quick access."
                  />
                )}
              </section>

              <section className="rounded-2xl border border-slate-800/50 bg-[#141426] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Active / Recent Projects
                  </h3>
                  <Link to="/Projects" className="text-blue-500 hover:text-blue-400">
                    <Plus size={18} />
                  </Link>
                </div>

                <div className="space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center gap-3 p-8 text-sm text-slate-500">
                      <Loader2 size={18} className="animate-spin" />
                      Loading projects...
                    </div>
                  ) : pinnedProjects.length > 0 ? (
                    pinnedProjects.map((item) => (
                      <PinnedProject
                        key={String(item.project.id)}
                        project={item.project}
                        count={item.count}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={<FolderOpen size={28} />}
                      title="No project found"
                      text="Projects from your database will appear here after creation."
                    />
                  )}
                </div>
              </section>

              <section className="relative overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/40 p-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Workflow Health
                </h3>

                <div className="space-y-4">
                  <HealthRow
                    label="Antivirus Clean"
                    value={data.documents.filter(isScanClean).length}
                    total={data.documents.length}
                    icon={<ShieldCheck size={15} />}
                  />

                  <HealthRow
                    label="Sandbox Safe"
                    value={data.documents.filter(isSandboxSafe).length}
                    total={data.documents.length}
                    icon={<Radar size={15} />}
                  />

                  <HealthRow
                    label="Plaintext Ready"
                    value={data.documents.filter(isPlaintextExtracted).length}
                    total={data.documents.length}
                    icon={<ScanSearch size={15} />}
                  />

                  <HealthRow
                    label="Encrypted"
                    value={data.documents.filter(isEncrypted).length}
                    total={data.documents.length}
                    icon={<LockKeyhole size={15} />}
                  />

                  <HealthRow
                    label="AI Analyzed"
                    value={data.documents.filter(isAiAnalyzed).length}
                    total={data.documents.length}
                    icon={<BrainCircuit size={15} />}
                  />
                </div>

                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-blue-600/5 blur-2xl" />
              </section>

              <section className="rounded-2xl border border-slate-800/50 bg-[#141426] p-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Database Summary
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric
                    icon={<FolderOpen size={16} />}
                    label="Projects"
                    value={data.projects.length}
                  />
                  <MiniMetric
                    icon={<Files size={16} />}
                    label="Documents"
                    value={data.documents.length}
                  />
                  <MiniMetric
                    icon={<Archive size={16} />}
                    label="Archived"
                    value={
                      data.documents.filter(
                        (document) => toLower(document.status) === "archived"
                      ).length
                    }
                  />
                  <MiniMetric
                    icon={<Users size={16} />}
                    label="Uploaders"
                    value={
                      new Set(
                        data.documents
                          .map((document) => document.uploader?.id)
                          .filter(Boolean)
                      ).size
                    }
                  />
                  <MiniMetric
                    icon={<GitBranch size={16} />}
                    label="Versions"
                    value={
                      data.documents.filter(
                        (document) => Number(document.version_number || 0) > 1
                      ).length
                    }
                  />
                  <MiniMetric
                    icon={<BarChart3 size={16} />}
                    label="AI Done"
                    value={data.documents.filter(isAiAnalyzed).length}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function HealthRow({
  label,
  value,
  total,
  icon,
}: {
  label: string;
  value: number;
  total: number;
  icon: ReactNode;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <span className="text-blue-400">{icon}</span>
          {label}
        </div>

        <span className="text-xs text-slate-500">
          {value}/{total}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <div className="mb-2 text-blue-400">{icon}</div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}