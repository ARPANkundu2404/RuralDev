// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { USER_PROFILE } from "../data/mockData";
import { Stars, ConfidenceBar, SectionHeader } from "../components/UI";

const JOURNEY = [
  { label: "User", icon: "👤", desc: "Registered", color: "saffron" },
  { label: "Seller", icon: "🏪", desc: "Listed products", color: "saffron" },
  { label: "Verified Seller", icon: "✅", desc: "Trust score ≥ 85", color: "jade" },
  { label: "Trainer", icon: "🎓", desc: "Host 2+ workshops", color: "jade" },
];

const ACTIVITY = [
  { action: "Sold Terracotta Planter Set", time: "2 hrs ago", pts: "+50", type: "sale" },
  { action: "Completed Advanced Pottery Workshop", time: "3 days ago", pts: "+200", type: "workshop" },
  { action: "Received 4.9★ review from Arjun M.", time: "5 days ago", pts: "+30", type: "review" },
  { action: "Listed Hand-thrown Blue Bowl", time: "1 week ago", pts: "+10", type: "listing" },
  { action: "Referred Sunita to platform", time: "2 weeks ago", pts: "+75", type: "referral" },
];

const ACTIVITY_COLORS = {
  sale: "jade",
  workshop: "saffron",
  review: "coral",
  listing: "ink-dim",
  referral: "rose",
};

const ACHIEVEMENTS = [
  { emoji: "🏆", label: "First Sale", desc: "Sold your first product", earned: true },
  { emoji: "🎓", label: "Workshop Grad", desc: "Completed 3 workshops", earned: true },
  { emoji: "⭐", label: "Trusted Seller", desc: "Maintained 4.5+ rating", earned: true },
  { emoji: "🚀", label: "Top Earner", desc: "₹50,000 total income", earned: false },
  { emoji: "🏅", label: "Trainer Elite", desc: "Taught 20+ students", earned: false },
  { emoji: "💎", label: "Ambassador", desc: "Referred 10 artisans", earned: false },
];

function StatTile({ icon, label, value, sub, color = "saffron", delay = 0 }) {
  const gradients = {
    saffron: "from-saffron-500/15 to-transparent border-saffron-500/15",
    jade: "from-jade-500/15 to-transparent border-jade-500/15",
    coral: "from-coral-500/15 to-transparent border-coral-500/15",
    rose: "from-rose-500/15 to-transparent border-rose-500/15",
  };
  const textColors = {
    saffron: "text-gradient-gold",
    jade: "text-gradient-jade",
    coral: "text-coral-400",
    rose: "text-rose-400",
  };

  return (
    <div
      className={`card border bg-gradient-to-br ${gradients[color]} p-5`}
      style={{
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        animationDelay: `${delay}s`,
        opacity: 0,
        animationFillMode: "forwards",
      }}
    >
      <div className="text-2xl mb-3">{icon}</div>
      <div className={`font-display text-2xl font-bold ${textColors[color]} mb-0.5`}>
        {value}
      </div>
      <div className="text-xs font-semibold text-ink font-ui">{label}</div>
      {sub && <div className="text-xs text-ink-muted font-ui mt-0.5">{sub}</div>}
    </div>
  );
}

export default function DashboardPage({ setCurrentPage }) {
  const u = USER_PROFILE;
  const [animateBar, setAnimateBar] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateBar(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Determine current journey step
  const journeyStep =
    u.role === "Trainer" ? 3
    : u.trustScore >= 85 ? 2
    : u.productsSold > 0 ? 1
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Profile Hero */}
      <div
        className="relative rounded-3xl overflow-hidden mb-8 p-8"
        style={{
          background: "linear-gradient(135deg, #151d33 0%, #0f1525 60%, #1c2640 100%)",
          border: "1px solid rgba(251,191,36,0.1)",
          boxShadow: "0 0 60px rgba(251,191,36,0.05)",
        }}
      >
        {/* Bg decoration */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 80% 20%, rgba(251,191,36,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-96 h-24 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-night-700 border-2 border-saffron-500/30 flex items-center justify-center text-4xl shadow-glow">
              {u.avatar}
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-ui bg-saffron-500 text-night-950">
              {u.role}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-white mb-0.5">{u.name}</h1>
            <p className="text-sm text-ink-muted font-ui mb-2">
              📍 {u.location} · {u.primarySkill}
            </p>
            <div className="flex flex-wrap gap-2">
              {u.badges.map((b) => (
                <span key={b} className="text-xs px-2.5 py-0.5 rounded-full bg-night-600 border border-white/10 text-ink-dim font-ui">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Days active */}
          <div className="text-right">
            <div className="font-display text-3xl font-bold text-gradient-gold">{u.joinedDaysAgo}</div>
            <div className="text-xs text-ink-muted font-ui">days active</div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatTile icon="⭐" label="Trust Points" value={u.points.toLocaleString()} sub="Earn more by selling" color="saffron" delay={0} />
        <StatTile icon="🛡️" label="Trust Score" value={`${u.trustScore}/100`} sub="Target: 85 for Verified" color="jade" delay={0.08} />
        <StatTile icon="📦" label="Products Sold" value={u.productsSold} sub="This month" color="coral" delay={0.16} />
        <StatTile icon="💰" label="Total Income" value={`₹${u.totalIncome.toLocaleString()}`} sub="All time" color="saffron" delay={0.24} />
      </div>

      {/* Two-column section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Trust Score */}
        <div className="card border border-white/6 p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold text-white">🛡️ Trust Score</h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-ui text-ink-muted">
              <span>Current score</span>
              <span className="font-mono font-bold text-jade-400">{u.trustScore}/100</span>
            </div>
            <ConfidenceBar value={animateBar ? u.trustScore : 0} color="jade" />
            <div className="flex justify-between text-[10px] text-ink-muted font-ui">
              <span>Beginner</span>
              <span>Verified (85)</span>
              <span>Master (100)</span>
            </div>
          </div>

          {/* Target gap */}
          <div className="p-3 rounded-xl bg-saffron-500/8 border border-saffron-500/15 text-xs font-ui text-saffron-400">
            💡 You need <strong>{85 - u.trustScore} more points</strong> to become a Verified Seller and unlock trainer privileges.
          </div>

          {/* Trust breakdown */}
          <div className="space-y-3">
            {[
              { label: "Seller rating", value: 88, color: "jade" },
              { label: "Response time", value: 75, color: "saffron" },
              { label: "Delivery rate", value: 92, color: "jade" },
              { label: "Return rate", value: 55, color: "coral" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-ink-muted font-ui w-28 shrink-0">{item.label}</span>
                <div className="flex-1">
                  <ConfidenceBar value={animateBar ? item.value : 0} color={item.color} />
                </div>
                <span className="text-xs font-mono text-ink-dim w-8 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Journey */}
        <div className="card border border-white/6 p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-6">🗺️ Your Journey</h3>

          <div className="space-y-4">
            {JOURNEY.map((step, i) => {
              const isDone = i <= journeyStep;
              const isCurrent = i === journeyStep;

              return (
                <div key={i} className="flex items-start gap-4 relative">
                  {/* Connector */}
                  {i < JOURNEY.length - 1 && (
                    <div
                      className={`absolute left-5 top-12 w-0.5 h-6 ${
                        isDone && i < journeyStep ? "bg-saffron-500/50" : "bg-night-600"
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border-2 ${
                      isCurrent
                        ? "bg-saffron-500/20 border-saffron-500/60 shadow-glow animate-pulse-ring"
                        : isDone
                        ? "bg-jade-500/15 border-jade-500/40"
                        : "bg-night-700 border-white/10"
                    }`}
                  >
                    {step.icon}
                  </div>

                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold font-ui ${isDone ? "text-white" : "text-ink-muted"}`}>
                        {step.label}
                      </span>
                      {isDone && !isCurrent && (
                        <span className="text-jade-400 text-xs">✓</span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-saffron-500/20 text-saffron-400 font-bold font-ui border border-saffron-500/30">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted font-ui mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="card border border-white/6 p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-5">🏆 Achievements</h3>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.label}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center border transition-all duration-200 ${
                  a.earned
                    ? "bg-saffron-500/10 border-saffron-500/20 hover:border-saffron-500/40"
                    : "bg-night-700 border-white/5 opacity-40"
                }`}
              >
                <span className="text-2xl">{a.emoji}</span>
                <div>
                  <div className="text-[11px] font-semibold text-ink font-ui leading-tight">{a.label}</div>
                  <div className="text-[10px] text-ink-muted font-ui mt-0.5 leading-tight">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="card border border-white/6 p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-5">📋 Recent Activity</h3>
          <div className="space-y-0">
            {ACTIVITY.map((item, i) => {
              const color = ACTIVITY_COLORS[item.type] || "ink-dim";
              const ptColor =
                color === "jade" ? "text-jade-400 bg-jade-500/10 border-jade-500/20"
                : color === "saffron" ? "text-saffron-400 bg-saffron-500/10 border-saffron-500/20"
                : "text-ink-dim bg-night-700 border-white/8";

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 py-3 ${i < ACTIVITY.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink font-ui truncate">{item.action}</p>
                    <p className="text-[11px] text-ink-muted font-ui mt-0.5">{item.time}</p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-bold font-mono px-2 py-0.5 rounded-full border ${ptColor}`}>
                    {item.pts}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}