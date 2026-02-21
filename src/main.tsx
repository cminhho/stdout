import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/* Register PWA service worker for web only (offline cache). Skip in Electron. */
if (typeof window !== "undefined" && !(window as { electronAPI?: unknown }).electronAPI) {
  import("virtual:pwa-register").then(({ registerSW }) => registerSW({ immediate: true })).catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
