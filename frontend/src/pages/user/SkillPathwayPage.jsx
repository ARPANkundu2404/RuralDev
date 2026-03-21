// ─── src/pages/user/SkillPathwayPage.jsx ────────────────────────────────────
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { BookOpen, Award, ChevronRight, Lock } from "lucide-react";

const PATHWAYS = [
  { id: 1, title: "Textile & Weaving", skills: ["Hand Loom", "Dyeing", "Block Print"], level: "Beginner", locked: false, progress: 65 },
  { id: 2, title: "Pottery & Ceramics", skills: ["Wheel Throwing", "Glazing", "Kiln Work"], level: "Beginner", locked: false, progress: 20 },
  { id: 3, title: "Wood & Bamboo Craft", skills: ["Carving", "Joinery", "Finishing"], level: "Intermediate", locked: true, progress: 0 },
  { id: 4, title: "Embroidery & Needlework", skills: ["Kantha", "Phulkari", "Chikankari"], level: "Advanced", locked: true, progress: 0 },
];

export default function SkillPathwayPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
          Skill Pathways
        </h1>
        <p className="text-gray-500 mb-8">Progress through structured learning paths to earn verified credentials.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {PATHWAYS.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -3 }}
              className="rounded-2xl p-6 shadow-sm relative overflow-hidden"
              style={{ background: "#fff", border: "1px solid #e8e0d5", opacity: p.locked ? 0.7 : 1 }}>
              {p.locked && (
                <div className="absolute top-4 right-4">
                  <Lock size={16} style={{ color: "#aaa" }} />
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} style={{ color: "#2D5A27" }} />
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "#eaf3e8", color: "#2D5A27" }}>
                  {p.level}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "#1a2e18" }}>{p.title}</h3>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.skills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "#f0ebe3", color: "#5a4a3a" }}>{s}</span>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span><span>{p.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e8e0d5" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 0.8 }} className="h-full rounded-full"
                    style={{ background: "#2D5A27" }} />
                </div>
              </div>
              <button disabled={p.locked}
                className="flex items-center gap-1 text-sm font-semibold disabled:opacity-40"
                style={{ color: "#2D5A27" }}>
                {p.locked ? "Locked" : p.progress > 0 ? "Continue" : "Start"} <ChevronRight size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
