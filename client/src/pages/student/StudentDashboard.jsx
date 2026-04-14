import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { currentUser, recentRequests } from "@/data/mockData";
import {
  FileText,
  Megaphone,
  ChevronRight,
  ArrowUpRight,
  MessageSquare,
  X,
  HelpCircle,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const filteredActivities = recentRequests.filter((item) => {
    if (filter === "all") return true;
    return item.status.toLowerCase() === "pending";
  });

  return (
    <div className="space-y-8 pb-32 max-w-350 mx-auto px-6 bg-slate-50/30 min-h-screen">
      
      {/* SECTION 1: GREETING & METRICS */}
      <section className="pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
            SSCMS Student Portal
          </h2>
          <h1 className="text-3xl md:text-5xl font-black text-[#002B5B] leading-tight tracking-tight">
            Welcome back, <br className="md:hidden" />
            {currentUser.name}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
              2 Active Requests
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl shadow-sm">
            <span className="relative h-2.5 w-2.5 inline-flex rounded-full bg-orange-500"></span>
            <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">
              1 Pending Complaint
            </span>
          </div>
        </div>
      </section>

      {/* DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SECTION 2: QUICK ACTIONS (Column 4 on large) */}
        <section className="lg:col-span-4 space-y-4">
          <Link to="/new-service-request" className="block group">
            <Card className="bg-[#002B5B] text-white border-none shadow-xl rounded-2xl overflow-hidden relative min-h-52.5">
              <CardContent className="p-6 h-full flex flex-col justify-between relative gap-10">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-white/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase">New Service Request</h3>
                  <p className="text-xs text-slate-300">Initiate official documentation requests.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/new-complaint" className="block group">
            <Card className="bg-white border border-slate-100 shadow-md rounded-2xl overflow-hidden relative min-h-52.5">
              <CardContent className="p-6 h-full flex flex-col justify-between relative gap-10">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Megaphone className="h-6 w-6 text-[#002B5B]" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-[#002B5B] uppercase">Submit Complaint</h3>
                  <p className="text-xs text-slate-500">Report campus or academic issues.</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* SECTION 3: RECENT ACTIVITIES (Column 8 on large) */}
        <section className="lg:col-span-8 bg-[#F4F7F9] p-6 md:p-8 rounded-4xl w-full">
          <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#002B5B] tracking-tight">Recent Activities</h3>
              <p className="text-[11px] text-slate-500 mt-1">Tracking your pending submissions</p>
            </div>
            <div className="flex bg-slate-200/60 p-1 rounded-lg w-fit">
              <button onClick={() => setFilter("all")} className={`px-6 py-1.5 rounded shadow-sm text-[9px] font-black uppercase tracking-wider transition-all ${filter === "all" ? "bg-white text-[#002B5B]" : "text-slate-500"}`}>All Items</button>
              <button onClick={() => setFilter("pending")} className={`px-6 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${filter === "pending" ? "bg-white text-[#002B5B] shadow-sm" : "text-slate-500"}`}>Pending</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((item) => (
                <div key={item.id} onClick={() => navigate(`/submission/${item.id}`)} className="bg-white rounded-xl shadow-sm relative p-5 flex flex-col overflow-hidden cursor-pointer group hover:shadow-md transition-all">
                  {item.type === "Service Request" && <div className="absolute left-0 top-[30%] bottom-[30%] w-1 bg-[#002B5B] rounded-r-md" />}
                  <div className={`p-2.5 w-fit rounded-lg mb-4 transition-colors ${item.type === "Service Request" ? "bg-[#E5F0FF]" : "bg-[#FFEBE5]"}`}>
                    {item.type === "Service Request" ? <FileText size={18} className="text-[#5B9DFF]" /> : <AlertCircle size={18} className="text-[#D35A3F]" />}
                  </div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.type} • {item.date}</div>
                  <h4 className="font-bold text-[13px] text-[#002B5B] mb-3">{item.title}</h4>
                  <ChevronRight size={16} className="text-[#002B5B] group-hover:translate-x-1 transition-transform self-end" />
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-[10px] font-black uppercase text-slate-400">No pending items found</div>
            )}
          </div>
          <div className="mt-8 flex justify-center">
            <button onClick={() => navigate("/directory")} className="text-[10px] font-black uppercase tracking-widest text-[#002B5B] hover:opacity-70 transition-opacity">View Full Directory</button>
          </div>
        </section>
      </div>

      {/* FAB SYSTEM */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-4 lg:bottom-10">
        {isFabOpen && (
          <div className="flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-5">
            <button onClick={() => navigate("/track-status")} className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-lg border border-slate-100">
              <span className="text-[10px] font-black text-[#002B5B] uppercase">Track Status</span>
              <div className="p-2 bg-blue-50 rounded-lg"><Search size={18} className="text-[#002B5B]" /></div>
            </button>
            <button onClick={() => navigate("/support")} className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-lg border border-slate-100">
              <span className="text-[10px] font-black text-[#002B5B] uppercase">Help Center</span>
              <div className="p-2 bg-slate-50 rounded-lg"><HelpCircle size={18} className="text-[#002B5B]" /></div>
            </button>
          </div>
        )}
        <Button onClick={() => setIsFabOpen(!isFabOpen)} className={`h-16 w-16 rounded-2xl shadow-2xl transition-all ${isFabOpen ? "bg-slate-800 rotate-90" : "bg-[#002B5B]"}`}>
          {isFabOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </Button>
      </div>
    </div>
  );
};

export default StudentDashboard;
