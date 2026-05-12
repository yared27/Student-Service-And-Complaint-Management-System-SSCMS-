import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";

const COLORS = {
  DORMITORY: "#3b82f6",
  CAFETERIA: "#8b5cf6",
  ICT: "#ec4899",
  LIBRARY: "#f59e0b",
  CLASSROOM: "#10b981",
  LABORATORY: "#06b6d4",
  UTILITIES: "#f97316",
  TRANSPORT: "#6366f1",
  CLINIC: "#14b8a6",
  OTHER: "#64748b",
};

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

export function ServiceDistributionChart({ data, loading, error }) {
  const chartData = data && Array.isArray(data) ? data.map((item) => ({
    name: (item.serviceType || item.label || "Unknown")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value: item._count?._all || item.count || 0,
    key: item.serviceType || item.label,
  })) : [];

  return (
    <ChartCard
      title="Service Request Distribution"
      subtitle="Breakdown by service type"
      loading={loading}
      error={error}
      empty={chartData.length === 0}
    >
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              innerRadius={52}
              outerRadius={92}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.key] || COLORS.OTHER} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} requests`} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function ComplaintDistributionChart({ data, loading, error }) {
  const chartData = data && Array.isArray(data) ? data.map((item) => ({
    name: (item.complaintType || item.label || "Unknown")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value: item._count?._all || item.count || 0,
    key: item.complaintType || item.label,
  })) : [];

  return (
    <ChartCard
      title="Complaint Type Distribution"
      subtitle="Breakdown by complaint type"
      loading={loading}
      error={error}
      empty={chartData.length === 0}
    >
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              innerRadius={52}
              outerRadius={92}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.key] || COLORS.OTHER} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} complaints`} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export const CHART_COLORS = COLORS;
export const STATUS_CHART_COLORS = STATUS_COLORS;
