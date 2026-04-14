import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet } from "react-router-dom"; // Add this
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";
import { BottomNav } from "./BottomNav";

export function AppLayout({ navItems, bottomNavItems, topNavLinks, hideSidebar = false }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background mb-16 md:mb-0">
          {!hideSidebar && (
            <div className="hidden md:flex">
              <AppSidebar navItems={navItems} />
            </div>
          )}
          <div className="flex-1 flex flex-col min-w-0">
            <TopNavbar hideSidebar={hideSidebar} links={topNavLinks} />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {/* Outlet renders the matched child route component */}
                <Outlet />
              </div>
            </main>
          </div>
          <BottomNav items={bottomNavItems} />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
