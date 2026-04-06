const StatCard = ({
  label,
  value,
  sub,
  subColor = "text-slate-400",
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  sub: string;
  subColor?: string;
  icon: React.ReactNode;
  iconBg: string;
}) => (
  <div className="bg-[#151d2e] border border-white/5 rounded-xl p-5 flex items-start justify-between flex-1">
    <div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className="text-white text-3xl font-bold mb-1.5">{value}</p>
      <p className={`text-xs font-medium ${subColor}`}>{sub}</p>
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
  </div>
);

export default function StatsCards() {
  return (
    <div className="flex gap-4 mb-6">
      <StatCard
        label="Total Reports"
        value="3,402"
        sub="↗ +12 this week"
        subColor="text-emerald-400"
        iconBg="bg-blue-500/20"
        icon={
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />
      <StatCard
        label="Active Sites"
        value="8"
        sub="Currently reporting"
        subColor="text-slate-400"
        iconBg="bg-teal-500/20"
        icon={
          <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      />
      <StatCard
        label="Pending Review"
        value="14"
        sub="Requires attention"
        subColor="text-amber-400"
        iconBg="bg-orange-500/20"
        icon={
          <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
      <StatCard
        label="Avg. Submission"
        value="16:30"
        sub="Daily time"
        subColor="text-slate-400"
        iconBg="bg-purple-500/20"
        icon={
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
}
