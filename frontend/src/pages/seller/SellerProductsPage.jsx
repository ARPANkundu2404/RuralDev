// ═══════════════════════════════════════════════════════════════════════════════
// SellerProductsPage.jsx  →  src/pages/seller/SellerProductsPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, ShoppingBag, Star, X, Save, DollarSign } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { marketplaceAPI } from "../../utils/api";

const MOCK_PRODUCTS = [
  { id:"p1", name:"Hand-Block Print Saree", price:2450, category:"Textile", stock:12, rating:4.9, sales:34 },
  { id:"p2", name:"Terracotta Wind Chime", price:380, category:"Pottery", stock:45, rating:4.7, sales:88 },
  { id:"p3", name:"Cane Fruit Basket", price:520, category:"Bamboo", stock:8, rating:4.8, sales:21 },
];

const ProductModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || { name:"", price:"", category:"", stock:"", description:"" });
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
            {initial ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose}><X size={18} style={{ color: "#6b7280" }} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {[["Product Name *","name",""],["Category","category","e.g. Textile, Pottery"],].map(([label,key,ph]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#4a3728" }}>{label}</label>
              <input type="text" placeholder={ph} {...f(key)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Price (₹)</label>
              <input type="number" {...f("price")} className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Stock</label>
              <input type="number" {...f("stock")} className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }} />
            </div>
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
            className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "#2D5A27" }}>
            <Save size={16} /> {initial ? "Update" : "List Product"}
          </button>
          <button onClick={onClose} className="px-5 rounded-xl text-sm font-medium"
                  style={{ background: "#f0ebe3", color: "#5a4a3a" }}>Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    marketplaceAPI.getProducts().then(({ data }) => setProducts(data.products || [])).catch(() => setProducts(MOCK_PRODUCTS)).finally(() => setLoading(false));
  }, []);

  const handleSave = (form) => {
    if (modal?.existing) {
      setProducts((ps) => ps.map((p) => p.id === modal.existing.id ? { ...p, ...form } : p));
    } else {
      setProducts((ps) => [{ ...form, id: Date.now(), rating: 0, sales: 0 }, ...ps]);
    }
  };

  const totalRevenue = products.reduce((s, p) => s + (p.price * (p.sales || 0)), 0);

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>My Products</h1>
            <p className="text-gray-500 text-sm">Manage your marketplace listings.</p>
          </div>
          <button onClick={() => setModal({})}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
            style={{ background: "#2D5A27" }}>
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Listed Products", value: products.length, color: "#2D5A27", icon: ShoppingBag },
            { label: "Total Sales", value: products.reduce((s, p) => s + (p.sales || 0), 0), color: "#C05746", icon: Star },
            { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "#b45309", icon: DollarSign },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="rounded-2xl p-5 shadow-sm" style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
              <Icon size={20} style={{ color }} className="mb-2" />
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: "#e8e0d5" }} />
          )) : products.map((p) => (
            <motion.div key={p.id || p._id} whileHover={{ y: -3 }}
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
              <div className="h-36 overflow-hidden">
                <img src={p.imageUrl || "https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=400"}
                  alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-gray-800 mb-1">{p.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold" style={{ color: "#C05746" }}>₹{p.price?.toLocaleString()}</span>
                  <span className="text-xs text-gray-400">Stock: {p.stock}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModal({ existing: p })}
                    className="flex-1 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                    style={{ background: "#eaf3e8", color: "#2D5A27" }}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => setProducts((ps) => ps.filter((x) => x.id !== p.id))}
                    className="flex-1 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                    style={{ background: "#fdecea", color: "#C05746" }}>
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <AnimatePresence>
        {modal !== null && (
          <ProductModal initial={modal.existing || null} onClose={() => setModal(null)} onSave={handleSave} />
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
