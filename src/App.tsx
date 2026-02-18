import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import AppSidebar from "@/components/AppSidebar";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useToolTracking } from "@/hooks/useToolTracking";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import HomePage from "@/pages/HomePage";

const ToolRoutes = () => {
  const { tools } = useToolEngine();

  // Activate usage tracking
  useToolTracking();

  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Loading tool...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        {tools.map((tool) => (
          <Route key={tool.id} path={tool.path} element={<tool.component />} />
        ))}
        <Route path="/settings" element={<SettingsPage />} />

        {/* Legacy path redirects (consolidated tools) */}
        <Route path="/formatters/js-beautifier" element={<Navigate to="/formatters/js" replace />} />
        <Route path="/formatters/js-minifier" element={<Navigate to="/formatters/js" replace />} />
        <Route path="/formatters/css-beautifier" element={<Navigate to="/formatters/css" replace />} />
        <Route path="/formatters/css-minifier" element={<Navigate to="/formatters/css" replace />} />
        <Route path="/tools/json-validator" element={<Navigate to="/formatters/json" replace />} />
        <Route path="/tools/xml-validator" element={<Navigate to="/formatters/xml" replace />} />
        <Route path="/tools/html-validator" element={<Navigate to="/formatters/html" replace />} />
        <Route path="/text/escape/xml" element={<Navigate to="/text/escape" replace />} />
        <Route path="/text/escape/java" element={<Navigate to="/text/escape" replace />} />
        <Route path="/text/escape/javascript" element={<Navigate to="/text/escape" replace />} />
        <Route path="/text/escape/json" element={<Navigate to="/text/escape" replace />} />
        <Route path="/text/escape/csv" element={<Navigate to="/text/escape" replace />} />
        <Route path="/text/escape/sql" element={<Navigate to="/text/escape" replace />} />
        <Route path="/text" element={<Navigate to="/text/analyzer" replace />} />
        <Route path="/diff" element={<Navigate to="/text/diff" replace />} />
        <Route path="/markdown" element={<Navigate to="/text/markdown" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <BrowserRouter>
      <SettingsProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <ToolRoutes />
        </div>
      </SettingsProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
