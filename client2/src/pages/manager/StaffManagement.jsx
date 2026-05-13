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

export default function StaffManagement() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", department: "", campus: "" });

  async function loadStaff() {
    setLoading(true);
    try {
      const response = await listUsers(null, { role: "STAFF", limit: 100 });
      setStaff(response.items || []);
    } catch (error) {
      toast.error(error?.message || "Unable to load field staff.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  const totalPages = Math.max(1, Math.ceil(staff.length / pageSize));

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return staff.slice(start, start + pageSize);
  }, [staff, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function createStaff(event) {
    event.preventDefault();
    try {
      await createUser(null, { ...form, role: "STAFF" });
      toast.success("Field staff account created.");
      setDialogOpen(false);
      setForm({ name: "", email: "", department: "", campus: "" });
      await loadStaff();
      setCurrentPage(1);
    } catch (error) {
      toast.error(error?.message || "Failed to create staff.");
    }
  }

  async function deactivateStaff(staffUser) {
    try {
      await updateUser(null, staffUser.id, { status: "BANNED", isActive: false });
      toast.success("Field staff deactivated.");
      await loadStaff();
    } catch (error) {
      toast.error(error?.message || "Failed to update staff.");
    }
  }

  function openEditDialog(staffUser) {
    setEditingUser(staffUser);
    setForm({
      name: staffUser.name || "",
      email: staffUser.email || "",
      department: staffUser.department || "",
      campus: staffUser.campus || "",
    });
    setEditDialogOpen(true);
  }

  async function updateStaff(event) {
    event.preventDefault();
    try {
      await updateUser(null, editingUser.id, form);
      toast.success("Field staff updated.");
      setEditDialogOpen(false);
      setEditingUser(null);
      setForm({ name: "", email: "", department: "", campus: "" });
      await loadStaff();
    } catch (error) {
      toast.error(error?.message || "Failed to update staff.");
    }
  }

  return (
    <DashboardLayout role="service_manager" topLinks={[{ to: "/service-manager/requests", label: "Requests" }, { to: "/service-manager/reports", label: "Reports" }, { to: "/service-manager/staff-management", label: "Field Staff", end: true }]} user={user || {}}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Field staff operations</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Manage Field Staff</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create accounts and review staff assigned to your service area.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadStaff}>
              <RefreshCcw className="w-4 h-4" /> Refresh
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4" /> New Staff
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
          <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
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
                    Loading field staff...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-muted-foreground">
                    No field staff found for your service area.
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((item) => (
                  <tr key={item.id} className="border-t border-border/60 transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4 align-top font-medium text-foreground">{item.name || "-"}</td>
                    <td className="px-5 py-4 align-top text-muted-foreground">{item.email || "-"}</td>
                    <td className="px-5 py-4 align-top text-muted-foreground">{item.department || "-"}</td>
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
                        <Button variant="outline" size="sm" onClick={() => deactivateStaff(item)}>
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

          {staff.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, staff.length)} of {staff.length} field staff
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
            <DialogTitle>Add Field Staff</DialogTitle>
            <DialogDescription>Create a new field staff account for your service team.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={createStaff}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input required value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Campus</Label>
              <Input required value={form.campus} onChange={(e) => setForm((prev) => ({ ...prev, campus: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create staff</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Field Staff</DialogTitle>
            <DialogDescription>Update the field staff account details.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={updateStaff}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input required value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Campus</Label>
              <Input required value={form.campus} onChange={(e) => setForm((prev) => ({ ...prev, campus: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update staff</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
