import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { validateBatch, getDefaultSchema, type BatchField } from "@/core-utils/fintech";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const SAMPLE_CSV = `id,amount,date,description
TXN001,5000.00,2025-01-15,Monthly payment
TXN002,3200.50,2025-01-16,Partial payment
TXN003,,2025-01-17,Missing amount
TXN004,abc,invalid-date,Bad data row
TXN005,1500.00,2025-01-18,Normal payment`;

const BatchValidatorPage = () => {
  const tool = useCurrentTool();
  const [csvInput, setCsvInput] = useState(SAMPLE_CSV);
  const [schema, setSchema] = useState<BatchField[]>(getDefaultSchema());

  const result = useMemo(() => {
    if (!csvInput.trim()) return null;
    return validateBatch(csvInput, schema);
  }, [csvInput, schema]);

  const updateSchema = (idx: number, field: keyof BatchField, value: any) => {
    setSchema((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const addField = () => setSchema((prev) => [...prev, { name: "", type: "string", required: false }]);
  const removeField = (idx: number) => setSchema((prev) => prev.filter((_, i) => i !== idx));

  return (
    <ToolLayout title={tool?.label ?? "Batch Transaction Validator"} description={tool?.description ?? "Validate batch file format and data integrity"}>
      {/* Schema config */}
      <div className="tool-card mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Validation Schema</div>
          <Button size="sm" variant="ghost" onClick={addField}><Plus className="h-3.5 w-3.5 mr-1" />Add Field</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {schema.map((field, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 bg-muted/30">
              <input
                value={field.name}
                onChange={(e) => updateSchema(i, "name", e.target.value)}
                placeholder="field name"
                className="w-24 bg-transparent border-none outline-none text-xs font-mono text-foreground placeholder:text-muted-foreground"
              />
              <select value={field.type} onChange={(e) => updateSchema(i, "type", e.target.value)} className="tool-select text-[10px] py-0.5 px-1.5">
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="date">date</option>
                <option value="email">email</option>
              </select>
              <label className="tool-checkbox-label text-[10px]">
                <input type="checkbox" checked={field.required} onChange={(e) => updateSchema(i, "required", e.target.checked)} />
                req
              </label>
              <button onClick={() => removeField(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Validation result summary */}
      {result && (
        <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
          <span className={`px-2 py-0.5 rounded font-medium ${
            result.invalidRows === 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
          }`}>
            {result.summary}
          </span>
          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
            Total: <span className="font-mono font-medium text-foreground">{result.totalRows}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
            Valid: <span className="font-mono font-medium text-primary">{result.validRows}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
            Invalid: <span className="font-mono font-medium text-destructive">{result.invalidRows}</span>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="tool-panel">
          <PanelHeader label="CSV Input" text={csvInput} onClear={() => setCsvInput("")} />
          <CodeEditor value={csvInput} onChange={setCsvInput} language="csv" placeholder="Paste CSV content here..." />
        </div>

        {/* Errors */}
        <div className="tool-panel">
          <PanelHeader label="Validation Errors" text={result?.errors.map((e) => `Row ${e.row}, ${e.column}: ${e.message}`).join("\n") || ""} />
          {result && result.errors.length > 0 ? (
            <div className="rounded-lg border border-border overflow-auto flex-1" style={{ minHeight: 450, maxHeight: "92vh" }}>
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground w-16">Row</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground w-24">Column</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((err, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 font-mono text-destructive">{err.row}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{err.column}</td>
                      <td className="px-3 py-2 text-foreground">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <CodeEditor
              value={result ? "✓ All rows passed validation" : ""}
              readOnly
              language="text"
              placeholder="Validation results will appear here..."
            />
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default BatchValidatorPage;
