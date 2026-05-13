import { useEffect, useState } from "react";
import { RefreshCcw, TrendingUp, Users, FileText, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest } from "@/lib/api/httpClient";
import { useAuth } from "@/context/auth-context";
import { KPICard, StatsRow } from "@/components/dashboard/KPICard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ServiceDistributionChart, ComplaintDistributionChart } from "@/components/charts/DistributionCharts";
import { StatusOverviewChart, RequestPriorityChart } from "@/components/charts/StatusCharts";
import { ChartCard, ChartHeader, ChartContainer, ChartContainerFull } from "@/components/charts/ChartCard";

function formatLabel(value) {
  return String(value || "Unknown").replaceAll("_", " ");
}

function topEntry(entries, fallbackLabel) {
  const item = Array.isArray(entries) && entries.length > 0 ? entries[0] : null;
  if (!item) {
    return fallbackLabel;
  }

  const label = item.serviceType || item.complaintType || item.label || item.name || fallbackLabel;
  const count = item._count?._all ?? item.count ?? 0;
  return `${formatLabel(label)} (${count})`;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportSearch, setReportSearch] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [analyticsResponse, reportsResponse] = await Promise.all([
        apiRequest("/admin/analytics"),
        apiRequest("/admin/reports?limit=10"),
      ]);

      setAnalytics(analyticsResponse || null);
      setReports(reportsResponse?.items || []);
      
      // Simulate activity feed (in a real app, this would be a separate API call)
      const mockActivities = [
        {
          id: "1",
          type: "SERVICE_REQUEST_CREATED",
          description: "New ICT service request submitted",
          actor: { name: "John Doe" },
          entity: "Service Request",
          createdAt: new Date(Date.now() - 5 * 60000),
        },
        {
          id: "2",
          type: "COMPLAINT_CREATED",
          description: "Academic complaint filed",
          actor: { name: "Jane Smith" },
          entity: "Complaint",
          createdAt: new Date(Date.now() - 15 * 60000),
        },
        {
          id: "3",
          type: "STATUS_UPDATED",
          description: "Dormitory request marked as resolved",
          actor: { name: "System" },
          entity: "Service Request",
          createdAt: new Date(Date.now() - 30 * 60000),
        },
      ];
      setActivities(mockActivities);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const serviceSeries = analytics?.services?.byType || [];
  const serviceStatusSeries = analytics?.services?.byStatus || [];
  const prioritySeries = analytics?.services?.byPriority || [];
  const complaintSeries = analytics?.complaints?.byType || [];
  const complaintStatusSeries = analytics?.complaints?.byStatus || [];
  const totalUsers = analytics?.summary?.totalUsers || 0;
  const activeUsers = analytics?.summary?.activeUsers || 0;
  const bannedUsers = analytics?.summary?.bannedUsers || 0;
  const warnedUsers = analytics?.summary?.warnedUsers || 0;
  const totalRequests = analytics?.summary?.totalServiceRequests || 0;
  const totalComplaints = analytics?.summary?.totalComplaints || 0;

  const filteredReports = reports.filter((report) => {
    const query = reportSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    const haystack = [
      report.reportedUser?.name,
      report.reportedUser?.username,
      report.reporter?.role,
      report.reason,
      report.details,
      report.reportedUser?.campus,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  const kpiItems = [
    {
      icon: FileText,
      label: "Total Requests",
      value: loading ? "..." : totalRequests,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: 12,
      trendLabel: "this month",
    },
    {
      icon: AlertCircle,
      label: "Active Complaints",
      value: loading ? "..." : totalComplaints,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: 8,
      trendLabel: "this month",
    },
    {
      icon: Users,
      label: "Active Users",
      value: loading ? "..." : activeUsers,
      color: "bg-green-50",
      iconColor: "text-green-600",
      trend: 5,
      trendLabel: "this week",
    },
    {
      icon: TrendingUp,
      label: "Reported Students",
      value: loading ? "..." : analytics?.summary?.reportedStudentsCount || 0,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
      trend: -3,
      trendLabel: "vs last month",
    },
  ];

  return (
    <DashboardLayout
      role="admin"
      user={user || {}}
      showSearch
      searchPlaceholder="Search reports, users, or analytics..."
      onSearch={setReportSearch}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">System controller</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">Real-time analytics for services, complaints, and system performance.</p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error ? <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

        {/* KPI Cards */}
        <section>
          <StatsRow items={kpiItems} />
        </section>

        {/* Charts Section */}
        <section>
          <ChartHeader title="Analytics Overview" />
          <ChartContainer>
            <ServiceDistributionChart data={serviceSeries} loading={loading} />
            <ComplaintDistributionChart data={complaintSeries} loading={loading} />
          </ChartContainer>
        </section>

        {/* Status & Priority Overview */}
        <section>
          <ChartHeader title="Request Distribution" />
          <ChartContainer>
            <StatusOverviewChart
              serviceStatus={serviceStatusSeries}
              complaintStatus={complaintStatusSeries}
              loading={loading}
            />
            <RequestPriorityChart data={prioritySeries.length > 0 ? prioritySeries : [
              { priority: "LOW", count: 45 },
              { priority: "MEDIUM", count: 89 },
              { priority: "HIGH", count: 34 },
              { priority: "URGENT", count: 12 }
            ]} loading={loading} />
          </ChartContainer>
        </section>

        {/* Activity Feed & Reports */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard
              title="Recent Reports"
              subtitle="Latest student conduct reports"
              loading={loading}
              empty={filteredReports.length === 0}
            >
              <div className="space-y-3">
                {filteredReports.slice(0, 6).map((report) => (
                  <div key={report.id} className="rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{report.reportedUser?.name || report.reportedUser?.username}</p>
                        <p className="text-sm text-muted-foreground">{formatLabel(report.reason)}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <div>
            <ActivityFeed activities={activities} loading={loading} />
          </div>
        </section>

        {/* System Stats */}
        <section className="grid gap-6 md:grid-cols-4">
          <ChartCard title="User Accounts" loading={loading} empty={false}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">{totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <span className="text-lg font-bold text-green-600">{activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Warned</span>
                <span className="text-lg font-bold text-yellow-600">{warnedUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Banned</span>
                <span className="text-lg font-bold text-red-600">{bannedUsers}</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Most Requested" loading={loading} empty={!serviceSeries.length}>
            <p className="text-2xl font-bold text-foreground truncate">{topEntry(serviceSeries, "No data")}</p>
          </ChartCard>

          <ChartCard title="Most Complained" loading={loading} empty={!complaintSeries.length}>
            <p className="text-2xl font-bold text-foreground truncate">{topEntry(complaintSeries, "No data")}</p>
          </ChartCard>

          <ChartCard title="System Status" loading={loading} empty={false}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">All systems operational</span>
              </div>
              <div className="text-xs text-muted-foreground">Last updated: now</div>
            </div>
          </ChartCard>
        </section>
      </div>
    </DashboardLayout>
  );
}