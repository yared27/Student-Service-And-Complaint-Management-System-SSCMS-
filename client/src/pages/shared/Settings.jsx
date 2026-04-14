import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Bell,
  Shield,
  ChevronLeft,
  User,
  Lock,
  Globe,
  Moon,
  Info,
  Icon,
  ChevronRight,
} from "lucide-react";

// 1. MOVE THIS OUTSIDE: This prevents React from re-creating the component on every render.
const SettingRow = ({
  icon: Icon,
  label,
  value,
  onClick,
  isToggle,
  active,
}) => (
  <div
    onClick={onClick}
    className="p-5 flex items-center justify-between border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50/80 transition-colors"
  >
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-slate-50 text-[#002B5B] rounded-xl">
        <Icon size={18} />
      </div>
      <span className="text-sm font-bold text-[#002B5B]">{label}</span>
    </div>

    {isToggle ? (
      <div
        className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${active ? "bg-[#5B9DFF]" : "bg-slate-200"}`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${active ? "right-1" : "left-1"}`}
        />
      </div>
    ) : (
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {value}
          </span>
        )}
        <ChevronRight size={16} className="text-slate-300" />
      </div>
    )}
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-[#002B5B]" />
          </button>
          <h1 className="text-[11px] font-black text-[#002B5B] uppercase tracking-[0.2em]">
            Application Settings
          </h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* ACCOUNT SECTION */}
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
          Account Security
        </h3>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
          <SettingRow
            icon={User}
            label="Profile Information"
            value="Editable"
            onClick={() => navigate("/profile")}
          />
          <SettingRow icon={Lock} label="Change Password" />
          <SettingRow icon={Globe} label="Language" value="English" />
        </div>

        {/* PREFERENCES SECTION */}
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
          Preferences
        </h3>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
          <SettingRow
            icon={Bell}
            label="Push Notifications"
            isToggle
            active={notifications}
            onClick={() => setNotifications(!notifications)}
          />
          <SettingRow
            icon={Moon}
            label="Dark Appearance"
            isToggle
            active={darkMode}
            onClick={() => setDarkMode(!darkMode)}
          />
        </div>

        {/* INFO SECTION */}
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
          System Info
        </h3>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
          <SettingRow icon={Shield} label="Privacy Policy" />
          <SettingRow icon={Info} label="Terms of Service" />
          <div className="p-5 flex items-center justify-between bg-slate-50/50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Version
            </span>
            <span className="text-[10px] font-black text-[#5B9DFF]">
              V 2.0.4-BETA
            </span>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="p-2 border-2 border-dashed border-red-100 rounded-[2.5rem]">
          <button
            className="w-full p-5 flex items-center justify-center gap-3 text-red-500 bg-red-50/50 hover:bg-red-50 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all"
            onClick={() => window.confirm("Are you sure?") && navigate("/")}
          >
            <LogOut size={18} /> Sign Out of Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
