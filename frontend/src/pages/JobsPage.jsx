// src/pages/JobsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { fetchOptions, postPredict } from "../services/api";
import {
  FALLBACK_OPTIONS,
  buildFallbackPredictions,
} from "../data/mockData";
import {
  PageLoader,
  ShimmerCard,
  ErrorState,
  OfflineBanner,
  ConfidenceBar,
  SectionHeader,
} from "../components/UI";

const CONFIDENCE_COLORS = ["saffron", "jade", "coral"];
const RANK_LABELS = ["Top Pick", "Strong Fit", "Good Match"];
const RANK_EMOJIS = ["🥇", "🥈", "🥉"];

function JobCard({ job, rank, onWorkshop, onSell, style }) {
  const color = CONFIDENCE_COLORS[rank] || "saffron";
  const confVal = parseFloat(job.confidence || job.score || 80 - rank * 7).toFixed(1);

  const borderColor =
    color === "saffron"
      ? "border-saffron-500/30 hover:border-saffron-500/60"
      : color === "jade"
      ? "border-jade-500/30 hover:border-jade-500/60"
      : "border-coral-500/30 hover:border-coral-500/60";

  const badgeColor =
    color === "saffron"
      ? "bg-saffron-500/15 text-saffron-400"
      : color === "jade"
      ? "bg-jade-500/15 text-jade-400"
      : "bg-coral-500/15 text-coral-400";

  return (
    <div
      className={`card border ${borderColor} p-6 flex flex-col gap-5 group`}
      style={{ ...style, transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{job.icon || "💼"}</span>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${badgeColor} mb-1.5 inline-block font-ui`}>
              {RANK_EMOJIS[rank]} {RANK_LABELS[rank]}
            </span>
            <h3 className="font-display text-lg font-semibold text-white leading-snug">
              {job.job || job.title}
            </h3>
          </div>
        </div>
        <span className="font-mono text-sm font-bold text-white shrink-0">
          {confVal}%
        </span>
      </div>

      {/* Description */}
      <p className="text-ink-dim text-sm leading-relaxed flex-1">
        {job.description || "Leverage your skills and expertise in this high-demand rural employment opportunity."}
      </p>

      {/* Confidence bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-ui text-ink-muted">
          <span>Match confidence</span>
          <span className="font-mono">{confVal}%</span>
        </div>
        <ConfidenceBar value={parseFloat(confVal)} color={color} />
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 pt-1">
        <button
          onClick={onWorkshop}
          className="btn-gold flex-1 text-xs py-2.5 justify-center"
        >
          🎓 Join Workshop
        </button>
        <button
          onClick={onSell}
          className="btn-ghost flex-1 text-xs py-2.5 justify-center"
        >
          🛒 Start Selling
        </button>
      </div>
    </div>
  );
}

export default function JobsPage({ setCurrentPage }) {
  const [options, setOptions] = useState({ skills: [], sub_skills: {} });
  const [skill, setSkill] = useState("");
  const [subSkill, setSubSkill] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [optLoading, setOptLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(false);
  const [optOffline, setOptOffline] = useState(false);
  const [predOffline, setPredOffline] = useState(false);
  const [optError, setOptError] = useState(null);
  const [hasPredicted, setHasPredicted] = useState(false);

  /* Load dropdown options */
  const loadOptions = useCallback(async () => {
    setOptLoading(true);
    setOptError(null);
    try {
      const data = await fetchOptions();
      setOptions(data);
      setOptOffline(false);
    } catch {
      setOptions(FALLBACK_OPTIONS);
      setOptOffline(true);
    } finally {
      setOptLoading(false);
    }
  }, []);

  useEffect(() => { loadOptions(); }, [loadOptions]);

  const handleSkillChange = (e) => {
    setSkill(e.target.value);
    setSubSkill("");
    setPredictions([]);
    setHasPredicted(false);
  };

  const handlePredict = async () => {
    if (!skill || !subSkill) return;
    setPredLoading(true);
    setPredOffline(false);
    setHasPredicted(false);
    try {
      const data = await postPredict(skill, subSkill);
      const list = data.predictions || data;
      setPredictions(Array.isArray(list) ? list : []);
    } catch {
      setPredictions(buildFallbackPredictions(skill));
      setPredOffline(true);
    } finally {
      setPredLoading(false);
      setHasPredicted(true);
    }
  };

  const subSkills = skill ? (options.sub_skills?.[skill] || []) : [];
  const canPredict = skill && subSkill && !predLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <SectionHeader
        label="AI-Powered"
        title="Job Recommendations"
        subtitle="Select your skill and specialization — the model will predict your top 3 earning opportunities."
      />

      {/* Options loading */}
      {optLoading ? (
        <PageLoader text="Loading skill options…" />
      ) : optError ? (
        <ErrorState message={optError} onRetry={loadOptions} />
      ) : (
        <>
          {optOffline && (
            <OfflineBanner message="API unavailable — showing demo skill options. Connect your Flask backend at http://127.0.0.1:5000 to use live data." />
          )}

          {/* Input form */}
          <div
            className="card border border-saffron-500/10 p-6 sm:p-8 mb-10"
            style={{ animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}
          >
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              {/* Skill */}
              <div>
                <label className="field-label">Your Primary Skill</label>
                <div className="relative">
                  <select
                    className="field pr-10"
                    value={skill}
                    onChange={handleSkillChange}
                  >
                    <option value="">Choose a skill…</option>
                    {options.skills.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-saffron-500 pointer-events-none text-xs">▾</span>
                </div>
              </div>

              {/* SubSkill */}
              <div>
                <label className="field-label">Specialization</label>
                <div className="relative">
                  <select
                    className="field pr-10 disabled:opacity-40 disabled:cursor-not-allowed"
                    value={subSkill}
                    onChange={(e) => setSubSkill(e.target.value)}
                    disabled={!skill}
                  >
                    <option value="">{skill ? "Choose specialization…" : "Select a skill first"}</option>
                    {subSkills.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-saffron-500 pointer-events-none text-xs">▾</span>
                </div>
              </div>
            </div>

            {/* Selected summary */}
            {skill && subSkill && (
              <div className="flex items-center gap-2 mb-6 text-xs font-ui text-ink-muted">
                <span className="px-2 py-1 rounded-lg bg-night-700 border border-white/8 text-saffron-400 font-semibold">
                  {skill}
                </span>
                <span className="text-night-500">→</span>
                <span className="px-2 py-1 rounded-lg bg-night-700 border border-white/8 text-jade-400 font-semibold">
                  {subSkill}
                </span>
              </div>
            )}

            <button
              onClick={handlePredict}
              disabled={!canPredict}
              className={`btn-gold py-3.5 px-8 text-sm ${!canPredict ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {predLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Analyzing your skill profile…
                </span>
              ) : (
                "🔍 Find My Job Matches"
              )}
            </button>
          </div>

          {/* Results */}
          {predLoading && (
            <div className="grid sm:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => <ShimmerCard key={i} lines={4} />)}
            </div>
          )}

          {hasPredicted && !predLoading && (
            <>
              {predOffline && (
                <OfflineBanner message="Prediction API is offline — showing demo results. Results may not reflect real data." />
              )}

              <div className="flex items-center gap-3 mb-5">
                <h3 className="font-display text-xl font-semibold text-white">
                  Top Matches for <span className="text-gradient-gold">{skill}</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-jade-500/15 text-jade-400 text-xs font-semibold font-ui border border-jade-500/20">
                  {predictions.length} found
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                {predictions.slice(0, 3).map((job, i) => (
                  <JobCard
                    key={i}
                    job={job}
                    rank={i}
                    onWorkshop={() => setCurrentPage("workshops")}
                    onSell={() => setCurrentPage("marketplace")}
                    style={{
                      animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
                      animationDelay: `${i * 0.1}s`,
                      opacity: 0,
                      animationFillMode: "forwards",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}