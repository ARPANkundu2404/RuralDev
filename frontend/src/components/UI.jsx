// src/components/UI.jsx
// ─────────────────────────────────────────────────
// Reusable primitive components used across all pages
// ─────────────────────────────────────────────────

import React from "react";

/* ── Loading Spinner ── */
export function Spinner({ size = 40, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        style={{ animation: "spin 0.9s linear infinite" }}
      >
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <circle cx="20" cy="20" r="16" stroke="#1c2640" strokeWidth="3" />
        <path
          d="M20 4 A16 16 0 0 1 36 20"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs text-ink-muted font-ui tracking-wide">Loading…</span>
    </div>
  );
}

/* ── Full-page loader ── */
export function PageLoader({ text = "Fetching data…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Spinner size={48} />
      <p className="text-ink-muted text-sm font-ui">{text}</p>
    </div>
  );
}

/* ── Shimmer skeleton block ── */
export function Shimmer({ className = "" }) {
  return <div className={`shimmer-block ${className}`} />;
}

/* ── Shimmer card ── */
export function ShimmerCard({ lines = 3 }) {
  return (
    <div className="card p-5 space-y-3">
      <Shimmer className="h-5 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className={`h-3.5 ${i === lines - 1 ? "w-1/2" : "w-full"}`}
        />
      ))}
      <div className="flex gap-2 pt-2">
        <Shimmer className="h-9 flex-1 rounded-xl" />
        <Shimmer className="h-9 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Error state ── */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-3xl">
        ⚠️
      </div>
      <div className="text-center">
        <p className="text-rose-400 font-semibold text-sm mb-1">Something went wrong</p>
        <p className="text-ink-muted text-xs max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost text-xs px-4 py-2">
          Try Again
        </button>
      )}
    </div>
  );
}

/* ── API warning banner (offline fallback) ── */
export function OfflineBanner({ message }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-saffron-500/8 border border-saffron-500/20 text-xs text-saffron-400 font-ui mb-5">
      <span className="text-base leading-none mt-0.5">📡</span>
      <span>{message}</span>
    </div>
  );
}

/* ── Star rating display ── */
export function Stars({ rating, size = "sm" }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={`flex items-center gap-1 ${textSize}`}>
      <span className="text-saffron-400">
        {"★".repeat(full)}
        {half ? "½" : ""}
        {"☆".repeat(5 - full - (half ? 1 : 0))}
      </span>
      <span className="text-ink-muted font-mono">{rating.toFixed(1)}</span>
    </span>
  );
}

/* ── Toast notification ── */
export function Toast({ message, type = "success", onClose }) {
  const colors = {
    success: "border-jade-500/30 text-jade-400",
    error: "border-rose-500/30 text-rose-400",
    info: "border-saffron-500/30 text-saffron-400",
  };
  const icons = { success: "✓", error: "✕", info: "ℹ" };

  React.useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`toast flex items-center gap-3 ${colors[type]}`}
      style={{ minWidth: 260 }}
    >
      <span className="text-base">{icons[type]}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-ink-muted hover:text-ink text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

/* ── Confidence bar ── */
export function ConfidenceBar({ value, color = "saffron" }) {
  const gradients = {
    saffron: "linear-gradient(90deg, #f59e0b, #fde68a)",
    jade: "linear-gradient(90deg, #10b981, #6ee7b7)",
    coral: "linear-gradient(90deg, #f97316, #fbbf24)",
  };

  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{
          width: `${value}%`,
          background: gradients[color] || gradients.saffron,
          transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </div>
  );
}

/* ── Section Header ── */
export function SectionHeader({ label, title, subtitle, align = "left" }) {
  const textAlign = align === "center" ? "text-center" : "text-left";
  const itemsAlign = align === "center" ? "items-center" : "items-start";

  return (
    <div className={`flex flex-col ${itemsAlign} gap-1.5 mb-8`}>
      {label && (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-saffron-400 font-ui">
          <span className="w-4 h-px bg-saffron-500" />
          {label}
          <span className="w-4 h-px bg-saffron-500" />
        </span>
      )}
      <h2 className={`section-title ${textAlign}`}>{title}</h2>
      {subtitle && <p className={`section-sub ${textAlign}`}>{subtitle}</p>}
    </div>
  );
}

/* ── Empty state ── */
export function EmptyState({ emoji = "📭", title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="text-5xl">{emoji}</div>
      <p className="text-ink font-semibold text-sm">{title}</p>
      {subtitle && <p className="text-ink-muted text-xs max-w-xs">{subtitle}</p>}
    </div>
  );
}

/* ── Pill filter tabs ── */
export function FilterTabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold font-ui transition-all duration-200 ${
            active === tab
              ? "bg-saffron-500 text-night-950 shadow-glow"
              : "bg-night-700 text-ink-dim border border-white/8 hover:border-saffron-500/30 hover:text-saffron-400"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}