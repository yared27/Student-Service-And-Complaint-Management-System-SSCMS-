import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Skeleton from "@/components/Skeleton";
import { Input } from "@/components/ui/input";

function compareValues(a, b) {
  if (a === b) {
    return 0;
  }

  if (a === null || a === undefined) {
    return -1;
  }

  if (b === null || b === undefined) {
    return 1;
  }

  const aNum = Number(a);
  const bNum = Number(b);

  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
    return aNum - bNum;
  }

  return String(a).localeCompare(String(b));
}

export default function DataTable({ columns = [], data = [], onRowClick, loading = false }) {
  const [query, setQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return Array.isArray(data) ? data : [];
    }

    return (Array.isArray(data) ? data : []).filter((row) => {
      return columns.some((col) => String(row?.[col.key] ?? "").toLowerCase().includes(q));
    });
  }, [query, data, columns]);

  const sorted = useMemo(() => {
    const rows = [...filtered];
    if (!sortConfig.key) {
      return rows;
    }

    rows.sort((left, right) => {
      const base = compareValues(left?.[sortConfig.key], right?.[sortConfig.key]);
      return sortConfig.direction === "asc" ? base : -base;
    });

    return rows;
  }, [filtered, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize]);

  function toggleSort(column) {
    if (!column.sortable) {
      return;
    }

    setPage(1);
    setSortConfig((prev) => {
      if (prev.key !== column.key) {
        return { key: column.key, direction: "asc" };
      }

      return {
        key: column.key,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  }

  function sortIcon(column) {
    if (!column.sortable) {
      return null;
    }

    if (sortConfig.key !== column.key) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }

    return sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  }

  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden border">
      <div className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }} className="pl-9" placeholder="Search table..." />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Rows</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-2"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort(column)}
                    className={cn("inline-flex items-center gap-1", column.sortable ? "hover:text-foreground" : "cursor-default")}
                  >
                    <span>{column.label}</span>
                    {sortIcon(column)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 space-y-2">
                  <Skeleton variant="table-row" />
                  <Skeleton variant="table-row" />
                  <Skeleton variant="table-row" />
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-muted-foreground">
                  No rows found.
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={cn("border-t hover:bg-secondary/40", onRowClick ? "cursor-pointer" : "")}
                  onClick={() => onRowClick?.(row.id)}
                >
                  {columns.map((column) => (
                    <td key={`${row.id || rowIndex}-${column.key}`} className="px-4 py-3">
                      {row?.[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {safePage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-8 px-3 rounded-md border disabled:opacity-50"
            disabled={safePage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="h-8 px-3 rounded-md border disabled:opacity-50"
            disabled={safePage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
