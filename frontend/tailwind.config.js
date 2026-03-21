/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      opacity: {
        8: "0.08",
        15: "0.15",
      },
      colors: {
        // Original colors (rural artisan theme)
        forest: {
          DEFAULT: "#2D5A27",
          light: "#eaf3e8",
          dark: "#1a2e18",
        },
        terra: {
          DEFAULT: "#C05746",
          light: "#fdecea",
        },
        cream: {
          DEFAULT: "#F9F6F0",
          dark: "#f0ebe3",
        },

        // Modern dark theme colors (night palette)
        night: {
          600: "#1c2640",
          700: "#15192d",
          800: "#0f1425",
          950: "#050609",
        },

        // Accent colors
        saffron: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        jade: {
          400: "#34d399",
          500: "#10b981",
        },
        coral: {
          400: "#fb7185",
          500: "#f43f5e",
        },
        rose: {
          400: "#f43f5e",
          500: "#e11d48",
        },

        // Text colors
        ink: {
          DEFAULT: "#c8d4e8",
          muted: "#8b94b1",
          dim: "#6b758a",
        },

        // Text variants
        sky: "#c8d4e8",
        amber: "#fbbf24",

        // Legacy colors
        bark: "#1a2e18",
        mud: "#5a4a3a",
        sand: "#d4c9bc",
        border: "#e8e0d5",
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Lato'", "system-ui", "sans-serif"],
        ui: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 2px 12px 0 rgba(45, 90, 39, 0.08)",
        "card-hover": "0 8px 24px 0 rgba(251, 191, 36, 0.12)",
        modal: "0 20px 60px 0 rgba(0, 0, 0, 0.18)",
        glow: "0 0 20px rgba(251,191,36,0.15)",
        "glow-jade": "0 0 20px rgba(16,185,129,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-right": "slideRight 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};
