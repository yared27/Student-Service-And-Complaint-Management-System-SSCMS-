import React from "react";
import { NavLink } from "react-router-dom";

// We pass 'items' as a prop now to keep it dynamic/reusable
export function BottomNav({ items = [] }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center h-20 px-2 z-50">
      {items.map((item) => {
        // Map the icon component to a Capitalized variable name
        const Icon = item.icon;

        return (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 transition-all duration-200
              w-20 h-14 rounded-xl
              ${
                isActive
                  ? "bg-[#002B5B] text-white shadow-md"
                  : "text-slate-400 hover:text-slate-600"
              }
            `}
          >
            {/* Render the component reference with its props */}
            <Icon className="h-5 w-5" />
            <span className="text-[8px] font-black tracking-widest uppercase">
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
