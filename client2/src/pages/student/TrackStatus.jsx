import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";

// --- DUMMY DATABASE ---
const mockDatabase = {
  "SSCMS-8921": {
    id: "SSCMS-8921",
    type: "Cafeteria Feedback",
    status: "In Progress",
    note: "We are currently reviewing the feedback with the catering vendor. Expected update by tomorrow.",
    timeline: [
      { label: "Request Submitted", date: "Oct 24, 10:00 AM", completed: true },
      { label: "Reviewed by Admin", date: "Oct 24, 02:30 PM", completed: true },
      {
        label: "Action in Progress",
        date: "Pending",
        completed: false,
        current: true,
      },
      { label: "Resolution", date: "Pending", completed: false },
    ],
  },
  "SSCMS-8804": {
    id: "SSCMS-8804",
    type: "ID Replacement",
    status: "Resolved",
    note: "Your new ID has been printed and is ready for pickup at the Registrar's office.",
    timeline: [
      { label: "Request Submitted", date: "Oct 20, 09:15 AM", completed: true },
      { label: "Payment Verified", date: "Oct 20, 11:00 AM", completed: true },
      {
        label: "Printing in Progress",
        date: "Oct 21, 08:30 AM",
        completed: true,
      },
      {
        label: "Resolution",
        date: "Oct 22, 02:00 PM",
        completed: true,
        current: true,
      },
    ],
  },
};

const recentRequests = [
  { id: "SSCMS-8921", type: "Cafeteria Feedback", status: "In Progress" },
  { id: "SSCMS-8804", type: "ID Replacement", status: "Resolved" },
];

// --- COMPONENTS ---
const TimelineItem = ({ step, isLast }) => (
  <div className="flex gap-4 relative">
    {!isLast && (
      <div
        className={`absolute left-3 top-8 bottom-[-16px] w-0.5 ${step.completed ? "bg-[#5B9DFF]" : "bg-slate-100"}`}
      />
    )}
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
        step.completed
          ? "bg-[#5B9DFF] text-white"
          : step.current
            ? "bg-white border-2 border-[#002B5B] text-[#002B5B]"
            : "bg-slate-100 text-slate-300"
      }`}
    >
      {step.completed ? (
        <CheckCircle2 size={14} />
      ) : (
        <div className="w-2 h-2 rounded-full bg-current" />
      )}
    </div>
    <div className="pb-8">
      <p
        className={`text-sm font-black ${step.current ? "text-[#002B5B]" : step.completed ? "text-slate-700" : "text-slate-400"}`}
      >
        {step.label}
      </p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
        {step.date}
      </p>
    </div>
  </div>
);

const TrackStatus = () => {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleSearch = (e, idToSearch = searchId) => {
    if (e) e.preventDefault();
    if (!idToSearch.trim()) return;

    setSearchId(idToSearch);
    setIsSearching(true);
    setSelectedRequest(null);

    // Simulate API call and state binding
    setTimeout(() => {
      setIsSearching(false);
      const data = mockDatabase[idToSearch];
      setSelectedRequest(data || { notFound: true, id: idToSearch });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/student")}
            className="flex items-center gap-2 text-slate-400 hover:text-[#002B5B] transition-colors group cursor-pointer"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-[11px] font-black uppercase tracking-widest">
              Dashboard
            </span>
          </button>
          <div className="hidden md:block">
            <h1 className="text-sm font-black text-[#002B5B] uppercase tracking-[0.3em]">
              Service Portal <span className="text-slate-300 mx-2">|</span>{" "}
              Status Tracking
            </h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: SEARCH & RECENT */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-3xl font-black text-[#002B5B] tracking-tight mb-2">
                Track Request
              </h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Enter a tracking ID or select a recent request to view its
                current status.
              </p>
            </div>

            <form
              onSubmit={(e) => handleSearch(e)}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4"
            >
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Manual Lookup
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g. SSCMS-8921"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-16 text-sm font-bold text-[#002B5B] placeholder:text-slate-300 focus:ring-2 focus:ring-[#5B9DFF]/20 focus:border-[#5B9DFF] outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!searchId.trim() || isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#002B5B] text-white p-2.5 rounded-xl shadow-md hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSearching ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </div>
            </form>

            <div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                Your Active Requests
              </h3>
              <div className="space-y-3">
                {recentRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => handleSearch(null, req.id)}
                    className="group bg-white p-5 rounded-[1.5rem] border border-slate-100 hover:border-[#5B9DFF]/30 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 text-[#002B5B] rounded-xl group-hover:bg-blue-50 group-hover:text-[#5B9DFF] transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#002B5B]">
                          {req.id}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {req.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                          req.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-[#5B9DFF]"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DYNAMIC TIMELINE RESULTS */}
          <div className="lg:col-span-7">
            <div className="bg-white h-full rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-8 lg:p-12 flex flex-col">
              {!selectedRequest && !isSearching ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <Clock size={48} className="text-slate-200 mb-4" />
                  <p className="text-sm font-black text-[#002B5B] tracking-tight">
                    No Request Selected
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-2 max-w-xs">
                    Select a recent request or search an ID to view its
                    resolution timeline.
                  </p>
                </div>
              ) : isSearching ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Loader2
                    size={32}
                    className="text-[#5B9DFF] animate-spin mb-4"
                  />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                    Retrieving Status...
                  </p>
                </div>
              ) : selectedRequest.notFound ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <AlertCircle size={48} className="text-red-300 mb-4" />
                  <p className="text-sm font-black text-[#002B5B] tracking-tight">
                    Request Not Found
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-2 max-w-xs">
                    We couldn't find any records matching{" "}
                    <span className="font-bold">{selectedRequest.id}</span>.
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-8 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-[#002B5B] tracking-tight">
                        {selectedRequest.id}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        {selectedRequest.type}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                        selectedRequest.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-blue-50 text-[#5B9DFF]"
                      }`}
                    >
                      {selectedRequest.status !== "Resolved" && (
                        <Loader2 size={12} className="animate-spin" />
                      )}
                      {selectedRequest.status}
                    </span>
                  </div>

                  <div className="pl-2">
                    {selectedRequest.timeline.map((step, idx) => (
                      <TimelineItem
                        key={idx}
                        step={step}
                        isLast={idx === selectedRequest.timeline.length - 1}
                      />
                    ))}
                  </div>

                  {selectedRequest.note && (
                    <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                      <AlertCircle
                        size={16}
                        className="text-amber-500 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-amber-800">
                          System Note
                        </p>
                        <p className="text-xs text-amber-700/80 font-medium mt-1">
                          {selectedRequest.note}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackStatus;
