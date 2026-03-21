import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

/**
 * TrustBadge - Animated verification/trust level indicator.
 * @param {number} score   0–100
 * @param {boolean} compact  Show only icon + score (no label/ring)
 */
export default function TrustBadge({ score = 0, compact = false }) {
  const pct = Math.min(Math.max(score, 0), 100);

  // Tier thresholds
  const tier =
    pct >= 80 ? { label: "Verified", color: "#2D5A27", bg: "#eaf3e8", ring: "#2D5A27" }
    : pct >= 50 ? { label: "Trusted", color: "#b45309", bg: "#fdf3e0", ring: "#e09c2a" }
    : { label: "New", color: "#6b7280", bg: "#f3f4f6", ring: "#d1d5db" };

  // SVG ring parameters
  const R = 20;
  const CIRC = 2 * Math.PI * R;
  const dash = (pct / 100) * CIRC;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold"
           style={{ background: tier.bg, color: tier.color }}>
        <ShieldCheck size={13} />
        {pct}%
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="flex flex-col items-center gap-1"
      title={`Trust Score: ${pct}/100`}
    >
      {/* Animated SVG Ring */}
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 52 52" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="26" cy="26" r={R} fill="none" stroke="#e8e0d5" strokeWidth="4" />
          {/* Progress */}
          <motion.circle
            cx="26" cy="26" r={R} fill="none"
            stroke={tier.ring} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: CIRC - dash }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck size={20} style={{ color: tier.color }} />
        </div>
      </div>

      {/* Score */}
      <motion.p
        className="text-lg font-bold leading-none"
        style={{ color: tier.color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {pct}
      </motion.p>

      {/* Tier label */}
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: tier.bg, color: tier.color }}>
        {tier.label}
      </span>
    </motion.div>
  );
}