// src/App.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import WorkshopsPage from "./pages/WorkshopsPage";
import MarketplacePage from "./pages/MarketplacePage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import "./index.css";

/**
 * App
 * Handles page-level routing using simple state.
 * No react-router needed — this is a SPA with client-side page switching.
 */
function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage setCurrentPage={setCurrentPage} />;
      case "jobs":
        return <JobsPage setCurrentPage={setCurrentPage} />;
      case "workshops":
        return <WorkshopsPage />;
      case "marketplace":
        return <MarketplacePage />;
      case "dashboard":
        return <DashboardPage setCurrentPage={setCurrentPage} />;
      case "admin":
        return <AdminPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-night-900">
      {/* Persistent navigation */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Page content with fade-in transition */}
      <main
        key={currentPage}
        style={{ animation: "fadeIn 0.35s ease forwards" }}
      >
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-night-950 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center text-night-950 font-bold text-sm">
                S
              </div>
              <div>
                <div className="font-display text-sm font-bold text-white">
                  Skill<span className="text-saffron-400">→</span>Trust<span className="text-saffron-400">→</span>Income
                </div>
                <div className="text-[10px] text-ink-muted font-ui tracking-widest uppercase">
                  Rural Earning Ecosystem
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              {["Home", "Jobs", "Workshops", "Market", "Dashboard", "Admin"].map((label, i) => {
                const ids = ["home", "jobs", "workshops", "marketplace", "dashboard", "admin"];
                return (
                  <button
                    key={label}
                    onClick={() => setCurrentPage(ids[i])}
                    className="text-xs text-ink-muted hover:text-saffron-400 font-ui transition-colors"
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Attribution */}
            <div className="text-xs text-ink-muted font-ui text-center md:text-right">
              <div>Made with 🌿 for rural India</div>
              <div className="mt-0.5 opacity-60">Backend: http://127.0.0.1:5000</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
