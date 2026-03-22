import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, Eye, BarChart2,
  BookOpen, Clock, Users, DollarSign, X, Save
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { workshopAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

// ─── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    PUBLISHED: { bg: "#eaf3e8", color: "#2D5A27", label: "Published" },
    PENDING:   { bg: "#fdf3e0", color: "#b45309", label: "Pending" },
    DRAFT:     { bg: "#f3f4f6", color: "#6b7280", label: "Draft" },
    REJECTED:  { bg: "#fdecea", color: "#C05746", label: "Rejected" },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

// ─── Workshop Form Modal ───────────────────────────────────────────────────────
const WorkshopModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    title: "", description: "", category: "", duration: "", price: 0,
    maxEnrollment: 30, scheduledAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const field = (key) => ({
    value: form[key] || "",
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.friendlyMessage || "Failed to save workshop.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
        className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#fff" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
             style={{ borderColor: "#f0ebe3", background: "#faf7f3" }}>
          <h2 className="font-bold text-lg" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
            {initial ? "Edit Workshop" : "Create New Workshop"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} style={{ color: "#6b7280" }} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {[
            { label: "Workshop Title *", key: "title", placeholder: "e.g. Advanced Kantha Embroidery" },
            { label: "Category", key: "category", placeholder: "e.g. Textile, Pottery, Art" },
            { label: "Duration", key: "duration", placeholder: "e.g. 6 hrs" },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#4a3728" }}>{label}</label>
              <input type="text" placeholder={placeholder} {...field(key)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }} />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Price (₹)</label>
              <input type="number" min={0} {...field("price")}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Max Enrollment</label>
              <input type="number" min={1} {...field("maxEnrollment")}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Scheduled Date & Time</label>
            <input type="datetime-local" {...field("scheduledAt")}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "#4a3728" }}>Description</label>
            <textarea rows={4} placeholder="Describe what participants will learn…"
              {...field("description")}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
              style={{ background: "#faf7f3", border: "1.5px solid #d4c9bc", color: "#2d2d2d" }} />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#fdecea", color: "#C05746" }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 border-t" style={{ borderColor: "#f0ebe3" }}>
          <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "#2D5A27" }}>
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : <><Save size={16} /> {initial ? "Update" : "Submit for Review"}</>}
          </motion.button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl text-sm font-medium"
                  style={{ background: "#f0ebe3", color: "#5a4a3a" }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Workshop Row Card ─────────────────────────────────────────────────────────
const WorkshopRow = ({ workshop, onEdit, onDelete }) => (
  <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    className="rounded-2xl p-5 shadow-sm flex items-center gap-4 flex-wrap"
    style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <h3 className="font-bold text-gray-800">{workshop.title}</h3>
        <StatusBadge status={workshop.status || "DRAFT"} />
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><Clock size={12} />{workshop.duration || "—"}</span>
        <span className="flex items-center gap-1"><Users size={12} />{workshop.enrolled || 0} enrolled</span>
        <span className="flex items-center gap-1"><DollarSign size={12} />
          {workshop.price > 0 ? `₹${workshop.price}` : "Free"}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <button onClick={() => onEdit(workshop)}
        className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Edit">
        <Edit2 size={16} style={{ color: "#2D5A27" }} />
      </button>
      <button onClick={() => onDelete(workshop._id || workshop.id)}
        className="p-2 rounded-xl hover:bg-red-50 transition-colors" title="Delete">
        <Trash2 size={16} style={{ color: "#C05746" }} />
      </button>
    </div>
  </motion.div>
);

// ─── TrainerWorkshopsPage ──────────────────────────────────────────────────────
export default function TrainerWorkshopsPage() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWorkshops = () => {
    setLoading(true);
    workshopAPI.getAll({ trainer_id: user?.id })
      .then(({ data }) => setWorkshops(data.workshops || []))
      .catch(() => setWorkshops(MOCK_TRAINER_WORKSHOPS))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWorkshops(); }, []);

  const handleSave = async (formData) => {
    const normalized = {
      ...formData,
      skill_category: formData.category,
      max_participants: Number(formData.maxEnrollment || formData.max_participants || 20),
    };

    if (editing) {
      await workshopAPI.update(editing._id || editing.id, normalized);
      setWorkshops((ws) => ws.map((w) =>
        (w._id === editing._id || w.id === editing.id) ? { ...w, ...normalized } : w
      ));
      showToast("Workshop updated!");
    } else {
      const { data } = await workshopAPI.create(normalized);
      setWorkshops((ws) => [data.workshop || { ...normalized, id: Date.now(), status: "PENDING" }, ...ws]);
      showToast("Workshop submitted for review!");
    }
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workshop?")) return;
    try {
      // await workshopAPI.delete(id); // uncomment when API is ready
      setWorkshops((ws) => ws.filter((w) => (w._id || w.id) !== id));
      showToast("Workshop deleted.");
    } catch {
      showToast("Failed to delete.", "error");
    }
  };

  const openEdit = (workshop) => { setEditing(workshop); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setModalOpen(true); };

  const stats = [
    { label: "Total Workshops", value: workshops.length, icon: BookOpen, color: "#2D5A27" },
    { label: "Total Enrolled", value: workshops.reduce((s, w) => s + (w.enrolled || 0), 0), icon: Users, color: "#C05746" },
    { label: "Published", value: workshops.filter((w) => w.status === "PUBLISHED").length, icon: Eye, color: "#2D5A27" },
    { label: "Pending Review", value: workshops.filter((w) => w.status === "PENDING").length, icon: BarChart2, color: "#b45309" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
            style={{ background: toast.type === "error" ? "#C05746" : "#2D5A27" }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
              My Workshops
            </h1>
            <p className="text-gray-500 text-sm">Manage, create, and track your workshops.</p>
          </div>
          <motion.button onClick={openCreate} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white shadow-sm"
            style={{ background: "#2D5A27" }}>
            <Plus size={18} /> New Workshop
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-4 shadow-sm"
                 style={{ background: "#fff", border: "1px solid #e8e0d5" }}>
              <Icon size={20} style={{ color }} className="mb-2" />
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Workshop List */}
        {loading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#e8e0d5" }} />
            ))}
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={44} className="mx-auto mb-3 opacity-20" style={{ color: "#2D5A27" }} />
            <p className="text-gray-400 font-medium">No workshops yet.</p>
            <button onClick={openCreate} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "#2D5A27" }}>
              Create your first workshop
            </button>
          </div>
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {workshops.map((w) => (
                <WorkshopRow key={w._id || w.id} workshop={w}
                  onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <WorkshopModal
            initial={editing}
            onClose={() => { setModalOpen(false); setEditing(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

const MOCK_TRAINER_WORKSHOPS = [
  { id:"w1", title:"Madhubani Painting Basics", duration:"6 hrs", price:0, status:"PUBLISHED", enrolled:124, category:"Art" },
  { id:"w2", title:"Bamboo Craft for Beginners", duration:"8 hrs", price:299, status:"PENDING", enrolled:0, category:"Craft" },
  { id:"w3", title:"Natural Dye Techniques", duration:"4 hrs", price:149, status:"PUBLISHED", enrolled:87, category:"Textile" },
  { id:"w4", title:"Advanced Kantha Work", duration:"10 hrs", price:499, status:"DRAFT", enrolled:0, category:"Textile" },
];
