"use client";

import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";

import AdminSidebar from "../AdminSidebar";

type LaravelResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type RoleSummary = {
  id: number;
  name: string;
  slug?: string | null;
  permissions?: string[] | null;
};

type DmsUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  status?: "active" | "inactive" | "suspended" | string | null;
  role?: RoleSummary | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
};

type RegisterPayload = {
  role_id: number | "";
  name: string;
  email: string;
  password: string;
  c_password: string;
  phone: string;
  department: string;
  status: "active" | "inactive" | "suspended";
};

type CreateUserResponse = {
  user?: DmsUser;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const PAGE_SIZE = 7;

const initialForm: RegisterPayload = {
  role_id: "",
  name: "",
  email: "",
  password: "",
  c_password: "",
  phone: "",
  department: "",
  status: "active",
};

const fallbackRoleOptions: RoleSummary[] = [
  { id: 1, name: "Admin", slug: "admin" },
  {
    id: 2,
    name: "Document Controller",
    slug: "document_controller",
  },
  {
    id: 3,
    name: "Project Manager",
    slug: "project_manager",
  },
  {
    id: 4,
    name: "Security Officer",
    slug: "security_officer",
  },
  { id: 5, name: "Geologist", slug: "geologist" },
  { id: 6, name: "Engineer", slug: "engineer" },
  { id: 7, name: "Auditor", slug: "auditor" },
  { id: 8, name: "Viewer", slug: "viewer" },
];

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function getToken(): string | null {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token")
  );
}

function getApiUrl(path: string): string {
  if (path.startsWith("http")) return path;

  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function getErrorMessage(response: unknown, fallback: string): string {
  if (!response || typeof response !== "object") return fallback;

  const row = response as {
    message?: unknown;
    error?: unknown;
    errors?: unknown;
    data?: unknown;
  };

  if (typeof row.message === "string") return row.message;
  if (typeof row.error === "string") return row.error;

  const errorSource =
    row.errors && typeof row.errors === "object"
      ? row.errors
      : row.data && typeof row.data === "object"
      ? row.data
      : null;

  if (errorSource) {
    const errors = errorSource as Record<string, unknown>;
    const firstKey = Object.keys(errors)[0];

    if (firstKey) {
      const firstValue = errors[firstKey];

      if (Array.isArray(firstValue)) {
        return String(firstValue[0] || fallback);
      }

      if (typeof firstValue === "string") {
        return firstValue;
      }
    }
  }

  return fallback;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload,
        `Request failed with status ${response.status}`
      )
    );
  }

  return payload as T;
}

function unwrapLaravelData<T>(response: unknown, fallback: T): T {
  if (!response || typeof response !== "object") {
    return fallback;
  }

  const row = response as LaravelResponse<T>;

  if (row.data !== undefined) {
    return row.data;
  }

  return response as T;
}

function normalizeUser(value: unknown): DmsUser | null {
  if (!value || typeof value !== "object") return null;

  const row = value as Record<string, unknown>;

  if (
    typeof row.id !== "number" &&
    typeof row.id !== "string"
  ) {
    return null;
  }

  if (typeof row.name !== "string" || typeof row.email !== "string") {
    return null;
  }

  return value as DmsUser;
}

function normalizeUsersResponse(response: unknown): DmsUser[] {
  const unwrapped = unwrapLaravelData<unknown>(response, response);

  if (Array.isArray(unwrapped)) {
    return unwrapped
      .map(normalizeUser)
      .filter((user): user is DmsUser => Boolean(user));
  }

  if (unwrapped && typeof unwrapped === "object") {
    const row = unwrapped as Record<string, unknown>;

    const candidates = [
      row.users,
      row.data,
      row.items,
      row.results,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate
          .map(normalizeUser)
          .filter((user): user is DmsUser => Boolean(user));
      }

      if (
        candidate &&
        typeof candidate === "object" &&
        Array.isArray((candidate as Record<string, unknown>).data)
      ) {
        return (
          (candidate as Record<string, unknown>).data as unknown[]
        )
          .map(normalizeUser)
          .filter((user): user is DmsUser => Boolean(user));
      }
    }

    const singleUser = normalizeUser(row.user || unwrapped);

    return singleUser ? [singleUser] : [];
  }

  return [];
}

function normalizeRolesResponse(response: unknown): RoleSummary[] {
  const unwrapped = unwrapLaravelData<unknown>(response, response);

  if (Array.isArray(unwrapped)) {
    return unwrapped as RoleSummary[];
  }

  if (unwrapped && typeof unwrapped === "object") {
    const row = unwrapped as Record<string, unknown>;

    if (Array.isArray(row.roles)) {
      return row.roles as RoleSummary[];
    }

    if (Array.isArray(row.data)) {
      return row.data as RoleSummary[];
    }

    if (
      row.data &&
      typeof row.data === "object" &&
      Array.isArray((row.data as Record<string, unknown>).data)
    ) {
      return (row.data as Record<string, unknown>)
        .data as RoleSummary[];
    }
  }

  return [];
}

async function loadCurrentProfile(): Promise<DmsUser | null> {
  const candidates = ["/me", "/profile", "/user"];

  for (const path of candidates) {
    try {
      const response = await apiRequest<unknown>(path);
      const users = normalizeUsersResponse(response);

      if (users.length > 0) {
        return users[0];
      }
    } catch {
      // Try the next supported profile endpoint.
    }
  }

  return null;
}

async function loadUsers(): Promise<DmsUser[]> {
  const candidates = [
    "/users",
    "/admin/users",
    "/user-management/users",
  ];

  for (const path of candidates) {
    try {
      const response = await apiRequest<unknown>(path);
      const users = normalizeUsersResponse(response);

      if (users.length > 0) {
        return users;
      }
    } catch {
      // Try the next supported endpoint.
    }
  }

  const profile = await loadCurrentProfile();

  return profile ? [profile] : [];
}

async function loadRoles(): Promise<RoleSummary[]> {
  const candidates = ["/roles", "/admin/roles"];

  for (const path of candidates) {
    try {
      const response = await apiRequest<unknown>(path);
      const roles = normalizeRolesResponse(response);

      if (roles.length > 0) {
        return roles;
      }
    } catch {
      // Use fallback roles only when a role endpoint is unavailable.
    }
  }

  return fallbackRoleOptions;
}

async function createUser(payload: RegisterPayload): Promise<DmsUser> {
  const response = await apiRequest<
    LaravelResponse<CreateUserResponse>
  >("/register", {
    method: "POST",
    body: JSON.stringify({
      role_id: Number(payload.role_id),
      name: payload.name.trim(),
      email: payload.email.trim(),
      password: payload.password,
      c_password: payload.c_password,
      phone: payload.phone.trim() || null,
      department: payload.department.trim() || null,
      status: payload.status,
    }),
  });

  const data = unwrapLaravelData<CreateUserResponse>(response, {});
  const user = normalizeUser(data.user);

  if (!user) {
    throw new Error(
      "The user was created, but the response did not return user information."
    );
  }

  return user;
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getRoleName(user: DmsUser): string {
  return user.role?.name || user.role?.slug || "No role";
}

function getRoleSlug(user: DmsUser | null): string {
  return user?.role?.slug || "";
}

function normalizeRoleValue(value?: string | null): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isAdmin(user: DmsUser | null): boolean {
  if (!user) return false;

  const roleId = Number(user.role?.id);
  const slug = normalizeRoleValue(user.role?.slug);
  const roleName = normalizeRoleValue(user.role?.name);
  const permissions = user.role?.permissions || [];

  /*
  |--------------------------------------------------------------------------
  | Robust frontend admin detection
  |--------------------------------------------------------------------------
  | The backend is still the final security gate through RegisterController.
  | This only prevents the frontend from wrongly blocking a valid Admin user
  | when the role is returned as Admin, administrator, super admin, role id 1,
  | or with user-management permissions.
  */
  const adminAliases = new Set([
    "admin",
    "administrator",
    "super_admin",
    "system_admin",
  ]);

  const hasAdminPermission = permissions.some((permission) =>
    [
      "admin",
      "manage_users",
      "create_users",
      "user_create",
      "register_users",
    ].includes(normalizeRoleValue(permission))
  );

  return (
    roleId === 1 ||
    adminAliases.has(slug) ||
    adminAliases.has(roleName) ||
    hasAdminPermission
  );
}

function getStatusClass(status?: string | null): string {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "inactive":
      return "border-slate-200 bg-slate-100 text-slate-600";
    case "suspended":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function formatDate(date?: string | null): string {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatRelativeTime(date?: string | null): string {
  if (!date) return "Never";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Never";

  const difference = Date.now() - parsed.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return formatDate(date);
}

function exportUsers(users: DmsUser[]): void {
  const payload = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    status: user.status,
    role: user.role?.name || user.role?.slug,
    created_at: user.created_at,
    last_login_at: user.last_login_at,
  }));

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `users-${new Date().toISOString().slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

function Header({
  currentUser,
}: {
  currentUser: DmsUser | null;
}) {
  return (
    <header className="flex min-h-[78px] shrink-0 items-center justify-between gap-5 border-b border-slate-200 bg-white px-5 lg:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Management</span>
          <ChevronRight size={13} />
          <span className="text-slate-700">Users</span>
        </div>

        <h1 className="mt-1 text-lg font-bold text-slate-900">
          User Management
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-1.5 py-1 transition hover:bg-slate-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {getInitials(currentUser?.name)}
          </div>

          <div className="hidden text-left lg:block">
            <p className="max-w-[150px] truncate text-sm font-semibold text-slate-800">
              {currentUser?.name || "DMS User"}
            </p>

            <p className="mt-0.5 max-w-[150px] truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {currentUser ? getRoleName(currentUser) : "Loading"}
            </p>
          </div>

          <ChevronDown
            size={14}
            className="hidden text-slate-400 lg:block"
          />
        </button>
      </div>
    </header>
  );
}

function AlertBox({
  alert,
  onClose,
}: {
  alert: AlertState;
  onClose: () => void;
}) {
  const Icon =
    alert.type === "success"
      ? CheckCircle2
      : alert.type === "error"
      ? AlertCircle
      : ShieldCheck;

  const className =
    alert.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : alert.type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <Icon size={17} className="mt-0.5 shrink-0" />
        <span>{alert.message}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 opacity-70 transition hover:opacity-100"
        aria-label="Close alert"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: number;
  helper: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-[11px] text-slate-400">{helper}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  placeholder,
  type = "text",
  required = false,
  autoComplete,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function AddUserModal({
  form,
  roles,
  submitting,
  onChange,
  onClose,
  onSubmit,
}: {
  form: RegisterPayload;
  roles: RoleSummary[];
  submitting: boolean;
  onChange: <K extends keyof RegisterPayload>(
    field: K,
    value: RegisterPayload[K]
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Add a New User
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Create an account and assign its role, department and status.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <FormField
            label="Full name"
            value={form.name}
            placeholder="Enter the user's full name"
            required
            autoComplete="name"
            onChange={(value) => onChange("name", value)}
          />

          <FormField
            label="Email address"
            type="email"
            value={form.email}
            placeholder="user@example.com"
            required
            autoComplete="email"
            onChange={(value) => onChange("email", value)}
          />

          <FormField
            label="Phone number"
            value={form.phone}
            placeholder="+250..."
            autoComplete="tel"
            onChange={(value) => onChange("phone", value)}
          />

          <FormField
            label="Department"
            value={form.department}
            placeholder="Example: Document Control"
            onChange={(value) => onChange("department", value)}
          />

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
              Role <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                value={form.role_id}
                onChange={(event) =>
                  onChange(
                    "role_id",
                    event.target.value
                      ? Number(event.target.value)
                      : ""
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">Select a role</option>

                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
              Account status
            </label>

            <div className="relative">
              <select
                value={form.status}
                onChange={(event) =>
                  onChange(
                    "status",
                    event.target.value as RegisterPayload["status"]
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <FormField
            label="Password"
            type="password"
            value={form.password}
            placeholder="Minimum 8 characters"
            required
            autoComplete="new-password"
            onChange={(value) => onChange("password", value)}
          />

          <FormField
            label="Confirm password"
            type="password"
            value={form.c_password}
            placeholder="Enter the same password"
            required
            autoComplete="new-password"
            onChange={(value) => onChange("c_password", value)}
          />
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}

            {submitting ? "Creating..." : "Create user"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={15} />
      </button>

      <span className="min-w-[78px] text-center text-xs font-semibold text-slate-600">
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onChange(currentPage + 1)}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

function MobileUserCard({
  user,
  canManage,
  onUnavailableAction,
}: {
  user: DmsUser;
  canManage: boolean;
  onUnavailableAction: (action: "edit" | "delete") => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {getInitials(user.name)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {user.name}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {user.email}
          </p>
        </div>

        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize",
            getStatusClass(user.status)
          )}
        >
          {user.status || "Unknown"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-[10px] text-slate-400">Role</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-700">
            {getRoleName(user)}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-slate-400">Department</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-700">
            {user.department || "Not assigned"}
          </p>
        </div>
      </div>

      {canManage && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onUnavailableAction("edit")}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Edit3 size={14} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onUnavailableAction("delete")}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

export default function Usermanagement() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] =
    useState<string>("All Departments");
  const [roleFilter, setRoleFilter] =
    useState<string>("All Roles");
  const [statusFilter, setStatusFilter] =
    useState<string>("All Status");

  const [users, setUsers] = useState<DmsUser[]>([]);
  const [roles, setRoles] =
    useState<RoleSummary[]>(fallbackRoleOptions);
  const [currentUser, setCurrentUser] =
    useState<DmsUser | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] =
    useState<boolean>(false);
  const [form, setForm] =
    useState<RegisterPayload>(initialForm);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const canCreateUsers = isAdmin(currentUser);

  const departments = useMemo(() => {
    const values = users
      .map((user) => user.department?.trim())
      .filter((value): value is string => Boolean(value));

    return [
      "All Departments",
      ...Array.from(new Set(values)).sort(),
    ];
  }, [users]);

  const roleOptions = useMemo(() => {
    const values = users.map(getRoleName).filter(Boolean);

    return ["All Roles", ...Array.from(new Set(values)).sort()];
  }, [users]);

  const filteredUsers = useMemo(() => {
    const searchTerm = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const searchableText = [
        user.name,
        user.email,
        user.phone,
        user.department,
        user.status,
        getRoleName(user),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm || searchableText.includes(searchTerm);

      const matchesDepartment =
        departmentFilter === "All Departments" ||
        user.department === departmentFilter;

      const matchesRole =
        roleFilter === "All Roles" ||
        getRoleName(user) === roleFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        toLower(user.status) === toLower(statusFilter);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    departmentFilter,
    roleFilter,
    searchQuery,
    statusFilter,
    users,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const activeUsers = users.filter(
    (user) => toLower(user.status) === "active"
  ).length;

  const restrictedUsers = users.filter((user) =>
    ["inactive", "suspended"].includes(toLower(user.status))
  ).length;

  async function loadData(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const [profile, loadedUsers, loadedRoles] =
        await Promise.all([
          loadCurrentProfile(),
          loadUsers(),
          loadRoles(),
        ]);

      setCurrentUser(profile);
      setUsers(loadedUsers);
      setRoles(
        loadedRoles.length > 0
          ? loadedRoles
          : fallbackRoleOptions
      );
      setCurrentPage(1);

      if (loadedUsers.length <= 1) {
        setAlert({
          type: "info",
          message:
            "Only the current profile was returned. Confirm that GET /api/users is available to display every user.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load users.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  function updateForm<K extends keyof RegisterPayload>(
    field: K,
    value: RegisterPayload[K]
  ): void {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function validateForm(): string | null {
    if (!form.role_id) return "Please select a role.";
    if (!form.name.trim()) return "Please enter the user's name.";
    if (!form.email.trim()) return "Please enter an email address.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (form.password.length < 8) {
      return "The password must contain at least 8 characters.";
    }

    if (form.password !== form.c_password) {
      return "The password confirmation does not match.";
    }

    return null;
  }

  async function handleCreateUser(): Promise<void> {
    const validationError = validateForm();

    if (validationError) {
      setAlert({
        type: "error",
        message: validationError,
      });
      return;
    }

    try {
      setSubmitting(true);
      setAlert(null);

      const createdUser = await createUser(form);

      setUsers((currentUsers) => {
        const existingUser = currentUsers.some(
          (user) => user.id === createdUser.id
        );

        if (existingUser) {
          return currentUsers.map((user) =>
            user.id === createdUser.id ? createdUser : user
          );
        }

        return [createdUser, ...currentUsers];
      });

      setForm(initialForm);
      setShowAddModal(false);
      setCurrentPage(1);

      setAlert({
        type: "success",
        message: "The user account was created successfully.",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create the user.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleUnavailableAction(
    action: "edit" | "delete"
  ): void {
    setAlert({
      type: "info",
      message:
        action === "edit"
          ? "Editing requires a user update endpoint such as PUT or PATCH /api/users/{id}."
          : "Deleting requires a user delete endpoint such as DELETE /api/users/{id}.",
    });
  }

  function resetFilters(): void {
    setSearchQuery("");
    setDepartmentFilter("All Departments");
    setRoleFilter("All Roles");
    setStatusFilter("All Status");
    setCurrentPage(1);
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    departmentFilter !== "All Departments" ||
    roleFilter !== "All Roles" ||
    statusFilter !== "All Status";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header currentUser={currentUser} />

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] space-y-5 px-5 py-6 lg:px-8">
            {alert && (
              <AlertBox
                alert={alert}
                onClose={() => setAlert(null)}
              />
            )}

            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Users & Access
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Manage DMS users, roles, departments and account status.
                  Geological roles such as Geologist, Engineer and Auditor are
                  supported when they exist in your roles table.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={16} />
                  )}
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => exportUsers(filteredUsers)}
                  disabled={loading || filteredUsers.length === 0}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={16} />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Add user
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total Users"
                value={users.length}
                helper="Accounts loaded from the backend"
                icon={Users}
              />

              <MetricCard
                title="Active Users"
                value={activeUsers}
                helper="Accounts currently available"
                icon={CheckCircle2}
              />

              <MetricCard
                title="Restricted"
                value={restrictedUsers}
                helper="Inactive or suspended accounts"
                icon={UserX}
              />

              <MetricCard
                title="Roles"
                value={roles.length}
                helper="Available access roles"
                icon={ShieldCheck}
              />
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="w-full xl:max-w-md">
                    <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                      Search users
                    </label>

                    <div className="relative">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => {
                          setSearchQuery(event.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Name, email, phone, role..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex xl:items-end">
                    <FilterSelect
                      label="Department"
                      value={departmentFilter}
                      options={departments}
                      onChange={(value) => {
                        setDepartmentFilter(value);
                        setCurrentPage(1);
                      }}
                    />

                    <FilterSelect
                      label="Role"
                      value={roleFilter}
                      options={roleOptions}
                      onChange={(value) => {
                        setRoleFilter(value);
                        setCurrentPage(1);
                      }}
                    />

                    <FilterSelect
                      label="Status"
                      value={statusFilter}
                      options={[
                        "All Status",
                        "active",
                        "inactive",
                        "suspended",
                      ]}
                      onChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                      }}
                    />

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Loader2 size={23} className="animate-spin" />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Loading users
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Retrieving user and role information...
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[1050px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            User
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Contact
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Role & Department
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Status
                          </th>

                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Last Activity
                          </th>

                          {canCreateUsers && (
                            <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Action
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedUsers.length > 0 ? (
                          paginatedUsers.map((user) => (
                            <tr
                              key={user.id}
                              className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                                    {getInitials(user.name)}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[240px] truncate text-sm font-semibold text-slate-800">
                                      {user.name}
                                    </p>

                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                      User #{user.id}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="space-y-1.5">
                                  <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                    <Mail
                                      size={13}
                                      className="shrink-0 text-slate-400"
                                    />
                                    <span className="max-w-[230px] truncate">
                                      {user.email}
                                    </span>
                                  </p>

                                  <p className="flex items-center gap-2 text-xs text-slate-400">
                                    <Phone size={13} className="shrink-0" />
                                    {user.phone || "No phone number"}
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div>
                                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                    <ShieldCheck
                                      size={13}
                                      className="text-blue-600"
                                    />
                                    {getRoleName(user)}
                                  </p>

                                  <p className="mt-1.5 max-w-[200px] truncate text-xs text-slate-400">
                                    {user.department || "No department"}
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize",
                                    getStatusClass(user.status)
                                  )}
                                >
                                  {user.status || "Unknown"}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-xs font-semibold text-slate-600">
                                  {formatRelativeTime(
                                    user.last_login_at ||
                                      user.updated_at ||
                                      user.created_at
                                  )}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  Created {formatDate(user.created_at)}
                                </p>
                              </td>

                              {canCreateUsers && (
                                <td className="px-5 py-4 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUnavailableAction("edit")
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                                      aria-label={`Edit ${user.name}`}
                                      title="Edit user"
                                    >
                                      <Edit3 size={15} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUnavailableAction("delete")
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                      aria-label={`Delete ${user.name}`}
                                      title="Delete user"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={canCreateUsers ? 6 : 5}
                              className="px-5 py-14 text-center"
                            >
                              <Users
                                size={28}
                                className="mx-auto text-slate-300"
                              />

                              <p className="mt-3 text-sm font-semibold text-slate-600">
                                No users found
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Change the search or filter options.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 gap-4 bg-slate-50/60 p-4 sm:grid-cols-2 lg:hidden">
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <MobileUserCard
                          key={user.id}
                          user={user}
                          canManage={canCreateUsers}
                          onUnavailableAction={
                            handleUnavailableAction
                          }
                        />
                      ))
                    ) : (
                      <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                        <Users
                          size={26}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                          No users found
                        </p>
                      </div>
                    )}
                  </div>

                  {filteredUsers.length > 0 && (
                    <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                          {startIndex + 1}–
                          {Math.min(
                            startIndex + paginatedUsers.length,
                            filteredUsers.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                          {filteredUsers.length}
                        </span>{" "}
                        users
                      </p>

                      <Pagination
                        currentPage={safeCurrentPage}
                        totalPages={totalPages}
                        onChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      {showAddModal && (
        <AddUserModal
          form={form}
          roles={roles}
          submitting={submitting}
          onChange={updateForm}
          onClose={() => {
            if (!submitting) {
              setShowAddModal(false);
            }
          }}
          onSubmit={handleCreateUser}
        />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full min-w-[145px] appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}