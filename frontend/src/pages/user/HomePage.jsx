import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  BookOpen,
  ShoppingBag,
  MapPin,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";
import { workshopAPI, jobsAPI, marketplaceAPI } from "../../utils/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TrustBadge from "../../components/TrustBadge";
import { useAuth } from "../../context/AuthContext";

// ─── Hero Carousel Images ──────────────────────────────────────────────────────
const CAROUSEL_SLIDES = [
  {
    url: "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/0a/ae/07/eb.jpg",
    title: "Craftsmanship That Tells Stories",
    subtitle: "Connect with India's finest rural artisans",
    cta: "Explore Skills",
    ctaLink: "/skill-pathway",
  },
  {
    url: "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0a/ae/08/2a.jpg",
    title: "Ancient Craft, Modern Market",
    subtitle: "Handmade goods that carry generations of knowledge",
    cta: "Shop Marketplace",
    ctaLink: "/marketplace",
  },
  {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
    title: "Build Skills, Build Trust",
    subtitle: "Workshops designed to unlock earning potential",
    cta: "Join a Workshop",
    ctaLink: "/workshops",
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200",
    title: "Opportunities Closer to Home",
    subtitle: "Jobs matched to your craft, your village, your skills",
    cta: "Find Jobs",
    ctaLink: "/jobs",
  },
  {
    url: "https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=1200",
    title: "Embroidery to Enterprise",
    subtitle: "Transform your traditional skills into sustainable income",
    cta: "Start Learning",
    ctaLink: "/skill-pathway",
  },
];

// ─── Hero Carousel ─────────────────────────────────────────────────────────────
const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const goTo = (idx, dir = 1) => {
    setDirection(dir);
    setCurrent(idx);
  };

  const next = () => goTo((current + 1) % CAROUSEL_SLIDES.length, 1);
  const prev = () =>
    goTo((current - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length, -1);

  useEffect(() => {
    timerRef.current = setInterval(next, 5500);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const slide = CAROUSEL_SLIDES[current];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="relative h-[560px] md:h-[680px] overflow-hidden rounded-2xl shadow-2xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.65, ease: [0.77, 0, 0.175, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200";
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

          {/* Text content */}
          <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span
                className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{ background: "#C05746", color: "#fff" }}
              >
                RuralDev
              </span>
              <h1
                className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {slide.title}
              </h1>
              <p className="text-white/85 text-lg mb-6">{slide.subtitle}</p>
              <a
                href={slide.ctaLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: "#2D5A27" }}
              >
                {slide.cta} <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      {[
        { icon: ChevronLeft, fn: prev, pos: "left-4" },
        { icon: ChevronRight, fn: next, pos: "right-4" },
      ].map(({ icon: Icon, fn, pos }) => (
        <button
          key={pos}
          onClick={fn}
          className={`absolute ${pos} top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110`}
          style={{
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <Icon size={22} color="#fff" />
        </button>
      ))}

      {/* Dots */}
      <div className="absolute bottom-5 right-8 flex gap-2">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? 28 : 8,
              background: i === current ? "#C05746" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, accent, seeAllLink }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "#2D5A27" }}
      >
        <Icon size={20} color="#F9F6F0" />
      </div>
      <div>
        <h2
          className="text-2xl font-bold"
          style={{
            color: "#1a2e18",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {title}
        </h2>
        <div
          className="h-0.5 w-16 rounded-full mt-1"
          style={{ background: "#C05746" }}
        />
      </div>
    </div>
    {seeAllLink && (
      <a
        href={seeAllLink}
        className="flex items-center gap-1 text-sm font-medium hover:underline"
        style={{ color: "#2D5A27" }}
      >
        See all <ArrowRight size={14} />
      </a>
    )}
  </div>
);

// ─── Workshop Card ─────────────────────────────────────────────────────────────
const WorkshopCard = ({ workshop }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="rounded-2xl overflow-hidden shadow-md flex-shrink-0 w-72"
    style={{ background: "#fff", border: "1px solid #e8e0d5" }}
  >
    <div className="h-40 relative overflow-hidden">
      <img
        src={
          workshop.thumbnailUrl ||
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
        }
        alt={workshop.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-3 right-3">
        <span
          className="px-2 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: "#2D5A27" }}
        >
          {workshop.category || "Craft"}
        </span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
        {workshop.title}
      </h3>
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
        <Clock size={13} />
        <span>{workshop.duration || "4 hrs"}</span>
        <span className="mx-1">·</span>
        <Star size={13} className="text-yellow-500" />
        <span>{workshop.rating || "4.8"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold" style={{ color: "#C05746" }}>
          {workshop.price > 0 ? `₹${workshop.price}` : "Free"}
        </span>
        <button
          className="px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#2D5A27" }}
        >
          Enroll
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Job Card ──────────────────────────────────────────────────────────────────
const JobCard = ({ job }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="rounded-2xl p-5 shadow-md flex-shrink-0 w-72"
    style={{ background: "#fff", border: "1px solid #e8e0d5" }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
        style={{ background: "#C05746" }}
      >
        {(job.company || "Co")[0]}
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{job.title}</p>
        <p className="text-xs text-gray-500">
          {job.company || "Local Business"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
      <MapPin size={12} />
      <span>{job.location || "Remote"}</span>
    </div>
    <div className="flex flex-wrap gap-1 mb-3">
      {(job.skills || ["Handicraft", "Weaving"]).slice(0, 3).map((s) => (
        <span
          key={s}
          className="px-2 py-0.5 rounded-full text-xs"
          style={{ background: "#F0EBE3", color: "#5a4a3a" }}
        >
          {s}
        </span>
      ))}
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold" style={{ color: "#2D5A27" }}>
        ₹{job.salary || "8,000"}/mo
      </span>
      <button
        className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
        style={{ background: "#2D5A27" }}
      >
        Apply
      </button>
    </div>
  </motion.div>
);

// ─── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="rounded-2xl overflow-hidden shadow-md flex-shrink-0 w-64"
    style={{ background: "#fff", border: "1px solid #e8e0d5" }}
  >
    <div className="h-48 overflow-hidden">
      <img
        src={
          product.imageUrl ||
          "https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=400"
        }
        alt={product.name}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-800 mb-1">
        {product.name || "Handwoven Basket"}
      </h3>
      <div className="flex items-center justify-between">
        <span className="font-bold" style={{ color: "#C05746" }}>
          ₹{product.price || "450"}
        </span>
        <div className="flex items-center gap-1">
          <Star size={12} className="text-yellow-500" />
          <span className="text-xs text-gray-500">
            {product.rating || "4.9"}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Horizontal Scroll Section ─────────────────────────────────────────────────
const HScrollSection = ({ children, loading }) => (
  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
    {loading
      ? Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 h-48 rounded-2xl animate-pulse"
              style={{ background: "#e8e0d5" }}
            />
          ))
      : children}
  </div>
);

// ─── HomePage ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingW, setLoadingW] = useState(true);
  const [loadingJ, setLoadingJ] = useState(true);
  const [loadingP, setLoadingP] = useState(true);

  useEffect(() => {
    // Fetch APPROVED workshops only
    workshopAPI
      .getAll({ per_page: 6 })
      .then(({ data }) => setWorkshops(data.data || []))
      .catch(() => setWorkshops(MOCK_WORKSHOPS))
      .finally(() => setLoadingW(false));

    // Fetch APPROVED jobs only
    jobsAPI
      .getAll({ per_page: 6 })
      .then(({ data }) => setJobs(data.data || []))
      .catch(() => setJobs(MOCK_JOBS))
      .finally(() => setLoadingJ(false));

    // Fetch APPROVED products only
    marketplaceAPI
      .getProducts({ per_page: 6 })
      .then(({ data }) => setProducts(data.data || []))
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoadingP(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#F9F6F0" }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
        {/* Welcome bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Welcome back,
            </p>
            <h1
              className="text-2xl font-bold"
              style={{
                color: "#1a2e18",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {user?.username || user?.email?.split("@")[0] || "Artisan"} 👋
            </h1>
          </div>
          <TrustBadge score={user?.trustScore || 72} />
        </motion.div>

        {/* Hero Carousel */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <HeroCarousel />
        </motion.section>

        {/* Workshops Section */}
        <section>
          <SectionHeader
            icon={BookOpen}
            title="Upcoming Workshops"
            seeAllLink="/workshops"
          />
          <HScrollSection loading={loadingW}>
            {workshops.map((w) => (
              <WorkshopCard key={w._id || w.id} workshop={w} />
            ))}
          </HScrollSection>
        </section>

        {/* Jobs Section */}
        <section>
          <SectionHeader
            icon={Briefcase}
            title="Jobs Near You"
            seeAllLink="/jobs"
          />
          <HScrollSection loading={loadingJ}>
            {jobs.map((j) => (
              <JobCard key={j._id || j.id} job={j} />
            ))}
          </HScrollSection>
        </section>

        {/* Marketplace Section */}
        <section>
          <SectionHeader
            icon={ShoppingBag}
            title="Marketplace"
            seeAllLink="/marketplace"
          />
          <HScrollSection loading={loadingP}>
            {products.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </HScrollSection>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ─── Mock Data (fallback when API is unavailable) ──────────────────────────────
const MOCK_WORKSHOPS = [
  {
    id: 1,
    title: "Madhubani Painting Basics",
    duration: "6 hrs",
    price: 0,
    rating: "4.9",
    category: "Art",
  },
  {
    id: 2,
    title: "Bamboo Craft Mastery",
    duration: "8 hrs",
    price: 299,
    rating: "4.7",
    category: "Craft",
  },
  {
    id: 3,
    title: "Natural Dye Techniques",
    duration: "4 hrs",
    price: 149,
    rating: "4.8",
    category: "Textile",
  },
  {
    id: 4,
    title: "Pottery for Beginners",
    duration: "10 hrs",
    price: 499,
    rating: "4.6",
    category: "Pottery",
  },
];

const MOCK_JOBS = [
  {
    id: 1,
    title: "Embroidery Specialist",
    company: "Fabindia",
    location: "Jaipur",
    salary: "12,000",
    skills: ["Embroidery", "Design"],
  },
  {
    id: 2,
    title: "Weaver (Handloom)",
    company: "Khadi India",
    location: "Varanasi",
    salary: "9,500",
    skills: ["Weaving", "Handloom"],
  },
  {
    id: 3,
    title: "Wood Carver",
    company: "CraftVillage",
    location: "Saharanpur",
    salary: "11,000",
    skills: ["Wood Carving"],
  },
];

const MOCK_PRODUCTS = [
  { id: 1, name: "Hand-Block Print Saree", price: "2,450", rating: "4.9" },
  { id: 2, name: "Terracotta Wind Chime", price: "380", rating: "4.7" },
  { id: 3, name: "Cane Fruit Basket", price: "520", rating: "4.8" },
  { id: 4, name: "Phulkari Dupatta", price: "1,200", rating: "4.9" },
];
