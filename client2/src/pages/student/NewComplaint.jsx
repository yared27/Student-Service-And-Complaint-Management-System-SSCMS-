import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  FileSearch,
  Database,
  BellRing,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  ArrowLeft,
  Scale,
  Camera,
  X,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/api/httpClient";

const NewComplaint = () => {
  const navigate = useNavigate();

  // State Management
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [confidential, setConfidential] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [files, setFiles] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submittedId, setSubmittedId] = useState("");

  const fileInputRef = useRef(null);

  const offices = [
    "Registrar Office",
    "Finance Department",
    "Academic Affairs",
    "Student Services",
    "Department Head",
    "General Services",
  ];

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => setFiles(Array.from(e.target.files || []));
  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.length < 50) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      let attachments = [];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const uploadResponse = await apiRequest("/uploads/images", {
          method: "POST",
          body: formData,
        });

        attachments = (uploadResponse?.files || [])
          .map((item) => ({
            url: item.url,
            publicId: item.publicId,
            width: item.width,
            height: item.height,
            format: item.format,
            bytes: item.bytes,
          }))
          .filter((item) => item.url);
      }

      const complaintPayload = {
        title: subject,
        description: `[Office Involved] ${department}\n[Confidential] ${confidential ? "Yes" : "No"}\n\n${description}`,
        priority: "MEDIUM",
        attachmentUrls: attachments,
      };

      const response = await apiRequest("/complaints", {
        method: "POST",
        body: JSON.stringify(complaintPayload),
      });

      setSubmittedId(response?.complaint?.id || "");
      setIsSubmitting(false);
      setShowSuccess(true);
    } catch (error) {
      setIsSubmitting(false);
      setSubmitError(error.message || "Failed to submit complaint.");
    }
  };

  // SUCCESS SCREEN
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-xl animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 mx-auto shadow-inner">
            <CheckCircle2 size={48} className="text-[#002B5B]" />
          </div>
          <h2 className="text-3xl font-black text-[#1E1E1E] leading-tight tracking-tighter uppercase">
            Complaint <br /> Recorded
          </h2>

          <div className="mt-8 p-6 bg-slate-50 rounded-3xl w-full border border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
              Ledger ID
            </p>
            <p className="text-xl font-black text-[#002B5B] tracking-tight">
              {submittedId ? `#${submittedId.slice(0, 8).toUpperCase()}` : "#LEDGER"}
            </p>
          </div>

          <p className="text-sm text-slate-500 mt-6 leading-relaxed font-medium px-4">
            Your formal grievance has been filed securely. You can monitor the
            investigation progress in your activity archive.
          </p>

          <button
            onClick={() => navigate("/student")}
            className="mt-10 w-full py-5 bg-[#002B5B] text-white rounded-3xl font-black uppercase tracking-widest shadow-lg hover:bg-[#003d82] transition-colors flex items-center justify-center gap-3"
          >
            <ArrowLeft size={18} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* WEB HEADER */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/student")}
            className="flex items-center gap-2 text-slate-400 hover:text-[#002B5B] transition-colors group"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-[11px] font-black uppercase tracking-widest">
              Back to Dashboard
            </span>
          </button>
          <div className="hidden md:flex items-center gap-3">
            <Scale size={16} className="text-slate-300" />
            <h1 className="text-sm font-black text-[#002B5B] uppercase tracking-[0.3em]">
              Service Portal <span className="text-slate-300 mx-2">|</span>{" "}
              Grievance Filing
            </h1>
          </div>
          <div className="w-32" /> {/* Spacer */}
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-12">
        {/* LEFT COLUMN: CONTEXT & PROCESS */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-12">
            <h2 className="text-3xl lg:text-4xl font-black text-[#002B5B] leading-tight tracking-tighter mb-8">
              File a Formal <br /> Grievance.
            </h2>

            <div className="bg-white lg:bg-transparent p-6 lg:p-0 rounded-3xl border border-slate-100 lg:border-none shadow-sm lg:shadow-none">
              <div className="lg:border-l-4 lg:border-[#002B5B] lg:pl-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  Investigation Process
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
                  Upon submission, your complaint is assigned a secure Ledger
                  ID. The Office of the Registrar conducts a preliminary review
                  within 72 business hours.
                </p>

                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 text-[#002B5B] bg-blue-50 p-3 rounded-xl">
                      <FileSearch size={18} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-[#002B5B] uppercase tracking-widest block mb-1">
                        Phase 1
                      </span>
                      <span className="text-sm font-bold text-slate-600">
                        Initial review and categorization
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 text-[#002B5B] bg-blue-50 p-3 rounded-xl">
                      <Database size={18} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-[#002B5B] uppercase tracking-widest block mb-1">
                        Phase 2
                      </span>
                      <span className="text-sm font-bold text-slate-600">
                        Departmental inquiry & data collection
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 text-[#002B5B] bg-blue-50 p-3 rounded-xl">
                      <BellRing size={18} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-[#002B5B] uppercase tracking-widest block mb-1">
                        Phase 3
                      </span>
                      <span className="text-sm font-bold text-slate-600">
                        Formal resolution and notification
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: FORM CONTAINER */}
        <main className="lg:col-span-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-slate-100 min-h-150 flex flex-col justify-between"
          >
            <div className="space-y-8">
              {/* ROW 1: Subject & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 focus-within:border-[#002B5B]/30 focus-within:bg-white transition-all">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">
                    Complaint Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Tuition Overcharge"
                    className="w-full bg-transparent text-sm outline-none font-bold text-[#002B5B] placeholder:text-slate-300 placeholder:font-medium"
                    required
                  />
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 focus-within:border-[#002B5B]/30 focus-within:bg-white transition-all relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">
                    Office Involved
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none font-bold text-[#002B5B] appearance-none pr-8 cursor-pointer"
                    required
                  >
                    <option value="" disabled className="font-medium">
                      Select department...
                    </option>
                    {offices.map((office) => (
                      <option key={office} value={office}>
                        {office}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-6 top-1/2 translate-y-1 text-[#002B5B] pointer-events-none"
                  />
                </div>
              </div>

              {/* ROW 2: Description */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 focus-within:border-[#002B5B]/30 focus-within:bg-white transition-all">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Factual Description
                  </label>
                  <span
                    className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${description.length < 50 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                  >
                    {description.length < 50
                      ? `${description.length}/50 Min`
                      : "Requirement Met"}
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent text-sm h-56 outline-none resize-none leading-relaxed font-medium text-slate-700 placeholder:text-slate-300"
                  placeholder="Please provide a factual, chronological account of the incident or dissatisfaction..."
                  required
                />
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Attach Evidence (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-[#002B5B] hover:border-[#002B5B] transition-colors"
                  >
                    <Camera size={14} />
                    Add Photos
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 bg-blue-50 text-[#002B5B] rounded-lg text-[10px] font-black flex items-center gap-2"
                      >
                        {file.name.slice(0, 16)}
                        <X
                          size={12}
                          className="cursor-pointer"
                          onClick={() => removeFile(i)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ROW 3: Confidentiality */}
              <div
                onClick={() => setConfidential(!confidential)}
                className={`flex items-start gap-5 p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                  confidential
                    ? "border-[#002B5B] bg-blue-50/30"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div
                  className={`mt-0.5 shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-colors duration-300 ${
                    confidential
                      ? "bg-[#002B5B] border-[#002B5B]"
                      : "bg-white border-slate-300"
                  }`}
                >
                  {confidential && (
                    <ShieldCheck
                      size={16}
                      className="text-white animate-in zoom-in duration-200"
                    />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#002B5B] uppercase tracking-tighter">
                    Request Confidentiality
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Check this box if you wish for your identity to remain
                    hidden. Only the lead investigator and the Office of the
                    Registrar will see your details.
                  </p>
                </div>
              </div>
            </div>

            {/* ROW 4: Submit Actions */}
            <div className="pt-10 mt-auto">
              <button
                type="submit"
                disabled={isSubmitting || description.length < 50}
                className="w-full md:w-auto px-12 py-5 bg-[#002B5B] text-white rounded-3xl font-black uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isSubmitting
                  ? "Encrypting & Submitting..."
                  : "Submit Formal Grievance"}
              </button>

              {submitError && (
                <div className="mt-4 flex items-center gap-3 text-red-600 text-sm font-bold bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                  <AlertCircle size={16} />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default NewComplaint;
