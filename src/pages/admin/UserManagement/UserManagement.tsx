"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../AdminSidebar";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  Download,
  Edit,
  Filter,
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
  X,
} from "lucide-react";

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

type CurrentProfilePayload = {
  user?: DmsUser;
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
  { id: 2, name: "Document Controller", slug: "document_controller" },
  { id: 3, name: "Project Manager", slug: "project_manager" },
  { id: 4, name: "Security Officer", slug: "security_officer" },
  { id: 5, name: "Viewer", slug: "viewer" },
];

const avatarColors = [
  "bg-purple-600",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-orange-600",
  "bg-pink-600",
  "bg-indigo-600",
  "bg-cyan-600",
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
    data?: unknown;
  };

  if (typeof row.message === "string") return row.message;
  if (typeof row.error === "string") return row.error;

  if (row.data && typeof row.data === "object") {
    const data = row.data as Record<string, unknown>;
    const firstKey = Object.keys(data)[0];

    if (firstKey) {
      const firstValue = data[firstKey];

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
      getErrorMessage(payload, `Request failed with status ${response.status}`)
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

function normalizeUsersResponse(response: unknown): DmsUser[] {
  const data = unwrapLaravelData<unknown>(response, response);

  if (Array.isArray(data)) return data as DmsUser[];

  if (data && typeof data === "object") {
    const row = data as {
      users?: unknown;
      data?: unknown;
      user?: unknown;
    };

    if (Array.isArray(row.users)) return row.users as DmsUser[];
    if (Array.isArray(row.data)) return row.data as DmsUser[];
    if (row.user && typeof row.user === "object") return [row.user as DmsUser];
  }

  return [];
}

function normalizeRolesResponse(response: unknown): RoleSummary[] {
  const data = unwrapLaravelData<unknown>(response, response);

  if (Array.isArray(data)) return data as RoleSummary[];

  if (data && typeof data === "object") {
    const row = data as {
      roles?: unknown;
      data?: unknown;
    };

    if (Array.isArray(row.roles)) return row.roles as RoleSummary[];
    if (Array.isArray(row.data)) return row.data as RoleSummary[];
  }

  return [];
}

async function loadCurrentProfile(): Promise<DmsUser | null> {
  const candidates = ["/profile", "/user", "/me"];

  for (const path of candidates) {
    try {
      const response = await apiRequest<LaravelResponse<CurrentProfilePayload>>(
        path
      );
      const data = unwrapLaravelData<CurrentProfilePayload>(response, {});
      return data.user || (data as unknown as DmsUser) || null;
    } catch {
      // Try next common profile endpoint.
    }
  }

  return null;
}

async function loadUsers(): Promise<DmsUser[]> {
  const candidates = ["/users", "/admin/users", "/user-management/users"];

  for (const path of candidates) {
    try {
      const response = await apiRequest<unknown>(path);
      const users = normalizeUsersResponse(response);

      if (users.length > 0) return users;
    } catch {
      // This project may not have user index endpoint yet.
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

      if (roles.length > 0) return roles;
    } catch {
      // Fallback below.
    }
  }

  return fallbackRoleOptions;
}

async function createUser(payload: RegisterPayload): Promise<DmsUser> {
  const body = {
    role_id: Number(payload.role_id),
    name: payload.name,
    email: payload.email,
    password: payload.password,
    c_password: payload.c_password,
    phone: payload.phone || null,
    department: payload.department || null,
    status: payload.status || "active",
  };

  const response = await apiRequest<LaravelResponse<CreateUserResponse>>(
    "/register",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  const data = unwrapLaravelData<CreateUserResponse>(response, {});

  if (!data.user) {
    throw new Error("User was created, but response did not return user data.");
  }

  return data.user;
}

function getInitials(name?: string | null): string {
  if (!name) return "DU";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getRoleName(user: DmsUser): string {
  return user.role?.name || user.role?.slug || "No Role";
}

function getRoleSlug(user: DmsUser | null): string {
  return user?.role?.slug || "";
}

function isAdmin(user: DmsUser | null): boolean {
  const slug = getRoleSlug(user).toLowerCase();
  const roleName = user?.role?.name?.toLowerCase() || "";

  return slug === "admin" || roleName === "admin";
}

function getStatusClass(status?: string | null): string {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "inactive":
      return "border-slate-500/30 bg-slate-500/10 text-slate-300";
    case "suspended":
      return "border-red-500/30 bg-red-500/10 text-red-300";
    default:
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  }
}

function getDepartmentClass(department?: string | null): string {
  const value = (department || "").toLowerCase();

  if (value.includes("admin") || value.includes("it")) {
    return "border-slate-500/30 bg-slate-500/10 text-slate-300";
  }

  if (value.includes("security")) {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  if (value.includes("project")) {
    return "border-purple-500/30 bg-purple-500/10 text-purple-300";
  }

  if (value.includes("document")) {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
}

function formatDate(date?: string | null): string {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function UserAvatar({
  name,
  index,
}: {
  name?: string | null;
  index: number;
}) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
        avatarColors[index % avatarColors.length]
      )}
    >
      {getInitials(name)}
    </div>
  );
}

function AlertBox({
  alert,
  onClose,
}: {
  alert: AlertState;
  onClose: () => void;
}) {
  const style =
    alert.type === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : alert.type === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-blue-500/20 bg-blue-500/10 text-blue-300";

  const Icon =
    alert.type === "success"
      ? CheckCircle2
      : alert.type === "error"
      ? AlertCircle
      : ShieldCheck;

  return (
    <div
      className={cn(
        "mb-6 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm",
        style
      )}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <span>{alert.message}</span>
      </div>

      <button type="button" onClick={onClose} className="shrink-0 opacity-80">
        <X size={16} />
      </button>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-blue-900/30 bg-[#12122a] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">Add / Invite User</h3>
            <p className="mt-1 text-xs text-gray-400">
              Admin-created user using RegisterController fields.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <InputField
            label="Full Name"
            value={form.name}
            placeholder="Example: Samuel Shyaka"
            onChange={(value) => onChange("name", value)}
          />

          <InputField
            label="Email"
            type="email"
            value={form.email}
            placeholder="user@example.com"
            onChange={(value) => onChange("email", value)}
          />

          <InputField
            label="Phone"
            value={form.phone}
            placeholder="+250..."
            onChange={(value) => onChange("phone", value)}
          />

          <InputField
            label="Department"
            value={form.department}
            placeholder="IT / Admin"
            onChange={(value) => onChange("department", value)}
          />

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
              Role
            </label>

            <select
              value={form.role_id}
              onChange={(event) =>
                onChange(
                  "role_id",
                  event.target.value ? Number(event.target.value) : ""
                )
              }
              className="w-full rounded-xl border border-blue-900/30 bg-[#0a0a1a] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
            >
              <option value="" className="bg-[#0a0a1a]">
                Select Role
              </option>

              {roles.map((role) => (
                <option
                  key={role.id}
                  value={role.id}
                  className="bg-[#0a0a1a]"
                >
                  {role.name} {role.slug ? `(${role.slug})` : ""}
                </option>
              ))}
            </select>

            <p className="mt-1 text-[11px] text-gray-500">
              Backend requires `role_id` to exist in roles table.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                onChange(
                  "status",
                  event.target.value as RegisterPayload["status"]
                )
              }
              className="w-full rounded-xl border border-blue-900/30 bg-[#0a0a1a] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
            >
              <option value="active" className="bg-[#0a0a1a]">
                Active
              </option>
              <option value="inactive" className="bg-[#0a0a1a]">
                Inactive
              </option>
              <option value="suspended" className="bg-[#0a0a1a]">
                Suspended
              </option>
            </select>
          </div>

          <InputField
            label="Password"
            type="password"
            value={form.password}
            placeholder="Minimum 8 characters"
            onChange={(value) => onChange("password", value)}
          />

          <InputField
            label="Confirm Password"
            type="password"
            value={form.c_password}
            placeholder="Confirm password"
            onChange={(value) => onChange("c_password", value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-blue-900/30 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-blue-900/30 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Create User
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-blue-900/30 bg-[#0a0a1a] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50"
      />
    </div>
  );
}

function Usermanagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [users, setUsers] = useState<DmsUser[]>([]);
  const [roles, setRoles] = useState<RoleSummary[]>(fallbackRoleOptions);
  const [currentUser, setCurrentUser] = useState<DmsUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<RegisterPayload>(initialForm);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const canCreateUsers = isAdmin(currentUser);

  const departments = useMemo(() => {
    const values = users
      .map((user) => user.department)
      .filter((value): value is string => Boolean(value));

    return ["All Departments", ...Array.from(new Set(values))];
  }, [users]);

  const roleOptions = useMemo(() => {
    const values = users
      .map((user) => getRoleName(user))
      .filter(Boolean);

    return ["All Roles", ...Array.from(new Set(values))];
  }, [users]);

  const filteredUsers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const searchable = [
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

      const matchesSearch = !term || searchable.includes(term);
      const matchesDepartment =
        departmentFilter === "All Departments" ||
        user.department === departmentFilter;
      const matchesRole =
        roleFilter === "All Roles" || getRoleName(user) === roleFilter;
      const matchesStatus =
        statusFilter === "All Status" ||
        (user.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });
  }, [departmentFilter, roleFilter, searchQuery, statusFilter, users]);

  async function loadData(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const [profile, loadedUsers, loadedRoles] = await Promise.all([
        loadCurrentProfile(),
        loadUsers(),
        loadRoles(),
      ]);

      setCurrentUser(profile);
      setUsers(loadedUsers);
      setRoles(loadedRoles.length > 0 ? loadedRoles : fallbackRoleOptions);

      if (loadedUsers.length <= 1) {
        setAlert({
          type: "info",
          message:
            "Only profile/user data was loaded. To show all users, make sure your backend has GET /api/users or /api/admin/users.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load users from backend.",
      });
    } finally {
      setLoading(false);
    }
  }

  function updateForm<K extends keyof RegisterPayload>(
    field: K,
    value: RegisterPayload[K]
  ): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateForm(): string | null {
    if (!form.role_id) return "Please select a role.";
    if (!form.name.trim()) return "Please enter user name.";
    if (!form.email.trim()) return "Please enter email.";
    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (form.password !== form.c_password) {
      return "Password confirmation does not match.";
    }

    return null;
  }

  async function handleCreateUser(): Promise<void> {
    const error = validateForm();

    if (error) {
      setAlert({
        type: "error",
        message: error,
      });
      return;
    }

    try {
      setSubmitting(true);
      setAlert(null);

      const createdUser = await createUser(form);

      setUsers((currentUsers) => {
        const exists = currentUsers.some((user) => user.id === createdUser.id);

        if (exists) {
          return currentUsers.map((user) =>
            user.id === createdUser.id ? createdUser : user
          );
        }

        return [createdUser, ...currentUsers];
      });

      setForm(initialForm);
      setShowAddModal(false);
      setAlert({
        type: "success",
        message: "User created successfully.",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to create user.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a1a]">
      <AdminSidebar />

      <main className="flex flex-1 flex-col">
        <header className="border-b border-blue-900/30 bg-[#0f0f23] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-semibold text-white">Admin Portal</h1>
                <ChevronDown size={16} className="text-gray-500" />
                <span className="text-sm text-gray-400">User Management</span>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Uses admin register endpoint for user creation.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="relative p-2 text-gray-400 transition-colors hover:text-white"
              >
                <Bell size={20} />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <div className="flex items-center gap-3 border-l border-gray-700 pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {currentUser?.name || "DMS User"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentUser ? getRoleName(currentUser) : "Loading..."}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <span className="text-sm font-medium text-white">
                    {getInitials(currentUser?.name)}
                  </span>
                </div>

                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            {alert && (
              <AlertBox alert={alert} onClose={() => setAlert(null)} />
            )}

            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-white">
                  Users List
                </h2>
                <p className="text-gray-400">
                  Manage DMS users, roles, departments, and account status.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-900/30 bg-[#12122a] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:border-blue-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-900/30 bg-[#12122a] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:border-blue-500/50 hover:text-white"
                >
                  <Download size={16} />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!canCreateUsers) {
                      setAlert({
                        type: "error",
                        message:
                          "Only Admin can create users according to RegisterController.",
                      });
                      return;
                    }

                    setShowAddModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus size={18} />
                  Add / Invite User
                </button>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard
                icon={<Users size={20} />}
                title="Loaded Users"
                value={users.length}
                helper="From users endpoint or profile fallback"
              />

              <MetricCard
                icon={<CheckCircle2 size={20} />}
                title="Active"
                value={
                  users.filter(
                    (user) => (user.status || "").toLowerCase() === "active"
                  ).length
                }
                helper="Allowed to login"
              />

              <MetricCard
                icon={<ShieldCheck size={20} />}
                title="Roles"
                value={roles.length}
                helper="Loaded from roles endpoint or fallback"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-blue-900/30 bg-[#12122a]">
              <div className="border-b border-blue-900/30 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="relative w-full xl:max-w-md">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="text"
                      placeholder="Search users by name, email, phone, role..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full rounded-lg border border-blue-900/30 bg-[#0a0a1a] py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-400">Filter by:</span>

                    <select
                      value={departmentFilter}
                      onChange={(event) =>
                        setDepartmentFilter(event.target.value)
                      }
                      className="rounded-lg border border-blue-900/30 bg-[#0a0a1a] px-3 py-2 text-sm text-white outline-none hover:border-blue-500/50"
                    >
                      {departments.map((department) => (
                        <option
                          key={department}
                          value={department}
                          className="bg-[#0a0a1a]"
                        >
                          {department}
                        </option>
                      ))}
                    </select>

                    <select
                      value={roleFilter}
                      onChange={(event) => setRoleFilter(event.target.value)}
                      className="rounded-lg border border-blue-900/30 bg-[#0a0a1a] px-3 py-2 text-sm text-white outline-none hover:border-blue-500/50"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role} className="bg-[#0a0a1a]">
                          {role}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="rounded-lg border border-blue-900/30 bg-[#0a0a1a] px-3 py-2 text-sm text-white outline-none hover:border-blue-500/50"
                    >
                      <option value="All Status" className="bg-[#0a0a1a]">
                        All Status
                      </option>
                      <option value="active" className="bg-[#0a0a1a]">
                        Active
                      </option>
                      <option value="inactive" className="bg-[#0a0a1a]">
                        Inactive
                      </option>
                      <option value="suspended" className="bg-[#0a0a1a]">
                        Suspended
                      </option>
                    </select>

                    <button
                      type="button"
                      className="rounded-lg border border-blue-900/30 bg-[#0a0a1a] p-2.5 text-gray-400 transition-colors hover:border-blue-500/50 hover:text-white"
                    >
                      <Filter size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-900/30">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Created / Updated
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-gray-500" />
                          <p className="text-sm text-gray-400">
                            Loading real users from backend...
                          </p>
                        </td>
                      </tr>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className="border-b border-blue-900/20 transition-colors last:border-b-0 hover:bg-white/5"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={user.name} index={index} />

                              <div>
                                <p className="font-medium text-white">
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-400">
                                  ID: {user.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1 text-sm">
                              <p className="flex items-center gap-2 text-gray-300">
                                <Mail size={14} className="text-gray-500" />
                                {user.email}
                              </p>

                              <p className="flex items-center gap-2 text-gray-500">
                                <Phone size={14} />
                                {user.phone || "No phone"}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-white">
                              <ShieldCheck size={16} className="text-indigo-400" />
                              <span className="text-sm">{getRoleName(user)}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium",
                                getDepartmentClass(user.department)
                              )}
                            >
                              {user.department || "No Department"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-semibold",
                                getStatusClass(user.status)
                              )}
                            >
                              {user.status || "Unknown"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-400">
                            {formatDate(user.updated_at || user.created_at)}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                title="Update user needs backend update endpoint"
                                onClick={() =>
                                  setAlert({
                                    type: "info",
                                    message:
                                      "Edit needs an update user endpoint. Current RegisterController only supports create/profile/login/logout.",
                                  })
                                }
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                type="button"
                                title="Delete user needs backend delete endpoint"
                                onClick={() =>
                                  setAlert({
                                    type: "info",
                                    message:
                                      "Delete needs a delete user endpoint. Current RegisterController does not delete users.",
                                  })
                                }
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Users className="mx-auto mb-3 h-8 w-8 text-gray-600" />
                          <h3 className="text-sm font-semibold text-white">
                            No users found
                          </h3>
                          <p className="mt-2 text-sm text-gray-500">
                            Try changing your search or filters.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-blue-900/30 p-4">
                <p className="text-sm text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-white">
                    {filteredUsers.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-white">{users.length}</span>{" "}
                  users
                </p>

                <p className="text-xs text-gray-500">
                  Create endpoint: <span className="text-gray-300">POST /api/register</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAddModal && (
        <AddUserModal
          form={form}
          roles={roles}
          submitting={submitting}
          onChange={updateForm}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateUser}
        />
      )}
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  helper,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-blue-900/30 bg-[#12122a] p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </p>

        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-300">
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{helper}</p>
    </div>
  );
}

export default Usermanagement;