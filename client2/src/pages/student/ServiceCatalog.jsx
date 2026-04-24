import React, { useState } from "react";
import { FileText, ChevronRight, Search, LayoutGrid, Info } from "lucide-react";

const ServiceCatalog = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const services = [
    {
      title: "ID Replacement",
      description: "Request a new student identification card.",
    },
    {
      title: "Cafeteria Meal Card",
      description: "Top up or renew your campus meal plan.",
    },
    {
      title: "Hostel Maintenance",
      description: "Report issues with plumbing, electrical, or furniture.",
    },
    {
      title: "Clearance Form",
      description: "Final year student university exit clearance.",
    },
    {
      title: "Grade Report Appeal",
      description: "Submit a formal request for grade reconsideration.",
    },
    {
      title: "Library Access",
      description: "Renew membership or request digital archives.",
    },
  ];

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PAGE HEADER */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#002B5B] rounded-lg">
              <LayoutGrid size={20} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#002B5B] uppercase tracking-tighter">
              Service Catalog
            </h1>
          </div>
          <p className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
            Select an official service category to begin your request
          </p>
        </header>

        {/* SEARCH & UTILITY BAR */}
        <div className="mb-8 max-w-2xl">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#002B5B] transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="What service do you need today? (e.g., 'ID', 'Hostel')"
              className="w-full bg-white border border-slate-100 rounded-2xl py-5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#002B5B]/5 transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CATALOG GRID */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredServices.map((service, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#5B9DFF] hover:shadow-xl hover:-translate-y-1 group transition-all duration-300 relative overflow-hidden"
              >
                {/* Decorative Background Element */}
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#E5F0FF] rounded-full opacity-0 group-hover:opacity-20 transition-opacity" />

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-[#E5F0FF] rounded-2xl group-hover:bg-[#002B5B] transition-colors duration-300">
                      <FileText
                        size={24}
                        className="text-[#5B9DFF] group-hover:text-white transition-colors"
                      />
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-300 group-hover:text-[#002B5B] group-hover:translate-x-1 transition-all"
                    />
                  </div>

                  <h3 className="text-sm font-black text-[#002B5B] uppercase tracking-tight mb-2">
                    {service.title}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                  <span className="text-[9px] font-black text-[#5B9DFF] uppercase tracking-widest">
                    Start Request
                  </span>
                  <div className="h-1 w-1 bg-slate-200 rounded-full" />
                  <span className="text-[9px] font-bold text-slate-300 uppercase">
                    ~5 mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-inner">
            <Info size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-black text-[#002B5B] uppercase">
              Service not found
            </h3>
            <p className="text-slate-400 text-sm">
              Try searching for a different keyword
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCatalog;
