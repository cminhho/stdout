import { useState } from "react";
import { Settings, Palette, LayoutList, Info, Wrench, Heart, ExternalLink } from "lucide-react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { useSettings, Theme, SidebarMode } from "@/contexts/SettingsContext";
import { useToolEngine } from "@/hooks/useToolEngine";
import { Checkbox } from "@/components/ui/checkbox";
import { SITE } from "@/config/site";

const themes: { value: Theme; label: string; desc: string }[] = [
  { value: "dark", label: "Dark", desc: "Dark background with light text" },
  { value: "light", label: "Light", desc: "Light background with dark text" },
  { value: "system", label: "System", desc: "Follow OS preference" },
];

const sidebarModes: { value: SidebarMode; label: string; desc: string }[] = [
  { value: "grouped", label: "Grouped", desc: "Tools organized in collapsible groups" },
  { value: "flat", label: "Flat", desc: "All tools listed without group headers" },
];

type Tab = "general" | "tools";

const SettingsPage = () => {
  const tool = useCurrentTool();
  const [tab, setTab] = useState<Tab>("general");
  const settings = useSettings();
  const { tools, edition } = useToolEngine();
  const [search, setSearch] = useState("");

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
    <ToolLayout title={tool?.label ?? "Settings"} description={tool?.description ?? "Customize your Stdout experience"}>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="h-4 w-4" />
          General
        </button>
        <button
          onClick={() => setTab("tools")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
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
        <div className="space-y-8 max-w-2xl">
          {/* Theme */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Palette className="h-4 w-4 text-primary" />
              Theme
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => settings.setTheme(t.value)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    settings.theme === t.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="text-sm font-medium text-foreground">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Sidebar Mode */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <LayoutList className="h-4 w-4 text-primary" />
              Sidebar Layout
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {sidebarModes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => settings.setSidebarMode(m.value)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    settings.sidebarMode === m.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="text-sm font-medium text-foreground">{m.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Info className="h-4 w-4 text-primary" />
              About
            </h3>
            <div className="rounded-lg border border-border p-4 space-y-2">
              <div className="text-sm text-foreground font-medium">Stdout v1.0.0</div>
              <div className="text-xs text-muted-foreground">
                A modular, plugin-based developer tool platform built with React, TypeScript, and Tailwind CSS.
                All tools run entirely in your browser — no data is sent to any server.
              </div>
              <div className="text-xs text-muted-foreground">
                {tools.length} tools available • {visibleCount} visible in sidebar
              </div>
            </div>
          </section>

          {/* Support / Sponsor */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Heart className="h-4 w-4 text-primary" />
              Support the project
            </h3>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground mb-3">
                Stdout is open source (MIT). If it’s useful to you, consider supporting development:
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={SITE.githubSponsors}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
                >
                  GitHub Sponsors <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={SITE.buyMeACoffee}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
                >
                  Buy me a coffee <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </section>
        </div>
      )}

      {tab === "tools" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <input
              className="flex-1 rounded-md border px-3 py-2 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={settings.setAllToolsVisible}
              className="text-xs px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
            >
              Show All
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            {visibleCount} of {tools.length} tools visible in sidebar
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-10 p-3 text-center">
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
                  <th className="p-3 text-left font-medium text-muted-foreground">Tool</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Description</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Group</th>
                </tr>
              </thead>
              <tbody>
                {(search ? filteredTools : groups.flatMap((g) => filteredTools.filter((t) => t.group === g))).map(
                  (tool) => (
                    <tr
                      key={tool.path}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
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
