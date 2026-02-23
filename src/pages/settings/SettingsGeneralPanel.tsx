import { Palette, LayoutList, Info, Heart, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { useToolEngine } from "@/hooks/useToolEngine";
import { SITE } from "@/site";
import { cn } from "@/utils/cn";
import type { LatestRelease } from "@/utils/version";
import {
  THEMES,
  SIDEBAR_MODES,
  UPDATE_BUTTON_LOADING_LABEL,
  UPDATE_BUTTON_LABEL,
} from "./constants";

export type UpdateCheckState = "idle" | "loading" | "current" | "available" | "error";

type SettingsGeneralPanelProps = {
  currentVersion: string;
  updateCheck: UpdateCheckState;
  latestRelease: LatestRelease | null;
  onCheckForUpdates: () => void;
};

const SettingsGeneralPanel = ({
  currentVersion,
  updateCheck,
  latestRelease,
  onCheckForUpdates,
}: SettingsGeneralPanelProps) => {
  const settings = useSettings();

  return (
    <div id="settings-general" role="tabpanel" aria-labelledby="tab-general" className="settings-panel">
      <section aria-labelledby="settings-theme-heading" className="settings-section">
        <h2 id="settings-theme-heading" className="settings-section-heading">
          <Palette className="h-4 w-4 text-primary" aria-hidden />
          Theme
        </h2>
        <div className="settings-option-grid grid grid-cols-2 sm:grid-cols-4" role="group" aria-label="Theme selection">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => settings.setTheme(t.value)}
              aria-pressed={settings.theme === t.value}
              className={cn("settings-option-card", settings.theme === t.value && "settings-option-card--selected")}
            >
              <div className="settings-label">{t.label}</div>
              <div className="settings-body-text mt-1">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="settings-sidebar-heading" className="settings-section">
        <h2 id="settings-sidebar-heading" className="settings-section-heading">
          <LayoutList className="h-4 w-4 text-primary" aria-hidden />
          Sidebar Layout
        </h2>
        <div className="settings-option-grid grid grid-cols-2" role="group" aria-label="Sidebar layout">
          {SIDEBAR_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => settings.setSidebarMode(m.value)}
              aria-pressed={settings.sidebarMode === m.value}
              className={cn("settings-option-card", settings.sidebarMode === m.value && "settings-option-card--selected")}
            >
              <div className="settings-label">{m.label}</div>
              <div className="settings-body-text mt-1">{m.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="settings-about-heading" className="settings-section">
        <h2 id="settings-about-heading" className="settings-section-heading">
          <Info className="h-4 w-4 text-primary" aria-hidden />
          About
        </h2>
        <div className="settings-section-content flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="settings-label">stdout v{currentVersion}</span>
            <Button
              variant="outline"
              size="xs"
              onClick={onCheckForUpdates}
              disabled={updateCheck === "loading"}
              aria-label="Check for updates"
            >
              {updateCheck === "loading" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              )}
              <span>{updateCheck === "loading" ? UPDATE_BUTTON_LOADING_LABEL : UPDATE_BUTTON_LABEL}</span>
            </Button>
          </div>
          {updateCheck === "current" && latestRelease && (
            <p className="settings-body-text">You're on the latest version.</p>
          )}
          {updateCheck === "available" && latestRelease && (
            <p className="settings-body-text">
              <a
                href={latestRelease.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Version {latestRelease.version} available <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          )}
          {updateCheck === "error" && (
            <p className="settings-body-text">Could not check for updates. Try again later.</p>
          )}
          <div className="settings-body-text">
            A modular, plugin-based developer tool platform built with React, TypeScript, and Tailwind CSS.
            All tools run entirely in your browser — no data is sent to any server.
          </div>
          <AboutStats />
        </div>
      </section>

      <section aria-labelledby="settings-support-heading" className="settings-section">
        <h2 id="settings-support-heading" className="settings-section-heading">
          <Heart className="h-4 w-4 text-primary" aria-hidden />
          Support the project
        </h2>
        <div className="settings-section-content">
          <p className="settings-body-text mb-2">
            stdout is open source (MIT). If it's useful to you, consider supporting development:
          </p>
          <Button variant="outline" size="xs" asChild>
            <a href={SITE.buyMeACoffee} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
              Buy me a coffee <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
};

function AboutStats() {
  const settings = useSettings();
  const { tools } = useToolEngine();
  const visibleCount = tools.filter((t) => settings.isToolVisible(t.path)).length;
  return (
    <div className="settings-body-text">
      {tools.length} tools available · {visibleCount} visible in sidebar
    </div>
  );
}

export default SettingsGeneralPanel;
