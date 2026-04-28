import { useEffect, useState } from "react";
import { RefreshCcw, Send } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { listServiceRequests, updateServiceRequestStatus } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const statusOptions = ["IN_PROGRESS", "COMPLETED"];

export default function FieldStaffTaskQueue() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState({});
  const [materialRequest, setMaterialRequest] = useState({});

  const topLinks = [
    { to: "/field-staff/tasks", label: "Tasks", end: true },
  ];

  async function loadData() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await listServiceRequests(token, { limit: 50 });
      setRequests((response.items || []).filter((item) => item.assignedTo?.id === user?.id || item.assignedToId === user?.id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  const updateStatus = async (requestId) => {
    const status = selectedStatus[requestId];
    if (!token || !status) {
      return;
    }

    await updateServiceRequestStatus(token, requestId, { status });
    window.dispatchEvent(new Event("sscms-notifications-updated"));
    toast.success("Update saved successfully.");
    await loadData();
  };

  const requestMaterials = (requestId) => {
    const note = String(materialRequest[requestId] || "").trim();
    if (!note) {
      toast.error("Enter materials needed before sending request.");
      return;
    }

    toast.success("Materials request sent to service manager.");
    window.dispatchEvent(new Event("sscms-notifications-updated"));
    setMaterialRequest((current) => ({ ...current, [requestId]: "" }));
  };

  return (
    <DashboardLayout role="field_staff" topLinks={topLinks} user={user || {}}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Field workflow</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Field Staff Task Queue</h1>
            <p className="mt-2 text-sm text-muted-foreground">Move assigned service requests through IN_PROGRESS and COMPLETED states.</p>
          </div>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading tasks...</div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">No assigned tasks.</div>
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

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Progress state</label>
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
                  </div>
                  <button onClick={() => updateStatus(request.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
                    Save update <Send className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Request materials</label>
                    <input
                      value={materialRequest[request.id] || ""}
                      onChange={(event) => setMaterialRequest((current) => ({ ...current, [request.id]: event.target.value }))}
                      placeholder="e.g. ladder, replacement bulbs"
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    />
                  </div>
                  <button
                    onClick={() => requestMaterials(request.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent"
                  >
                    Send request
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
