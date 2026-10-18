// Draw a small picture of every page of every PDF template, for the
// gallery's template page (FineNotes shows them all, as Goodnotes' does).
//
//   node scripts/make-previews.mjs
//
// Writes templates/<id>/previews/page-1.png … (400 px wide, the first 40
// pages) where they are missing or the page count changed. Needs poppler's
// pdftoppm and pdfinfo (the workflow installs them).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_PAGES = 40;
const dir = path.join(root, "templates");
let made = 0;

for (const id of readdirSync(dir).sort()) {
  const folder = path.join(dir, id);
  if (!statSync(folder).isDirectory()) continue;
  let t;
  try {
    t = JSON.parse(readFileSync(path.join(folder, "template.json"), "utf8"));
  } catch {
    continue;
  }
  if (typeof t.file !== "string" || !t.file.toLowerCase().endsWith(".pdf")) continue;
  const pdf = path.join(folder, t.file);
  if (!existsSync(pdf)) continue;
  const pages = Number(/^Pages:\s+(\d+)/m.exec(execFileSync("pdfinfo", [pdf]).toString())?.[1] ?? 1);
  const wanted = Math.min(pages, MAX_PAGES);
  const previews = path.join(folder, "previews");
  const have = existsSync(previews) ? readdirSync(previews).filter((f) => /^page-\d+\.png$/.test(f)).length : 0;
  if (have === wanted) continue;
  rmSync(previews, { recursive: true, force: true });
  mkdirSync(previews);
  execFileSync("pdftoppm", ["-png", "-f", "1", "-l", String(wanted), "-scale-to-x", "400", "-scale-to-y", "-1", pdf, path.join(previews, "p")]);
  // pdftoppm names them p-1.png or p-01.png by page count; name them page-N.png.
  for (const name of readdirSync(previews)) {
    const n = Number(/^p-0*(\d+)\.png$/.exec(name)?.[1]);
    if (n) renameSync(path.join(previews, name), path.join(previews, `page-${n}.png`));
  }
  made++;
  console.log(`${id}: ${wanted} page previews`);
}
console.log(`${made} template${made === 1 ? "" : "s"} given page previews.`);
