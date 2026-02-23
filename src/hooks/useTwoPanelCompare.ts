import { useMemo, useState } from "react";
import { buildEditorPaneProps } from "@/components/toolPaneBuilders";
import type { PaneProps } from "@/components/ToolPane";

/** Config for one side of a two-panel compare (no value/onChange – those come from hook state). */
export interface TwoPanelComparePaneConfig {
  title: string;
  placeholder?: string;
  sample: string;
  fileAccept: string;
  language?: "json" | "text";
}

export interface UseTwoPanelCompareResult {
  left: string;
  right: string;
  setLeft: (value: string) => void;
  setRight: (value: string) => void;
  leftPane: PaneProps;
  rightPane: PaneProps;
}

const FILE_ACCEPT_JSON = ".json,application/json";

/**
 * Shared state and pane props for two-panel compare tools (Payload Comparator, Schema Diff).
 * Uses design tokens and buildEditorPaneProps for consistent toolbar (Sample, Clear, FileUpload) and layout.
 */
export function useTwoPanelCompare(
  leftConfig: TwoPanelComparePaneConfig,
  rightConfig: TwoPanelComparePaneConfig
): UseTwoPanelCompareResult {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const leftPane = useMemo<PaneProps>(
    () =>
      buildEditorPaneProps({
        title: leftConfig.title,
        value: left,
        onChange: setLeft,
        onSample: () => setLeft(leftConfig.sample),
        placeholder: leftConfig.placeholder,
        fileAccept: leftConfig.fileAccept ?? FILE_ACCEPT_JSON,
        language: leftConfig.language ?? "json",
      }),
    [left, leftConfig.title, leftConfig.sample, leftConfig.placeholder, leftConfig.fileAccept, leftConfig.language]
  );

  const rightPane = useMemo<PaneProps>(
    () =>
      buildEditorPaneProps({
        title: rightConfig.title,
        value: right,
        onChange: setRight,
        onSample: () => setRight(rightConfig.sample),
        placeholder: rightConfig.placeholder,
        fileAccept: rightConfig.fileAccept ?? FILE_ACCEPT_JSON,
        language: rightConfig.language ?? "json",
      }),
    [right, rightConfig.title, rightConfig.sample, rightConfig.placeholder, rightConfig.fileAccept, rightConfig.language]
  );

  return { left, right, setLeft, setRight, leftPane, rightPane };
}
