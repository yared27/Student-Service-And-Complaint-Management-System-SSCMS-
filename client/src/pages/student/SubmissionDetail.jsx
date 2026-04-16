import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  UserCircle2,
  Download,
  Building2,
  Hash,
  MessageSquare,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { fetchSubmissionDetail } from "@/lib/api/studentSubmissionsApi";

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDetail = async () => {
      setLoading(true);
      setError("");

      try {
        const detail = await fetchSubmissionDetail(id);
        if (!cancelled) {
          setData(detail);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "Failed to load submission.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadDetail();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <h2 className="text-xl font-black text-[#002B5B] uppercase tracking-widest">Loading record...</h2>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <AlertCircle size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-black text-[#002B5B] uppercase tracking-widest">
          Record Not Found
        </h2>
        <p className="text-slate-400 text-sm mb-6 text-center">
          {error || `We couldn't find a submission with ID: ${id}`}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-[#002B5B] text-white rounded-xl font-bold text-xs uppercase tracking-widest"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const attachments = Array.isArray(data.attachments) ? data.attachments : [];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      {/* NAVIGATION HEADER */}
      <header className="bg-white border-b border-slate-100 px-8 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-[#002B5B] transition-colors group cursor-pointer"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-[11px] font-black uppercase tracking-widest">
              Back
            </span>
          </button>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-[#002B5B] uppercase tracking-widest">
              SSCMS Official Record
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 lg:p-12">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
          {/* STATUS BANNER */}
          <div
            className={`px-10 py-6 flex items-center justify-between ${
              data.status === "Pending" ? "bg-amber-50/50" : "bg-emerald-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${
                  data.status === "Pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {data.status}
              </span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Filed on {data.date}
              </p>
            </div>
            <button className="flex items-center gap-2 text-[#002B5B] hover:opacity-60 transition-opacity cursor-pointer">
              <Download size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Export Receipt
              </span>
            </button>
          </div>

          <div className="p-10 lg:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* CONTENT AREA */}
              <div className="lg:col-span-8 space-y-10">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-[#002B5B] leading-tight tracking-tight mb-4">
                    {data.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Hash size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Ref: {data.type === "Complaint" ? "CMP" : "SRV"}-
                      {String(data.id).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    <MessageSquare size={14} /> Detailed Statement
                  </h3>
                  <div className="bg-slate-50 rounded-4xl p-8 border border-slate-100 border-dashed">
                    <p className="text-base text-slate-600 leading-relaxed font-medium italic">
                      "
                      {data.description ||
                        `This is the official record for the ${data.type.toLowerCase()} titled ${data.title}. No further description was provided in the mock data.`}
                      "
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    <FileText size={14} /> Attached Evidence
                  </h3>
                  {attachments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attachments.map((attachment, index) => (
                        <a
                          key={attachment.id || `${attachment.url}-${index}`}
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group border border-slate-100 rounded-2xl bg-white overflow-hidden hover:border-[#002B5B]/30 transition-colors"
                        >
                          <div className="aspect-video bg-slate-100 overflow-hidden">
                            <img
                              src={attachment.url}
                              alt={`Attachment ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-black text-[#002B5B] uppercase tracking-wider">
                                Attachment {index + 1}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                {attachment.format || "Image"}
                              </p>
                            </div>
                            <ExternalLink size={14} className="text-slate-400 group-hover:text-[#002B5B]" />
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 border border-slate-100 rounded-2xl bg-white flex items-center gap-4 text-slate-400 italic text-sm">
                      No files attached to this submission.
                    </div>
                  )}
                </div>
              </div>

              {/* SIDEBAR METADATA */}
              <div className="lg:col-span-4">
                <div className="bg-slate-50/50 rounded-4xl p-8 border border-slate-100 space-y-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-4">
                    Submission Meta
                  </h4>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-[#002B5B]">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">
                          Department
                        </p>
                        <p className="text-sm font-bold text-[#002B5B]">
                          Registrar Office
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-[#002B5B]">
                        <UserCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">
                          Category
                        </p>
                        <p className="text-sm font-bold text-[#002B5B]">
                          {data.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-[#002B5B]">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">
                          Priority
                        </p>
                        <p className="text-sm font-bold text-orange-600">
                          Standard
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-5 bg-[#002B5B] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all">
                    Download Acknowledgment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmissionDetail;
