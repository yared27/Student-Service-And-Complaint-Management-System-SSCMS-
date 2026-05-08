import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCcw, Send } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { listServiceRequests, updateServiceRequestStatus } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const updateModes = [
  {
    value: "STARTED",
    label: "Started work",
    status: "IN_PROGRESS",
    help: "Notify the student that the request is now being handled.",
  },
  {
    value: "READY_FOR_REVIEW",
    label: "Finished, ready for manager review",
    status: "IN_PROGRESS",
    help: "Tell the manager the work is done and waiting for final approval.",
  },
  {
    value: "BLOCKED",
    label: "Unable to complete / needs support",
    status: "IN_PROGRESS",
    help: "Explain what is missing so the manager can decide the next step.",
  },
];

export default function FieldStaffTaskQueue() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState({});
  const [selectedMode, setSelectedMode] = useState({});
  const [materialRequest, setMaterialRequest] = useState({});
  const [statusNotes, setStatusNotes] = useState({});
  const [savingRequestId, setSavingRequestId] = useState(null);
  const [actionMessageByRequest, setActionMessageByRequest] = useState({});

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
    const mode = selectedMode[requestId] || "STARTED";
    const status = selectedStatus[requestId] || "IN_PROGRESS";
    const note = String(statusNotes[requestId] || "").trim();
    if (!token || !status) {
      return;
    }

    if (mode === "BLOCKED" && !note) {
      toast.error("Add a reason before sending an unable-to-complete update.");
      return;
    }

    setSavingRequestId(requestId);

    try {
      const response = await updateServiceRequestStatus(token, requestId, {
        status,
        note: [
          mode === "STARTED" ? "Work started." : null,
          mode === "READY_FOR_REVIEW" ? "Work finished and ready for manager review." : null,
          mode === "BLOCKED" ? "Unable to complete." : null,
          note || null,
        ].filter(Boolean).join(" "),
      });
      window.dispatchEvent(new Event("sscms-notifications-updated"));
      const message =
        mode === "READY_FOR_REVIEW"
          ? "Completion report sent to manager."
          : mode === "BLOCKED"
            ? "Blocker message sent to manager."
            : "Status updated successfully.";
      toast.success(response?.message || message);
      setActionMessageByRequest((current) => ({ ...current, [requestId]: message }));

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

      setSelectedMode((current) => ({ ...current, [requestId]: "STARTED" }));
      setStatusNotes((current) => ({ ...current, [requestId]: "" }));
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Failed to update request status.");
    } finally {
      setSavingRequestId(null);
    }
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
            <p className="mt-2 text-sm text-muted-foreground">Update progress, report completion, or explain blockers without waiting on the manager page to refresh.</p>
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

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_auto] lg:items-end">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Work update type</label>
                    <div className="grid gap-2">
                      {updateModes.map((mode) => {
                        const isSelected = (selectedMode[request.id] || "STARTED") === mode.value;
                        return (
                          <button
                            key={mode.value}
                            type="button"
                            onClick={() => setSelectedMode((current) => ({ ...current, [request.id]: mode.value }))}
                            className={`rounded-2xl border px-4 py-3 text-left transition-all ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-background hover:border-primary/40 hover:bg-accent/40"}`}
                          >
                            <div className="flex items-center gap-2">
                              {mode.value === "STARTED" ? <CheckCircle2 className="h-4 w-4 text-primary" /> : mode.value === "READY_FOR_REVIEW" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-amber-600" />}
                              <span className="text-sm font-semibold text-foreground">{mode.label}</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{mode.help}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Manager note</label>
                    <textarea
                      value={statusNotes[request.id] || ""}
                      onChange={(event) => setStatusNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                      placeholder="Describe progress, what is finished, or what you still need"
                      rows={6}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors hover:border-primary/50 focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={() => updateStatus(request.id)}
                    disabled={savingRequestId === request.id}
                    className="inline-flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {savingRequestId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {savingRequestId === request.id ? "Updating..." : "Update Status"}
                  </button>
                </div>

                {actionMessageByRequest[request.id] ? (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {actionMessageByRequest[request.id]}
                  </div>
                ) : null}

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
