import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Mail } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function VerifyEmailPage() {
  const { verifyEmail, resendOTP, loading, error } = useAuth();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    await verifyEmail(email, code);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await resendOTP(email);
    setResendCooldown(60);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F9F6F0" }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <Leaf size={22} style={{ color: "#2D5A27" }} />
          <span className="font-bold text-xl" style={{ color: "#2D5A27", fontFamily: "'Playfair Display', Georgia, serif" }}>
            RuralDev
          </span>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 shadow-lg text-center" style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
               style={{ background: "#eaf3e8" }}>
            <Mail size={28} style={{ color: "#2D5A27" }} />
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
            Verify Your Email
          </h2>
          <p className="text-sm text-gray-500 mb-2">We sent a 6-digit code to</p>
          <p className="font-semibold text-sm mb-7" style={{ color: "#2D5A27" }}>{email || "your email"}</p>

          {/* OTP Input */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input key={i} ref={(el) => (inputRefs.current[i] = el)}
                type="text" inputMode="numeric" maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all"
                style={{
                  background: "#faf7f3",
                  border: `2px solid ${digit ? "#2D5A27" : "#d4c9bc"}`,
                  color: "#2d2d2d",
                }}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#fdecea", color: "#C05746" }}>
              {error}
            </div>
          )}

          <motion.button onClick={handleSubmit} disabled={loading || otp.join("").length !== 6}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50 mb-4 flex items-center justify-center gap-2"
            style={{ background: "#2D5A27" }}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</>
              : "Verify & Continue"}
          </motion.button>

          <button onClick={handleResend} disabled={resendCooldown > 0}
            className="text-sm disabled:opacity-50 hover:underline transition-opacity"
            style={{ color: "#2D5A27" }}>
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}