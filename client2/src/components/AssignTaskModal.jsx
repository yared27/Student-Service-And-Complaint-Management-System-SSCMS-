import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AssignTaskModal({ reqId, open, onOpenChange, onAssigned }) {
  const { user, token } = useAuth();
  const dept = user?.dept || user?.department || "";

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [staff, setStaff] = useState([]);
  const [query, setQuery] = useState("");
  const [staffId, setStaffId] = useState("");
  const [priority, setPriority] = useState("med");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open || !dept) {
      return;
    }

    let active = true;

    async function loadStaff() {
      setLoading(true);
      try {
        const response = await fetch(`/api/staff/available?dept=${encodeURIComponent(dept)}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Unable to fetch staff list.");
        }

        const payload = await response.json();
        const items = payload?.data || payload?.items || payload || [];

        if (!active) {
          return;
        }

        setStaff(Array.isArray(items) ? items : []);
      } catch (error) {
        toast.error(error.message || "Unable to fetch staff list.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStaff();

    return () => {
      active = false;
    };
  }, [dept, open, token]);

  const filteredStaff = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return staff;
    }

    return staff.filter((member) => {
      const hay = `${member.name || ""} ${member.email || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, staff]);

  async function handleAssign(e) {
    e.preventDefault();

    if (!staffId) {
      toast.error("Please select a staff member.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/tasks/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reqId,
          staffId,
          priority,
          notes,
          dept,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign task.");
      }

      const selected = staff.find((member) => String(member.id) === String(staffId));
      toast.success(`Assigned to ${selected?.name || "staff"}`);
      onOpenChange?.(false);
      onAssigned?.();
      setNotes("");
      setQuery("");
      setStaffId("");
      setPriority("med");
    } catch (error) {
      toast.error(error.message || "Task assignment failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>Request ID: {reqId}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleAssign}>
          <div className="space-y-2">
            <Label htmlFor="staff-search">Search Staff</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="staff-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                placeholder="Search by name or email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff">Assign To</Label>
            <select
              id="staff"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={loading}
            >
              <option value="">Select available staff</option>
              {filteredStaff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email || member.id}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="high">High</option>
              <option value="med">Med</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Assignment notes for the staff member"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? "Assigning..." : "Assign Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
