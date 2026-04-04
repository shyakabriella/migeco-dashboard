import { useState } from "react";
import Toggle from "./Toggle";

const restorePoints = [
  { date: "Oct 24, 2023", time: "14:00", type: "Automated", size: "42.8 GB", highlighted: true },
  { date: "Oct 23, 2023", time: "14:00", type: "Automated", size: "42.5 GB", highlighted: false },
  { date: "Oct 22, 2023", time: "09:15", type: "Manual", size: "42.1 GB", highlighted: false },
  { date: "Oct 22, 2023", time: "14:00", type: "Automated", size: "41.9 GB", highlighted: false },
];

export default function BackupRestore() {
  const [frequency, setFrequency] = useState<"Daily" | "Weekly" | "Custom">("Daily");
  const [retention, setRetention] = useState("7 Years (Standard)");
  const [fullDB, setFullDB] = useState(true);
  const [fileSystem, setFileSystem] = useState(true);
  const [searchDate, setSearchDate] = useState("");

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0c14] p-8">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">System Backup & Restore</h1>
            <p className="text-slate-500 text-sm">Configure automated backups schedules and manage data restoration points.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2 rounded-lg border border-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors bg-[#1a1c2e]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              View Logs
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Trigger Manual Backup
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-8 space-y-6">

            {/* Current Backup Status */}
            <div className="bg-[#1a1c2e] rounded-xl p-6 relative overflow-hidden border border-slate-800">
            {/* Decorative icon */}
            <div className="absolute right-5 top-5 opacity-10">
              <svg className="w-24 h-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-white text-sm font-semibold">Current Backup Status</span>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">Last Successful Backup</p>
                <p className="text-white text-xl font-semibold">2 hours ago</p>
                <p className="text-gray-500 text-xs mt-0.5">Oct 24, 2023 at 14:00 UTC</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">Next Scheduled Backup</p>
                <p className="text-white text-xl font-semibold">in 4 hours</p>
                <p className="text-gray-500 text-xs mt-0.5">Oct 24, 2023 at 20:00 UTC</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Backup Location: <span className="text-white font-medium">AWS S3 (eu-west-1)</span>
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">System Healthy</span>
              </div>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="bg-[#1a1c2e] rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span className="text-white text-sm font-semibold">Schedule Configuration</span>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Frequency</label>
                <div className="flex bg-[#0f111a] rounded-lg p-1 gap-1">
                  {(["Daily", "Weekly", "Custom"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${
                        frequency === f
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Time (UTC)</label>
                <div className="bg-[#0f111a] border border-slate-800 rounded-lg px-3 py-2 text-white text-xs flex items-center justify-between">
                  <span>08:00 PM</span>
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-3">Backup Scope</p>
              <div className="space-y-3">
                {/* Full Database Backup */}
                <div
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    fullDB ? "border-indigo-500/40 bg-indigo-500/5" : "border-slate-800 bg-[#0f111a]"
                  }`}
                  onClick={() => setFullDB(!fullDB)}
                >
                  <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                    fullDB ? "bg-indigo-500" : "border border-slate-600 bg-transparent"
                  }`}>
                    {fullDB && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">Full Database Backup</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Includes all user data, configurations, and logs.</p>
                  </div>
                </div>

                {/* File System Assets */}
                <div
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    fileSystem ? "border-indigo-500/40 bg-indigo-500/5" : "border-slate-800 bg-[#0f111a]"
                  }`}
                  onClick={() => setFileSystem(!fileSystem)}
                >
                  <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                    fileSystem ? "bg-indigo-500" : "border border-slate-600 bg-transparent"
                  }`}>
                    {fileSystem && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">File System Assets</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Uploaded documents, images, and raw data files.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button className="text-indigo-400 text-xs font-medium hover:text-indigo-300 transition-colors">
                Advanced Settings &rsaquo;
              </button>
            </div>
          </div>

          {/* Available Restore Points */}
          <div className="bg-[#1a1c2e] rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white text-sm font-semibold">Available Restore Points</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0f111a] border border-slate-800 rounded-lg px-3 py-2">
                <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search date..."
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-400 placeholder-slate-600 outline-none w-24"
                />
              </div>
            </div>

            {/* Table */}
            <div>
              <div className="grid grid-cols-4 gap-4 px-3 pb-2 border-b border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Date & Time</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Type</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Size</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Action</span>
              </div>

              {restorePoints.map((point, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-4 gap-4 px-3 py-3.5 border-b border-slate-800 last:border-0 items-center ${
                    point.highlighted ? "bg-white/[0.03] rounded-lg" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-medium">{point.date}</span>
                    <span className="text-slate-500 text-xs">{point.time}</span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                      point.type === "Automated"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
                        : "bg-pink-500/20 text-pink-300 border border-pink-500/20"
                    }`}>
                      {point.type}
                    </span>
                  </div>
                  <span className="text-slate-300 text-xs">{point.size}</span>
                  <button
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors w-fit ${
                      point.highlighted
                        ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20"
                        : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 text-center">
              <button className="text-indigo-400 text-xs font-medium hover:text-indigo-300 transition-colors">
                View All History &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-6">

          {/* Storage Settings */}
          <div className="bg-[#1a1c2e] rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
              <span className="text-white text-sm font-semibold">Storage Settings</span>
            </div>

            {/* Cloud Storage Usage */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300 font-medium">Cloud Storage Usage</span>
                <span className="text-sm font-bold text-indigo-400">78%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-1">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-2 rounded-full" style={{ width: "78%" }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase tracking-tighter">
                <span>Used: 3.9 TB</span>
                <span>Total: 5.0 TB</span>
              </div>
            </div>

            {/* Retention Policy */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Retention Policy</label>
              <div className="relative">
                <select
                  value={retention}
                  onChange={(e) => setRetention(e.target.value)}
                  className="w-full bg-[#0f111a] border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none cursor-pointer transition-all"
                >
                  <option>7 Years (Standard)</option>
                  <option>3 Years (Short)</option>
                  <option>10 Years (Extended)</option>
                  <option>Custom</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-3 mb-4">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                Deleted files are kept in recycle bin for 30 days before permanent deletion.
              </p>
            </div>

            <button className="w-full py-2 bg-[#1a1c2e] border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors">
              Manage Storage Plans
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-[#1a1c2e] rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="text-white text-sm font-semibold">Notifications</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Email Alerts</p>
                  <p className="text-[10px] text-slate-500">Receive critical updates via email</p>
                </div>
                <Toggle defaultOn={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">System Popups</p>
                  <p className="text-[10px] text-slate-500">In-app browser notifications</p>
                </div>
                <Toggle defaultOn={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Weekly Digest</p>
                  <p className="text-[10px] text-slate-500">Summary of activity</p>
                </div>
                <Toggle defaultOn={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
