import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
  Inbox,
} from "lucide-react";
import { recentRequests } from "@/data/mockData";

const MyRequests = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Filter only Service Requests
  const requestsOnly = recentRequests.filter(
    (item) =>
      item.type === "Service Request" &&
      item.title.toLowerCase().includes(search.toLowerCase()),
  );

  const pendingCount = requestsOnly.filter(
    (r) => r.status === "Pending",
  ).length;
  const completedCount = requestsOnly.length - pendingCount;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
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
                My Requests
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Manage your academic and campus service applications
              </p>
            </div>
          </div>

          {/* QUICK STATS - Visible from MD breakpoint up */}
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  In Progress
                </p>
                <p className="text-sm font-black text-[#002B5B]">
                  {pendingCount}
                </p>
              </div>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  Fulfilled
                </p>
                <p className="text-sm font-black text-[#002B5B]">
                  {completedCount}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* SEARCH SECTION */}
        <div className="relative mb-10 max-w-xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by request title or tracking ID..."
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#002B5B]/5 transition-all shadow-sm font-medium"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* REQUESTS GRID */}
        {requestsOnly.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requestsOnly.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/submission/${item.id}`)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group cursor-pointer hover:border-[#5B9DFF]/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5B9DFF] opacity-20 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="p-3 rounded-2xl bg-[#E5F0FF] text-[#5B9DFF] group-hover:bg-[#002B5B] group-hover:text-white transition-colors duration-300">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#002B5B] transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        Ref: {item.id.split("-")[0].toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-200 group-hover:text-[#002B5B] group-hover:translate-x-1 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    Applied: {item.date}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                      item.status === "Pending"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <Inbox size={48} className="text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-[#002B5B] uppercase">
              No requests found
            </h3>
            <p className="text-slate-400 text-sm font-medium">
              You haven't submitted any requests yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
