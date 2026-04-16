import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  AlertCircle,
  ChevronRight,
  MessageSquareWarning,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { fetchMyComplaints } from "@/lib/api/studentSubmissionsApi";

const MyComplaints = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [readItems, setReadItems] = useState(new Set());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Centralized handler
  const handleOpenItem = (item) => {
    setReadItems((prev) => new Set(prev).add(item.id));
    navigate(`/submission/${item.id}`);
  };

  useEffect(() => {
    let cancelled = false;

    const loadComplaints = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchMyComplaints({ search, limit: 50, page: 1 });
        if (!cancelled) {
          setItems(response.items);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "Failed to load complaints.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadComplaints();

    return () => {
      cancelled = true;
    };
  }, [search]);

  const complaintsOnly = useMemo(() => items, [items]);

  const pendingCount = complaintsOnly.filter(
    (c) => ["Submitted", "Under Review", "In Progress", "Pending"].includes(c.status),
  ).length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PAGE HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={20} className="text-[#002B5B]" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#002B5B] uppercase tracking-tighter">
                My Complaints
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Track and manage your filed grievances
              </p>
            </div>
          </div>

          {/* Desktop Quick Stats */}
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  Pending
                </p>
                <p className="text-sm font-black text-[#002B5B]">
                  {pendingCount}
                </p>
              </div>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  Resolved
                </p>
                <p className="text-sm font-black text-[#002B5B]">
                  {complaintsOnly.length - pendingCount}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* SEARCH BAR */}
        <div className="relative mb-10 max-w-xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by complaint title or ID..."
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#D35A3F]/5 transition-all shadow-sm font-medium"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* GRID LIST */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-4xl border-2 border-dashed border-slate-100">
            <h3 className="text-lg font-black text-[#002B5B] uppercase">Loading complaints...</h3>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-4xl border-2 border-dashed border-red-100">
            <h3 className="text-lg font-black text-red-600 uppercase">Failed to load</h3>
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        ) : complaintsOnly.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaintsOnly.map((item) => {
              const isRead = readItems.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between group cursor-pointer transition-all duration-300 relative overflow-hidden
                    ${
                      isRead
                        ? "bg-slate-50 border-slate-200 opacity-70"
                        : "bg-white border-slate-100 hover:border-[#D35A3F]/30 hover:shadow-xl"
                    }
                  `}
                >
                  {/* NEW badge */}
                  {!isRead && (
                    <span className="absolute top-4 right-4 text-[8px] font-black bg-[#002B5B] text-white px-2 py-1 rounded-full z-10">
                      NEW
                    </span>
                  )}

                  {/* Visual Accent */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D35A3F] opacity-20 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-4 items-center">
                      <div
                        className={`p-3 rounded-2xl transition-colors ${
                          isRead
                            ? "bg-slate-200 text-slate-400"
                            : "bg-[#FFEBE5] text-[#D35A3F] group-hover:bg-[#D35A3F] group-hover:text-white"
                        }`}
                      >
                        <AlertCircle size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#002B5B] group-hover:text-[#D35A3F] transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          ID: #{item.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-300 group-hover:text-[#002B5B] group-hover:translate-x-1 transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-300" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        {item.date}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                        item.status === "Pending"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-4xl border-2 border-dashed border-slate-100">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <MessageSquareWarning size={48} className="text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-[#002B5B] uppercase">
              No complaints found
            </h3>
            <p className="text-slate-400 text-sm font-medium">
              Everything looks clear for now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
