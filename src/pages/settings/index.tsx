import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";

import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { getCurrentVersion, fetchLatestRelease, isNewerVersion, type LatestRelease } from "@/utils/version";
import { DEFAULT_TITLE, SETTINGS_TABS, type SettingsTabId } from "./constants";
import SettingsGeneralPanel, { type UpdateCheckState } from "./SettingsGeneralPanel";
import SettingsAppearancePanel from "./SettingsAppearancePanel";
import SettingsToolsPanel from "./SettingsToolsPanel";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<SettingsTabId>("general");
  const [updateCheck, setUpdateCheck] = useState<UpdateCheckState>("idle");
  const [latestRelease, setLatestRelease] = useState<LatestRelease | null>(null);

  const currentVersion = getCurrentVersion();

  useEffect(() => {
    if (searchParams.get("checkUpdates") !== "1") return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("checkUpdates");
        return next;
      },
      { replace: true }
    );
    handleCheckForUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleCheckForUpdates is stable enough, avoid loop
  }, [searchParams, setSearchParams]);

  const handleCheckForUpdates = async () => {
    setUpdateCheck("loading");
    setLatestRelease(null);
    try {
      const release = await fetchLatestRelease();
      if (!release) {
        setUpdateCheck("error");
        return;
      }
      setLatestRelease(release);
      setUpdateCheck(isNewerVersion(release.version, currentVersion) ? "available" : "current");
    } catch {
      setUpdateCheck("error");
    }
  };

  const currentTab = SETTINGS_TABS.find((t) => t.id === tab);
  const currentTabLabel = currentTab?.label ?? DEFAULT_TITLE;
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const dialogContent = (
    <div className="settings-modal-container" role="presentation">
      <div
        className="settings-backdrop"
        aria-hidden
        onClick={close}
        onKeyDown={(e) => e.key === "Enter" && close()}
      />
      <div
        ref={dialogRef}
        className="settings-dialog"
        role="dialog"
        aria-labelledby="settings-dialog-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Mobile: single top bar with title + close (macOS-style) */}
        <div className="settings-mobile-header" aria-hidden="true">
          <span className="settings-mobile-header-title">{DEFAULT_TITLE}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={close}
            aria-label="Close settings"
            className="settings-dialog-close settings-mobile-close"
          >
            <X className="size-5" aria-hidden />
          </Button>
        </div>

        <div className="settings-layout">
          <nav className="settings-sidebar" aria-label="Settings categories">
            <h1 id="settings-dialog-title" className="settings-sidebar-title">
              {DEFAULT_TITLE}
            </h1>
            <div role="tablist" aria-label="Settings sections" className="settings-category-list">
              {SETTINGS_TABS.map(({ id, label, icon: Icon, panelId }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  aria-controls={panelId}
                  id={`tab-${id}`}
                  onClick={() => setTab(id)}
                  className={cn("settings-category-item", tab === id && "settings-category-item--selected")}
                >
                  <span className="settings-category-icon-wrap" aria-hidden>
                    <Icon className="settings-category-icon" />
                  </span>
                  <span className="settings-category-label">{label}</span>
                </button>
              ))}
            </div>
          </nav>

          <main className="settings-content" aria-live="polite">
            <div className="settings-content-header">
              <h2 className="settings-panel-title">{currentTabLabel}</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={close}
                aria-label="Close settings"
                className="settings-dialog-close settings-desktop-close"
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="settings-content-body">
              {tab === "general" && (
                <SettingsGeneralPanel
                  currentVersion={currentVersion}
                  updateCheck={updateCheck}
                  latestRelease={latestRelease}
                  onCheckForUpdates={handleCheckForUpdates}
                />
              )}
              {tab === "appearance" && <SettingsAppearancePanel />}
              {tab === "tools" && <SettingsToolsPanel />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );

  return (
    <ToolLayout>
      {typeof document !== "undefined" && createPortal(dialogContent, document.body)}
    </ToolLayout>
  );
};

export default SettingsPage;
