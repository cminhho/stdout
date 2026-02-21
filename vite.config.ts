import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

const isElectron = !!process.env.ELECTRON_BUILD;

export default defineConfig(({ mode }) => ({
  base: isElectron ? "./" : "/",
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    /* PWA for web: precache assets for offline. Disabled for Electron (no SW needed). */
    VitePWA({
      disable: isElectron,
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"],
        navigateFallback: null,
      },
      manifest: {
        name: "stdout",
        short_name: "stdout",
        description: "Your standard output for dev tools. Format, convert, encode, generate.",
        theme_color: "#252a31",
        background_color: "#252a31",
        display: "standalone",
      },
    }),
    ...(process.env.ANALYZE === "1"
      ? [visualizer({ open: true, gzipSize: true, brotliSize: true, filename: "dist/stats.html" })]
      : []),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-dom") || id.includes("react/jsx") || id.includes("scheduler") || id.includes("react-router")) return "react-vendor";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("prettier")) return "beautifier";
          if (id.includes("terser")) return "minify";
          if (id.includes("react-markdown") || id.includes("remark-") || id.includes("rehype-")) return "markdown";
        },
      },
    },
    chunkSizeWarningLimit: 950,
    esbuild: mode === "production" ? { drop: ["console", "debugger"] } : undefined,
  },
}));
