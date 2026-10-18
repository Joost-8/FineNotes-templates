// Drawing helpers for gallery templates: A4 pages as SVG in millimetres, in
// the colours and fonts of the theme set with useTheme().
export const T = {};
export function useTheme(theme) {
  for (const k of Object.keys(T)) delete T[k];
  Object.assign(
    T,
    { white: "#FFFFFF", labelWeight: 600, labelLs: 0.42, labelSize: 2.2, navText: "#FFFFFF" },
    theme,
  );
}

export const f = (n) => Math.round(n * 100) / 100;
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
let uid = 0;

export function text(x, y, s, o = {}) {
  const font = o.font ?? (o.serif ? T.serif : o.mono ? T.mono : o.hand ? T.hand : T.sans);
  const a = [`x="${f(x)}"`, `y="${f(y)}"`, `font-family="${font}"`, `font-size="${o.size ?? 2.4}"`, `fill="${o.fill ?? T.ink}"`];
  if (o.weight) a.push(`font-weight="${o.weight}"`);
  if (o.italic) a.push(`font-style="italic"`);
  if (o.anchor) a.push(`text-anchor="${o.anchor}"`);
  if (o.ls !== undefined) a.push(`letter-spacing="${o.ls}"`);
  if (o.baseline) a.push(`dominant-baseline="${o.baseline}"`);
  if (o.transform) a.push(`transform="${o.transform}"`);
  if (o.opacity) a.push(`opacity="${o.opacity}"`);
  if (o.line) a.push(`data-line="${o.line}"`);
  return `<text ${a.join(" ")}>${esc(s)}</text>`;
}
export const label = (x, y, s, o = {}) =>
  text(x, y, s.toUpperCase(), { size: T.labelSize, weight: T.labelWeight, ls: T.labelLs, fill: T.labelColor, ...o });

export function line(x1, y1, x2, y2, o = {}) {
  const a = [`x1="${f(x1)}"`, `y1="${f(y1)}"`, `x2="${f(x2)}"`, `y2="${f(y2)}"`];
  a.push(`stroke="${o.stroke ?? T.rule}"`, `stroke-width="${o.sw ?? 0.25}"`, `stroke-linecap="${o.cap ?? "round"}"`);
  if (o.dash) a.push(`stroke-dasharray="${o.dash}"`);
  if (o.id) a.push(`id="${o.id}"`);
  if (o.opacity) a.push(`opacity="${o.opacity}"`);
  return `<line ${a.join(" ")}/>`;
}
export function rect(x, y, w, h, o = {}) {
  const a = [`x="${f(x)}"`, `y="${f(y)}"`, `width="${f(w)}"`, `height="${f(h)}"`];
  if (o.rx) a.push(`rx="${o.rx}"`);
  a.push(`fill="${o.fill ?? "none"}"`);
  if (o.stroke) a.push(`stroke="${o.stroke}"`, `stroke-width="${o.sw ?? 0.25}"`);
  if (o.dash) a.push(`stroke-dasharray="${o.dash}"`);
  if (o.opacity) a.push(`opacity="${o.opacity}"`);
  if (o.transform) a.push(`transform="${o.transform}"`);
  return `<rect ${a.join(" ")}/>`;
}
export function circle(cx, cy, r, o = {}) {
  const a = [`cx="${f(cx)}"`, `cy="${f(cy)}"`, `r="${f(r)}"`, `fill="${o.fill ?? "none"}"`];
  if (o.stroke) a.push(`stroke="${o.stroke}"`, `stroke-width="${o.sw ?? 0.25}"`);
  if (o.opacity) a.push(`opacity="${o.opacity}"`);
  return `<circle ${a.join(" ")}/>`;
}
export function ellipse(cx, cy, rx, ry, o = {}) {
  const a = [`cx="${f(cx)}"`, `cy="${f(cy)}"`, `rx="${f(rx)}"`, `ry="${f(ry)}"`, `fill="${o.fill ?? "none"}"`];
  if (o.stroke) a.push(`stroke="${o.stroke}"`, `stroke-width="${o.sw ?? 0.25}"`);
  if (o.transform) a.push(`transform="${o.transform}"`);
  return `<ellipse ${a.join(" ")}/>`;
}
export const pathEl = (d, o = {}) =>
  `<path d="${d}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? "none"}" stroke-width="${o.sw ?? 0.25}" stroke-linecap="round" stroke-linejoin="round"${o.opacity ? ` opacity="${o.opacity}"` : ""}${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.transform ? ` transform="${o.transform}"` : ""}/>`;
export const poly = (pts, o = {}) => pathEl(`M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")}Z`, o);

/** A label on the left of a writing line; the line starts where the label ends (measured in the page). */
export function field(x1, x2, y, name, o = {}) {
  const id = `ln${++uid}`;
  return label(x1, y - 0.6, name, { line: id, ...o }) + line(x1 + 20, y, x2, y, { id, stroke: o.stroke ?? T.rule, sw: o.sw ?? 0.25 });
}
export function ruled(x1, x2, y0, y1, step, o = {}) {
  let s = "";
  for (let y = y0; y <= y1 + 0.01; y += step) s += line(x1, y, x2, y, o);
  return s;
}
export function dots(x0, y0, x1, y1, step, o = {}) {
  let s = "";
  for (let y = y0; y <= y1 + 0.01; y += step) {
    for (let x = x0; x <= x1 + 0.01; x += step) s += circle(x, y, o.r ?? 0.22, { fill: o.fill ?? T.rule });
  }
  return s;
}
export function grid(x0, y0, x1, y1, step, major, o = {}) {
  let s = "";
  let i = 0;
  for (let x = x0; x <= x1 + 0.01; x += step, i++) {
    const m = major && i % major === 0;
    s += line(x, y0, x, y1, { stroke: m ? (o.major ?? T.rule) : (o.minor ?? T.ruleL), sw: m ? 0.2 : 0.12 });
  }
  i = 0;
  for (let y = y0; y <= y1 + 0.01; y += step, i++) {
    const m = major && i % major === 0;
    s += line(x0, y, x1, y, { stroke: m ? (o.major ?? T.rule) : (o.minor ?? T.ruleL), sw: m ? 0.2 : 0.12 });
  }
  return s;
}
export const checkbox = (x, y, s = 3.2, color = T.accent, rx = 0.8) => rect(x, y - s, s, s, { rx, stroke: color, sw: 0.3 });

/** Page-to-page links as a row of pills, centred at the foot of the page. */
export function nav(items, current, y = 285.5) {
  const w = 22;
  const gap = 2.6;
  const x0 = 105 - (items.length * w + (items.length - 1) * gap) / 2;
  let svg = "";
  const links = [];
  items.forEach((it, i) => {
    const x = x0 + i * (w + gap);
    const on = it.id === current;
    svg += rect(x, y, w, 6, { rx: 3, fill: on ? T.navOn : T.navOff });
    svg += text(x + w / 2, y + 3.1, it.label.toUpperCase(), {
      size: 1.9,
      weight: 600,
      ls: 0.35,
      anchor: "middle",
      baseline: "central",
      fill: on ? T.navText : T.navOffText,
    });
    links.push({ to: it.id, label: it.label, x, y, w, h: 6 });
  });
  return { svg, links };
}

export function page(id, body, links = []) {
  const a = links
    .map(
      (l) =>
        `<a class="lnk" href="#${l.to}" aria-label="${esc(l.label)}" style="left:${f(l.x)}mm;top:${f(l.y)}mm;width:${f(l.w)}mm;height:${f(l.h)}mm"></a>`,
    )
    .join("");
  return `<section class="page" id="${id}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm">${rect(0, 0, 210, 297, { fill: T.paper })}${body}</svg>${a}</section>`;
}

export function documentOf(title, pages) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="${T.fonts}">
<style>
@page { size: 210mm 297mm; margin: 0 }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box }
html, body { margin: 0; padding: 0; background: ${T.paper} }
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

/** A hexagon; pointy top unless flat. */
export function hexPath(cx, cy, r, flat = false) {
  const pts = [];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k + (flat ? 0 : Math.PI / 6);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")}Z`;
}
