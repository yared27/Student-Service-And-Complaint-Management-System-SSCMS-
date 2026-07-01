import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

export function EnhancedDataTable({
  columns,
  data = [],
  loading = false,
  searchable = true,
  searchFields = [],
  filterable = true,
  filters = [],
  onFilterChange = () => {},
  pageable = true,
  pageSize = 10,
  onRowClick = null,
}) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Handle filtering
  const filteredData = useMemo(() => {
    let result = [...(data || [])];

    // Search filter
    if (search && searchFields.length > 0) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((row) =>
        searchFields.some((field) => {
          const value = String(row[field] || "").toLowerCase();
          return value.includes(lowerSearch);
        })
      );
    }

    // Status/categorical filters
    Object.entries(activeFilters).forEach(([field, value]) => {
      if (value && value !== "all") {
        result = result.filter((row) => String(row[field] || "").toLowerCase() === String(value).toLowerCase());
      }
    });

    return result;
  }, [data, search, activeFilters, searchFields]);

  // Handle pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (!pageable) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, pageable]);

  const handleFilterChange = (field, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
    onFilterChange(field, value);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="space-y-2 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Search and Filters Bar */}
      {(searchable || filterable) && (
        <div className="border-b border-border p-4 bg-muted/30 space-y-4">
          {searchable && searchFields.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {filterable && filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <div key={filter.field} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{filter.label}:</span>
                  <select
                    value={activeFilters[filter.field] || "all"}
                    onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All</option>
                    {filter.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div>
        <div className="block sm:hidden p-3">
          {paginatedData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data found</div>
          ) : (
            <div className="space-y-3">
              {paginatedData.map((row, i) => (
                <div key={i} className="rounded-lg border bg-card p-3">
                  {columns.map((col) => (
                    <div key={col.key} className="flex justify-between py-1">
                      <div className="text-xs text-muted-foreground">{col.label}</div>
                      <div className="text-sm font-medium">{col.render ? col.render(row[col.key], row) : row[col.key]}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-muted/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-foreground">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pageable && totalPages > 1 && (
        <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-muted/30">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} · {filteredData.length} results
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
