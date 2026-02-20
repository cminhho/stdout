import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
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
            <select value={dialect} onChange={(e) => setDialect(e.target.value as SqlDialect)} title="Dialect">
              <option value="standard">Standard</option>
              <option value="mysql">MySQL</option>
              <option value="mariadb">MariaDB</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="plsql">PL/SQL</option>
            </select>
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
            <select value={keywordCase} onChange={(e) => setKeywordCase(e.target.value as SqlKeywordCase)} title="Keyword case">
              <option value="upper">Keywords: Upper</option>
              <option value="lower">Keywords: Lower</option>
            </select>
            <select value={identifierCase} onChange={(e) => setIdentifierCase(e.target.value as SqlIdentifierCase)} title="Identifier case">
              <option value="as-is">Identifiers: As-is</option>
              <option value="upper">Identifiers: Upper</option>
              <option value="lower">Identifiers: Lower</option>
            </select>
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
