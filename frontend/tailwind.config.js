/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        ui: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        night: {
          950: "#05070f",
          900: "#0a0e1a",
          800: "#0f1525",
          700: "#151d33",
          600: "#1c2640",
          500: "#232f4e",
        },
        saffron: {
          300: "#fde68a",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        jade: {
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        coral: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
        },
        ink: "#c8d4e8",
        "ink-dim": "#7a8ba8",
        "ink-muted": "#4a5a75",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(251,191,36,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.03) 1px, transparent 1px)",
        "hero-gradient":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251,191,36,0.15) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 60%, rgba(16,185,129,0.08) 0%, transparent 50%)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        glow: "0 0 30px rgba(251,191,36,0.15)",
        "glow-jade": "0 0 30px rgba(16,185,129,0.15)",
        "glow-coral": "0 0 20px rgba(249,115,22,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.1)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-right": "slideRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-ring": "pulseRing 2s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        float: "float 3s ease-in-out infinite",
        "bar-fill": "barFill 1s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideRight: {
          "0%": { opacity: 0, transform: "translateX(-20px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        pulseRing: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(251,191,36,0.3)" },
          "50%": { boxShadow: "0 0 0 8px rgba(251,191,36,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        barFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--bar-width)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
