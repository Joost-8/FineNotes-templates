// After scripts/from-issue.mjs: open (or update) the pull request for a
// submission and tell its author on the issue. Or, when the submission did
// not pass, say what to fix. Uses git and the gh CLI with argument lists,
// never a shell, so nothing from the issue can run.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = JSON.parse(readFileSync(path.join(root, ".submission.json"), "utf8"));
const issue = String(result.issue);
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, encoding: "utf8" }).trim();
const comment = (text) => {
  const file = path.join(root, ".comment.md");
  writeFileSync(file, text);
  run("gh", ["issue", "comment", issue, "--body-file", file]);
};

if (!result.ok) {
  comment(
    `Thanks for sharing! Something needs fixing before this can go in the gallery:\n\n` +
      result.errors.map((e) => `- ${e.replace(/\n/g, "\n  ")}`).join("\n") +
      `\n\nEdit this issue to fix it, and I'll try again.`,
  );
  process.exit(0);
}

const branch = `submission/${issue}`;
run("git", ["config", "user.name", "github-actions[bot]"]);
run("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
run("git", ["checkout", "-B", branch]);
run("git", ["add", "--", result.folder]);
const message = path.join(root, ".message.txt");
writeFileSync(message, `Template: ${result.name}\n\nSubmitted in #${issue}.\n`);
run("git", ["commit", "-F", message]);
run("git", ["push", "--force", "origin", branch]);

const existing = run("gh", ["pr", "list", "--head", branch, "--json", "url", "--jq", ".[0].url"]);
let url = existing;
if (!existing) {
  const body = path.join(root, ".pr.md");
  writeFileSync(
    body,
    `A template submitted in #${issue}${result.login ? ` by @${result.login}` : ""}. ` +
      `It passed the checks (${result.pages} page${result.pages === 1 ? "" : "s"}).\n\n` +
      `![preview](https://github.com/${process.env.GITHUB_REPOSITORY}/blob/${branch}/${result.folder}/${result.preview}?raw=true)\n\n` +
      `Merge to publish it in the gallery.\n\nCloses #${issue}\n`,
  );
  url = run("gh", ["pr", "create", "--base", "main", "--head", branch, "--title", `Template: ${result.name}`, "--body-file", body]);
}
comment(
  existing
    ? `Updated with your changes: ${url}`
    : `Thanks! "${result.name}" passed the checks and is waiting for review: ${url}\n\nOnce it is merged it shows in every FineNotes gallery.`,
);
