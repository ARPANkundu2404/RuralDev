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
        // Optionally rewrite path if backend doesn't use /api prefix:
        // rewrite: (path) => path.replace(/^\/api/, ""),
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
