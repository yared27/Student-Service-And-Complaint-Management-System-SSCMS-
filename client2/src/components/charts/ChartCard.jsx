/**
 * ChartCard - Reusable container for chart components
 * Provides consistent styling and loading states
 */
export function ChartCard({ title, subtitle, children, loading = false, error = null, empty = false }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-r-transparent animate-spin" />
            <span>Loading data...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-64 bg-destructive/5 rounded-lg border border-destructive/20">
          <div className="text-center text-sm text-destructive">
            <p className="font-medium">Unable to load chart</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {empty && (
        <div className="flex items-center justify-center h-64 text-center">
          <div className="text-sm text-muted-foreground">
            <p>No data available</p>
          </div>
        </div>
      )}

      {!loading && !error && !empty && children}
    </div>
  );
}

export function ChartHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ChartContainer({ children }) {
  return <div className="grid gap-6 xl:grid-cols-2">{children}</div>;
}

export function ChartContainerFull({ children }) {
  return <div className="grid gap-6">{children}</div>;
}
