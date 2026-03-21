// Marketplace Page
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { ShoppingBag, Search, SlidersHorizontal, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { marketplaceAPI } from "../../utils/api";

const MOCK = [
  { id:1, name:"Hand-Block Print Saree", price:2450, rating:4.9, category:"Textile" },
  { id:2, name:"Terracotta Wind Chime", price:380, rating:4.7, category:"Pottery" },
  { id:3, name:"Cane Fruit Basket", price:520, rating:4.8, category:"Bamboo" },
  { id:4, name:"Phulkari Dupatta", price:1200, rating:4.9, category:"Textile" },
  { id:5, name:"Madhubani Painting", price:3500, rating:5.0, category:"Art" },
  { id:6, name:"Leather Wallet", price:650, rating:4.6, category:"Leather" },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    marketplaceAPI.getProducts({ limit: 12 })
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => setProducts(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    !search || (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
              Marketplace
            </h1>
            <p className="text-gray-500 text-sm">Handcrafted goods, directly from artisans.</p>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…" className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#fff", border: "1px solid #d4c9bc", color: "#2d2d2d", width: 220 }} />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "#e8e0d5" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <motion.div key={p.id || p._id} whileHover={{ y: -4 }}
                className="rounded-2xl overflow-hidden shadow-sm cursor-pointer"
                style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
                <div className="h-44 overflow-hidden">
                  <img src={p.imageUrl || `https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=400&sig=${p.id}`}
                    alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"; }} />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">{p.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm" style={{ color: "#C05746" }}>₹{p.price?.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-yellow-500" />
                      <span className="text-xs text-gray-400">{p.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
