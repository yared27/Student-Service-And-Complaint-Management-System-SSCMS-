import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  Mail,
  Shield,
  Key,
  Edit3,
  Briefcase,
  LogOut,
  Bell,
  Settings,
} from "lucide-react";
// Assuming currentUser comes from your mockData
import { currentUser } from "@/data/mockData";

const Profile = () => {
  const navigate = useNavigate();

  // Dynamic styling based on user role
  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case "student":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "service manager":
        return "bg-blue-50 text-[#002B5B] border-blue-100";
      case "field staff":
        return "bg-orange-50 text-orange-600 border-orange-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // Fallbacks applied for visualization
  const name = currentUser?.name || "Ana Mohammed";
  const id = currentUser?.id || "AMU-2026-SE";
  const role = currentUser?.role || "Student";
  const department = currentUser?.department || "Software Engineering";
  const email = currentUser?.email || "ana.mohammed@amu.edu.et";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans pb-20">
      {/* WEB HEADER */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-[#002B5B] transition-colors group"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-[11px] font-black uppercase tracking-widest">
              Back
            </span>
          </button>
          <div className="hidden md:block">
            <h1 className="text-sm font-black text-[#002B5B] uppercase tracking-[0.3em]">
              Service Portal <span className="text-slate-300 mx-2">|</span>{" "}
              Account Profile
            </h1>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* TOP IDENTITY CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
          {/* Banner Background */}
          <div className="h-40 bg-linear-to-r from-[#002B5B] to-[#004080] relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white to-transparent" />
          </div>

          <div className="px-8 lg:px-12 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 relative z-10">
              {/* Avatar & Name */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                <div className="relative">
                  <div className="h-32 w-32 bg-white rounded-4xl p-2 shadow-xl rotate-3 transition-transform hover:rotate-0 duration-300">
                    <div className="h-full w-full bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                      <User size={48} className="text-slate-300" />
                    </div>
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-3 bg-[#5B9DFF] text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-500 transition-colors hover:-translate-y-1">
                    <Edit3 size={16} />
                  </button>
                </div>

                <div className="mb-2">
                  <h2 className="text-3xl font-black text-[#002B5B] tracking-tight mb-1">
                    {name}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      ID: {id}
                    </p>
                    <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getRoleBadge(role)}`}
                    >
                      <Shield size={12} /> {role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-[#002B5B] transition-colors">
                  <Settings size={20} />
                </button>
                <button className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Institutional Details */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#002B5B] rounded-full" />
              Institutional Information
            </h3>

            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="p-4 bg-blue-50/50 rounded-2xl text-[#002B5B]">
                  <Briefcase size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Department / Faculty
                  </p>
                  <p className="text-base font-black text-[#002B5B]">
                    {department}
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-slate-100" />

              <div className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="p-4 bg-blue-50/50 rounded-2xl text-[#002B5B]">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Official Email
                  </p>
                  <p className="text-base font-black text-[#002B5B]">{email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account & Security */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-300 rounded-full" />
              Security & Preferences
            </h3>

            <div className="space-y-4 flex-1">
              <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-[#002B5B] group-hover:shadow-md transition-all duration-300">
                    <Key
                      size={18}
                      className="text-slate-500 group-hover:text-white transition-colors"
                    />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-black text-[#002B5B] mb-0.5">
                      Change Password
                    </span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Update your security key
                    </span>
                  </div>
                </div>
                <ChevronLeft
                  size={18}
                  className="text-slate-300 rotate-180 group-hover:text-[#002B5B] transition-colors group-hover:translate-x-1"
                />
              </button>

              <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-[#002B5B] group-hover:shadow-md transition-all duration-300">
                    <Bell
                      size={18}
                      className="text-slate-500 group-hover:text-white transition-colors"
                    />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-black text-[#002B5B] mb-0.5">
                      Notification Settings
                    </span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Manage email & portal alerts
                    </span>
                  </div>
                </div>
                <ChevronLeft
                  size={18}
                  className="text-slate-300 rotate-180 group-hover:text-[#002B5B] transition-colors group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
