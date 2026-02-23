import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/useSettings";
import { useToolEngine } from "@/hooks/useToolEngine";
import { SEARCH_PLACEHOLDER, SHOW_ALL_LABEL } from "./constants";

const SettingsToolsPanel = () => {
  const settings = useSettings();
  const { tools } = useToolEngine();
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
  const orderedTools = search
    ? filteredTools
    : groups.flatMap((g) => filteredTools.filter((t) => t.group === g));

  return (
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
        <table className="settings-table settings-table--compact" role="table" aria-label="Tools visibility">
          <thead>
            <tr>
              <th scope="col" className="w-9 text-center">
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
              <th scope="col" className="font-medium text-muted-foreground">
                Tool
              </th>
              <th scope="col" className="font-medium text-muted-foreground hidden md:table-cell">
                Description
              </th>
              <th scope="col" className="font-medium text-muted-foreground hidden lg:table-cell">
                Group
              </th>
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
                <td className="settings-label min-w-0">
                  <span className="block truncate" title={tool.label}>{tool.label}</span>
                </td>
                <td className="settings-body-text hidden md:table-cell max-w-[12rem] min-w-0">
                  <span className="block truncate" title={tool.description}>{tool.description}</span>
                </td>
                <td className="hidden lg:table-cell whitespace-nowrap">
                  <span className="settings-body-text inline-block px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                    {tool.group}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SettingsToolsPanel;
