import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  FileText,
  AlertCircle,
  ChevronRight,
  Filter,
} from "lucide-react";
import { recentRequests } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const Directory = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = recentRequests.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "requests" && item.type === "Service Request") ||
      (filter === "complaints" && item.type === "Complaint");
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PAGE HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={20} className="text-[#002B5B]" />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#002B5B] uppercase tracking-tighter">
                Master Directory
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Archive of all submissions
              </p>
            </div>
          </div>

          {/* Desktop Search & Filter Stats */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">
                Total Submissions
              </p>
              <p className="text-lg font-black text-[#002B5B] leading-none">
                {filtered.length}
              </p>
            </div>
          </div>
        </header>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by title, ID, or keywords..."
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#002B5B]/5 transition-all shadow-sm"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-200/50 p-1 rounded-2xl w-full lg:w-auto min-w-75">
            {["all", "requests", "complaints"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  filter === t
                    ? "bg-[#002B5B] text-white shadow-lg"
                    : "text-slate-500 hover:text-[#002B5B] hover:bg-white/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS GRID */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/submission/${item.id}`)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between group cursor-pointer hover:border-[#002B5B]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex gap-5">
                  {/* Icon Indicator */}
                  <div
                    className={`p-4 rounded-2xl shrink-0 ${
                      item.type === "Service Request"
                        ? "bg-[#E5F0FF] text-[#5B9DFF]"
                        : "bg-[#FFEBE5] text-[#D35A3F]"
                    }`}
                  >
                    {item.type === "Service Request" ? (
                      <FileText size={24} />
                    ) : (
                      <AlertCircle size={24} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {item.type}
                    </p>
                    <h4 className="font-bold text-sm text-[#002B5B] group-hover:text-[#5B9DFF] transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          item.status === "Approved"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase">
                        {item.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-full flex items-center">
                  <ChevronRight
                    size={20}
                    className="text-slate-200 group-hover:text-[#002B5B] transition-all group-hover:translate-x-1"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <Search size={40} className="text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-[#002B5B] uppercase">
              No submissions found
            </h3>
            <p className="text-slate-400 text-sm font-medium">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;
