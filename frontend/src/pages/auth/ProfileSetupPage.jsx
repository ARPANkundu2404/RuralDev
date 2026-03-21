import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  FileText,
  Tag,
  MapPin,
  ChevronRight,
  Check,
  Leaf,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const SKILL_OPTIONS = [
  "Embroidery",
  "Weaving",
  "Pottery",
  "Block Print",
  "Bamboo Craft",
  "Natural Dyeing",
  "Wood Carving",
  "Leather Work",
  "Kantha",
  "Madhubani",
  "Basket Weaving",
  "Jewelry Making",
  "Stone Carving",
  "Lacquerware",
  "Beadwork",
];

// ─── Multi-Step Progress Bar ───────────────────────────────────────────────────
const ProgressBar = ({ step, total }) => (
  <div className="flex gap-2 mb-8">
    {Array(total)
      .fill(0)
      .map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ background: "#e8e0d5" }}
        >
          <motion.div
            animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }}
            transition={{ duration: 0.4 }}
            className="h-full rounded-full"
            style={{ background: "#2D5A27" }}
          />
        </div>
      ))}
  </div>
);

// ─── Skill Chip ────────────────────────────────────────────────────────────────
const SkillChip = ({ skill, selected, onToggle }) => (
  <motion.button
    type="button"
    onClick={() => onToggle(skill)}
    whileTap={{ scale: 0.95 }}
    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all border"
    style={{
      background: selected ? "#2D5A27" : "#fff",
      color: selected ? "#fff" : "#5a4a3a",
      borderColor: selected ? "#2D5A27" : "#d4c9bc",
    }}
  >
    {selected && <Check size={12} className="inline mr-1" />}
    {skill}
  </motion.button>
);

// ─── Step A: Basic Info ────────────────────────────────────────────────────────
const StepBasicInfo = ({ data, setData, errors, onNext }) => (
  <motion.div
    key="profileA"
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -40 }}
  >
    <h2
      className="text-2xl font-bold mb-1"
      style={{
        color: "#1a2e18",
        fontFamily: "'Playfair Display', Georgia, serif",
      }}
    >
      Tell Us About Yourself
    </h2>
    <p className="text-sm text-gray-500 mb-7">
      This helps us personalise your experience.
    </p>

    <div className="space-y-4">
      {/* Username */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "#4a3728" }}>
          Username
        </label>
        <div className="relative">
          <User
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#8a7a6e" }}
          />
          <input
            type="text"
            placeholder="e.g. meera_weaves"
            value={data.username}
            onChange={(e) => setData({ ...data, username: e.target.value })}
            className="w-full rounded-xl py-3 text-sm outline-none"
            style={{
              paddingLeft: 38,
              paddingRight: 14,
              background: "#fff",
              border: `1.5px solid ${errors.username ? "#C05746" : "#d4c9bc"}`,
              color: "#2d2d2d",
            }}
          />
        </div>
        {errors.username && (
          <p className="text-xs" style={{ color: "#C05746" }}>
            {errors.username}
          </p>
        )}
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "#4a3728" }}>
          Location
        </label>
        <div className="relative">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#8a7a6e" }}
          />
          <input
            type="text"
            placeholder="e.g. Kutch, Gujarat"
            value={data.location}
            onChange={(e) => setData({ ...data, location: e.target.value })}
            className="w-full rounded-xl py-3 text-sm outline-none"
            style={{
              paddingLeft: 38,
              paddingRight: 14,
              background: "#fff",
              border: "1.5px solid #d4c9bc",
              color: "#2d2d2d",
            }}
          />
        </div>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "#4a3728" }}>
          Short Bio
        </label>
        <div className="relative">
          <FileText
            size={16}
            className="absolute left-3 top-3"
            style={{ color: "#8a7a6e" }}
          />
          <textarea
            placeholder="Describe yourself & your craft…"
            rows={3}
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
            className="w-full rounded-xl py-3 text-sm outline-none resize-none"
            style={{
              paddingLeft: 38,
              paddingRight: 14,
              background: "#fff",
              border: `1.5px solid ${errors.bio ? "#C05746" : "#d4c9bc"}`,
              color: "#2d2d2d",
            }}
          />
        </div>
        <p className="text-xs text-gray-400 text-right">
          {data.bio.length}/250
        </p>
        {errors.bio && (
          <p className="text-xs" style={{ color: "#C05746" }}>
            {errors.bio}
          </p>
        )}
      </div>

      <motion.button
        type="button"
        onClick={onNext}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
        style={{ background: "#2D5A27" }}
      >
        Next: Your Skills <ChevronRight size={18} />
      </motion.button>
    </div>
  </motion.div>
);

// ─── Step B: Skills ────────────────────────────────────────────────────────────
const StepSkills = ({
  data,
  setData,
  onBack,
  onSubmit,
  loading,
  error,
  userRole,
}) => {
  const toggleSkill = (skill) => {
    const current = data.skills || [];
    setData({
      ...data,
      skills: current.includes(skill)
        ? current.filter((s) => s !== skill)
        : [...current, skill],
    });
  };

  const showSkillsSection = userRole === "USER" || userRole === "TRAINER";
  const showSellerSection = userRole === "SELLER";
  const showRecruiterSection = userRole === "RECRUITER";

  return (
    <motion.div
      key="profileB"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
      <h2
        className="text-2xl font-bold mb-1"
        style={{
          color: "#1a2e18",
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        {showSkillsSection
          ? "Your Craft Skills"
          : showSellerSection
            ? "Shop Details"
            : "Company Information"}
      </h2>
      <p className="text-sm text-gray-500 mb-7">
        {showSkillsSection
          ? "Select all skills that apply. This helps match you with relevant opportunities."
          : showSellerSection
            ? "Tell us about your online shop and products."
            : "Tell us about your company and hiring needs."}
      </p>

      {/* Skills Section (for USER and TRAINER) */}
      {showSkillsSection && (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {SKILL_OPTIONS.map((s) => (
              <SkillChip
                key={s}
                skill={s}
                selected={(data.skills || []).includes(s)}
                onToggle={toggleSkill}
              />
            ))}
          </div>

          {(data.skills || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{ background: "#eaf3e8", color: "#2D5A27" }}
            >
              ✓ {data.skills.length} skill{data.skills.length > 1 ? "s" : ""}{" "}
              selected
            </motion.div>
          )}
        </>
      )}

      {/* Seller Section */}
      {showSellerSection && (
        <div className="space-y-4 mb-6">
          <div>
            <label
              className="text-sm font-semibold"
              style={{ color: "#1a2e18" }}
            >
              Shop Name
            </label>
            <input
              type="text"
              placeholder="e.g., Artisan Creations"
              value={data.shopName || ""}
              onChange={(e) => setData({ ...data, shopName: e.target.value })}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
              style={{ borderColor: "#d4c9bc" }}
            />
          </div>
          <div>
            <label
              className="text-sm font-semibold"
              style={{ color: "#1a2e18" }}
            >
              Product Categories
            </label>
            <input
              type="text"
              placeholder="e.g., Pottery, Textiles, Jewelry"
              value={data.categories || ""}
              onChange={(e) => setData({ ...data, categories: e.target.value })}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
              style={{ borderColor: "#d4c9bc" }}
            />
          </div>
          <div>
            <label
              className="text-sm font-semibold"
              style={{ color: "#1a2e18" }}
            >
              Years of Experience
            </label>
            <input
              type="number"
              placeholder="e.g., 5"
              min="0"
              max="60"
              value={data.experience || ""}
              onChange={(e) => setData({ ...data, experience: e.target.value })}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
              style={{ borderColor: "#d4c9bc" }}
            />
          </div>
        </div>
      )}

      {/* Recruiter Section */}
      {showRecruiterSection && (
        <div className="space-y-4 mb-6">
          <div>
            <label
              className="text-sm font-semibold"
              style={{ color: "#1a2e18" }}
            >
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g., Fabindia Ltd."
              value={data.companyName || ""}
              onChange={(e) =>
                setData({ ...data, companyName: e.target.value })
              }
              className="w-full mt-2 px-4 py-3 border rounded-xl"
              style={{ borderColor: "#d4c9bc" }}
            />
          </div>
          <div>
            <label
              className="text-sm font-semibold"
              style={{ color: "#1a2e18" }}
            >
              Industry Focus
            </label>
            <input
              type="text"
              placeholder="e.g., Handloom, Artisan Products, Crafts"
              value={data.industry || ""}
              onChange={(e) => setData({ ...data, industry: e.target.value })}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
              style={{ borderColor: "#d4c9bc" }}
            />
          </div>
          <div>
            <label
              className="text-sm font-semibold"
              style={{ color: "#1a2e18" }}
            >
              Company Website (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={data.website || ""}
              onChange={(e) => setData({ ...data, website: e.target.value })}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
              style={{ borderColor: "#d4c9bc" }}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: "#fdecea", color: "#C05746" }}
        >
          {error}
        </div>
      )}

      <div className="space-y-3">
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: "#2D5A27" }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
              Saving…
            </>
          ) : (
            "Complete Setup 🌿"
          )}
        </motion.button>
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 rounded-xl font-medium text-sm"
          style={{ background: "#f0ebe3", color: "#5a4a3a" }}
        >
          ← Back
        </button>
      </div>
    </motion.div>
  );
};

// ─── ProfileSetupPage ──────────────────────────────────────────────────────────
export default function ProfileSetupPage() {
  const { user, completeProfile, loading, error, setError } = useAuth();
  const location = useLocation();
  const userId = location.state?.userId || user?.id || user?._id;
  const userRole = location.state?.role || user?.role || "USER";

  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    username: "",
    bio: "",
    location: "",
    skills: [],
  });
  const [errors, setErrors] = useState({});

  const validateBasic = () => {
    const e = {};
    if (!data.username.trim()) e.username = "Username is required.";
    if (data.username.length > 30) e.username = "Max 30 characters.";
    if (data.bio.length > 250) e.bio = "Bio cannot exceed 250 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateBasic()) {
      setError(null);
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    await completeProfile(userId, data);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#F9F6F0" }}
    >
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Leaf size={22} style={{ color: "#2D5A27" }} />
          <span
            className="font-bold text-xl"
            style={{
              color: "#2D5A27",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            RuralDev
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-lg"
          style={{ background: "#fff", border: "1px solid #e8e0d5" }}
        >
          <ProgressBar step={step} total={2} />

          <AnimatePresence mode="wait">
            {step === 0 ? (
              <StepBasicInfo
                data={data}
                setData={setData}
                errors={errors}
                onNext={handleNext}
              />
            ) : (
              <StepSkills
                data={data}
                setData={setData}
                onBack={() => setStep(0)}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                userRole={userRole}
              />
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can always update your profile later from your dashboard.
        </p>
      </div>
    </div>
  );
}
