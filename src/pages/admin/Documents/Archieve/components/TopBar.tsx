export default function TopBar() {
  return (
    <div className="h-14 bg-[#0d1117] border-b border-[#1e2330] flex items-center justify-between px-5 flex-shrink-0">
      {/* Search */}
      <div className="flex items-center bg-[#161b27] border border-[#2a3145] rounded-lg px-3 py-2 w-72 gap-2">
        <svg className="w-4 h-4 text-[#8b9bb4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search archive..."
          className="bg-transparent text-sm text-[#8b9bb4] placeholder-[#8b9bb4] outline-none flex-1"
        />
        <kbd className="text-[10px] text-[#8b9bb4] bg-[#1e2330] border border-[#2a3145] rounded px-1.5 py-0.5">⌘K</kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative cursor-pointer">
          <svg className="w-5 h-5 text-[#8b9bb4] hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#0d1117]" />
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-[#1a1f2e] rounded-lg px-2 py-1.5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4f8ef7] to-[#3b5bdb] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AM
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-semibold leading-tight">Alex Morgan</span>
            <span className="text-[#8b9bb4] text-[10px] leading-tight">Lead Geologist</span>
          </div>
          <svg className="w-3.5 h-3.5 text-[#8b9bb4] ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
