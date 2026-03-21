// src/Navbar.jsx
import React, { useState, useEffect } from "react";

const NAV_LINKS = [
  { id: "home", label: "Home", icon: "⬡" },
  { id: "jobs", label: "Jobs", icon: "◈" },
  { id: "workshops", label: "Workshops", icon: "◉" },
  { id: "marketplace", label: "Market", icon: "◫" },
  { id: "dashboard", label: "Dashboard", icon: "◎" },
  { id: "admin", label: "Admin", icon: "◬" },
];

export default function Navbar({ currentPage, setCurrentPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const go = (id) => {
    setCurrentPage(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "bg-night-900/95 backdrop-blur-xl border-b border-white/8 py-3"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => go("home")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center text-night-950 text-sm font-bold shadow-glow group-hover:scale-110 transition-transform duration-200">
              S
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-sm font-bold text-white">
                Skill<span className="text-saffron-400">→</span>Trust<span className="text-saffron-400">→</span>Income
              </span>
              <span className="text-[9px] text-ink-muted font-ui tracking-widest uppercase">
                Rural Earning Ecosystem
              </span>
            </div>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={`nav-link ${currentPage === link.id ? "active" : ""}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => go("dashboard")}
              className="hidden sm:flex w-8 h-8 rounded-full bg-night-700 border border-white/10 items-center justify-center text-sm hover:border-saffron-500/40 transition-colors"
              title="Dashboard"
            >
              👩‍🎨
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-9 h-9 rounded-xl bg-night-700 border border-white/10 flex items-center justify-center text-ink hover:border-saffron-500/30 transition-colors"
              aria-label="Toggle menu"
            >
              <span className="text-lg leading-none">
                {mobileOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden mt-2 mx-4 rounded-2xl bg-night-800 border border-white/8 overflow-hidden shadow-card animate-fade-in"
          >
            {NAV_LINKS.map((link, i) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-medium font-ui transition-colors
                  ${
                    currentPage === link.id
                      ? "bg-saffron-500/10 text-saffron-400 border-l-2 border-saffron-500"
                      : "text-ink-dim hover:bg-white/4 hover:text-ink border-l-2 border-transparent"
                  }
                  ${i > 0 ? "border-t border-white/5" : ""}
                `}
              >
                <span className="text-base opacity-60">{link.icon}</span>
                {link.label}
                {currentPage === link.id && (
                  <span className="ml-auto text-xs text-saffron-500">●</span>
                )}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Spacer so content doesn't hide under fixed nav */}
      <div className="h-16" />
    </>
  );
}
