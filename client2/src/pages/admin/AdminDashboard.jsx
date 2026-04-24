import { useEffect, useState } from "react";
import { RefreshCcw, Send } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { listActivityLogs, listMisuseReports, listUsers, reviewMisuseReport } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const reviewStatuses = ["REVIEWED", "ACTION_TAKEN", "DISMISSED"];
const actionStatuses = ["NONE", "WARNING", "TEMP_SUSPENSION", "PERMANENT_BAN"];

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReview, setSelectedReview] = useState({});
  const [selectedAction, setSelectedAction] = useState({});

  const topLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/audit", label: "Audit" },
  ];

  async function loadData() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [reportResponse, userResponse, logResponse] = await Promise.all([
        listMisuseReports(token, { limit: 20 }),
        listUsers(token, { limit: 20 }),
        listActivityLogs(token, { limit: 20 }),
      ]);

      setReports(reportResponse.items || []);
      setUsers(userResponse.items || []);
      setActivityLogs(logResponse.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  const updateReport = async (reportId) => {
    const status = selectedReview[reportId];
    const actionTaken = selectedAction[reportId] || "NONE";
    if (!token || !status) {
      return;
    }

    await reviewMisuseReport(token, reportId, { status, actionTaken });
    await loadData();
  };

  return (
    <DashboardLayout role="admin" topLinks={topLinks} user={user || {}} showSearch searchPlaceholder="Search users, reports, or logs...">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">System controller</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">Review misuse reports, monitor user accounts, and inspect activity logs.</p>
          </div>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Users</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : users.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Misuse reports</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : reports.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Activity logs</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : activityLogs.length}</p>
          </div>
        </div>

        <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground">Misuse Reports</h2>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-sm text-muted-foreground">No misuse reports available.</div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{report.reason}</p>
                    <h3 className="mt-1 text-lg font-bold text-foreground">Reported user: {report.reportedUser?.name || report.reportedUserId}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{report.details || "No additional details provided."}</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{report.status}</span>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Review status</label>
                    <select
                      value={selectedReview[report.id] || report.status}
                      onChange={(event) => setSelectedReview((current) => ({ ...current, [report.id]: event.target.value }))}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    >
                      {reviewStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Action</label>
                    <select
                      value={selectedAction[report.id] || report.actionTaken || "NONE"}
                      onChange={(event) => setSelectedAction((current) => ({ ...current, [report.id]: event.target.value }))}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    >
                      {actionStatuses.map((action) => (
                        <option key={action} value={action}>
                          {action}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => updateReport(report.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
                    Save review <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading logs...</div>
          ) : activityLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No activity logs available.</div>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{log.action}</p>
                    <p className="text-sm text-muted-foreground">{log.description || log.entityType}</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
