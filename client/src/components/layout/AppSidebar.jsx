import React from "react";
import { PlusCircle, GraduationCap } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar({ navItems = [] }) {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLinkClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar className="bg-white border-r" collapsible="icon">
      {/* HEADER */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#002B5B] flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>

          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-[#002B5B]">
                The Academic
              </span>
              <span className="text-sm font-bold text-[#002B5B]">
                Sentinel
              </span>
              <span className="text-[10px] text-gray-400 tracking-wide">
                STUDENT SERVICES PORTAL
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 px-2">
            Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      onClick={handleLinkClick}
                      className={({ isActive }) => `
                        group flex items-center gap-3 px-3 py-2.5 transition-all duration-200 cursor-pointer border-l-2
                        ${
                          isActive
                            ? "border-[#002B5B] bg-gray-50 text-[#002B5B]"
                            : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-[#002B5B]"
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={`h-4 w-4 shrink-0 transition-colors ${
                              isActive
                                ? "text-[#002B5B]"
                                : "text-gray-400 group-hover:text-[#002B5B]"
                            }`}
                          />

                          {!collapsed && (
                            <span className="text-sm font-medium">
                              {item.title}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-3 border-t">
        <Button
          className="w-full bg-[#002B5B] text-white hover:bg-[#001a38] transition-all duration-200 font-medium gap-2 rounded-lg"
          asChild
          onClick={handleLinkClick}
        >
          <Link to="/new-complaint">
            <PlusCircle className="h-4 w-4" />
            {!collapsed && <span>File New Complaint</span>}
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}