import { Search, Plus, AlertCircle, ArrowRight } from "lucide-react";

export function EmptyState({
  icon: Icon = Search,
  title = "No data found",
  description = "There are no results to display",
  action = null,
  actionLabel = "Create new",
  variant = "default",
}) {
  const variantConfig = {
    default: {
      iconColor: "text-muted-foreground",
      iconBg: "bg-muted",
    },
    error: {
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
    },
    success: {
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
    },
  };

  const config = variantConfig[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${config.iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyStateGrid({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-4" />
          <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
          <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function NoResultsState({ searchTerm = "" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No results found</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {searchTerm
          ? `No results match "${searchTerm}". Try adjusting your search.`
          : "Try adjusting your search filters."}
      </p>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description = "" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">{description}</p>}
    </div>
  );
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
