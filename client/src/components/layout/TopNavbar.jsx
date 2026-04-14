import React from "react";
import {
  Menu,
  HelpCircle,
  Languages,
  Sun,
  Bell,
  LogOut,
  User,
  LayoutDashboard,
  Archive,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { currentUser } from "@/data/mockData";
import { Link, useNavigate, useLocation } from "react-router-dom";

export function TopNavbar({ links = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <header className="h-16 bg-white dark:bg-slate-950 sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3 h-full">
        {/* State 1: Mobile (< 768px) */}
        <div className="flex items-center gap-3 md:hidden">
          <SidebarTrigger>
            <Button variant="ghost" size="icon" className="hover:bg-slate-100">
              <Menu className="h-5 w-5" />
            </Button>
          </SidebarTrigger>
          <span className="font-display font-black text-primary text-sm tracking-tight uppercase">
            The Academic Sentinel
          </span>
        </div>

        {/* State 2 & 3: Tablet & Desktop (>= 768px) */}
        <div className="hidden md:flex items-center gap-6 h-full">
          {/* Brand title that replaces the menu icon at 768px */}
          <span className="font-display font-black text-primary text-lg tracking-tight uppercase">
            SSCMS
          </span>

          {/* Nav Links: Shown only after 1024px (lg) */}
          <nav className="hidden lg:flex items-center gap-2 h-full">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={` flex items-center px-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                    isActive
                      ? "text-[#002B5B]"
                      : "text-slate-400 hover:text-primary"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#002B5B] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* RIGHT SECTION: Icons + Avatar (Unchanged) */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1 border-r pr-2 border-slate-100">
          <Button variant="ghost" size="icon" className="text-slate-500">
            <Languages size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500"
            onClick={() => navigate("/support")}
          >
            <HelpCircle size={18} />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 hover:bg-slate-100"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full border-2 border-white"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 px-0 lg:px-3 flex items-center gap-3 hover:bg-slate-50 rounded-full"
            >
              <div className="hidden lg:flex flex-col items-end text-right">
                <p className="text-[11px] font-black text-[#002B5B] uppercase leading-none">
                  {currentUser.name}
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                  ID: {currentUser.id}
                </p>
              </div>
              <Avatar className="h-9 w-9 border border-primary/10">
                <AvatarFallback className="bg-primary text-white text-xs font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 mt-2 rounded-2xl p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50"
          >
            <DropdownMenuLabel className="font-normal p-3 lg:hidden">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  ID: {currentUser.id}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="lg:hidden" />
            <DropdownMenuGroup className="p-1">
              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase">
                    My Account
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer hover:bg-slate-50">
                <Sun className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase">
                  Toggle Theme
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="p-1">
              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-xl text-destructive hover:bg-destructive/5 cursor-pointer">
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Sign out
                </span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
