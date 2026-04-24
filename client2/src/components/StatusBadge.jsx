import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

export default function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const tone = STATUS_STYLES[normalized] || "bg-gray-100 text-gray-800";

  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-medium", tone)}>
      {normalized || "unknown"}
    </span>
  );
}
