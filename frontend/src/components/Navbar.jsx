import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, Home, BookOpen, Briefcase, ShoppingBag, BarChart2,
  ShieldCheck, Users, Menu, X, ChevronDown, LogOut, User, Settings
} from "lucide-react";
import { useAuth, ROLES } from "../context/AuthContext";

// ─── Nav Link Definition by Role ──────────────────────────────────────────────
const NAV_LINKS = {
  [ROLES.USER]: [
    { to: "/home",          icon: Home,       label: "Home" },
    { to: "/skill-pathway", icon: BookOpen,   label: "Skills" },
    { to: "/workshops",     icon: BookOpen,   label: "Workshops" },
    { to: "/jobs",          icon: Briefcase,  label: "Jobs" },
    { to: "/marketplace",   icon: ShoppingBag,label: "Marketplace" },
  ],
  [ROLES.TRAINER]: [
    { to: "/home",                icon: Home,       label: "Home" },
    { to: "/trainer/workshops",   icon: BookOpen,   label: "My Workshops" },
    { to: "/trainer/analytics",   icon: BarChart2,  label: "Analytics" },
  ],
  [ROLES.ADMIN]: [
    { to: "/admin/approvals",   icon: ShieldCheck,  label: "Approvals" },
    { to: "/admin/fraud-check", icon: ShieldCheck,  label: "Fraud Check" },
    { to: "/admin/users",       icon: Users,        label: "Users" },
  ],
  [ROLES.RECRUITER]: [
    { to: "/home",            icon: Home,      label: "Home" },
    { to: "/recruiter/jobs",  icon: Briefcase, label: "My Jobs" },
  ],
  [ROLES.SELLER]: [
    { to: "/home",              icon: Home,        label: "Home" },
    { to: "/seller/products",   icon: ShoppingBag, label: "My Products" },
  ],
};

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
const ProfileDropdown = ({ user, onLogout, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 8, scale: 0.96 }}
    transition={{ duration: 0.18 }}
    className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-xl z-50"
    style={{ background: "#fff", border: "1px solid #e8e0d5" }}
  >
    {/* User info */}
    <div className="px-4 py-3 border-b" style={{ borderColor: "#f0ebe3", background: "#faf7f3" }}>
      <p className="font-semibold text-sm text-gray-800">{user?.username || "User"}</p>
      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#eaf3e8", color: "#2D5A27" }}>
        {user?.role}
      </span>
    </div>

    {/* Actions */}
    <div className="py-1">
      {[
        { to: "/profile", icon: User, label: "My Profile" },
        { to: "/settings", icon: Settings, label: "Settings" },
      ].map(({ to, icon: Icon, label }) => (
        <Link key={to} to={to} onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Icon size={15} style={{ color: "#8a7a6e" }} /> {label}
        </Link>
      ))}
    </div>

    <div className="border-t py-1" style={{ borderColor: "#f0ebe3" }}>
      <button onClick={onLogout}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors hover:bg-red-50"
        style={{ color: "#C05746" }}>
        <LogOut size={15} /> Sign Out
      </button>
    </div>
  </motion.div>
);

// ─── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, role, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const links = NAV_LINKS[role] || NAV_LINKS[ROLES.USER];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md"
         style={{ background: "rgba(249,246,240,0.92)", borderBottom: "1px solid #e8e0d5" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: "#2D5A27" }}>
              <Leaf size={18} color="#F9F6F0" />
            </div>
            <span className="font-bold text-lg hidden sm:block"
                  style={{ color: "#2D5A27", fontFamily: "'Playfair Display', Georgia, serif" }}>
              RuralDev
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: isActive(to) ? "#eaf3e8" : "transparent",
                    color: isActive(to) ? "#2D5A27" : "#5a4a3a",
                  }}>
                  <Icon size={15} /> {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {([ROLES.ADMIN, ROLES.TRAINER, ROLES.RECRUITER, ROLES.SELLER].includes(role)) && (
                <Link to={
                  role === ROLES.ADMIN ? "/admin/approvals" :
                  role === ROLES.TRAINER ? "/trainer/workshops" :
                  role === ROLES.RECRUITER ? "/recruiter/jobs" :
                  role === ROLES.SELLER ? "/seller/products" :
                  "/home"
                }
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2D5A27] text-white text-sm font-semibold hover:bg-[#25461f] transition-colors"
                >
                  Dashboard
                </Link>
              )}

              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-gray-100">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                       style={{ background: "#C05746" }}>
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.username || "Me"}
                  </span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <ProfileDropdown user={user} onLogout={logout} onClose={() => setDropdownOpen(false)} />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ color: "#2D5A27" }}>
                  Sign In
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#2D5A27" }}>
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-xl" style={{ color: "#2D5A27" }}>
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && isAuthenticated && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden pb-4">
              <div className="space-y-1 pt-2">
                {links.map(({ to, icon: Icon, label }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{
                      background: isActive(to) ? "#eaf3e8" : "transparent",
                      color: isActive(to) ? "#2D5A27" : "#5a4a3a",
                    }}>
                    <Icon size={18} /> {label}
                  </Link>
                ))}
                <button onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ color: "#C05746" }}>
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}