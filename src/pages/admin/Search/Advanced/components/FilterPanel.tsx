import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Archive,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  FolderOpen,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  User,
  X,
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

type FilterBadge = {
  key: keyof AdvancedFilterState;
  label: string;
  clearValue: string | boolean;
};

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

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function getOptionLabel(
  options: FilterOption[],
  value: string,
  fallback = value
): string {
  return options.find((option) => option.value === value)?.label || fallback;
}

function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition",
        "focus:outline-none focus:ring-4 focus:ring-blue-100",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-blue-600" : "bg-slate-300"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function FieldLabel({
  children,
  optional = false,
}: {
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label className="text-[11px] font-semibold text-slate-600">
        {children}
      </label>

      {optional && (
        <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
          Optional
        </span>
      )}
    </div>
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
    <div className="min-w-0">
      <FieldLabel>{label}</FieldLabel>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-11 w-full cursor-pointer appearance-none rounded-xl",
            "border border-slate-200 bg-white pr-10 text-sm text-slate-700",
            "outline-none transition",
            "hover:border-slate-300",
            "focus:border-blue-400 focus:ring-4 focus:ring-blue-50",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
            icon ? "pl-10" : "pl-3"
          )}
        >
          {options.map((option) => (
            <option key={`${label}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
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
  optional = false,
  onChange,
  onEnter,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon?: ReactNode;
  type?: string;
  disabled?: boolean;
  optional?: boolean;
  onChange: (value: string) => void;
  onEnter?: () => void;
}) {
  return (
    <div className="min-w-0">
      <FieldLabel optional={optional}>{label}</FieldLabel>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && onEnter) {
              event.preventDefault();
              onEnter();
            }
          }}
          className={cn(
            "h-11 w-full rounded-xl border border-slate-200 bg-white pr-3",
            "text-sm text-slate-700 outline-none transition",
            "placeholder:text-slate-400",
            "hover:border-slate-300",
            "focus:border-blue-400 focus:ring-4 focus:ring-blue-50",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
            icon ? "pl-10" : "pl-3"
          )}
        />
      </div>
    </div>
  );
}

function ToggleCard({
  icon,
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition",
        checked
          ? "border-blue-200 bg-blue-50/70"
          : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            checked
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500"
          )}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <Toggle
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
  disabled,
}: {
  label: string;
  onRemove: () => void;
  disabled: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
      <span className="max-w-[220px] truncate">{label}</span>

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="flex h-4 w-4 items-center justify-center rounded-full text-blue-400 transition hover:bg-blue-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Remove ${label}`}
        title={`Remove ${label}`}
      >
        <X size={11} />
      </button>
    </span>
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
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);

  const projectOptions = useMemo<FilterOption[]>(
    () => [
      {
        label: projects.length > 0 ? "All Projects" : "No projects available",
        value: "",
      },
      ...projects,
    ],
    [projects]
  );

  const categoryOptions = useMemo<FilterOption[]>(
    () => [
      {
        label:
          categories.length > 0
            ? "All Categories"
            : "No categories available",
        value: "",
      },
      ...categories,
    ],
    [categories]
  );

  const documentTypeOptions = useMemo<FilterOption[]>(
    () => [
      {
        label:
          documentTypes.length > 0
            ? "All Document Types"
            : "No document types available",
        value: "",
      },
      ...documentTypes,
    ],
    [documentTypes]
  );

  const authorOptions = useMemo<FilterOption[]>(
    () => [
      {
        label: authors.length > 0 ? "All Uploaders" : "No uploaders available",
        value: "",
      },
      ...authors,
    ],
    [authors]
  );

  const activeFilters = useMemo<FilterBadge[]>(() => {
    const badges: FilterBadge[] = [];

    if (filters.keyword.trim()) {
      badges.push({
        key: "keyword",
        label: `Keyword: ${filters.keyword.trim()}`,
        clearValue: "",
      });
    }

    if (filters.projectId) {
      badges.push({
        key: "projectId",
        label: `Project: ${getOptionLabel(projects, filters.projectId)}`,
        clearValue: "",
      });
    }

    if (filters.categoryId) {
      badges.push({
        key: "categoryId",
        label: `Category: ${getOptionLabel(categories, filters.categoryId)}`,
        clearValue: "",
      });
    }

    if (filters.documentType) {
      badges.push({
        key: "documentType",
        label: `Type: ${getOptionLabel(
          documentTypes,
          filters.documentType
        )}`,
        clearValue: "",
      });
    }

    if (filters.securityLevel) {
      badges.push({
        key: "securityLevel",
        label: `Security: ${getOptionLabel(
          securityLevelOptions,
          filters.securityLevel
        )}`,
        clearValue: "",
      });
    }

    if (filters.status) {
      badges.push({
        key: "status",
        label: `Status: ${getOptionLabel(statusOptions, filters.status)}`,
        clearValue: "",
      });
    }

    if (filters.scanStatus) {
      badges.push({
        key: "scanStatus",
        label: `Scan: ${getOptionLabel(
          scanStatusOptions,
          filters.scanStatus
        )}`,
        clearValue: "",
      });
    }

    if (filters.authorId) {
      badges.push({
        key: "authorId",
        label: `Uploader: ${getOptionLabel(authors, filters.authorId)}`,
        clearValue: "",
      });
    }

    if (filters.dateFrom) {
      badges.push({
        key: "dateFrom",
        label: `From: ${filters.dateFrom}`,
        clearValue: "",
      });
    }

    if (filters.dateTo) {
      badges.push({
        key: "dateTo",
        label: `To: ${filters.dateTo}`,
        clearValue: "",
      });
    }

    if (filters.searchWithinContent) {
      badges.push({
        key: "searchWithinContent",
        label: "OCR content enabled",
        clearValue: false,
      });
    }

    if (filters.includeArchived) {
      badges.push({
        key: "includeArchived",
        label: "Archived included",
        clearValue: false,
      });
    }

    return badges;
  }, [authors, categories, documentTypes, filters, projects]);

  const activeFilterCount = activeFilters.length;

  function handleReset(): void {
    onReset();
    setShowAdvancedFilters(false);
  }

  function clearFilter(badge: FilterBadge): void {
    if (badge.key === "searchWithinContent") {
      onChange("searchWithinContent", false);
      return;
    }

    if (badge.key === "includeArchived") {
      onChange("includeArchived", false);
      return;
    }

    onChange(
      badge.key as Exclude<
        keyof AdvancedFilterState,
        "searchWithinContent" | "includeArchived"
      >,
      "" as AdvancedFilterState[Exclude<
        keyof AdvancedFilterState,
        "searchWithinContent" | "includeArchived"
      >]
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SlidersHorizontal size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Advanced Document Filters
              </h2>

              {activeFilterCount > 0 && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                  {activeFilterCount} active
                </span>
              )}
            </div>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              Narrow the document list using project, category, workflow,
              uploader, security level, date range and extracted content.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading || activeFilterCount === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            type="button"
            onClick={onApply}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <CheckCircle2 size={16} />
            )}

            {loading ? "Applying..." : "Apply Filters"}
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <TextField
              label="Search keyword"
              value={filters.keyword}
              disabled={loading}
              placeholder="Search title, document code, project or tag..."
              icon={<Search size={16} />}
              onChange={(value) => onChange("keyword", value)}
              onEnter={onApply}
            />
          </div>

          <div className="lg:col-span-4">
            <SelectField
              label="Project"
              value={filters.projectId}
              disabled={loading}
              options={projectOptions}
              icon={<FolderOpen size={16} />}
              onChange={(value) => onChange("projectId", value)}
            />
          </div>

          <div className="lg:col-span-3">
            <SelectField
              label="Category"
              value={filters.categoryId}
              disabled={loading}
              options={categoryOptions}
              icon={<Tags size={16} />}
              onChange={(value) => onChange("categoryId", value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {activeFilters.length > 0 ? (
              activeFilters.slice(0, 6).map((badge) => (
                <FilterChip
                  key={String(badge.key)}
                  label={badge.label}
                  disabled={loading}
                  onRemove={() => clearFilter(badge)}
                />
              ))
            ) : (
              <p className="text-xs text-slate-400">
                No filters selected. The full document list will be shown.
              </p>
            )}

            {activeFilters.length > 6 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                +{activeFilters.length - 6} more
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAdvancedFilters((currentValue) => !currentValue)
            }
            aria-expanded={showAdvancedFilters}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 lg:self-auto"
          >
            {showAdvancedFilters ? "Hide advanced filters" : "More filters"}

            {showAdvancedFilters ? (
              <ChevronUp size={15} />
            ) : (
              <ChevronDown size={15} />
            )}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Additional filter options
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Use only the filters needed for your search.
                </p>
              </div>

              <span className="hidden rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 sm:inline-flex">
                Optional
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SelectField
                label="Document type"
                value={filters.documentType}
                disabled={loading}
                options={documentTypeOptions}
                icon={<FileText size={15} />}
                onChange={(value) => onChange("documentType", value)}
              />

              <SelectField
                label="Workflow status"
                value={filters.status}
                disabled={loading}
                options={statusOptions}
                icon={<Activity size={15} />}
                onChange={(value) => onChange("status", value)}
              />

              <SelectField
                label="Scan status"
                value={filters.scanStatus}
                disabled={loading}
                options={scanStatusOptions}
                icon={<ShieldCheck size={15} />}
                onChange={(value) => onChange("scanStatus", value)}
              />

              <SelectField
                label="Security level"
                value={filters.securityLevel}
                disabled={loading}
                options={securityLevelOptions}
                icon={<ShieldCheck size={15} />}
                onChange={(value) => onChange("securityLevel", value)}
              />

              <SelectField
                label="Author / uploader"
                value={filters.authorId}
                disabled={loading}
                options={authorOptions}
                icon={<User size={15} />}
                onChange={(value) => onChange("authorId", value)}
              />

              <TextField
                label="From date"
                type="date"
                value={filters.dateFrom}
                disabled={loading}
                placeholder="Select start date"
                icon={<Calendar size={15} />}
                optional
                onChange={(value) => onChange("dateFrom", value)}
              />

              <TextField
                label="To date"
                type="date"
                value={filters.dateTo}
                disabled={loading}
                placeholder="Select end date"
                icon={<Calendar size={15} />}
                optional
                onChange={(value) => onChange("dateTo", value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <ToggleCard
                icon={<Database size={17} />}
                title="Search inside document content"
                description="Include extracted plaintext and OCR content."
                checked={filters.searchWithinContent}
                disabled={loading}
                onChange={() =>
                  onChange(
                    "searchWithinContent",
                    !filters.searchWithinContent
                  )
                }
              />

              <ToggleCard
                icon={<Archive size={17} />}
                title="Include archived documents"
                description="Return archived records together with active files."
                checked={filters.includeArchived}
                disabled={loading}
                onChange={() =>
                  onChange("includeArchived", !filters.includeArchived)
                }
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}