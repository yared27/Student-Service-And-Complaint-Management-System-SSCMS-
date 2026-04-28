import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest } from "@/lib/api/httpClient";
import { useAuth } from "@/context/auth-context";

function formatLabel(value) {
  return String(value || "Unknown").replaceAll("_", " ");
}

function topEntry(entries, fallbackLabel) {
  const item = Array.isArray(entries) && entries.length > 0 ? entries[0] : null;
  if (!item) {
    return fallbackLabel;
  }

  const label = item.serviceType || item.complaintType || item.label || item.name || fallbackLabel;
  const count = item._count?._all ?? item.count ?? 0;
  return `${formatLabel(label)} (${count})`;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const topLinks = [
    { to: "/admin/dashboard", label: "Analytics", end: true },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/analytics/logs", label: "Logs" },
  ];

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [analyticsResponse, reportsResponse] = await Promise.all([
        apiRequest("/admin/analytics"),
        apiRequest("/admin/reports?limit=10"),
      ]);

      setAnalytics(analyticsResponse || null);
      setReports(reportsResponse?.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const serviceSeries = analytics?.serviceRequestsByType || [];
  const complaintSeries = analytics?.complaintsByType || [];
  const totalUsers = analytics?.totalUsers || 0;
  const activeUsers = analytics?.activeUsers || 0;
  const bannedUsers = analytics?.bannedUsers || 0;
  const warnedUsers = analytics?.warnedUsers || 0;

  return (
    <DashboardLayout role="admin" topLinks={topLinks} user={user || {}} showSearch searchPlaceholder="Search analytics, reports, or users...">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">System controller</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">Live analytics for services, complaints, reports, and account status.</p>
          </div>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error ? <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Most requested service</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{loading ? "..." : topEntry(serviceSeries, "No data")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Most frequent complaint</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{loading ? "..." : topEntry(complaintSeries, "No data")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Reported students</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : analytics?.reportedStudentsCount || 0}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Active vs banned</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{loading ? "..." : `${activeUsers} / ${bannedUsers}`}</p>
            <p className="mt-1 text-sm text-muted-foreground">Warned: {warnedUsers} · Total users: {totalUsers}</p>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground">Service Requests by Type</h2>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading chart...</div>
              ) : serviceSeries.length === 0 ? (
                <div className="text-sm text-muted-foreground">No service data yet.</div>
              ) : (
                serviceSeries.map((row) => {
                  const max = Math.max(...serviceSeries.map((item) => item._count._all || 0), 1);
                  const width = `${Math.max(((row._count._all || 0) / max) * 100, 6)}%`;

                  return (
                    <div key={row.serviceType}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{formatLabel(row.serviceType)}</span>
                        <span className="text-muted-foreground">{row._count._all}</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground">Complaint Types</h2>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading chart...</div>
              ) : complaintSeries.length === 0 ? (
                <div className="text-sm text-muted-foreground">No complaint data yet.</div>
              ) : (
                complaintSeries.map((row) => {
                  const max = Math.max(...complaintSeries.map((item) => item._count._all || 0), 1);
                  const width = `${Math.max(((row._count._all || 0) / max) * 100, 6)}%`;

                  return (
                    <div key={row.complaintType}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{formatLabel(row.complaintType)}</span>
                        <span className="text-muted-foreground">{row._count._all}</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-accent" style={{ width }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-foreground">Recent Reported Students</h2>
            <a href="/admin/reports" className="text-sm font-medium text-primary hover:underline">
              Open reports
            </a>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="text-sm text-muted-foreground">No recent reports.</div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{report.reportedUser?.name || report.reportedUser?.username || report.reportedUserId}</p>
                      <p className="text-sm text-muted-foreground">{formatLabel(report.reason)} · {formatLabel(report.reporter?.role)}</p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}