import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { SelectWithOptions } from "@/components/ui/select";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { ClearButton, SampleButton, SaveButton } from "@/components/ToolActionButtons";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import {
  type SqlDialect,
  type SqlIdentifierCase,
  type SqlKeywordCase,
  processSqlInput,
  SQL_FILE_ACCEPT,
  SQL_FORMATTER_SAMPLE,
  SQL_INPUT_PLACEHOLDER,
  SQL_LANGUAGE,
  SQL_MIME_TYPE,
  SQL_OUTPUT_FILENAME,
  SQL_OUTPUT_PLACEHOLDER,
} from "@/utils/sqlFormat";

const DIALECT_OPTIONS: { value: SqlDialect; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "plsql", label: "PL/SQL" },
];

const KEYWORD_CASE_OPTIONS: { value: SqlKeywordCase; label: string }[] = [
  { value: "upper", label: "Keywords: Upper" },
  { value: "lower", label: "Keywords: Lower" },
];

const IDENTIFIER_CASE_OPTIONS: { value: SqlIdentifierCase; label: string }[] = [
  { value: "as-is", label: "Identifiers: As-is" },
  { value: "upper", label: "Identifiers: Upper" },
  { value: "lower", label: "Identifiers: Lower" },
];

const SqlFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);
  const [keywordCase, setKeywordCase] = useState<SqlKeywordCase>("upper");
  const [identifierCase, setIdentifierCase] = useState<SqlIdentifierCase>("as-is");
  const [dialect, setDialect] = useState<SqlDialect>("standard");

  const output = useMemo(
    () => processSqlInput(input, indent, dialect, keywordCase, identifierCase),
    [input, indent, dialect, keywordCase, identifierCase]
  );

  const loadSample = () => setInput(SQL_FORMATTER_SAMPLE);
  const clearInput = () => setInput("");

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        toolbar: (
          <>
            <SampleButton onClick={loadSample} />
            <ClearButton onClick={clearInput} />
            <FileUploadButton accept={SQL_FILE_ACCEPT} onText={setInput} />
            <SelectWithOptions<SqlDialect>
              size="sm"
              value={dialect}
              onValueChange={setDialect}
              options={DIALECT_OPTIONS}
              title="Dialect"
              aria-label="SQL dialect"
            />
          </>
        ),
        onClear: clearInput,
        children: (
          <CodeEditor
            value={input}
            onChange={setInput}
            language={SQL_LANGUAGE}
            placeholder={SQL_INPUT_PLACEHOLDER}
            fillHeight
          />
        ),
      }}
      outputPane={{
        copyText: output,
        toolbar: (
          <>
            <SelectWithOptions<SqlKeywordCase>
              size="sm"
              value={keywordCase}
              onValueChange={setKeywordCase}
              options={KEYWORD_CASE_OPTIONS}
              title="Keyword case"
              aria-label="Keyword case"
            />
            <SelectWithOptions<SqlIdentifierCase>
              size="sm"
              value={identifierCase}
              onValueChange={setIdentifierCase}
              options={IDENTIFIER_CASE_OPTIONS}
              title="Identifier case"
              aria-label="Identifier case"
            />
            <IndentSelect value={indent} onChange={setIndent} />
            {output ? (
              <SaveButton content={output} filename={SQL_OUTPUT_FILENAME} mimeType={SQL_MIME_TYPE} />
            ) : null}
          </>
        ),
        children: (
          <CodeEditor
            key={`result-${indent}-${dialect}-${keywordCase}-${identifierCase}`}
            value={output}
            readOnly
            language={SQL_LANGUAGE}
            placeholder={SQL_OUTPUT_PLACEHOLDER}
            fillHeight
          />
        ),
      }}
    />
  );
};

export default SqlFormatterPage;
