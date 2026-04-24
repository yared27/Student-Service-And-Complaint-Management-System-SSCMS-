import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Settings,
  Monitor,
  Trash2,
  PlusCircle,
  Camera,
  CheckCircle2,
  ArrowRight,
  ClipboardCheck,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import { apiRequest } from "@/lib/api/httpClient";

const NewServiceRequest = () => {
  const navigate = useNavigate();

  // State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Maintenance");
  const [urgency, setUrgency] = useState("Medium");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submittedId, setSubmittedId] = useState("");

  const fileInputRef = useRef(null);

  const categories = [
    { id: "Maintenance", label: "Maintenance", icon: <Settings size={22} /> },
    { id: "IT support", label: "IT support", icon: <Monitor size={22} /> },
    { id: "Cleaning", label: "Cleaning", icon: <Trash2 size={22} /> },
    { id: "Other", label: "Other", icon: <PlusCircle size={22} /> },
  ];

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => setFiles(Array.from(e.target.files || []));
  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      let attachmentUrls = [];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const uploadResponse = await apiRequest("/uploads/images", {
          method: "POST",
          body: formData,
        });

        attachmentUrls = (uploadResponse?.files || []).map((item) => item.url).filter(Boolean);
      }

      const priorityMap = {
        Low: "LOW",
        Medium: "MEDIUM",
        High: "HIGH",
      };

      const requestResponse = await apiRequest("/service-requests", {
        method: "POST",
        body: JSON.stringify({
          title: `${selectedCategory} Service Request`,
          description,
          priority: priorityMap[urgency] || "MEDIUM",
          attachmentUrls,
        }),
      });

      setSubmittedId(requestResponse?.serviceRequest?.id || "");
      setIsSubmitting(false);
      setCurrentStep(4);
    } catch (error) {
      setIsSubmitting(false);
      setSubmitError(error.message || "Failed to submit request.");
    }
  };

  // SUCCESS SCREEN
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-xl animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 mx-auto shadow-inner">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-[#002B5B] uppercase tracking-tighter">
            Request Sent!
          </h2>
          <p className="text-sm text-slate-500 mt-4 leading-relaxed font-medium">
            Your request has been logged successfully. You can track status
            <span className="block font-black text-[#002B5B] mt-1 text-lg">
                {submittedId ? `#${submittedId.slice(0, 8).toUpperCase()}` : "#REQUEST"}
            </span>
          </p>
          <div className="mt-10 space-y-3">
            <button
              onClick={() => navigate("/student")}
              className="w-full py-5 bg-[#002B5B] text-white rounded-3xl font-black uppercase tracking-widest shadow-lg hover:bg-[#003d82] transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-[#002B5B] transition-colors"
            >
              Submit another request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* WEB HEADER */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() =>
              currentStep === 1
                ? navigate("/student")
                : setCurrentStep((prev) => prev - 1)
            }
            className="flex items-center gap-2 text-slate-400 hover:text-[#002B5B] transition-colors group"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-[11px] font-black uppercase tracking-widest">
              {currentStep === 1 ? "Exit Form" : "Previous Step"}
            </span>
          </button>
          <div className="hidden md:block">
            <h1 className="text-sm font-black text-[#002B5B] uppercase tracking-[0.3em]">
              Service Portal <span className="text-slate-300 mx-2">|</span> New
              Submission
            </h1>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-12">
        {/* LEFT COLUMN: PROGRESS STEPPER */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-12">
            <h2 className="text-3xl font-black text-[#002B5B] leading-tight mb-8">
              Let's get this <br /> fixed for you.
            </h2>

            <div className="relative pl-8 space-y-12">
              <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-200" />
              {[
                { step: 1, label: "Classification", desc: "Category & Type" },
                {
                  step: 2,
                  label: "Documentation",
                  desc: "Details & Attachments",
                },
                { step: 3, label: "Final Review", desc: "Verify & Submit" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative flex items-start gap-6"
                >
                  <div
                    className={`absolute -left-8 w-8 h-8 rounded-full border-4 z-10 flex items-center justify-center transition-all duration-500 ${
                      currentStep === item.step
                        ? "bg-[#002B5B] border-blue-100 scale-110 shadow-lg"
                        : currentStep > item.step
                          ? "bg-green-500 border-green-50"
                          : "bg-white border-slate-100"
                    }`}
                  >
                    {currentStep > item.step && (
                      <CheckCircle2 size={14} className="text-white" />
                    )}
                  </div>
                  <div
                    className={
                      currentStep >= item.step ? "opacity-100" : "opacity-30"
                    }
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#002B5B]">
                      Step 0{item.step}
                    </p>
                    <p className="text-lg font-black text-[#002B5B] tracking-tight">
                      {item.label}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: FORM CONTENT */}
        <main className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-slate-100 min-h-150 flex flex-col">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase mb-6 tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#002B5B] rounded-full" />
                    Select Service Category
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-8 rounded-4xl border-2 text-left transition-all duration-300 flex items-center gap-6 ${
                          selectedCategory === cat.id
                            ? "bg-slate-50 border-[#002B5B] ring-4 ring-[#002B5B]/5 shadow-md"
                            : "bg-white border-slate-50 hover:border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div
                          className={`p-4 rounded-2xl ${selectedCategory === cat.id ? "bg-[#002B5B] text-white" : "bg-slate-100 text-slate-400"}`}
                        >
                          {cat.icon}
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest">
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
                <div className="mt-auto pt-10">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full md:w-auto px-12 py-5 bg-[#002B5B] text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                  >
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">
                    Issue Description
                  </h3>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 rounded-3xl p-8 text-sm h-48 outline-none focus:bg-white border-2 border-transparent focus:border-slate-100 transition-all resize-none font-medium leading-relaxed"
                    placeholder="Provide as much detail as possible to help us solve the issue faster..."
                  />
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">
                      Urgency Level
                    </h3>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                      {["Low", "Medium", "High"].map((l) => (
                        <button
                          key={l}
                          onClick={() => setUrgency(l)}
                          className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${urgency === l ? "bg-white text-[#002B5B] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">
                      Media Attachments
                    </h3>
                    <div
                      onClick={handleUploadClick}
                      className="flex items-center gap-4 p-5 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-[#002B5B] hover:bg-slate-50 transition-all group"
                    >
                      <div className="p-3 rounded-xl bg-slate-100 text-slate-400 group-hover:text-[#002B5B] transition-colors">
                        <Camera size={20} />
                      </div>
                      <span className="text-[10px] font-black text-[#002B5B] uppercase">
                        Upload Photos
                      </span>
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
                            {file.name.slice(0, 10)}...
                            <X
                              size={12}
                              className="cursor-pointer"
                              onClick={() => removeFile(i)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                <div className="pt-10">
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!description}
                    className="w-full md:w-auto px-12 py-5 bg-[#002B5B] text-white rounded-3xl font-black uppercase tracking-widest disabled:opacity-50 hover:shadow-xl transition-all"
                  >
                    Review Submission
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-50 rounded-4xl p-10 border border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      <ClipboardCheck className="text-[#002B5B]" size={28} />
                    </div>
                    <h3 className="text-xl font-black text-[#002B5B] uppercase tracking-tighter">
                      Verify Submission
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Type
                      </p>
                      <p className="text-sm font-black text-[#002B5B] uppercase">
                        {selectedCategory}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Priority
                      </p>
                      <p
                        className={`text-sm font-black uppercase ${urgency === "High" ? "text-red-500" : "text-orange-500"}`}
                      >
                        {urgency}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Attachments
                      </p>
                      <p className="text-sm font-black text-[#002B5B] uppercase">
                        {files.length} Files
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      Description
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                      "{description}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="w-full md:flex-1 py-6 bg-[#002B5B] text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-[#003d82] transition-all flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? "Processing..." : "Confirm & Send Request"}
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full md:w-auto px-8 py-6 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Edit Details
                  </button>
                </div>

                {submitError && (
                  <div className="flex items-center gap-3 text-red-600 text-sm font-bold bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewServiceRequest;
