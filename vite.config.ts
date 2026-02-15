import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.ELECTRON_BUILD ? "./" : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    process.env.ANALYZE === "1" &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: "dist/stats.html",
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-dom") ||
              id.includes("react/jsx") ||
              id.includes("scheduler") ||
              id.includes("react-router")
            ) {
              return "react-vendor";
            }
            if (id.includes("@radix-ui")) {
              return "radix";
            }
            if (id.includes("prettier")) {
              return "beautifier";
            }
            if (id.includes("terser")) {
              return "minify";
            }
            if (id.includes("react-markdown") || id.includes("remark-") || id.includes("rehype-")) {
              return "markdown";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    minify: "esbuild",
    esbuild: mode === "production" ? { drop: ["console", "debugger"] } : undefined,
  },
}));
