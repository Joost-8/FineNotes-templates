// Count each template's downloads. GitHub counts downloads of release
// files (not of files in the repository), so every template's file is also
// attached to the "gallery-files" release, named <id>-v<version>.<ext>, and
// the gallery downloads that copy. This uploads the copies that are
// missing and writes downloads.json: per template, its download address and
// the downloads of all its versions together. Nothing about who downloaded
// is known to anyone but GitHub's own counter.
//
//   GH_TOKEN=… node scripts/sync-downloads.mjs
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = process.env.GITHUB_REPOSITORY || "Joost-8/FineNotes-templates";
const TAG = "gallery-files";
const gh = (args) => execFileSync("gh", args, { cwd: root, encoding: "utf8" }).trim();

/** The release's files, creating the release the first time. */
function assets() {
  try {
    return JSON.parse(gh(["api", `repos/${REPO}/releases/tags/${TAG}`])).assets ?? [];
  } catch {
    gh([
      "release", "create", TAG, "--repo", REPO, "--title", "Gallery files",
      "--notes", "The files FineNotes' template gallery downloads, so each download is counted. Added by the Templates workflow.",
      "--latest=false",
    ]);
    return [];
  }
}

let list = assets();
const work = mkdtempSync(path.join(tmpdir(), "assets-"));
const out = {};
const dir = path.join(root, "templates");
for (const id of readdirSync(dir).sort()) {
  const folder = path.join(dir, id);
  if (!statSync(folder).isDirectory()) continue;
  let t;
  try {
    t = JSON.parse(readFileSync(path.join(folder, "template.json"), "utf8"));
  } catch {
    continue;
  }
  if (typeof t.file !== "string") continue;
  const ext = path.extname(t.file).toLowerCase();
  const version = String(t.version ?? "1").replace(/[^0-9A-Za-z.]+/g, "-");
  const name = `${id}-v${version}${ext}`;
  if (!list.some((a) => a.name === name)) {
    // A copy under the asset's name: gh uploads a file by its own name.
    const copy = path.join(work, name);
    copyFileSync(path.join(folder, t.file), copy);
    gh(["release", "upload", TAG, copy, "--repo", REPO]);
    console.log(`uploaded ${name}`);
    list = assets();
  }
  const asset = list.find((a) => a.name === name);
  const downloads = list
    .filter((a) => a.name.startsWith(`${id}-v`))
    .reduce((sum, a) => sum + (a.download_count ?? 0), 0);
  out[id] = { download: asset?.browser_download_url ?? "", downloads };
}
writeFileSync(path.join(root, "downloads.json"), `${JSON.stringify(out, null, 2)}\n`);
console.log(`downloads.json: ${Object.keys(out).length} templates`);
