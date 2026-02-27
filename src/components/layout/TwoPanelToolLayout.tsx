/** Two-panel tool layout with resizable input/output panes, top section (errors/options), and default toolbar. */
import { useMemo, useState, type ReactNode } from "react";
import CodeEditor from "@/components/common/CodeEditor";
import FileUploadButton from "@/components/common/FileUploadButton";
import IndentSelect, { DEFAULT_INDENT, type IndentOption } from "@/components/common/IndentSelect";
import ResizableTwoPanel from "@/components/layout/ResizableTwoPanel";
import type { PaneProps } from "@/components/layout/ToolPane";
import TwoPanelTopSection from "@/components/layout/TwoPanelTopSection";
import { ClearButton } from "@/components/common/ClearButton";
import { SampleButton } from "@/components/common/SampleButton";
import { SaveButton } from "@/components/common/SaveButton";
import ToolLayout from "@/components/layout/ToolLayout";
import { useFormatOutput } from "@/hooks/useFormatOutput";
import { cn } from "@/utils/cn";
import type { ParseError } from "@/utils/validationTypes";

/** Config for default input toolbar: Sample + Clear + File upload. */
export interface DefaultInputToolbarConfig {
  onSample: () => void;
  /** Clear handler; when omitted, derived from setInput (clear = setInput("")). */
  onClear?: () => void;
  /** When set, Clear uses () => setInput("") internally. Ignored if onClear is provided. */
  setInput?: (value: string) => void;
  fileAccept: string;
  onFileText: (text: string) => void;
}

/** Result of format(input, indent); layout uses output and errors when format is provided. */
export interface FormatResult {
  output: string;
  errors?: ParseError[];
}

/** Config for default output toolbar: IndentSelect + Save (when content present). */
export interface DefaultOutputToolbarConfig {
  /** When provided, layout is controlled; otherwise uses internal state (or defaultIndent). */
  indent?: IndentOption;
  /** Notified when indent changes so parent can sync. Omit when using format() – layout owns indent. */
  onIndentChange?: (value: IndentOption) => void;
  /** Initial indent when indent is not provided (uncontrolled). Default: 4 spaces. */
  defaultIndent?: IndentOption;
  /**
   * When provided, layout calls format(inputValue, resolvedIndent) and uses result.output for output
   * content/editor and result.errors for validationErrors (when validationErrors prop is omitted).
   * Sync or async (Promise<FormatResult>); when async, layout shows loading placeholder.
   */
  format?: (input: string, indent: IndentOption) => FormatResult | Promise<FormatResult>;
  outputContent?: string;
  outputFilename?: string;
  outputMimeType?: string;
  /** Pass through to IndentSelect (e.g. includeTab: false for CSS). */
  indentIncludeTab?: boolean;
  indentSpaceOptions?: number[];
}

/** Config for default input CodeEditor; when set (and children not set), layout renders CodeEditor. */
export interface InputEditorConfig {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  errorLines?: Set<number>;
}

export interface TwoPanelInputPaneConfig {
  title?: string;
  copyText?: string;
  onClear?: () => void;
  toolbar?: ReactNode;
  inputToolbar?: DefaultInputToolbarConfig;
  /** Rendered before default Sample/Clear/FileUpload when inputToolbar is set. Use for mode toggles (e.g. Compress/Decompress). */
  inputToolbarExtra?: ReactNode;
  /** When set (and children not set), layout renders CodeEditor. Override with children if needed. */
  inputEditor?: InputEditorConfig;
  /** Pane body; when set, overrides inputEditor. */
  children?: ReactNode;
}

/** Config for default output CodeEditor; when set (and children not set), layout renders read-only CodeEditor. */
export interface OutputEditorConfig {
  value: string;
  language: string;
  placeholder?: string;
  /** Key for React (e.g. indent) to force re-mount when options change. */
  outputKey?: string | number;
}

export interface TwoPanelOutputPaneConfig {
  title?: string;
  copyText?: string;
  toolbar?: ReactNode;
  outputToolbar?: DefaultOutputToolbarConfig;
  /** Rendered before default IndentSelect/Save when outputToolbar is set. Use for output-format toggles (e.g. netlify/docker/yaml). */
  outputToolbarExtra?: ReactNode;
  /** When set (and children not set), layout renders read-only CodeEditor. Override with children if needed. */
  outputEditor?: OutputEditorConfig;
  /** Pane body; when set, overrides outputEditor. */
  children?: ReactNode;
}

export interface TwoPanelToolLayoutProps {
  /**
   * Optional full-width section above the two panels. Use for tool-specific options (e.g. JSONPath
   * expression + examples, filters) that would otherwise crowd the input toolbar and cause the two
   * panes to have unequal header height.
   */
  topSection?: ReactNode;
  /** When provided, called with the last format result (e.g. JsonProcessResult) so the tool can render result-derived UI (e.g. stats) above the panels. */
  topSectionFromResult?: (result: FormatResult | null) => ReactNode;
  /** When present and non-empty, show ValidationErrorList above the two panels and derive input editor error lines (unless inputEditor.errorLines is set). */
  validationErrors?: ParseError[];
  /** When false, hide ValidationErrorList even if validationErrors is set. Default true. */
  showValidationErrors?: boolean;
  defaultInputPercent?: number;
  minInputPercent?: number;
  maxInputPercent?: number;
  resizerWidth?: number;
  className?: string;
  inputPane: TwoPanelInputPaneConfig;
  outputPane: TwoPanelOutputPaneConfig;
}

function resolveInputClear(config: TwoPanelInputPaneConfig): (() => void) | undefined {
  if (config.onClear) return config.onClear;
  const it = config.inputToolbar;
  if (it?.setInput) return () => it.setInput!("");
  return it?.onClear;
}

function errorLinesFromParseErrors(errors: ParseError[]): Set<number> {
  return new Set(errors.map((e) => e.line));
}

function buildInputPaneProps(
  config: TwoPanelInputPaneConfig,
  validationErrors?: ParseError[]
): PaneProps {
  const clearHandler = resolveInputClear(config);
  const toolbar =
    config.toolbar ??
    (config.inputToolbar ? (
      <div className="toolbar-actions-row">
        {config.inputToolbarExtra ?? null}
        <SampleButton onClick={config.inputToolbar.onSample} />
        {clearHandler ? <ClearButton onClick={clearHandler} /> : null}
        <FileUploadButton
          accept={config.inputToolbar.fileAccept}
          onText={config.inputToolbar.onFileText}
        />
      </div>
    ) : undefined);

  const headerClear = config.toolbar != null || !clearHandler ? (config.onClear ?? clearHandler) : undefined;

  const resolvedErrorLines =
    config.inputEditor?.errorLines ??
    (validationErrors?.length ? errorLinesFromParseErrors(validationErrors) : undefined);

  const children =
    config.children ??
    (config.inputEditor ? (
      <div className="flex-1 min-h-0 flex flex-col">
        <CodeEditor
          value={config.inputEditor.value}
          onChange={config.inputEditor.onChange}
          language={config.inputEditor.language as never}
          placeholder={config.inputEditor.placeholder}
          errorLines={resolvedErrorLines}
          fillHeight
        />
      </div>
    ) : undefined);

  return {
    title: config.title,
    copyText: config.copyText,
    onClear: headerClear,
    toolbar,
    children: children ?? null,
  };
}

function hasOutputToSave(content: string | undefined, filename: string | undefined): boolean {
  return Boolean(content && content !== "" && filename && filename !== "");
}

export interface OutputPaneIndentControl {
  resolvedIndent: IndentOption;
  onIndentChange: (value: IndentOption) => void;
}

export interface OutputPaneDerived {
  outputContent: string;
  outputEditorValue: string;
  outputKey: IndentOption;
  loading?: boolean;
}

function buildOutputPaneProps(
  config: TwoPanelOutputPaneConfig,
  indentControl?: OutputPaneIndentControl,
  derived?: OutputPaneDerived
): PaneProps {
  const ot = config.outputToolbar;
  const content = derived?.outputContent ?? ot?.outputContent;
  const editorValue = derived?.outputEditorValue ?? config.outputEditor?.value;
  const toolbar =
    config.toolbar ??
    (ot && indentControl ? (
      <>
        {config.outputToolbarExtra ?? null}
        <IndentSelect
          value={indentControl.resolvedIndent}
          onChange={indentControl.onIndentChange}
          includeTab={ot.indentIncludeTab}
          spaceOptions={ot.indentSpaceOptions}
        />
        {hasOutputToSave(content, ot?.outputFilename) ? (
          <SaveButton
            content={content!}
            filename={ot!.outputFilename!}
            mimeType={ot!.outputMimeType}
          />
        ) : null}
      </>
    ) : undefined);

  const outputKey = derived?.outputKey ?? config.outputEditor?.outputKey ?? indentControl?.resolvedIndent;
  const outputPlaceholder = derived?.loading ? "Formatting…" : config.outputEditor?.placeholder;
  const children =
    config.children ??
    (config.outputEditor ? (
      <div className="flex-1 min-h-0 flex flex-col" key={outputKey}>
        <CodeEditor
          value={editorValue ?? ""}
          readOnly
          language={config.outputEditor.language as never}
          placeholder={outputPlaceholder}
          fillHeight
        />
      </div>
    ) : undefined);

  return {
    title: config.title,
    copyText: derived?.outputContent ?? config.copyText,
    toolbar,
    children: children ?? null,
  };
}

/**
 * Generic two-panel tool layout: ToolLayout + optional ValidationErrorList + ResizableTwoPanel
 * with optional default input toolbar (Sample, Clear, FileUpload) and output toolbar (IndentSelect, Save).
 * Use inputPane.toolbar / outputPane.toolbar for full override; use inputToolbar / outputToolbar for defaults with no duplicated JSX.
 */
const TwoPanelToolLayout = ({
  validationErrors,
  showValidationErrors = true,
  topSection,
  topSectionFromResult,
  defaultInputPercent,
  minInputPercent,
  maxInputPercent,
  resizerWidth,
  className,
  inputPane,
  outputPane,
}: TwoPanelToolLayoutProps) => {
  const ot = outputPane.outputToolbar;
  const [internalIndent, setInternalIndent] = useState<IndentOption>(
    () => ot?.defaultIndent ?? DEFAULT_INDENT
  );
  const resolvedIndent = ot?.indent ?? internalIndent;
  const handleIndentChange = useMemo(() => {
    if (!ot) return undefined;
    return (value: IndentOption) => {
      if (ot.indent === undefined) setInternalIndent(value);
      ot.onIndentChange?.(value);
    };
  }, [ot]);
  const indentControl: OutputPaneIndentControl | undefined =
    ot && handleIndentChange
      ? { resolvedIndent, onIndentChange: handleIndentChange }
      : undefined;

  const inputValue = inputPane.inputEditor?.value ?? "";
  const { result: formatResult, loading: formatLoading, error: formatError } = useFormatOutput<
    FormatResult
  >(inputValue, resolvedIndent, ot?.format ?? null, { fallbackErrorMsg: "Format failed" });
  const effectiveValidationErrors = validationErrors ?? formatResult?.errors ?? [];
  const showValidationListResolved =
    showValidationErrors && (effectiveValidationErrors?.length ?? 0) > 0;
  const derived: OutputPaneDerived | undefined =
    ot?.format
      ? {
          outputContent: formatResult?.output ?? "",
          outputEditorValue: formatResult?.output ?? "",
          outputKey: resolvedIndent,
          loading: formatLoading,
        }
      : undefined;

  const resultSection = topSectionFromResult?.(formatResult ?? null);
  const hasChromeAbove = Boolean(formatError || showValidationListResolved || topSection || resultSection);
  const mergedTopSection =
    resultSection && topSection ? (
      <>
        {resultSection}
        {topSection}
      </>
    ) : (
      resultSection ?? topSection
    );

  return (
    <ToolLayout>
      <TwoPanelTopSection
        formatError={formatError ?? undefined}
        validationErrors={effectiveValidationErrors}
        showValidationErrors={showValidationErrors}
        topSection={mergedTopSection}
      />
      <ResizableTwoPanel
        defaultInputPercent={defaultInputPercent ?? 40}
        minInputPercent={minInputPercent}
        maxInputPercent={maxInputPercent}
        resizerWidth={resizerWidth}
        className={cn(hasChromeAbove && "min-h-0", className)}
        input={buildInputPaneProps(inputPane, effectiveValidationErrors)}
        output={buildOutputPaneProps(outputPane, indentControl, derived)}
      />
    </ToolLayout>
  );
};

export default TwoPanelToolLayout;
