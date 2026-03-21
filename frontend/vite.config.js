import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use babel for JSX transformation - remove deprecated jsx option
      // The plugin automatically handles JSX transformation
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api/* requests to your backend server
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true,
        // Don't proxy external resource requests
        bypass: (req, res, options) => {
          // Allow fonts.gstatic.com requests to pass through
          if (req.url.includes("fonts.gstatic.com")) {
            return req.url;
          }
          // Allow regular font imports to load directly
          if (req.url.includes(".woff") || req.url.includes(".woff2")) {
            return req.url;
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  // Optimize dependency handling
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "axios",
      "lucide-react",
    ],
  },
});
