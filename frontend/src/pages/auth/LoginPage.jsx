import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Leaf } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login, loading, error, setError } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const validate = () => {
    const e = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = "Valid email required.";
    if (!password) e.password = "Password is required.";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setError(null);
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F9F6F0" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 p-10 flex-shrink-0"
           style={{ background: "#2D5A27" }}>
        <div className="flex items-center gap-2">
          <Leaf size={22} color="#F9F6F0" />
          <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            RuralDev
          </span>
        </div>
        <div>
          <p className="text-white/60 text-sm mb-2 uppercase tracking-wider">Welcome back</p>
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Your craft, your career, your community.
          </h2>
        </div>
        <p className="text-white/50 text-xs">© {new Date().getFullYear()} RuralDev</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Leaf size={20} style={{ color: "#2D5A27" }} />
            <span className="font-bold text-lg" style={{ color: "#2D5A27", fontFamily: "'Playfair Display', Georgia, serif" }}>RuralDev</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-8 shadow-lg" style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
              Sign In
            </h2>
            <p className="text-sm text-gray-500 mb-6">Welcome back to your RuralDev account.</p>

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 rounded-xl text-sm" 
                style={{ background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" }}>
                {successMessage}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8a7a6e" }} />
                  <input type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                    className="w-full rounded-xl py-3 text-sm outline-none"
                    style={{ paddingLeft: 38, paddingRight: 14, background: "#faf7f3",
                      border: `1.5px solid ${fieldErrors.email ? "#C05746" : "#d4c9bc"}`, color: "#2d2d2d" }}
                  />
                </div>
                {fieldErrors.email && <p className="text-xs" style={{ color: "#C05746" }}>{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Password</label>
                  <a href="#" className="text-xs hover:underline" style={{ color: "#2D5A27" }}>Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8a7a6e" }} />
                  <input type={showPass ? "text" : "password"} placeholder="Your password" value={password}
                    onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                    className="w-full rounded-xl py-3 text-sm outline-none"
                    style={{ paddingLeft: 38, paddingRight: 44, background: "#faf7f3",
                      border: `1.5px solid ${fieldErrors.password ? "#C05746" : "#d4c9bc"}`, color: "#2d2d2d" }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#8a7a6e" }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs" style={{ color: "#C05746" }}>{fieldErrors.password}</p>}
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#fdecea", color: "#C05746" }}>
                  {error}
                </div>
              )}

              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "#2D5A27" }}>
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                  : "Sign In"}
              </motion.button>
            </form>
          </motion.div>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to RuralDev?{" "}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: "#2D5A27" }}>
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
