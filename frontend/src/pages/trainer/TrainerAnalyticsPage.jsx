import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Star, DollarSign, BarChart2, Award } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// ─── Mini Bar Chart (pure CSS/SVG, no chart lib needed) ───────────────────────
const BarChart = ({ data, color }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
            className="w-full rounded-t-lg min-h-1"
            style={{ background: color, opacity: 0.75 + (i / data.length) * 0.25 }}
          />
          <span className="text-xs text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, sub, color, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-2xl p-6 shadow-sm"
    style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
           style={{ background: color + "22" }}>
        <Icon size={20} style={{ color }} />
      </div>
      {sub && <span className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ background: "#eaf3e8", color: "#2D5A27" }}>{sub}</span>}
    </div>
    <p className="text-3xl font-bold mb-1" style={{ color }}>{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </motion.div>
);

// ─── Workshop Performance Row ─────────────────────────────────────────────────
const PerfRow = ({ title, enrolled, rating, revenue, i }) => (
  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.07 }}
    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
         style={{ background: i === 0 ? "#C05746" : i === 1 ? "#e09c2a" : "#2D5A27" }}>
      {i + 1}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm text-gray-800 truncate">{title}</p>
      <p className="text-xs text-gray-400">{enrolled} enrolled</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-sm font-bold" style={{ color: "#2D5A27" }}>₹{revenue.toLocaleString()}</p>
      <div className="flex items-center gap-0.5 justify-end">
        <Star size={11} className="text-yellow-500" />
        <span className="text-xs text-gray-500">{rating}</span>
      </div>
    </div>
  </motion.div>
);

// ─── TrainerAnalyticsPage ──────────────────────────────────────────────────────
export default function TrainerAnalyticsPage() {
  const METRICS = [
    { icon: Users,      label: "Total Learners",     value: "342",   sub: "+18 this week", color: "#2D5A27",  delay: 0.0 },
    { icon: DollarSign, label: "Total Revenue",       value: "₹48.2K", sub: "This month",   color: "#C05746",  delay: 0.08 },
    { icon: Star,       label: "Avg. Rating",         value: "4.82",  sub: "Out of 5",      color: "#e09c2a",  delay: 0.16 },
    { icon: Award,      label: "Certificates Issued", value: "198",   sub: "Lifetime",      color: "#6d4c9e",  delay: 0.24 },
  ];

  const MONTHLY = [
    { label: "Sep", value: 28 }, { label: "Oct", value: 45 }, { label: "Nov", value: 38 },
    { label: "Dec", value: 60 }, { label: "Jan", value: 72 }, { label: "Feb", value: 55 },
    { label: "Mar", value: 89 },
  ];

  const REVENUE = [
    { label: "Sep", value: 4200 }, { label: "Oct", value: 7800 }, { label: "Nov", value: 6100 },
    { label: "Dec", value: 9800 }, { label: "Jan", value: 11200 }, { label: "Feb", value: 8900 },
    { label: "Mar", value: 14500 },
  ];

  const TOP_WORKSHOPS = [
    { title: "Madhubani Painting Basics", enrolled: 124, rating: 4.9, revenue: 0 },
    { title: "Natural Dye Techniques", enrolled: 87, rating: 4.8, revenue: 12963 },
    { title: "Bamboo Craft Mastery", enrolled: 67, rating: 4.7, revenue: 20033 },
    { title: "Block Print Fashion", enrolled: 64, rating: 4.9, revenue: 0 },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
            Analytics
          </h1>
          <p className="text-gray-500 text-sm">Track your impact and earnings.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {METRICS.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {/* Enrollment Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-6 shadow-sm"
            style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={18} style={{ color: "#2D5A27" }} />
              <h3 className="font-bold" style={{ color: "#1a2e18" }}>Monthly Enrollments</h3>
            </div>
            <BarChart data={MONTHLY} color="#2D5A27" />
          </motion.div>

          {/* Revenue Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-6 shadow-sm"
            style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={18} style={{ color: "#C05746" }} />
              <h3 className="font-bold" style={{ color: "#1a2e18" }}>Monthly Revenue (₹)</h3>
            </div>
            <BarChart data={REVENUE} color="#C05746" />
          </motion.div>
        </div>

        {/* Top Workshops */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "#f0ebe3", background: "#faf7f3" }}>
            <h3 className="font-bold" style={{ color: "#1a2e18" }}>Top Performing Workshops</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "#f0ebe3" }}>
            {TOP_WORKSHOPS.map((w, i) => (
              <PerfRow key={w.title} {...w} i={i} />
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
