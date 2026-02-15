/// <reference types="vitest/config" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  base: process.env.ELECTRON_BUILD ? "./" : "/",
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    ...(process.env.ANALYZE === "1"
      ? [visualizer({ open: true, gzipSize: true, brotliSize: true, filename: "dist/stats.html" })]
      : []),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
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
