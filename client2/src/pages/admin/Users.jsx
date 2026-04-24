import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLE_OPTIONS = ["ADMIN", "SERVICE_MANAGER", "STAFF", "COMPLAINT_MANAGER", "INVESTIGATOR", "STUDENT"];
const DEPT_OPTIONS = ["ICT", "Student Services", "Student Union", "Student Affairs", "Electrical", "Maintenance"];

function normalizeStatus(raw) {
  const value = String(raw || "").toUpperCase();
  if (["SUSPENDED", "BANNED", "INACTIVE"].includes(value)) {
    return "BANNED";
  }
  return "ACTIVE";
}

function statusTone(status) {
  return status === "BANNED" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success";
}

export default function AdminUsersPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    department: "ICT",
    status: "ACTIVE",
  });

  async function loadUsers() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load users.");
      }

      const payload = await response.json();
      const items = payload?.data || payload?.items || payload || [];
      setUsers(Array.isArray(items) ? items : []);
    } catch (error) {
      toast.error(error.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const full = `${user.name || ""} ${user.email || ""} ${user.department || ""} ${user.role || ""}`.toLowerCase();
      const q = search.trim().toLowerCase();

      const matchesSearch = !q || full.includes(q);
      const matchesRole = roleFilter === "ALL" || String(user.role || "").toUpperCase() === roleFilter;
      const matchesStatus = statusFilter === "ALL" || normalizeStatus(user.status) === statusFilter;
      const matchesDept = deptFilter === "ALL" || String(user.department || "").toLowerCase() === deptFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [users, search, roleFilter, statusFilter, deptFilter]);

  function openCreate() {
    setForm({
      name: "",
      email: "",
      role: "STUDENT",
      department: "ICT",
      status: "ACTIVE",
    });
    setCreateOpen(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: String(user.role || "STUDENT").toUpperCase(),
      department: user.department || "ICT",
      status: normalizeStatus(user.status),
    });
    setEditOpen(true);
  }

  async function saveCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create user.");
      }

      toast.success("User created.");
      setCreateOpen(false);
      loadUsers();
    } catch (error) {
      toast.error(error.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editingUser?.id) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to update user.");
      }

      toast.success("User updated.");
      setEditOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivateUser(userId) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "SUSPENDED" }),
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate user.");
      }

      toast.success("User deactivated.");
      loadUsers();
    } catch (error) {
      toast.error(error.message || "Failed to deactivate user.");
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const response = await fetch("/api/admin/users/export", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export users.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "admin-users.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || "Failed to export users.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-accent px-6 py-5 text-primary-foreground shadow-elegant">
        <p className="text-xs uppercase tracking-[0.2em] opacity-85">Admin</p>
        <h1 className="mt-2 text-2xl md:text-3xl font-display font-bold">Users Management</h1>
      </header>

      <section className="rounded-2xl border bg-card shadow-card p-4 space-y-4">
        <div className="grid gap-3 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, email, role, department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">All Roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="ALL">All Departments</option>
            {DEPT_OPTIONS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={exporting}>
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Create User
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Dept</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const status = normalizeStatus(user.status);
                  return (
                    <tr key={user.id} className="border-t hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{user.name || "-"}</td>
                      <td className="px-4 py-3">{user.email || "-"}</td>
                      <td className="px-4 py-3">{String(user.role || "-")}</td>
                      <td className="px-4 py-3">{user.department || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusTone(status)}`}>{status.toLowerCase()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deactivateUser(user.id)}>
                            Deact
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new account.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={saveCreate}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}>
                  {DEPT_OPTIONS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update role, department, and status.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={saveEdit}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}>
                  {DEPT_OPTIONS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="ACTIVE">Active</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
