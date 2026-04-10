import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function AuthLayout({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("sscms-theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    localStorage.setItem("sscms-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const themeClass = darkMode ? "auth-theme-dark" : "auth-theme-light";

  return (
    <main className={`auth-layout ${themeClass} relative min-h-screen overflow-hidden px-4 py-8 transition-colors sm:px-6 lg:px-8`}>
      <div className="auth-layout-overlay pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <button
          type="button"
          onClick={() => setDarkMode((v) => !v)}
          className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-10">
          <aside className="hidden auth-surface rounded-2xl border border-white/70 p-10 shadow-[0_20px_40px_rgba(15,23,42,0.1)] transition-colors lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold tracking-[0.22em] text-slate-500">SSCMS</p>
                <h2 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
                  Student Service & Complaint Management System
                </h2>
              </div>
              <p className="max-w-md text-base leading-7 text-slate-600">
                Secure access for Arba Minch University students and campus staff with a clean, trustworthy authentication experience.
              </p>
            </div>

            <div className="review-note rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-600">
              Complaints are first reviewed by Student Union members.
            </div>
          </aside>

          <div className="flex items-center justify-center">{children}</div>
        </div>
      </div>

      <footer className="relative mt-6 text-center text-xs text-slate-500">
        © 2026 SSCMS. All rights reserved.
      </footer>
    </main>
  );
}
