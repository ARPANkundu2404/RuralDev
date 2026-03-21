import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const LINKS = {
  Platform: [
    { label: "Home", to: "/home" },
    { label: "Skill Pathways", to: "/skill-pathway" },
    { label: "Workshops", to: "/workshops" },
    { label: "Jobs Board", to: "/jobs" },
    { label: "Marketplace", to: "/marketplace" },
  ],
  Community: [
    { label: "Become a Trainer", to: "/register" },
    { label: "Sell Your Craft", to: "/register" },
    { label: "Post a Job", to: "/register" },
    { label: "Success Stories", to: "#" },
  ],
  Support: [
    { label: "Help Center", to: "#" },
    { label: "Privacy Policy", to: "#" },
    { label: "Terms of Use", to: "#" },
    { label: "Contact Us", to: "#" },
  ],
};

const SOCIALS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer style={{ background: "#1a2e18", color: "#F9F6F0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: "#2D5A27" }}>
                <Leaf size={20} color="#F9F6F0" />
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                RuralDev
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#a8c4a0" }}>
              Empowering India's rural artisans with skills, trust credentials, and direct market access — one craft at a time.
            </p>
            {/* Contact Info */}
            <div className="space-y-2.5">
              {[
                { icon: Mail,    text: "support@ruraldev.in" },
                { icon: Phone,   text: "+91 1800-RURAL-00" },
                { icon: MapPin,  text: "Jaipur, Rajasthan, India" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm" style={{ color: "#a8c4a0" }}>
                  <Icon size={14} style={{ color: "#C05746" }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4"
                  style={{ color: "#C05746" }}>
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "#a8c4a0" }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
             style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-xs" style={{ color: "#6b9462" }}>
            © {new Date().getFullYear()} RuralDev. Made with 🌿 for rural India.
          </p>
          <div className="flex items-center gap-3">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <Icon size={15} style={{ color: "#a8c4a0" }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}