import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createUser, listUsers, updateUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CAMPUS_OPTIONS = [
  "Main Campus",
  "Abaya Campus",
  "Nechi Sar Campus",
  "Kulfo Campus",
  "Chamo Campus",
  "Sawla Campus",
];

const DEPARTMENT_OPTIONS = [
  "ACADEMIC",
  "FOOD_SERVICE",
  "DISCIPLINE",
  "GENERAL_SERVICE",
  "WOMEN_CASE",
  "HEALTH_CASE",
  "DISABILITY_CASE",
  "SPORTS",
];

export default function InvestigatorsManagement() {
  const { user } = useAuth();
  const [investigators, setInvestigators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", department: "", campus: "" });

  async function loadInvestigators() {
    setLoading(true);
    try {
      const response = await listUsers(null, { role: "INVESTIGATOR", limit: 100 });
      setInvestigators(response.items || []);
    } catch (error) {
      toast.error(error?.message || "Unable to load investigators.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvestigators();
  }, []);

  const totalPages = Math.max(1, Math.ceil(investigators.length / pageSize));

  const paginatedInvestigators = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return investigators.slice(start, start + pageSize);
  }, [investigators, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function createInvestigator(event) {
    event.preventDefault();
    try {
      await createUser(null, { ...form, role: "INVESTIGATOR" });
      toast.success("Investigator account created.");
      setDialogOpen(false);
      setForm({ name: "", email: "", department: "", campus: "" });
      await loadInvestigators();
      setCurrentPage(1);
    } catch (error) {
      toast.error(error?.message || "Failed to create investigator.");
    }
  }

  async function deactivateInvestigator(item) {
    try {
      await updateUser(null, item.id, { status: "BANNED", isActive: false });
      toast.success("Investigator deactivated.");
      await loadInvestigators();
    } catch (error) {
      toast.error(error?.message || "Failed to update investigator.");
    }
  }

  function openEditDialog(investigator) {
    setEditingUser(investigator);
    setForm({
      name: investigator.name || "",
      email: investigator.email || "",
      department: investigator.department || "",
      campus: investigator.campus || "",
    });
    setEditDialogOpen(true);
  }

  async function updateInvestigator(event) {
    event.preventDefault();
    try {
      await updateUser(null, editingUser.id, form);
      toast.success("Investigator updated.");
      setEditDialogOpen(false);
      setEditingUser(null);
      setForm({ name: "", email: "", department: "", campus: "" });
      await loadInvestigators();
    } catch (error) {
      toast.error(error?.message || "Failed to update investigator.");
    }
  }

  return (
    <DashboardLayout role="complaint_manager" topLinks={[{ to: "/complaint-manager/complaints", label: "Complaints" }, { to: "/complaint-manager/investigators", label: "Investigators", end: true }]} user={user || {}}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Investigator operations</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Manage Investigators</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create and oversee investigators for your bureau.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadInvestigators}>
              <RefreshCcw className="w-4 h-4" /> Refresh
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4" /> New Investigator
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 text-left font-semibold">Name</th>
                <th className="px-5 py-4 text-left font-semibold">Email</th>
                <th className="px-5 py-4 text-left font-semibold">Department</th>
                <th className="px-5 py-4 text-left font-semibold">Campus</th>
                <th className="px-5 py-4 text-left font-semibold">Status</th>
                <th className="px-5 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-muted-foreground">
                    Loading investigators...
                  </td>
                </tr>
              ) : investigators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-muted-foreground">
                    No investigators found for your bureau.
                  </td>
                </tr>
              ) : (
                paginatedInvestigators.map((item) => (
                  <tr key={item.id} className="border-t border-border/60 transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4 align-top font-medium text-foreground">{item.name || "-"}</td>
                    <td className="px-5 py-4 align-top text-muted-foreground">{item.email || "-"}</td>
                    <td className="px-5 py-4 align-top">
                      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {item.department || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-muted-foreground">{item.campus || "-"}</td>
                    <td className="px-5 py-4 align-top">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.status === "BANNED" ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-700"}`}>
                        {item.status || (item.isActive === false ? "BANNED" : "ACTIVE")}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deactivateInvestigator(item)}>
                          Deactivate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {investigators.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, investigators.length)} of {investigators.length} investigators
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Investigator</DialogTitle>
            <DialogDescription>Create a new investigator account for your bureau.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={createInvestigator}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Username will be auto-generated from the name if left blank.
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input required type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select
                required
                value={form.department}
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select department</option>
                {DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Campus</Label>
              <select
                required
                value={form.campus}
                onChange={(e) => setForm((prev) => ({ ...prev, campus: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select campus</option>
                {CAMPUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create investigator</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Investigator</DialogTitle>
            <DialogDescription>Update the investigator account details.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={updateInvestigator}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Username is managed automatically and is not editable here.
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select
                required
                value={form.department}
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select department</option>
                {DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Campus</Label>
              <select
                required
                value={form.campus}
                onChange={(e) => setForm((prev) => ({ ...prev, campus: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select campus</option>
                {CAMPUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update investigator</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
