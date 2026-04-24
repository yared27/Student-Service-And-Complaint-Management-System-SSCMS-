import { useEffect, useState } from "react";
import { ArrowRight, RefreshCcw, Send } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { assignComplaint, listComplaints, listUsers, updateComplaintStatus } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const statusOptions = ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export default function ComplaintManagerDashboard() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});

  const topLinks = [
    { to: "/complaint-manager", label: "Dashboard" },
    { to: "/complaint-manager", label: "Complaints" },
  ];

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

      setComplaints(complaintResponse.items || []);
      setReviewers(reviewerResponse.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  const updateAssignment = async (complaintId) => {
    const assignedToId = selectedAssignee[complaintId];
    if (!token || !assignedToId) {
      return;
    }

    await assignComplaint(token, complaintId, { assignedToId });
    await loadData();
  };

  const updateStatus = async (complaintId) => {
    const status = selectedStatus[complaintId];
    if (!token || !status) {
      return;
    }

    await updateComplaintStatus(token, complaintId, { status });
    await loadData();
  };

  return (
    <DashboardLayout role="complaint-manager" topLinks={topLinks} user={user || {}}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Complaint workflow</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Complaint Manager Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">Review complaints, assign investigators, and drive the complaint lifecycle.</p>
          </div>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Complaints</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : complaints.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Investigators</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : reviewers.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Open</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : complaints.filter((item) => !["RESOLVED", "REJECTED"].includes(item.status)).length}</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">No complaints found.</div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{complaint.priority}</p>
                    <h2 className="mt-1 text-lg font-bold text-foreground">{complaint.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{complaint.description}</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{complaint.status}</span>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Assign to investigator</label>
                    <select
                      value={selectedAssignee[complaint.id] || complaint.assignedToId || ""}
                      onChange={(event) => setSelectedAssignee((current) => ({ ...current, [complaint.id]: event.target.value }))}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    >
                      <option value="">Select investigator</option>
                      {reviewers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button onClick={() => updateAssignment(complaint.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent">
                    Assign <Send className="h-4 w-4" />
                  </button>

                  <div className="flex gap-2">
                    <select
                      value={selectedStatus[complaint.id] || complaint.status}
                      onChange={(event) => setSelectedStatus((current) => ({ ...current, [complaint.id]: event.target.value }))}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => updateStatus(complaint.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
                      Update <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  Created by {complaint.createdBy?.name || complaint.createdById} / Assigned to {complaint.assignedTo?.name || "Unassigned"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
