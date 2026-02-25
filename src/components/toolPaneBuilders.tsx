import type { ReactNode } from "react";

import CodeEditor, { type Language } from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import type { PaneProps } from "@/components/ToolPane";

export interface EditorPaneConfig {
  title: string;
  value: string;
  onChange: (value: string) => void;
  onSample: () => void;
  /** When omitted, clear sets value to "" via onChange. */
  onClear?: () => void;
  placeholder?: string;
  fileAccept: string;
  language?: Language;
}

/**
 * Builds PaneProps for a pane with Sample + Clear + FileUpload toolbar and a CodeEditor.
 * Reusable for two-panel tools (e.g. Schema Diff, Payload Comparator) that need two independent editor panes.
 */
export function buildEditorPaneProps(config: EditorPaneConfig): PaneProps {
  const {
    title,
    value,
    onChange,
    onSample,
    onClear,
    placeholder,
    fileAccept,
    language = "json",
  } = config;

  const toolbar: ReactNode = (
    <>
      <SampleButton onClick={onSample} />
      <ClearButton onClick={onClear ?? (() => onChange(""))} />
      <FileUploadButton accept={fileAccept} onText={onChange} />
    </>
  );

  return {
    title,
    toolbar,
    children: (
      <CodeEditor
        value={value}
        onChange={onChange}
        language={language}
        placeholder={placeholder}
        fillHeight
      />
    ),
  };
}
