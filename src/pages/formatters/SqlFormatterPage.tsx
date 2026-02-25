import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { SelectWithOptions, type SelectOption } from "@/components/ui/select";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SaveButton } from "@/components/SaveButton";
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

const DIALECT_OPTIONS: SelectOption<SqlDialect>[] = [
  { value: "standard", label: "Standard" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "plsql", label: "PL/SQL" },
];

const KEYWORD_CASE_OPTIONS: SelectOption<SqlKeywordCase>[] = [
  { value: "upper", label: "Keywords: Upper" },
  { value: "lower", label: "Keywords: Lower" },
];

const IDENTIFIER_CASE_OPTIONS: SelectOption<SqlIdentifierCase>[] = [
  { value: "as-is", label: "Identifiers: As-is" },
  { value: "upper", label: "Identifiers: Upper" },
  { value: "lower", label: "Identifiers: Lower" },
];

const TOOLBAR_SELECT_PROPS = { size: "xs" as const, variant: "secondary" as const };

const DEFAULT_DIALECT: SqlDialect = "standard";
const DEFAULT_KEYWORD_CASE: SqlKeywordCase = "upper";
const DEFAULT_IDENTIFIER_CASE: SqlIdentifierCase = "as-is";

const SqlFormatterPage = () => {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);
  const [keywordCase, setKeywordCase] = useState<SqlKeywordCase>(DEFAULT_KEYWORD_CASE);
  const [identifierCase, setIdentifierCase] = useState<SqlIdentifierCase>(DEFAULT_IDENTIFIER_CASE);
  const [dialect, setDialect] = useState<SqlDialect>(DEFAULT_DIALECT);

  const output = useMemo(
    () => processSqlInput(input, indent, dialect, keywordCase, identifierCase),
    [input, indent, dialect, keywordCase, identifierCase]
  );

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SQL_FORMATTER_SAMPLE),
          setInput,
          fileAccept: SQL_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <SelectWithOptions<SqlDialect>
            {...TOOLBAR_SELECT_PROPS}
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
              {...TOOLBAR_SELECT_PROPS}
              value={keywordCase}
              onValueChange={setKeywordCase}
              options={KEYWORD_CASE_OPTIONS}
              title="Keyword case"
              aria-label="Keyword case"
            />
            <SelectWithOptions<SqlIdentifierCase>
              {...TOOLBAR_SELECT_PROPS}
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
            key={[indent, dialect, keywordCase, identifierCase].join("-")}
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
