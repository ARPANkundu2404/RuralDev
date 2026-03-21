import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, ShieldCheck, ShieldX, ChevronDown } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { adminAPI } from "../../utils/api";
import TrustBadge from "../../components/TrustBadge";

const MOCK_USERS = [
  { id:"u1", username:"meera_weaves", email:"meera@ruraldev.in", role:"USER", status:"ACTIVE", trustScore:88, joinedAt:"2024-09-12" },
  { id:"u2", username:"ram_pottery", email:"ram@craft.in", role:"TRAINER", status:"ACTIVE", trustScore:92, joinedAt:"2024-10-03" },
  { id:"u3", username:"lakshmi_dyes", email:"lakshmi@dye.co", role:"USER", status:"SUSPENDED", trustScore:34, joinedAt:"2024-11-19" },
  { id:"u4", username:"arjun_blocks", email:"arjun@block.com", role:"SELLER", status:"ACTIVE", trustScore:71, joinedAt:"2025-01-05" },
  { id:"u5", username:"priya_bamboo", email:"priya@bamboo.in", role:"TRAINER", status:"PENDING", trustScore:55, joinedAt:"2025-02-14" },
  { id:"u6", username:"suresh_hiring", email:"suresh@jobs.in", role:"RECRUITER", status:"ACTIVE", trustScore:79, joinedAt:"2025-03-01" },
];

const ROLE_COLORS = {
  ADMIN: "#6d4c9e", TRAINER: "#2D5A27", USER: "#3b82f6",
  RECRUITER: "#C05746", SELLER: "#e09c2a",
};

const STATUS_MAP = {
  ACTIVE:    { bg: "#eaf3e8", color: "#2D5A27" },
  SUSPENDED: { bg: "#fdecea", color: "#C05746" },
  PENDING:   { bg: "#fdf3e0", color: "#b45309" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    adminAPI.getUsers()
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      setUsers((us) => us.map((u) =>
        (u.id === userId || u._id === userId) ? { ...u, status: newStatus } : u
      ));
      showToast(`User ${newStatus.toLowerCase()}.`);
    } catch {
      showToast("Action failed.", "error");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
            style={{ background: toast.type === "error" ? "#C05746" : "#2D5A27" }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
            User Management
          </h1>
          <p className="text-gray-500 text-sm">{users.length} total users on the platform.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…" className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#fff", border: "1px solid #d4c9bc", color: "#2d2d2d" }} />
          </div>
          <div className="relative">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm font-medium outline-none"
              style={{ background: "#fff", border: "1px solid #d4c9bc", color: "#2d2d2d" }}>
              {["ALL", "USER", "TRAINER", "RECRUITER", "SELLER", "ADMIN"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #e8e0d5" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#faf7f3", borderBottom: "1px solid #e8e0d5" }}>
                  {["User", "Role", "Status", "Trust Score", "Joined", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#8a7a6e" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ background: "#fff" }}>
                {loading
                  ? Array(4).fill(0).map((_, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: "#f0ebe3" }}>
                        {Array(6).fill(0).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 rounded animate-pulse" style={{ background: "#e8e0d5", width: "80%" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : filtered.map((u) => {
                      const statusStyle = STATUS_MAP[u.status] || STATUS_MAP.ACTIVE;
                      return (
                        <motion.tr key={u.id || u._id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="border-b hover:bg-gray-50 transition-colors"
                          style={{ borderColor: "#f0ebe3" }}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                   style={{ background: "#C05746" }}>
                                {(u.username || "U").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-800">{u.username}</p>
                                <p className="text-xs text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                                  style={{ background: ROLE_COLORS[u.role] || "#6b7280" }}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                  style={{ background: statusStyle.bg, color: statusStyle.color }}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <TrustBadge score={u.trustScore || 0} compact />
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-400">{u.joinedAt}</td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => toggleStatus(u.id || u._id, u.status)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                              style={u.status === "ACTIVE"
                                ? { background: "#fdecea", color: "#C05746" }
                                : { background: "#eaf3e8", color: "#2D5A27" }}>
                              {u.status === "ACTIVE"
                                ? <><ShieldX size={13} /> Suspend</>
                                : <><ShieldCheck size={13} /> Activate</>}
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>

          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Users size={36} className="mx-auto mb-2 opacity-30" />
              <p>No users match your search.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
