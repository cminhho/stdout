import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { cn } from "@/utils/cn";
import { getCurrentVersion, fetchLatestRelease, isNewerVersion, type LatestRelease } from "@/utils/version";
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, SETTINGS_TABS, type SettingsTabId } from "./constants";
import SettingsGeneralPanel, { type UpdateCheckState } from "./SettingsGeneralPanel";
import SettingsToolsPanel from "./SettingsToolsPanel";

const SettingsPage = () => {
  const tool = useCurrentTool();
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

  return (
    <ToolLayout title={tool?.label ?? DEFAULT_TITLE} description={tool?.description ?? DEFAULT_DESCRIPTION}>
      <div className="settings-layout">
        <nav
          className="settings-sidebar"
          aria-label="Settings categories"
        >
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
                <Icon className="settings-category-icon" aria-hidden />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        <main className="settings-content" aria-live="polite">
          {tab === "general" && (
            <SettingsGeneralPanel
              currentVersion={currentVersion}
              updateCheck={updateCheck}
              latestRelease={latestRelease}
              onCheckForUpdates={handleCheckForUpdates}
            />
          )}
          {tab === "tools" && <SettingsToolsPanel />}
        </main>
      </div>
    </ToolLayout>
  );
};

export default SettingsPage;
