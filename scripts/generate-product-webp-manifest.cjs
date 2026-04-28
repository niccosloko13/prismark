const fs = require("fs");
const path = require("path");

const publicDir = path.join(process.cwd(), "public");
const outFile = path.join(process.cwd(), "lib", "product-webp-manifest.json");

/** @type {Record<string, true>} */
const manifest = {};

function walk(dir, relPosix) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    const rel = relPosix ? `${relPosix}/${name}` : name;
    if (st.isDirectory()) {
      walk(full, rel);
    } else if (name.toLowerCase().endsWith(".webp")) {
      manifest[`/${rel.replace(/\\/g, "/")}`] = true;
    }
  }
}

walk(publicDir, "");
fs.writeFileSync(outFile, `${JSON.stringify(manifest)}\n`, "utf8");
console.log(`product-webp-manifest: ${Object.keys(manifest).length} webp file(s)`);
