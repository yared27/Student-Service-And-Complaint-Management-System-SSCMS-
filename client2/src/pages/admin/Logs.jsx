import { useEffect, useMemo, useState } from "react";
import { ListTree, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api/httpClient";

const ACTION_DISPLAY = {
  SERVICE_REQUEST_ASSIGNED: "assigned",
  TASK_UPDATED: "updated",
  REQUEST_CLOSED: "closed",
  COMPLAINT_ASSIGNED: "assigned",
  COMPLAINT_UPDATED: "updated",
  COMPLAINT_RESOLVED: "closed",
};

function fmtDate(input) {
  if (!input) {
    return "-";
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function mapAction(action) {
  return ACTION_DISPLAY[action] || String(action || "").toLowerCase();
}

export default function AdminLogsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const topLinks = [
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/analytics/logs", label: "Logs", end: true },
  ];

  async function loadLogs() {
    setLoading(true);
    try {
      const payload = await apiRequest("/activity-logs?limit=100");
      const items = payload?.data || payload?.items || payload || [];
      setLogs(Array.isArray(items) ? items : []);
    } catch (error) {
      toast.error(error.message || "Unable to load logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((entry) => {
      const role = String(entry?.user?.role || entry?.actor?.role || "").toUpperCase();
      const createdAt = new Date(entry?.createdAt || entry?.time || "");

      if (roleFilter !== "ALL" && role !== roleFilter) {
        return false;
      }

      if (fromDate) {
        const from = new Date(`${fromDate}T00:00:00`);
        if (!Number.isNaN(createdAt.getTime()) && createdAt < from) {
          return false;
        }
      }

      if (toDate) {
        const to = new Date(`${toDate}T23:59:59`);
        if (!Number.isNaN(createdAt.getTime()) && createdAt > to) {
          return false;
        }
      }

      return true;
    });
  }, [logs, roleFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, fromDate, toDate, viewMode]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout role="admin" topLinks={topLinks} user={user || {}}>
      <div className="max-w-6xl mx-auto space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-accent px-6 py-5 text-primary-foreground shadow-elegant">
        <p className="text-xs uppercase tracking-[0.2em] opacity-85">Admin</p>
        <h1 className="mt-2 text-xl sm:text-2xl md:text-3xl font-display font-bold">Activity Logs</h1>
      </header>

      <section className="rounded-2xl border bg-card shadow-card p-4 space-y-4">
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SERVICE_MANAGER">SERVICE_MANAGER</option>
            <option value="FIELD_STAFF">FIELD_STAFF</option>
            <option value="COMPLAINT_MANAGER">COMPLAINT_MANAGER</option>
            <option value="STUDENT">STUDENT</option>
          </select>

          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />

          <div className="flex justify-end gap-2">
            <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
            <Button variant={viewMode === "timeline" ? "default" : "outline"} size="sm" onClick={() => setViewMode("timeline")}>
              <ListTree className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={loadLogs} variant="outline">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground py-6">Loading logs...</div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Details</th>
                  <th className="text-left px-4 py-3">Dept</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((entry) => (
                    <tr key={entry.id} className="border-t hover:bg-secondary/30">
                      <td className="px-4 py-3">{fmtDate(entry.createdAt || entry.time)}</td>
                      <td className="px-4 py-3">{entry?.user?.name || entry?.actor?.name || "System"}</td>
                      <td className="px-4 py-3">{mapAction(entry.action)}</td>
                      <td className="px-4 py-3">{entry.description || entry.details || "-"}</td>
                      <td className="px-4 py-3">{entry?.user?.department || entry?.actor?.department || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {filteredLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No logs found.</p>
              ) : (
                  paginatedLogs.map((entry) => (
                  <div key={entry.id} className="relative rounded-xl border bg-card p-4 shadow-card">
                    <span className="absolute -left-[22px] top-5 h-3 w-3 rounded-full bg-accent" />
                    <p className="text-xs text-muted-foreground">{fmtDate(entry.createdAt || entry.time)}</p>
                    <p className="mt-1 font-medium">{entry?.user?.name || entry?.actor?.name || "System"}</p>
                    <p className="text-sm mt-1">
                      <span className="font-semibold">{mapAction(entry.action)}</span>
                      {" "}
                      {entry.description || entry.details || ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{entry?.user?.department || entry?.actor?.department || "-"}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {filteredLogs.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} logs
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </section>
      </div>
    </DashboardLayout>
  );
}
