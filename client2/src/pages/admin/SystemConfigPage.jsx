import { useState, useEffect } from "react";
import { Settings, Save, Bell, Zap, BarChart3, Layout } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/auth-context";

export default function SystemConfigPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);

  // System settings state
  const [settings, setSettings] = useState({
    general: {
      systemName: "Student Service & Complaint Management System",
      campusName: "Main Campus",
      maintenanceMode: false,
      timezone: "UTC+0",
    },
    notifications: {
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      retryAttempts: 3,
      retryDelaySeconds: 300,
    },
    workflow: {
      autoCloseDays: 30,
      reopenRequestLimit: 2,
      escalationThresholdHours: 48,
      autoAssignmentEnabled: true,
    },
    ai: {
      enableDuplicateDetection: true,
      enablePrioritySuggestion: true,
      confidenceThreshold: 0.75,
    },
  });

  const topLinks = [
    { to: "/admin/dashboard", label: "Dashboard", end: true },
    { to: "/admin/system-config", label: "System Config", end: true },
  ];

  const handleSettingChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // In a real app, this would call an API
    console.log("Saving settings:", settings);
    setHasChanges(false);
    // Show success toast
    alert("Settings saved successfully!");
  };

  return (
    <DashboardLayout role="admin" topLinks={topLinks} user={user || {}}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Configuration</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">System Settings</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage system configuration, workflows, and AI settings.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" /> {hasChanges ? "Save Changes" : "Saved"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {[
            { id: "general", label: "General", icon: Settings },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "workflow", label: "Workflow", icon: Zap },
            { id: "ai", label: "AI Settings", icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">General Configuration</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">System Name</label>
                  <input
                    type="text"
                    value={settings.general.systemName}
                    onChange={(e) => handleSettingChange("general", "systemName", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Display name shown across the system</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Campus Name</label>
                  <input
                    type="text"
                    value={settings.general.campusName}
                    onChange={(e) => handleSettingChange("general", "campusName", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Primary campus identifier</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleSettingChange("general", "timezone", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>UTC+0</option>
                    <option>UTC+1</option>
                    <option>UTC+2</option>
                    <option>UTC-5</option>
                    <option>UTC-8</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="maintenance"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => handleSettingChange("general", "maintenanceMode", e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label htmlFor="maintenance" className="flex-1 text-sm font-medium text-foreground cursor-pointer">
                    Enable Maintenance Mode
                  </label>
                  <span className="text-xs text-muted-foreground">System will show maintenance message</span>
                </div>
              </div>
            </div>

            {/* Campus & Department Overview */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Campus Structure</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Campuses</p>
                  <p className="text-2xl font-bold text-foreground">1</p>
                  <p className="text-xs text-muted-foreground mt-2">Main Campus</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Departments</p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                  <p className="text-xs text-muted-foreground mt-2">Active departments</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Notification Settings</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">Send notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.enableEmailNotifications}
                  onChange={(e) => handleSettingChange("notifications", "enableEmailNotifications", e.target.checked)}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">SMS Notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">Send notifications via SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.enableSMSNotifications}
                  onChange={(e) => handleSettingChange("notifications", "enableSMSNotifications", e.target.checked)}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Retry Attempts</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.notifications.retryAttempts}
                  onChange={(e) => handleSettingChange("notifications", "retryAttempts", parseInt(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Number of times to retry failed notifications</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Retry Delay (seconds)</label>
                <input
                  type="number"
                  min="30"
                  max="3600"
                  step="30"
                  value={settings.notifications.retryDelaySeconds}
                  onChange={(e) => handleSettingChange("notifications", "retryDelaySeconds", parseInt(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Delay between retry attempts</p>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Settings */}
        {activeTab === "workflow" && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Workflow Configuration</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Auto-close After (days)</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={settings.workflow.autoCloseDays}
                  onChange={(e) => handleSettingChange("workflow", "autoCloseDays", parseInt(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Automatically close inactive requests after this period</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reopen Request Limit</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.workflow.reopenRequestLimit}
                  onChange={(e) => handleSettingChange("workflow", "reopenRequestLimit", parseInt(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Maximum times a request can be reopened</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Escalation Threshold (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={settings.workflow.escalationThresholdHours}
                  onChange={(e) => handleSettingChange("workflow", "escalationThresholdHours", parseInt(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Escalate requests if not resolved within this time</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-assignment</p>
                  <p className="text-xs text-muted-foreground mt-1">Automatically assign requests based on workload</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.workflow.autoAssignmentEnabled}
                  onChange={(e) => handleSettingChange("workflow", "autoAssignmentEnabled", e.target.checked)}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Settings */}
        {activeTab === "ai" && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Artificial Intelligence Settings</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Duplicate Detection</p>
                  <p className="text-xs text-muted-foreground mt-1">Detect and warn about duplicate requests/complaints</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ai.enableDuplicateDetection}
                  onChange={(e) => handleSettingChange("ai", "enableDuplicateDetection", e.target.checked)}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Priority Suggestion</p>
                  <p className="text-xs text-muted-foreground mt-1">Automatically suggest priority levels for new requests</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ai.enablePrioritySuggestion}
                  onChange={(e) => handleSettingChange("ai", "enablePrioritySuggestion", e.target.checked)}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-4">Confidence Threshold</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={settings.ai.confidenceThreshold}
                    onChange={(e) => handleSettingChange("ai", "confidenceThreshold", parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-foreground w-12 text-right">
                    {(settings.ai.confidenceThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Minimum confidence level for AI suggestions (higher = stricter)</p>
              </div>

              <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">AI Service Status</p>
                <p className="text-xs text-blue-700 mt-1">✓ Connected and operational</p>
                <p className="text-xs text-blue-700 mt-2">Last sync: 2 minutes ago</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
