import type { ReactNode } from "react";
import {
  SlidersHorizontal,
  Calendar,
  User,
  Search,
  ChevronDown,
  FolderOpen,
  FileText,
  Tags,
  ShieldCheck,
  Activity,
  X,
  Archive,
  Database,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import type { AdvancedFilterState, FilterOption } from "../Advanced";

interface FilterPanelProps {
  filters: AdvancedFilterState;
  projects: FilterOption[];
  categories: FilterOption[];
  documentTypes: FilterOption[];
  authors: FilterOption[];
  loading?: boolean;
  onChange: <K extends keyof AdvancedFilterState>(
    field: K,
    value: AdvancedFilterState[K]
  ) => void;
  onApply: () => void;
  onReset: () => void;
}

const statusOptions: FilterOption[] = [
  { label: "All Workflow Status", value: "" },
  { label: "Uploaded", value: "uploaded" },
  { label: "Pending Scan", value: "pending_scan" },
  { label: "Scanning", value: "scanning" },
  { label: "Active", value: "active" },
  { label: "Quarantined", value: "quarantined" },
  { label: "Suspicious", value: "suspicious" },
  { label: "Infected", value: "infected" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
];

const scanStatusOptions: FilterOption[] = [
  { label: "All Scan Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Clean", value: "clean" },
  { label: "Suspicious", value: "suspicious" },
  { label: "Infected", value: "infected" },
  { label: "Failed", value: "failed" },
];

const securityLevelOptions: FilterOption[] = [
  { label: "All Security Levels", value: "" },
  { label: "Public", value: "public" },
  { label: "Internal", value: "internal" },
  { label: "Confidential", value: "confidential" },
  { label: "Restricted", value: "restricted" },
];

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-indigo-600" : "bg-[#2a3347]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SelectField({
  label,
  value,
  options,
  icon,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  icon?: ReactNode;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#8b96a8]">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a8]">
            {icon}
          </span>
        )}

        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full cursor-pointer appearance-none rounded-lg border border-[#1e2a3a] bg-[#0d1117] py-2.5 pr-8 text-xs text-white outline-none transition-colors focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${
            icon ? "pl-8" : "pl-3"
          }`}
        >
          {options.map((option) => (
            <option
              key={`${label}-${option.value}`}
              value={option.value}
              className="bg-[#0d1117]"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b96a8]"
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  icon,
  type = "text",
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon?: ReactNode;
  type?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#8b96a8]">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a8]">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-lg border border-[#1e2a3a] bg-[#0d1117] py-2.5 pr-3 text-xs text-white outline-none transition-colors placeholder:text-[#4a5568] focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${
            icon ? "pl-8" : "pl-3"
          }`}
        />
      </div>
    </div>
  );
}

export default function FilterPanel({
  filters,
  projects,
  categories,
  documentTypes,
  authors,
  loading = false,
  onChange,
  onApply,
  onReset,
}: FilterPanelProps) {
  const hasProjects = projects.length > 0;
  const hasCategories = categories.length > 0;
  const hasDocumentTypes = documentTypes.length > 0;
  const hasAuthors = authors.length > 0;

  return (
    <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-5 shadow-lg shadow-black/10">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-indigo-400" />

            <span className="text-sm font-semibold text-white">
              Filter Parameters
            </span>
          </div>

          <p className="mt-1 text-xs text-[#596273]">
            Filter real documents by project, category, uploader, date,
            security, workflow, scan status, and extracted OCR/plaintext.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1e2a3a] bg-transparent px-4 py-1.5 text-xs font-medium text-[#8b96a8] transition-colors hover:bg-[#0d1117] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw size={13} />
            Reset
          </button>

          <button
            type="button"
            onClick={onApply}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 size={13} />
            {loading ? "Applying..." : "Apply Filters"}
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectField
          label="Project"
          value={filters.projectId}
          disabled={loading}
          options={[
            {
              label: hasProjects ? "All Projects" : "No projects found",
              value: "",
            },
            ...projects,
          ]}
          icon={<FolderOpen size={13} />}
          onChange={(value) => onChange("projectId", value)}
        />

        <SelectField
          label="Category"
          value={filters.categoryId}
          disabled={loading}
          options={[
            {
              label: hasCategories ? "All Categories" : "No categories found",
              value: "",
            },
            ...categories,
          ]}
          icon={<Tags size={13} />}
          onChange={(value) => onChange("categoryId", value)}
        />

        <SelectField
          label="Document Type"
          value={filters.documentType}
          disabled={loading}
          options={[
            {
              label: hasDocumentTypes
                ? "All Document Types"
                : "No document types found",
              value: "",
            },
            ...documentTypes,
          ]}
          icon={<FileText size={13} />}
          onChange={(value) => onChange("documentType", value)}
        />

        <SelectField
          label="Security Level"
          value={filters.securityLevel}
          disabled={loading}
          options={securityLevelOptions}
          icon={<ShieldCheck size={13} />}
          onChange={(value) => onChange("securityLevel", value)}
        />

        <SelectField
          label="Workflow Status"
          value={filters.status}
          disabled={loading}
          options={statusOptions}
          icon={<Activity size={13} />}
          onChange={(value) => onChange("status", value)}
        />

        <SelectField
          label="Scan Status"
          value={filters.scanStatus}
          disabled={loading}
          options={scanStatusOptions}
          icon={<ShieldCheck size={13} />}
          onChange={(value) => onChange("scanStatus", value)}
        />

        <SelectField
          label="Author / Uploader"
          value={filters.authorId}
          disabled={loading}
          options={[
            {
              label: hasAuthors ? "All Uploaders" : "No uploaders found",
              value: "",
            },
            ...authors,
          ]}
          icon={<User size={13} />}
          onChange={(value) => onChange("authorId", value)}
        />

        <TextField
          label="Keyword"
          value={filters.keyword}
          disabled={loading}
          placeholder="Title, code, project, tags..."
          icon={<Search size={13} />}
          onChange={(value) => onChange("keyword", value)}
        />

        <TextField
          label="From Date"
          type="date"
          value={filters.dateFrom}
          disabled={loading}
          placeholder="From"
          icon={<Calendar size={13} />}
          onChange={(value) => onChange("dateFrom", value)}
        />

        <TextField
          label="To Date"
          type="date"
          value={filters.dateTo}
          disabled={loading}
          placeholder="To"
          icon={<Calendar size={13} />}
          onChange={(value) => onChange("dateTo", value)}
        />
      </div>

      <div className="rounded-xl border border-[#1e2a3a] bg-[#0d1117]/70 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <label className="flex cursor-pointer select-none items-center gap-2.5">
              <Toggle
                checked={filters.searchWithinContent}
                disabled={loading}
                onChange={() =>
                  onChange("searchWithinContent", !filters.searchWithinContent)
                }
              />

              <span className="inline-flex items-center gap-2 text-xs text-[#8b96a8]">
                <Database size={13} />
                Search within extracted content / OCR
              </span>
            </label>

            <label className="flex cursor-pointer select-none items-center gap-2.5">
              <Toggle
                checked={filters.includeArchived}
                disabled={loading}
                onChange={() =>
                  onChange("includeArchived", !filters.includeArchived)
                }
              />

              <span className="inline-flex items-center gap-2 text-xs text-[#8b96a8]">
                <Archive size={13} />
                Include archived files
              </span>
            </label>
          </div>

          <p className="text-xs text-[#596273]">
            Click <span className="text-indigo-300">Apply Filters</span> after
            changing any option.
          </p>
        </div>
      </div>
    </div>
  );
}