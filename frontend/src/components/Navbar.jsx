import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, Home, BookOpen, Briefcase, ShoppingBag, BarChart2,
  ShieldCheck, Users, Menu, X, ChevronDown, LogOut, User, Settings
} from "lucide-react";
import { useAuth, ROLES } from "../context/AuthContext";

const UserAvatar = ({ user }) => {
  const source = user?.username || user?.email || "U";
  const initial = source.charAt(0).toUpperCase();
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
      style={{ background: "#2D5A27", color: "#F9F6F0" }}
    >
      {initial}
    </div>
  );
};

const NAV_LINKS = {
  [ROLES.USER]: [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/skill-pathway", icon: BookOpen, label: "Skills" },
    { to: "/workshops", icon: BookOpen, label: "Workshops" },
    { to: "/jobs", icon: Briefcase, label: "Jobs" },
    { to: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
  ],
  [ROLES.TRAINER]: [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/trainer/workshops", icon: BookOpen, label: "My Workshops" },
    { to: "/trainer/analytics", icon: BarChart2, label: "Analytics" },
  ],
  [ROLES.ADMIN]: [
    { to: "/admin/approvals", icon: ShieldCheck, label: "Approvals" },
    { to: "/admin/fraud-check", icon: ShieldCheck, label: "Fraud Check" },
    { to: "/admin/users", icon: Users, label: "Users" },
  ],
  [ROLES.RECRUITER]: [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/recruiter/jobs", icon: Briefcase, label: "My Jobs" },
  ],
  [ROLES.SELLER]: [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/seller/products", icon: ShoppingBag, label: "My Products" },
  ],
};

const ProfileDropdown = ({ user, onLogout, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl z-50"
  >
    <div className="p-4 border-b">
      <p className="font-semibold">{user?.username}</p>
      <p className="text-sm text-gray-500">{user?.email}</p>
    </div>

    <Link to="/profile" onClick={onClose} className="block px-4 py-2 hover:bg-gray-100">
      My Profile
    </Link>
    <Link to="/settings" onClick={onClose} className="block px-4 py-2 hover:bg-gray-100">
      Settings
    </Link>

    <button onClick={onLogout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50">
      Logout
    </button>
  </motion.div>
);

export default function Navbar() {
  const { user, role, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const links = NAV_LINKS[role] || NAV_LINKS[ROLES.USER];

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <nav className="sticky top-0 z-40 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <Leaf />
          <span className="font-bold">RuralDev</span>
        </Link>

        {/* Desktop Links */}
        {isAuthenticated && (
          <div className="hidden md:flex gap-4">
            {links.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}>
                <div className={`flex gap-1 ${isActive(to) ? "text-green-600" : ""}`}>
                  <Icon size={16} /> {label}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">

          {isAuthenticated ? (
            <>
              {/* Profile */}
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <UserAvatar user={user} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <ProfileDropdown
                      user={user}
                      onLogout={logout}
                      onClose={() => setDropdownOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Button */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
                {menuOpen ? <X /> : <Menu />}
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && isAuthenticated && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden overflow-hidden"
          >
            {links.map(({ to, label }) => (
              <Link key={to} to={to} className="block px-4 py-2">
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}