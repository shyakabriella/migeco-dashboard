import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Filter,
  FolderOpen,
  Loader2,
  MapPin,
  Mountain,
  PenTool,
  Plus,
  Puzzle,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import AdminSidebar from "../../AdminSidebar";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "../../../../services/dmsApi";

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

type ProjectRecord = {
  id: number | string;
  name: string;
  code?: string | null;
  description?: string | null;
  location_name?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  project_type?: string | null;
  status?: string | null;
  security_level?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  creator?: {
    id?: number | string;
    name?: string;
    email?: string;
  } | null;
  documents_count?: number;
  document_count?: number;
  documents?: unknown[];
  metadata?: Record<string, unknown> | null;
};

type ProjectFormState = {
  name: string;
  code: string;
  description: string;
  location_name: string;
  latitude: string;
  longitude: string;
  project_type:
    | "geological_survey"
    | "construction"
    | "technical_study"
    | "mining"
    | "administration"
    | "other";
  status: "planned" | "active" | "completed" | "archived";
  security_level: "public" | "internal" | "confidential" | "restricted";
  start_date: string;
  end_date: string;
};

const emptyForm: ProjectFormState = {
  name: "",
  code: "",
  description: "",
  location_name: "",
  latitude: "",
  longitude: "",
  project_type: "other",
  status: "planned",
  security_level: "internal",
  start_date: "",
  end_date: "",
};

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Planned", value: "planned" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

const projectTypeOptions = [
  { label: "All Types", value: "" },
  { label: "Geological Survey", value: "geological_survey" },
  { label: "Construction", value: "construction" },
  { label: "Technical Study", value: "technical_study" },
  { label: "Mining", value: "mining" },
  { label: "Administration", value: "administration" },
  { label: "Other", value: "other" },
];

const securityOptions = [
  { label: "All Security", value: "" },
  { label: "Public", value: "public" },
  { label: "Internal", value: "internal" },
  { label: "Confidential", value: "confidential" },
  { label: "Restricted", value: "restricted" },
];

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function toLower(value?: string | null): string {
  return value ? value.toLowerCase() : "";
}

function getReadableStatus(value?: string | null): string {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function formatDate(date?: string | null): string {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getProjectDocumentsCount(project: ProjectRecord): number {
  if (typeof project.documents_count === "number") return project.documents_count;
  if (typeof project.document_count === "number") return project.document_count;
  if (Array.isArray(project.documents)) return project.documents.length;

  return 0;
}

function getProjectProgress(project: ProjectRecord): number {
  if (typeof project.metadata?.progress === "number") {
    return project.metadata.progress;
  }

  const status = toLower(project.status);

  if (status === "completed") return 100;
  if (status === "active") return 45;
  if (status === "planned") return 10;
  if (status === "archived") return 100;

  return 0;
}

function getStatusClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "planned":
      return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    case "completed":
      return "text-purple-400 bg-purple-400/10 border-purple-400/20";
    case "archived":
      return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    default:
      return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  }
}

function getSecurityClass(securityLevel?: string | null): string {
  switch (toLower(securityLevel)) {
    case "public":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "internal":
      return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    case "confidential":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "restricted":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    default:
      return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  }
}

function getProjectIcon(project: ProjectRecord) {
  const type = toLower(project.project_type);

  if (type === "geological_survey" || type === "mining") {
    return {
      Icon: Mountain,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10",
      progressColor: "bg-purple-500",
      progressBg: "bg-purple-500/20",
    };
  }

  if (type === "construction") {
    return {
      Icon: Building2,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      progressColor: "bg-blue-500",
      progressBg: "bg-blue-500/20",
    };
  }

  if (type === "technical_study") {
    return {
      Icon: Puzzle,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      progressColor: "bg-amber-500",
      progressBg: "bg-amber-500/20",
    };
  }

  if (type === "administration") {
    return {
      Icon: PenTool,
      iconColor: "text-teal-400",
      iconBg: "bg-teal-500/10",
      progressColor: "bg-teal-500",
      progressBg: "bg-teal-500/20",
    };
  }

  return {
    Icon: FolderOpen,
    iconColor: "text-slate-400",
    iconBg: "bg-slate-500/10",
    progressColor: "bg-slate-500",
    progressBg: "bg-slate-500/20",
  };
}

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError;

  if (apiError.status === 401) {
    return "Your session expired. Please login again.";
  }

  if (apiError.status === 403) {
    return apiError.message || "You do not have permission.";
  }

  if (apiError.status === 422) {
    return apiError.message || "Validation failed. Please check the form.";
  }

  return apiError.message || "Action failed. Please try again.";
}

function projectToForm(project: ProjectRecord): ProjectFormState {
  return {
    name: project.name || "",
    code: project.code || "",
    description: project.description || "",
    location_name: project.location_name || "",
    latitude: project.latitude ? String(project.latitude) : "",
    longitude: project.longitude ? String(project.longitude) : "",
    project_type:
      (project.project_type as ProjectFormState["project_type"]) || "other",
    status: (project.status as ProjectFormState["status"]) || "planned",
    security_level:
      (project.security_level as ProjectFormState["security_level"]) ||
      "internal",
    start_date: project.start_date ? String(project.start_date).slice(0, 10) : "",
    end_date: project.end_date ? String(project.end_date).slice(0, 10) : "",
  };
}

function formToPayload(form: ProjectFormState) {
  return {
    name: form.name.trim(),
    code: form.code.trim() || null,
    description: form.description.trim() || null,
    location_name: form.location_name.trim() || null,
    latitude: form.latitude.trim() || null,
    longitude: form.longitude.trim() || null,
    project_type: form.project_type,
    status: form.status,
    security_level: form.security_level,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    metadata: {
      progress: form.status === "completed" ? 100 : form.status === "active" ? 45 : 10,
      source: "dms_frontend",
      workflow: "project_first_document_management",
    },
  };
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(
    null
  );

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [projectType, setProjectType] = useState("");
  const [securityLevel, setSecurityLevel] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [alert, setAlert] = useState<AlertState | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(
    null
  );
  const [form, setForm] = useState<ProjectFormState>(emptyForm);

  const filters = useMemo(() => {
    return {
      search,
      status,
      project_type: projectType,
      security_level: securityLevel,
    };
  }, [search, status, projectType, securityLevel]);

  async function loadProjects(): Promise<void> {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = (await getProjects(filters)) as unknown as ProjectRecord[];

      setProjects(data);

      setSelectedProject((current) => {
        if (!data.length) return null;
        if (!current) return data[0];

        return data.find((project) => project.id === current.id) || data[0];
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  function openCreateModal(): void {
    setEditingProject(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(project: ProjectRecord): void {
    setEditingProject(project);
    setForm(projectToForm(project));
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!form.name.trim()) {
      setAlert({
        type: "error",
        message: "Project name is required.",
      });
      return;
    }

    try {
      setSaving(true);
      setAlert(null);

      if (editingProject) {
        await updateProject(editingProject.id, formToPayload(form));

        setAlert({
          type: "success",
          message: "Project updated successfully.",
        });
      } else {
        await createProject(formToPayload(form));

        setAlert({
          type: "success",
          message: "Project created successfully.",
        });
      }

      setIsModalOpen(false);
      setEditingProject(null);
      setForm(emptyForm);

      await loadProjects();
    } catch (error) {
      setAlert({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProject(project: ProjectRecord): Promise<void> {
    const confirmed = window.confirm(
      `Are you sure you want to delete/archive "${project.name}"?`
    );

    if (!confirmed) return;

    try {
      setAlert(null);

      await deleteProject(project.id);

      setAlert({
        type: "success",
        message: "Project deleted or archived successfully.",
      });

      await loadProjects();
    } catch (error) {
      setAlert({
        type: "error",
        message: getErrorMessage(error),
      });
    }
  }

  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (project) => toLower(project.status) === "active"
  ).length;
  const completedProjects = projects.filter(
    (project) => toLower(project.status) === "completed"
  ).length;
  const restrictedProjects = projects.filter(
    (project) => toLower(project.security_level) === "restricted"
  ).length;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #2a2e3f;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #3a3e52;
            }
            .project-form-input {
              width: 100%;
              border-radius: 0.75rem;
              border: 1px solid #2a2e3f;
              background: #0d0f17;
              padding: 0.75rem 1rem;
              font-size: 0.875rem;
              color: white;
              outline: none;
              transition: all 0.2s ease;
            }
            .project-form-input:focus {
              border-color: rgba(80, 81, 249, 0.65);
              box-shadow: 0 0 0 2px rgba(80, 81, 249, 0.12);
            }
            .project-form-input::placeholder {
              color: #64748b;
            }
          `,
        }}
      />

      <div className="flex h-screen w-full overflow-hidden bg-[#13151b] font-sans text-slate-300 selection:bg-[#5051F9]/30">
        <AdminSidebar />

        <div className="relative flex h-full min-w-0 flex-1 flex-col">
          <Header
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
          />

          <main className="custom-scrollbar relative flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1500px] p-8">
              {alert && (
                <AlertBox
                  type={alert.type}
                  message={alert.message}
                  className="mb-5"
                  onClose={() => setAlert(null)}
                />
              )}

              {errorMessage && (
                <AlertBox
                  type="error"
                  message={errorMessage}
                  className="mb-5"
                />
              )}

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  title="Total Projects"
                  value={String(totalProjects)}
                  helper="All visible project records"
                  icon={<FolderOpen size={18} />}
                />

                <SummaryCard
                  title="Active Projects"
                  value={String(activeProjects)}
                  helper="Currently running sites"
                  icon={<Activity size={18} />}
                  tone="success"
                />

                <SummaryCard
                  title="Completed"
                  value={String(completedProjects)}
                  helper="Finished / archived work"
                  icon={<CheckCircle2 size={18} />}
                  tone="info"
                />

                <SummaryCard
                  title="Restricted"
                  value={String(restrictedProjects)}
                  helper="High security projects"
                  icon={<ShieldCheck size={18} />}
                  tone="danger"
                />
              </div>

              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-white">
                    Projects / Sites
                  </h1>
                  <p className="text-sm text-slate-400">
                    Start with a project, then upload documents under that
                    project.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <FilterSelect
                    value={status}
                    onChange={setStatus}
                    options={statusOptions}
                    icon={<Filter size={16} />}
                  />

                  <FilterSelect
                    value={projectType}
                    onChange={setProjectType}
                    options={projectTypeOptions}
                  />

                  <FilterSelect
                    value={securityLevel}
                    onChange={setSecurityLevel}
                    options={securityOptions}
                  />

                  <button
                    type="button"
                    onClick={loadProjects}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[#2a2e3f] bg-[#1a1d27] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white/5"
                  >
                    <RefreshCcw size={16} className="text-slate-400" />
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#5051F9] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#5051F9]/25 transition-colors hover:bg-[#4344e6]"
                  >
                    <Plus size={16} />
                    New Project
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {loading ? (
                  <LoadingPanel />
                ) : projects.length === 0 ? (
                  <EmptyPanel onCreate={openCreateModal} />
                ) : (
                  projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      selected={selectedProject?.id === project.id}
                      onSelect={() => setSelectedProject(project)}
                      onEdit={() => openEditModal(project)}
                      onDelete={() => handleDeleteProject(project)}
                    />
                  ))
                )}
              </div>

              <div className="mt-8 flex items-center justify-between pb-4">
                <div className="text-xs font-medium text-slate-500">
                  Showing {projects.length} project
                  {projects.length === 1 ? "" : "s"}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2e3f] bg-[#161923] text-slate-400 opacity-50 shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5051F9] text-sm font-medium text-white shadow-md shadow-[#5051F9]/20"
                  >
                    1
                  </button>

                  <button
                    type="button"
                    disabled
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2e3f] bg-[#161923] text-slate-400 opacity-50 shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {isModalOpen && (
          <ProjectFormModal
            title={editingProject ? "Update Project" : "Create Project"}
            form={form}
            saving={saving}
            onChange={setForm}
            onClose={() => {
              setIsModalOpen(false);
              setEditingProject(null);
              setForm(emptyForm);
            }}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </>
  );
}

function Header({
  searchInput,
  onSearchInputChange,
}: {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1e2230] bg-[#13151b] px-8 text-sm">
      <div className="flex items-center text-slate-400">
        <span>Organization</span>
        <span className="mx-2">/</span>
        <span className="font-medium text-white">Projects</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden w-72 md:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Quick find project..."
            className="w-full rounded-full border border-[#1e2230] bg-[#0d0f17] py-1.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-[#5051F9]/50 focus:outline-none"
          />
        </div>

        <button
          type="button"
          className="relative text-slate-400 transition-colors hover:text-white"
        >
          <Bell size={20} />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-[#13151b] bg-red-500" />
        </button>

        <div className="group flex cursor-pointer items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium leading-tight text-white">
              DMS User
            </div>
            <div className="text-xs text-slate-500">
              Document Management
            </div>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2a2e3f] bg-[#5051F9]/20 text-xs font-semibold text-white transition-colors group-hover:border-slate-500">
            DU
          </div>

          <ChevronDown
            size={16}
            className="text-slate-500 transition-colors group-hover:text-white"
          />
        </div>
      </div>
    </header>
  );
}

function ProjectCard({
  project,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  project: ProjectRecord;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const iconConfig = getProjectIcon(project);
  const Icon = iconConfig.Icon;
  const progress = getProjectProgress(project);
  const documentCount = getProjectDocumentsCount(project);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSelect();
      }}
      className={cn(
        "group flex flex-col gap-5 rounded-2xl border bg-[#161923] p-5 transition-all duration-200 xl:flex-row xl:items-center",
        selected
          ? "border-[#5051F9]/60 shadow-lg shadow-[#5051F9]/10"
          : "border-[#1e2230] hover:border-[#2a2e3f]"
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/5 shadow-sm",
            iconConfig.iconBg
          )}
        >
          <Icon className={iconConfig.iconColor} size={24} strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="mb-1.5 flex flex-wrap items-center gap-3">
            <h3 className="truncate text-base font-medium text-white transition-colors group-hover:text-white/90">
              {project.name}
            </h3>

            <span
              className={cn(
                "rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                getStatusClass(project.status)
              )}
            >
              {getReadableStatus(project.status)}
            </span>

            <span
              className={cn(
                "rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                getSecurityClass(project.security_level)
              )}
            >
              {getReadableStatus(project.security_level)}
            </span>
          </div>

          <p className="mb-3 truncate text-sm text-slate-400">
            {project.description || "No project description provided."}
          </p>

          <div className="flex flex-wrap items-center gap-5 text-[13px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="opacity-70" />
              <span>Started: {formatDate(project.start_date)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="opacity-70" />
              <span className="truncate">
                {project.location_name || "No location"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <FolderOpen size={14} className="opacity-70" />
              <span>{project.code || "Auto code"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col justify-center border-white/5 xl:w-56 xl:border-l xl:pl-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs font-bold text-white">{progress}%</span>
        </div>

        <div
          className={cn(
            "mb-2 h-1.5 w-full overflow-hidden rounded-full",
            iconConfig.progressBg
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              iconConfig.progressColor
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="truncate text-[11px] text-slate-500">
          {toLower(project.status) === "archived"
            ? "Archived"
            : toLower(project.status) === "completed"
            ? "Completed"
            : project.end_date
            ? `Estimated completion: ${formatDate(project.end_date)}`
            : "No completion date"}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-4 border-white/5 xl:w-[360px] xl:border-l xl:pl-4">
        <div className="w-24 shrink-0 text-center">
          <div className="mb-1 text-lg font-bold leading-none text-white">
            {documentCount}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Documents
          </div>
        </div>

        <Link
          to={`/Projects/${project.id}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex w-[110px] items-center justify-center gap-2 rounded-lg border border-[#2a2e3f] bg-[#1a1d27] px-4 py-2.5 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-white/5 hover:text-white"
        >
          <Eye size={15} />
          Open
        </Link>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="rounded-lg border border-[#2a2e3f] bg-[#1a1d27] p-2.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Edit3 size={16} />
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-red-300 transition-colors hover:bg-red-500/20"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function ProjectFormModal({
  title,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  title: string;
  form: ProjectFormState;
  saving: boolean;
  onChange: (form: ProjectFormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  function updateField<K extends keyof ProjectFormState>(
    field: K,
    value: ProjectFormState[K]
  ) {
    onChange({
      ...form,
      [field]: value,
    });
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-[#2a2e3f] bg-[#13151b] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1e2230] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create the project first, then upload documents under it.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-[#2a2e3f] p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="custom-scrollbar max-h-[calc(92vh-84px)] overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <FormField label="Project Name" required>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="project-form-input"
                placeholder="e.g. Kigali Geological Survey"
              />
            </FormField>

            <FormField label="Project Code">
              <input
                value={form.code}
                onChange={(event) => updateField("code", event.target.value)}
                className="project-form-input"
                placeholder="Leave empty for auto code"
              />
            </FormField>

            <FormField label="Project Type">
              <select
                value={form.project_type}
                onChange={(event) =>
                  updateField(
                    "project_type",
                    event.target.value as ProjectFormState["project_type"]
                  )
                }
                className="project-form-input"
              >
                {projectTypeOptions
                  .filter((option) => option.value)
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value as ProjectFormState["status"]
                  )
                }
                className="project-form-input"
              >
                {statusOptions
                  .filter((option) => option.value)
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </FormField>

            <FormField label="Security Level">
              <select
                value={form.security_level}
                onChange={(event) =>
                  updateField(
                    "security_level",
                    event.target.value as ProjectFormState["security_level"]
                  )
                }
                className="project-form-input"
              >
                {securityOptions
                  .filter((option) => option.value)
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </FormField>

            <FormField label="Location Name">
              <input
                value={form.location_name}
                onChange={(event) =>
                  updateField("location_name", event.target.value)
                }
                className="project-form-input"
                placeholder="e.g. Kigali, Rwanda"
              />
            </FormField>

            <FormField label="Latitude">
              <input
                value={form.latitude}
                onChange={(event) => updateField("latitude", event.target.value)}
                className="project-form-input"
                placeholder="-1.9441"
              />
            </FormField>

            <FormField label="Longitude">
              <input
                value={form.longitude}
                onChange={(event) => updateField("longitude", event.target.value)}
                className="project-form-input"
                placeholder="30.0619"
              />
            </FormField>

            <FormField label="Start Date">
              <input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  updateField("start_date", event.target.value)
                }
                className="project-form-input"
              />
            </FormField>

            <FormField label="End Date">
              <input
                type="date"
                value={form.end_date}
                onChange={(event) => updateField("end_date", event.target.value)}
                className="project-form-input"
              />
            </FormField>
          </div>

          <FormField label="Description" className="mt-5">
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={5}
              className="project-form-input resize-none"
              placeholder="Write project purpose, scope, site notes..."
            />
          </FormField>

          <div className="mt-6 rounded-2xl border border-[#2a2e3f] bg-[#0d0f17] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck size={17} className="text-[#5051F9]" />
              Project-first rule
            </div>

            <p className="text-sm leading-6 text-slate-400">
              After saving this project, open the project workspace and upload
              documents under this project. That keeps security scanning,
              reports, access, and search organized by project.
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#2a2e3f] px-5 py-3 text-sm text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5051F9] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4344e6] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AlertBox({
  type,
  message,
  className = "",
  onClose,
}: {
  type: AlertState["type"];
  message: string;
  className?: string;
  onClose?: () => void;
}) {
  const style =
    type === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : type === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-blue-500/20 bg-blue-500/10 text-blue-300";

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error"
      ? AlertCircle
      : ShieldCheck;

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${style} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 opacity-80"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm text-slate-400">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  icon?: ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-3 text-slate-500">{icon}</span>
      )}

      <select
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onChange(event.target.value)
        }
        className={`w-full rounded-lg border border-[#2a2e3f] bg-[#1a1d27] py-2.5 pr-4 text-sm text-white outline-none transition-colors focus:border-[#5051F9]/60 sm:w-52 ${
          icon ? "pl-9" : "pl-3"
        }`}
      >
        {options.map((option) => (
          <option
            key={option.value || option.label}
            value={option.value}
            className="bg-[#13151b]"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  icon,
  tone = "default",
}: {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone?: "default" | "success" | "info" | "danger";
}) {
  const toneClass = {
    default: "bg-[#5051F9]/10 text-[#8183ff] border-[#5051F9]/20",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    info: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    danger: "bg-red-500/10 text-red-300 border-red-500/20",
  }[tone];

  return (
    <div className="rounded-2xl border border-[#1e2230] bg-[#161923] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-600">{helper}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="rounded-2xl border border-[#1e2230] bg-[#161923] p-10">
      <div className="flex items-center justify-center gap-3 text-slate-400">
        <Loader2 size={22} className="animate-spin" />
        Loading projects...
      </div>
    </div>
  );
}

function EmptyPanel({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-[#1e2230] bg-[#161923] p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5051F9]/10 text-[#8183ff]">
        <FolderOpen size={26} />
      </div>

      <h3 className="text-lg font-semibold text-white">No projects found</h3>
      <p className="mt-2 text-sm text-slate-500">
        Create your first project before uploading documents.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#5051F9] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4344e6]"
      >
        <Plus size={16} />
        New Project
      </button>
    </div>
  );
}