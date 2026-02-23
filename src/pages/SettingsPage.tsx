import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Settings, Palette, LayoutList, Info, Wrench, Heart, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { useSettings } from "@/hooks/useSettings";
import { Theme, SidebarMode } from "@/contexts/settingsStore";
import { useToolEngine } from "@/hooks/useToolEngine";
import { SITE } from "@/site";
import { cn } from "@/utils/cn";
import {
  getCurrentVersion,
  fetchLatestRelease,
  isNewerVersion,
  type LatestRelease,
} from "@/utils/version";

const DEFAULT_TITLE = "Settings";
const DEFAULT_DESCRIPTION = "Customize your stdout experience";
const UPDATE_BUTTON_LOADING_LABEL = "Checking…";
const UPDATE_BUTTON_LABEL = "Check for updates";
const SEARCH_PLACEHOLDER = "Search tools...";
const SHOW_ALL_LABEL = "Show All";

type Tab = "general" | "tools";
const SETTINGS_TABS: { id: Tab; label: string; icon: typeof Settings; panelId: string }[] = [
  { id: "general", label: "General", icon: Settings, panelId: "settings-general" },
  { id: "tools", label: "Manage Tools", icon: Wrench, panelId: "settings-tools" },
];

const themes: { value: Theme; label: string; desc: string }[] = [
  { value: "light", label: "Light", desc: "Light background with dark text" },
  { value: "dark", label: "Dark", desc: "Dark background with light text" },
  { value: "deep-dark", label: "Deep dark", desc: "Near-black, easy on the eyes" },
  { value: "system", label: "System", desc: "Follow OS preference" },
];

const sidebarModes: { value: SidebarMode; label: string; desc: string }[] = [
  { value: "grouped", label: "Grouped", desc: "Tools organized in collapsible groups" },
  { value: "flat", label: "Flat", desc: "All tools listed without group headers" },
];

type UpdateCheckState = "idle" | "loading" | "current" | "available" | "error";

const SettingsPage = () => {
  const tool = useCurrentTool();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>("general");
  const settings = useSettings();
  const { tools } = useToolEngine();
  const [search, setSearch] = useState("");
  const [updateCheck, setUpdateCheck] = useState<UpdateCheckState>("idle");
  const [latestRelease, setLatestRelease] = useState<LatestRelease | null>(null);

  const currentVersion = getCurrentVersion();

  // When opened from macOS menu "Check for Updates…" (?checkUpdates=1), run check once and clear param
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

  const filteredTools = search
    ? tools.filter(
        (t) =>
          t.label.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : tools;

  const groups = [...new Set(tools.map((t) => t.group))];
  const visibleCount = tools.filter((t) => settings.isToolVisible(t.path)).length;
  const orderedTools = search
    ? filteredTools
    : groups.flatMap((g) => filteredTools.filter((t) => t.group === g));

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
        <div id="settings-general" role="tabpanel" aria-labelledby="tab-general" className="settings-panel">
          <section aria-labelledby="settings-theme-heading">
            <h2 id="settings-theme-heading" className="settings-section-heading">
              <Palette className="h-4 w-4 text-primary" />
              Theme
            </h2>
            <div className="settings-option-grid grid grid-cols-2 sm:grid-cols-4" role="group" aria-label="Theme selection">
              {themes.map((t) => (
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

          <section aria-labelledby="settings-sidebar-heading">
            <h2 id="settings-sidebar-heading" className="settings-section-heading">
              <LayoutList className="h-4 w-4 text-primary" />
              Sidebar Layout
            </h2>
            <div className="settings-option-grid grid grid-cols-2" role="group" aria-label="Sidebar layout">
              {sidebarModes.map((m) => (
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

          <section aria-labelledby="settings-about-heading">
            <h2 id="settings-about-heading" className="settings-section-heading">
              <Info className="h-4 w-4 text-primary" />
              About
            </h2>
            <div className="tool-layout-top-section flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="settings-label">stdout v{currentVersion}</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleCheckForUpdates}
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
              <div className="settings-body-text">
                {tools.length} tools available · {visibleCount} visible in sidebar
              </div>
            </div>
          </section>

          <section aria-labelledby="settings-support-heading">
            <h2 id="settings-support-heading" className="settings-section-heading">
              <Heart className="h-4 w-4 text-primary" />
              Support the project
            </h2>
            <div className="tool-layout-top-section">
              <p className="settings-body-text mb-2">
                stdout is open source (MIT). If it’s useful to you, consider supporting development:
              </p>
              <Button variant="outline" size="xs" asChild>
                <a href={SITE.buyMeACoffee} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                  Buy me a coffee <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </section>
        </div>
      )}

      {tab === "tools" && (
        <div id="settings-tools" role="tabpanel" aria-labelledby="tab-tools" className="settings-panel">
          <div role="search" aria-label="Filter tools" className="settings-tools-toolbar">
            <Input
              type="search"
              aria-label="Search tools"
              placeholder={SEARCH_PLACEHOLDER}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="xs" onClick={settings.setAllToolsVisible}>
              {SHOW_ALL_LABEL}
            </Button>
          </div>

          <p className="settings-body-text">
            {visibleCount} of {tools.length} tools visible in sidebar
          </p>

          <div className="settings-table-wrap">
            <table className="settings-table" role="table" aria-label="Tools visibility">
              <thead>
                <tr>
                  <th scope="col" className="w-10 text-center">
                    <Checkbox
                      checked={visibleCount === tools.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          settings.setAllToolsVisible();
                        } else {
                          tools.forEach((t) => {
                            if (settings.isToolVisible(t.path)) settings.toggleTool(t.path);
                          });
                        }
                      }}
                    />
                  </th>
                  <th scope="col" className="font-medium text-muted-foreground">Tool</th>
                  <th scope="col" className="font-medium text-muted-foreground hidden md:table-cell">Description</th>
                  <th scope="col" className="font-medium text-muted-foreground hidden lg:table-cell">Group</th>
                </tr>
              </thead>
              <tbody>
                {orderedTools.map((tool) => (
                  <tr key={tool.path}>
                    <td className="text-center">
                      <Checkbox
                        checked={settings.isToolVisible(tool.path)}
                        onCheckedChange={() => settings.toggleTool(tool.path)}
                      />
                    </td>
                    <td className="settings-label">{tool.label}</td>
                    <td className="settings-body-text hidden md:table-cell">{tool.description}</td>
                    <td className="hidden lg:table-cell">
                      <span className="settings-body-text px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {tool.group}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};

export default SettingsPage;
