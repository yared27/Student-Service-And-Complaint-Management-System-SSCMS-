import { NavLink, useNavigate } from "react-router-dom";
import { Bell, LogOut, Search, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const ROLE_NAV = {
  student: [
    { to: "/student", label: "Dashboard", end: true },
    { to: "/student/service-request", label: "Service Request" },
    { to: "/student/complaint-submission", label: "Complaint" },
  ],
  field_staff: [{ to: "/field-staff", label: "Dashboard", end: true }],
  service_manager: [{ to: "/service-manager", label: "Dashboard", end: true }],
  complaint_manager: [{ to: "/complaint-manager", label: "Dashboard", end: true }],
  investigator: [{ to: "/investigator", label: "Dashboard", end: true }],
  admin: [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/logs", label: "Logs" },
  ],
};

function normalizeRole(role) {
  return String(role || "student").trim().toLowerCase();
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
  title,
  subtitle,
  action,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const navRole = normalizeRole(role);
  const navItems = ROLE_NAV[navRole] || ROLE_NAV.student;
  const { name, meta } = getUserSummary(user);

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
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

        <div className="p-4 border-t border-sidebar-border space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition-smooth">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition-smooth"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border">
          <div className="px-6 lg:px-10 py-4 flex items-center gap-4">
            <div className="lg:hidden">
              <Logo />
            </div>

            {showSearch ? (
              <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9 h-10 bg-secondary border-0" placeholder={searchPlaceholder} />
                </div>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/notifications")} className="hidden sm:inline-flex">
                Notifications
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="hidden sm:inline-flex">
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/settings")} className="hidden md:inline-flex">
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/support-center")} className="hidden md:inline-flex">
                Support
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
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

        {(title || subtitle || action || topLinks.length > 0) ? (
          <div className="px-6 lg:px-10 pt-6">
            {topLinks.length > 0 ? (
              <div className="mb-6 flex flex-wrap gap-2">
                {topLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            ) : null}

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