import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api/httpClient";
import { useAuth } from "@/context/AuthContext";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [reports, setReports] = useState([]);

  const topLinks = [
    { to: "/admin/dashboard", label: "Analytics" },
    { to: "/admin/reports", label: "Reports", end: true },
    { to: "/admin/users", label: "Users" },
  ];

  async function loadReports() {
    setLoading(true);
    try {
      const response = await apiRequest("/admin/reports?limit=100");
      setReports(response?.items || []);
    } catch (error) {
      toast.error(error.message || "Failed to load reports.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function moderate(reportId, actionTaken) {
    setSavingId(reportId);
    try {
      await apiRequest(`/admin/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify({ actionTaken }),
      });

      window.dispatchEvent(new Event("sscms-notifications-updated"));
      toast.success(actionTaken === "WARNING" ? "Student warned." : "Student banned.");
      await loadReports();
    } catch (error) {
      toast.error(error.message || "Failed to moderate report.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <DashboardLayout role="admin" topLinks={topLinks} user={user || {}}>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-accent px-6 py-5 text-primary-foreground shadow-elegant">
          <p className="text-xs uppercase tracking-[0.2em] opacity-85">Admin</p>
          <h1 className="mt-2 text-2xl md:text-3xl font-display font-bold">Reported Students</h1>
        </header>

        <section className="rounded-2xl border bg-card shadow-card p-4 space-y-4">
          {loading ? (
            <div className="py-8 text-sm text-muted-foreground">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="py-8 text-sm text-muted-foreground">No reports found.</div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{report.reason}</p>
                      <h2 className="text-lg font-bold text-foreground">
                        {report.reportedUser?.name || report.reportedUser?.username || report.reportedUserId}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Reporter role: {report.reporter?.role || "-"} · Student campus: {report.reportedUser?.campus || "-"}
                      </p>
                      <p className="text-sm text-muted-foreground">{report.details || "No additional details provided."}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => moderate(report.id, "WARNING")}
                        disabled={savingId === report.id}
                      >
                        Warn Student
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => moderate(report.id, "PERMANENT_BAN")}
                        disabled={savingId === report.id}
                      >
                        Ban Student
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}