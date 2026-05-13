import { useEffect, useState } from "react";
import { RefreshCcw, Send, AlertCircle, Clock, CheckCircle, Radio } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { listComplaints, updateComplaintStatus } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api/httpClient";
import { StatsRow } from "@/components/ui";

const WORK_UPDATE_TYPES = [
  {
    id: "started",
    title: "Started work",
    description: "Notify the student that the request is now being handled.",
  },
  {
    id: "ready_for_review",
    title: "Finished, ready for manager review",
    description: "Tell the manager the work is done and waiting for final approval.",
  },
  {
    id: "needs_support",
    title: "Unable to complete / needs support",
    description: "Explain what is missing so the manager can decide the next step.",
  },
];

export default function InvestigatorConsole() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedUpdateType, setSelectedUpdateType] = useState({});
  const [notes, setNotes] = useState({});
  const [materials, setMaterials] = useState({});
  const [submitting, setSubmitting] = useState({});

  async function loadData() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await listComplaints(token, { limit: 50 });
      setComplaints((response.items || []).filter((item) => item.assignedTo?.id === user?.id || item.assignedToId === user?.id));
      
      // Load unread notification count
      try {
        const notifResponse = await apiRequest("/notifications/unread-count");
        setUnreadNotifications(Number(notifResponse?.count || 0));
      } catch {
        setUnreadNotifications(0);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load investigations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const intervalId = window.setInterval(loadData, 30000);
    window.addEventListener("sscms-notifications-updated", loadData);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("sscms-notifications-updated", loadData);
    };
  }, [token]);

  const updateStatus = async (complaintId) => {
    if (!token) return;
    
    setSubmitting((prev) => ({ ...prev, [complaintId]: true }));
    try {
      const complaintNote = notes[complaintId] || "";
      
      // Update complaint status to IN_PROGRESS
      await updateComplaintStatus(token, complaintId, { 
        status: "IN_PROGRESS",
        note: complaintNote,
      });
      
      // Log the investigation update
      try {
        const updateType = selectedUpdateType[complaintId] || "started";
        await apiRequest("/activity-logs", {
          method: "POST",
          body: JSON.stringify({
            complaintId,
            action: "INVESTIGATION_UPDATE",
            description: `Investigation update: ${updateType}. ${complaintNote}`,
          }),
        });
      } catch {
        // Log creation is optional, continue
      }

      setNotes((prev) => ({ ...prev, [complaintId]: "" }));
      setMaterials((prev) => ({ ...prev, [complaintId]: "" }));
      setSelectedUpdateType((prev) => ({ ...prev, [complaintId]: "started" }));
      setExpandedId(null);
      
      await loadData();
    } finally {
      setSubmitting((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const sendMaterialRequest = async (complaintId) => {
    const material = materials[complaintId] || "";
    if (!material.trim()) return;

    // This would send a material request notification to the manager
    // For now, just add to notes and submit
    const currentNote = notes[complaintId] || "";
    setNotes((prev) => ({ 
      ...prev, 
      [complaintId]: currentNote + (currentNote ? "\n" : "") + `[Material Request]: ${material}` 
    }));
    setMaterials((prev) => ({ ...prev, [complaintId]: "" }));
  };

  return (
    <DashboardLayout role="investigator" user={user || {}}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Complaint workflow</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Investigator Console</h1>
            <p className="mt-2 text-sm text-muted-foreground">Handle assigned complaints and move cases through the investigation lifecycle.</p>
          </div>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        {/* KPI Cards */}
        <section>
          <StatsRow items={[
            {
              icon: AlertCircle,
              label: "Assigned Complaints",
              value: loading ? "..." : complaints.length,
              color: "bg-blue-50",
              iconColor: "text-blue-600",
              trend: complaints.length,
              trendLabel: complaints.length === 1 ? "case" : "cases",
            },
            {
              icon: Clock,
              label: "Under Review",
              value: loading ? "..." : complaints.filter(c => c.status === "UNDER_REVIEW").length,
              color: "bg-orange-50",
              iconColor: "text-orange-600",
              trend: 0,
              trendLabel: "in progress",
            },
            {
              icon: CheckCircle,
              label: "Resolved",
              value: loading ? "..." : complaints.filter(c => c.status === "RESOLVED").length,
              color: "bg-green-50",
              iconColor: "text-green-600",
              trend: 0,
              trendLabel: "completed",
            },
            {
              icon: Send,
              label: "New Notifications",
              value: unreadNotifications,
              color: "bg-purple-50",
              iconColor: "text-purple-600",
              trend: unreadNotifications,
              trendLabel: unreadNotifications === 1 ? "alert" : "alerts",
            },
          ]} />
        </section>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading investigations...</div>
          ) : complaints.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">No assigned complaints.</div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.id}>
                {/* Collapsed view */}
                {expandedId !== complaint.id && (
                  <div 
                    onClick={() => setExpandedId(complaint.id)}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{complaint.priority}</p>
                        <h2 className="mt-1 text-lg font-bold text-foreground">{complaint.title}</h2>
                        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{complaint.description}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground whitespace-nowrap">{complaint.status}</span>
                    </div>
                  </div>
                )}

                {/* Expanded detail view */}
                {expandedId === complaint.id && (
                  <div className="rounded-3xl border border-border bg-card p-8 shadow-md">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{complaint.priority}</p>
                        <h2 className="mt-2 text-2xl font-bold text-foreground">{complaint.title}</h2>
                        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{complaint.description}</p>
                      </div>
                      <span className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground whitespace-nowrap">{complaint.status}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                      {/* Left column - Work update type */}
                      <div className="col-span-2">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground mb-4">Work Update Type</h3>
                        <div className="space-y-3">
                          {WORK_UPDATE_TYPES.map((type) => (
                            <label
                              key={type.id}
                              className={`flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                                selectedUpdateType[complaint.id] === type.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-border/80"
                              }`}
                            >
                              <div className="mt-1">
                                <input
                                  type="radio"
                                  name={`update-${complaint.id}`}
                                  value={type.id}
                                  checked={selectedUpdateType[complaint.id] === type.id}
                                  onChange={(e) =>
                                    setSelectedUpdateType((prev) => ({
                                      ...prev,
                                      [complaint.id]: e.target.value,
                                    }))
                                  }
                                  className="h-4 w-4 accent-primary"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-foreground">{type.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{type.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>

                        {/* Request materials */}
                        <div className="mt-6">
                          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground mb-3">Request Materials</h3>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. ladder, replacement bulbs"
                              value={materials[complaint.id] || ""}
                              onChange={(e) => setMaterials((prev) => ({ ...prev, [complaint.id]: e.target.value }))}
                              className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none placeholder-muted-foreground focus:border-primary"
                            />
                            <button
                              onClick={() => sendMaterialRequest(complaint.id)}
                              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                            >
                              Send request
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right column - Manager note */}
                      <div className="col-span-1">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground mb-3">Investigation Note</h3>
                        <textarea
                          placeholder="Describe progress, what is finished, or what you still need"
                          value={notes[complaint.id] || ""}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [complaint.id]: e.target.value }))}
                          className="w-full h-48 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none placeholder-muted-foreground focus:border-primary resize-none"
                        />
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="mt-6 flex gap-3 justify-end">
                      <button
                        onClick={() => setExpandedId(null)}
                        className="rounded-2xl border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => updateStatus(complaint.id)}
                        disabled={submitting[complaint.id]}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting[complaint.id] ? "Saving..." : <><Send className="h-4 w-4" /> Update Status</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
