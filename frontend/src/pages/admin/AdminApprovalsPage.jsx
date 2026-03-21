import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldX, AlertTriangle, TrendingUp, Tag, UserCheck, Clock, Search, Filter } from "lucide-react";
import { workshopAPI } from "../../utils/api";
import Navbar from "../../components/Navbar";

// ─── Trust Score Gauge ─────────────────────────────────────────────────────────
const ScoreGauge = ({ label, value, max = 100, color }) => {
  const pct = Math.min((value / max) * 100, 100);
  const hue = pct > 65 ? "#2D5A27" : pct > 35 ? "#e09c2a" : "#C05746";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span className="font-bold" style={{ color: hue }}>{value}{max === 100 ? "%" : ""}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e8e0d5" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: hue }}
        />
      </div>
    </div>
  );
};

// ─── AI Parameter Pill ─────────────────────────────────────────────────────────
const AIPill = ({ label, value, icon: Icon, severity }) => {
  const colorMap = { low: "#2D5A27", medium: "#e09c2a", high: "#C05746" };
  const bgMap = { low: "#eaf3e8", medium: "#fdf3e0", high: "#fdecea" };
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
         style={{ background: bgMap[severity] || "#f0ebe3", color: colorMap[severity] || "#5a4a3a" }}>
      <Icon size={13} />
      <span>{label}: {value}</span>
    </div>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    PENDING:  { label: "Pending Review", bg: "#fdf3e0", color: "#b45309" },
    APPROVED: { label: "Approved", bg: "#eaf3e8", color: "#2D5A27" },
    REJECTED: { label: "Rejected", bg: "#fdecea", color: "#C05746" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

// ─── Workshop Approval Card ────────────────────────────────────────────────────
const WorkshopCard = ({ workshop, onApprove, onReject, processing }) => {
  const [expanded, setExpanded] = useState(false);

  // Simulated AI scores (in production these would come from the API)
  const ai = workshop.aiParams || {
    similarityScore: Math.floor(Math.random() * 60 + 30),
    priceAnomaly: Math.floor(Math.random() * 80),
    trustScore: Math.floor(Math.random() * 50 + 40),
  };

  const riskLevel = ai.priceAnomaly > 60 || ai.similarityScore < 40 ? "high"
    : ai.priceAnomaly > 35 ? "medium" : "low";

  const riskMap = {
    high: { label: "High Risk", bg: "#fdecea", border: "#f5c2be", badgeColor: "#C05746" },
    medium: { label: "Review", bg: "#fffbeb", border: "#f5e2a8", badgeColor: "#b45309" },
    low: { label: "Clean", bg: "#eaf3e8", border: "#b9d9b5", badgeColor: "#2D5A27" },
  };
  const risk = riskMap[riskLevel];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{ background: "#fff", border: `1.5px solid ${risk.border}` }}
    >
      {/* Card Header */}
      <div className="p-5" style={{ background: risk.bg }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-gray-800 text-lg leading-tight">{workshop.title}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: risk.badgeColor, color: "#fff" }}>
                {risk.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1"><UserCheck size={13} /> Trainer: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{workshop.trainerId || workshop.trainer?.name || "TRN-0042"}</code></span>
              <span className="flex items-center gap-1"><Clock size={13} /> {workshop.duration || "6 hrs"}</span>
              <span className="flex items-center gap-1"><Tag size={13} /> ₹{workshop.price || "299"}</span>
            </div>
          </div>
          <StatusBadge status={workshop.status || "PENDING"} />
        </div>
      </div>

      {/* AI Parameters */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "#f0ebe3" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#8a7a6e" }}>
          AI Analysis
        </p>
        <div className="space-y-2.5">
          <ScoreGauge label="Trust Score" value={ai.trustScore} />
          <ScoreGauge label="Content Similarity" value={ai.similarityScore} />
          <ScoreGauge label="Price Anomaly Risk" value={ai.priceAnomaly} />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <AIPill label="Similarity" value={`${ai.similarityScore}%`}
                  icon={TrendingUp}
                  severity={ai.similarityScore < 40 ? "high" : ai.similarityScore < 65 ? "medium" : "low"} />
          <AIPill label="Price Risk" value={`${ai.priceAnomaly}%`}
                  icon={AlertTriangle}
                  severity={ai.priceAnomaly > 60 ? "high" : ai.priceAnomaly > 35 ? "medium" : "low"} />
          <AIPill label="Trust" value={`${ai.trustScore}%`}
                  icon={ShieldCheck}
                  severity={ai.trustScore < 40 ? "high" : ai.trustScore < 65 ? "medium" : "low"} />
        </div>
      </div>

      {/* Description (expandable) */}
      {workshop.description && (
        <div className="px-5 py-3 border-b" style={{ borderColor: "#f0ebe3" }}>
          <button onClick={() => setExpanded(!expanded)}
                  className="text-xs font-medium hover:underline" style={{ color: "#2D5A27" }}>
            {expanded ? "Hide details ▲" : "Show description ▼"}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-sm text-gray-600 mt-2 overflow-hidden">
                {workshop.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Actions */}
      {workshop.status === "PENDING" && (
        <div className="px-5 py-4 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={processing === workshop._id}
            onClick={() => onApprove(workshop._id || workshop.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-50"
            style={{ background: "#2D5A27" }}
          >
            <ShieldCheck size={16} />
            {processing === workshop._id ? "Processing…" : "Approve"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={processing === workshop._id}
            onClick={() => onReject(workshop._id || workshop.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{ background: "#fdecea", color: "#C05746", border: "1.5px solid #f5c2be" }}
          >
            <ShieldX size={16} />
            Reject
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

// ─── AdminApprovalsPage ────────────────────────────────────────────────────────
export default function AdminApprovalsPage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const { data } = await workshopAPI.getAll({ status: filter });
      setWorkshops(data.workshops || []);
    } catch {
      setWorkshops(MOCK_PENDING);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkshops(); }, [filter]);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await workshopAPI.approve(id);
      setWorkshops((ws) => ws.map((w) => (w._id === id || w.id === id) ? { ...w, status: "APPROVED" } : w));
      showToast("Workshop approved successfully!");
    } catch {
      showToast("Failed to approve workshop.", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection (optional):") || "";
    setProcessing(id);
    try {
      await workshopAPI.reject(id, reason);
      setWorkshops((ws) => ws.map((w) => (w._id === id || w.id === id) ? { ...w, status: "REJECTED" } : w));
      showToast("Workshop rejected.");
    } catch {
      showToast("Failed to reject workshop.", "error");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = workshops.filter(
    (w) => !search || w.title?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Pending", count: workshops.filter((w) => w.status === "PENDING").length, color: "#e09c2a" },
    { label: "Approved", count: workshops.filter((w) => w.status === "APPROVED").length, color: "#2D5A27" },
    { label: "Rejected", count: workshops.filter((w) => w.status === "REJECTED").length, color: "#C05746" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
            style={{ background: toast.type === "error" ? "#C05746" : "#2D5A27" }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
            Workshop Approvals
          </h1>
          <p className="text-gray-500">Review AI-flagged submissions before they go live.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl p-5 text-center shadow-sm"
                 style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "#d4c9bc" }}>
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map((f) => (
              <button key={f} onClick={() => setFilter(f === "ALL" ? undefined : f)}
                className="px-4 py-2 text-sm font-medium transition-all"
                style={{
                  background: filter === f || (!filter && f === "ALL") ? "#2D5A27" : "#fff",
                  color: filter === f || (!filter && f === "ALL") ? "#fff" : "#5a4a3a"
                }}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workshops…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{ background: "#fff", border: "1px solid #d4c9bc", color: "#2d2d2d" }} />
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "#e8e0d5" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShieldCheck size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No workshops found for this filter.</p>
          </div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filtered.map((w) => (
                <WorkshopCard key={w._id || w.id} workshop={w}
                  onApprove={handleApprove} onReject={handleReject} processing={processing} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PENDING = [
  { id: "w1", title: "Advanced Kantha Embroidery", trainerId: "TRN-0042", duration: "8 hrs", price: 399, status: "PENDING",
    description: "Learn the ancient Bengali art of Kantha embroidery with modern design sensibilities.", category: "Textile",
    aiParams: { similarityScore: 38, priceAnomaly: 67, trustScore: 44 } },
  { id: "w2", title: "Natural Indigo Dyeing", trainerId: "TRN-0019", duration: "5 hrs", price: 249, status: "PENDING",
    description: "Traditional indigo plant dyeing techniques for fabric and yarn.",
    aiParams: { similarityScore: 82, priceAnomaly: 14, trustScore: 88 } },
  { id: "w3", title: "Bamboo Furniture Making", trainerId: "TRN-0067", duration: "12 hrs", price: 599, status: "PENDING",
    description: "Craft durable and sustainable furniture from locally sourced bamboo.",
    aiParams: { similarityScore: 55, priceAnomaly: 42, trustScore: 61 } },
  { id: "w4", title: "Block Print T-Shirts", trainerId: "TRN-0031", duration: "3 hrs", price: 899, status: "PENDING",
    description: "Turn traditional wood-block printing patterns into wearable fashion.",
    aiParams: { similarityScore: 29, priceAnomaly: 78, trustScore: 35 } },
];