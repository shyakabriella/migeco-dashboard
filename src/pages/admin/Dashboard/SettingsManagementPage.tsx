import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  RefreshCcw,
  Save,
  Send,
  Settings,
  ShieldCheck,
} from "lucide-react";
import AdminSidebar from "../../admin/AdminSidebar";

type NotificationSettings = {
  documentUploaded: boolean;
  documentArchived: boolean;
  documentRestored: boolean;
  scanFailed: boolean;
  sandboxUnsafe: boolean;
  aiCompleted: boolean;
  weeklySummary: boolean;
};

type EmailSettings = {
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

const defaultNotifications: NotificationSettings = {
  documentUploaded: true,
  documentArchived: true,
  documentRestored: true,
  scanFailed: true,
  sandboxUnsafe: true,
  aiCompleted: false,
  weeklySummary: true,
};

const defaultEmailSettings: EmailSettings = {
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

export default function SettingsManagementPage() {
  const [notifications, setNotifications] =
    useState<NotificationSettings>(defaultNotifications);
  const [emailSettings, setEmailSettings] =
    useState<EmailSettings>(defaultEmailSettings);
  const [saving, setSaving] = useState<boolean>(false);
  const [testingEmail, setTestingEmail] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  function updateNotification(
    field: keyof NotificationSettings,
    value: boolean,
  ): void {
    setNotifications((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateEmailField(field: keyof EmailSettings, value: string): void {
    setEmailSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      await new Promise((resolve) => window.setTimeout(resolve, 500));

      setMessage("Settings saved successfully.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail(): Promise<void> {
    try {
      setTestingEmail(true);
      setMessage("");

      await new Promise((resolve) => window.setTimeout(resolve, 650));

      setMessage(`Test email prepared for ${emailSettings.adminEmail}.`);
    } finally {
      setTestingEmail(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 lg:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <span>Management</span>
              <span>/</span>
              <span className="text-blue-600">Settings</span>
            </div>

            <h1 className="mt-1 truncate text-lg font-bold text-slate-900 lg:text-xl">
              Notifications & Email Settings
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <RefreshCcw size={15} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="submit"
              form="settings-form"
              disabled={saving}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              <span className="hidden sm:inline">Save Settings</span>
            </button>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-auto p-3 lg:p-4">
          <form
            id="settings-form"
            onSubmit={handleSave}
            className="mx-auto grid w-full max-w-[1450px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]"
          >
            <div className="space-y-4">
              {message && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 size={18} />
                  {message}
                </div>
              )}

              <SectionCard
                icon={<Bell size={18} />}
                title="Notification Rules"
                description="Choose which system events should notify users and administrators."
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <ToggleRow
                    title="Document uploaded"
                    description="Notify document controllers when a new file enters quarantine."
                    checked={notifications.documentUploaded}
                    onChange={(value) =>
                      updateNotification("documentUploaded", value)
                    }
                  />
                  <ToggleRow
                    title="Document archived"
                    description="Notify managers when an active document is moved to archive."
                    checked={notifications.documentArchived}
                    onChange={(value) =>
                      updateNotification("documentArchived", value)
                    }
                  />
                  <ToggleRow
                    title="Document restored"
                    description="Notify responsible users when an archived document becomes active again."
                    checked={notifications.documentRestored}
                    onChange={(value) =>
                      updateNotification("documentRestored", value)
                    }
                  />
                  <ToggleRow
                    title="Antivirus scan failed"
                    description="Alert security team when scanner fails or cannot process a file."
                    checked={notifications.scanFailed}
                    onChange={(value) => updateNotification("scanFailed", value)}
                  />
                  <ToggleRow
                    title="Sandbox unsafe"
                    description="Send urgent alert when sandbox marks a document unsafe."
                    checked={notifications.sandboxUnsafe}
                    onChange={(value) =>
                      updateNotification("sandboxUnsafe", value)
                    }
                  />
                  <ToggleRow
                    title="AI analysis completed"
                    description="Notify uploader when AI metadata suggestions are ready."
                    checked={notifications.aiCompleted}
                    onChange={(value) =>
                      updateNotification("aiCompleted", value)
                    }
                  />
                  <ToggleRow
                    title="Weekly summary"
                    description="Send weekly digest for uploads, archives, security events, and lab work."
                    checked={notifications.weeklySummary}
                    onChange={(value) =>
                      updateNotification("weeklySummary", value)
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard
                icon={<Mail size={18} />}
                title="Email Configuration"
                description="Configure the sender identity and SMTP connection used by system notifications."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Mailer Name"
                    value={emailSettings.mailerName}
                    onChange={(value) => updateEmailField("mailerName", value)}
                  />
                  <InputField
                    label="From Name"
                    value={emailSettings.fromName}
                    onChange={(value) => updateEmailField("fromName", value)}
                  />
                  <InputField
                    label="From Email"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(value) => updateEmailField("fromEmail", value)}
                  />
                  <InputField
                    label="Reply-To Email"
                    type="email"
                    value={emailSettings.replyToEmail}
                    onChange={(value) =>
                      updateEmailField("replyToEmail", value)
                    }
                  />
                  <InputField
                    label="SMTP Host"
                    value={emailSettings.smtpHost}
                    onChange={(value) => updateEmailField("smtpHost", value)}
                  />
                  <InputField
                    label="SMTP Port"
                    value={emailSettings.smtpPort}
                    onChange={(value) => updateEmailField("smtpPort", value)}
                  />
                  <InputField
                    label="SMTP Username"
                    value={emailSettings.smtpUsername}
                    onChange={(value) =>
                      updateEmailField("smtpUsername", value)
                    }
                  />
                  <InputField
                    label="SMTP Password"
                    type="password"
                    value={emailSettings.smtpPassword}
                    placeholder="Leave blank to keep current password"
                    onChange={(value) =>
                      updateEmailField("smtpPassword", value)
                    }
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Encryption
                    </label>
                    <select
                      value={emailSettings.encryption}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        updateEmailField("encryption", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <InputField
                    label="Admin Test Email"
                    type="email"
                    value={emailSettings.adminEmail}
                    onChange={(value) => updateEmailField("adminEmail", value)}
                  />
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {testingEmail ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    Send Test Email
                  </button>
                </div>
              </SectionCard>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
                <div className="mb-4 flex items-center gap-2 text-slate-900">
                  <Settings size={18} className="text-blue-600" />
                  <h2 className="text-sm font-bold">Settings Status</h2>
                </div>

                <div className="space-y-3">
                  <StatusRow
                    icon={<ShieldCheck size={15} />}
                    label="Notification rules"
                    value={`${enabledNotificationCount(notifications)} enabled`}
                    tone="success"
                  />
                  <StatusRow
                    icon={<Mail size={15} />}
                    label="SMTP host"
                    value={emailSettings.smtpHost || "Not set"}
                  />
                  <StatusRow
                    icon={<Clock3 size={15} />}
                    label="Weekly summary"
                    value={notifications.weeklySummary ? "Enabled" : "Disabled"}
                    tone={notifications.weeklySummary ? "success" : "muted"}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-bold text-blue-900">
                  Professional setup reminder
                </p>
                <p className="mt-2 text-xs leading-5 text-blue-700">
                  Use a verified domain email for production notifications.
                  Recommended sender: no-reply on the same domain as your
                  official MIGECO platform.
                </p>
              </div>
            </aside>
          </form>
        </section>
      </main>
    </div>
  );
}

function enabledNotificationCount(settings: NotificationSettings): number {
  return Object.values(settings).filter(Boolean).length;
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
      />
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
  tone?: "default" | "success" | "muted";
}) {
  const toneClass = {
    default: "border-slate-200 bg-slate-50 text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    muted: "border-slate-200 bg-slate-100 text-slate-500",
  }[tone];

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${toneClass}`}>
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold">{label}</p>
        <p className="mt-0.5 truncate text-[11px] opacity-75">{value}</p>
      </div>
    </div>
  );
}