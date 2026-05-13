import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ChartCard } from "./ChartCard";

const STATUS_COLORS = {
  PENDING: "#fbbf24",
  SUBMITTED: "#fbbf24",
  ASSIGNED: "#60a5fa",
  IN_PROGRESS: "#3b82f6",
  UNDER_REVIEW: "#60a5fa",
  RESOLVED: "#10b981",
  COMPLETED: "#10b981",
  REJECTED: "#ef4444",
  CLOSED: "#6b7280",
};

function normalizeStatusCount(entries = [], keyName = "status") {
  return Array.isArray(entries)
    ? entries.map((item) => ({
        name: String(item?.[keyName] || item?.label || item?.name || "Unknown").toUpperCase(),
        value: item?._count?._all ?? item?.count ?? 0,
      }))
    : [];
}

export function StatusOverviewChart({ serviceStatus = [], complaintStatus = [], loading, error, services = [], complaints = [] }) {
  const serviceData = normalizeStatusCount(serviceStatus.length > 0 ? serviceStatus : services);
  const complaintData = normalizeStatusCount(complaintStatus.length > 0 ? complaintStatus : complaints);

  const statusOrder = ["SUBMITTED", "PENDING", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "COMPLETED", "REJECTED", "CLOSED"];

  const data = statusOrder
    .map((status) => {
      const serviceEntry = serviceData.find((item) => item.name === status);
      const complaintEntry = complaintData.find((item) => item.name === status);

      return {
        name: status.replaceAll("_", " "),
        services: serviceEntry?.value || 0,
        complaints: complaintEntry?.value || 0,
      };
    })
    .filter((item) => item.services > 0 || item.complaints > 0);

  return (
    <ChartCard
      title="Status Overview"
      subtitle="Requests and complaints by status"
      loading={loading}
      error={error}
      empty={data.length === 0}
    >
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: "12px" }} angle={-20} textAnchor="end" height={48} />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.08)" }}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Bar dataKey="services" fill="#3b82f6" name="Requests" radius={[6, 6, 0, 0]} />
            <Bar dataKey="complaints" fill="#8b5cf6" name="Complaints" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function RequestPriorityChart({ data = [], loading, error }) {
  const source = Array.isArray(data) ? data : [];
  const hasGroupedCounts = source.some((item) => typeof item?.count === "number" || typeof item?._count?._all === "number");
  const grouped = hasGroupedCounts
    ? source
    : ["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => ({
        priority,
        count: source.filter((item) => item.priority === priority).length,
      }));

  const chartData = [
    { name: "Low", count: grouped.find((item) => item.priority === "LOW")?.count || grouped.find((item) => item.priority === "LOW")?._count?._all || 0, fill: "#10b981" },
    { name: "Medium", count: grouped.find((item) => item.priority === "MEDIUM")?.count || grouped.find((item) => item.priority === "MEDIUM")?._count?._all || 0, fill: "#3b82f6" },
    { name: "High", count: grouped.find((item) => item.priority === "HIGH")?.count || grouped.find((item) => item.priority === "HIGH")?._count?._all || 0, fill: "#f59e0b" },
    { name: "Urgent", count: grouped.find((item) => item.priority === "URGENT")?.count || grouped.find((item) => item.priority === "URGENT")?._count?._all || 0, fill: "#ef4444" },
  ];

  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <ChartCard
      title="Priority Distribution"
      subtitle={`Total: ${total} requests`}
      loading={loading}
      error={error}
      empty={total === 0}
    >
      {total > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis type="number" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
