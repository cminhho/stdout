import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { cn } from "@/utils/cn";
import { getCurrentVersion, fetchLatestRelease, isNewerVersion } from "@/utils/version";
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, SETTINGS_TABS, type SettingsTabId } from "./constants";
import SettingsGeneralPanel, { type UpdateCheckState } from "./SettingsGeneralPanel";
import SettingsToolsPanel from "./SettingsToolsPanel";

const SettingsPage = () => {
  const tool = useCurrentTool();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<SettingsTabId>("general");
  const [updateCheck, setUpdateCheck] = useState<UpdateCheckState>("idle");
  const [latestRelease, setLatestRelease] = useState<Awaited<ReturnType<typeof fetchLatestRelease>>(null);

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
      <div role="tablist" aria-label="Settings sections" className="settings-tabs">
        {SETTINGS_TABS.map(({ id, label, icon: Icon, panelId }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls={panelId}
            id={`tab-${id}`}
            onClick={() => setTab(id)}
            className={cn("settings-tab", tab === id && "settings-tab--selected")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <SettingsGeneralPanel
          currentVersion={currentVersion}
          updateCheck={updateCheck}
          latestRelease={latestRelease}
          onCheckForUpdates={handleCheckForUpdates}
        />
      )}

      {tab === "tools" && <SettingsToolsPanel />}
    </ToolLayout>
  );
};

export default SettingsPage;
