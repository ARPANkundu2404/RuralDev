// ═══════════════════════════════════════════════════════════════════════════════
// RecruiterJobsPage.jsx  →  src/pages/recruiter/RecruiterJobsPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Briefcase, MapPin, Users, X, Save } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { jobsAPI } from "../../utils/api";

const MOCK_JOBS = [
  { id:"j1", title:"Embroidery Specialist", company:"Fabindia", location:"Jaipur", salary:"12,000", type:"Full Time", applications:14, status:"OPEN" },
  { id:"j2", title:"Weaver (Handloom)", company:"Khadi India", location:"Varanasi", salary:"9,500", type:"Full Time", applications:8, status:"OPEN" },
  { id:"j3", title:"Wood Carver", company:"CraftVillage", location:"Saharanpur", salary:"11,000", type:"Part Time", applications:3, status:"CLOSED" },
];

const JobModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || { title:"", company:"", location:"", salary:"", type:"Full Time", description:"" });
  const [saving, setSaving] = useState(false);
  const f = (k) => ({ value: form[k] || "", onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94 }}
        className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b"
             style={{ borderColor: "#f0ebe3", background: "#faf7f3" }}>
          <h2 className="font-bold text-lg" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
            {initial ? "Edit Job" : "Post a Job"}
          </h2>
          <button onClick={onClose}><X size={18} style={{ color: "#6b7280" }} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {[["Job Title *","title","e.g. Senior Weaver"],["Company","company",""],["Location","location","City, State"],["Salary (₹/month)","salary","e.g. 12000"]].map(([label,key,ph]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#4a3728" }}>{label}</label>
              <input type="text" placeholder={ph} {...f(key)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }} />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Employment Type</label>
            <select {...f("type")} className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }}>
              {["Full Time","Part Time","Contract","Freelance"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Description</label>
            <textarea rows={3} {...f("description")} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
              style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }} />
          </div>
        </div>
        <div className="px-6 py-4 flex gap-3 border-t" style={{ borderColor: "#f0ebe3" }}>
          <button onClick={async () => { setSaving(true); await onSave(form); onClose(); }}
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "#2D5A27" }}>
            {saving ? "Saving…" : <><Save size={16} /> {initial ? "Update" : "Post Job"}</>}
          </button>
          <button onClick={onClose} className="px-5 rounded-xl text-sm font-medium"
                  style={{ background: "#f0ebe3", color: "#5a4a3a" }}>Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    jobsAPI.getAll().then(({ data }) => setJobs(data.jobs || [])).catch(() => setJobs(MOCK_JOBS)).finally(() => setLoading(false));
  }, []);

  const handleSave = async (form) => {
    if (modal?.existing) {
      setJobs((js) => js.map((j) => j.id === modal.existing.id ? { ...j, ...form } : j));
    } else {
      setJobs((js) => [{ ...form, id: Date.now(), applications: 0, status: "OPEN" }, ...js]);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>My Job Listings</h1>
            <p className="text-gray-500 text-sm">Manage postings and review applicants.</p>
          </div>
          <button onClick={() => setModal({})}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
            style={{ background: "#2D5A27" }}>
            <Plus size={18} /> Post a Job
          </button>
        </div>

        <div className="space-y-4">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#e8e0d5" }} />
          )) : jobs.map((j) => (
            <motion.div key={j.id} whileHover={{ x: 3 }}
              className="rounded-2xl p-5 shadow-sm flex items-center gap-4 flex-wrap"
              style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                   style={{ background: "#C05746" }}>
                {(j.company || "Co")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-800">{j.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: j.status === "OPEN" ? "#eaf3e8" : "#f3f4f6",
                                 color: j.status === "OPEN" ? "#2D5A27" : "#6b7280" }}>
                    {j.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={11} />{j.location}</span>
                  <span className="flex items-center gap-1"><Users size={11} />{j.applications} applicants</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setModal({ existing: j })}
                  className="p-2 rounded-xl hover:bg-gray-100"><Edit2 size={15} style={{ color: "#2D5A27" }} /></button>
                <button onClick={() => setJobs((js) => js.filter((x) => x.id !== j.id))}
                  className="p-2 rounded-xl hover:bg-red-50"><Trash2 size={15} style={{ color: "#C05746" }} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {modal !== null && (
          <JobModal initial={modal.existing || null}
            onClose={() => setModal(null)} onSave={handleSave} />
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
