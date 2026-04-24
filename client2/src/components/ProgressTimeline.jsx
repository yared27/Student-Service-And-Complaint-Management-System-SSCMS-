import StatusBadge from "@/components/StatusBadge";

function formatDate(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

export default function ProgressTimeline({ updates = [] }) {
  if (!Array.isArray(updates) || updates.length === 0) {
    return <p className="text-sm text-muted-foreground">No progress updates yet.</p>;
  }

  return (
    <div className="space-y-2">
      {updates.map((update, index) => (
        <div key={update.id || `${update.status}-${index}`} className="border-l-4 border-blue-200 pl-6 pb-8 relative block">
          <span className="absolute -left-3 top-0 inline-flex min-w-[120px] justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {formatDate(update.date || update.createdAt)}
          </span>
          <div className="pt-8 space-y-2">
            <StatusBadge status={update.status} />
            <p className="text-sm text-muted-foreground">{update.notes || "No notes provided."}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
