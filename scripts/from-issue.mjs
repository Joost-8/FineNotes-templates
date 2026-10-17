// Turn a "Submit a template" issue into a template folder, checked.
//
//   node scripts/from-issue.mjs [event.json]
//
// Reads the issue from the GitHub event (GITHUB_EVENT_PATH), downloads the
// files attached to it from GitHub's own attachment storage only, makes a
// preview from a PDF's first page (poppler's pdftoppm), writes
// templates/<id>/ and runs the same check as a pull request. It never
// passes issue text to a shell. The outcome goes to .submission.json for
// scripts/submission-pr.mjs; this script itself never fails the job.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_BYTES = 40 * 1024 * 1024;
/** Where GitHub keeps what is dragged into an issue; nothing else is fetched. */
const HOSTS = [
  "https://github.com/user-attachments/",
  "https://private-user-images.githubusercontent.com/",
  "https://user-images.githubusercontent.com/",
];
// Tests only: a local server standing in for GitHub's storage.
if (process.env.SUBMISSION_TEST_HOST) HOSTS.push(process.env.SUBMISSION_TEST_HOST);

const CATEGORIES = ["planner", "study", "journal", "work", "paper", "other"];

/** A category as typed: "Planner", "planners", "Study " all read; else undefined. */
export function readCategory(text) {
  const word = String(text).trim().toLowerCase().replace(/s$/, "");
  return CATEGORIES.find((c) => c === word || (c === "study" && word === "studie"));
}

/** A licence as typed: its id, its label, or the words that tell them apart. */
export function readLicence(text) {
  const t = String(text).trim().toLowerCase();
  if (!t) return undefined;
  if (/cc0|cc-0|public domain|no rights/.test(t)) return "cc0";
  if (/cc[ -]?by/.test(t)) return "cc-by";
  if (/commercial/.test(t)) return "commercial";
  if (/personal/.test(t)) return "personal";
  return undefined;
}

const out = { ok: false, errors: [] };
const finish = () => {
  writeFileSync(path.join(root, ".submission.json"), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
};

/** The form's answers by their headings; "_No response_" is empty. */
export function readForm(body) {
  const fields = {};
  const parts = String(body ?? "").split(/^### +(.+?)\s*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const value = parts[i + 1].trim();
    fields[parts[i].trim()] = value === "_No response_" ? "" : value;
  }
  return fields;
}

/** The attachment links in a field: markdown links and images, and <img src>. */
export function attachments(text) {
  const urls = [];
  for (const m of String(text).matchAll(/\]\((https?:\/\/[^)\s]+)\)|src="(https?:\/\/[^"\s]+)"/g)) {
    urls.push(m[1] ?? m[2]);
  }
  return [...new Set(urls)].filter((url) => HOSTS.some((host) => url.startsWith(host)));
}

/** What a file is, by its first bytes. */
export function kindOf(bytes) {
  const b = bytes.subarray(0, 8);
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d) return "pdf";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  return null;
}

/** A name as an id: lower case words joined by dashes. */
export function slug(name) {
  return (
    String(name)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "template"
  );
}

async function download(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`could not download an attachment (HTTP ${res.status})`);
  const length = Number(res.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) throw new Error("an attachment is larger than 40 MB");
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length > MAX_BYTES) throw new Error("an attachment is larger than 40 MB");
  return bytes;
}

async function main() {
  const eventPath = process.argv[2] ?? process.env.GITHUB_EVENT_PATH;
  const issue = JSON.parse(readFileSync(eventPath, "utf8")).issue;
  out.issue = issue.number;
  const form = readForm(issue.body);
  if (!("Name" in form) || !("Files" in form)) {
    out.errors.push(
      "This issue did not come through the Submit a template form, so it has no file or details. " +
        "That can happen when GitHub's app opens the link: it shows a plain issue instead of the form. " +
        "Open the form in a web browser instead: " +
        "https://github.com/Joost-8/FineNotes-templates/issues/new?template=submit-template.yml",
    );
    return;
  }
  const name = (form["Name"] ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  const author = (form["Your name, as it should show"] ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
  const category = readCategory(form["Category"] ?? "");
  const licence = readLicence(form["Licence"] ?? "");
  const description = (form["Description"] ?? "").replace(/\s+/g, " ").trim().slice(0, 400);
  const tags = (form["Tags"] ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => /^[\p{L}\p{N} -]{1,30}$/u.test(t))
    .slice(0, 8);
  if (!name) out.errors.push("The form has no name for the template.");
  if (!author) out.errors.push("The form has no author name.");
  if (!category) out.errors.push("Category must be one of: Planner, Study, Journal, Work, Paper, Other.");
  if (!licence) {
    out.errors.push(
      "Licence must be one of: Personal use only, Personal and commercial use, CC BY 4.0, CC0.",
    );
  }
  const urls = attachments(form["Files"] ?? "");
  if (urls.length === 0) {
    out.errors.push("No file was attached: drag your PDF, PNG or JPEG into Files.");
  }
  if (out.errors.length > 0) return;

  const work = mkdtempSync(path.join(tmpdir(), "submission-"));
  const files = [];
  for (const [i, url] of urls.entries()) {
    const bytes = await download(url);
    const kind = kindOf(bytes);
    if (!kind) {
      out.errors.push("An attachment is not a PDF, PNG or JPEG file. Only those can be templates.");
      return;
    }
    const file = path.join(work, `${i}.${kind === "jpeg" ? "jpg" : kind}`);
    writeFileSync(file, bytes);
    files.push({ file, kind });
  }
  // The template: the first PDF, else the first picture. The preview: a
  // picture besides it, else made from the template's first page.
  const template = files.find((f) => f.kind === "pdf") ?? files[0];
  const own = files.find((f) => f !== template && f.kind !== "pdf");

  let id = slug(name);
  for (let n = 2; existsSync(path.join(root, "templates", id)); n++) id = `${slug(name)}-${n}`;
  const folder = path.join(root, "templates", id);
  mkdirSync(folder, { recursive: true });
  const fileName = `${id}.${template.kind === "jpeg" ? "jpg" : template.kind}`;
  copyFileSync(template.file, path.join(folder, fileName));

  let pages = 1;
  let preview = "preview.png";
  if (own) {
    preview = own.kind === "png" ? "preview.png" : "preview.jpg";
    copyFileSync(own.file, path.join(folder, preview));
  } else if (template.kind === "pdf") {
    execFileSync("pdftoppm", ["-png", "-f", "1", "-l", "1", "-scale-to-x", "600", "-scale-to-y", "-1", template.file, path.join(work, "first")]);
    const made = readdirSync(work).find((f) => f.startsWith("first") && f.endsWith(".png"));
    if (!made) throw new Error("the PDF's first page could not be drawn");
    copyFileSync(path.join(work, made), path.join(folder, preview));
  } else {
    preview = template.kind === "png" ? "preview.png" : "preview.jpg";
    copyFileSync(template.file, path.join(folder, preview));
  }
  if (template.kind === "pdf") {
    const info = execFileSync("pdfinfo", [template.file]).toString();
    pages = Number(/^Pages:\s+(\d+)/m.exec(info)?.[1] ?? 1);
  }

  const meta = { id, name, author, description, version: "1", licence, category, tags, file: fileName, preview, pages };
  writeFileSync(path.join(folder, "template.json"), `${JSON.stringify(meta, null, 2)}\n`);
  try {
    execFileSync("node", [path.join(root, "scripts", "build-index.mjs"), "--check"], { stdio: "pipe" });
  } catch (error) {
    const report = `${error.stderr ?? ""}${error.stdout ?? ""}`.trim();
    out.errors.push(`The template did not pass the checks:\n${report}`);
    return;
  }
  Object.assign(out, { ok: true, id, name, folder: `templates/${id}`, preview, pages, login: issue.user?.login ?? "" });
}

main()
  .catch((error) => out.errors.push(`Something went wrong: ${error.message}`))
  .finally(finish);
