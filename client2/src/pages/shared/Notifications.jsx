import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Bell, CheckCircle2, Clock, Inbox, Route } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api/httpClient";
import { useAuth } from "@/context/AuthContext";

const DASHBOARD_PATH_BY_ROLE = {
  student: "/student/dashboard",
  service_manager: "/service-manager/dashboard",
  complaint_manager: "/complaint-manager/dashboard",
  field_staff: "/field-staff/dashboard",
  staff: "/field-staff/dashboard",
};

function getDashboardPath(role) {
  return DASHBOARD_PATH_BY_ROLE[String(role || "").toLowerCase()] || "/student/dashboard";
}

function formatRelativeTime(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function getNotificationIcon(type) {
  const normalized = String(type || "").toUpperCase();
  if (normalized.includes("COMPLAINT") || normalized.includes("MISUSE") || normalized.includes("SYSTEM")) {
    return <AlertCircle className="h-5 w-5" />;
  }

  return <Bell className="h-5 w-5" />;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dashboardPath = useMemo(() => getDashboardPath(user?.role), [user?.role]);

  const loadNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/notifications?limit=50");
      setNotifications(response?.items || []);
    } catch (requestError) {
      setError(requestError.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markOneRead = async (notificationId) => {
    await apiRequest(`/notifications/${notificationId}/read`, { method: "PATCH" });
    await loadNotifications();
  };

  const markAllRead = async () => {
    await apiRequest("/notifications/read-all", { method: "PATCH" });
    await loadNotifications();
  };

  const openNotification = async (item) => {
    try {
      if (!item.isRead) {
        await markOneRead(item.id);
      }
    } finally {
      navigate(item.route || dashboardPath);
    }
  };

  return (
    <DashboardLayout
      role={user?.role || "student"}
      user={user}
      topLinks={[{ to: dashboardPath, label: "Go to dashboard", end: true }]}
    >
      <div className="space-y-8 pb-20 max-w-6xl mx-auto w-full">
        <section className="pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">SSCMS Notification Center</h2>
            <h1 className="text-3xl md:text-5xl font-black text-[#002B5B] leading-tight tracking-tight">Alerts and routed updates</h1>
            <p className="text-sm text-slate-500 max-w-2xl">Notifications now open the exact routed entity when available, or take you back to your role dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">{unreadCount} unread</span>
            </div>
            <Button onClick={() => navigate(dashboardPath)} variant="outline" className="rounded-2xl">
              <Route className="mr-2 h-4 w-4" /> Go to dashboard
            </Button>
            <Button onClick={markAllRead} className="rounded-2xl bg-[#002B5B] text-white hover:bg-[#002B5B]/90">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark all read
            </Button>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#002B5B]"><Inbox className="h-5 w-5" /></div>
            <div>
              <h3 className="font-bold text-[#002B5B]">Notification feed</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest">{notifications.length} total items</p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading notifications...</div>
          ) : error ? (
            <div className="p-12 text-center text-sm text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Bell className="mx-auto h-10 w-10 mb-3" />
              <p className="text-sm font-semibold">No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openNotification(item)}
                  className={`w-full text-left px-6 py-5 flex items-start gap-4 transition-colors hover:bg-slate-50 ${item.isRead ? "bg-white" : "bg-blue-50/30"}`}
                >
                  <div className={`mt-0.5 p-3 rounded-2xl ${item.isRead ? "bg-slate-100 text-slate-500" : "bg-white text-[#002B5B] shadow-sm"}`}>
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <p className="font-black text-[#002B5B] truncate">{item.title}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-6">{item.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                      <span className={`px-2.5 py-1 rounded-md ${item.isRead ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-[#002B5B]"}`}>
                        {item.isRead ? "Read" : "Unread"}
                      </span>
                      {item.route ? <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">Routed</span> : null}
                      {item.entityType ? <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-500">{item.entityType}</span> : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
