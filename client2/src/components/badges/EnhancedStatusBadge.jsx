import { Check, Clock, AlertCircle, XCircle, Zap } from "lucide-react";

const statusConfig = {
  PENDING: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    icon: Clock,
    label: "Pending",
  },
  SUBMITTED: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    icon: Clock,
    label: "Submitted",
  },
  IN_PROGRESS: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Zap,
    label: "In Progress",
  },
  UNDER_REVIEW: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Zap,
    label: "Under Review",
  },
  ASSIGNED: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: Zap,
    label: "Assigned",
  },
  RESOLVED: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: Check,
    label: "Resolved",
  },
  COMPLETED: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: Check,
    label: "Completed",
  },
  REJECTED: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
    label: "Rejected",
  },
  ESCALATED: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: AlertCircle,
    label: "Escalated",
  },
  CLOSED: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: Check,
    label: "Closed",
  },
};

export function EnhancedStatusBadge({ status, size = "md", variant = "default" }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  if (variant === "filled") {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full ${config.bg} border ${config.border} ${sizeClasses[size]}`}>
        {Icon && <Icon className={`w-4 h-4 ${config.text}`} />}
        <span className={`font-semibold ${config.text}`}>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 rounded-full ${config.bg} border ${config.border} ${sizeClasses[size]}`}>
      {Icon && <Icon className={`w-3 h-3 ${config.text}`} />}
      <span className={`font-medium ${config.text}`}>{config.label}</span>
    </div>
  );
}

export function StatusGrid({ items = [] }) {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-widest">{item.label}</p>
          <p className="text-3xl font-bold text-foreground mt-3">{item.count}</p>
          {item.trend && <p className="text-xs text-muted-foreground mt-2">{item.trend}</p>}
        </div>
      ))}
    </div>
  );
}
