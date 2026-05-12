import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, RefreshCcw, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { assignComplaint, listComplaints, listUsers, updateComplaintStatus } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import ReportStudentDialog from "@/components/ReportStudentDialog";
import { KPICard, StatsRow, ActivityTimeline } from "@/components/ui";
import { ChartCard } from "@/components/charts/ChartCard";

const statusOptions = ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export default function ComplaintManagerDashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});
  const [complaintTypeFilter, setComplaintTypeFilter] = useState("ALL");
  const [reportTarget, setReportTarget] = useState(null);
  const [activities, setActivities] = useState([]);

  const complaintScope = String(user?.complaintType || user?.department || "").trim().toUpperCase();

  function isInComplaintScope(item) {
    if (!complaintScope) {
      return true;
    }

    return String(item?.complaintType || "").trim().toUpperCase() === complaintScope;
  }

  async function loadData() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [complaintResponse, reviewerResponse] = await Promise.all([
        listComplaints(token, { limit: 25 }),
        listUsers(token, { role: "INVESTIGATOR", limit: 100 }),
      ]);

      const complaintsData = complaintResponse.items || [];
      const complaintsData = (complaintResponse.items || []).filter(isInComplaintScope);
      setComplaints(complaintsData);
      setReviewers(reviewerResponse.items || []);

      // Generate activity logs from complaints
      const mockActivities = complaintsData.slice(0, 8).map((complaint, idx) => ({
        id: complaint.id,
        type: complaint.status === "RESOLVED" ? "RESOLVED" : complaint.status === "IN_PROGRESS" ? "STATUS_UPDATED" : "COMPLAINT_CREATED",
        description: `${complaint.complaintType} complaint - ${complaint.title}`,
        actor: { name: complaint.assignedTo?.name || "System", role: "INVESTIGATOR" },
        entity: "Complaint",
        createdAt: new Date(new Date().getTime() - idx * 60000),
      }));
      setActivities(mockActivities);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token, complaintScope]);

  const updateAssignment = async (complaintId) => {
    const assignedToId = selectedAssignee[complaintId];
    if (!token || !assignedToId) {
      return;
    }

    try {
      const response = await assignComplaint(token, complaintId, { assignedToId });
        const response = await assignComplaint(token, complaintId, { assignedToId });
      toast.success(response?.message || "Complaint assigned successfully.");
      await loadData();
      await loadData();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Failed to assign complaint.");
    }
  };

  const visibleComplaints =
  const visibleComplaints =
    complaintTypeFilter === "ALL"
      ? complaints
      : complaints.filter((item) => String(item.complaintType || "").toUpperCase() === complaintTypeFilter);

  const complaintTypeOptions = Array.from(
    new Set(complaints.map((item) => String(item.complaintType || "").toUpperCase()).filter(Boolean)),
  ).sort();

  const pendingComplaints = complaints.filter((c) => !["RESOLVED", "REJECTED"].includes(c.status));
  const resolvedComplaints = complaints.filter((c) => c.status === "RESOLVED");
  const inProgressComplaints = complaints.filter((c) => c.status === "IN_PROGRESS");

  const kpiItems = [
    {
      icon: AlertCircle,
      label: "Total Complaints",
      value: loading ? "..." : complaints.length,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: 8,
      trendLabel: "this month",
    },
    {
      icon: Clock,
      label: "Under Review",
      value: loading ? "..." : inProgressComplaints.length,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: 3,
      trendLabel: "in progress",
    },
    {
      icon: CheckCircle,
      label: "Resolved",
      value: loading ? "..." : resolvedComplaints.length,
      color: "bg-green-50",
      iconColor: "text-green-600",
      trend: 12,
      trendLabel: "this month",
    },
    {
      icon: Users,
      label: "Investigators",
      value: loading ? "..." : reviewers.length,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
      trend: 0,
      trendLabel: "assigned",
    },
  ];

  return (
    <DashboardLayout role="complaint_manager" user={user || {}}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Complaint workflow</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Complaint Manager Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">Review complaints, assign investigators, and drive the complaint lifecycle.</p>
          </div>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent transition-colors">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        {/* KPI Cards */}
        <section>
          <StatsRow items={kpiItems} />
        </section>

        {/* Complaint Type Filter + Activity */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard title="Filter & Manage" subtitle="Select complaint type to view">
              <div className="space-y-4">
                <div>
                  <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Filter by complaint type</label>
                  <select
                    value={complaintTypeFilter}
                    onChange={(event) => setComplaintTypeFilter(event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ALL">All complaint types</option>
                    {complaintTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground mb-3">Recent complaints: {visibleComplaints.length}</p>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {visibleComplaints.slice(0, 5).map((complaint) => (
                      <div key={complaint.id} className="rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{complaint.title}</p>
                            <p className="text-xs text-muted-foreground">{complaint.complaintType}</p>
                          </div>
                          <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-foreground whitespace-nowrap">{complaint.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Activity Feed */}
          <div>
            <ChartCard title="Recent Activity" subtitle="Department actions" loading={loading}>
            <ChartCard title="Recent Activity" subtitle="Department actions" loading={loading}>
              <ActivityTimeline activities={activities} loading={loading} />
            </ChartCard>
          </div>
        </section>

        {/* Complaints List */}
        <section>
          <ChartCard title="All Complaints" subtitle={`Showing ${visibleComplaints.length} complaints`} loading={loading}>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {visibleComplaints.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No complaints found.</div>
              ) : (
                visibleComplaints.map((complaint) => (
                  <div key={complaint.id} className="rounded-lg border border-border p-4 hover:border-foreground transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">{complaint.title}</p>
                          <span className="text-xs font-medium text-muted-foreground">{complaint.complaintType}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{complaint.description}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground whitespace-nowrap">{complaint.status}</span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <select
                        value={selectedAssignee[complaint.id] || complaint.assignedToId || ""}
                        onChange={(event) => setSelectedAssignee((current) => ({ ...current, [complaint.id]: event.target.value }))}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Assign to...</option>
                        {reviewers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-2">
                        <select
                          value={selectedStatus[complaint.id] || complaint.status}
                          onChange={(event) => setSelectedStatus((current) => ({ ...current, [complaint.id]: event.target.value }))}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            updateStatus(complaint.id);
                            updateAssignment(complaint.id);
                          }}
                          className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium hover:bg-primary/90 transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ChartCard>
        </section>

        <ReportStudentDialog
          open={Boolean(reportTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setReportTarget(null);
            }
          }}
          defaultStudentId={reportTarget?.createdBy?.username || reportTarget?.createdById || ""}
          complaintId={reportTarget?.id}
          contextLabel="complaint"
        />
      </div>
    </DashboardLayout>
  );
}
