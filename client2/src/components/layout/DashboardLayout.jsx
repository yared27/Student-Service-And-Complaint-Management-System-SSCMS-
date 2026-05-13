import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, LogOut, Search, LayoutDashboard, Settings, UserRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api/httpClient";

const NOTIFICATION_ROLES = new Set(["student", "field_staff", "staff", "complaint_manager", "service_manager", "investigator"]);
const SUPPORT_ROLES = new Set(["student", "field_staff", "staff", "complaint_manager"]);

const ROLE_NAV = {
  student: [
    { to: "/student/dashboard", label: "Dashboard", end: true },
    { to: "/student/complaints", label: "My Complaints" },
    { to: "/student/requests", label: "My Requests" },
    { to: "/student/request/new", label: "New Request" },
    { to: "/student/complaint/new", label: "New Complaint" },
    { to: "/support", label: "Support" },
  ],
  investigator: [
    { to: "/investigator/dashboard", label: "Assigned Complaints", end: true },
    { to: "/investigator/tasks", label: "Investigation Tasks" },
  ],
  field_staff: [
    { to: "/field-staff/dashboard", label: "Tasks", end: true },
    { to: "/support", label: "Support" },
  ],
  service_manager: [
    { to: "/service-manager/dashboard", label: "Dashboard", end: true },
    { to: "/service-manager/requests", label: "Requests" },
    { to: "/service-manager/reports", label: "Reports" },
    { to: "/service-manager/staff-management", label: "Field Staff" },
  ],
  complaint_manager: [
    { to: "/complaint-manager/dashboard", label: "Dashboard", end: true },
    { to: "/complaint-manager/complaints", label: "Complaints" },
    { to: "/complaint-manager/investigators", label: "Investigators" },
    { to: "/support", label: "Support" },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", end: true },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/import-students", label: "Student Import" },
    { to: "/admin/analytics/logs", label: "Logs" },
  ],
};

function normalizeRole(role) {
  const normalized = String(role || "student").trim().toLowerCase();
  if (normalized === "staff") {
    return "field_staff";
  }

  if (normalized === "investigator") {
    return "investigator";
  }

  return normalized;
}

function getUserSummary(user) {
  if (!user) {
    return { name: "Guest", meta: "Not signed in" };
  }

  const name = user.name || user.username || "User";
  const role = String(user.role || "").replaceAll("_", " ").toUpperCase();
  const dept = user.department || user.dept || "";
  const meta = [role, dept, user.username].filter(Boolean).join(" · ");

  return { name, meta };
}

export default function DashboardLayout({
  children,
  role = "student",
  user,
  topLinks = [],
  showSearch = false,
  searchPlaceholder = "Search...",
  onSearch = null,
  title,
  subtitle,
  action,
}) {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const navRole = normalizeRole(role);
  const navItems = ROLE_NAV[navRole] || ROLE_NAV.student;
  const canUseNotifications = NOTIFICATION_ROLES.has(navRole);
  const { name, meta } = getUserSummary(authUser || user);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const sidebarUtilityLinks = [
    { to: "/profile", label: "Profile", icon: UserRound },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  async function refreshUnreadCount() {
    if (!canUseNotifications) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await apiRequest("/notifications/unread-count");
      setUnreadCount(Number(response?.count || 0));
    } catch {
      setUnreadCount(0);
    }
  }

  useEffect(() => {
    refreshUnreadCount();

    const handleNotificationsUpdated = () => refreshUnreadCount();
    const handleWindowFocus = () => refreshUnreadCount();

    window.addEventListener("sscms-notifications-updated", handleNotificationsUpdated);
    window.addEventListener("focus", handleWindowFocus);

    const intervalId = window.setInterval(refreshUnreadCount, 30000);

    return () => {
      window.removeEventListener("sscms-notifications-updated", handleNotificationsUpdated);
      window.removeEventListener("focus", handleWindowFocus);
      window.clearInterval(intervalId);
    };
  }, [canUseNotifications]);

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return;
    }

    if (typeof onSearch === "function") {
      onSearch(query);
      setSearchQuery("");
      return;
    }

    const searchableItems = [
      ...navItems,
      ...sidebarUtilityLinks,
    ];

    const matchedItem = searchableItems.find((item) => {
      const label = String(item.label || "").toLowerCase();
      const path = String(item.to || "").toLowerCase();
      return label.includes(query) || path.includes(query);
    });

    if (matchedItem) {
      navigate(matchedItem.to);
      setSearchQuery("");
    }
  };

  return (
    <div className="min-h-screen flex bg-soft">
      <aside className="hidden lg:flex w-72 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <Logo light />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-card"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pb-4 pt-2 border-t border-sidebar-border space-y-1">
          <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/50">
            Account
          </p>
          {sidebarUtilityLinks.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-card"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>

      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border">
          <div className="px-6 lg:px-10 py-4 flex items-center gap-4">
            <div className="lg:hidden">
              <Logo />
            </div>

            {showSearch ? (
              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-9 h-10 bg-secondary border-0"
                    placeholder={searchPlaceholder}
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm">
                  Search
                </Button>
              </form>
            ) : (
              <div className="flex-1" />
            )}

            <div className="ml-auto flex items-center gap-2">
              {canUseNotifications ? (
                <Button variant="ghost" size="icon" onClick={() => navigate("/notifications")} className="relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="inline-flex items-center gap-2 text-destructive hover:text-destructive">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium leading-tight">{name}</div>
                  <div className="text-xs text-muted-foreground">{meta || "User"}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center font-display font-bold text-accent-foreground">
                  {name.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {(title || subtitle || action) ? (
          <div className="px-6 lg:px-10 pt-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                {title ? <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{title}</h1> : null}
                {subtitle ? <p className="text-muted-foreground mt-1.5">{subtitle}</p> : null}
              </div>
              {action}
            </div>
          </div>
        ) : null}

        <div className="px-6 lg:px-10 py-8 flex flex-col gap-8 flex-1">{children}</div>
      </main>
    </div>
  );
}