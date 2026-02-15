/**
 * Pre-compress dist assets for Firebase Hosting.
 * Generates .gz and .br for .js, .css, .html so Hosting can serve them when client sends Accept-Encoding.
 */
import fs from "fs";
import path from "path";
import zlib from "zlib";

const DIST = path.join(process.cwd(), "dist");
const EXT = [".js", ".css", ".html", ".json", ".svg", ".xml", ".ico", ".webmanifest"];

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (EXT.some((ext) => e.name.endsWith(ext)) && !e.name.endsWith(".gz") && !e.name.endsWith(".br"))
      out.push(full);
  }
  return out;
}

if (!fs.existsSync(DIST)) {
  console.error("dist/ not found. Run vite build first.");
  process.exit(1);
}

const files = walk(DIST);
let done = 0;
for (const file of files) {
  const buf = fs.readFileSync(file);
  fs.writeFileSync(file + ".gz", zlib.gzipSync(buf, { level: 9 }));
  fs.writeFileSync(file + ".br", zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }));
  done++;
}
console.log(`Compressed ${done} files (gzip + brotli) in dist/`);
