import type { ElementType } from 'react';
import { Tag, Zap, TrendingUp, Trash2 } from 'lucide-react';
import { cn } from '../../../../../../../../src/utils/cn';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  color: string;
  iconBg: string;
}

const StatsCard = ({ label, value, icon: Icon, color, iconBg }: StatsCardProps) => (
  <div className="bg-[#1a1932] p-6 rounded-xl border border-gray-800 flex items-center gap-4 flex-1">
    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBg)}>
      <Icon size={24} className={color} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  </div>
);

export const StatsGrid = () => {
  const stats = [
    { label: "Total Tags", value: "1,452", icon: Tag, color: "text-indigo-400", iconBg: "bg-indigo-900/20" },
    { label: "AI Tagged", value: "892", icon: Zap, color: "text-emerald-400", iconBg: "bg-emerald-900/20" },
    { label: "Most Used", value: "#soil-analysis", icon: TrendingUp, color: "text-purple-400", iconBg: "bg-purple-900/20" },
    { label: "Unused Tags", value: "45", icon: Trash2, color: "text-rose-400", iconBg: "bg-rose-900/20" },
  ];

  return (
    <div className="flex gap-4 w-full">
      {stats.map((stat, idx) => (
        <StatsCard key={idx} {...stat} />
      ))}
    </div>
  );
};
