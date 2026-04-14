import {
  LayoutDashboard,
  BookOpen,
  History,
  Users,
  Settings,
  Home,
  Bell,
  User,
} from "lucide-react";

// --- STUDENT CONFIG ---
export const studentNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Service Catalog", url: "/catalog", icon: BookOpen },
  { title: "My Complaints", url: "/complaints", icon: Users },
  { title: "My Requests", url: "/requests", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
];

export const studentBottomNav = [
  { icon: Home, label: "HOME", to: "/" },
  { icon: BookOpen, label: "CATALOG", to: "/catalog" },
  { icon: Bell, label: "ALERTS", to: "/notifications" },
  { icon: User, label: "PROFILE", to: "/profile" },
];

export const studentTopLinks = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Catalog", path: "/catalog", icon: BookOpen },
  { name: "Directory", path: "/directory", icon: Users },
];