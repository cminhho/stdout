import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { SelectWithOptions } from "@/components/ui/select";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SaveButton } from "@/components/SaveButton";
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

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SQL_FORMATTER_SAMPLE),
          setInput,
          fileAccept: SQL_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <SelectWithOptions<SqlDialect>
            size="xs"
            variant="secondary"
            value={dialect}
            onValueChange={setDialect}
            options={DIALECT_OPTIONS}
            title="Dialect"
            aria-label="SQL dialect"
          />
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: SQL_LANGUAGE,
          placeholder: SQL_INPUT_PLACEHOLDER,
        },
      }}
      outputPane={{
        copyText: output,
        toolbar: (
          <>
            <SelectWithOptions<SqlKeywordCase>
              size="xs"
              variant="secondary"
              value={keywordCase}
              onValueChange={setKeywordCase}
              options={KEYWORD_CASE_OPTIONS}
              title="Keyword case"
              aria-label="Keyword case"
            />
            <SelectWithOptions<SqlIdentifierCase>
              size="xs"
              variant="secondary"
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
