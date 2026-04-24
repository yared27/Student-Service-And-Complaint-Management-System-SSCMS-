import { useEffect, useState } from "react";
import { ArrowRight, RefreshCcw, Send } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { assignServiceRequest, listServiceRequests, listUsers, updateServiceRequestStatus } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const statusOptions = ["SUBMITTED", "IN_PROGRESS", "COMPLETED", "REJECTED"];

export default function ServiceManagerDashboard() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});

  const topLinks = [
    { to: "/service-manager", label: "Dashboard" },
    { to: "/service-manager", label: "Requests" },
  ];

  async function loadData() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [requestResponse, staffResponse] = await Promise.all([
        listServiceRequests(token, { limit: 25 }),
        listUsers(token, { role: "STAFF", limit: 100 }),
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

    await assignServiceRequest(token, requestId, { assignedToId });
    await loadData();
  };

  const updateStatus = async (requestId) => {
    const status = selectedStatus[requestId];
    if (!token || !status) {
      return;
    }

    await updateServiceRequestStatus(token, requestId, { status });
    await loadData();
  };

  return (
    <DashboardLayout role="service-manager" topLinks={topLinks} user={user || {}}>
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

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
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

                  <div className="flex gap-2">
                    <select
                      value={selectedStatus[request.id] || request.status}
                      onChange={(event) => setSelectedStatus((current) => ({ ...current, [request.id]: event.target.value }))}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => updateStatus(request.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
                      Update <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  Created by {request.createdBy?.name || request.createdById} / Assigned to {request.assignedTo?.name || "Unassigned"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
