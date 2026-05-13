# SSCMS UI Component Library

## Overview

This document provides a comprehensive guide to the professional UI components created for the Student Service and Complaint Management System (SSCMS). These components follow design best practices and are built with React, Tailwind CSS, and Lucide React icons.

## Table of Contents

1. [Chart Components](#chart-components)
2. [Dashboard Components](#dashboard-components)
3. [Table Components](#table-components)
4. [Badge Components](#badge-components)
5. [Loading Components](#loading-components)
6. [Dialog Components](#dialog-components)
7. [State Components](#state-components)
8. [Usage Examples](#usage-examples)

---

## Chart Components

### ChartCard & Variants

**Location:** `src/components/charts/ChartCard.jsx`

Container component for charts with consistent styling and loading/error states.

```javascript
import { ChartCard, ChartHeader, ChartContainer, ChartContainerFull } from "@/components/ui";

// Basic usage
<ChartCard
  title="Service Requests"
  subtitle="By type"
  loading={false}
  error={null}
  empty={false}
>
  {/* Chart content */}
</ChartCard>

// With loading state
<ChartCard
  title="Service Requests"
  loading={true}
>
  {/* content shown when not loading */}
</ChartCard>

// Full-width layout
<ChartContainerFull>
  <ChartCard title="Chart 1">...</ChartCard>
  <ChartCard title="Chart 2">...</ChartCard>
</ChartContainerFull>
```

**Props:**

- `title` (string): Chart title
- `subtitle` (string): Optional subtitle
- `loading` (boolean): Show loading state
- `error` (string|null): Error message
- `empty` (boolean): Show empty state
- `children` (ReactNode): Chart content

---

### Distribution Charts

**Location:** `src/components/charts/DistributionCharts.jsx`

Pie charts for visualizing service and complaint type distribution.

```javascript
import { ServiceDistributionChart, ComplaintDistributionChart } from "@/components/ui";

// Service distribution
<ServiceDistributionChart
  data={serviceSeries}
  loading={loading}
  error={error}
/>

// Complaint distribution
<ComplaintDistributionChart
  data={complaintSeries}
  loading={loading}
  error={error}
/>
```

**Data Format:**

```javascript
[
  { serviceType: "DORMITORY", _count: { _all: 42 } },
  { serviceType: "CAFETERIA", _count: { _all: 28 } },
];
```

**Available Colors:**

- `CHART_COLORS`: Service type colors (8 types + OTHER)
- `STATUS_CHART_COLORS`: Status colors (PENDING, RESOLVED, etc.)

---

### Status Charts

**Location:** `src/components/charts/StatusCharts.jsx`

Bar charts for status overview and priority distribution.

```javascript
import { StatusOverviewChart, RequestPriorityChart } from "@/components/ui";

// Status overview (services and complaints)
<StatusOverviewChart
  services={serviceSeries}
  complaints={complaintSeries}
  loading={loading}
  error={error}
/>

// Priority distribution
<RequestPriorityChart
  data={priorityData}
  loading={loading}
  error={error}
/>
```

---

## Dashboard Components

### KPI Cards

**Location:** `src/components/dashboard/KPICard.jsx`

Enhanced KPI (Key Performance Indicator) cards with icons, trends, and styling.

```javascript
import { KPICard, StatsRow } from "@/components/ui";

// Single KPI card
<KPICard
  icon={FileText}
  label="Total Requests"
  value={245}
  trend={12}
  trendLabel="this month"
  color="bg-blue-50"
  iconColor="text-blue-600"
  onClick={() => navigate("/admin/requests")}
/>

// Multiple KPI cards in a row
<StatsRow
  items={[
    { icon: FileText, label: "Requests", value: 245, ... },
    { icon: AlertCircle, label: "Complaints", value: 89, ... },
  ]}
/>

// Status-specific KPI
<StatusBadgeKPI
  status="RESOLVED"
  count={156}
  icon={Check}
/>
```

**Props:**

- `icon` (Component): Lucide icon component
- `label` (string): KPI label
- `value` (number|string): KPI value
- `trend` (number): Trend percentage (positive/negative)
- `trendLabel` (string): Trend context ("this month", etc.)
- `color` (string): Background color class
- `iconColor` (string): Icon color class
- `loading` (boolean): Show loading state
- `onClick` (function): Callback when clicked (adds hover effect)

---

### Activity Feed

**Location:** `src/components/dashboard/ActivityFeed.jsx`

Recent activity display with two layout modes.

```javascript
import { ActivityFeed, ActivityTimeline } from "@/components/ui";

// Feed layout (list view)
<ActivityFeed
  activities={activities}
  loading={loading}
/>

// Timeline layout (vertical timeline)
<ActivityTimeline
  activities={activities}
  loading={loading}
/>
```

**Activity Format:**

```javascript
{
  id: "1",
  type: "SERVICE_REQUEST_CREATED", // or COMPLAINT_CREATED, STATUS_UPDATED, etc.
  description: "New service request",
  actor: { name: "John Doe" },
  entity: "Service Request",
  createdAt: new Date(),
}
```

**Supported Types:**

- `SERVICE_REQUEST_CREATED`: Blue
- `COMPLAINT_CREATED`: Purple
- `STATUS_UPDATED`: Blue
- `ASSIGNED`: Orange
- `RESOLVED`: Green
- `ESCALATED`: Red

---

## Table Components

### Enhanced Data Table

**Location:** `src/components/tables/EnhancedDataTable.jsx`

Professional data table with search, filtering, and pagination.

```javascript
import { EnhancedDataTable } from "@/components/ui";

<EnhancedDataTable
  columns={[
    { key: "name", label: "Name", width: "25%" },
    {
      key: "status",
      label: "Status",
      width: "25%",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "date",
      label: "Date",
      width: "25%",
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ]}
  data={tableData}
  loading={loading}
  searchable={true}
  searchFields={["name", "email"]}
  filterable={true}
  filters={[
    {
      field: "status",
      label: "Status",
      options: ["PENDING", "RESOLVED", "REJECTED"],
    },
  ]}
  pageable={true}
  pageSize={10}
  onRowClick={(row) => navigate(`/detail/${row.id}`)}
/>;
```

**Props:**

- `columns` (array): Column definitions (key, label, width, render)
- `data` (array): Table data
- `loading` (boolean): Loading state
- `searchable` (boolean): Enable search
- `searchFields` (array): Fields to search in
- `filterable` (boolean): Enable filters
- `filters` (array): Filter definitions
- `pageable` (boolean): Enable pagination
- `pageSize` (number): Rows per page
- `onRowClick` (function): Row click handler
- `onFilterChange` (function): Filter change callback

---

## Badge Components

### Enhanced Status Badge

**Location:** `src/components/badges/EnhancedStatusBadge.jsx`

Consistent status display with icons and colors.

```javascript
import { EnhancedStatusBadge } from "@/components/ui";

// Default style
<EnhancedStatusBadge status="PENDING" />

// Filled style
<EnhancedStatusBadge status="RESOLVED" variant="filled" size="lg" />

// Size options: sm, md (default), lg
```

**Supported Statuses:**

- `PENDING` / `SUBMITTED`: Yellow
- `IN_PROGRESS` / `UNDER_REVIEW` / `ASSIGNED`: Blue/Indigo
- `RESOLVED` / `COMPLETED`: Green
- `REJECTED`: Red
- `ESCALATED`: Orange
- `CLOSED`: Gray

---

## Loading Components

### Skeleton Loaders

**Location:** `src/components/loaders/SkeletonLoader.jsx`

Animated skeleton placeholders for loading states.

```javascript
import { SkeletonLoader, SkeletonCard, SkeletonTableRow, SkeletonChartCard, SkeletonKPICard, SkeletonActivityFeed } from "@/components/ui";

// Generic loader
<SkeletonLoader count={5} height="h-12" />

// Card skeleton
<SkeletonCard width="w-full" height="h-48" />

// Table row skeleton
<SkeletonTableRow columns={5} />

// Specialized skeletons
<SkeletonChartCard />
<SkeletonKPICard />
<SkeletonActivityFeed />
```

---

## Dialog Components

### Confirmation Dialog

**Location:** `src/components/dialogs/ConfirmationDialog.jsx`

Reusable confirmation modal for user actions.

```javascript
import { ConfirmationDialog, useConfirmationDialog } from "@/components/ui";

// Controlled usage
<ConfirmationDialog
  open={open}
  onOpenChange={setOpen}
  title="Delete User"
  description="Are you sure you want to delete this user? This action cannot be undone."
  type="danger"
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleDelete}
  onCancel={() => {}}
  loading={isDeleting}
/>;

// Hook usage
const { open, setOpen, showConfirmation } = useConfirmationDialog();

showConfirmation({
  title: "Confirm Action",
  description: "Are you sure?",
  type: "warning", // warning, danger, success, info
  onConfirm: () => {
    /* ... */
  },
});
```

**Types:**

- `warning`: Yellow (default)
- `danger`: Red
- `success`: Green
- `info`: Blue

---

## State Components

### Empty State

**Location:** `src/components/states/EmptyState.jsx`

Display when no data is available.

```javascript
import { EmptyState, EmptyStateGrid, NoResultsState, ErrorState, LoadingState } from "@/components/ui";

// Basic empty state
<EmptyState
  title="No requests found"
  description="Create your first service request to get started"
  action={() => navigate("/new-request")}
  actionLabel="Create Request"
/>

// No search results
<NoResultsState searchTerm="dormitory" />

// Error state
<ErrorState
  title="Failed to load data"
  description="Please try again later"
/>

// Loading state
<LoadingState message="Loading requests..." />

// Grid of empty cards (skeleton)
<EmptyStateGrid count={6} />
```

---

## Usage Examples

### Complete Admin Dashboard Example

```javascript
import { KPICard, StatsRow, ServiceDistributionChart, StatusOverviewChart, ActivityFeed, ChartCard, ChartContainer } from "@/components/ui";

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* KPI Stats */}
      <StatsRow
        items={[
          { icon: FileText, label: "Requests", value: 245, trend: 12, ... },
          { icon: AlertCircle, label: "Complaints", value: 89, trend: 8, ... },
        ]}
      />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Service Distribution">
          <ServiceDistributionChart data={data} />
        </ChartCard>

        <ChartCard title="Status Overview">
          <StatusOverviewChart services={services} complaints={complaints} />
        </ChartCard>
      </div>

      {/* Activity Feed */}
      <ActivityFeed activities={activities} />
    </div>
  );
}
```

---

## Design System

### Color Palette

- **Primary**: Blue (#3b82f6)
- **Accent**: Purple (#8b5cf6)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Muted**: Gray (#6b7280)

### Spacing

- `gap-6`: 24px (sections)
- `p-6`: 24px (card padding)
- `px-4`: 16px (button padding)
- `py-2`: 8px (badge padding)

### Border Radius

- Cards: `rounded-lg` (8px)
- Buttons: `rounded-lg` (8px)
- Badges: `rounded-full` (9999px)
- Dialogs: `rounded-xl` (12px)

---

## Best Practices

1. **Use ChartCard for all charts** - Ensures consistent loading/error states
2. **Combine KPICard with StatsRow** - Creates professional stat layouts
3. **Always use EnhancedStatusBadge** - Maintains status consistency across app
4. **Show skeleton loaders** - Better UX than generic spinners
5. **Use ConfirmationDialog for destructive actions** - Prevents accidental deletions
6. **Combine EnhancedDataTable with EmptyState** - Better data presentation

---

## Migration Guide

### Old vs New Patterns

**Old:**

```javascript
<div className="rounded-lg border p-4">
  {loading ? <div>Loading...</div> : <Chart data={data} />}
</div>
```

**New:**

```javascript
<ChartCard title="Chart" loading={loading}>
  <Chart data={data} />
</ChartCard>
```

---

## Contributing

When adding new components:

1. Use Tailwind CSS for styling
2. Support loading/error states
3. Include JSDoc comments
4. Add to `src/components/ui/index.js`
5. Update this documentation
6. Test with dark mode support

---

**Last Updated:** 2024
**Library Version:** 1.0.0
