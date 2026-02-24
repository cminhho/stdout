import { useEffect, useState } from "react";
import { Info, Heart, ExternalLink, Loader2, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { useToolEngine } from "@/hooks/useToolEngine";
import { SITE } from "@/site";
import type { LatestRelease } from "@/utils/version";
import { UPDATE_BUTTON_LOADING_LABEL, UPDATE_BUTTON_LABEL } from "./constants";

export type UpdateCheckState = "idle" | "loading" | "current" | "available" | "error";

type ElectronUpdaterStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "not-available" | "error";

type SettingsGeneralPanelProps = {
  currentVersion: string;
  updateCheck: UpdateCheckState;
  latestRelease: LatestRelease | null;
  onCheckForUpdates: () => void;
};

const electronAPI = typeof window !== "undefined" ? window.electronAPI : undefined;
const hasElectronUpdater = !!electronAPI?.updater;

const SettingsGeneralPanel = ({
  currentVersion,
  updateCheck,
  latestRelease,
  onCheckForUpdates,
}: SettingsGeneralPanelProps) => {
  const settings = useSettings();
  const [electronStatus, setElectronStatus] = useState<ElectronUpdaterStatus>("idle");
  const [electronVersion, setElectronVersion] = useState<string | null>(null);
  const [electronError, setElectronError] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState<number | null>(null);

  useEffect(() => {
    if (!hasElectronUpdater) return;
    const unsub = electronAPI!.updater!.onStatus((payload) => {
      setElectronStatus(payload.event);
      if (payload.version) setElectronVersion(payload.version);
      if (payload.message) setElectronError(payload.message);
      if (payload.percent != null) setDownloadPercent(payload.percent);
    });
    return unsub;
  }, []);

  const handleCheckForUpdates = () => {
    if (hasElectronUpdater) {
      setElectronError(null);
      setElectronVersion(null);
      setDownloadPercent(null);
      setElectronStatus("checking");
      electronAPI!.updater!.check().then((result) => {
        if (result?.error && result.error !== "not-packaged") setElectronError(result.error);
        if (result?.updateInfo?.version) setElectronVersion(result.updateInfo.version);
      });
    } else {
      onCheckForUpdates();
    }
  };

  const handleQuitAndInstall = () => {
    electronAPI?.updater?.quitAndInstall();
  };

  const isElectronChecking = hasElectronUpdater && (electronStatus === "checking" || electronStatus === "downloading");
  const isElectronDownloaded = hasElectronUpdater && electronStatus === "downloaded";
  const showWebUpdate = !hasElectronUpdater;
  const checkButtonDisabled = updateCheck === "loading" || isElectronChecking;
  const checkButtonLabel = isElectronDownloaded
    ? "Restart to install"
    : isElectronChecking
      ? (electronStatus === "downloading" && downloadPercent != null ? `Downloading… ${Math.round(downloadPercent)}%` : "Checking…")
      : updateCheck === "loading"
        ? UPDATE_BUTTON_LOADING_LABEL
        : UPDATE_BUTTON_LABEL;

  return (
    <div id="settings-general" role="tabpanel" aria-labelledby="tab-general" className="settings-panel">
      <section aria-labelledby="settings-update-heading" className="settings-section">
        <h2 id="settings-update-heading" className="settings-section-heading">
          <Info className="h-4 w-4 text-primary" aria-hidden />
          App Update
        </h2>
        <div className="settings-section-content flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="settings-label">stdout v{currentVersion}</span>
            {isElectronDownloaded ? (
              <Button size="xs" onClick={handleQuitAndInstall} aria-label="Restart to install update">
                <Download className="h-3.5 w-3.5" aria-hidden />
                <span>Restart to install</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="xs"
                onClick={handleCheckForUpdates}
                disabled={checkButtonDisabled}
                aria-label="Check for updates"
              >
                {checkButtonDisabled ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                )}
                <span>{checkButtonLabel}</span>
              </Button>
            )}
          </div>
          {showWebUpdate && updateCheck === "current" && latestRelease && (
            <p className="settings-body-text">You're on the latest version.</p>
          )}
          {hasElectronUpdater && electronStatus === "not-available" && (
            <p className="settings-body-text">You're on the latest version.</p>
          )}
          {showWebUpdate && updateCheck === "available" && latestRelease && (
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
          {hasElectronUpdater && (electronStatus === "available" || electronStatus === "downloading") && electronVersion && (
            <p className="settings-body-text">
              Version {electronVersion} available — downloading…
            </p>
          )}
          {hasElectronUpdater && electronStatus === "downloaded" && electronVersion && (
            <p className="settings-body-text">Version {electronVersion} downloaded. Restart the app to install.</p>
          )}
          {showWebUpdate && updateCheck === "error" && (
            <p className="settings-body-text">Could not check for updates. Try again later.</p>
          )}
          {hasElectronUpdater && electronStatus === "error" && (
            <p className="settings-body-text">{electronError || "Could not check for updates. Try again later."}</p>
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
          <p className="settings-body-text mb-1.5">
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
