// ═══════════════════════════════════════════════════════════════════════════════
// AdminFraudCheckPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldCheck, Eye, User, Clock, TrendingDown } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { adminAPI } from "../../utils/api";

const SEVERITY_MAP = {
  HIGH:   { bg: "#fdecea", color: "#C05746", border: "#f5c2be" },
  MEDIUM: { bg: "#fffbeb", color: "#b45309", border: "#f5e2a8" },
  LOW:    { bg: "#eaf3e8", color: "#2D5A27", border: "#b9d9b5" },
};

const MOCK_ALERTS = [
  { id:1, type:"Duplicate Workshop", entity:"Workshop: 'Basic Embroidery'", trainerId:"TRN-0042",
    severity:"HIGH", description:"98% content similarity with existing workshop ID W-0017.", timestamp:"2 hrs ago" },
  { id:2, type:"Price Anomaly", entity:"Workshop: 'Pottery Basics'", trainerId:"TRN-0081",
    severity:"MEDIUM", description:"Price set at ₹4,999 — 6x above category average.", timestamp:"5 hrs ago" },
  { id:3, type:"Rapid Enrollment", entity:"Workshop: 'Block Print'", trainerId:"TRN-0019",
    severity:"MEDIUM", description:"120 enrollments in under 2 hours from single IP range.", timestamp:"8 hrs ago" },
  { id:4, type:"Low Trust Trainer", entity:"Workshop: 'Natural Dyeing Pro'", trainerId:"TRN-0099",
    severity:"HIGH", description:"Trainer trust score below 30. Previous workshop rejected.", timestamp:"1 day ago" },
];

const FraudCard = ({ alert, onDismiss }) => {
  const s = SEVERITY_MAP[alert.severity];
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-2xl p-5 shadow-sm"
      style={{ background: "#fff", border: `1.5px solid ${s.border}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: s.bg }}>
            <AlertTriangle size={18} style={{ color: s.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-sm" style={{ color: "#1a2e18" }}>{alert.type}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: s.bg, color: s.color }}>
                {alert.severity}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-1">{alert.entity}</p>
            <p className="text-sm text-gray-600">{alert.description}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><User size={11} />{alert.trainerId}</span>
              <span className="flex items-center gap-1"><Clock size={11} />{alert.timestamp}</span>
            </div>
          </div>
        </div>
        <button onClick={() => onDismiss(alert.id)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 hover:opacity-80"
          style={{ background: "#eaf3e8", color: "#2D5A27" }}>
          <ShieldCheck size={13} /> Dismiss
        </button>
      </div>
    </motion.div>
  );
};

export default function AdminFraudCheckPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getFraudAlerts()
      .then(({ data }) => setAlerts(data.alerts || []))
      .catch(() => setAlerts(MOCK_ALERTS))
      .finally(() => setLoading(false));
  }, []);

  const dismiss = (id) => setAlerts((a) => a.filter((x) => x.id !== id));

  const high = alerts.filter((a) => a.severity === "HIGH").length;
  const med = alerts.filter((a) => a.severity === "MEDIUM").length;

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
            Fraud Check
          </h1>
          <p className="text-gray-500 text-sm">AI-detected anomalies requiring your attention.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "High Risk", value: high, color: "#C05746", bg: "#fdecea" },
            { label: "Medium Risk", value: med, color: "#b45309", bg: "#fffbeb" },
            { label: "Total Alerts", value: alerts.length, color: "#2D5A27", bg: "#eaf3e8" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center shadow-sm"
                 style={{ background: s.bg, border: `1px solid ${s.color}33` }}>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#e8e0d5" }} />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20">
            <ShieldCheck size={44} className="mx-auto mb-3" style={{ color: "#2D5A27", opacity: 0.3 }} />
            <p className="text-gray-400 font-medium">No active fraud alerts. Platform looks clean! 🌿</p>
          </div>
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {alerts.map((a) => <FraudCard key={a.id} alert={a} onDismiss={dismiss} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
