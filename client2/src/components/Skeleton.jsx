import { cn } from "@/lib/utils";

export default function Skeleton({ variant = "card", className }) {
  if (variant === "table-row") {
    return <div className={cn("h-12 w-full animate-pulse rounded bg-gray-200", className)} />;
  }

  if (variant === "grid") {
    return (
      <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-3", className)}>
        <div className="h-24 animate-pulse rounded bg-gray-200" />
        <div className="h-24 animate-pulse rounded bg-gray-200" />
        <div className="h-24 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return <div className={cn("h-32 w-full animate-pulse rounded bg-gray-200", className)} />;
}
