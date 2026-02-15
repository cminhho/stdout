import { lazy } from "react";
import type { ToolDefinition } from "@/tools/types";

export const tools: ToolDefinition[] = [
    // ─── Formatters ──────────────────────────────────────────
    { id: "json-formatter", path: "/formatters/json", label: "JSON Formatter", description: "Format, validate & beautify JSON with strict RFC compliance", group: "Formatters", icon: "Braces", component: lazy(() => import("@/pages/formatters/JsonFormatterPage")) },
    { id: "xml-formatter", path: "/formatters/xml", label: "XML Formatter", description: "Format and beautify XML documents", group: "Formatters", icon: "FileJson", component: lazy(() => import("@/pages/formatters/XmlFormatterPage")) },
    { id: "html-formatter", path: "/formatters/html", label: "HTML Formatter", description: "Format and beautify HTML code", group: "Formatters", icon: "Code2", component: lazy(() => import("@/pages/formatters/HtmlFormatterPage")) },
    { id: "sql-formatter", path: "/formatters/sql", label: "SQL Formatter", description: "Format and beautify SQL queries", group: "Formatters", icon: "Database", component: lazy(() => import("@/pages/formatters/SqlFormatterPage")) },
    { id: "css-formatter", path: "/formatters/css", label: "CSS Formatter", description: "Format and beautify CSS code", group: "Formatters", icon: "FileType", component: lazy(() => import("@/pages/formatters/CssFormatterPage")) },
    { id: "css-inliner", path: "/tools/css-inliner", label: "CSS Inliner (Email)", description: "Inline CSS styles into HTML for email templates", group: "Formatters", icon: "Paintbrush", component: lazy(() => import("@/pages/formatters/CssInlinerPage")) },

    // ─── Minify & Beautify ───────────────────────────────────
    { id: "js-beautifier", path: "/formatters/js-beautifier", label: "JS Beautifier", description: "Format and indent JavaScript code", group: "Minify & Beautify", icon: "Code2", component: lazy(() => import("@/pages/formatters/JsBeautifierPage")) },
    { id: "js-minifier", path: "/formatters/js-minifier", label: "JS Minifier", description: "Remove comments and collapse whitespace in JavaScript", group: "Minify & Beautify", icon: "Code2", component: lazy(() => import("@/pages/formatters/JsMinifierPage")) },
    { id: "css-beautifier", path: "/formatters/css-beautifier", label: "CSS Beautifier", description: "Format and indent CSS code", group: "Minify & Beautify", icon: "FileType", component: lazy(() => import("@/pages/formatters/CssBeautifierPage")) },
    { id: "css-minifier", path: "/formatters/css-minifier", label: "CSS Minifier", description: "Remove comments and collapse whitespace in CSS", group: "Minify & Beautify", icon: "FileType", component: lazy(() => import("@/pages/formatters/CssMinifierPage")) },

    // ─── Validators ─────────────────────────────────────────
    { id: "json-validator", path: "/tools/json-validator", label: "JSON Validator", description: "Validate JSON structure and syntax", group: "Validators", icon: "CheckCircle2", component: lazy(() => import("@/pages/validators/JsonValidatorPage")) },
    { id: "jsonpath", path: "/testers/jsonpath", label: "JSONPath Tester", description: "Test JSONPath expressions against JSON data", group: "Validators", icon: "Braces", component: lazy(() => import("@/pages/validators/JsonPathPage")) },
    { id: "schema-diff", path: "/tools/schema-diff", label: "Schema Diff", description: "Compare two JSON schemas side by side", group: "Validators", icon: "Diff", component: lazy(() => import("@/pages/validators/SchemaDiffPage")) },
    { id: "payload-compare", path: "/tools/payload-compare", label: "Payload Comparator", description: "Compare two JSON payloads and highlight differences", group: "Validators", icon: "GitCompare", component: lazy(() => import("@/pages/validators/PayloadComparatorPage")) },
    { id: "regex-tester", path: "/text/regex", label: "Regex Tester", description: "Test regular expressions with live matching", group: "Validators", icon: "Regex", component: lazy(() => import("@/pages/validators/RegexTesterPage")) },
    { id: "java-regex-tester", path: "/text/java-regex", label: "Java Regex Tester", description: "Test Java-style regular expressions", group: "Validators", icon: "Regex", component: lazy(() => import("@/pages/validators/JavaRegexTesterPage")) },
    { id: "xml-validator", path: "/tools/xml-validator", label: "XML Validator", description: "Validate XML syntax and structure", group: "Validators", icon: "FileJson", component: lazy(() => import("@/pages/validators/XmlValidatorPage")) },
    { id: "html-validator", path: "/tools/html-validator", label: "HTML Validator", description: "Validate HTML syntax (parser-based)", group: "Validators", icon: "Code2", component: lazy(() => import("@/pages/validators/HtmlValidatorPage")) },
    { id: "xpath-tester", path: "/tools/xpath-tester", label: "XPath Tester", description: "Run XPath expressions against XML", group: "Validators", icon: "Braces", component: lazy(() => import("@/pages/validators/XpathTesterPage")) },
    { id: "credit-card", path: "/tools/credit-card", label: "Credit Card Generator & Validator", description: "Luhn check and generate test card numbers", group: "Validators", icon: "KeyRound", component: lazy(() => import("@/pages/validators/CreditCardPage")) },
    { id: "cron-parser", path: "/converters/cron", label: "Cron Parser", description: "Build and parse cron expressions (Quartz-style)", group: "Validators", icon: "Clock", component: lazy(() => import("@/pages/validators/CronBuilderPage")) },

    // ─── Converters ──────────────────────────────────────────
    { id: "json-yaml", path: "/converters/json-yaml", label: "JSON ↔ YAML", description: "Convert between JSON and YAML formats", group: "Converters", icon: "FileJson", component: lazy(() => import("@/pages/converters/JsonYamlPage")) },
    { id: "csv-json", path: "/converters/csv-json", label: "CSV ↔ JSON", description: "Convert between CSV and JSON formats", group: "Converters", icon: "FileSpreadsheet", component: lazy(() => import("@/pages/converters/CsvJsonPage")) },
    { id: "json-table", path: "/converters/json-table", label: "JSON → Table", description: "Visualize JSON data as a table", group: "Converters", icon: "Table2", component: lazy(() => import("@/pages/converters/JsonTablePage")) },
    { id: "json-types", path: "/converters/json-types", label: "JSON → Types", description: "Generate TypeScript types from JSON", group: "Converters", icon: "FileOutput", component: lazy(() => import("@/pages/converters/JsonTypescriptPage")) },
    { id: "json-querystring", path: "/converters/json-querystring", label: "JSON ↔ Query String", description: "Convert between JSON and URL query strings", group: "Converters", icon: "Link2", component: lazy(() => import("@/pages/converters/JsonQueryStringPage")) },
    { id: "timestamp", path: "/converters/timestamp", label: "Epoch Timestamp", description: "Convert between Unix timestamps and dates", group: "Converters", icon: "CalendarClock", component: lazy(() => import("@/pages/converters/TimestampPage")) },
    { id: "number-base", path: "/converters/number-base", label: "Number Base", description: "Convert numbers between bases (bin, oct, dec, hex)", group: "Converters", icon: "Binary", component: lazy(() => import("@/pages/converters/NumberBasePage")) },
    { id: "color-converter", path: "/generators/color", label: "Color Converter", description: "Convert colors between HEX, RGB, HSL formats", group: "Converters", icon: "Palette", component: lazy(() => import("@/pages/converters/ColorConverterPage")) },
    { id: "image-base64", path: "/converters/image-base64", label: "Image ↔ Base64", description: "Convert images to/from Base64 strings", group: "Converters", icon: "Image", component: lazy(() => import("@/pages/converters/ImageBase64Page")) },
    { id: "env-converter", path: "/converters/env-netlify", label: ".env Converter", description: "Convert .env files to Netlify, Docker, YAML formats", group: "Converters", icon: "FileUp", component: lazy(() => import("@/pages/converters/EnvNetlifyPage")) },
    { id: "css-units", path: "/converters/css-units", label: "CSS Units", description: "Convert between CSS units (px, rem, em, vw)", group: "Converters", icon: "Ruler", component: lazy(() => import("@/pages/converters/CssUnitsPage")) },
    { id: "xsd-generator", path: "/converters/xsd-generator", label: "XSD Generator", description: "Generate minimal XSD schema from XML", group: "Converters", icon: "FileJson", component: lazy(() => import("@/pages/converters/XsdGeneratorPage")) },
    { id: "xslt-transformer", path: "/converters/xslt-transformer", label: "XSLT Transformer", description: "Transform XML using XSLT stylesheet", group: "Converters", icon: "FileCode", component: lazy(() => import("@/pages/converters/XsltTransformerPage")) },
    { id: "xml-json", path: "/converters/xml-json", label: "XML ↔ JSON", description: "Convert between XML and JSON", group: "Converters", icon: "Braces", component: lazy(() => import("@/pages/converters/XmlJsonPage")) },
    { id: "csv-xml", path: "/converters/csv-xml", label: "CSV → XML", description: "Convert CSV to XML (first row as element names)", group: "Converters", icon: "FileSpreadsheet", component: lazy(() => import("@/pages/converters/CsvXmlPage")) },

    // ─── Encoders / Cryptography ─────────────────────────────
    { id: "url-encode", path: "/encode/url", label: "URL Encode", description: "Encode and decode URL components", group: "Encode & Crypto", icon: "Link2", component: lazy(() => import("@/pages/encode/UrlEncodePage")) },
    { id: "base64", path: "/encode/base64", label: "Base64", description: "Encode and decode Base64 strings", group: "Encode & Crypto", icon: "Code2", component: lazy(() => import("@/pages/encode/Base64Page")) },
    { id: "html-entity", path: "/encode/html", label: "HTML Entity", description: "Encode and decode HTML entities", group: "Encode & Crypto", icon: "Code2", component: lazy(() => import("@/pages/encode/HtmlEntityPage")) },
    { id: "jwt-decode", path: "/encode/jwt", label: "JWT Debugger", description: "Decode and inspect JWT tokens", group: "Encode & Crypto", icon: "ShieldCheck", component: lazy(() => import("@/pages/encode/JwtDecodePage")) },
    { id: "qr-code", path: "/encode/qrcode", label: "QR Code", description: "Generate QR codes from text or URLs", group: "Encode & Crypto", icon: "QrCode", component: lazy(() => import("@/pages/encode/QrCodePage")) },
    { id: "gzip", path: "/encode/gzip", label: "Gzip", description: "Compress and decompress with Gzip", group: "Encode & Crypto", icon: "Archive", component: lazy(() => import("@/pages/encode/GzipPage")) },
    { id: "certificate", path: "/encode/certificate", label: "Certificate Inspector", description: "Inspect and decode X.509 certificates", group: "Encode & Crypto", icon: "ShieldCheck", component: lazy(() => import("@/pages/encode/CertificatePage")) },
    { id: "file-encoding", path: "/encode/file-encoding", label: "Convert File Encoding", description: "Decode bytes from charset or encode text to UTF-8", group: "Encode & Crypto", icon: "FileCode", component: lazy(() => import("@/pages/encode/FileEncodingPage")) },
    { id: "hash-generator", path: "/hash", label: "Message Digester", description: "MD5, SHA-1, SHA-256 hashes", group: "Encode & Crypto", icon: "Hash", component: lazy(() => import("@/pages/encode/HashGeneratorPage")) },
    { id: "hmac-generator", path: "/generators/hmac", label: "HMAC Generator", description: "Generate HMAC signatures", group: "Encode & Crypto", icon: "KeySquare", component: lazy(() => import("@/pages/encode/HmacPage")) },

    // ─── String Escaper & Utilities ─────────────────────────
    { id: "string-transformer", path: "/text/transform", label: "String Utilities", description: "Convert between camelCase, snake_case, and more", group: "String & Utilities", icon: "Wand2", component: lazy(() => import("@/pages/string-utils/StringTransformerPage")) },
    { id: "list-collator", path: "/text/list-collator", label: "List Collator", description: "Merge, sort, and deduplicate lists", group: "String & Utilities", icon: "List", component: lazy(() => import("@/pages/string-utils/ListCollatorPage")) },
    { id: "text-analyzer", path: "/text/analyzer", label: "Text Analyzer", description: "Count words, characters, sentences in text", group: "String & Utilities", icon: "Type", component: lazy(() => import("@/pages/string-utils/TextAnalyzerPage")) },
    { id: "text-diff", path: "/text/diff", label: "Text Diff", description: "Compare two texts and highlight differences", group: "String & Utilities", icon: "GitCompare", component: lazy(() => import("@/pages/string-utils/TextDiffPage")) },
    { id: "xml-escape", path: "/text/escape/xml", label: "XML Escape", description: "Escape and unescape XML special characters", group: "String & Utilities", icon: "Code2", component: lazy(() => import("@/pages/string-utils/XmlEscapePage")) },
    { id: "java-escape", path: "/text/escape/java", label: "Java / .NET Escape", description: "Escape string literals for Java and .NET", group: "String & Utilities", icon: "Code2", component: lazy(() => import("@/pages/string-utils/JavaDotNetEscapePage")) },
    { id: "javascript-escape", path: "/text/escape/javascript", label: "JavaScript Escape", description: "Escape JavaScript string literals", group: "String & Utilities", icon: "Code2", component: lazy(() => import("@/pages/string-utils/JavaScriptEscapePage")) },
    { id: "json-escape", path: "/text/escape/json", label: "JSON Escape", description: "Escape JSON string content", group: "String & Utilities", icon: "Braces", component: lazy(() => import("@/pages/string-utils/JsonEscapePage")) },
    { id: "csv-escape", path: "/text/escape/csv", label: "CSV Escape", description: "Escape CSV fields (RFC 4180)", group: "String & Utilities", icon: "FileSpreadsheet", component: lazy(() => import("@/pages/string-utils/CsvEscapePage")) },
    { id: "sql-escape", path: "/text/escape/sql", label: "SQL Escape", description: "Escape SQL string literals", group: "String & Utilities", icon: "Database", component: lazy(() => import("@/pages/string-utils/SqlEscapePage")) },

    // ─── Web Resources ───────────────────────────────────────
    { id: "lorem-ipsum", path: "/generators/lorem", label: "Lorem Ipsum", description: "Generate placeholder text", group: "Web Resources", icon: "AlignLeft", component: lazy(() => import("@/pages/web-resources/LoremIpsumPage")) },
    { id: "url-parser", path: "/tools/url-parser", label: "URL Parser", description: "Parse and inspect URL / query string", group: "Web Resources", icon: "Globe", component: lazy(() => import("@/pages/web-resources/UrlParserPage")) },
    { id: "mime-types", path: "/tools/mime-types", label: "List of MIME Types", description: "Reference table of common MIME types", group: "Web Resources", icon: "FileText", component: lazy(() => import("@/pages/web-resources/MimeTypesPage")) },
    { id: "markdown-preview", path: "/text/markdown", label: "Markdown Preview", description: "Live preview of Markdown with GFM support", group: "Web Resources", icon: "FileText", component: lazy(() => import("@/pages/web-resources/MarkdownPreviewPage")) },

    // ─── Generators ─────────────────────────────────────────
    { id: "uuid-generator", path: "/generators/uuid", label: "UUID Generator", description: "Generate UUIDs (v1, v4, v7)", group: "Generators", icon: "Fingerprint", component: lazy(() => import("@/pages/generators/UuidPage")) },
    { id: "password-generator", path: "/generators/password", label: "Password Generator", description: "Generate secure passwords with custom rules", group: "Generators", icon: "KeyRound", component: lazy(() => import("@/pages/generators/PasswordPage")) },
    { id: "random-string", path: "/generators/random-string", label: "Random String", description: "Generate cryptographically secure random strings", group: "Generators", icon: "Dices", component: lazy(() => import("@/pages/generators/RandomStringPage")) },
    { id: "mock-generator", path: "/generators/mock", label: "Mock Payload", description: "Generate mock JSON data from a schema", group: "Generators", icon: "Boxes", component: lazy(() => import("@/pages/generators/MockGeneratorPage")) },
    { id: "ascii-art", path: "/generators/ascii-art", label: "ASCII Art", description: "Turn text into ASCII art", group: "Generators", icon: "LetterText", component: lazy(() => import("@/pages/generators/AsciiArtPage")) },
    { id: "log-generator", path: "/generators/log", label: "Log Generator", description: "Generate synthetic log data for testing", group: "Generators", icon: "ScrollText", component: lazy(() => import("@/pages/generators/LogGeneratorPage")) },

    // ─── Image & Media ───────────────────────────────────────
    { id: "svg-viewer", path: "/tools/svg-viewer", label: "SVG Viewer", description: "View, edit, and export SVG graphics", group: "Image & Media", icon: "Eye", component: lazy(() => import("@/pages/image-media/SvgViewerPage")) },
    { id: "image-resizer", path: "/tools/image-resizer", label: "Image Resizer", description: "Resize images with format conversion", group: "Image & Media", icon: "Scaling", component: lazy(() => import("@/pages/image-media/ImageResizerPage")) },

    // ─── Networking & Other ─────────────────────────────────
    { id: "curl-builder", path: "/builders/curl", label: "cURL Builder", description: "Build cURL commands visually", group: "Networking & Other", icon: "TerminalSquare", component: lazy(() => import("@/pages/networking/CurlBuilderPage")) },
    { id: "har-viewer", path: "/tools/har-viewer", label: "HAR Viewer", description: "Inspect HAR (HTTP Archive) files", group: "Networking & Other", icon: "FileArchive", component: lazy(() => import("@/pages/networking/HarViewerPage")) },
    { id: "csv-viewer", path: "/tools/csv-viewer", label: "CSV Viewer", description: "View and search CSV files in a table", group: "Networking & Other", icon: "TableProperties", component: lazy(() => import("@/pages/networking/CsvViewerPage")) },
    { id: "math-calculator", path: "/tools/math", label: "Math Calculator", description: "Evaluate math expressions", group: "Networking & Other", icon: "Calculator", component: lazy(() => import("@/pages/networking/MathCalculatorPage")) },
  ];
