/**
 * Routes for the non-tool surfaces (Home, Open deep-link, Settings, NotFound).
 * Tool paths render `null` here — the actual tool is rendered keep-alive by TabHost — but the routes
 * must exist so a valid tool path doesn't fall through to the `*` NotFound.
 */
import { Routes, Route } from "react-router-dom";
import { useToolEngine } from "@/hooks/useToolEngine";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/NotFound";
import HomePage from "@/pages/HomePage";
import OpenRoutePage from "@/pages/OpenRoutePage";

export default function RouteSurface() {
  const { tools } = useToolEngine();
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/open" element={<OpenRoutePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      {tools.map((tool) => (
        <Route key={tool.id} path={tool.path} element={null} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
