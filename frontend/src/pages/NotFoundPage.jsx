import { motion } from "framer-motion";
import { Leaf, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6"
         style={{ background: "#F9F6F0" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Big 404 */}
        <div className="relative mb-6">
          <p className="text-[8rem] font-black leading-none select-none"
             style={{ color: "#e8e0d5", fontFamily: "'Playfair Display', Georgia, serif" }}>
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf size={48} style={{ color: "#2D5A27" }} />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3"
            style={{ color: "#1a2e18", fontFamily: "'Playfair Display', Georgia, serif" }}>
          This path leads nowhere
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          The page you're looking for has wandered off the trail. Let's get you back to familiar ground.
        </p>

        <Link to="/home"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white"
          style={{ background: "#2D5A27" }}>
          <Home size={18} /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
