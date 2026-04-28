import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare, RefreshCcw, Send } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest, updateComplaintStatus, updateGrievanceStatus } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const statusOptions = ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];
const grievancePhases = ["PHASE_1", "PHASE_2", "PHASE_3"];

function getNextPhase(currentPhase) {
  if (currentPhase === "PHASE_1") return "PHASE_2";
  if (currentPhase === "PHASE_2") return "PHASE_3";
  return null;
}

function PhaseStepper({ currentPhase }) {
  const activeIndex = Math.max(grievancePhases.indexOf(currentPhase), 0);

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Grievance phase</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {grievancePhases.map((phase, index) => {
          const isComplete = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <div
              key={phase}
              className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : isComplete
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-border bg-card text-muted-foreground"
              }`}
            >
              {phase.replace("_", " ")}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ComplaintManagerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("UNDER_REVIEW");
  const [responseText, setResponseText] = useState("");
  const [saving, setSaving] = useState(false);
  const [phaseSaving, setPhaseSaving] = useState(false);

  const topLinks = [
    { to: "/complaint-manager/complaints", label: "Complaints" },
    { to: `/complaint-manager/complaints/${id}`, label: "Detail", end: true },
  ];

  async function loadComplaint() {
    if (!id || !token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiRequest(`/complaints/${id}`);
      const item = response?.complaint || response?.item || response || null;
      setComplaint(item);
      setStatus(String(item?.status || "UNDER_REVIEW"));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load complaint detail.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaint();
  }, [id, token]);

  const saveStatus = async () => {
    if (!id || !token || !status) {
      return;
    }

    setSaving(true);
    try {
      await updateComplaintStatus(token, id, { status, response: responseText });
      toast.success("Complaint updated.");
      await loadComplaint();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Failed to update complaint.");
    } finally {
      setSaving(false);
    }
  };

  const markResolved = async () => {
    setStatus("RESOLVED");
    setSaving(true);
    try {
      await updateComplaintStatus(token, id, { status: "RESOLVED", response: responseText });
      toast.success("Complaint marked as resolved.");
      await loadComplaint();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Failed to resolve complaint.");
    } finally {
      setSaving(false);
    }
  };

  const moveToNextPhase = async () => {
    if (!id || !token || !complaint) {
      return;
    }

    const currentPhaseValue = String(complaint.grievanceStatus || "PHASE_1").toUpperCase();
    const nextPhaseValue = getNextPhase(currentPhaseValue);
    if (!nextPhaseValue) {
      return;
    }

    setPhaseSaving(true);
    try {
      const result = await updateGrievanceStatus(token, id, { status: nextPhaseValue });
      if (result?.complaint) {
        setComplaint(result.complaint);
      }
      toast.success(`Moved grievance to ${nextPhaseValue.replace("_", " ")}.`);
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Failed to update grievance phase.");
    } finally {
      setPhaseSaving(false);
    }
  };

  const currentPhase = String(complaint?.grievanceStatus || "PHASE_1").toUpperCase();
  const nextPhase = getNextPhase(currentPhase);

  return (
    <DashboardLayout role="complaint_manager" topLinks={topLinks} user={user || {}}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate("/complaint-manager/complaints")}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Back to complaints
          </button>
          <button onClick={loadComplaint} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {loading ? <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading complaint...</div> : null}
        {error ? <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

        {!loading && complaint ? (
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{complaint.complaintType || "GENERAL"}</p>
                <h1 className="mt-1 text-2xl font-bold text-foreground">{complaint.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">Complaint ID: {complaint.id}</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{complaint.status}</span>
            </div>

            <PhaseStepper currentPhase={currentPhase} />

            <div className="flex flex-wrap gap-3">
              <button
                onClick={moveToNextPhase}
                disabled={phaseSaving || !nextPhase}
                className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold hover:bg-accent disabled:opacity-60"
              >
                {nextPhase ? `Move to ${nextPhase.replace("_", " ")}` : "Final phase reached"}
              </button>
            </div>

            <p className="text-sm text-muted-foreground">{complaint.description}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Update status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Respond to complaint</label>
                <textarea
                  value={responseText}
                  onChange={(event) => setResponseText(event.target.value)}
                  placeholder="Write response to student"
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveStatus}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> Save update
              </button>
              <button
                onClick={markResolved}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold hover:bg-accent disabled:opacity-60"
              >
                <MessageSquare className="h-4 w-4" /> Mark as resolved
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
