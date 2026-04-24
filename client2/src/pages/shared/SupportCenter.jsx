import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  ChevronLeft, 
  LifeBuoy, 
  Phone, 
  MessageSquare, 
  ChevronDown, 
  Search, 
  Mail, 
  Clock, 
  ExternalLink, 
  ShieldQuestion,
  PlusCircle
} from "lucide-react";

const faqs = [
  {
    category: "Academics",
    q: "How long does a transcript request take?",
    a: "Standard processing time for official transcripts is 3-5 working days upon registrar approval. You will receive a notification in your portal once it is ready for pickup."
  },
  {
    category: "Campus Life",
    q: "What constitutes a valid hostel complaint?",
    a: "Valid complaints include plumbing issues, electrical hazards, broken furniture, or serious hygiene concerns in shared facilities. Noise complaints are handled by security."
  },
  {
    category: "Technical",
    q: "Can I edit a complaint after submission?",
    a: "Once submitted, complaints cannot be edited to maintain the integrity of the tracking system. If you made an error, you must file a new request and reference the old ID."
  },
  {
    category: "Financial",
    q: "How do I clear my semester dues?",
    a: "All payments must be made through the university finance portal. Once paid, the system automatically updates your clearance status within 24 hours."
  }
];

const SupportCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <ChevronLeft
                size={20}
                className="text-[#002B5B] group-hover:-translate-x-0.5 transition-transform"
              />
            </button>
            <h1 className="text-sm font-black text-[#002B5B] uppercase tracking-[0.2em]">
              Support Ecosystem
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Agents Online
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* HERO SEARCH */}
        <div className="bg-[#002B5B] rounded-[2.5rem] p-10 lg:p-16 text-white mb-12 relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
            <LifeBuoy size={240} />
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">
              Hello, {user?.name || "Student"}! <br />
              How can we help?
            </h2>
            <p className="text-sm text-slate-300 font-medium mb-8 leading-relaxed">
              Find answers to common questions or contact the administration
              desk directly for personalized assistance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: FAQ SECTION */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldQuestion size={16} /> Knowledge Base
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {faqs.length} Articles
              </span>
            </div>

            <div className="space-y-3">
              {faqs.length > 0 ? (
                faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className={`bg-white border rounded-[1.5rem] overflow-hidden transition-all duration-300 ${
                      openFaq === idx
                        ? "border-[#5B9DFF] shadow-lg shadow-blue-900/5"
                        : "border-slate-100 shadow-sm"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-6 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 text-left"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-[#5B9DFF] uppercase tracking-widest">
                          {faq.category}
                        </span>
                        <h4 className="text-sm lg:text-base font-bold text-[#002B5B] pr-6">
                          {faq.q}
                        </h4>
                      </div>
                      <div
                        className={`p-2 rounded-lg transition-colors ${openFaq === idx ? "bg-[#002B5B] text-white" : "bg-slate-100 text-slate-400"}`}
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {openFaq === idx && (
                      <div className="px-6 pb-6 text-sm font-medium text-slate-500 leading-relaxed animate-in fade-in slide-in-from-top-2">
                        <div className="h-px bg-slate-100 mb-4" />
                        {faq.a}
                        <div className="mt-4 flex gap-4">
                          <button className="text-[10px] font-black uppercase tracking-widest text-[#5B9DFF] hover:underline">
                            Was this helpful?
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                  <p className="text-sm font-black text-slate-300 uppercase tracking-widest">
                    No results found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: CONTACT & ACTION SIDEBAR */}
          <div className="lg:col-span-5 space-y-8">
            {/* Quick Action */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                Need formal help?
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/student/complaint-submission")}
                  className="w-full group bg-[#FFEBE5] hover:bg-[#D35A3F] transition-all p-4 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white rounded-xl text-[#D35A3F]">
                      <MessageSquare size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-[#D35A3F] group-hover:text-white uppercase">
                        Submit Complaint
                      </p>
                      <p className="text-[9px] font-bold text-[#D35A3F]/60 group-hover:text-white/70">
                        Report an active issue
                      </p>
                    </div>
                  </div>
                  <PlusCircle
                    size={18}
                    className="text-[#D35A3F] group-hover:text-white transition-transform group-hover:rotate-90"
                  />
                </button>

                <button
                  onClick={() => navigate("/student/new-service-request")}
                  className="w-full group bg-[#E5F0FF] hover:bg-[#002B5B] transition-all p-4 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white rounded-xl text-[#002B5B]">
                      <Mail size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-[#002B5B] group-hover:text-white uppercase">
                        Request Service
                      </p>
                      <p className="text-[9px] font-bold text-[#002B5B]/60 group-hover:text-white/70">
                        Apply for documents/help
                      </p>
                    </div>
                  </div>
                  <PlusCircle
                    size={18}
                    className="text-[#002B5B] group-hover:text-white transition-transform group-hover:rotate-90"
                  />
                </button>
              </div>
            </div>

            {/* Direct Contacts */}
            <div className="space-y-4 px-2">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Emergency & Direct
              </h3>

              <div className="space-y-3">
                {[
                  {
                    label: "Main Registrar Office",
                    icon: <Phone size={16} />,
                    contact: "+251 11 XXX XXXX",
                    availability: "Mon-Fri, 8AM-5PM",
                  },
                  {
                    label: "Technical Support",
                    icon: <MessageSquare size={16} />,
                    contact: "support@amu.edu.et",
                    availability: "24/7 Response",
                  },
                  {
                    label: "Finance Dept.",
                    icon: <Clock size={16} />,
                    contact: "Internal Ext: 405",
                    availability: "Business Hours Only",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-50 text-[#002B5B] rounded-xl">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#002B5B] uppercase">
                          {item.label}
                        </p>
                        <p className="text-xs font-bold text-slate-400">
                          {item.contact}
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;