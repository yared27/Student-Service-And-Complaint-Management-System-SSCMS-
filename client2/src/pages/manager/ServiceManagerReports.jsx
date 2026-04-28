import { useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCcw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { listServiceRequests } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const statusOrder = ["SUBMITTED", "IN_PROGRESS", "COMPLETED", "REJECTED"];

export default function ServiceManagerReports() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const topLinks = [
    { to: "/service-manager/requests", label: "Requests" },
    { to: "/service-manager/reports", label: "Reports", end: true },
  ];

  async function loadData() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await listServiceRequests(token, { limit: 200 });
      setRequests(response.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  const byServiceType = useMemo(() => {
    const rows = {};

    requests.forEach((item) => {
      const serviceType = String(item.serviceType || "UNSPECIFIED");
      const status = String(item.status || "SUBMITTED");

      if (!rows[serviceType]) {
        rows[serviceType] = { serviceType, total: 0, SUBMITTED: 0, IN_PROGRESS: 0, COMPLETED: 0, REJECTED: 0 };
      }

      rows[serviceType].total += 1;
      if (Object.prototype.hasOwnProperty.call(rows[serviceType], status)) {
        rows[serviceType][status] += 1;
      }
    });

    return Object.values(rows).sort((a, b) => b.total - a.total);
  }, [requests]);

  return (
    <DashboardLayout role="service_manager" topLinks={topLinks} user={user || {}}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Service reports</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Service Request Reports</h1>
            <p className="mt-2 text-sm text-muted-foreground">Aggregate pending, in-progress, closed, and rejected requests by service type.</p>
          </div>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error ? <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-xl font-bold">Breakdown By Service Type</h2>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading reports...</div>
          ) : byServiceType.length === 0 ? (
            <div className="text-sm text-muted-foreground">No service requests found.</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    <th className="px-4 py-3 text-left">Service Type</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    {statusOrder.map((status) => (
                      <th key={status} className="px-4 py-3 text-left">
                        {status}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byServiceType.map((row) => (
                    <tr key={row.serviceType} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{row.serviceType}</td>
                      <td className="px-4 py-3">{row.total}</td>
                      {statusOrder.map((status) => (
                        <td key={status} className="px-4 py-3">
                          {row[status]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
