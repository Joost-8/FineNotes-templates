// Seven more gallery template drafts, each in its own theme.
//
//   node more.mjs <outdir>
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  T, useTheme, f, text, label, line, rect, circle, ellipse, pathEl, poly, field, ruled, dots, grid, checkbox, nav, page, documentOf, hexPath,
} from "./lib.mjs";

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const save = (id, title, pages) => writeFileSync(path.join(OUT, `${id}.html`), documentOf(title, pages));
const gf = (families) => `https://fonts.googleapis.com/css2?${families.map((x) => `family=${x}`).join("&")}&display=block`;

/** A set of pages linked by a nav row at the foot. */
function linked(items, build, navY) {
  return items.map((it) => {
    const n = nav(items, it.id, navY);
    const { body, links = [] } = build(it);
    return page(it.id, body + n.svg, [...n.links, ...links]);
  });
}

// ============================================================ 1 Chemistry ===
useTheme({
  paper: "#F7F9FB", ink: "#1D2B3A", inkSoft: "#3C4B5A", muted: "#7A8896",
  accent: "#2A8C8C", accent2: "#E07A5F", accent3: "#E9B44C",
  wash: "#E7F2F2", wash2: "#FBEAE4", rule: "#CBD6DE", ruleL: "#E1E8EE",
  serif: "Space Grotesk", sans: "IBM Plex Sans", mono: "IBM Plex Mono",
  labelColor: "#2A8C8C", navOn: "#2A8C8C", navOff: "#E7F2F2", navOffText: "#2A8C8C",
  fonts: gf(["IBM+Plex+Mono:wght@400;500", "IBM+Plex+Sans:wght@400;500;600", "Space+Grotesk:wght@500;600;700"]),
});
{
  const molecule = () => {
    const at = [
      [152, 22, "C"], [161, 17, "C"], [170, 22, "O"], [179, 17, "H"], [152, 32, "H"], [143, 17, "H"], [161, 8, "H"],
    ];
    const bonds = [[0, 1], [1, 2], [2, 3], [0, 4], [0, 5], [1, 6]];
    let s = "";
    for (const [a, b] of bonds) s += line(at[a][0], at[a][1], at[b][0], at[b][1], { stroke: T.inkSoft, sw: 0.5 });
    for (const [x, y, el] of at) {
      const r = el === "H" ? 2.1 : 3.2;
      const fill = el === "C" ? T.inkSoft : el === "O" ? T.accent2 : T.white;
      s += circle(x, y, r, { fill, stroke: el === "H" ? T.inkSoft : "none", sw: 0.3 });
      s += circle(x - r * 0.35, y - r * 0.35, r * 0.28, { fill: "#FFFFFF", opacity: el === "H" ? 0 : 0.35 });
    }
    s += pathEl(hexPath(184, 30, 4.6), { stroke: T.accent, sw: 0.35 }) + circle(184, 30, 2.6, { stroke: T.accent, sw: 0.25 });
    return s;
  };
  const head = (section, title) =>
    pathEl(hexPath(17.4, 14.6, 3.1), { stroke: T.accent, sw: 0.35 }) +
    circle(17.4, 14.6, 1.7, { stroke: T.accent, sw: 0.25 }) +
    label(23, 15.6, `Chemistry  ·  ${section}`) +
    text(14, 30.5, title, { serif: true, size: 9, weight: 600, ls: -0.1 }) +
    line(14, 36.6, 188, 36.6, { stroke: T.ruleL, sw: 0.3 }) +
    line(14, 36.6, 34, 36.6, { stroke: T.accent, sw: 0.8, cap: "butt" }) +
    molecule();
  const items = [
    { id: "notes", label: "Notes" },
    { id: "lab", label: "Lab" },
    { id: "structures", label: "Structures" },
  ];
  const pages = linked(items, ({ id }) => {
    let b = "";
    if (id === "notes") {
      b += head("Lecture", "Lecture notes");
      b += field(14, 128, 49, "Topic") + field(134, 188, 49, "Date");
      b += label(14, 59, "Notes");
      b += ruled(14, 134, 67, 235, 8);
      b += label(142, 59, "Equations & constants");
      b += rect(142, 63, 46, 172, { rx: 1.6, fill: T.white, stroke: T.ruleL, sw: 0.25 });
      b += grid(143.5, 64.5, 186.5, 234, 4.3, 0);
      b += label(14, 247, "Key reactions");
      for (let i = 0; i < 3; i++) {
        const y = 258 + i * 9;
        b += line(14, y, 86, y);
        b += line(91, y - 1.6, 109, y - 1.6, { stroke: T.accent, sw: 0.4 });
        b += pathEl(`M106.6 ${f(y - 3)} L109.4 ${f(y - 1.6)} L106.6 ${f(y - 0.2)}`, { stroke: T.accent, sw: 0.4 });
        b += line(114, y, 188, y);
      }
      b += text(100, 252.6, "conditions", { size: 1.8, anchor: "middle", fill: T.muted, italic: true });
    } else if (id === "lab") {
      b += head("Practical", "Lab notebook");
      b += field(14, 136, 49, "Experiment") + field(142, 188, 49, "Date");
      b += label(14, 59, "Hazards");
      const hz = ["Flammable", "Oxidiser", "Corrosive", "Toxic", "Irritant", "Environment"];
      hz.forEach((h, i) => {
        const cx = 22 + i * 19.6;
        b += rect(cx - 3.6, 70 - 3.6, 7.2, 7.2, { fill: T.white, stroke: T.accent2, sw: 0.45, rx: 0.6, transform: `rotate(45 ${cx} 70)` });
        b += text(cx, 80.4, h, { size: 1.75, anchor: "middle", fill: T.muted });
      });
      b += label(142, 59, "Protection");
      ["Goggles", "Gloves", "Lab coat"].forEach((p, i) => {
        b += checkbox(142, 67.6 + i * 6.4, 3, T.accent);
        b += text(147.5, 66.9 + i * 6.4, p, { size: 2.3, fill: T.inkSoft });
      });
      b += label(14, 92, "Reagents");
      const cols = [[14, "Substance"], [64, "Formula"], [98, "M (g/mol)"], [126, "Amount"], [156, "Moles"]];
      b += rect(14, 95, 174, 8, { rx: 1.6, fill: T.wash });
      for (const [x, h] of cols) b += label(x + 2.4, 100.2, h, { size: 1.9 });
      for (let r = 1; r <= 5; r++) b += line(14, 103 + r * 8, 188, 103 + r * 8, { stroke: T.ruleL, sw: 0.25 });
      for (const [x] of cols.slice(1)) b += line(x, 95, x, 143, { stroke: T.ruleL, sw: 0.2 });
      b += label(14, 154, "Procedure");
      for (let i = 0; i < 6; i++) {
        const y = 163 + i * 8;
        b += text(15, y - 0.7, String(i + 1).padStart(2, "0"), { mono: true, size: 2.3, fill: T.accent });
        b += line(22, y, 188, y);
      }
      b += label(14, 214, "Observations & data");
      b += rect(14, 218, 106, 62, { fill: T.white });
      b += grid(14, 218, 120, 280, 2.5, 4);
      b += label(126, 214, "Calculations");
      b += ruled(126, 188, 226, 280, 7.7);
    } else {
      b += head("Organic", "Structures");
      b += field(14, 120, 49, "Compound") + field(126, 188, 49, "Formula");
      b += `<clipPath id="hexclip"><rect x="14" y="55" width="174" height="225" rx="2"/></clipPath>`;
      b += rect(14, 55, 174, 225, { rx: 2, fill: T.white, stroke: T.ruleL, sw: 0.25 });
      const r = 5.2;
      const w = Math.sqrt(3) * r;
      let hexes = "";
      for (let row = 0; row * 1.5 * r < 232; row++) {
        for (let col = -1; col * w < 180; col++) {
          const cx = 14 + col * w + (row % 2 ? w / 2 : 0);
          const cy = 55 + row * 1.5 * r;
          hexes += pathEl(hexPath(cx, cy, r), { stroke: T.ruleL, sw: 0.18 });
        }
      }
      b += `<g clip-path="url(#hexclip)">${hexes}</g>`;
    }
    return { body: b };
  });
  save("chemistry-lab-notebook", "Chemistry lab notebook", pages);
}

// ================================================================ 2 Maths ===
useTheme({
  paper: "#FAFAF7", ink: "#222222", inkSoft: "#444444", muted: "#8C8C86",
  accent: "#D9A21B", accent2: "#4A6FA5", wash: "#F6EED6", wash2: "#E9EEF6", rule: "#D6D6D0", ruleL: "#E7E7E2",
  serif: "EB Garamond", sans: "Inter", labelColor: "#555555", labelLs: 0.38,
  navOn: "#222222", navOff: "#ECECE6", navOffText: "#555555",
  fonts: gf(["EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500", "Inter:wght@400;500;600"]),
});
{
  const art = () => {
    let s = line(146, 22, 188, 22, { stroke: T.muted, sw: 0.25 }) + line(152, 7, 152, 33, { stroke: T.muted, sw: 0.25 });
    let d = "";
    for (let i = 0; i <= 60; i++) {
      const x = 146 + (i / 60) * 42;
      const y = 22 - 8 * Math.sin(((x - 152) / 42) * 2 * Math.PI * 1.15);
      d += `${i ? "L" : "M"}${f(x)} ${f(y)}`;
    }
    s += pathEl(d, { stroke: T.accent2, sw: 0.45 });
    s += circle(161, 22 - 8 * Math.sin((9 / 42) * 2 * Math.PI * 1.15), 0.9, { fill: T.accent });
    s += text(186, 31, "x", { serif: true, italic: true, size: 3.2, fill: T.muted });
    s += text(154, 9, "y", { serif: true, italic: true, size: 3.2, fill: T.muted });
    return s;
  };
  const head = (section, title) =>
    label(14, 16, `Mathematics  ·  ${section}`) +
    text(13.6, 30.5, title, { serif: true, size: 10.5, weight: 500 }) +
    rect(14, 35.2, 14, 1.3, { fill: T.accent }) +
    line(30, 35.85, 188, 35.85, { stroke: T.rule, sw: 0.25 }) +
    art();
  const items = [
    { id: "problems", label: "Problems" },
    { id: "graph", label: "Graph" },
    { id: "proof", label: "Proof" },
    { id: "formulas", label: "Formulas" },
  ];
  const pages = linked(items, ({ id }) => {
    let b = "";
    if (id === "problems") {
      b += head("Practice", "Problem set");
      b += field(14, 100, 49, "Course") + field(106, 140, 49, "Set") + field(146, 188, 49, "Due");
      for (let i = 0; i < 4; i++) {
        const y = 55 + i * 56.5;
        b += text(14, y + 9.4, String(i + 1), { serif: true, italic: true, size: 8, fill: T.accent });
        b += dots(25, y + 4, 185, y + 49, 5, { r: 0.22, fill: T.rule });
        b += rect(138, y + 41, 50, 9, { rx: 1.6, fill: T.white, stroke: T.inkSoft, sw: 0.3 });
        b += label(141, y + 46.6, "Answer", { size: 1.8, fill: T.muted });
        if (i < 3) b += line(14, y + 54.5, 188, y + 54.5, { stroke: T.ruleL, sw: 0.3 });
      }
    } else if (id === "graph") {
      b += head("Functions", "Graphing");
      b += field(14, 128, 49, "Function") + field(134, 188, 49, "Domain");
      b += rect(30, 56, 150, 150, { fill: T.white });
      b += grid(30, 56, 180, 206, 5, 5);
      b += line(30, 131, 181.5, 131, { stroke: T.ink, sw: 0.4 }) + line(105, 54.5, 105, 206, { stroke: T.ink, sw: 0.4 });
      b += pathEl("M179.6 129.8 L182 131 L179.6 132.2", { stroke: T.ink, sw: 0.4 });
      b += pathEl("M103.8 56.9 L105 54.5 L106.2 56.9", { stroke: T.ink, sw: 0.4 });
      b += text(184, 132.2, "x", { serif: true, italic: true, size: 4 }) + text(107, 56, "y", { serif: true, italic: true, size: 4 });
      b += text(103.6, 135.2, "0", { serif: true, italic: true, size: 3, anchor: "end", fill: T.muted });
      b += label(14, 218, "Table of values");
      b += rect(14, 221, 174, 16, { rx: 1.6, fill: T.white, stroke: T.rule, sw: 0.25 });
      b += rect(14, 221, 14, 16, { rx: 1.6, fill: T.wash });
      b += line(14, 229, 188, 229, { stroke: T.rule, sw: 0.25 });
      for (let k = 0; k < 10; k++) b += line(28 + k * 16, 221, 28 + k * 16, 237, { stroke: T.ruleL, sw: 0.2 });
      b += text(21, 226.6, "x", { serif: true, italic: true, size: 3.4, anchor: "middle" });
      b += text(21, 234.6, "y", { serif: true, italic: true, size: 3.4, anchor: "middle" });
      b += label(14, 250, "Notes");
      b += ruled(14, 188, 259, 277, 9);
    } else if (id === "proof") {
      b += head("Reasoning", "Proof");
      b += field(14, 188, 49, "Theorem");
      b += field(14, 188, 59, "Given");
      b += field(14, 188, 69, "Prove");
      b += rect(14, 75, 174, 8, { rx: 1.6, fill: T.wash });
      b += label(25, 80.2, "Statement", { size: 1.9 }) + label(122, 80.2, "Reason", { size: 1.9 });
      for (let i = 0; i < 15; i++) {
        const y = 83 + (i + 1) * 12.4;
        b += text(18, y - 4.6, String(i + 1), { serif: true, italic: true, size: 3.4, fill: T.muted, anchor: "middle" });
        b += line(14, y, 188, y, { stroke: T.ruleL, sw: 0.25 });
      }
      b += line(118, 75, 118, 269, { stroke: T.rule, sw: 0.25 }) + line(23, 83, 23, 269, { stroke: T.ruleL, sw: 0.2 });
      b += rect(184.6, 273, 3.4, 3.4, { fill: T.ink });
    } else {
      b += head("Reference", "Formula sheet");
      for (let i = 0; i < 8; i++) {
        const x = i % 2 ? 103 : 14;
        const y = 45 + Math.floor(i / 2) * 58.5;
        b += rect(x, y, 85, 53, { rx: 2.4, fill: T.white, stroke: T.rule, sw: 0.25 });
        b += rect(x, y, 85, 10, { rx: 2.4, fill: i % 2 ? T.wash2 : T.wash });
        b += rect(x, y + 6, 85, 4, { fill: i % 2 ? T.wash2 : T.wash });
        b += line(x + 4, y + 7, x + 60, y + 7, { stroke: T.rule, sw: 0.25 });
        b += dots(x + 5, y + 15, x + 80, y + 50, 5, { r: 0.2, fill: T.ruleL });
      }
    }
    return { body: b };
  });
  save("maths-problem-sets", "Maths problem sets", pages);
}

// ============================================================= 3 Language ===
useTheme({
  paper: "#FBF7F0", ink: "#253446", inkSoft: "#44546A", muted: "#8B8F96",
  accent: "#5B7FA6", accent2: "#E2725B", accent3: "#E9B44C",
  wash: "#E6EEF6", wash2: "#FBE4DD", wash3: "#FBF0D6", rule: "#D8D2C6", ruleL: "#E7E1D6",
  serif: "Playfair Display", sans: "Karla", hand: "Caveat", labelColor: "#5B7FA6", labelLs: 0.5,
  navOn: "#E2725B", navOff: "#FBE4DD", navOffText: "#C25A44",
  fonts: gf(["Caveat:wght@500;600", "Karla:wght@400;500;700", "Playfair+Display:ital,wght@0,500;0,600;1,500"]),
});
{
  const stamp = () => {
    let s = `<g transform="rotate(5 176 19)">`;
    s += rect(165, 7, 22, 26, { fill: T.white });
    for (let k = 0; k <= 11; k++) {
      s += circle(165 + k * 2, 7, 0.75, { fill: T.paper }) + circle(165 + k * 2, 33, 0.75, { fill: T.paper });
    }
    for (let k = 0; k <= 13; k++) s += circle(165, 7 + k * 2, 0.75, { fill: T.paper }) + circle(187, 7 + k * 2, 0.75, { fill: T.paper });
    s += rect(167.5, 9.5, 17, 21, { fill: T.wash });
    s += circle(179, 16, 3, { fill: T.accent3 });
    s += pathEl("M167.5 24 q2.1 -1.6 4.25 0 t4.25 0 t4.25 0 t4.25 0 L184.5 30.5 L167.5 30.5Z", { fill: T.accent });
    s += pathEl("M167.5 21.6 q2.1 -1.4 4.25 0 t4.25 0 t4.25 0 t4.25 0", { stroke: T.accent, sw: 0.3 });
    s += text(169, 13.6, "20", { serif: true, size: 2.6, fill: T.accent2, weight: 600 });
    s += `</g>`;
    s += circle(158, 23, 7.5, { stroke: T.muted, sw: 0.3, opacity: 0.8 }) + circle(158, 23, 5.9, { stroke: T.muted, sw: 0.2, opacity: 0.8 });
    s += text(158, 23.9, "PAR AVION", { size: 1.35, anchor: "middle", fill: T.muted, ls: 0.15, weight: 700 });
    for (let k = 0; k < 4; k++) s += pathEl(`M136 ${18 + k * 2.2} q2.5 -1.2 5 0 t5 0 t5 0 t3.5 0`, { stroke: T.muted, sw: 0.22, opacity: 0.7 });
    return s;
  };
  const airmail = (y) => {
    let s = "";
    for (let k = 0; k < 29; k++) {
      const x = 14 + k * 6;
      s += poly([[x, y + 1.2], [x + 2.4, y], [x + 5, y], [x + 2.6, y + 1.2]], { fill: k % 2 ? T.accent2 : T.accent });
    }
    return s;
  };
  const head = (section, title) =>
    label(14, 16, `Language journal  ·  ${section}`) + text(14, 30.5, title, { serif: true, size: 9.5, weight: 600 }) + airmail(35.6) + stamp();
  const items = [
    { id: "vocab", label: "Words" },
    { id: "grammar", label: "Grammar" },
    { id: "verbs", label: "Verbs" },
    { id: "writing", label: "Writing" },
  ];
  const pages = linked(items, ({ id }) => {
    let b = "";
    if (id === "vocab") {
      b += head("Vocabulary", "Vocabulary");
      b += field(14, 100, 49, "Language") + field(106, 188, 49, "Theme");
      b += rect(14, 55, 174, 8, { rx: 1.6, fill: T.wash });
      b += label(26, 60.2, "Word", { size: 1.9 }) + label(70, 60.2, "Meaning", { size: 1.9 }) + label(114, 60.2, "Example", { size: 1.9 });
      [[T.accent, "m"], [T.accent2, "f"], [T.accent3, "n"]].forEach(([c, g], k) => {
        b += circle(171 + k * 6, 59, 1, { fill: c }) + text(172.6 + k * 6, 60, g, { size: 1.9, fill: T.muted });
      });
      for (let r = 0; r < 19; r++) {
        const y = 63 + (r + 1) * 11.2;
        [T.accent, T.accent2, T.accent3].forEach((c, k) => (b += circle(16.4 + k * 2.6, y - 3.6, 0.85, { stroke: c, sw: 0.3 })));
        b += line(14, y, 188, y, { stroke: T.ruleL, sw: 0.25 });
      }
      b += line(66, 55, 66, 275.8, { stroke: T.ruleL, sw: 0.2 }) + line(110, 55, 110, 275.8, { stroke: T.ruleL, sw: 0.2 });
    } else if (id === "grammar") {
      b += head("Grammar", "Grammar notes");
      b += field(14, 188, 49, "Topic");
      b += rect(14, 55, 174, 52, { rx: 3, fill: T.wash });
      b += label(20, 63, "The rule");
      b += ruled(20, 182, 72, 100, 7, { stroke: "#CBD8E6", sw: 0.3 });
      b += label(14, 117, "Examples");
      for (let i = 0; i < 5; i++) {
        const y = 126 + i * 8;
        b += text(15.5, y - 0.6, String(i + 1), { serif: true, italic: true, size: 3.6, fill: T.accent2, anchor: "middle" });
        b += line(20, y, 188, y);
      }
      b += rect(14, 166, 84, 64, { rx: 3, fill: T.wash2 });
      b += label(20, 174, "Exceptions", { fill: T.accent2 });
      b += ruled(20, 92, 183, 225, 7, { stroke: "#F1CDC2", sw: 0.3 });
      b += rect(104, 166, 84, 64, { rx: 3, fill: T.wash3 });
      b += label(110, 174, "Memory tip", { fill: "#B88A22" });
      b += ruled(110, 182, 183, 225, 7, { stroke: "#F0DFAF", sw: 0.3 });
      b += label(14, 240, "My own sentences");
      b += ruled(14, 188, 249, 279, 7.5);
    } else if (id === "verbs") {
      b += head("Verbs", "Conjugation");
      const persons = ["I", "you", "he · she", "we", "you all", "they"];
      for (let i = 0; i < 4; i++) {
        const x = i % 2 ? 103 : 14;
        const y = 45 + Math.floor(i / 2) * 118;
        b += rect(x, y, 85, 112, { rx: 3, fill: T.white, stroke: T.rule, sw: 0.25 });
        b += rect(x, y, 85, 21, { rx: 3, fill: i % 3 ? T.wash2 : T.wash });
        b += rect(x, y + 17, 85, 4, { fill: i % 3 ? T.wash2 : T.wash });
        b += field(x + 4, x + 81, y + 9, "Verb", { stroke: "#C9D3DE" });
        b += field(x + 4, x + 81, y + 17, "Tense", { stroke: "#C9D3DE" });
        persons.forEach((p, k) => {
          const ly = y + 33 + k * 14.5;
          b += text(x + 5, ly - 0.8, p, { serif: true, italic: true, size: 3.2, fill: T.muted });
          b += line(x + 26, ly, x + 81, ly);
        });
      }
    } else {
      b += head("Writing", "Writing practice");
      b += field(14, 80, 49, "Date") + field(86, 188, 49, "Topic");
      b += label(14, 59, "In my new language");
      b += label(147, 59, "Corrections", { fill: T.accent2 });
      b += line(143, 55, 143, 252, { stroke: T.accent2, sw: 0.35, opacity: 0.6 });
      b += ruled(14, 140, 67, 247, 9);
      b += ruled(147, 188, 67, 247, 9, { stroke: "#F1CDC2" });
      b += label(14, 260, "New words");
      for (let k = 0; k < 4; k++) b += rect(14 + k * 44, 264, 41, 15, { rx: 7.5, fill: k % 2 ? T.wash2 : T.wash });
    }
    return { body: b };
  });
  save("language-learning-journal", "Language learning journal", pages);
}

// ============================================================== 4 History ===
useTheme({
  paper: "#F6F0E3", ink: "#2B2118", inkSoft: "#4E4033", muted: "#8C7B66",
  accent: "#7A2E2E", accent2: "#B08D57", wash: "#EFE5D2", white: "#FBF7EE", rule: "#D3C5AA", ruleL: "#E4D9C3",
  serif: "Cormorant Garamond", sans: "Libre Franklin", labelColor: "#7A2E2E", labelLs: 0.6, labelSize: 2.05,
  navOn: "#7A2E2E", navOff: "#EFE5D2", navOffText: "#7A2E2E",
  fonts: gf(["Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600", "Libre+Franklin:wght@400;500;600"]),
});
{
  const frame = () => {
    let s = rect(8, 8, 194, 281, { stroke: T.rule, sw: 0.35 }) + rect(9.8, 9.8, 190.4, 277.4, { stroke: T.ruleL, sw: 0.2 });
    for (const [x, y] of [[8, 8], [202, 8], [8, 289], [202, 289]]) {
      s += rect(x - 1.4, y - 1.4, 2.8, 2.8, { fill: T.accent2, transform: `rotate(45 ${x} ${y})` });
    }
    return s;
  };
  const ornament = (y) =>
    line(52, y, 96, y, { stroke: T.accent2, sw: 0.3 }) +
    line(114, y, 158, y, { stroke: T.accent2, sw: 0.3 }) +
    rect(103.6, y - 1.4, 2.8, 2.8, { fill: T.accent, transform: `rotate(45 105 ${y})` }) +
    circle(99.4, y, 0.6, { fill: T.accent2 }) +
    circle(110.6, y, 0.6, { fill: T.accent2 });
  const head = (section, title) =>
    frame() +
    label(105, 20.5, `History  ·  ${section}`, { anchor: "middle" }) +
    text(105, 33.5, title, { serif: true, size: 11, weight: 600, anchor: "middle" }) +
    ornament(38.8);
  const items = [
    { id: "timeline", label: "Timeline" },
    { id: "source", label: "Sources" },
    { id: "essay", label: "Essay" },
    { id: "figure", label: "Figures" },
  ];
  const pages = linked(
    items,
    ({ id }) => {
      let b = "";
      if (id === "timeline") {
        b += head("Chronology", "Timeline");
        b += field(24, 118, 51, "Topic") + field(124, 186, 51, "Period");
        b += line(105, 60, 105, 270, { stroke: T.accent2, sw: 0.5 });
        for (let i = 0; i < 10; i++) {
          const y = 66 + i * 21;
          const left = i % 2 === 0;
          b += circle(105, y, 3, { stroke: T.accent2, sw: 0.25 }) + circle(105, y, 1.7, { fill: T.accent });
          if (left) {
            b += line(84, y, 101.6, y, { stroke: T.accent2, sw: 0.25 });
            b += rect(78, y - 4, 22, 8, { rx: 4, fill: T.wash });
            b += line(112, y, 186, y) + line(112, y + 7.5, 186, y + 7.5);
          } else {
            b += line(108.4, y, 126, y, { stroke: T.accent2, sw: 0.25 });
            b += rect(110, y - 4, 22, 8, { rx: 4, fill: T.wash });
            b += line(24, y, 98, y) + line(24, y + 7.5, 98, y + 7.5);
          }
        }
      } else if (id === "source") {
        b += head("Evidence", "Source analysis");
        b += field(24, 130, 51, "Source") + field(136, 186, 51, "Date");
        b += rect(24, 57, 162, 42, { rx: 2, fill: T.wash });
        b += text(28, 74, "“", { serif: true, size: 16, fill: T.accent2 });
        b += text(183, 102, "”", { serif: true, size: 16, fill: T.accent2, anchor: "end" });
        b += ruled(36, 174, 70, 94, 8, { stroke: T.rule });
        const boxes = [
          ["Origin", "who made it, when, where"],
          ["Purpose", "why, and for whom"],
          ["Value", "what it tells us"],
          ["Limitations", "what it leaves out"],
        ];
        boxes.forEach(([t, sub], i) => {
          const x = i % 2 ? 107 : 24;
          const y = 106 + Math.floor(i / 2) * 72;
          b += rect(x, y, 79, 66, { rx: 2, stroke: T.rule, sw: 0.3 });
          b += label(x + 4, y + 7, t) + text(x + 4 + t.length * 2.05 + 2, y + 7, sub, { serif: true, italic: true, size: 2.9, fill: T.muted });
          b += ruled(x + 4, x + 75, y + 16, y + 61, 7.5);
        });
        b += label(24, 260, "My judgement");
        b += ruled(24, 186, 268, 275, 7);
      } else if (id === "essay") {
        b += head("Argument", "Essay planner");
        b += field(24, 186, 51, "Question");
        b += rect(24, 56, 162, 26, { rx: 2, fill: T.wash });
        b += label(29, 63, "Thesis");
        b += ruled(29, 181, 70.5, 78, 7.5, { stroke: T.rule });
        ["I", "II", "III"].forEach((n, k) => {
          const y = 89 + k * 52;
          b += text(29, y + 8, n, { serif: true, size: 8, weight: 600, fill: T.accent, anchor: "middle" });
          b += line(36, y + 2, 36, y + 46, { stroke: T.accent2, sw: 0.3 });
          const rows = [["Point", 8], ["Evidence", 18], ["", 26], ["Explain", 36], ["", 44]];
          for (const [lab, dy] of rows) {
            if (lab) b += text(40, y + dy - 0.8, lab, { serif: true, italic: true, size: 3.2, fill: T.muted });
            b += line(58, y + dy, 186, y + dy);
          }
        });
        b += label(24, 252, "Conclusion");
        b += ruled(24, 186, 260, 274, 7);
      } else {
        b += head("People", "Key figure");
        b += ellipse(52, 92, 26, 33, { fill: T.white, stroke: T.accent2, sw: 0.5 });
        b += ellipse(52, 92, 23.6, 30.6, { stroke: T.ruleL, sw: 0.3 });
        b += text(52, 131, "portrait or sketch", { serif: true, italic: true, size: 3, fill: T.muted, anchor: "middle" });
        ["Name", "Lived", "Role", "Place", "Known for"].forEach((n, k) => (b += field(88, 186, 64 + k * 13, n)));
        b += label(24, 146, "Key events");
        for (let k = 0; k < 5; k++) {
          const y = 156 + k * 10;
          b += rect(24, y - 5.6, 22, 7.4, { rx: 3.7, fill: T.wash });
          b += line(50, y, 186, y);
        }
        b += label(24, 212, "Significance");
        b += ruled(24, 186, 220, 241, 7);
        b += rect(24, 248, 162, 26, { rx: 2, fill: T.wash });
        b += text(28, 263, "“", { serif: true, size: 13, fill: T.accent2 });
        b += line(36, 260, 180, 260, { stroke: T.rule }) + line(36, 268, 180, 268, { stroke: T.rule });
      }
      return { body: b };
    },
    278.6,
  );
  save("history-study-notes", "History study notes", pages);
}

// ================================================================ 5 Music ===
useTheme({
  paper: "#FCFAF5", ink: "#151515", inkSoft: "#3A3A3A", muted: "#8E8A80",
  accent: "#B8963E", accent2: "#151515", wash: "#F4EEDC", rule: "#D9D3C4", ruleL: "#E8E3D6",
  serif: "Bodoni Moda", sans: "Jost", labelColor: "#8C6F24", labelLs: 0.55,
  navOn: "#151515", navOff: "#F4EEDC", navOffText: "#8C6F24",
  fonts: gf(["Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,600;1,6..96,500", "Jost:wght@400;500;600"]),
});
{
  const note = (x, y, color, stemUp = true) =>
    ellipse(x, y, 1.9, 1.3, { fill: color, transform: `rotate(-22 ${x} ${y})` }) +
    line(x + (stemUp ? 1.7 : -1.7), y, x + (stemUp ? 1.7 : -1.7), y + (stemUp ? -10 : 10), { stroke: color, sw: 0.35 });
  const art = () => {
    let s = "";
    for (let k = 0; k < 5; k++) s += line(140, 14 + k * 2, 188, 14 + k * 2, { stroke: T.rule, sw: 0.2 });
    s += note(150, 22, T.ink) + note(158, 20, T.ink);
    s += poly([[151.7, 12], [159.7, 10], [159.7, 11.2], [151.7, 13.2]], { fill: T.ink });
    s += note(170, 18, T.accent) + note(178, 16, T.accent);
    s += poly([[171.7, 8], [179.7, 6], [179.7, 7.2], [171.7, 9.2]], { fill: T.accent });
    s += poly([[171.7, 10.2], [179.7, 8.2], [179.7, 9.4], [171.7, 11.4]], { fill: T.accent });
    return s;
  };
  const head = (section, title) =>
    label(14, 16, `Music  ·  ${section}`) +
    text(14, 30.5, title, { serif: true, size: 10, weight: 500 }) +
    line(14, 36.2, 188, 36.2, { stroke: T.ink, sw: 0.5 }) +
    line(14, 37.4, 188, 37.4, { stroke: T.accent, sw: 0.25 }) +
    art();
  const staff = (x1, x2, y0, sp = 2) => {
    let s = "";
    for (let k = 0; k < 5; k++) s += line(x1, y0 + k * sp, x2, y0 + k * sp, { stroke: "#4A4A4A", sw: 0.2, cap: "butt" });
    return s + line(x1, y0, x1, y0 + 4 * sp, { stroke: "#4A4A4A", sw: 0.3, cap: "butt" }) + line(x2, y0, x2, y0 + 4 * sp, { stroke: "#4A4A4A", sw: 0.3, cap: "butt" });
  };
  const items = [
    { id: "staff", label: "Staff" },
    { id: "lead", label: "Lead sheet" },
    { id: "tab", label: "Chords & tab" },
    { id: "practice", label: "Practice" },
  ];
  const pages = linked(items, ({ id }) => {
    let b = "";
    if (id === "staff") {
      b += head("Manuscript", "Staff paper");
      b += field(14, 128, 48, "Title") + field(134, 188, 48, "Composer");
      for (let k = 0; k < 11; k++) b += staff(14, 188, 58 + k * 20.5);
    } else if (id === "lead") {
      b += head("Songs", "Lead sheet");
      b += field(14, 104, 48, "Song") + field(110, 140, 48, "Key") + field(146, 188, 48, "Tempo");
      for (let k = 0; k < 8; k++) {
        const y = 66 + k * 27;
        b += line(14, y - 6, 188, y - 6, { stroke: T.ruleL, sw: 0.25, dash: "0.4 1.2" });
        b += staff(14, 188, y);
        for (const x of [57.5, 101, 144.5]) b += line(x, y, x, y + 8, { stroke: "#4A4A4A", sw: 0.25, cap: "butt" });
      }
    } else if (id === "tab") {
      b += head("Guitar", "Chords & tab");
      b += label(14, 48, "Chords");
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 6; c++) {
          const x = 18 + c * 29;
          const y = 60 + r * 34;
          b += line(x, y - 5, x + 18, y - 5, { stroke: T.rule });
          b += line(x, y, x + 18, y, { stroke: T.ink, sw: 0.9, cap: "butt" });
          for (let s = 0; s < 6; s++) b += line(x + s * 3.6, y, x + s * 3.6, y + 20, { stroke: T.inkSoft, sw: 0.2 });
          for (let fr = 1; fr <= 5; fr++) b += line(x, y + fr * 4, x + 18, y + fr * 4, { stroke: T.inkSoft, sw: 0.2 });
        }
      }
      b += label(14, 132, "Tab");
      for (let k = 0; k < 6; k++) {
        const y = 138 + k * 24;
        for (let s = 0; s < 6; s++) b += line(14, y + s * 1.8, 188, y + s * 1.8, { stroke: "#4A4A4A", sw: 0.18, cap: "butt" });
        b += line(14, y, 14, y + 9, { stroke: "#4A4A4A", sw: 0.3 }) + line(188, y, 188, y + 9, { stroke: "#4A4A4A", sw: 0.3 });
        ["T", "A", "B"].forEach((ch, i) => (b += text(16.4, y + 2.6 + i * 2.8, ch, { serif: true, size: 2.6, weight: 600 })));
      }
    } else {
      b += head("Practice", "Practice log");
      b += field(14, 100, 48, "Week of") + field(106, 188, 48, "Instrument");
      const cols = [[14, "Day"], [36, "Warm-up"], [76, "Pieces & passages"], [150, "Min"], [166, "Focus"]];
      b += rect(14, 54, 174, 8, { rx: 1.6, fill: T.wash });
      for (const [x, h] of cols) b += label(x + 2.4, 59.2, h, { size: 1.9 });
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d, i) => {
        const y = 62 + (i + 1) * 15;
        b += text(16.4, y - 6.4, d, { serif: true, italic: true, size: 3.6 });
        b += line(14, y, 188, y, { stroke: T.ruleL, sw: 0.25 });
        for (let k = 0; k < 3; k++) b += circle(171 + k * 6, y - 7.5, 1.8, { stroke: T.accent, sw: 0.3 });
      });
      for (const [x] of cols.slice(1)) b += line(x, 54, x, 167, { stroke: T.ruleL, sw: 0.2 });
      b += rect(14, 176, 84, 62, { rx: 2.4, fill: T.wash });
      b += label(19, 184, "Goals this week");
      b += ruled(19, 93, 193, 233, 8, { stroke: T.rule });
      b += rect(104, 176, 84, 62, { rx: 2.4, stroke: T.rule, sw: 0.3 });
      b += label(109, 184, "Tempo ladder");
      [60, 80, 100, 120, 140, 160].forEach((bpm, k) => (b += text(146 + k * 7, 191, String(bpm), { size: 1.7, anchor: "middle", fill: T.muted })));
      for (let r = 0; r < 4; r++) {
        const y = 200 + r * 10;
        b += line(109, y + 1, 139, y + 1);
        for (let k = 0; k < 6; k++) b += circle(146 + k * 7, y - 0.5, 1.9, { stroke: T.accent, sw: 0.3 });
      }
      b += label(14, 250, "Notes from my teacher");
      b += ruled(14, 188, 259, 277, 9);
    }
    return { body: b };
  });
  save("music-practice-book", "Music practice book", pages);
}

// ============================================================ 6 Wellness ===
useTheme({
  paper: "#FFFBF6", ink: "#3A3340", inkSoft: "#5A5160", muted: "#9A909C",
  accent: "#E8916B", peach: "#F4A983", lilac: "#B9A6D9", butter: "#F2C96B", mint: "#8FC9AE", rose: "#EFA3A8", sky: "#9FB7D9",
  peachW: "#FDEDE4", lilacW: "#F1ECF8", butterW: "#FDF4DD", mintW: "#E6F4ED", roseW: "#FCEBEC",
  rule: "#E8DFD6", ruleL: "#F0E9E2",
  serif: "Young Serif", sans: "Nunito", hand: "Caveat", labelColor: "#C2734F", labelWeight: 800, labelLs: 0.5,
  navOn: "#E8916B", navOff: "#FDEDE4", navOffText: "#C2734F",
  fonts: gf(["Caveat:wght@500;600", "Nunito:wght@400;600;700;800", "Young+Serif"]),
});
{
  const sun = () => {
    let s = circle(176, 20, 13, { fill: T.peachW });
    s += `<clipPath id="sunclip"><rect x="150" y="0" width="50" height="27"/></clipPath>`;
    s += `<g clip-path="url(#sunclip)">${circle(176, 27, 8, { fill: T.butter })}</g>`;
    for (let k = 0; k < 7; k++) {
      const a = Math.PI + (k * Math.PI) / 6;
      s += line(176 + Math.cos(a) * 10.5, 27 + Math.sin(a) * 10.5, 176 + Math.cos(a) * 13, 27 + Math.sin(a) * 13, { stroke: T.peach, sw: 0.5 });
    }
    s += line(161, 27, 191, 27, { stroke: T.peach, sw: 0.45 });
    s += line(165, 29.6, 187, 29.6, { stroke: T.rose, sw: 0.4 });
    s += line(169, 32, 183, 32, { stroke: T.lilac, sw: 0.4 });
    return s;
  };
  const wave = (y) => {
    let d = `M14 ${y}`;
    for (let x = 14; x < 188; x += 6) d += ` q1.5 -0.9 3 0 t3 0`;
    return pathEl(d, { stroke: T.peach, sw: 0.4 });
  };
  const head = (section, title) => label(14, 16, `Daily journal  ·  ${section}`) + text(14, 30.5, title, { serif: true, size: 10 }) + wave(37) + sun();
  const face = (cx, cy, mood, fill) => {
    const mouth = [-1.1, -0.5, 0, 0.6, 1.2][mood];
    return (
      circle(cx, cy, 3.6, { fill, stroke: T.inkSoft, sw: 0.25 }) +
      circle(cx - 1.2, cy - 0.8, 0.32, { fill: T.inkSoft }) +
      circle(cx + 1.2, cy - 0.8, 0.32, { fill: T.inkSoft }) +
      pathEl(`M${f(cx - 1.4)} ${f(cy + 1.3)} Q${f(cx)} ${f(cy + 1.3 + mouth)} ${f(cx + 1.4)} ${f(cy + 1.3)}`, { stroke: T.inkSoft, sw: 0.3 })
    );
  };
  const drop = (x, y) => pathEl(`M${f(x)} ${f(y - 2.6)} C${f(x + 0.4)} ${f(y - 1.4)} ${f(x + 1.7)} ${f(y - 0.2)} ${f(x + 1.7)} ${f(y + 0.8)} A1.7 1.7 0 0 1 ${f(x - 1.7)} ${f(y + 0.8)} C${f(x - 1.7)} ${f(y - 0.2)} ${f(x - 0.4)} ${f(y - 1.4)} ${f(x)} ${f(y - 2.6)}Z`, { stroke: T.sky, sw: 0.3 });
  const items = [
    { id: "today", label: "Today" },
    { id: "week", label: "Week" },
    { id: "pixels", label: "Year" },
    { id: "pages", label: "Pages" },
  ];
  const pages = linked(items, ({ id }) => {
    let b = "";
    if (id === "today") {
      b += head("Today", "Today");
      b += field(14, 96, 47, "Date");
      ["M", "T", "W", "T", "F", "S", "S"].forEach((d, i) => {
        const x = 114 + i * 11.5;
        b += circle(x, 45.6, 3, { stroke: T.peach, sw: 0.3 });
        b += text(x, 45.7, d, { size: 2.2, weight: 700, anchor: "middle", baseline: "central", fill: T.inkSoft });
      });
      b += label(14, 59.6, "Mood");
      [T.roseW, T.peachW, T.butterW, T.mintW, T.lilacW].forEach((c, i) => (b += face(34 + i * 10, 58.6, i, c)));
      b += label(104, 59.6, "Water");
      for (let i = 0; i < 8; i++) b += drop(124 + i * 8.2, 58.6);
      b += label(14, 73, "Schedule");
      for (let h = 7; h <= 21; h++) {
        const y = 81 + (h - 7) * 8;
        b += text(14, y - 0.8, String(h).padStart(2, "0"), { size: 2.2, weight: 700, fill: T.muted });
        b += line(21, y, 96, y);
      }
      b += label(104, 73, "To do");
      for (let i = 0; i < 10; i++) {
        const y = 81 + i * 8;
        b += circle(106, y - 1.6, 1.6, { stroke: T.lilac, sw: 0.35 });
        b += line(110, y, 188, y);
      }
      b += rect(104, 159, 84, 34, { rx: 4, fill: T.peachW });
      b += label(109, 167, "Grateful for");
      for (let i = 0; i < 3; i++) {
        const y = 175 + i * 7.5;
        b += text(110, y - 0.6, String(i + 1), { hand: true, size: 4, fill: T.accent, anchor: "middle" });
        b += line(114, y, 183, y, { stroke: "#F6CDB8", sw: 0.3 });
      }
      b += label(14, 206, "Notes");
      b += ruled(14, 188, 215, 239, 8);
      b += rect(14, 247, 174, 33, { rx: 4, fill: T.butterW });
      b += label(19, 255, "One good thing", { fill: "#B8892A" });
      b += ruled(19, 183, 264, 274, 9, { stroke: "#F1DFAE", sw: 0.3 });
    } else if (id === "week") {
      b += head("Reflection", "This week");
      b += field(14, 96, 47, "Week of");
      const tones = [T.roseW, T.peachW, T.butterW, T.mintW, T.lilacW, T.roseW, T.peachW];
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d, i) => {
        const x = 14 + i * 24.9;
        b += rect(x, 54, 23, 23, { rx: 4, fill: tones[i] });
        b += text(x + 11.5, 59.6, d.toUpperCase(), { size: 2, weight: 800, ls: 0.4, anchor: "middle", fill: T.inkSoft });
        b += circle(x + 11.5, 69, 3.2, { fill: T.white, stroke: T.rule, sw: 0.25 });
      });
      const boxes = [
        ["Highlights", T.mintW, "#C8E6D7", "#4E9C7A"],
        ["Challenges", T.roseW, "#F5CDD0", "#C46A72"],
        ["Lessons", T.lilacW, "#DDD3EE", "#7D67A8"],
        ["Next week I will", T.butterW, "#F1DFAE", "#B8892A"],
      ];
      boxes.forEach(([t, fill, rl, lc], i) => {
        const x = i % 2 ? 103 : 14;
        const y = 85 + Math.floor(i / 2) * 97;
        b += rect(x, y, 85, 91, { rx: 4, fill });
        b += label(x + 5, y + 8, t, { fill: lc });
        b += ruled(x + 5, x + 80, y + 17, y + 85, 8.5, { stroke: rl, sw: 0.3 });
      });
    } else if (id === "pixels") {
      b += head("Year", "Year in pixels");
      b += field(14, 80, 47, "Year");
      const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
      const cw = 10.4;
      const ch = 7.05;
      months.forEach((m, i) => (b += text(26 + i * cw + cw / 2, 58, m, { size: 2.4, weight: 800, anchor: "middle", fill: T.inkSoft })));
      for (let d = 0; d < 31; d++) {
        const y = 60 + d * ch;
        b += text(23, y + ch / 2 + 0.8, String(d + 1), { size: 1.9, weight: 700, anchor: "end", fill: T.muted });
        for (let m = 0; m < 12; m++) b += rect(26 + m * cw + 0.8, y + 0.7, cw - 1.6, ch - 1.4, { rx: 1.4, fill: T.white, stroke: T.rule, sw: 0.22 });
      }
      b += label(160, 62, "Key");
      [T.rose, T.peach, T.butter, T.mint, T.lilac, T.sky].forEach((c, k) => {
        const y = 72 + k * 13;
        b += circle(163, y, 2.6, { fill: c });
        b += line(168, y + 1.8, 188, y + 1.8);
      });
      b += text(160, 160, "one colour", { hand: true, size: 4.6, fill: T.accent });
      b += text(160, 166, "for each day", { hand: true, size: 4.6, fill: T.accent });
    } else {
      b += head("Pages", "Journal page");
      b += field(14, 96, 47, "Date");
      b += rect(14, 53, 174, 17, { rx: 4, fill: T.lilacW });
      b += label(19, 60, "Today's prompt", { fill: "#7D67A8" });
      b += line(19, 66, 183, 66, { stroke: "#DDD3EE", sw: 0.3 });
      b += ruled(14, 188, 80, 280, 8);
    }
    return { body: b };
  });
  save("sunrise-daily-journal", "Sunrise daily journal", pages);
}

// ================================================================= 7 Work ===
useTheme({
  paper: "#FFFFFF", ink: "#111111", inkSoft: "#3A3A3A", muted: "#8A8A8A",
  accent: "#2F5BFF", wash: "#F2F5FF", light: "#EFEFEF", rule: "#D6D6D6", ruleL: "#EAEAEA",
  serif: "Inter Tight", sans: "Inter", mono: "JetBrains Mono", labelColor: "#8A8A8A", labelLs: 0.45,
  navOn: "#111111", navOff: "#F1F1F1", navOffText: "#555555",
  fonts: gf(["Inter+Tight:wght@600;700;800", "Inter:wght@400;500;600", "JetBrains+Mono:wght@400;500"]),
});
{
  const head = (section, title, num) =>
    rect(14, 11.6, 3.2, 3.2, { fill: T.accent }) +
    label(19.6, 14.6, section) +
    text(13.6, 30, title, { serif: true, size: 10.5, weight: 700, ls: -0.3 }) +
    text(188, 30, num, { mono: true, size: 10, anchor: "end", fill: "#E2E2E2" }) +
    line(14, 36, 188, 36, { stroke: T.ink, sw: 0.6, cap: "butt" });
  const items = [
    { id: "meeting", label: "Meeting" },
    { id: "project", label: "Project" },
    { id: "board", label: "Board" },
    { id: "notes", label: "Notes" },
  ];
  const pages = linked(items, ({ id }) => {
    let b = "";
    if (id === "meeting") {
      b += head("Meeting notes", "Meeting notes", "01");
      b += field(14, 70, 47, "Date") + field(76, 120, 47, "Time") + field(126, 188, 47, "Room");
      b += label(14, 57, "Attendees");
      for (let i = 0; i < 8; i++) b += rect(14 + i * 21.9, 60, 20, 7, { rx: 3.5, stroke: T.rule, sw: 0.25 });
      b += label(14, 78, "Agenda");
      b += label(188, 78, "Min", { anchor: "end" });
      for (let i = 0; i < 4; i++) {
        const y = 87 + i * 8;
        b += text(14, y - 0.7, String(i + 1).padStart(2, "0"), { mono: true, size: 2.3, fill: T.accent });
        b += line(22, y, 170, y) + line(176, y, 188, y);
      }
      b += label(14, 125, "Notes");
      b += ruled(14, 188, 133, 221, 8, { stroke: T.ruleL });
      b += label(14, 232, "Action items");
      b += rect(14, 235, 174, 7, { fill: T.light });
      [[16.4, "Task"], [122.4, "Owner"], [154.4, "Due"], [178.4, "Done"]].forEach(([x, h]) => (b += label(x, 239.6, h, { size: 1.8, fill: T.inkSoft })));
      for (let r = 1; r <= 4; r++) {
        const y = 242 + r * 9;
        b += line(14, y, 188, y, { stroke: T.ruleL, sw: 0.25 });
        b += checkbox(180.4, y - 2.6, 3.2, T.accent);
      }
      for (const x of [120, 152, 176]) b += line(x, 235, x, 278, { stroke: T.ruleL, sw: 0.2 });
    } else if (id === "project") {
      b += head("Project plan", "Project plan", "02");
      b += field(14, 120, 47, "Project") + field(126, 188, 47, "Owner");
      b += label(14, 58, "Timeline");
      const cw = 10.5;
      for (let w = 0; w < 12; w++) b += text(62 + w * cw + cw / 2, 63.4, `W${w + 1}`, { mono: true, size: 1.9, anchor: "middle", fill: T.muted });
      for (let r = 0; r < 12; r++) {
        const y = 66 + r * 9;
        if (r % 2 === 0) b += rect(14, y, 174, 9, { fill: "#FAFAFA" });
        b += line(14, y + 9, 58, y + 9, { stroke: T.rule, sw: 0.25 });
      }
      for (let w = 0; w <= 12; w++) b += line(62 + w * cw, 66, 62 + w * cw, 174, { stroke: T.ruleL, sw: 0.2 });
      b += rect(178.6, 178.6, 2.8, 2.8, { fill: T.accent, transform: "rotate(45 180 180)" });
      b += text(176, 181, "milestone", { size: 2, anchor: "end", fill: T.muted });
      for (const [x, t] of [[14, "Risks"], [104, "Decisions"]]) {
        b += rect(x, 188, 84, 90, { rx: 2, stroke: T.rule, sw: 0.3 });
        b += label(x + 5, 196, t);
        b += ruled(x + 5, x + 79, 205, 271, 8.2, { stroke: T.ruleL });
      }
    } else if (id === "board") {
      b += head("Task board", "Board", "03");
      const cols = [
        ["To do", T.light, T.inkSoft],
        ["Doing", T.accent, "#FFFFFF"],
        ["Done", T.ink, "#FFFFFF"],
      ];
      cols.forEach(([t, fill, tc], c) => {
        const x = 14 + c * 59;
        b += rect(x, 45, 56, 7.4, { rx: 3.7, fill });
        b += text(x + 4, 49.8, t.toUpperCase(), { size: 2.1, weight: 600, ls: 0.45, fill: tc });
        for (let k = 0; k < 6; k++) {
          const y = 57 + k * 37;
          b += rect(x, y, 56, 33, { rx: 2.4, stroke: T.rule, sw: 0.3 });
          b += line(x + 4, y + 8, x + 44, y + 8, { stroke: T.ruleL, sw: 0.3 });
          b += line(x + 4, y + 15, x + 52, y + 15, { stroke: T.ruleL, sw: 0.25 });
          b += rect(x + 4, y + 24, 14, 5, { rx: 2.5, stroke: T.rule, sw: 0.22 });
          b += circle(x + 49, y + 26.5, 2.7, { stroke: T.rule, sw: 0.25 });
        }
      });
    } else {
      b += head("Notes", "Notes", "04");
      b += field(14, 120, 47, "Subject") + field(126, 188, 47, "Date");
      b += dots(14, 56, 188, 278, 5, { r: 0.24, fill: "#CFCFCF" });
    }
    return { body: b };
  });
  save("mono-work-kit", "Mono work kit", pages);
}
console.log("ok");
