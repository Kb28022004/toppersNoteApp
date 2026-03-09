import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  /* =====================
     DEV SERVER CONFIG
     ===================== */
  server: {
    host: true,
    port: 3000,
    allowedHosts: ["ebidgo.in", "www.ebidgo.in"],
  },

  /* =====================
     BUILD CONFIG (PROD)
     ===================== */
  build: {
    outDir: "dist",
    sourcemap: false, // disable source maps in production
    chunkSizeWarningLimit: 1500, // suppress large chunk warning

    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },

  /* =====================
     BASE PATH
     ===================== */
  base: "/", // required for Nginx deployment
});
