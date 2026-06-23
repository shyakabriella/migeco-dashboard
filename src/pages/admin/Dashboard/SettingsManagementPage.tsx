import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock3,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCcw,
  Save,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import AdminSidebar from "../AdminSidebar";

type SettingsSection =
  | "profile"
  | "security"
  | "notifications"
  | "email"
  | "roles"
  | "system";

type LaravelResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
};

type EmailNotificationSettings = {
  documentUploaded: boolean;
  documentArchived: boolean;
  documentRestored: boolean;
  reviewAssigned: boolean;
  scanFailed: boolean;
  sandboxUnsafe: boolean;
  weeklySummary: boolean;
};

type SystemNotificationSettings = {
  inAppAlerts: boolean;
  securityAlerts: boolean;
  projectUpdates: boolean;
  sampleUpdates: boolean;
  laboratoryResults: boolean;
  archiveActivity: boolean;
  systemMaintenance: boolean;
};

type NotificationPreferences = {
  emailDigest: "instant" | "daily" | "weekly";
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  notifyOnOwnActions: boolean;
};

type EmailServerSettings = {
  mailerName: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  encryption: "tls" | "ssl" | "none";
  adminEmail: string;
};

type ProfileSettings = {
  id?: number | string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  role?: {
    id?: number | string | null;
    name?: string | null;
    slug?: string | null;
  } | null;
};

type PasswordSettings = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type RolePermissionSettings = {
  adminCanManageUsers: boolean;
  geologistCanUpload: boolean;
  geologistCanViewReports: boolean;
  viewerCanDownload: boolean;
  viewerCanViewArchive: boolean;
};

type SystemConfiguration = {
  defaultDocumentStatus: "quarantined" | "active" | "pending_scan";
  archiveRetentionDays: string;
  maxUploadSizeMb: string;
  requireScanBeforeAccess: boolean;
  requireSandboxBeforeApproval: boolean;
  enableAiAnalysis: boolean;
};

type SettingsPayload = {
  profile?: Partial<ProfileSettings>;
  email_notifications?: Partial<EmailNotificationSettings>;
  system_notifications?: Partial<SystemNotificationSettings>;
  notification_preferences?: Partial<NotificationPreferences>;
  email_server?: Partial<EmailServerSettings>;
  role_permissions?: Partial<RolePermissionSettings>;
  system_configuration?: Partial<SystemConfiguration>;
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const tokenStorageKeys = [
  "dms_token",
  "token",
  "auth_token",
  "authToken",
  "access_token",
];

const defaultEmailNotifications: EmailNotificationSettings = {
  documentUploaded: true,
  documentArchived: true,
  documentRestored: true,
  reviewAssigned: true,
  scanFailed: true,
  sandboxUnsafe: true,
  weeklySummary: true,
};

const defaultSystemNotifications: SystemNotificationSettings = {
  inAppAlerts: true,
  securityAlerts: true,
  projectUpdates: true,
  sampleUpdates: true,
  laboratoryResults: true,
  archiveActivity: true,
  systemMaintenance: true,
};

const defaultNotificationPreferences: NotificationPreferences = {
  emailDigest: "daily",
  quietHoursEnabled: false,
  quietHoursStart: "18:00",
  quietHoursEnd: "07:00",
  notifyOnOwnActions: false,
};

const defaultEmailServer: EmailServerSettings = {
  mailerName: "MIGECO DMS Mailer",
  fromName: "MIGECO Document System",
  fromEmail: "no-reply@migeco.rw",
  replyToEmail: "support@migeco.rw",
  smtpHost: "smtp.migeco.rw",
  smtpPort: "587",
  smtpUsername: "no-reply@migeco.rw",
  smtpPassword: "",
  encryption: "tls",
  adminEmail: "admin@migeco.rw",
};

const defaultProfile: ProfileSettings = {
  fullName: "",
  email: "",
  phone: "",
  department: "",
  jobTitle: "",
  role: null,
};

const defaultPassword: PasswordSettings = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const defaultRolePermissions: RolePermissionSettings = {
  adminCanManageUsers: true,
  geologistCanUpload: true,
  geologistCanViewReports: true,
  viewerCanDownload: false,
  viewerCanViewArchive: true,
};

const defaultSystemConfiguration: SystemConfiguration = {
  defaultDocumentStatus: "quarantined",
  archiveRetentionDays: "365",
  maxUploadSizeMb: "50",
  requireScanBeforeAccess: true,
  requireSandboxBeforeApproval: true,
  enableAiAnalysis: true,
};

function sectionFromPath(pathname: string): SettingsSection {
  const normalized = pathname.toLowerCase();

  if (normalized.includes("email")) return "email";
  if (normalized.includes("notification")) return "notifications";
  if (normalized.includes("password") || normalized.includes("security")) {
    return "security";
  }
  if (normalized.includes("role") || normalized.includes("permission")) {
    return "roles";
  }
  if (normalized.includes("system") || normalized.includes("configuration")) {
    return "system";
  }

  return "profile";
}

const sectionDescriptions: Record<SettingsSection, string> = {
  profile: "Manage your user identity and contact details.",
  security: "Change your password and keep your account protected.",
  notifications: "Control email, in-app alerts, digest frequency, and quiet hours.",
  email: "Configure SMTP delivery and sender identity for platform emails.",
  roles: "Control high-level responsibilities for Admin, Geologist, and Viewer roles.",
  system: "Configure document lifecycle, upload limits, scanning, sandboxing, and AI.",
};

function getToken(): string | null {
  for (const key of tokenStorageKeys) {
    const rawToken = localStorage.getItem(key) || sessionStorage.getItem(key);

    if (!rawToken || rawToken === "undefined" || rawToken === "null") {
      continue;
    }

    return rawToken.replace(/^Bearer\s+/i, "").trim();
  }

  return null;
}

function getApiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<{ data: T; message: string }> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  headers.set("Accept", "application/json");

  let requestBody = options.body as BodyInit | undefined;

  if (
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof Blob) &&
    !(options.body instanceof ArrayBuffer)
  ) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(options.body);
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
    body: requestBody,
  });

  let payload: LaravelResponse<T> | null = null;

  try {
    payload = (await response.json()) as LaravelResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      extractValidationMessage(payload?.errors) ||
      `Request failed with status ${response.status}.`;

    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return {
    data: (payload?.data ?? (payload as T)) as T,
    message: payload?.message || "Request completed successfully.",
  };
}

function extractValidationMessage(errors: unknown): string | null {
  if (!errors || typeof errors !== "object") return null;

  const firstValue = Object.values(errors as Record<string, unknown>)[0];

  if (Array.isArray(firstValue)) {
    return firstValue.filter(Boolean).join(" ");
  }

  if (typeof firstValue === "string") {
    return firstValue;
  }

  return null;
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function countEnabled(settings: object): number {
  return Object.values(settings).filter(Boolean).length;
}

function mergeSettings<T extends object>(
  defaults: T,
  incoming?: Partial<T>
): T {
  return {
    ...defaults,
    ...(incoming || {}),
  };
}

function getRoleSlug(profile: ProfileSettings): string {
  return String(profile.role?.slug || profile.role?.name || "").toLowerCase();
}

function getReadableRole(profile: ProfileSettings): string {
  const roleName = profile.role?.name || profile.role?.slug || "System User";

  return String(roleName)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitials(name?: string): string {
  if (!name) return "MS";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SettingsManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState<SettingsSection>(() =>
    sectionFromPath(location.pathname)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testingEmail, setTestingEmail] = useState<boolean>(false);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const [profile, setProfile] = useState<ProfileSettings>(defaultProfile);
  const [password, setPassword] = useState<PasswordSettings>(defaultPassword);
  const [emailNotifications, setEmailNotifications] =
    useState<EmailNotificationSettings>(defaultEmailNotifications);
  const [systemNotifications, setSystemNotifications] =
    useState<SystemNotificationSettings>(defaultSystemNotifications);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(defaultNotificationPreferences);
  const [emailServer, setEmailServer] =
    useState<EmailServerSettings>(defaultEmailServer);
  const [rolePermissions, setRolePermissions] =
    useState<RolePermissionSettings>(defaultRolePermissions);
  const [systemConfiguration, setSystemConfiguration] =
    useState<SystemConfiguration>(defaultSystemConfiguration);

  const roleSlug = getRoleSlug(profile);
  const isAdmin = roleSlug === "admin" || roleSlug === "administrator";

  const enabledEmailNotificationCount = useMemo(
    () => countEnabled(emailNotifications),
    [emailNotifications]
  );

  const enabledSystemNotificationCount = useMemo(
    () => countEnabled(systemNotifications),
    [systemNotifications]
  );

  const enabledRolePermissionCount = useMemo(
    () => countEnabled(rolePermissions),
    [rolePermissions]
  );

  const sectionItems = useMemo(
    () => [
      {
        id: "profile" as SettingsSection,
        title: "Profile",
        description: "User identity",
        icon: UserCog,
        adminOnly: false,
      },
      {
        id: "security" as SettingsSection,
        title: "Security",
        description: "Password access",
        icon: KeyRound,
        adminOnly: false,
      },
      {
        id: "notifications" as SettingsSection,
        title: "Notifications",
        description: `${enabledEmailNotificationCount + enabledSystemNotificationCount} active rules`,
        icon: Bell,
        adminOnly: true,
      },
      {
        id: "email" as SettingsSection,
        title: "Email Server",
        description: emailServer.smtpHost || "SMTP settings",
        icon: Mail,
        adminOnly: true,
      },
      {
        id: "roles" as SettingsSection,
        title: "Roles & Permissions",
        description: `${enabledRolePermissionCount} responsibilities enabled`,
        icon: Users,
        adminOnly: true,
      },
      {
        id: "system" as SettingsSection,
        title: "System Config",
        description: "Document lifecycle",
        icon: Settings,
        adminOnly: true,
      },
    ],
    [
      enabledEmailNotificationCount,
      enabledRolePermissionCount,
      enabledSystemNotificationCount,
      emailServer.smtpHost,
    ]
  );

  useEffect(() => {
    void loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setActiveSection(sectionFromPath(location.pathname));
  }, [location.pathname]);

  async function loadSettings(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const response = await apiRequest<SettingsPayload>("settings");
      const data = response.data || {};

      setProfile(mergeSettings(defaultProfile, data.profile));
      setEmailNotifications(
        mergeSettings(defaultEmailNotifications, data.email_notifications)
      );
      setSystemNotifications(
        mergeSettings(defaultSystemNotifications, data.system_notifications)
      );
      setNotificationPreferences(
        mergeSettings(defaultNotificationPreferences, data.notification_preferences)
      );
      setEmailServer(mergeSettings(defaultEmailServer, data.email_server));
      setRolePermissions(
        mergeSettings(defaultRolePermissions, data.role_permissions)
      );
      setSystemConfiguration(
        mergeSettings(defaultSystemConfiguration, data.system_configuration)
      );
      setLastLoadedAt(new Date());
    } catch (error) {
      const status = (error as Error & { status?: number }).status;

      if (status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load settings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function updateProfile<K extends keyof ProfileSettings>(
    field: K,
    value: ProfileSettings[K]
  ): void {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function updatePassword<K extends keyof PasswordSettings>(
    field: K,
    value: PasswordSettings[K]
  ): void {
    setPassword((current) => ({ ...current, [field]: value }));
  }

  function updateEmailNotification(
    field: keyof EmailNotificationSettings,
    value: boolean
  ): void {
    setEmailNotifications((current) => ({ ...current, [field]: value }));
  }

  function updateSystemNotification(
    field: keyof SystemNotificationSettings,
    value: boolean
  ): void {
    setSystemNotifications((current) => ({ ...current, [field]: value }));
  }

  function updateNotificationPreference<K extends keyof NotificationPreferences>(
    field: K,
    value: NotificationPreferences[K]
  ): void {
    setNotificationPreferences((current) => ({ ...current, [field]: value }));
  }

  function updateEmailServer<K extends keyof EmailServerSettings>(
    field: K,
    value: EmailServerSettings[K]
  ): void {
    setEmailServer((current) => ({ ...current, [field]: value }));
  }

  function updateRolePermission(
    field: keyof RolePermissionSettings,
    value: boolean
  ): void {
    setRolePermissions((current) => ({ ...current, [field]: value }));
  }

  function updateSystemConfiguration<K extends keyof SystemConfiguration>(
    field: K,
    value: SystemConfiguration[K]
  ): void {
    setSystemConfiguration((current) => ({ ...current, [field]: value }));
  }

  function validateCurrentSection(): string | null {
    if (activeSection === "profile") {
      if (!profile.fullName.trim()) return "Full name is required.";
      if (!profile.email.trim()) return "Email address is required.";
      return null;
    }

    if (activeSection === "security") {
      if (!password.currentPassword) return "Current password is required.";
      if (password.newPassword.length < 8) {
        return "New password must be at least 8 characters.";
      }
      if (password.newPassword !== password.confirmPassword) {
        return "New password and confirmation do not match.";
      }
      return null;
    }

    if (!isAdmin) {
      return "Only Admin users can update system-level settings.";
    }

    if (activeSection === "email") {
      if (!emailServer.fromEmail.trim()) return "From email is required.";
      if (!emailServer.smtpHost.trim()) return "SMTP host is required.";
      if (!emailServer.smtpPort.trim()) return "SMTP port is required.";
    }

    if (activeSection === "system") {
      if (Number(systemConfiguration.archiveRetentionDays) < 1) {
        return "Archive retention must be at least 1 day.";
      }
      if (Number(systemConfiguration.maxUploadSizeMb) < 1) {
        return "Maximum upload size must be at least 1 MB.";
      }
    }

    return null;
  }

  async function handleSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const validationMessage = validateCurrentSection();

    if (validationMessage) {
      setAlert({ type: "error", message: validationMessage });
      return;
    }

    try {
      setSaving(true);
      setAlert(null);

      if (activeSection === "profile") {
        const response = await apiRequest<{ profile?: ProfileSettings }>(
          "settings/profile",
          {
            method: "PUT",
            body: profile as unknown as Record<string, unknown>,
          }
        );

        if (response.data.profile) {
          setProfile(mergeSettings(defaultProfile, response.data.profile));
        }

        setAlert({ type: "success", message: response.message });
        return;
      }

      if (activeSection === "security") {
        const response = await apiRequest<unknown>("settings/password", {
          method: "PUT",
          body: password as unknown as Record<string, unknown>,
        });

        setPassword(defaultPassword);
        setAlert({ type: "success", message: response.message });
        return;
      }

      const body = buildSystemSettingsPayload(activeSection, {
        emailNotifications,
        systemNotifications,
        notificationPreferences,
        emailServer,
        rolePermissions,
        systemConfiguration,
      });

      const response = await apiRequest<SettingsPayload>("settings", {
        method: "PUT",
        body,
      });

      hydrateSystemSettings(response.data);
      setAlert({ type: "success", message: response.message });
    } catch (error) {
      const status = (error as Error & { status?: number }).status;

      if (status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  function hydrateSystemSettings(data?: SettingsPayload): void {
    if (!data) return;

    if (data.email_notifications) {
      setEmailNotifications(
        mergeSettings(defaultEmailNotifications, data.email_notifications)
      );
    }

    if (data.system_notifications) {
      setSystemNotifications(
        mergeSettings(defaultSystemNotifications, data.system_notifications)
      );
    }

    if (data.notification_preferences) {
      setNotificationPreferences(
        mergeSettings(defaultNotificationPreferences, data.notification_preferences)
      );
    }

    if (data.email_server) {
      setEmailServer(mergeSettings(defaultEmailServer, data.email_server));
    }

    if (data.role_permissions) {
      setRolePermissions(
        mergeSettings(defaultRolePermissions, data.role_permissions)
      );
    }

    if (data.system_configuration) {
      setSystemConfiguration(
        mergeSettings(defaultSystemConfiguration, data.system_configuration)
      );
    }

    setLastLoadedAt(new Date());
  }

  async function handleTestEmail(): Promise<void> {
    if (!isAdmin) {
      setAlert({
        type: "error",
        message: "Only Admin users can test system email settings.",
      });
      return;
    }

    try {
      setTestingEmail(true);
      setAlert(null);

      const response = await apiRequest<{ sent_to?: string }>(
        "settings/test-email",
        {
          method: "POST",
          body: {
            email: emailServer.adminEmail,
          },
        }
      );

      setAlert({
        type: "success",
        message:
          response.message ||
          `Test email sent successfully to ${response.data.sent_to}.`,
      });
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to send test email. Please check SMTP settings.",
      });
    } finally {
      setTestingEmail(false);
    }
  }

  function renderActiveSection(): ReactNode {
    if (loading) {
      return (
        <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Loading settings...
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Fetching saved configuration from the API.
            </p>
          </div>
        </div>
      );
    }

    if (activeSection === "profile") {
      return (
        <SettingsPanel
          icon={<UserCog size={20} />}
          title="User Profile Management"
          description="Keep your name, contact information, department, and job title accurate across the system."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InputField
              label="Full Name"
              value={profile.fullName}
              onChange={(value) => updateProfile("fullName", value)}
              placeholder="Enter full name"
            />
            <InputField
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(value) => updateProfile("email", value)}
              placeholder="name@example.com"
            />
            <InputField
              label="Phone Number"
              value={profile.phone}
              onChange={(value) => updateProfile("phone", value)}
              placeholder="+250..."
            />
            <InputField
              label="Department"
              value={profile.department}
              onChange={(value) => updateProfile("department", value)}
              placeholder="Administration, Geology, Records..."
            />
            <InputField
              label="Job Title"
              value={profile.jobTitle}
              onChange={(value) => updateProfile("jobTitle", value)}
              placeholder="DMS Administrator"
            />
            <ReadOnlyField label="Current Role" value={getReadableRole(profile)} />
          </div>
        </SettingsPanel>
      );
    }

    if (activeSection === "security") {
      return (
        <SettingsPanel
          icon={<KeyRound size={20} />}
          title="Change Password"
          description="Use a strong password with at least 8 characters. Password fields are cleared after a successful update."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InputField
              label="Current Password"
              type="password"
              value={password.currentPassword}
              onChange={(value) => updatePassword("currentPassword", value)}
              placeholder="Current password"
            />
            <InputField
              label="New Password"
              type="password"
              value={password.newPassword}
              onChange={(value) => updatePassword("newPassword", value)}
              placeholder="Minimum 8 characters"
            />
            <InputField
              label="Confirm Password"
              type="password"
              value={password.confirmPassword}
              onChange={(value) => updatePassword("confirmPassword", value)}
              placeholder="Repeat new password"
            />
          </div>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
            Password changes affect only your account. Role, permission, and
            system-level settings remain separate and require Admin access.
          </div>
        </SettingsPanel>
      );
    }

    if (activeSection === "notifications") {
      return (
        <SettingsPanel
          icon={<Bell size={20} />}
          title="Notification Center"
          description="One place for email notifications, in-app alerts, delivery frequency, and quiet-hour preferences."
          adminOnly
          disabled={!isAdmin}
        >
          <div className="space-y-6">
            <GroupedSection
              title="Email notification rules"
              description="Choose which events should generate email messages."
            >
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <ToggleRow
                  title="Document uploaded"
                  description="Notify controllers when a new document is uploaded."
                  checked={emailNotifications.documentUploaded}
                  onChange={(value) =>
                    updateEmailNotification("documentUploaded", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Document archived"
                  description="Notify stakeholders when documents move to archive."
                  checked={emailNotifications.documentArchived}
                  onChange={(value) =>
                    updateEmailNotification("documentArchived", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Document restored"
                  description="Notify users when archived documents are restored."
                  checked={emailNotifications.documentRestored}
                  onChange={(value) =>
                    updateEmailNotification("documentRestored", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Review assigned"
                  description="Notify users when a review task is assigned."
                  checked={emailNotifications.reviewAssigned}
                  onChange={(value) =>
                    updateEmailNotification("reviewAssigned", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Antivirus scan failed"
                  description="Alert security staff when scanning fails or flags risk."
                  checked={emailNotifications.scanFailed}
                  onChange={(value) =>
                    updateEmailNotification("scanFailed", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Sandbox unsafe"
                  description="Send urgent email when sandbox marks a file unsafe."
                  checked={emailNotifications.sandboxUnsafe}
                  onChange={(value) =>
                    updateEmailNotification("sandboxUnsafe", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Weekly summary"
                  description="Send a weekly digest of documents, projects, samples, and risks."
                  checked={emailNotifications.weeklySummary}
                  onChange={(value) =>
                    updateEmailNotification("weeklySummary", value)
                  }
                  disabled={!isAdmin}
                />
              </div>
            </GroupedSection>

            <GroupedSection
              title="System notification rules"
              description="Choose which events should appear in the application notification center."
            >
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <ToggleRow
                  title="In-app alerts"
                  description="Show notification badge and alert center updates."
                  checked={systemNotifications.inAppAlerts}
                  onChange={(value) =>
                    updateSystemNotification("inAppAlerts", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Security alerts"
                  description="Show quarantine, unsafe, and failed security events."
                  checked={systemNotifications.securityAlerts}
                  onChange={(value) =>
                    updateSystemNotification("securityAlerts", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Project updates"
                  description="Notify assigned users when project records change."
                  checked={systemNotifications.projectUpdates}
                  onChange={(value) =>
                    updateSystemNotification("projectUpdates", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Sample updates"
                  description="Notify geologists when sample records are updated."
                  checked={systemNotifications.sampleUpdates}
                  onChange={(value) =>
                    updateSystemNotification("sampleUpdates", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Laboratory results"
                  description="Notify relevant users when lab results are available."
                  checked={systemNotifications.laboratoryResults}
                  onChange={(value) =>
                    updateSystemNotification("laboratoryResults", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Archive activity"
                  description="Show notices for archived and restored documents."
                  checked={systemNotifications.archiveActivity}
                  onChange={(value) =>
                    updateSystemNotification("archiveActivity", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="System maintenance"
                  description="Notify users about planned maintenance and service changes."
                  checked={systemNotifications.systemMaintenance}
                  onChange={(value) =>
                    updateSystemNotification("systemMaintenance", value)
                  }
                  disabled={!isAdmin}
                />
              </div>
            </GroupedSection>

            <GroupedSection
              title="Notification preferences"
              description="Control delivery frequency and quiet-hour behavior."
            >
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <SelectField
                  label="Email Digest Frequency"
                  value={notificationPreferences.emailDigest}
                  onChange={(value) =>
                    updateNotificationPreference(
                      "emailDigest",
                      value as NotificationPreferences["emailDigest"]
                    )
                  }
                  disabled={!isAdmin}
                  options={[
                    { label: "Instant", value: "instant" },
                    { label: "Daily digest", value: "daily" },
                    { label: "Weekly digest", value: "weekly" },
                  ]}
                />
                <ToggleRow
                  title="Quiet hours"
                  description="Pause non-critical notifications during configured hours."
                  checked={notificationPreferences.quietHoursEnabled}
                  onChange={(value) =>
                    updateNotificationPreference("quietHoursEnabled", value)
                  }
                  disabled={!isAdmin}
                />
                <InputField
                  label="Quiet Hours Start"
                  type="time"
                  value={notificationPreferences.quietHoursStart}
                  onChange={(value) =>
                    updateNotificationPreference("quietHoursStart", value)
                  }
                  disabled={!isAdmin}
                />
                <InputField
                  label="Quiet Hours End"
                  type="time"
                  value={notificationPreferences.quietHoursEnd}
                  onChange={(value) =>
                    updateNotificationPreference("quietHoursEnd", value)
                  }
                  disabled={!isAdmin}
                />
                <ToggleRow
                  title="Notify on own actions"
                  description="Send notifications even when the current user performs the action."
                  checked={notificationPreferences.notifyOnOwnActions}
                  onChange={(value) =>
                    updateNotificationPreference("notifyOnOwnActions", value)
                  }
                  disabled={!isAdmin}
                />
              </div>
            </GroupedSection>
          </div>
        </SettingsPanel>
      );
    }

    if (activeSection === "email") {
      return (
        <SettingsPanel
          icon={<Mail size={20} />}
          title="Email Server Configuration"
          description="Configure sender identity and SMTP connection used for all system emails."
          adminOnly
          disabled={!isAdmin}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InputField
              label="Mailer Name"
              value={emailServer.mailerName}
              onChange={(value) => updateEmailServer("mailerName", value)}
              disabled={!isAdmin}
            />
            <InputField
              label="From Name"
              value={emailServer.fromName}
              onChange={(value) => updateEmailServer("fromName", value)}
              disabled={!isAdmin}
            />
            <InputField
              label="From Email"
              type="email"
              value={emailServer.fromEmail}
              onChange={(value) => updateEmailServer("fromEmail", value)}
              disabled={!isAdmin}
            />
            <InputField
              label="Reply-To Email"
              type="email"
              value={emailServer.replyToEmail}
              onChange={(value) => updateEmailServer("replyToEmail", value)}
              disabled={!isAdmin}
            />
            <InputField
              label="SMTP Host"
              value={emailServer.smtpHost}
              onChange={(value) => updateEmailServer("smtpHost", value)}
              disabled={!isAdmin}
            />
            <InputField
              label="SMTP Port"
              value={emailServer.smtpPort}
              onChange={(value) => updateEmailServer("smtpPort", value)}
              disabled={!isAdmin}
            />
            <InputField
              label="SMTP Username"
              value={emailServer.smtpUsername}
              onChange={(value) => updateEmailServer("smtpUsername", value)}
              disabled={!isAdmin}
            />
            <InputField
              label="SMTP Password"
              type="password"
              value={emailServer.smtpPassword}
              onChange={(value) => updateEmailServer("smtpPassword", value)}
              placeholder="Leave blank to keep current password"
              disabled={!isAdmin}
            />
            <SelectField
              label="Encryption"
              value={emailServer.encryption}
              onChange={(value) =>
                updateEmailServer(
                  "encryption",
                  value as EmailServerSettings["encryption"]
                )
              }
              disabled={!isAdmin}
              options={[
                { label: "TLS", value: "tls" },
                { label: "SSL", value: "ssl" },
                { label: "None", value: "none" },
              ]}
            />
            <InputField
              label="Admin Test Email"
              type="email"
              value={emailServer.adminEmail}
              onChange={(value) => updateEmailServer("adminEmail", value)}
              disabled={!isAdmin}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">
                SMTP Connection Test
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Save SMTP values first, then send a test message to the admin email.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testingEmail || !isAdmin}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {testingEmail ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Send Test Email
            </button>
          </div>
        </SettingsPanel>
      );
    }

    if (activeSection === "roles") {
      return (
        <SettingsPanel
          icon={<Users size={20} />}
          title="Role and Permission Management"
          description="Define high-level responsibilities for Admin, Geologist, and Viewer users."
          adminOnly
          disabled={!isAdmin}
        >
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <ToggleRow
              title="Admin can manage users"
              description="Allow Admin to create, update, suspend, and delete users."
              checked={rolePermissions.adminCanManageUsers}
              onChange={(value) =>
                updateRolePermission("adminCanManageUsers", value)
              }
              disabled={!isAdmin}
            />
            <ToggleRow
              title="Geologist can upload documents"
              description="Allow Geologists to upload reports, maps, samples, and field notes."
              checked={rolePermissions.geologistCanUpload}
              onChange={(value) =>
                updateRolePermission("geologistCanUpload", value)
              }
              disabled={!isAdmin}
            />
            <ToggleRow
              title="Geologist can view reports"
              description="Allow Geologists to access project and document reporting."
              checked={rolePermissions.geologistCanViewReports}
              onChange={(value) =>
                updateRolePermission("geologistCanViewReports", value)
              }
              disabled={!isAdmin}
            />
            <ToggleRow
              title="Viewer can download"
              description="Allow Viewer users to download documents they can access."
              checked={rolePermissions.viewerCanDownload}
              onChange={(value) =>
                updateRolePermission("viewerCanDownload", value)
              }
              disabled={!isAdmin}
            />
            <ToggleRow
              title="Viewer can view archive"
              description="Allow Viewer users to open archived reference documents."
              checked={rolePermissions.viewerCanViewArchive}
              onChange={(value) =>
                updateRolePermission("viewerCanViewArchive", value)
              }
              disabled={!isAdmin}
            />
          </div>
        </SettingsPanel>
      );
    }

    return (
      <SettingsPanel
        icon={<SlidersHorizontal size={20} />}
        title="System Configuration"
        description="Control document lifecycle defaults, security checks, upload size, and AI analysis."
        adminOnly
        disabled={!isAdmin}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SelectField
            label="Default Upload Status"
            value={systemConfiguration.defaultDocumentStatus}
            onChange={(value) =>
              updateSystemConfiguration(
                "defaultDocumentStatus",
                value as SystemConfiguration["defaultDocumentStatus"]
              )
            }
            disabled={!isAdmin}
            options={[
              { label: "Quarantined", value: "quarantined" },
              { label: "Pending scan", value: "pending_scan" },
              { label: "Active", value: "active" },
            ]}
          />
          <InputField
            label="Archive Retention Days"
            type="number"
            value={systemConfiguration.archiveRetentionDays}
            onChange={(value) =>
              updateSystemConfiguration("archiveRetentionDays", value)
            }
            disabled={!isAdmin}
          />
          <InputField
            label="Maximum Upload Size (MB)"
            type="number"
            value={systemConfiguration.maxUploadSizeMb}
            onChange={(value) =>
              updateSystemConfiguration("maxUploadSizeMb", value)
            }
            disabled={!isAdmin}
          />
          <ToggleRow
            title="Require scan before access"
            description="Block document viewing and downloading until antivirus scan passes."
            checked={systemConfiguration.requireScanBeforeAccess}
            onChange={(value) =>
              updateSystemConfiguration("requireScanBeforeAccess", value)
            }
            disabled={!isAdmin}
          />
          <ToggleRow
            title="Require sandbox before approval"
            description="Require sandbox validation before final document approval."
            checked={systemConfiguration.requireSandboxBeforeApproval}
            onChange={(value) =>
              updateSystemConfiguration("requireSandboxBeforeApproval", value)
            }
            disabled={!isAdmin}
          />
          <ToggleRow
            title="Enable AI analysis"
            description="Allow AI metadata extraction and document suggestions."
            checked={systemConfiguration.enableAiAnalysis}
            onChange={(value) =>
              updateSystemConfiguration("enableAiAnalysis", value)
            }
            disabled={!isAdmin}
          />
        </div>
      </SettingsPanel>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[78px] shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 lg:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>Management</span>
              <span>/</span>
              <span className="text-blue-600">Settings</span>
            </div>
            <h1 className="mt-1 truncate text-xl font-black text-slate-950 lg:text-2xl">
              Settings Control Center
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void loadSettings()}
              disabled={loading || saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="submit"
              form="settings-form"
              disabled={saving || loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              <span className="hidden sm:inline">Save Section</span>
            </button>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-auto p-3 lg:p-5">
          <form
            id="settings-form"
            onSubmit={handleSave}
            className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]"
          >
            <aside className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                    {getInitials(profile.fullName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {profile.fullName || "MIGECO User"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {getReadableRole(profile)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    const disabled = item.adminOnly && !isAdmin;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                          activeSection === item.id
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                          disabled &&
                            "cursor-not-allowed border-transparent bg-slate-50 text-slate-300 hover:bg-slate-50 hover:text-slate-300"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
                            activeSection === item.id
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600",
                            disabled && "bg-slate-100 text-slate-300"
                          )}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold">{item.title}</p>
                            {item.adminOnly && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs opacity-70">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-blue-900">
                  <ShieldCheck size={17} />
                  <p className="text-sm font-black">Access Rule</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-blue-700">
                  Every user can manage profile and password. System-level
                  notification, email, role, and document configuration is Admin-only.
                </p>
              </div>
            </aside>

            <div className="min-w-0 space-y-4">
              {alert && (
                <AlertBox tone={alert.type} icon={getAlertIcon(alert.type)}>
                  {alert.message}
                </AlertBox>
              )}

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-500">
                      <Settings size={13} />
                      Current Section
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-slate-950">
                      {sectionItems.find((item) => item.id === activeSection)?.title}
                    </h2>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                      {sectionDescriptions[activeSection]}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                    <MiniMetric label="Email" value={`${enabledEmailNotificationCount} on`} />
                    <MiniMetric label="System" value={`${enabledSystemNotificationCount} on`} />
                    <MiniMetric label="Role" value={`${enabledRolePermissionCount} on`} />
                  </div>
                </div>
              </div>

              {renderActiveSection()}
            </div>

            <aside className="space-y-4">
              <SummaryCard
                profile={profile}
                lastLoadedAt={lastLoadedAt}
                emailNotifications={enabledEmailNotificationCount}
                systemNotifications={enabledSystemNotificationCount}
                systemConfiguration={systemConfiguration}
              />

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    Supervisor Requirements
                  </h3>
                </div>
                <div className="space-y-2 text-xs leading-5 text-slate-600">
                  <CheckItem label="Email notifications" />
                  <CheckItem label="System notifications" />
                  <CheckItem label="User profile management" />
                  <CheckItem label="Change password" />
                  <CheckItem label="Role and permission management" />
                  <CheckItem label="Notification preferences" />
                  <CheckItem label="System configuration" />
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertCircle size={17} />
                  <p className="text-sm font-black">Professional Structure</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-amber-700">
                  Duplicate-looking settings were grouped into clear modules.
                  Notifications are together, SMTP is separate, and each section saves independently.
                </p>
              </div>
            </aside>
          </form>
        </section>
      </main>
    </div>
  );
}

function buildSystemSettingsPayload(
  section: SettingsSection,
  state: {
    emailNotifications: EmailNotificationSettings;
    systemNotifications: SystemNotificationSettings;
    notificationPreferences: NotificationPreferences;
    emailServer: EmailServerSettings;
    rolePermissions: RolePermissionSettings;
    systemConfiguration: SystemConfiguration;
  }
): Record<string, unknown> {
  if (section === "notifications") {
    return {
      email_notifications: state.emailNotifications,
      system_notifications: state.systemNotifications,
      notification_preferences: state.notificationPreferences,
    };
  }

  if (section === "email") {
    return {
      email_server: state.emailServer,
    };
  }

  if (section === "roles") {
    return {
      role_permissions: state.rolePermissions,
    };
  }

  if (section === "system") {
    return {
      system_configuration: state.systemConfiguration,
    };
  }

  return {};
}

function getAlertIcon(type: AlertState["type"]): ReactNode {
  if (type === "success") return <CheckCircle2 size={18} />;
  if (type === "error") return <AlertCircle size={18} />;
  return <Bell size={18} />;
}

function AlertBox({
  tone,
  icon,
  children,
}: {
  tone: AlertState["type"];
  icon: ReactNode;
  children: ReactNode;
}) {
  const className = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  }[tone];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm",
        className
      )}
    >
      <div className="shrink-0">{icon}</div>
      <div>{children}</div>
    </div>
  );
}

function SettingsPanel({
  icon,
  title,
  description,
  children,
  adminOnly = false,
  disabled = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  adminOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60",
        disabled && "opacity-70"
      )}
    >
      <div className="border-b border-slate-100 bg-white px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              {icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-950">{title}</h2>
                {adminOnly && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                    Admin only
                  </span>
                )}
              </div>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function GroupedSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40",
        disabled && "bg-slate-50 opacity-70"
      )}
    >
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2",
          checked ? "bg-blue-600" : "bg-slate-300",
          disabled && "cursor-not-allowed"
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition",
            checked ? "left-6" : "left-1"
          )}
        />
      </button>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <div className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500">
        {value || "—"}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function SummaryCard({
  profile,
  lastLoadedAt,
  emailNotifications,
  systemNotifications,
  systemConfiguration,
}: {
  profile: ProfileSettings;
  lastLoadedAt: Date | null;
  emailNotifications: number;
  systemNotifications: number;
  systemConfiguration: SystemConfiguration;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
      <div className="mb-4 flex items-center gap-2 text-slate-900">
        <Settings size={18} className="text-blue-600" />
        <h3 className="text-sm font-black">System Summary</h3>
      </div>

      <div className="space-y-3">
        <StatusRow
          icon={<UserCog size={15} />}
          label="Current user"
          value={profile.fullName || "Not loaded"}
        />
        <StatusRow
          icon={<ShieldCheck size={15} />}
          label="Current role"
          value={getReadableRole(profile)}
          tone="success"
        />
        <StatusRow
          icon={<Mail size={15} />}
          label="Email notifications"
          value={`${emailNotifications} enabled`}
          tone="success"
        />
        <StatusRow
          icon={<Bell size={15} />}
          label="System notifications"
          value={`${systemNotifications} enabled`}
          tone="success"
        />
        <StatusRow
          icon={<LockKeyhole size={15} />}
          label="Document access"
          value={
            systemConfiguration.requireScanBeforeAccess
              ? "Scan required"
              : "Scan optional"
          }
          tone={
            systemConfiguration.requireScanBeforeAccess ? "success" : "warning"
          }
        />
        <StatusRow
          icon={<Clock3 size={15} />}
          label="Last refreshed"
          value={lastLoadedAt ? formatDateTime(lastLoadedAt) : "Not yet"}
        />
      </div>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass = {
    default: "border-slate-200 bg-slate-50 text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border p-3", toneClass)}>
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-black">{label}</p>
        <p className="mt-0.5 truncate text-[11px] font-semibold opacity-75">
          {value}
        </p>
      </div>
    </div>
  );
}

function CheckItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
      <span>{label}</span>
    </div>
  );
}