import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { useToolEngine } from "@/hooks/useToolEngine";
import { PrefSection, PrefGroup, PrefRow } from "@/components/settings";
import { SITE } from "@/site";
import type { UpdateCheckState } from "@/types/settings";
import type { LatestRelease } from "@/utils/version";
import { UPDATE_BUTTON_LOADING_LABEL, UPDATE_BUTTON_LABEL } from "./constants";

type ElectronUpdaterStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "not-available" | "error";

type SettingsGeneralPanelProps = {
  currentVersion: string;
  updateCheck: UpdateCheckState;
  latestRelease: LatestRelease | null;
  onCheckForUpdates: () => void;
};

const electronAPI = typeof window !== "undefined" ? window.electronAPI : undefined;
const hasElectronUpdater = !!electronAPI?.updater;

const APP_LANGUAGE_OPTIONS = [{ value: "en", label: "English" }] as const;

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
      <PrefSection heading="App Update" headingId="settings-update-heading">
        <PrefGroup>
          <PrefRow label="Installed" control={<span className="pref-body">stdout v{currentVersion}</span>} />
          <PrefRow
            label="Updates"
            control={
              isElectronDownloaded ? (
                <Button size="sm" onClick={handleQuitAndInstall} aria-label="Restart to install update">
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  <span>Restart to install</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
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
              )
            }
          />
        </PrefGroup>
        {showWebUpdate && updateCheck === "current" && latestRelease && (
          <p className="pref-body">You're on the latest version.</p>
        )}
        {hasElectronUpdater && electronStatus === "not-available" && (
          <p className="pref-body">You're on the latest version.</p>
        )}
        {showWebUpdate && updateCheck === "available" && latestRelease && (
          <p className="pref-body">
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
          <p className="pref-body">Version {electronVersion} available — downloading…</p>
        )}
        {hasElectronUpdater && electronStatus === "downloaded" && electronVersion && (
          <p className="pref-body">Version {electronVersion} downloaded. Restart the app to install.</p>
        )}
        {showWebUpdate && updateCheck === "error" && (
          <p className="pref-body">Could not check for updates. Try again later.</p>
        )}
        {hasElectronUpdater && electronStatus === "error" && (
          <p className="pref-body">{electronError || "Could not check for updates. Try again later."}</p>
        )}
      </PrefSection>

      <PrefSection heading="User Interface" headingId="settings-ui-heading">
        <PrefGroup>
          <PrefRow
            label="App language"
            control={
              <Select value="en" disabled>
                <SelectTrigger size="sm" className="w-auto min-w-[8rem]">
                  <SelectValue placeholder="English" />
                </SelectTrigger>
                <SelectContent>
                  {APP_LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        </PrefGroup>
        <p className="pref-body">English only (more languages in development).</p>
      </PrefSection>

      <PrefSection heading="App Info" headingId="settings-appinfo-heading">
        <PrefGroup>
          <PrefRow
            label="About"
            control={
              <span className="pref-body">
                <AboutStats />
              </span>
            }
          />
          <PrefRow
            label="Report bug or send feedback"
            control={
              <Button variant="outline" size="sm" asChild>
                <a
                  href={SITE.repoIssues}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  Open in browser <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            }
          />
        </PrefGroup>
      </PrefSection>

      <PrefSection heading="Support the project" headingId="settings-support-heading">
        <p className="pref-body flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="min-w-0 flex-1">stdout is open source (MIT). If it's useful to you, consider supporting development:</span>
          <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
            <a href={SITE.buyMeACoffee} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
              Buy me a coffee <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </p>
      </PrefSection>
    </div>
  );
};

function AboutStats() {
  const settings = useSettings();
  const { tools } = useToolEngine();
  const visibleCount = tools.filter((t) => settings.isToolVisible(t.path)).length;
  return <>{tools.length} tools available · {visibleCount} visible in sidebar</>;
}

export default SettingsGeneralPanel;
