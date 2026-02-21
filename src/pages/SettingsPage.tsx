import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Settings, Palette, LayoutList, Info, Wrench, Heart, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { useSettings } from "@/hooks/useSettings";
import { Theme, SidebarMode } from "@/contexts/settingsStore";
import { useToolEngine } from "@/hooks/useToolEngine";
import { Checkbox } from "@/components/ui/checkbox";
import { SITE } from "@/site";
import {
  getCurrentVersion,
  fetchLatestRelease,
  isNewerVersion,
  type LatestRelease,
} from "@/utils/version";

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

type Tab = "general" | "tools";

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

  return (
    <ToolLayout title={tool?.label ?? "Settings"} description={tool?.description ?? "Customize your stdout experience"}>
      {/* Tabs: VS Code/Linear style – role="tablist", aria-selected, consistent radius */}
      <div role="tablist" aria-label="Settings sections" className="flex gap-1 mb-4 border-b border-border">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "general"}
          aria-controls="settings-general"
          id="tab-general"
          onClick={() => setTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-t ${
            tab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="h-4 w-4" />
          General
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "tools"}
          aria-controls="settings-tools"
          id="tab-tools"
          onClick={() => setTab("tools")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-t ${
            tab === "tools"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wrench className="h-4 w-4" />
          Manage Tools
        </button>
      </div>

      {tab === "general" && (
        <div id="settings-general" role="tabpanel" aria-labelledby="tab-general" className="space-y-6 max-w-2xl">
          {/* Theme */}
          <section aria-labelledby="settings-theme-heading">
            <h2 id="settings-theme-heading" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Palette className="h-4 w-4 text-primary" />
              Theme
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-label="Theme selection">
              {themes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => settings.setTheme(t.value)}
                  aria-pressed={settings.theme === t.value}
                  className={`rounded-md border p-4 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    settings.theme === t.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:bg-muted/50 hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="text-sm font-medium text-foreground">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Sidebar Mode */}
          <section aria-labelledby="settings-sidebar-heading">
            <h2 id="settings-sidebar-heading" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <LayoutList className="h-4 w-4 text-primary" />
              Sidebar Layout
            </h2>
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Sidebar layout">
              {sidebarModes.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => settings.setSidebarMode(m.value)}
                  aria-pressed={settings.sidebarMode === m.value}
                  className={`rounded-md border p-4 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    settings.sidebarMode === m.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:bg-muted/50 hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="text-sm font-medium text-foreground">{m.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* About */}
          <section aria-labelledby="settings-about-heading">
            <h2 id="settings-about-heading" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Info className="h-4 w-4 text-primary" />
              About
            </h2>
            <div className="rounded-md border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">stdout v{currentVersion}</span>
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
                  <span>{updateCheck === "loading" ? "Checking…" : "Check for updates"}</span>
                </Button>
              </div>
              {updateCheck === "current" && latestRelease && (
                <p className="text-xs text-muted-foreground">You're on the latest version.</p>
              )}
              {updateCheck === "available" && latestRelease && (
                <p className="text-xs text-foreground">
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
                <p className="text-xs text-muted-foreground">Could not check for updates. Try again later.</p>
              )}
              <div className="text-xs text-muted-foreground">
                A modular, plugin-based developer tool platform built with React, TypeScript, and Tailwind CSS.
                All tools run entirely in your browser — no data is sent to any server.
              </div>
              <div className="text-xs text-muted-foreground">
                {tools.length} tools available · {visibleCount} visible in sidebar
              </div>
            </div>
          </section>

          {/* Support the project */}
          <section aria-labelledby="settings-support-heading">
            <h2 id="settings-support-heading" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Heart className="h-4 w-4 text-primary" />
              Support the project
            </h2>
            <div className="rounded-md border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground mb-2">
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
        <div id="settings-tools" role="tabpanel" aria-labelledby="tab-tools" className="space-y-4">
          <div role="search" aria-label="Filter tools" className="flex items-center justify-between gap-4">
            <input
              type="search"
              aria-label="Search tools"
              className="flex-1 h-9 rounded-md border border-outlineButton-border bg-outlineButton-bg px-2.5 py-2 text-sm text-outlineButton-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" size="xs" onClick={settings.setAllToolsVisible}>
              Show All
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {visibleCount} of {tools.length} tools visible in sidebar
          </p>

          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm" role="table" aria-label="Tools visibility">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th scope="col" className="w-10 p-3 text-center">
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
                  <th scope="col" className="p-3 text-left font-medium text-muted-foreground">Tool</th>
                  <th scope="col" className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Description</th>
                  <th scope="col" className="p-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Group</th>
                </tr>
              </thead>
              <tbody>
                {(search ? filteredTools : groups.flatMap((g) => filteredTools.filter((t) => t.group === g))).map(
                  (tool) => (
                    <tr
                      key={tool.path}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors duration-150"
                    >
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={settings.isToolVisible(tool.path)}
                          onCheckedChange={() => settings.toggleTool(tool.path)}
                        />
                      </td>
                      <td className="p-3 text-foreground font-medium">{tool.label}</td>
                      <td className="p-3 text-muted-foreground text-xs hidden md:table-cell">{tool.description}</td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {tool.group}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};

export default SettingsPage;
