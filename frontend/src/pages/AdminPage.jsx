// src/pages/AdminPage.jsx
import React, { useState } from "react";
import { ADMIN_QUEUE, FRAUD_FLAGS } from "../data/mockData";
import { Toast, SectionHeader } from "../components/UI";

function WorkshopQueueCard({ workshop, onAction, style }) {
  const [deciding, setDeciding] = useState(false);
  const hasFlag = !!workshop.flag;

  const handleAction = async (action) => {
    setDeciding(true);
    await new Promise((r) => setTimeout(r, 400));
    onAction(workshop.id, action);
  };

  if (workshop.status !== "pending") {
    return (
      <div
        className={`flex items-center justify-between p-4 rounded-xl border text-sm ${
          workshop.status === "approved"
            ? "bg-jade-500/8 border-jade-500/20 text-jade-400"
            : "bg-rose-500/8 border-rose-500/20 text-rose-400"
        }`}
        style={style}
      >
        <div>
          <span className="font-semibold font-ui">{workshop.title}</span>
          <span className="text-xs opacity-70 ml-2 font-ui">by {workshop.trainer}</span>
        </div>
        <span className="text-xs font-bold font-ui uppercase tracking-wide">
          {workshop.status === "approved" ? "✓ Approved" : "✕ Rejected"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`card border flex flex-col gap-4 p-5 ${hasFlag ? "border-rose-500/30" : "border-white/6"}`}
      style={{ ...style, transition: "all 0.3s ease" }}
    >
      {/* Flag warning */}
      {hasFlag && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-rose-400 mt-0.5 shrink-0">🚩</span>
          <p className="text-xs text-rose-400 font-ui font-medium">{workshop.flag}</p>
        </div>
      )}

      {/* Details */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold text-white leading-snug">
            {workshop.title}
          </h4>
          <p className="text-xs text-ink-muted font-ui mt-1">
            👤 {workshop.trainer} · {workshop.category} · ₹{workshop.price}
          </p>
          <p className="text-[11px] text-ink-muted font-ui mt-0.5">
            🕐 Submitted {workshop.submitted}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleAction("approved")}
          disabled={deciding}
          className="btn-jade flex-1 text-xs py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deciding ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Processing…
            </span>
          ) : (
            "✓ Approve"
          )}
        </button>
        <button
          onClick={() => handleAction("rejected")}
          disabled={deciding}
          className="btn-danger flex-1 text-xs py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✕ Reject
        </button>
      </div>
    </div>
  );
}

function FraudCard({ flag, onResolve, style }) {
  const severityMap = {
    high: { badge: "badge-high", label: "High", dot: "bg-rose-400" },
    medium: { badge: "badge-med", label: "Medium", dot: "bg-coral-400" },
    low: { badge: "badge-low", label: "Low", dot: "bg-jade-400" },
  };
  const sev = severityMap[flag.severity];

  return (
    <div
      className={`card border p-4 flex flex-col gap-3 ${
        flag.severity === "high" ? "border-rose-500/20" : "border-white/6"
      } ${flag.resolved ? "opacity-40" : ""}`}
      style={{ ...style, transition: "all 0.3s ease" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-night-700 border border-white/10 flex items-center justify-center text-lg">
              {flag.avatar}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${sev.dot} border border-night-800`} />
          </div>
          <div>
            <span className="font-mono text-xs text-saffron-400 font-medium">@{flag.user}</span>
            <p className="text-xs text-ink-dim font-ui mt-0.5">🕐 {flag.time}</p>
          </div>
        </div>
        <span className={sev.badge}>{sev.label}</span>
      </div>

      <p className="text-xs text-ink font-ui leading-relaxed">{flag.action}</p>

      {!flag.resolved && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onResolve(flag.id, "ban")}
            className="btn-danger flex-1 text-[11px] py-2"
          >
            🚫 Ban User
          </button>
          <button
            onClick={() => onResolve(flag.id, "dismiss")}
            className="btn-ghost flex-1 text-[11px] py-2"
          >
            ✓ Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [queue, setQueue] = useState(ADMIN_QUEUE);
  const [flags, setFlags] = useState(FRAUD_FLAGS);
  const [toast, setToast] = useState(null);

  const handleWorkshopAction = (id, action) => {
    setQueue((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: action } : w))
    );
    const ws = queue.find((w) => w.id === id);
    setToast({
      message: `"${ws.title}" ${action === "approved" ? "approved ✓" : "rejected ✕"}`,
      type: action === "approved" ? "success" : "error",
    });
  };

  const handleFraudResolve = (id, action) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, resolved: true } : f))
    );
    const flag = flags.find((f) => f.id === id);
    setToast({
      message: action === "ban"
        ? `@${flag.user} has been banned from the platform`
        : `Flag for @${flag.user} dismissed`,
      type: action === "ban" ? "error" : "info",
    });
  };

  const pending = queue.filter((w) => w.status === "pending");
  const reviewed = queue.filter((w) => w.status !== "pending");
  const activeFlags = flags.filter((f) => !f.resolved);

  // Admin stats
  const stats = [
    { label: "Pending Review", value: pending.length, icon: "⏳", color: "saffron" },
    { label: "Active Flags", value: activeFlags.length, icon: "🚨", color: activeFlags.some(f => f.severity === "high") ? "rose" : "coral" },
    { label: "Approved Today", value: reviewed.filter(w => w.status === "approved").length, icon: "✅", color: "jade" },
    { label: "Total Users", value: "24.8K", icon: "👥", color: "saffron" },
  ];

  const statBg = { saffron: "border-saffron-500/20 bg-saffron-500/8", jade: "border-jade-500/20 bg-jade-500/8", coral: "border-coral-500/20 bg-coral-500/8", rose: "border-rose-500/20 bg-rose-500/8" };
  const statText = { saffron: "text-saffron-400", jade: "text-jade-400", coral: "text-coral-400", rose: "text-rose-400" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <SectionHeader
          label="Admin Panel"
          title="Platform Control"
          subtitle="Review workshops, monitor fraud, manage platform trust."
        />
        <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-semibold font-ui shrink-0">
          🔐 Admin Only
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`card border ${statBg[s.color]} p-5`}
            style={{
              animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
              animationDelay: `${i * 0.08}s`,
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`font-display text-3xl font-bold ${statText[s.color]}`}>{s.value}</div>
            <div className="text-xs text-ink-muted font-ui">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
        {/* ── Workshop queue ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-white">📋 Workshop Queue</h2>
            {pending.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-saffron-500/15 text-saffron-400 text-xs font-bold border border-saffron-500/20 font-ui">
                {pending.length} pending
              </span>
            )}
          </div>

          <div className="space-y-4">
            {pending.map((w, i) => (
              <WorkshopQueueCard
                key={w.id}
                workshop={w}
                onAction={handleWorkshopAction}
                style={{
                  animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              />
            ))}

            {pending.length === 0 && (
              <div className="text-center py-12 card border border-jade-500/10 bg-jade-500/5">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-jade-400 font-semibold font-ui text-sm">All workshops reviewed!</p>
                <p className="text-ink-muted text-xs mt-1 font-ui">Queue is empty</p>
              </div>
            )}

            {reviewed.length > 0 && (
              <div>
                <p className="text-xs text-ink-muted font-ui uppercase tracking-widest mb-3">Recently reviewed</p>
                <div className="space-y-2">
                  {reviewed.map((w, i) => (
                    <WorkshopQueueCard
                      key={w.id}
                      workshop={w}
                      onAction={() => {}}
                      style={{
                        animation: "fadeIn 0.4s ease forwards",
                        animationDelay: `${i * 0.06}s`,
                        opacity: 0,
                        animationFillMode: "forwards",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Fraud monitor ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-white">🚨 Fraud Monitor</h2>
            {activeFlags.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold border border-rose-500/20 font-ui">
                {activeFlags.length} active
              </span>
            )}
          </div>

          <div className="space-y-4">
            {flags.map((flag, i) => (
              <FraudCard
                key={flag.id}
                flag={flag}
                onResolve={handleFraudResolve}
                style={{
                  animation: "slideRight 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
                  animationDelay: `${i * 0.09}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 rounded-xl bg-night-800 border border-white/5">
            <p className="text-xs font-semibold text-ink-muted font-ui uppercase tracking-widest mb-3">Severity Guide</p>
            <div className="space-y-2">
              {[
                { color: "bg-rose-400", label: "High", desc: "Immediate action required" },
                { color: "bg-coral-400", label: "Medium", desc: "Review within 24 hours" },
                { color: "bg-jade-400", label: "Low", desc: "Monitor and log" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-xs font-ui">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-ink font-semibold">{item.label}</span>
                  <span className="text-ink-muted">— {item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}