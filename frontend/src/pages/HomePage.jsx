// src/pages/HomePage.jsx
import React from "react";

const STATS = [
  { value: "24,800+", label: "Skilled Artisans", icon: "👷" },
  { value: "1,200+", label: "Workshops Hosted", icon: "🎓" },
  { value: "₹2.4Cr", label: "Income Generated", icon: "💰" },
  { value: "340+", label: "Villages Reached", icon: "🏡" },
];

const FEATURES = [
  {
    id: "jobs",
    icon: "🧠",
    title: "AI Job Matching",
    desc: "Tell us your skill — our model predicts the top 3 earning opportunities tailored to rural artisans.",
    cta: "Find Jobs →",
    color: "from-saffron-500/20 to-saffron-500/5",
    border: "border-saffron-500/20",
    btnClass: "btn-gold",
  },
  {
    id: "workshops",
    icon: "🎓",
    title: "Skill Workshops",
    desc: "Join verified, trainer-led workshops. Earn certificates. Unlock new earning levels.",
    cta: "Browse Workshops →",
    color: "from-jade-500/20 to-jade-500/5",
    border: "border-jade-500/20",
    btnClass: "btn-jade",
  },
  {
    id: "marketplace",
    icon: "🛒",
    title: "Rural Marketplace",
    desc: "Sell handcrafted goods directly to buyers. No middlemen. Full profits for artisans.",
    cta: "Open Market →",
    color: "from-coral-500/20 to-coral-500/5",
    border: "border-coral-500/20",
    btnClass: "btn-ghost",
  },
];

const JOURNEY_STEPS = [
  { step: "01", label: "Register", desc: "Sign up as a skill holder", icon: "👤", done: true },
  { step: "02", label: "Learn", desc: "Complete a verified workshop", icon: "📚", done: true },
  { step: "03", label: "Sell", desc: "List your first product", icon: "🏪", done: true },
  { step: "04", label: "Earn Trust", desc: "Build a 4.5+ rating", icon: "⭐", done: false },
  { step: "05", label: "Train Others", desc: "Become a verified trainer", icon: "🎓", done: false },
];

export default function HomePage({ setCurrentPage }) {
  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative min-h-[88vh] flex items-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251,191,36,0.18) 0%, transparent 55%), radial-gradient(ellipse 50% 50% at 80% 70%, rgba(16,185,129,0.1) 0%, transparent 50%), #0a0e1a",
        }}
      >
        {/* Grid bg */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(251,191,36,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating orbs */}
        <div
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/3 left-1/6 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-saffron-500/30 bg-saffron-500/8 text-saffron-400 text-xs font-semibold font-ui tracking-wide mb-8 animate-fade-in"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-saffron-400 animate-pulse" />
              Empowering Rural India — One Skill at a Time
            </div>

            {/* Headline */}
            <h1
              className="font-display font-bold leading-[1.05] mb-6 animate-fade-up opacity-0-init"
              style={{ fontSize: "clamp(42px, 7vw, 80px)", animationFillMode: "forwards" }}
            >
              Turn Your{" "}
              <span className="text-gradient-gold italic">Craft</span>
              <br />
              Into a{" "}
              <span className="text-gradient-jade">Career</span>
            </h1>

            <p
              className="text-ink-dim text-lg leading-relaxed max-w-xl mb-10 font-ui animate-fade-up opacity-0-init animate-delay-100"
              style={{ animationFillMode: "forwards" }}
            >
              A trusted digital ecosystem where rural artisans, farmers, and craftspeople discover jobs, upgrade skills, and sell directly — with zero middlemen.
            </p>

            <div
              className="flex flex-wrap gap-4 animate-fade-up opacity-0-init animate-delay-200"
              style={{ animationFillMode: "forwards" }}
            >
              <button
                onClick={() => setCurrentPage("jobs")}
                className="btn-gold text-base px-8 py-3.5 animate-pulse-ring"
              >
                🔍 Find Jobs for My Skill
              </button>
              <button
                onClick={() => setCurrentPage("marketplace")}
                className="btn-ghost text-base px-8 py-3.5"
              >
                🛒 Start Selling Today
              </button>
            </div>

            {/* Trust indicators */}
            <div
              className="flex flex-wrap gap-6 mt-12 animate-fade-up opacity-0-init animate-delay-300"
              style={{ animationFillMode: "forwards" }}
            >
              {["No middlemen", "Verified trainers", "Secure payments"].map((t) => (
                <span key={t} className="flex items-center gap-2 text-xs text-ink-muted font-ui">
                  <span className="text-jade-400 text-base">✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-night-800 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 py-8 px-6 text-center"
              >
                <span className="text-2xl mb-1">{s.icon}</span>
                <span className="font-display text-2xl font-bold text-gradient-gold">
                  {s.value}
                </span>
                <span className="text-xs text-ink-muted font-ui">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-saffron-400 font-ui">
            The Ecosystem
          </span>
          <h2 className="section-title mt-2">Three Pillars of Growth</h2>
          <p className="section-sub mt-2 max-w-md mx-auto">
            Everything you need to go from local artisan to certified, income-generating entrepreneur.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              className={`card p-7 border bg-gradient-to-br ${f.color} ${f.border} group cursor-default`}
              style={{
                animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
                animationDelay: `${i * 0.12}s`,
                opacity: 0,
              }}
            >
              <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">
                {f.title}
              </h3>
              <p className="text-ink-dim text-sm leading-relaxed mb-6">{f.desc}</p>
              <button
                onClick={() => setCurrentPage(f.id)}
                className={`${f.btnClass} text-sm`}
              >
                {f.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Journey timeline ── */}
      <section className="bg-night-800 border-y border-white/5 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-jade-400 font-ui">
              The Path
            </span>
            <h2 className="section-title mt-2">Your Journey to Verified Trainer</h2>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-saffron-500/50 via-jade-500/30 to-transparent hidden md:block" />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {JOURNEY_STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-3 text-center relative">
                  <div
                    className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all duration-300 ${
                      step.done
                        ? "bg-saffron-500/20 border-saffron-500/50 shadow-glow"
                        : "bg-night-700 border-white/10"
                    }`}
                  >
                    {step.icon}
                    {step.done && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-jade-500 border-2 border-night-800 flex items-center justify-center text-[9px] text-night-950 font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-saffron-500 mb-0.5">
                      {step.step}
                    </div>
                    <div className="text-xs font-semibold text-ink">{step.label}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-ink-dim text-base mb-10 max-w-lg mx-auto">
          Join 24,800+ rural artisans who've already transformed their skills into sustainable income.
        </p>
        <button
          onClick={() => setCurrentPage("jobs")}
          className="btn-gold text-base px-10 py-4"
        >
          Get My Job Recommendations 🚀
        </button>
      </section>
    </div>
  );
}