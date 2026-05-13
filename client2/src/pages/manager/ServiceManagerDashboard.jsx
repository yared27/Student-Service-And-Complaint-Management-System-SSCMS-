import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, RefreshCcw, Truck, Users } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { assignServiceRequest, listServiceRequests, listUsers, updateServiceRequestStatus } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import ReportStudentDialog from "@/components/ReportStudentDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { KPICard, StatsRow, ActivityTimeline } from "@/components/ui";
import { ChartCard } from "@/components/charts/ChartCard";

const statusOptions = ["SUBMITTED", "IN_PROGRESS", "COMPLETED", "REJECTED"];

function extractLatestNote(activityLogs = []) {
  const noteLog = activityLogs.find((entry) => String(entry?.description || "").includes("Note:"));
  if (!noteLog) {
    return "";
  }

  const description = String(noteLog.description || "");
  const notePart = description.split("Note:").slice(1).join("Note:").trim();
  return notePart;
}

export default function ServiceManagerDashboard() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});
  const [statusNotes, setStatusNotes] = useState({});
  const [savingRequestId, setSavingRequestId] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [activities, setActivities] = useState([]);

  const serviceScope = String(user?.category || user?.serviceType || "").trim().toUpperCase();

  function isInServiceScope(item) {
    if (!serviceScope) {
      return true;
    }

    return String(item?.category || item?.serviceType || "").trim().toUpperCase() === serviceScope;
  }

  async function loadData() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [requestResponse, staffResponse] = await Promise.all([
        listServiceRequests(token, { limit: 25, category: user?.category }),
        listUsers(token, { role: "STAFF", limit: 100, category: user?.category }),
      ]);

      const requestsData = (requestResponse.items || []).filter(isInServiceScope);
      setRequests(requestsData);
      setStaff(staffResponse.items || []);

      const activityFeed = requestsData
        .flatMap((request) =>
          (request.activityLogs || []).map((entry) => ({
            id: entry.id,
            type: entry.action,
            description: entry.description || `${request.serviceType} request - ${request.title}`,
            actor: entry.actor || { name: request.assignedTo?.name || "System", role: "STAFF" },
            entity: "Service Request",
            createdAt: new Date(entry.createdAt),
          })),
        )
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
        .slice(0, 3);

      setActivities(activityFeed);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load service requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token, serviceScope]);

  const updateAssignment = async (requestId) => {
    const assignedToId = selectedAssignee[requestId];
    if (!token || !assignedToId) {
      return;
    }

    try {
      const response = await assignServiceRequest(token, requestId, { assignedToId });
      toast.success(response?.message || "Service request assigned successfully.");
      await loadData();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Failed to assign service request.");
    }
  };

  const updateStatus = async (requestId) => {
    const status = selectedStatus[requestId];
    const note = String(statusNotes[requestId] || "").trim();
    if (!token || !status) {
      return;
    }

    setSavingRequestId(requestId);

    try {
      const response = await updateServiceRequestStatus(token, requestId, { status, note });
      setConfirmation({ open: true, message: response?.message || "Status updated successfully." });
      setRequests((current) =>
        current.map((item) =>
          item.id === requestId
            ? {
                ...item,
                status: response?.serviceRequest?.status || status,
                statusRaw: response?.serviceRequest?.status || status,
              }
            : item,
        ),
      );
      setStatusNotes((current) => ({ ...current, [requestId]: "" }));
      await loadData();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Failed to update service request.");
    } finally {
      setSavingRequestId(null);
    }
  };

  const [confirmation, setConfirmation] = useState({ open: false, message: "" });

  const completedRequests = requests.filter((r) => r.status === "COMPLETED");
  const inProgressRequests = requests.filter((r) => r.status === "IN_PROGRESS");
  const rejectedRequests = requests.filter((r) => r.status === "REJECTED");

  const kpiItems = [
    {
      icon: Truck,
      label: "Total Requests",
      value: loading ? "..." : requests.length,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: 15,
      trendLabel: "this month",
    },
    {
      icon: Clock,
      label: "In Progress",
      value: loading ? "..." : inProgressRequests.length,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
      trend: 5,
      trendLabel: "assigned",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: loading ? "..." : completedRequests.length,
      color: "bg-green-50",
      iconColor: "text-green-600",
      trend: 18,
      trendLabel: "this month",
    },
    {
      icon: Users,
      label: "Field Staff",
      value: loading ? "..." : staff.length,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: 0,
      trendLabel: "available",
    },
  ];

  return (
    <DashboardLayout role="service_manager" user={user || {}}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Service workflow</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Service Manager Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">Assign requests to field staff and track completion through the service lifecycle.</p>
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

        {/* Service Type Overview + Activity */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard title="Service Overview" subtitle="Latest requests by priority" loading={loading}>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No service requests found.</div>
                ) : (
                  requests.slice(0, 6).map((request) => (
                    <div key={request.id} className="rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{request.title}</p>
                          <p className="text-xs text-muted-foreground">{request.serviceType}</p>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded whitespace-nowrap">{request.priority}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{request.assignedTo?.name || "Unassigned"}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5">{request.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ChartCard>
          </div>

          {/* Activity Feed */}
          <div>
            <ChartCard title="Recent Activity" subtitle="Staff updates" loading={loading}>
              <ActivityTimeline activities={activities} loading={loading} />
            </ChartCard>
          </div>
        </section>

        {/* Request Management Table */}
        <section>
          <ChartCard title="Manage Requests" subtitle={`Showing ${requests.length} requests`} loading={loading}>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No service requests found.</div>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-border p-4 shadow-sm transition-colors hover:border-foreground">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{request.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{request.description}</p>
                        {extractLatestNote(request.activityLogs || []) ? (
                          <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Latest staff note:</span> {extractLatestNote(request.activityLogs || [])}
                          </div>
                        ) : null}
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground whitespace-nowrap">{request.status}</span>
                    </div>

                    <div className="grid gap-2 lg:grid-cols-[1.1fr_0.9fr_auto] lg:items-end">
                      <select
                        value={selectedAssignee[request.id] || request.assignedToId || ""}
                        onChange={(event) => setSelectedAssignee((current) => ({ ...current, [request.id]: event.target.value }))}
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs outline-none transition-colors focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Assign staff...</option>
                        {staff.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedStatus[request.id] || request.statusRaw || request.status}
                        onChange={(event) => setSelectedStatus((current) => ({ ...current, [request.id]: event.target.value }))}
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs outline-none transition-colors focus:ring-2 focus:ring-primary"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          updateStatus(request.id);
                          updateAssignment(request.id);
                        }}
                        disabled={savingRequestId === request.id}
                        className="rounded-2xl bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingRequestId === request.id ? "Updating..." : "Update"}
                      </button>
                      <button
                        onClick={() => setReportTarget(request)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                      >
                        Report Student
                      </button>
                    </div>

                    <div className="mt-3">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Final note for manager</label>
                      <textarea
                        value={statusNotes[request.id] || ""}
                        onChange={(event) => setStatusNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                        placeholder="Add manager note or rejection reason..."
                        rows={2}
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary"
                      />
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
          serviceRequestId={reportTarget?.id}
          contextLabel="service request"
        />

        <Dialog open={confirmation.open} onOpenChange={(open) => setConfirmation((c) => ({ ...c, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Confirmed</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">{confirmation.message}</p>
            </div>
            <DialogFooter>
              <button onClick={() => setConfirmation({ open: false, message: "" })} className="px-4 py-2 rounded bg-primary text-primary-foreground">
                OK
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

