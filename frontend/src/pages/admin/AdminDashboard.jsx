import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Tag,
  Clock,
  Briefcase,
  Package,
  BookOpen,
} from "lucide-react";
import { workshopAPI, jobsAPI, productAPI } from "../../utils/api";
import Navbar from "../../components/Navbar";

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    PENDING: { label: "Pending", bg: "#fdf3e0", color: "#b45309" },
    APPROVED: { label: "Approved", bg: "#eaf3e8", color: "#2D5A27" },
    REJECTED: { label: "Rejected", bg: "#fdecea", color: "#C05746" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

// ─── Item Card ──────────────────────────────────────────────────────────────────
const ApprovalCard = ({
  item,
  type,
  onApprove,
  onReject,
  processing,
  userId,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isOwn =
    (type === "workshop" && item.trainer_id === userId) ||
    (type === "job" && item.recruiter_id === userId) ||
    (type === "product" && item.seller_id === userId);

  const getTypeLabel = () => {
    switch (type) {
      case "workshop":
        return item.skill_category;
      case "job":
        return item.job_category;
      case "product":
        return item.category;
      default:
        return "Item";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "workshop":
        return <BookOpen size={16} />;
      case "job":
        return <Briefcase size={16} />;
      case "product":
        return <Package size={16} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl overflow-hidden shadow-sm border border-white/10 bg-night-700"
    >
      {/* Card Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon()}
              <h3 className="font-bold text-ink text-lg">{item.title}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Tag size={14} />
              <span>{getTypeLabel()}</span>
            </div>
          </div>
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <p className="text-sm text-ink-dim mb-4 line-clamp-2">
          {item.description}
        </p>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          {type === "product" && (
            <>
              <div className="bg-night-600 rounded-lg p-3">
                <div className="text-ink-muted text-xs mb-1">Price</div>
                <div className="text-saffron-400 font-semibold">
                  ${item.price.toFixed(2)}
                </div>
              </div>
              <div className="bg-night-600 rounded-lg p-3">
                <div className="text-ink-muted text-xs mb-1">Stock</div>
                <div className="text-ink font-semibold">
                  {item.stock_quantity} units
                </div>
              </div>
            </>
          )}
          {type === "job" && (
            <>
              <div className="bg-night-600 rounded-lg p-3">
                <div className="text-ink-muted text-xs mb-1">Location</div>
                <div className="text-ink font-semibold">
                  {item.location || "Remote"}
                </div>
              </div>
              <div className="bg-night-600 rounded-lg p-3">
                <div className="text-ink-muted text-xs mb-1">Salary Range</div>
                <div className="text-saffron-400 font-semibold">
                  {item.salary_range || "Negotiable"}
                </div>
              </div>
            </>
          )}
          {type === "workshop" && (
            <>
              <div className="bg-night-600 rounded-lg p-3">
                <div className="text-ink-muted text-xs mb-1">
                  Max Participants
                </div>
                <div className="text-ink font-semibold">
                  {item.max_participants}
                </div>
              </div>
              <div className="bg-night-600 rounded-lg p-3">
                <div className="text-ink-muted text-xs mb-1">Created</div>
                <div className="text-ink-dim text-xs flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            </>
          )}
        </div>

        {!isOwn && (
          <>
            {/* Expand button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-xs text-ink-muted hover:text-saffron-400 transition mb-3"
            >
              {expanded ? "Hide Details" : "Show Full Description"}
            </button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(item.id, type)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 bg-jade-500 hover:bg-jade-400 text-night-950 font-semibold py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheck size={16} />
                Approve
              </button>
              <button
                onClick={() => onReject(item.id, type)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldX size={16} />
                Reject
              </button>
            </div>
          </>
        )}

        {isOwn && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-saffron-500/10 text-saffron-400 text-sm">
            <AlertTriangle size={16} />
            You cannot approve your own {type}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Tab Button ────────────────────────────────────────────────────────────────
const TabButton = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
      isActive
        ? "bg-saffron-500 text-night-950"
        : "bg-white/5 text-ink-dim hover:bg-white/10 hover:text-ink"
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function UnifiedAdminDashboard() {
  const [activeTab, setActiveTab] = useState("workshops");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get current user ID from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("ruraldev_user") || "{}");
    setUserId(user.id);
  }, []);

  // Fetch pending items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        let data = [];
        if (activeTab === "workshops") {
          const res = await workshopAPI.getAll({
            status: "PENDING",
            per_page: 100,
          });
          data = res.data.data;
        } else if (activeTab === "jobs") {
          const res = await jobsAPI.getAll({
            status: "PENDING",
            per_page: 100,
          });
          data = res.data.data;
        } else if (activeTab === "products") {
          const res = await productAPI.getAll({
            status: "PENDING",
            per_page: 100,
          });
          data = res.data.data;
        }
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeTab]);

  // Approve handler
  const handleApprove = async (id, type) => {
    setProcessing(true);
    try {
      const api =
        type === "workshop"
          ? workshopAPI
          : type === "job"
            ? jobsAPI
            : productAPI;
      await api.approve(id);
      setItems(items.filter((item) => item.id !== id));
      alert(
        `${type.charAt(0).toUpperCase() + type.slice(1)} approved successfully!`,
      );
    } catch (error) {
      alert(
        `Failed to approve ${type}: ${error.friendlyMessage || error.message}`,
      );
    } finally {
      setProcessing(false);
    }
  };

  // Reject handler
  const handleReject = async (id, type) => {
    const reason = prompt("Enter rejection reason (optional):");
    setProcessing(true);
    try {
      const api =
        type === "workshop"
          ? workshopAPI
          : type === "job"
            ? jobsAPI
            : productAPI;
      await api.reject(id, reason);
      setItems(items.filter((item) => item.id !== id));
      alert(
        `${type.charAt(0).toUpperCase() + type.slice(1)} rejected successfully!`,
      );
    } catch (error) {
      alert(
        `Failed to reject ${type}: ${error.friendlyMessage || error.message}`,
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-night-950">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Content Approvals Dashboard</h1>
          <p className="section-sub">
            Review and approve pending workshops, jobs, and products
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <TabButton
            label="Workshop Approvals"
            icon={BookOpen}
            isActive={activeTab === "workshops"}
            onClick={() => setActiveTab("workshops")}
          />
          <TabButton
            label="Job Approvals"
            icon={Briefcase}
            isActive={activeTab === "jobs"}
            onClick={() => setActiveTab("jobs")}
          />
          <TabButton
            label="Product Approvals"
            icon={Package}
            isActive={activeTab === "products"}
            onClick={() => setActiveTab("products")}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-saffron-500 text-4xl inline-block">
              ⚙️
            </div>
            <p className="text-ink-muted mt-3">Loading pending items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white/3 rounded-2xl">
            <ShieldCheck className="mx-auto mb-3 text-jade-500" size={32} />
            <h3 className="text-ink font-semibold mb-1">All Caught Up!</h3>
            <p className="text-ink-muted">
              No pending {activeTab} to review at this time.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <ApprovalCard
                  key={item.id}
                  item={item}
                  type={activeTab.slice(0, -1)} // Convert "workshops" to "workshop"
                  onApprove={handleApprove}
                  onReject={handleReject}
                  processing={processing}
                  userId={userId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
