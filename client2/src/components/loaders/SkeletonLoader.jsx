export function SkeletonLoader({ count = 1, height = "h-12", variant = "default" }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`${height} bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg animate-pulse`} />
      ))}
    </div>
  );
}

export function SkeletonCard({ width = "w-full", height = "h-48" }) {
  return (
    <div className={`${width} ${height} rounded-lg border border-border bg-card overflow-hidden`}>
      <div className="w-full h-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
    </div>
  );
}

export function SkeletonTableRow({ columns = 5 }) {
  return (
    <div className="flex gap-4 p-4 border-b border-border">
      {[...Array(columns)].map((_, i) => (
        <div key={i} className="flex-1 h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />
      ))}
    </div>
  );
}

export function SkeletonChartCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="h-6 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted rounded mb-6 animate-pulse" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-2 items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />
              <div className="h-2 w-3/4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonKPICard() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="h-4 w-24 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />
        <div className="h-8 w-8 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="h-8 w-16 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />
        <div className="h-3 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonActivityFeed() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3 p-3 border-l-4 border-muted">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-3 w-full bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />
            <div className="h-2 w-3/4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
