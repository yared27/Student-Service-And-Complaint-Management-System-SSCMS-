import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  Inbox,
  Clock,
  Trash2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // ✅ MOVE TO STATE (important)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "status",
      title: "ID Replacement Ready",
      desc: "Your ID Replacement request (SSCMS-442) is now ready for pickup at the Registrar's office.",
      time: "2 hours ago",
      unread: true,
      category: "Priority",
    },
    {
      id: 2,
      type: "update",
      title: "Grievance Investigation Started",
      desc: "An investigator has been assigned to your recent complaint #LGR-4492-2026.",
      time: "5 hours ago",
      unread: true,
      category: "Security",
    },
    {
      id: 3,
      type: "system",
      title: "Maintenance Window",
      desc: "The student portal will undergo scheduled maintenance this Sunday from 2:00 AM to 4:00 AM.",
      time: "Yesterday",
      unread: false,
      category: "System",
    },
  ]);

  const tabs = ["all", "unread", "resolved"];

  // ✅ FILTER LOGIC (clean + working)
  const filteredNotifications = notifications.filter((notif) => {
    switch (activeTab) {
      case "unread":
        return notif.unread;
      case "resolved":
        return !notif.unread; // resolved = read
      default:
        return true;
    }
  });

  // ✅ ACTIONS

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const archiveRead = () => {
    setNotifications((prev) => prev.filter((n) => n.unread));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/student")}
            className="flex items-center gap-2 text-slate-400 hover:text-[#002B5B] transition-colors group"
          >
            <ChevronLeft size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest">
              Back to Dashboard
            </span>
          </button>

          <div className="hidden md:block">
            <h1 className="text-sm font-black text-[#002B5B] uppercase tracking-[0.3em]">
              Service Portal | Notification Center
            </h1>
          </div>

          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-12">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-175">
          {/* CONTROL BAR */}
          <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-[#002B5B]">
                <Inbox size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#002B5B] tracking-tight">
                  Alerts & Updates
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  You have {notifications.filter((n) => n.unread).length} unread
                  notifications
                </p>
              </div>
            </div>

            {/* TABS */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? "bg-white text-[#002B5B] shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`group flex items-start gap-6 px-8 py-8 transition-all hover:bg-slate-50/80 cursor-pointer relative ${
                      notif.unread ? "bg-blue-50/20" : "bg-white"
                    }`}
                  >
                    {notif.unread && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5B9DFF]" />
                    )}

                    <div
                      className={`mt-1 p-4 rounded-2xl ${
                        notif.unread
                          ? "bg-white text-[#5B9DFF] shadow-sm"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {notif.type === "status" ? (
                        <CheckCircle2 size={20} />
                      ) : notif.type === "update" ? (
                        <MessageSquare size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            notif.unread
                              ? "bg-blue-100 text-[#002B5B]"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {notif.category}
                        </span>

                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 italic">
                          <Clock size={12} /> {notif.time}
                        </span>
                      </div>

                      <h4
                        className={`text-base font-black ${
                          notif.unread ? "text-[#002B5B]" : "text-slate-500"
                        }`}
                      >
                        {notif.title}
                      </h4>

                      <p className="text-sm text-slate-500 mt-2">
                        {notif.desc}
                      </p>
                    </div>

                    {/* DELETE */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-3 hover:bg-white hover:text-red-500 rounded-xl text-slate-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
                <Bell size={64} />
                <p className="text-sm font-black text-[#002B5B] uppercase">
                  All caught up!
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-6 bg-slate-50/50 border-t flex justify-center md:justify-end gap-4">
            <button
              onClick={archiveRead}
              className="px-6 py-3 text-[11px] font-black uppercase text-slate-400 hover:text-[#002B5B]"
            >
              Archive Read
            </button>

            <button
              onClick={markAllAsRead}
              className="px-8 py-3 bg-white border rounded-xl text-[11px] font-black text-[#002B5B]"
            >
              Mark all as read
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
