import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/* Register PWA service worker for web only (offline cache). Skip in Electron. */
const electronAPI = typeof window !== "undefined" ? window.electronAPI : undefined;
if (typeof window !== "undefined" && !electronAPI) {
  import("virtual:pwa-register").then(({ registerSW }) => registerSW({ immediate: true })).catch(() => {});
}

/* Desktop app: class on <html> so scroll/layout CSS applies (thin scrollbars, native macOS scroll when mac). */
if (electronAPI) {
  document.documentElement.classList.add("desktop");
  if (electronAPI.platform === "darwin") document.documentElement.classList.add("mac");
}

createRoot(document.getElementById("root")!).render(<App />);
