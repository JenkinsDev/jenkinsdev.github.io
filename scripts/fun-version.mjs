// Stamp every local script and stylesheet link in static/fun/**/*.html with ?v=<stamp>, so a deploy makes
// browsers fetch fresh files instead of using cached ones (GitHub Pages caches for 10 minutes, phones longer).
// shared/sound.js and shared/music.js pass their own ?v= on to the files they load.
// Run before committing a FREE PLAY deploy:  node scripts/fun-version.mjs
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../static/fun/", import.meta.url).pathname;
const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 12); // e.g. 202611052315

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (name.endsWith(".html")) yield path;
  }
}

let changed = 0;
for (const file of htmlFiles(root)) {
  const before = readFileSync(file, "utf8");
  const after = before.replace(/\b(src|href)="(?!https?:|data:|\/\/|#)([^"?]+\.(?:js|css))(?:\?v=\w+)?"/g, `$1="$2?v=${stamp}"`);
  if (after !== before) { writeFileSync(file, after); changed += 1; }
}
console.log(`Stamped ?v=${stamp} in ${changed} file(s).`);
