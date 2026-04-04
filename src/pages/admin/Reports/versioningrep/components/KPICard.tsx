import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KPICardProps {
  label: string;
  value: string;
  trend?: string;
  trendLabel?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  progress?: number;
  progressBarColor?: string;
  description?: string;
}

const KPICard = ({ 
  label, 
  value, 
  trend, 
  trendLabel, 
  trendUp, 
  icon: Icon,
  iconColor = "text-indigo-400",
  iconBgColor = "bg-[#1E203B]",
  progress,
  progressBarColor = "bg-red-500",
  description
}: KPICardProps) => {
  return (
    <div className="bg-[#15162B] border border-[#1E203B] rounded-2xl p-6 flex-1 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={cn("p-2 rounded-xl", iconBgColor)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>

      <div>
        {progress !== undefined ? (
          <div className="space-y-4">
            <div className="w-full bg-[#1E203B] rounded-full h-2 overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", progressBarColor)} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {description && (
              <p className="text-[10px] text-slate-500">{description}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full",
              trendUp ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
            )}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </div>
            <span className="text-[11px] font-medium text-slate-500">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
