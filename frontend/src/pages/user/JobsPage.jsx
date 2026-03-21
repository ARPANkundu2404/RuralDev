// ═══════════════════════════════════════════════════════════════════════════════
// JobsPage.jsx  →  src/pages/user/JobsPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { jobsAPI } from "../../utils/api";

const MOCK_JOBS = [
  { id:1, title:"Embroidery Specialist", company:"Fabindia", location:"Jaipur", salary:"12,000", type:"Full Time", skills:["Embroidery","Design"] },
  { id:2, title:"Weaver (Handloom)", company:"Khadi India", location:"Varanasi", salary:"9,500", type:"Full Time", skills:["Weaving"] },
  { id:3, title:"Wood Carver", company:"CraftVillage", location:"Saharanpur", salary:"11,000", type:"Part Time", skills:["Wood Carving"] },
  { id:4, title:"Pottery Instructor", company:"Rural Arts", location:"Rajkot", salary:"15,000", type:"Contract", skills:["Pottery"] },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    jobsAPI.getAll({ limit: 20 })
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(() => setJobs(MOCK_JOBS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) =>
    !search || (j.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (j.company || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
              Jobs Board
            </h1>
            <p className="text-gray-500 text-sm">Opportunities matched to your craft skills.</p>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs…" className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#fff", border: "1px solid #d4c9bc", color: "#2d2d2d", width: 200 }} />
          </div>
        </div>

        <div className="space-y-4">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "#e8e0d5" }} />
              ))
            : filtered.map((j) => (
                <motion.div key={j.id || j._id} whileHover={{ x: 4 }}
                  className="rounded-2xl p-5 shadow-sm flex items-center gap-5 flex-wrap"
                  style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                       style={{ background: "#C05746" }}>
                    {(j.company || "Co")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">{j.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                      <span>{j.company}</span>
                      <span className="flex items-center gap-0.5"><MapPin size={11} />{j.location}</span>
                      <span className="flex items-center gap-0.5"><Clock size={11} />{j.type}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold" style={{ color: "#2D5A27" }}>₹{j.salary}/mo</p>
                    <button className="mt-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                            style={{ background: "#2D5A27" }}>
                      Apply
                    </button>
                  </div>
                </motion.div>
              ))
          }
        </div>
      </main>
      <Footer />
    </div>
  );
}
