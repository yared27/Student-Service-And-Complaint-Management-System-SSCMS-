import { Clock, FileText, CheckCircle2, AlertCircle, Zap } from "lucide-react";

const activityTypeConfig = {
  SERVICE_REQUEST_CREATED: {
    icon: FileText,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    label: "Service Request Created",
  },
  COMPLAINT_CREATED: {
    icon: AlertCircle,
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    label: "Complaint Created",
  },
  STATUS_UPDATED: {
    icon: CheckCircle2,
    color: "bg-green-50",
    iconColor: "text-green-600",
    label: "Status Updated",
  },
  ASSIGNED: {
    icon: Zap,
    color: "bg-orange-50",
    iconColor: "text-orange-600",
    label: "Assignment",
  },
  RESOLVED: {
    icon: CheckCircle2,
    color: "bg-green-50",
    iconColor: "text-green-600",
    label: "Resolved",
  },
  ESCALATED: {
    icon: AlertCircle,
    color: "bg-red-50",
    iconColor: "text-red-600",
    label: "Escalated",
  },
};

export function ActivityFeed({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.slice(0, 8).map((activity, idx) => {
          const config = activityTypeConfig[activity.type] || activityTypeConfig.SERVICE_REQUEST_CREATED;
          const Icon = config.icon;
          const timestamp = new Date(activity.createdAt || activity.timestamp);
          const timeStr = formatTimeAgo(timestamp);

          return (
            <div key={activity.id || idx} className="flex gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0">
              <div className={`rounded-lg ${config.color} p-2 shrink-0`}>
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">{activity.description || config.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.entity || "System"} · {activity.actor?.name || "System"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">{timeStr}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export function ActivityTimeline({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {activities.map((activity, idx) => {
          const config = activityTypeConfig[activity.type] || activityTypeConfig.SERVICE_REQUEST_CREATED;
          const Icon = config.icon;

          return (
            <div key={activity.id || idx} className="relative pl-16">
              <div className={`absolute left-0 top-1 rounded-full ${config.color} p-2.5`}>
                <Icon className={`w-4 h-4 ${config.iconColor}`} />
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground">{activity.description || config.label}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {activity.actor?.name || "System"} · {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
