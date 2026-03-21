// WorkshopsPage — src/pages/user/WorkshopsPage.jsx
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { BookOpen, Clock, Star, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { workshopAPI } from "../../utils/api";

const MOCK = [
  { id:1, title:"Madhubani Painting Basics", duration:"6 hrs", price:0, rating:4.9, category:"Art", enrolled:124 },
  { id:2, title:"Bamboo Craft Mastery", duration:"8 hrs", price:299, rating:4.7, category:"Craft", enrolled:87 },
  { id:3, title:"Natural Dye Techniques", duration:"4 hrs", price:149, rating:4.8, category:"Textile", enrolled:203 },
  { id:4, title:"Pottery for Beginners", duration:"10 hrs", price:499, rating:4.6, category:"Pottery", enrolled:56 },
  { id:5, title:"Block Print Fashion", duration:"5 hrs", price:0, rating:4.9, category:"Textile", enrolled:178 },
  { id:6, title:"Advanced Kantha Embroidery", duration:"8 hrs", price:399, rating:4.8, category:"Textile", enrolled:92 },
];

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workshopAPI.getAll({ status: "PUBLISHED", limit: 20 })
      .then(({ data }) => setWorkshops(data.workshops || []))
      .catch(() => setWorkshops(MOCK))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
          Workshops
        </h1>
        <p className="text-gray-500 text-sm mb-8">Learn from master craftspeople across India.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "#e8e0d5" }} />
              ))
            : workshops.map((w) => (
                <motion.div key={w.id || w._id} whileHover={{ y: -4 }}
                  className="rounded-2xl overflow-hidden shadow-sm"
                  style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
                  <div className="h-44 overflow-hidden relative">
                    <img src={w.thumbnailUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"}
                      alt={w.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold text-white"
                          style={{ background: "#2D5A27" }}>{w.category}</span>
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold"
                          style={{ background: w.price === 0 ? "#eaf3e8" : "#fff", color: w.price === 0 ? "#2D5A27" : "#2d2d2d" }}>
                      {w.price === 0 ? "Free" : `₹${w.price}`}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{w.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Clock size={12} />{w.duration}</span>
                      <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500" />{w.rating}</span>
                      <span className="flex items-center gap-1"><Users size={12} />{w.enrolled}</span>
                    </div>
                    <button className="w-full py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: "#2D5A27" }}>
                      Enroll Now
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
