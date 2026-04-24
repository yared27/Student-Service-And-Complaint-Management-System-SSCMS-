import { cn } from "@/lib/utils";

const DEPT_STYLES = {
  dormitory: "bg-orange-100 text-orange-800",
  cafeteria: "bg-green-100 text-green-800",
  ict: "bg-blue-100 text-blue-800",
  library: "bg-purple-100 text-purple-800",
  utilities: "bg-indigo-100 text-indigo-800",
};

function normalizeDept(dept) {
  return String(dept || "").trim().toLowerCase();
}

export default function DeptBadge({ dept }) {
  const normalized = normalizeDept(dept);
  const tone = DEPT_STYLES[normalized] || "bg-gray-100 text-gray-800";

  return <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-sm", tone)}>{normalized || "unknown"}</span>;
}
