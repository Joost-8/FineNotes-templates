// Check every template and build index.json, the list FineNotes' gallery reads.
//
//   node scripts/build-index.mjs           check, then write index.json
//   node scripts/build-index.mjs --check   check only (pull requests)
//
// No dependencies: Node 18 or later.
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = "https://raw.githubusercontent.com/Joost-8/FineNotes-templates/main";
const MAX_BYTES = 40 * 1024 * 1024;
const LICENCES = ["personal", "commercial", "cc-by", "cc0"];
const CATEGORIES = ["planner", "study", "journal", "work", "paper", "other"];
const ALLOWED = [".json", ".pdf", ".png", ".jpg", ".jpeg"];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTPS = /^https:\/\/[^\s]+$/;

/** What a file is by its first bytes; never by its name. */
function kindOf(file) {
  const b = readFileSync(file).subarray(0, 8);
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d) return "pdf";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  return null;
}

const errors = [];
const entries = [];
const dir = path.join(root, "templates");
for (const id of readdirSync(dir).sort()) {
  const folder = path.join(dir, id);
  if (!statSync(folder).isDirectory()) continue;
  const fail = (message) => errors.push(`${id}: ${message}`);
  if (!ID.test(id)) fail("the folder name must be lower case words joined by dashes");
  for (const name of readdirSync(folder)) {
    if (!ALLOWED.includes(path.extname(name).toLowerCase())) {
      fail(`${name} is not allowed (only template.json, PDF, PNG and JPEG files)`);
    }
  }
  let t;
  try {
    t = JSON.parse(readFileSync(path.join(folder, "template.json"), "utf8"));
  } catch (error) {
    fail(`template.json is missing or not valid JSON (${error.message})`);
    continue;
  }
  if (t.id !== id) fail(`"id" must be "${id}", the folder's name`);
  if (typeof t.name !== "string" || !t.name.trim()) fail(`"name" is required`);
  if (typeof t.author !== "string" || !t.author.trim()) fail(`"author" is required`);
  if (!LICENCES.includes(t.licence)) fail(`"licence" must be one of ${LICENCES.join(", ")}`);
  if (!CATEGORIES.includes(t.category)) fail(`"category" must be one of ${CATEGORIES.join(", ")}`);
  if (t.tags !== undefined && !(Array.isArray(t.tags) && t.tags.every((x) => typeof x === "string"))) {
    fail(`"tags" must be a list of words`);
  }
  if (t.shop !== undefined && !HTTPS.test(t.shop)) fail(`"shop" must be an https address`);
  if (t.file === undefined && t.shop === undefined) fail(`give a "file", or a "shop" for a template you sell`);
  const check = (key, kinds) => {
    const name = t[key];
    if (typeof name !== "string" || name.includes("/") || name.includes("\\")) {
      fail(`"${key}" must be the name of a file in this folder`);
      return null;
    }
    const file = path.join(folder, name);
    let size;
    try {
      size = statSync(file).size;
    } catch {
      fail(`${name} is missing`);
      return null;
    }
    if (size > MAX_BYTES) fail(`${name} is larger than 40 MB`);
    const kind = kindOf(file);
    if (!kinds.includes(kind)) fail(`${name} is not a ${kinds.join(" or ").toUpperCase()} file`);
    return `${RAW}/templates/${id}/${encodeURIComponent(name)}`;
  };
  const download = t.file !== undefined ? check("file", ["pdf", "png", "jpeg"]) : "";
  const preview = check("preview", ["png", "jpeg"]);
  entries.push({
    id,
    name: t.name,
    author: t.author,
    description: t.description ?? "",
    version: String(t.version ?? "1"),
    licence: t.licence,
    category: t.category,
    tags: t.tags ?? [],
    pages: Number.isInteger(t.pages) && t.pages > 0 ? t.pages : 1,
    preview,
    ...(download ? { download } : {}),
    ...(t.shop ? { shop: t.shop } : {}),
    ...(t.retired === true ? { retired: true } : {}),
  });
}

if (errors.length > 0) {
  console.error(`${errors.length} problem${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(`${entries.length} template${entries.length === 1 ? "" : "s"} pass.`);
if (!process.argv.includes("--check")) {
  writeFileSync(path.join(root, "index.json"), `${JSON.stringify({ format: 1, templates: entries }, null, 2)}\n`);
  console.log("Wrote index.json.");
}
