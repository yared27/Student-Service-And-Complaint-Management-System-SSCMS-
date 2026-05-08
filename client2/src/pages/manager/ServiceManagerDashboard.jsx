import { useEffect, useState } from "react";
import { ArrowRight, Loader2, RefreshCcw, Send } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { assignServiceRequest, listServiceRequests, listUsers, updateServiceRequestStatus } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import ReportStudentDialog from "@/components/ReportStudentDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const statusOptions = ["SUBMITTED", "IN_PROGRESS", "COMPLETED", "REJECTED"];

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

  const topLinks = [
    { to: "/service-manager/requests", label: "Requests", end: true },
    { to: "/service-manager/reports", label: "Reports" },
  ];

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

      setRequests(requestResponse.items || []);
      setStaff(staffResponse.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load service requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

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

  return (
    <DashboardLayout role="service_manager" topLinks={topLinks} user={user || {}}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Service workflow</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Service Manager Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">Assign requests to field staff and move them through the backend lifecycle.</p>
          </div>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Requests</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : requests.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Staff available</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : staff.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Open</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : requests.filter((item) => !["COMPLETED", "REJECTED"].includes(item.status)).length}</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">No service requests found.</div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{request.priority}</p>
                    <h2 className="mt-1 text-lg font-bold text-foreground">{request.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{request.description}</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{request.status}</span>
                </div>

                {(() => {
                  const latestStaffNote = (request.activityLogs || []).find((log) => log.actor?.role === "STAFF" && log.description);
                  if (!latestStaffNote) {
                    return null;
                  }

                  const noteTone = /unable to complete|needs support|blocked/i.test(latestStaffNote.description)
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : /ready for manager review|finished/i.test(latestStaffNote.description)
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-700";

                  return (
                    <div className={`mt-4 rounded-2xl border px-4 py-3 ${noteTone}`}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em]">Latest staff message</p>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                          {latestStaffNote.actor?.name || latestStaffNote.actor?.username || "Staff"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed">{latestStaffNote.description}</p>
                    </div>
                  );
                })()}

                {(() => {
                  const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|pdf))/gi;
                  const matches = request.description.match(urlRegex) || [];
                  const uniqueUrls = [...new Set(matches)];
                  
                  if (uniqueUrls.length > 0) {
                    return (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Attachments</p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {uniqueUrls.map((url, index) => (
                            <a
                              key={`${url}-${index}`}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="group rounded-2xl border border-border bg-background overflow-hidden hover:border-foreground transition-colors"
                            >
                              <div className="aspect-video bg-muted overflow-hidden">
                                <img
                                  src={url}
                                  alt={`Attachment ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="p-2 text-center text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                View file
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_minmax(280px,0.9fr)_auto] lg:items-end">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Assign to field staff</label>
                    <select
                      value={selectedAssignee[request.id] || request.assignedToId || ""}
                      onChange={(event) => setSelectedAssignee((current) => ({ ...current, [request.id]: event.target.value }))}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    >
                      <option value="">Select staff member</option>
                      {staff.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button onClick={() => updateAssignment(request.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent">
                    Assign <Send className="h-4 w-4" />
                  </button>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Final status</label>
                    <select
                      value={selectedStatus[request.id] || request.statusRaw || request.status}
                      onChange={(event) => setSelectedStatus((current) => ({ ...current, [request.id]: event.target.value }))}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors hover:border-primary/50 focus:border-primary"
                    >
                      {statusOptions
                        .filter((s) => {
                          // Only allow finalization options for the assigned service manager or admin
                          const isAssignedManager = request.assignedServiceManager?.userId === user?.id || user?.role === "ADMIN";
                          if (["COMPLETED", "REJECTED"].includes(s) && !isAssignedManager) {
                            return false;
                          }
                          return true;
                        })
                        .map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Manager note / rejection reason
                    </label>
                    <textarea
                      value={statusNotes[request.id] || ""}
                      onChange={(event) => setStatusNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                      placeholder="Required when rejecting. Optional for completion confirmation."
                      rows={4}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors hover:border-primary/50 focus:border-primary"
                    />
                  </div>

                  <button
                    onClick={() => updateStatus(request.id)}
                    disabled={savingRequestId === request.id}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {savingRequestId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {savingRequestId === request.id ? "Updating..." : "Update Status"}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>
                    Created by {request.createdBy?.name || request.createdById} / Assigned to {request.assignedTo?.name || "Unassigned"}
                  </span>
                  <button
                    onClick={() => setReportTarget(request)}
                    className="inline-flex items-center rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
                  >
                    Report student
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

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
