import { useEffect, useState } from "react";
import { RefreshCcw, Send } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { listComplaints, updateComplaintStatus } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const statusOptions = ["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export default function InvestigatorConsole() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState({});

  const topLinks = [
    { to: "/investigator", label: "Dashboard" },
    { to: "/investigator", label: "Investigations" },
  ];

  async function loadData() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await listComplaints(token, { limit: 50 });
      setComplaints((response.items || []).filter((item) => item.assignedTo?.id === user?.id || item.assignedToId === user?.id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load investigations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  const updateStatus = async (complaintId) => {
    const status = selectedStatus[complaintId];
    if (!token || !status) {
      return;
    }

    await updateComplaintStatus(token, complaintId, { status });
    await loadData();
  };

  return (
    <DashboardLayout role="investigator" topLinks={topLinks} user={user || {}}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Complaint workflow</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Investigator Console</h1>
            <p className="mt-2 text-sm text-muted-foreground">Handle assigned complaints and move cases through the complaint lifecycle.</p>
          </div>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading investigations...</div>
          ) : complaints.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">No assigned complaints.</div>
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

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Investigation state</label>
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
                  </div>
                  <button onClick={() => updateStatus(complaint.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
                    Save update <Send className="h-4 w-4" />
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
