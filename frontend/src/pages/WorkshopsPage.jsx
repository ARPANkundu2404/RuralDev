// src/pages/WorkshopsPage.jsx
import React, { useState } from "react";
import { WORKSHOPS } from "../data/mockData";
import { Stars, FilterTabs, SectionHeader, Toast } from "../components/UI";

const CATEGORIES = ["All", "Pottery", "Farming", "Weaving", "Printing", "Bamboo", "Apiculture"];

function WorkshopCard({ workshop, enrolled, onRegister, style }) {
  const isVerified = workshop.status === "verified";

  const categoryColors = {
    Pottery: { bg: "from-saffron-500/20 to-transparent", dot: "bg-saffron-400" },
    Farming: { bg: "from-jade-500/20 to-transparent", dot: "bg-jade-400" },
    Weaving: { bg: "from-coral-400/20 to-transparent", dot: "bg-coral-400" },
    Printing: { bg: "from-rose-500/20 to-transparent", dot: "bg-rose-400" },
    Bamboo: { bg: "from-jade-500/15 to-transparent", dot: "bg-jade-300" },
    Apiculture: { bg: "from-saffron-500/15 to-transparent", dot: "bg-saffron-300" },
  };
  const c = categoryColors[workshop.category] || { bg: "from-white/5 to-transparent", dot: "bg-ink-muted" };

  return (
    <div
      className={`card border border-white/6 flex flex-col group overflow-hidden`}
      style={{ ...style, transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {/* Top band */}
      <div className={`bg-gradient-to-r ${c.bg} px-5 pt-5 pb-4 border-b border-white/5`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
            {workshop.emoji}
          </span>
          {isVerified ? (
            <span className="badge-verified">
              <span>✓</span> Verified
            </span>
          ) : (
            <span className="badge-review">
              <span>⏳</span> Under Review
            </span>
          )}
        </div>

        <h3 className="font-display text-lg font-semibold text-white leading-snug mb-1">
          {workshop.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-ink-muted font-ui">
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          {workshop.category}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Trainer */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-night-600 border border-white/10 flex items-center justify-center text-sm">
            👤
          </div>
          <div>
            <div className="text-xs font-semibold text-ink font-ui">{workshop.trainer}</div>
            <Stars rating={workshop.rating} />
          </div>
          <span className="ml-auto text-xs text-ink-muted font-ui">
            {workshop.reviews} reviews
          </span>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: "📅", label: workshop.duration },
            { icon: "🕐", label: workshop.schedule },
            { icon: "👥", label: `${workshop.seats} seats` },
          ].map((m) => (
            <span
              key={m.label}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-night-700 border border-white/8 text-xs text-ink-muted font-ui"
            >
              <span className="text-xs">{m.icon}</span>
              {m.label}
            </span>
          ))}
        </div>

        {/* Seats warning */}
        {workshop.seats <= 8 && (
          <div className="flex items-center gap-1.5 text-xs text-saffron-400 font-ui">
            <span>⚠️</span>
            Only {workshop.seats} seats left — fills fast!
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            <span className="font-display text-2xl font-bold text-white">₹{workshop.price}</span>
            <span className="text-xs text-ink-muted ml-1 font-ui">/ workshop</span>
          </div>
          <button
            onClick={() => onRegister(workshop)}
            disabled={enrolled}
            className={enrolled
              ? "px-4 py-2 rounded-xl text-xs font-semibold font-ui bg-jade-500/15 text-jade-400 border border-jade-500/20 cursor-default"
              : "btn-gold text-xs px-4 py-2"
            }
          >
            {enrolled ? "✓ Registered" : "Register Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkshopsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [enrolled, setEnrolled] = useState(new Set());
  const [toast, setToast] = useState(null);

  const filtered =
    activeCategory === "All"
      ? WORKSHOPS
      : WORKSHOPS.filter((w) => w.category === activeCategory);

  const handleRegister = (workshop) => {
    if (enrolled.has(workshop.id)) return;
    setEnrolled((prev) => new Set([...prev, workshop.id]));
    setToast({
      message: `Registered for "${workshop.title}"! Check your email.`,
      type: "success",
    });
  };

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <SectionHeader
          label="Live Workshops"
          title="Skill Workshops"
          subtitle="Learn from verified trainers. Earn certificates. Unlock new income tiers."
        />
        <div className="shrink-0 text-right">
          <span className="text-2xl font-display font-bold text-saffron-400">{filtered.length}</span>
          <span className="text-xs text-ink-muted font-ui ml-1">workshops</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FilterTabs
          tabs={CATEGORIES}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((workshop, i) => (
          <WorkshopCard
            key={workshop.id}
            workshop={workshop}
            enrolled={enrolled.has(workshop.id)}
            onRegister={handleRegister}
            style={{
              animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
              animationDelay: `${i * 0.08}s`,
              opacity: 0,
              animationFillMode: "forwards",
            }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-ink font-semibold">No workshops in this category yet</p>
          <p className="text-ink-muted text-sm mt-1">Check back soon or explore another category</p>
        </div>
      )}
    </div>
  );
}