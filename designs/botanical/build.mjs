// Draft gallery templates: a botanical collection. Each template is one
// HTML file of A4 pages drawn as SVG in millimetres, printed to PDF by
// headless Edge (fonts embedded, links kept).
//
//   node build.mjs <outdir>
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });

const C = {
  paper: "#FBF8F1",
  white: "#FFFDF8",
  ink: "#2E3A33",
  inkSoft: "#4C5A50",
  muted: "#8A928A",
  sage: "#7F9C83",
  sageD: "#5B7860",
  sageL: "#DCE6D5",
  sageW: "#EEF3EA",
  terra: "#C47A5E",
  terraL: "#F2DDD2",
  terraW: "#F8EDE6",
  gold: "#C9A86A",
  rule: "#D9D2C3",
  ruleL: "#E7E1D5",
};

const f = (n) => Math.round(n * 100) / 100;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
let uid = 0;

function text(x, y, s, o = {}) {
  const a = [
    `x="${f(x)}"`,
    `y="${f(y)}"`,
    `font-family="${o.serif ? "Fraunces" : "DM Sans"}"`,
    `font-size="${o.size ?? 2.4}"`,
    `fill="${o.fill ?? C.ink}"`,
  ];
  if (o.weight) a.push(`font-weight="${o.weight}"`);
  if (o.italic) a.push(`font-style="italic"`);
  if (o.anchor) a.push(`text-anchor="${o.anchor}"`);
  if (o.ls) a.push(`letter-spacing="${o.ls}"`);
  if (o.baseline) a.push(`dominant-baseline="${o.baseline}"`);
  if (o.transform) a.push(`transform="${o.transform}"`);
  if (o.opacity) a.push(`opacity="${o.opacity}"`);
  if (o.line) a.push(`data-line="${o.line}"`);
  return `<text ${a.join(" ")}>${esc(s)}</text>`;
}
const label = (x, y, s, o = {}) =>
  text(x, y, s.toUpperCase(), { size: 2.2, weight: 600, ls: 0.42, fill: C.sageD, ...o });

function line(x1, y1, x2, y2, o = {}) {
  const a = [`x1="${f(x1)}"`, `y1="${f(y1)}"`, `x2="${f(x2)}"`, `y2="${f(y2)}"`];
  a.push(`stroke="${o.stroke ?? C.rule}"`, `stroke-width="${o.sw ?? 0.25}"`, `stroke-linecap="round"`);
  if (o.dash) a.push(`stroke-dasharray="${o.dash}"`);
  if (o.id) a.push(`id="${o.id}"`);
  if (o.opacity) a.push(`opacity="${o.opacity}"`);
  return `<line ${a.join(" ")}/>`;
}
function rect(x, y, w, h, o = {}) {
  const a = [`x="${f(x)}"`, `y="${f(y)}"`, `width="${f(w)}"`, `height="${f(h)}"`];
  if (o.rx) a.push(`rx="${o.rx}"`);
  a.push(`fill="${o.fill ?? "none"}"`);
  if (o.stroke) a.push(`stroke="${o.stroke}"`, `stroke-width="${o.sw ?? 0.25}"`);
  if (o.dash) a.push(`stroke-dasharray="${o.dash}"`);
  if (o.opacity) a.push(`opacity="${o.opacity}"`);
  return `<rect ${a.join(" ")}/>`;
}
function circle(cx, cy, r, o = {}) {
  const a = [`cx="${f(cx)}"`, `cy="${f(cy)}"`, `r="${f(r)}"`, `fill="${o.fill ?? "none"}"`];
  if (o.stroke) a.push(`stroke="${o.stroke}"`, `stroke-width="${o.sw ?? 0.25}"`);
  if (o.opacity) a.push(`opacity="${o.opacity}"`);
  return `<circle ${a.join(" ")}/>`;
}
const pathEl = (d, o = {}) =>
  `<path d="${d}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? "none"}" stroke-width="${o.sw ?? 0.25}" stroke-linecap="round" stroke-linejoin="round"${o.opacity ? ` opacity="${o.opacity}"` : ""}/>`;

/** A label on the left of a writing line; the line starts where the label ends (measured in the page). */
function field(x1, x2, y, name, o = {}) {
  const id = `ln${++uid}`;
  return label(x1, y - 0.6, name, { line: id, ...o }) + line(x1 + 20, y, x2, y, { id, stroke: o.stroke ?? C.rule });
}
/** Writing lines from y0 to y1 (inclusive) every step. */
function ruled(x1, x2, y0, y1, step, o = {}) {
  let s = "";
  for (let y = y0; y <= y1 + 0.01; y += step) s += line(x1, y, x2, y, o);
  return s;
}
function dots(x0, y0, x1, y1, step, o = {}) {
  let s = "";
  for (let y = y0; y <= y1 + 0.01; y += step) {
    for (let x = x0; x <= x1 + 0.01; x += step) s += circle(x, y, o.r ?? 0.22, { fill: o.fill ?? C.rule });
  }
  return s;
}
function grid(x0, y0, x1, y1, step, major) {
  let s = "";
  let i = 0;
  for (let x = x0; x <= x1 + 0.01; x += step, i++) {
    const m = major && i % major === 0;
    s += line(x, y0, x, y1, { stroke: m ? C.rule : C.ruleL, sw: m ? 0.2 : 0.12 });
  }
  i = 0;
  for (let y = y0; y <= y1 + 0.01; y += step, i++) {
    const m = major && i % major === 0;
    s += line(x0, y, x1, y, { stroke: m ? C.rule : C.ruleL, sw: m ? 0.2 : 0.12 });
  }
  return s;
}
const checkbox = (x, y, s = 3.2, color = C.sage) => rect(x, y - s, s, s, { rx: 0.8, stroke: color, sw: 0.3 });

// ---------------------------------------------------------------- botany ----

const qp = (p0, p1, p2, t) => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
};
const qt = (p0, p1, p2, t) => [
  2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]),
  2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]),
];

/** A leaf from (bx, by) at angle `ang`, with a bend to one side. */
function leaf(bx, by, ang, len, wid, o = {}) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const tx = bx + len * c;
  const ty = by + len * s;
  const bend = o.bend ?? 0.12;
  const mx = bx + len * 0.45 * c - s * len * bend;
  const my = by + len * 0.45 * s + c * len * bend;
  const nx = -s * wid;
  const ny = c * wid;
  let out = pathEl(
    `M${f(bx)} ${f(by)} Q${f(mx + nx)} ${f(my + ny)} ${f(tx)} ${f(ty)} Q${f(mx - nx)} ${f(my - ny)} ${f(bx)} ${f(by)}Z`,
    { fill: o.fill ?? C.sageL, stroke: o.stroke ?? C.sage, sw: o.sw ?? 0.22 },
  );
  if (o.rib !== false) {
    out += pathEl(`M${f(bx)} ${f(by)} Q${f(mx)} ${f(my)} ${f(bx + len * 0.86 * c)} ${f(by + len * 0.86 * s)}`, {
      stroke: o.stroke ?? C.sage,
      sw: 0.14,
      opacity: 0.8,
    });
  }
  return out;
}

/** A fern frond along a quadratic curve, leaflets in opposite pairs tapering to the tip. */
function fern(p0, p1, p2, n, maxLen, o = {}) {
  let s = pathEl(`M${f(p0[0])} ${f(p0[1])} Q${f(p1[0])} ${f(p1[1])} ${f(p2[0])} ${f(p2[1])}`, {
    stroke: o.stroke ?? C.sage,
    sw: o.sw ?? 0.35,
  });
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const [x, y] = qp(p0, p1, p2, t);
    const [dx, dy] = qt(p0, p1, p2, t);
    const a = Math.atan2(dy, dx);
    const base = t < 0.12 ? 0.55 + (t / 0.12) * 0.45 : 1;
    const L = maxLen * Math.pow(1 - t, 0.75) * base;
    const spread = ((62 - 28 * t) * Math.PI) / 180;
    for (const side of [1, -1]) {
      s += leaf(x, y, a + side * spread, L, L * 0.2, { ...o, bend: 0.1 * side, rib: L > 3 });
    }
  }
  const [dx, dy] = qt(p0, p1, p2, 1);
  s += leaf(p2[0], p2[1], Math.atan2(dy, dx), maxLen * 0.22, maxLen * 0.06, { ...o, rib: false });
  return s;
}

/** A sprig: a stem with alternate leaves and, if asked, berries. */
function sprig(p0, p1, p2, n, len, o = {}) {
  let s = pathEl(`M${f(p0[0])} ${f(p0[1])} Q${f(p1[0])} ${f(p1[1])} ${f(p2[0])} ${f(p2[1])}`, {
    stroke: o.stroke ?? C.sage,
    sw: 0.35,
  });
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 0.6);
    const [x, y] = qp(p0, p1, p2, t);
    const [dx, dy] = qt(p0, p1, p2, t);
    const side = i % 2 ? 1 : -1;
    const L = len * (1 - t * 0.35);
    s += leaf(x, y, Math.atan2(dy, dx) + side * 0.75, L, L * 0.3, { ...o, bend: 0.14 * side });
  }
  const [dx, dy] = qt(p0, p1, p2, 1);
  s += leaf(p2[0], p2[1], Math.atan2(dy, dx), len * 0.9, len * 0.27, o);
  if (o.berries) {
    for (const [t, side] of [
      [0.3, -1],
      [0.62, 1],
    ]) {
      const [x, y] = qp(p0, p1, p2, t);
      const [dx2, dy2] = qt(p0, p1, p2, t);
      const a = Math.atan2(dy2, dx2) + side * 1.25;
      const bx = x + Math.cos(a) * 3.2;
      const by = y + Math.sin(a) * 3.2;
      s += line(x, y, bx, by, { stroke: C.sage, sw: 0.2 });
      s += circle(bx, by, 1.05, { fill: C.terraL, stroke: C.terra, sw: 0.22 });
      s += circle(bx + 1.6, by + 0.9, 0.85, { fill: C.terraL, stroke: C.terra, sw: 0.22 });
    }
  }
  return s;
}

/** A DNA double helix, laid along the x axis. */
function helix(x0, cy, w, amp, turns, o = {}) {
  const N = 160;
  const strand = (phase) => {
    let d = "";
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const x = x0 + u * w;
      const y = cy + amp * Math.sin(2 * Math.PI * turns * u + phase);
      d += `${i ? "L" : "M"}${f(x)} ${f(y)}`;
    }
    return d;
  };
  let s = "";
  const rungs = Math.round(turns * 10);
  for (let k = 1; k < rungs; k++) {
    const u = k / rungs;
    const x = x0 + u * w;
    const y1 = cy + amp * Math.sin(2 * Math.PI * turns * u);
    const y2 = cy + amp * Math.sin(2 * Math.PI * turns * u + Math.PI);
    s += line(x, y1, x, y2, { stroke: k % 2 ? C.terra : C.sage, sw: o.rung ?? 0.45, opacity: 0.55 });
  }
  s += pathEl(strand(Math.PI), { stroke: C.terra, sw: o.sw ?? 0.6 });
  s += pathEl(strand(0), { stroke: C.sageD, sw: o.sw ?? 0.6 });
  return s;
}

/** Small icons, about 10 mm across, centred on (cx, cy). */
function icon(name, cx, cy) {
  const k = (x, y) => `${f(cx + x)} ${f(cy + y)}`;
  switch (name) {
    case "notes":
      return (
        rect(cx - 3.4, cy - 4.2, 6.8, 8.4, { rx: 0.9, fill: C.white, stroke: C.sageD, sw: 0.3 }) +
        line(cx - 2.2, cy - 2, cx - 2.2, cy + 3, { stroke: C.terra, sw: 0.25 }) +
        [-1.6, 0, 1.6].map((d) => line(cx - 1.2, cy + d, cx + 2.2, cy + d, { stroke: C.sage, sw: 0.25 })).join("")
      );
    case "cell":
      return (
        `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="4.4" ry="3.4" fill="${C.sageL}" stroke="${C.sageD}" stroke-width="0.3"/>` +
        circle(cx + 0.6, cy - 0.2, 1.4, { fill: C.terraL, stroke: C.terra, sw: 0.25 }) +
        circle(cx + 0.8, cy - 0.3, 0.45, { fill: C.terra }) +
        `<ellipse cx="${f(cx - 2.2)}" cy="${f(cy + 1.2)}" rx="1" ry="0.5" fill="none" stroke="${C.sageD}" stroke-width="0.22" transform="rotate(-20 ${f(cx - 2.2)} ${f(cy + 1.2)})"/>` +
        circle(cx - 1.9, cy - 1.5, 0.35, { fill: C.sageD })
      );
    case "flask":
      return (
        pathEl(`M${k(-1.2, -4.4)} L${k(-1.2, -1.4)} L${k(-3.6, 3.6)} Q${k(-3.9, 4.4)} ${k(-3, 4.4)} L${k(3, 4.4)} Q${k(3.9, 4.4)} ${k(3.6, 3.6)} L${k(1.2, -1.4)} L${k(1.2, -4.4)}`, {
          fill: C.white,
          stroke: C.sageD,
          sw: 0.3,
        }) +
        pathEl(`M${k(-2.4, 1.1)} L${k(2.4, 1.1)} L${k(3.3, 3.3)} Q${k(3.5, 4)} ${k(2.8, 4)} L${k(-2.8, 4)} Q${k(-3.5, 4)} ${k(-3.3, 3.3)}Z`, {
          fill: C.terraL,
        }) +
        line(cx - 1.9, cy - 4.4, cx + 1.9, cy - 4.4, { stroke: C.sageD, sw: 0.3 }) +
        circle(cx - 0.6, cy + 2.6, 0.35, { fill: C.terra }) +
        circle(cx + 1, cy + 2, 0.25, { fill: C.terra })
      );
    case "leaf":
      return leaf(cx - 3.2, cy + 3.2, -Math.PI / 4, 9, 2.6, { stroke: C.sageD, bend: 0.1 });
    case "dna":
      return helix(cx - 4.5, cy, 9, 2.6, 1.2, { sw: 0.35, rung: 0.3 });
    case "cards":
      return (
        `<g transform="rotate(-10 ${f(cx)} ${f(cy)})">${rect(cx - 3.8, cy - 2.6, 7, 5, { rx: 0.7, fill: C.terraL, stroke: C.terra, sw: 0.25 })}</g>` +
        `<g transform="rotate(6 ${f(cx)} ${f(cy)})">${rect(cx - 3, cy - 1.8, 7, 5, { rx: 0.7, fill: C.white, stroke: C.sageD, sw: 0.28 })}</g>` +
        line(cx - 1.6, cy + 0.2, cx + 2.4, cy + 0.6, { stroke: C.sage, sw: 0.22 })
      );
    default:
      return "";
  }
}

// ------------------------------------------------------------------ pages ---

const FONTS =
  "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&display=block";

function documentOf(title, pages) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="${FONTS}">
<style>
@page { size: 210mm 297mm; margin: 0 }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box }
html, body { margin: 0; padding: 0; background: ${C.paper} }
.page { position: relative; width: 210mm; height: 297mm; overflow: hidden; break-after: page }
.page:last-child { break-after: auto }
.page svg { display: block }
.lnk { position: absolute; display: block }
</style></head><body>
${pages.join("\n")}
<script>
document.fonts.ready.then(() => {
  for (const t of document.querySelectorAll("text[data-line]")) {
    const l = document.getElementById(t.dataset.line);
    const end = t.getBBox().x + t.getComputedTextLength();
    l.setAttribute("x1", (end + 1.8).toFixed(2));
  }
  document.body.dataset.ready = "1";
});
</script>
</body></html>`;
}

function page(id, body, links = []) {
  const a = links
    .map(
      (l) =>
        `<a class="lnk" href="#${l.to}" aria-label="${esc(l.label)}" style="left:${f(l.x)}mm;top:${f(l.y)}mm;width:${f(l.w)}mm;height:${f(l.h)}mm"></a>`,
    )
    .join("");
  return `<section class="page" id="${id}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm">${rect(0, 0, 210, 297, { fill: C.paper })}${body}</svg>${a}</section>`;
}

// ============================================================ Biology kit ===

const KIT = [
  { id: "p1", tab: "Index", tone: "#EADFC6", deep: "#B39663" },
  { id: "p2", tab: "Notes", tone: C.sageL, deep: C.sage, icon: "notes", title: "Lecture notes", desc: "Cornell layout: key terms, notes and a summary" },
  { id: "p3", tab: "Diagram", tone: C.terraL, deep: C.terra, icon: "cell", title: "Diagram study", desc: "A frame to draw in, numbered labels and functions" },
  { id: "p4", tab: "Lab", tone: "#DCE5E5", deep: "#7D9EA0", icon: "flask", title: "Lab report", desc: "Aim, materials, method, a graph and a data table" },
  { id: "p5", tab: "Field", tone: "#E2EAD3", deep: "#8CA46E", icon: "leaf", title: "Species profile", desc: "Specimen sketch, classification and observations" },
  { id: "p6", tab: "Genetics", tone: "#E7DEE9", deep: "#9B87A5", icon: "dna", title: "Genetics", desc: "Punnett squares for one and two traits, a pedigree" },
  { id: "p7", tab: "Revise", tone: "#F2E2CF", deep: "#CF9765", icon: "cards", title: "Revision", desc: "A topic checklist and cards to test yourself" },
];

function tabs(current) {
  let s = "";
  const links = [];
  const y0 = 46;
  const h = 27;
  const gap = 2.6;
  KIT.forEach((t, i) => {
    const y = y0 + i * (h + gap);
    const on = t.id === current;
    const x = on ? 195.5 : 198.6;
    s += rect(x, y, 16, h, { rx: 2.4, fill: on ? t.deep : t.tone });
    const cx = x + (210 - x) / 2;
    const cy = y + h / 2;
    s += text(cx, cy, t.tab.toUpperCase(), {
      size: 2.15,
      weight: 600,
      ls: 0.5,
      fill: on ? "#FFFFFF" : C.inkSoft,
      anchor: "middle",
      baseline: "central",
      transform: `rotate(90 ${f(cx)} ${f(cy)})`,
    });
    links.push({ to: t.id, label: t.tab, x: 196, y, w: 14, h });
  });
  return { svg: s, links };
}

function kitHeader(section, title, art) {
  return (
    label(14, 17, `Biology  ·  ${section}`) +
    text(14, 30.5, title, { serif: true, size: 9.5, weight: 500 }) +
    line(14, 37, 188, 37, { stroke: C.sage, sw: 0.3 }) +
    circle(14, 37, 0.7, { fill: C.sage }) +
    art
  );
}

function kitPage(id, section, title, art, body, extraLinks = []) {
  const t = tabs(id);
  return page(id, kitHeader(section, title, art) + body + t.svg, [...t.links, ...extraLinks]);
}

const kitPages = [];

// --- 1. Cover and contents ---------------------------------------------------
{
  let b = "";
  b += circle(160, 72, 50, { fill: C.sageW });
  b += circle(126, 34, 14, { fill: C.terraW });
  b += fern([182, 132], [168, 86], [140, 24], 17, 17);
  b += fern([168, 136], [184, 104], [192, 64], 12, 11, { fill: "#E6EDDF" });
  b += sprig([150, 136], [140, 118], [124, 106], 4, 7, { berries: true });
  b += label(14, 46, "Study notebook");
  b += text(13, 72, "Biology", { serif: true, size: 24, weight: 500 });
  b += text(14.5, 84, "the study of life", { serif: true, italic: true, size: 6.5, fill: C.terra });
  b += field(14, 104, 106, "Name");
  b += field(14, 104, 119, "Course");
  b += field(14, 104, 132, "Year");
  b += line(14, 152, 188, 152, { stroke: C.sage, sw: 0.3 });
  b += label(14, 162, "Contents");
  b += label(188, 162, "Page", { anchor: "end", fill: C.muted });
  const links = [];
  KIT.slice(1).forEach((t, i) => {
    const y = 167 + i * 17.5;
    b += circle(21, y + 8.5, 6.2, { fill: t.tone, opacity: 0.75 });
    b += icon(t.icon, 21, y + 8.5);
    b += text(32, y + 8, t.title, { serif: true, size: 5, weight: 500 });
    b += text(32, y + 13.2, t.desc, { size: 2.6, fill: C.muted });
    b += text(188, y + 10.5, String(i + 2), { serif: true, italic: true, size: 4.6, fill: t.deep, anchor: "end" });
    b += line(32, y + 17.5, 188, y + 17.5, { stroke: C.ruleL, sw: 0.2 });
    links.push({ to: t.id, label: t.title, x: 14, y, w: 174, h: 17.5 });
  });
  b += text(14, 284, "Tap a tab or a line of the contents to turn to it.", { size: 2.4, fill: C.muted, italic: true });
  const t = tabs("p1");
  kitPages.push(page("p1", b + t.svg, [...t.links, ...links]));
}

// --- 2. Lecture notes (Cornell) ----------------------------------------------
{
  let b = "";
  b += field(14, 118, 51, "Topic");
  b += field(124, 150, 51, "No.");
  b += field(156, 188, 51, "Date");
  b += label(14, 63, "Key terms & questions");
  b += label(68, 63, "Notes");
  b += line(64, 58, 64, 230, { stroke: C.sage, sw: 0.35 });
  b += ruled(14, 60, 72, 224, 8, { stroke: C.ruleL, sw: 0.22 });
  b += ruled(68, 188, 72, 224, 8);
  b += rect(14, 236, 174, 50, { rx: 3, fill: C.sageW, stroke: C.sageL, sw: 0.3 });
  b += label(20, 244, "Summary");
  b += text(40, 244, "in your own words, in three sentences", { size: 2.3, italic: true, fill: C.muted });
  b += ruled(20, 182, 254, 280, 8.5, { stroke: C.sageL, sw: 0.25 });
  b += sprig([174, 248], [178, 244], [184, 238], 3, 3.6);
  kitPages.push(kitPage("p2", "Lecture notes", "Lecture notes", sprig([152, 30], [164, 22], [184, 12], 5, 6, { berries: true }), b));
}

// --- 3. Diagram study --------------------------------------------------------
{
  let b = "";
  b += field(14, 118, 51, "Structure");
  b += field(124, 188, 51, "Figure");
  b += rect(14, 59, 174, 112, { rx: 3, fill: C.white, stroke: C.rule, sw: 0.3 });
  b += dots(19, 64, 183, 166, 5, { r: 0.2, fill: C.ruleL });
  b += label(18, 65.6, "Draw", { fill: C.muted, size: 2 });
  b += line(150, 165, 170, 165, { stroke: C.inkSoft, sw: 0.35 });
  b += line(150, 163.8, 150, 166.2, { stroke: C.inkSoft, sw: 0.35 });
  b += line(170, 163.8, 170, 166.2, { stroke: C.inkSoft, sw: 0.35 });
  b += text(172, 166, "scale", { size: 2.2, italic: true, fill: C.muted });
  b += label(14, 182, "Labels");
  for (let i = 0; i < 12; i++) {
    const col = i < 6 ? 0 : 1;
    const row = i % 6;
    const x = col ? 104 : 14;
    const y = 192 + row * 8;
    b += circle(x + 2.3, y - 1.8, 2.2, { fill: col ? C.terraW : C.sageW, stroke: col ? C.terraL : C.sageL, sw: 0.25 });
    b += text(x + 2.3, y - 1.75, String(i + 1), { size: 2.2, weight: 600, anchor: "middle", baseline: "central", fill: col ? C.terra : C.sageD });
    b += line(x + 6.5, y, x + 84, y);
  }
  b += label(14, 247, "Function & notes");
  b += ruled(14, 188, 256, 284, 7);
  const art =
    `<ellipse cx="172" cy="21" rx="13" ry="9.5" fill="${C.sageW}" stroke="${C.sage}" stroke-width="0.35"/>` +
    `<ellipse cx="172" cy="21" rx="11.6" ry="8.2" fill="none" stroke="${C.sageL}" stroke-width="0.3"/>` +
    circle(175, 20, 3.6, { fill: C.terraL, stroke: C.terra, sw: 0.3 }) +
    circle(176, 19.4, 1.1, { fill: C.terra }) +
    `<ellipse cx="164.5" cy="24" rx="2.6" ry="1.2" fill="#E6EDDF" stroke="${C.sageD}" stroke-width="0.25" transform="rotate(-24 164.5 24)"/>` +
    pathEl("M162.6 24.8 L163.4 23.4 L164.2 24.9 L165 23.4 L165.8 24.8", { stroke: C.sageD, sw: 0.18 }) +
    `<ellipse cx="180" cy="26" rx="2.2" ry="1" fill="#E6EDDF" stroke="${C.sageD}" stroke-width="0.25" transform="rotate(18 180 26)"/>` +
    pathEl("M162 16 q2 -1.5 4 0 t4 0", { stroke: C.sage, sw: 0.25 }) +
    pathEl("M163 18.3 q2 -1.5 4 0 t4 0", { stroke: C.sage, sw: 0.25 }) +
    circle(168.5, 27.2, 0.45, { fill: C.sageD }) +
    circle(170.5, 28, 0.35, { fill: C.sageD }) +
    circle(183, 18.5, 0.4, { fill: C.sageD });
  kitPages.push(kitPage("p3", "Diagrams", "Diagram study", art, b));
}

// --- 4. Lab report -----------------------------------------------------------
{
  let b = "";
  b += field(14, 136, 51, "Experiment");
  b += field(142, 188, 51, "Date");
  b += label(14, 63, "Aim & hypothesis");
  b += ruled(14, 96, 72, 104, 8);
  b += label(104, 63, "Materials");
  for (let i = 0; i < 5; i++) {
    const y = 72 + i * 8;
    b += checkbox(104, y - 0.6, 3);
    b += line(110, y, 188, y);
  }
  b += label(14, 117, "Method");
  for (let i = 0; i < 5; i++) {
    const y = 126 + i * 8;
    b += text(15.5, y - 0.7, String(i + 1), { serif: true, italic: true, size: 3.6, fill: C.terra, anchor: "middle" });
    b += line(20, y, 188, y);
  }
  b += label(14, 172, "Results");
  b += rect(14, 176, 100, 60, { fill: C.white });
  b += grid(14, 176, 114, 236, 2.5, 4);
  b += line(14, 236, 114, 236, { stroke: C.inkSoft, sw: 0.35 });
  b += line(14, 176, 14, 236, { stroke: C.inkSoft, sw: 0.35 });
  // Data table.
  const tx = 120;
  const cols = [tx, 142, 165, 188];
  b += rect(tx, 176, 68, 8, { rx: 1.6, fill: C.sageW });
  ["Variable", "Trial 1", "Trial 2"].forEach((h, i) => (b += label(cols[i] + 2, 181.2, h, { size: 1.9 })));
  for (let r = 0; r < 7; r++) b += line(tx, 192 + r * 7.4, 188, 192 + r * 7.4, { stroke: C.ruleL, sw: 0.2 });
  b += line(142, 176, 142, 236.4, { stroke: C.ruleL, sw: 0.2 });
  b += line(165, 176, 165, 236.4, { stroke: C.ruleL, sw: 0.2 });
  b += label(14, 248, "Discussion & conclusion");
  b += ruled(14, 188, 257, 285, 7);
  kitPages.push(kitPage("p4", "Practical", "Lab report", icon("flask", 0, 0).length ? labArt() : "", b));
}
function labArt() {
  let s = "";
  // An Erlenmeyer flask and a test tube, drawn larger.
  s += pathEl("M164 9 L164 15.5 L157.5 29 Q156.8 31 159 31 L175 31 Q177.2 31 176.5 29 L170 15.5 L170 9", { fill: C.white, stroke: C.sageD, sw: 0.4 });
  s += pathEl("M160.6 23 L173.4 23 L176 28.6 Q176.6 30.4 174.6 30.4 L159.4 30.4 Q157.4 30.4 158 28.6Z", { fill: C.terraL });
  s += line(162.5, 9, 171.5, 9, { stroke: C.sageD, sw: 0.4 });
  s += circle(164, 27, 0.7, { fill: C.terra }) + circle(168.5, 25.6, 0.5, { fill: C.terra }) + circle(171, 28, 0.45, { fill: C.terra });
  s += circle(167, 18.5, 0.4, { fill: C.terra, opacity: 0.6 }) + circle(166, 14, 0.35, { fill: C.terra, opacity: 0.5 });
  s += `<g transform="rotate(14 183 20)">${rect(180.6, 8, 5, 22, { rx: 2.5, fill: C.white, stroke: C.sageD, sw: 0.4 })}${pathEl("M180.6 19 L185.6 19 L185.6 27.5 Q185.6 30 183.1 30 Q180.6 30 180.6 27.5Z", { fill: C.sageL })}</g>`;
  s += sprig([150, 32], [152, 26], [150.5, 19], 2, 3.2);
  return s;
}

// --- 5. Species profile ------------------------------------------------------
{
  let b = "";
  const fx = 14;
  const fy = 46;
  const fw = 94;
  const fh = 100;
  b += rect(fx, fy, fw, fh, { rx: 3, fill: C.white, stroke: C.rule, sw: 0.3 });
  b += label(fx + 4, fy + 6, "Specimen sketch", { fill: C.muted, size: 2 });
  // A millimetre ruler along the bottom and the left edge.
  for (let mm = 0; mm <= 70; mm++) {
    const x = fx + 7 + mm;
    const h = mm % 10 === 0 ? 2.6 : mm % 5 === 0 ? 1.8 : 1;
    b += line(x, fy + fh - 3, x, fy + fh - 3 - h, { stroke: C.sage, sw: mm % 10 === 0 ? 0.25 : 0.15 });
    if (mm % 10 === 0 && mm > 0) b += text(x, fy + fh - 6.6, String(mm / 10), { size: 1.7, anchor: "middle", fill: C.muted });
  }
  b += text(fx + 81, fy + fh - 3.6, "cm", { size: 1.7, anchor: "end", fill: C.muted });
  for (let mm = 0; mm <= 80; mm++) {
    const y = fy + fh - 10 - mm;
    if (y < fy + 10) break;
    const w = mm % 10 === 0 ? 2.6 : mm % 5 === 0 ? 1.8 : 1;
    b += line(fx + 3, y, fx + 3 + w, y, { stroke: C.sage, sw: mm % 10 === 0 ? 0.25 : 0.15 });
  }
  const rx = 114;
  b += field(rx, 188, 54, "Common name");
  b += field(rx, 188, 66, "Latin name");
  b += text(188, 64.6, "Genus species", { serif: true, italic: true, size: 3, fill: C.ruleL, anchor: "end" });
  b += field(rx, 188, 78, "Date");
  b += field(rx, 188, 90, "Location");
  b += field(rx, 188, 102, "Habitat");
  b += label(rx, 113, "Weather");
  const weather = [
    ["sun", 136],
    ["cloud", 149],
    ["rain", 162],
    ["wind", 175],
  ];
  for (const [w, x] of weather) {
    b += circle(x, 112, 4.2, { fill: C.sageW, stroke: C.sageL, sw: 0.25 });
    if (w === "sun") {
      b += circle(x, 112, 1.4, { fill: C.terraL, stroke: C.terra, sw: 0.25 });
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        b += line(x + Math.cos(a) * 2.1, 112 + Math.sin(a) * 2.1, x + Math.cos(a) * 2.9, 112 + Math.sin(a) * 2.9, { stroke: C.terra, sw: 0.25 });
      }
    } else if (w === "cloud") {
      b += pathEl(`M${x - 2.6} 113.3 a1.3 1.3 0 0 1 0.6 -2.5 a1.8 1.8 0 0 1 3.4 -0.4 a1.3 1.3 0 0 1 1.2 2.9Z`, { fill: C.white, stroke: C.sageD, sw: 0.25 });
    } else if (w === "rain") {
      b += pathEl(`M${x - 2.6} 111.6 a1.3 1.3 0 0 1 0.6 -2.5 a1.8 1.8 0 0 1 3.4 -0.4 a1.3 1.3 0 0 1 1.2 2.9Z`, { fill: C.white, stroke: C.sageD, sw: 0.25 });
      for (const dx of [-1.4, 0, 1.4]) b += line(x + dx, 112.8, x + dx - 0.5, 114.4, { stroke: "#7D9EA0", sw: 0.3 });
    } else {
      b += pathEl(`M${x - 2.6} 111 h3.4 a1 1 0 1 0 -1 -1`, { stroke: C.sageD, sw: 0.28 });
      b += pathEl(`M${x - 2.6} 112.6 h4.4 a1 1 0 1 1 -1 1`, { stroke: C.sageD, sw: 0.28 });
      b += pathEl(`M${x - 2.6} 114.2 h2.4`, { stroke: C.sageD, sw: 0.28 });
    }
  }
  b += field(rx, 188, 128, "Size");
  b += field(rx, 188, 140, "Count");
  // Classification as a stepped ladder.
  b += label(14, 160, "Classification");
  const ranks = ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"];
  ranks.forEach((r, i) => {
    const y = 170 + i * 8;
    const x = 16 + i * 4;
    if (i > 0) b += pathEl(`M${x - 2} ${y - 9.6} L${x - 2} ${y - 1.4} L${x - 0.4} ${y - 1.4}`, { stroke: C.sageL, sw: 0.3 });
    b += circle(x + 0.6, y - 1.4, 0.8, { fill: i === ranks.length - 1 ? C.terra : C.sage });
    b += text(x + 3, y - 0.6, r, { serif: true, size: 3.2, fill: C.inkSoft });
    b += line(x + 20, y, 104, y);
  });
  b += label(114, 160, "Distinguishing features");
  for (let i = 0; i < 7; i++) {
    const y = 170 + i * 8;
    b += leaf(114.2, y - 0.6, -0.5, 3, 0.9, { rib: false });
    b += line(119, y, 188, y);
  }
  b += label(14, 234, "Observations");
  b += ruled(14, 188, 243, 285, 7);
  const art = fern([186, 34], [176, 22], [160, 9], 11, 8.5) + sprig([162, 34], [158, 28], [152, 22], 2, 3.2, { berries: false });
  kitPages.push(kitPage("p5", "Field journal", "Species profile", art, b));
}

// --- 6. Genetics -------------------------------------------------------------
{
  let b = "";
  b += field(14, 118, 51, "Cross");
  b += field(124, 188, 51, "Trait");
  // Monohybrid 2 x 2.
  b += label(14, 63, "One trait");
  const g1 = { x: 32, y: 87, n: 2, c: 30 };
  // Dihybrid 4 x 4.
  b += label(102, 63, "Two traits");
  const g2 = { x: 114, y: 80, n: 4, c: 18.5 };
  for (const [g, tone, deep] of [
    [g1, C.sageW, C.sageD],
    [g2, C.terraW, C.terra],
  ]) {
    const size = g.n * g.c;
    b += rect(g.x, g.y, size, size, { rx: 2, fill: C.white, stroke: C.rule, sw: 0.3 });
    for (let k = 1; k < g.n; k++) {
      b += line(g.x + k * g.c, g.y, g.x + k * g.c, g.y + size, { stroke: C.rule, sw: 0.25 });
      b += line(g.x, g.y + k * g.c, g.x + size, g.y + k * g.c, { stroke: C.rule, sw: 0.25 });
    }
    for (let k = 0; k < g.n; k++) {
      b += circle(g.x + (k + 0.5) * g.c, g.y - 5, 3.6, { fill: tone, stroke: deep, sw: 0.25 });
      b += circle(g.x - 6, g.y + (k + 0.5) * g.c, 3.6, { fill: tone, stroke: deep, sw: 0.25 });
    }
    b += text(g.x + size / 2, g.y - 11, "gametes", { size: 2.2, italic: true, fill: C.muted, anchor: "middle" });
    b += text(g.x - 12, g.y + size / 2, "gametes", {
      size: 2.2,
      italic: true,
      fill: C.muted,
      anchor: "middle",
      transform: `rotate(-90 ${g.x - 12} ${g.y + size / 2})`,
    });
  }
  for (const [x1, x2] of [
    [14, 96],
    [102, 188],
  ]) {
    b += field(x1, x2, 168, "Genotypes");
    b += field(x1, x2, 178, "Phenotypes");
  }
  // Pedigree.
  b += label(14, 192, "Pedigree");
  b += rect(14, 196, 174, 89, { rx: 3, fill: C.white, stroke: C.rule, sw: 0.3 });
  b += dots(19, 201, 183, 281, 5, { r: 0.2, fill: C.ruleL });
  const lx = 128;
  b += rect(lx, 199, 57, 9, { rx: 4.5, fill: C.paper, stroke: C.ruleL, sw: 0.25 });
  b += rect(lx + 3, 201.5, 3.6, 3.6, { stroke: C.inkSoft, sw: 0.3 }) + text(lx + 8, 204.6, "male", { size: 2, fill: C.muted });
  b += circle(lx + 19.6, 203.3, 1.8, { stroke: C.inkSoft, sw: 0.3 }) + text(lx + 22.4, 204.6, "female", { size: 2, fill: C.muted });
  b += rect(lx + 33, 201.5, 3.6, 3.6, { fill: C.terra }) + text(lx + 38, 204.6, "affected", { size: 2, fill: C.muted });
  kitPages.push(kitPage("p6", "Inheritance", "Genetics", helix(146, 21, 42, 6, 1.7), b));
}

// --- 7. Revision -------------------------------------------------------------
{
  let b = "";
  b += label(14, 50, "Topics");
  b += label(138, 50, "Confidence", { fill: C.muted });
  b += label(188, 50, "Revised", { fill: C.muted, anchor: "end" });
  for (let i = 0; i < 10; i++) {
    const y = 60 + i * 9;
    b += checkbox(14, y - 0.6, 3.2);
    b += line(21, y, 132, y);
    [C.terra, C.gold, C.sage].forEach((c, k) => (b += circle(141 + k * 6, y - 2, 2, { stroke: c, sw: 0.35 })));
    b += line(164, y, 188, y);
  }
  b += label(14, 163, "Key terms");
  b += text(36, 163, "cover the definition and test yourself", { size: 2.3, italic: true, fill: C.muted });
  for (let i = 0; i < 6; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col ? 103 : 14;
    const y = 168 + row * 39.5;
    b += rect(x, y, 85, 36, { rx: 2.6, fill: C.white, stroke: C.rule, sw: 0.3 });
    b += rect(x, y, 85, 11, { rx: 2.6, fill: col ? C.terraW : C.sageW });
    b += rect(x, y + 8, 85, 3, { fill: col ? C.terraW : C.sageW });
    b += label(x + 4, y + 6.8, "Term", { size: 1.9, fill: col ? C.terra : C.sageD });
    b += line(x, y + 11, x + 85, y + 11, { stroke: C.rule, sw: 0.25, dash: "1 1" });
    b += ruled(x + 4, x + 81, y + 19, y + 33, 7, { stroke: C.ruleL, sw: 0.22 });
  }
  const art =
    `<g transform="rotate(-8 168 22)">${rect(156, 13, 24, 15, { rx: 1.6, fill: C.terraW, stroke: C.terraL, sw: 0.3 })}</g>` +
    `<g transform="rotate(5 172 21)">${rect(162, 12, 24, 15, { rx: 1.6, fill: C.white, stroke: C.sage, sw: 0.3 })}${line(165, 17, 182, 17, { stroke: C.sageL, sw: 0.3 })}${line(165, 20.5, 178, 20.5, { stroke: C.sageL, sw: 0.3 })}</g>` +
    sprig([150, 33], [148, 26], [152, 18], 2, 3.4, { berries: true });
  kitPages.push(kitPage("p7", "Revision", "Revision", art, b));
}

writeFileSync(path.join(OUT, "biology-study-kit.html"), documentOf("Biology study kit", kitPages));

// ======================================================= Botanical papers ===

function paperHeader(art) {
  return art + field(126, 188, 22, "Date");
}
const papers = [];
// Lined.
papers.push(
  page(
    "lined",
    paperHeader(sprig([14, 24], [20, 18], [32, 15], 3, 4.2)) +
      line(30, 34, 30, 287, { stroke: C.terraL, sw: 0.35 }) +
      ruled(14, 196, 40, 286, 8),
  ),
);
// Dotted.
papers.push(page("dotted", paperHeader(sprig([14, 24], [20, 18], [32, 15], 3, 4.2, { berries: true })) + dots(15, 36, 195, 286, 5, { r: 0.28 })));
// Squared.
papers.push(page("squared", paperHeader(fern([14, 26], [22, 20], [34, 16], 8, 5)) + rect(15, 36, 180, 250, { fill: C.white }) + grid(15, 36, 195, 286, 5, 5)));
// Plain, framed, with sprigs in two corners.
papers.push(
  page(
    "plain",
    rect(10, 10, 190, 277, { rx: 4, stroke: C.sage, sw: 0.35 }) +
      rect(12.2, 12.2, 185.6, 272.6, { rx: 3, stroke: C.sageL, sw: 0.25 }) +
      fern([17, 62], [18, 34], [38, 17], 13, 7.5) +
      sprig([19, 19], [30, 25], [47, 26], 3, 3.8, { berries: true }) +
      fern([193, 235], [192, 263], [172, 280], 13, 7.5) +
      sprig([191, 278], [180, 271], [163, 270], 3, 3.8),
  ),
);
writeFileSync(path.join(OUT, "botanical-papers.html"), documentOf("Botanical papers", papers));

// ========================================================== Study planner ===

const PLAN = [
  { id: "week", label: "Week" },
  { id: "exams", label: "Exams" },
  { id: "tracker", label: "Tracker" },
];
function planNav(current) {
  let s = "";
  const links = [];
  PLAN.forEach((p, i) => {
    const x = 137 + i * 17.4;
    const on = p.id === current;
    s += rect(x, 11, 16, 6.4, { rx: 3.2, fill: on ? C.sage : C.sageW });
    s += text(x + 8, 14.25, p.label.toUpperCase(), { size: 1.95, weight: 600, ls: 0.4, anchor: "middle", baseline: "central", fill: on ? "#FFFFFF" : C.sageD });
    links.push({ to: p.id, label: p.label, x, y: 11, w: 16, h: 6.4 });
  });
  return { svg: s, links };
}
function planPage(id, title, body) {
  const n = planNav(id);
  const head =
    label(14, 17, "Study planner") +
    text(14, 30.5, title, { serif: true, size: 9.5, weight: 500 }) +
    line(14, 37, 188, 37, { stroke: C.sage, sw: 0.3 }) +
    circle(14, 37, 0.7, { fill: C.sage });
  return page(id, head + n.svg + body, n.links);
}
const plan = [];
// Week.
{
  let b = "";
  b += field(14, 92, 49, "Week of");
  b += field(98, 188, 49, "Focus");
  b += rect(14, 55, 174, 31, { rx: 3, fill: C.sageW });
  b += label(19, 62, "Top three");
  for (let i = 0; i < 3; i++) {
    const y = 70 + i * 7.5;
    b += circle(21.5, y - 1.6, 1.7, { stroke: C.sage, sw: 0.35 });
    b += line(26, y, 182, y, { stroke: C.sageL, sw: 0.3 });
  }
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Notes"];
  days.forEach((d, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = col ? 104 : 14;
    const y = 93 + row * 48.5;
    const tone = [C.sage, C.terra, "#7D9EA0", C.gold, "#9B87A5", "#8CA46E", C.terra, C.muted][i];
    b += circle(x + 1.6, y + 3.6, 1.6, { fill: tone });
    b += text(x + 5, y + 5, d, { serif: true, size: 4.6, weight: 500 });
    if (d === "Notes") {
      b += dots(x + 2, y + 12, x + 82, y + 42, 5, { r: 0.22 });
    } else {
      b += line(x, y + 8.5, x + 84, y + 8.5, { stroke: C.sageL, sw: 0.3 });
      b += ruled(x, x + 84, y + 16, y + 44, 7);
    }
  });
  plan.push(planPage("week", "This week", b));
}
// Exams.
{
  let b = "";
  const cols = [
    [14, "Subject"],
    [66, "Exam date"],
    [94, "Days left"],
    [116, "Topics to cover"],
    [166, "Ready"],
  ];
  b += rect(14, 46, 174, 9, { rx: 2, fill: C.sageW });
  for (const [x, h] of cols) b += label(x + 2.4, 51.8, h, { size: 1.95 });
  for (let r = 0; r < 9; r++) {
    const y = 65 + r * 10;
    b += line(14, y, 188, y, { stroke: C.ruleL, sw: 0.25 });
    [C.terra, C.gold, C.sage].forEach((c, k) => (b += circle(171 + k * 6, y - 4.4, 1.9, { stroke: c, sw: 0.33 })));
  }
  for (const [x] of cols.slice(1)) b += line(x, 46, x, 145, { stroke: C.ruleL, sw: 0.2 });
  b += label(14, 160, "Revision timetable");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["Morning", "Afternoon", "Evening"];
  const gx = 36;
  const cw = 152 / 7;
  days.forEach((d, i) => (b += label(gx + i * cw + cw / 2, 169, d, { anchor: "middle", size: 1.95, fill: C.muted })));
  slots.forEach((s, r) => {
    const y = 173 + r * 20;
    b += text(14, y + 11, s, { serif: true, italic: true, size: 3.2, fill: C.inkSoft });
    for (let i = 0; i < 7; i++) b += rect(gx + i * cw + 0.9, y, cw - 1.8, 18, { rx: 2, fill: r % 2 ? C.terraW : C.sageW });
  });
  b += label(14, 244, "Notes");
  b += ruled(14, 188, 253, 285, 8);
  plan.push(planPage("exams", "Exam countdown", b));
}
// Tracker.
{
  let b = "";
  b += field(14, 92, 49, "Month");
  b += field(98, 188, 49, "Goal");
  b += label(14, 61, "Habits");
  const x0 = 62;
  const cw = 126 / 31;
  for (let d = 0; d < 31; d++) b += text(x0 + (d + 0.5) * cw, 61, String(d + 1), { size: 1.75, anchor: "middle", fill: C.muted });
  for (let r = 0; r < 6; r++) {
    const y = 70 + r * 8;
    b += line(14, y + 1.8, 58, y + 1.8);
    for (let d = 0; d < 31; d++) b += circle(x0 + (d + 0.5) * cw, y - 0.6, 1.25, { stroke: r % 2 ? C.terraL : C.sageL, sw: 0.3 });
  }
  b += label(14, 130, "Hours studied");
  const cy0 = 136;
  const ch = 64;
  b += rect(x0, cy0, 126, ch, { fill: C.white });
  for (let h = 0; h <= 8; h++) {
    const y = cy0 + ch - (h * ch) / 8;
    b += line(x0, y, 188, y, { stroke: h ? C.ruleL : C.inkSoft, sw: h ? 0.18 : 0.3 });
    b += text(x0 - 2, y + 0.7, String(h), { size: 1.9, anchor: "end", fill: C.muted });
  }
  for (let d = 1; d < 31; d++) b += line(x0 + d * cw, cy0, x0 + d * cw, cy0 + ch, { stroke: C.ruleL, sw: 0.12 });
  for (let d = 0; d < 31; d += 1) b += text(x0 + (d + 0.5) * cw, cy0 + ch + 4, String(d + 1), { size: 1.75, anchor: "middle", fill: C.muted });
  b += text(14, cy0 + 8, "Shade a bar", { serif: true, italic: true, size: 3.2, fill: C.inkSoft });
  b += text(14, cy0 + 13, "for each day", { serif: true, italic: true, size: 3.2, fill: C.inkSoft });
  for (const [x, t, tone] of [
    [14, "What went well", C.sageW],
    [103, "What to change", C.terraW],
  ]) {
    b += rect(x, 214, 85, 71, { rx: 3, fill: tone });
    b += label(x + 5, 222, t, { fill: tone === C.sageW ? C.sageD : C.terra });
    b += ruled(x + 5, x + 80, 232, 280, 8, { stroke: tone === C.sageW ? C.sageL : C.terraL, sw: 0.3 });
  }
  plan.push(planPage("tracker", "Monthly tracker", b));
}
writeFileSync(path.join(OUT, "study-planner.html"), documentOf("Study planner", plan));
console.log("ok");
