# Stdout

**Your standard output for dev tools.**  
Format, convert, encode, generate — all in one place.

Stdout is a lightweight, in-browser developer tools platform.  
No backend. Everything runs locally in your browser.

Built for **trust, performance, and extensibility**.

---

## ✨ Features

Full list of tools (from Public Developer Tools pack):

| Tool | Description |
|------|-------------|
| JSON Formatter | Format, validate & beautify JSON with strict RFC compliance |
| XML Formatter | Format and beautify XML documents |
| HTML Formatter | Format and beautify HTML code |
| SQL Formatter | Format and beautify SQL queries |
| CSS Formatter | Format and beautify CSS code |
| CSS Inliner (Email) | Inline CSS styles into HTML for email templates |
| JS Beautifier | Format and indent JavaScript code |
| JS Minifier | Remove comments and collapse whitespace in JavaScript |
| CSS Beautifier | Format and indent CSS code |
| CSS Minifier | Remove comments and collapse whitespace in CSS |
| JSON Validator | Validate JSON structure and syntax |
| JSONPath Tester | Test JSONPath expressions against JSON data |
| Schema Diff | Compare two JSON schemas side by side |
| Payload Comparator | Compare two JSON payloads and highlight differences |
| Regex Tester | Test regular expressions with live matching |
| Java Regex Tester | Test Java-style regular expressions |
| XML Validator | Validate XML syntax and structure |
| HTML Validator | Validate HTML syntax (parser-based) |
| XPath Tester | Run XPath expressions against XML |
| Credit Card Generator & Validator | Luhn check and generate test card numbers |
| Cron Parser | Build and parse cron expressions (Quartz-style) |
| JSON ↔ YAML | Convert between JSON and YAML formats |
| CSV ↔ JSON | Convert between CSV and JSON formats |
| JSON → Table | Visualize JSON data as a table |
| JSON → Types | Generate TypeScript types from JSON |
| JSON ↔ Query String | Convert between JSON and URL query strings |
| Epoch Timestamp | Convert between Unix timestamps and dates |
| Number Base | Convert numbers between bases (bin, oct, dec, hex) |
| Color Converter | Convert colors between HEX, RGB, HSL formats |
| Image ↔ Base64 | Convert images to/from Base64 strings |
| .env Converter | Convert .env files to Netlify, Docker, YAML formats |
| CSS Units | Convert between CSS units (px, rem, em, vw) |
| XSD Generator | Generate minimal XSD schema from XML |
| XSLT Transformer | Transform XML using XSLT stylesheet |
| XML ↔ JSON | Convert between XML and JSON |
| CSV → XML | Convert CSV to XML (first row as element names) |
| URL Encode | Encode and decode URL components |
| Base64 | Encode and decode Base64 strings |
| HTML Entity | Encode and decode HTML entities |
| JWT Debugger | Decode and inspect JWT tokens |
| QR Code | Generate QR codes from text or URLs |
| Gzip | Compress and decompress with Gzip |
| Certificate Inspector | Inspect and decode X.509 certificates |
| Convert File Encoding | Decode bytes from charset or encode text to UTF-8 |
| Message Digester | MD5, SHA-1, SHA-256 hashes |
| HMAC Generator | Generate HMAC signatures |
| String Utilities | Convert between camelCase, snake_case, and more |
| List Collator | Merge, sort, and deduplicate lists |
| Text Analyzer | Count words, characters, sentences in text |
| Text Diff | Compare two texts and highlight differences |
| XML Escape | Escape and unescape XML special characters |
| Java / .NET Escape | Escape string literals for Java and .NET |
| JavaScript Escape | Escape JavaScript string literals |
| JSON Escape | Escape JSON string content |
| CSV Escape | Escape CSV fields (RFC 4180) |
| SQL Escape | Escape SQL string literals |
| Lorem Ipsum | Generate placeholder text |
| URL Parser | Parse and inspect URL / query string |
| List of MIME Types | Reference table of common MIME types |
| Markdown Preview | Live preview of Markdown with GFM support |
| UUID Generator | Generate UUIDs (v1, v4, v7) |
| Password Generator | Generate secure passwords with custom rules |
| Random String | Generate cryptographically secure random strings |
| Mock Payload | Generate mock JSON data from a schema |
| ASCII Art | Turn text into ASCII art |
| Log Generator | Generate synthetic log data for testing |
| SVG Viewer | View, edit, and export SVG graphics |
| Image Resizer | Resize images with format conversion |
| cURL Builder | Build cURL commands visually |
| HAR Viewer | Inspect HAR (HTTP Archive) files |
| CSV Viewer | View and search CSV files in a table |
| Math Calculator | Evaluate math expressions |

- 100% client-side processing
- No data collection
- Modular architecture
- Easy to extend with new tools

---

## 🚀 Philosophy

- **Privacy First** — No server, no tracking, no data leaves your browser.
- **Lightweight** — Minimal dependencies.
- **Modular** — Each tool is isolated and independently extendable.
- **Open Source (MIT)** — Free to use, modify, and distribute.

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/cminhho/stdout.git
cd stdout
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## 🛠 Project Structure

```
/src
  /tools
    js-beautifier
    js-minifier
    css-beautifier
    css-minifier
  /components
  /utils
```

Each tool is designed to be self-contained and independently maintainable.

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

Please keep tools modular and avoid unnecessary dependencies.

---

## 📄 License

MIT License

Copyright (c) 2026 Stdout

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...

(Include full MIT license text here or create a separate LICENSE file.)
