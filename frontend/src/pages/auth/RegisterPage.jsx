import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ChevronRight, Leaf } from "lucide-react";
import { useAuth, ROLES } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const ROLE_OPTIONS = [
  { value: ROLES.USER,      label: "Artisan / Learner",   desc: "Learn skills & find work",      emoji: "🧵" },
  { value: ROLES.TRAINER,   label: "Trainer / Mentor",    desc: "Teach workshops & track impact", emoji: "🎓" },
  { value: ROLES.RECRUITER, label: "Recruiter",           desc: "Post jobs & hire rural talent",  emoji: "💼" },
  { value: ROLES.SELLER,    label: "Seller",              desc: "List & sell crafts online",      emoji: "🛍️" },
];

// ─── Step Indicator ────────────────────────────────────────────────────────────
const StepDots = ({ current, total }) => (
  <div className="flex items-center gap-2 justify-center mb-8">
    {Array(total).fill(0).map((_, i) => (
      <motion.div key={i} layout
        className="rounded-full"
        animate={{
          width: i === current ? 28 : 8,
          background: i <= current ? "#2D5A27" : "#d4c9bc",
        }}
        style={{ height: 8 }}
      />
    ))}
  </div>
);

// ─── Input Field ──────────────────────────────────────────────────────────────
const Field = ({ icon: Icon, label, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium" style={{ color: "#4a3728" }}>{label}</label>
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8a7a6e" }} />}
      <input
        {...props}
        className="w-full rounded-xl py-3 text-sm outline-none transition-all"
        style={{
          paddingLeft: Icon ? 38 : 14,
          paddingRight: 14,
          background: "#fff",
          border: `1.5px solid ${error ? "#C05746" : "#d4c9bc"}`,
          color: "#2d2d2d",
        }}
      />
    </div>
    {error && <p className="text-xs" style={{ color: "#C05746" }}>{error}</p>}
  </div>
);

// ─── Step 1: Credentials + Role ───────────────────────────────────────────────
const StepCredentials = ({ data, setData, errors, onNext }) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <motion.div key="step1"
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}>
      <h2 className="text-2xl font-bold mb-1" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
        Create Your Account
      </h2>
      <p className="text-sm text-gray-500 mb-6">Join the RuralDev ecosystem</p>

      <div className="space-y-4">
        <Field icon={Mail} label="Email Address" type="email" placeholder="you@example.com"
          value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })}
          error={errors.email} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8a7a6e" }} />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full rounded-xl py-3 text-sm outline-none"
              style={{ paddingLeft: 38, paddingRight: 44, background: "#fff",
                border: `1.5px solid ${errors.password ? "#C05746" : "#d4c9bc"}`, color: "#2d2d2d" }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#8a7a6e" }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs" style={{ color: "#C05746" }}>{errors.password}</p>}
        </div>

        <div>
          <p className="text-sm font-medium mb-3" style={{ color: "#4a3728" }}>I am a…</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((r) => (
              <button key={r.value} type="button"
                onClick={() => setData({ ...data, role: r.value })}
                className="p-3 rounded-xl text-left transition-all border-2"
                style={{
                  borderColor: data.role === r.value ? "#2D5A27" : "#e8e0d5",
                  background: data.role === r.value ? "#eaf3e8" : "#fff",
                }}>
                <span className="text-xl block mb-1">{r.emoji}</span>
                <p className="text-xs font-bold" style={{ color: "#2d2d2d" }}>{r.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>
          {errors.role && <p className="text-xs mt-1" style={{ color: "#C05746" }}>{errors.role}</p>}
        </div>

        <motion.button type="button" onClick={onNext} whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 mt-2"
          style={{ background: "#2D5A27" }}>
          Continue <ChevronRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Step 2: Confirm & Submit ─────────────────────────────────────────────────
const StepConfirm = ({ data, onBack, onSubmit, loading, error }) => (
  <motion.div key="step2"
    initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
    transition={{ duration: 0.3 }}>
    <h2 className="text-2xl font-bold mb-1" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
      Confirm & Sign Up
    </h2>
    <p className="text-sm text-gray-500 mb-6">Review your details before creating your account.</p>

    <div className="rounded-xl p-4 mb-6 space-y-3" style={{ background: "#f0ebe3", border: "1px solid #e0d8ce" }}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Email</span>
        <span className="font-medium text-gray-800">{data.email}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Password</span>
        <span className="font-medium text-gray-800">{"•".repeat(data.password.length)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Role</span>
        <span className="font-medium" style={{ color: "#2D5A27" }}>
          {ROLE_OPTIONS.find((r) => r.value === data.role)?.label || data.role}
        </span>
      </div>
    </div>

    {error && (
      <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#fdecea", color: "#C05746" }}>
        {error}
      </div>
    )}

    <div className="space-y-3">
      <motion.button type="button" onClick={onSubmit} disabled={loading} whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: "#2D5A27" }}>
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
        ) : "Create My Account 🌱"}
      </motion.button>
      <button type="button" onClick={onBack}
        className="w-full py-3 rounded-xl font-medium text-sm"
        style={{ background: "#f0ebe3", color: "#5a4a3a" }}>
        ← Go back
      </button>
    </div>
  </motion.div>
);

// ─── RegisterPage ─────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register, loading, error, setError } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ email: "", password: "", role: ROLES.USER });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) e.email = "Valid email required.";
    if (!data.password || data.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!data.role) e.role = "Please select a role.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) { setError(null); setStep(1); }
  };

  const handleSubmit = async () => {
    await register(data);
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
          <p className="text-white/60 text-sm mb-2 uppercase tracking-wider">Our mission</p>
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Skills → Trust → Income
          </h2>
          <p className="text-white/75 text-sm leading-relaxed">
            Empowering India's rural artisans with digital skills, verified credentials, and direct market access.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {["1,200+ Artisans", "340 Workshops", "₹2.4Cr Earned"].map((s) => (
            <span key={s} className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Leaf size={20} style={{ color: "#2D5A27" }} />
            <span className="font-bold text-lg" style={{ color: "#2D5A27", fontFamily: "'Playfair Display', Georgia, serif" }}>
              RuralDev
            </span>
          </div>

          <StepDots current={step} total={2} />

          <AnimatePresence mode="wait">
            {step === 0 ? (
              <StepCredentials data={data} setData={setData} errors={errors} onNext={handleNext} />
            ) : (
              <StepConfirm data={data} onBack={() => setStep(0)}
                onSubmit={handleSubmit} loading={loading} error={error} />
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "#2D5A27" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}