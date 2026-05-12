import { TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  trend = null, 
  trendLabel = null, 
  color = "bg-blue-50", 
  iconColor = "text-blue-600", 
  loading = false,
  onClick = null 
}) {
  const isPositiveTrend = trend && trend > 0;
  
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 ${
        onClick ? "cursor-pointer hover:-translate-y-1" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-bold text-foreground">{loading ? "..." : value}</p>

          {trend !== null && trendLabel && (
            <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${isPositiveTrend ? "text-green-600" : "text-red-600"}`}>
              {isPositiveTrend ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>
                {trend > 0 ? "+" : ""}
                {trend}% {trendLabel}
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`rounded-xl ${color} p-3`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadgeKPI({ status, count, icon: Icon }) {
  const statusConfig = {
    PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    SUBMITTED: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    IN_PROGRESS: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    UNDER_REVIEW: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    RESOLVED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    COMPLETED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    ESCALATED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    REJECTED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 flex items-center gap-3`}>
      {Icon && <Icon className={`w-5 h-5 ${config.text}`} />}
      <div>
        <p className={`text-xs font-semibold uppercase tracking-widest ${config.text}`}>{status}</p>
        <p className={`text-2xl font-bold mt-1 ${config.text}`}>{count}</p>
      </div>
    </div>
  );
}

export function StatsRow({ items }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => (
        <KPICard key={idx} {...item} />
      ))}
    </div>
  );
}
