// The six rings — one composition per face, shown for whichever face is on top.
//
// NOT ICONS ON A CIRCLE (owner 2026-08-07, rejecting exactly that): a laurel
// WREATH with two branches meeting at the tie, water that undulates, fire in
// tongues, an electric arc chasing itself, the sun's corona, and the moon's
// twelve phases. Each is drawn from geometry, so it takes any palette colour
// and any size for free.
//
// HOW MOTION IS BUILT, AND WHY. A ring is a stack of LAYER DIVS, each holding
// one SVG, each carrying its own CSS animation. Two reasons:
//   1. Compositor. A CSS transform on a plain div is handed to the GPU, so
//      the ring keeps turning while the main thread is busy — which is the
//      whole point of a loading animation (owner: "radi u pozadini dok se
//      druge stvari odrađuju"). Nothing here runs per frame in JS.
//   2. transform-origin. An HTML element rotates about its own centre. An SVG
//      <g> needs `transform-box`, and getting that wrong makes the ring ORBIT
//      the page instead of spinning in place — seen live on 2026-08-07.
// Inside an SVG only OPACITY is animated (flicker, twinkle), which has no
// origin to get wrong.
//
// See src/__about/rings.md and src/__flow/rings.md.
"use strict";

const NS = "http://www.w3.org/2000/svg";

/** Ring geometry lives on a -100..100 grid; the wrapper decides the pixels. */
const R = 78;

function el(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function layer(className) {
  const div = document.createElement("div");
  div.className = "tmb-ring-layer" + (className ? " " + className : "");
  const svg = el("svg", {viewBox: "-100 -100 200 200"});
  div.appendChild(svg);
  return {div, svg};
}

/** Polar helper: SVG angles run clockwise from 12 o'clock. */
const at = (deg, radius) => [
  radius * Math.sin((deg * Math.PI) / 180),
  -radius * Math.cos((deg * Math.PI) / 180)
];

// ── laurel wreath ────────────────────────────────────────────────────────
// Two branches leave a tie at the bottom and climb both sides, leaves
// shrinking toward the opening at the top. The classic wreath, not a circle
// of leaf stamps.
const LEAF = "M0 0C4.6-2.4 8.2-7.6 7.4-14.6 2.8-12.2-.8-7 0 0Z";

function laurel(color) {
  const {div, svg} = layer("tmb-breathe");
  const branch = el("g", {fill: color, "fill-opacity": "0.30", stroke: color,
                          "stroke-width": "1.2", "stroke-linejoin": "round"});
  const N = 11;
  // sweep-flag 0, not 1: from the tie at 172 degrees the branch must climb the
  // RIGHT side (6 -> 3 -> 12 o'clock), which is counter-clockwise on screen.
  // With sweep 1 it went round the left instead, and the mirrored branch then
  // crossed it into a pointed almond rather than a wreath.
  const stem = el("path", {
    fill: "none", stroke: color, "stroke-width": "2.4", "stroke-linecap": "round",
    "stroke-opacity": "0.75",
    d: `M${at(172, R)[0].toFixed(2)} ${at(172, R)[1].toFixed(2)} ` +
       `A ${R} ${R} 0 0 0 ${at(16, R)[0].toFixed(2)} ${at(16, R)[1].toFixed(2)}`
  });
  branch.appendChild(stem);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const angle = 168 - t * 150;          // bottom of the arc up to the opening
    const scale = 1.18 - 0.42 * t;        // leaves taper toward the top
    branch.appendChild(el("path", {
      d: LEAF,
      transform: `rotate(${angle}) translate(0 ${-R}) rotate(${-24}) scale(${scale.toFixed(3)})`
    }));
    if (i < N - 1) {                       // a second, inner rank fills the gaps
      branch.appendChild(el("path", {
        d: LEAF,
        transform: `rotate(${angle - 7}) translate(0 ${-R + 7}) rotate(${28}) ` +
                   `scale(${(scale * 0.78).toFixed(3)}) scale(-1 1)`
      }));
    }
  }
  svg.appendChild(branch);
  const mirrored = branch.cloneNode(true);
  mirrored.setAttribute("transform", "scale(-1 1)");
  svg.appendChild(mirrored);
  // the tie
  svg.appendChild(el("path", {
    fill: "none", stroke: color, "stroke-width": "2.6", "stroke-linecap": "round",
    "stroke-opacity": "0.85",
    d: `M-9 ${R - 2} q9 7 18 0 M-6 ${R + 5} q6 5 12 0`
  }));
  return [div];
}

// ── water ────────────────────────────────────────────────────────────────
// Three sine-modulated bands at different wavelengths turning at different
// speeds, two of them against the third — the eye reads that as flow rather
// than as three spinning rings.
function wavePath(radius, amplitude, lobes, phase) {
  const pts = [];
  for (let i = 0; i <= 240; i++) {
    const a = (i / 240) * 360;
    const r = radius + amplitude * Math.sin(((lobes * a + phase) * Math.PI) / 180);
    const [x, y] = at(a, r);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return "M" + pts.join("L") + "Z";
}

function water(color) {
  const bands = [
    {cls: "tmb-spin-slow", r: R,      amp: 4.5, lobes: 9,  phase: 0,   w: 3.2, o: 0.85},
    {cls: "tmb-spin-rev",  r: R - 7,  amp: 3.0, lobes: 13, phase: 40,  w: 2.0, o: 0.55},
    {cls: "tmb-spin-med",  r: R + 7,  amp: 5.5, lobes: 7,  phase: 110, w: 1.6, o: 0.40}
  ];
  const layers = bands.map(b => {
    const {div, svg} = layer(b.cls);
    svg.appendChild(el("path", {
      d: wavePath(b.r, b.amp, b.lobes, b.phase),
      fill: "none", stroke: color, "stroke-width": b.w, "stroke-opacity": b.o,
      "stroke-linecap": "round"
    }));
    return div;
  });
  // droplets thrown off the crest
  const {div, svg} = layer("tmb-spin-med");
  for (let i = 0; i < 7; i++) {
    const a = i * (360 / 7) + 12;
    const [x, y] = at(a, R + 13);
    const drop = el("circle", {cx: x.toFixed(2), cy: y.toFixed(2), r: 2.1,
                               fill: color, "fill-opacity": "0.6"});
    drop.setAttribute("class", "tmb-twinkle");
    drop.style.animationDelay = `${(i * 0.37).toFixed(2)}s`;
    svg.appendChild(drop);
  }
  layers.push(div);
  return layers;
}

// ── fire ─────────────────────────────────────────────────────────────────
const TONGUE = "M0 0C-6.2-3.4-7.4-9-4-14.4-3.6-19.6-1.6-24.2.6-29.4 " +
               "1.2-23 3.4-19.4 4.6-14.4 7.2-9 6-3.4 0 0Z";

function fire(color) {
  // Three things separate flame from petals, and the first two drafts had
  // none of them: the tongue is TALL and narrow (about 1:3, not 1:2), its
  // sides curve INWARD before flicking out at the tip, and the ranks are
  // dense enough to OVERLAP into a continuous wall instead of standing apart
  // like a wreath. Heights vary hard — a fire with uniform tongues is a
  // decoration. Underneath sits a bright core so the tongues burn from
  // something.
  const ranks = [
    {cls: "tmb-spin-med",  n: 30, r: R - 2, scale: 1.0,  o: 0.95, spread: 0.75},
    {cls: "tmb-spin-rev",  n: 22, r: R - 8, scale: 0.62, o: 0.8,  spread: 0.5},
    {cls: "tmb-spin-slow", n: 36, r: R + 3, scale: 0.46, o: 0.45, spread: 0.9}
  ];
  const glow = layer("tmb-breathe");
  glow.svg.appendChild(el("circle", {
    cx: 0, cy: 0, r: R - 6, fill: "none", stroke: color,
    "stroke-width": "13", "stroke-opacity": "0.12"
  }));
  const core = layer("tmb-breathe");
  core.svg.appendChild(el("circle", {
    cx: 0, cy: 0, r: R - 9, fill: "none", stroke: color,
    "stroke-width": "3.5", "stroke-opacity": "0.55"
  }));
  const layers = [glow.div, core.div];
  for (const rank of ranks) {
    const {div, svg} = layer(rank.cls);
    const g = el("g", {fill: color, "fill-opacity": String(rank.o)});
    for (let i = 0; i < rank.n; i++) {
      const a = i * (360 / rank.n);
      // stable pseudo-random, so the ring is the same every load
      const jitter = 1 - rank.spread / 2 + rank.spread * ((i * 7919) % 23) / 23;
      const flip = i % 2 ? " scale(-1 1)" : "";
      const tongue = el("path", {
        d: TONGUE,
        transform: `rotate(${a}) translate(0 ${-rank.r}) ` +
                   `scale(${(rank.scale * jitter).toFixed(3)})${flip}`
      });
      tongue.setAttribute("class", "tmb-flicker");
      tongue.style.animationDelay = `${((i % 7) * 0.13 + (i % 3) * 0.05).toFixed(2)}s`;
      g.appendChild(tongue);
    }
    svg.appendChild(g);
    layers.push(div);
  }
  return layers;
}

// ── electric arc ─────────────────────────────────────────────────────────
// "Struja koja se vrti oko sebe": a jagged closed loop whose radius stutters,
// a second one running the other way, and a bright spark travelling the loop
// as an animated dash offset.
function joltPath(radius, teeth, depth, seed) {
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * 360;
    // deterministic stutter — the same ring every time, no Math.random
    const wobble = ((i * seed) % 17) / 17 - 0.5;
    const r = radius + (i % 2 ? depth : -depth) * (0.55 + wobble);
    const [x, y] = at(a, r);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return "M" + pts.join("L") + "Z";
}

function electric(color) {
  const layers = [];
  const glow = layer("tmb-spin-slow");
  glow.svg.appendChild(el("path", {
    d: joltPath(R, 44, 6, 7), fill: "none", stroke: color,
    "stroke-width": "7", "stroke-opacity": "0.13", "stroke-linejoin": "round"
  }));
  layers.push(glow.div);

  const main = layer("tmb-spin-med");
  main.svg.appendChild(el("path", {
    d: joltPath(R, 44, 6, 7), fill: "none", stroke: color,
    "stroke-width": "1.8", "stroke-opacity": "0.9", "stroke-linejoin": "round"
  }));
  const spark = el("path", {
    d: joltPath(R, 44, 6, 7), fill: "none", stroke: "#FFFFFF",
    "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round",
    "stroke-dasharray": "26 470"
  });
  spark.setAttribute("class", "tmb-chase");
  main.svg.appendChild(spark);
  layers.push(main.div);

  const counter = layer("tmb-spin-rev");
  counter.svg.appendChild(el("path", {
    d: joltPath(R - 9, 34, 4.5, 11), fill: "none", stroke: color,
    "stroke-width": "1.1", "stroke-opacity": "0.45", "stroke-linejoin": "round"
  }));
  layers.push(counter.div);
  return layers;
}

// ── solar corona ─────────────────────────────────────────────────────────
// Alternating long and short rays, the shape of the owner's own sun.svg,
// turning slowly under a counter-turning inner rank.
function corona(color) {
  const build = (n, inner, outer, width, opacity, cls, offset) => {
    const {div, svg} = layer(cls);
    const g = el("g", {stroke: color, "stroke-opacity": String(opacity),
                       "stroke-width": String(width), "stroke-linecap": "round"});
    for (let i = 0; i < n; i++) {
      const a = i * (360 / n) + offset;
      const long = i % 2 === 0;
      const tip = long ? outer : inner + (outer - inner) * 0.45;
      const [x1, y1] = at(a, inner);
      const [x2, y2] = at(a, tip);
      const ray = el("line", {x1: x1.toFixed(2), y1: y1.toFixed(2),
                              x2: x2.toFixed(2), y2: y2.toFixed(2)});
      if (!long) {
        ray.setAttribute("class", "tmb-twinkle");
        ray.style.animationDelay = `${((i % 9) * 0.21).toFixed(2)}s`;
      }
      g.appendChild(ray);
    }
    svg.appendChild(g);
    return div;
  };
  const rim = layer("tmb-breathe");
  rim.svg.appendChild(el("circle", {
    cx: 0, cy: 0, r: R - 6, fill: "none", stroke: color,
    "stroke-width": "1.6", "stroke-opacity": "0.45"
  }));
  return [
    rim.div,
    build(48, R - 4, R + 15, 1.7, 0.8, "tmb-spin-slow", 0),
    build(36, R - 2, R + 9, 1.1, 0.45, "tmb-spin-rev", 4)
  ];
}

// ── lunar phases ─────────────────────────────────────────────────────────
// Twelve moons around the circle, one per step of the synodic cycle: the ring
// IS the month. This is the answer to "for the sun and the moon I am not sure
// what to put" — the moon's own shape is the ornament.
function phasePath(r, phase) {
  const k = Math.cos(2 * Math.PI * phase);
  const rx = Math.abs(k) * r;
  const waxing = phase < 0.5;
  const outerSweep = waxing ? 1 : 0;
  const innerSweep = (k > 0) === waxing ? 0 : 1;
  return `M0 ${-r} A ${r} ${r} 0 0 ${outerSweep} 0 ${r} ` +
         `A ${rx.toFixed(2)} ${r} 0 0 ${innerSweep} 0 ${-r} Z`;
}

function phases(color) {
  const {div, svg} = layer("tmb-spin-slow");
  const N = 12, moon = 7.5;
  for (let i = 0; i < N; i++) {
    const a = i * (360 / N);
    const [x, y] = at(a, R);
    const g = el("g", {transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`});
    g.appendChild(el("circle", {cx: 0, cy: 0, r: moon, fill: color,
                                "fill-opacity": "0.14", stroke: color,
                                "stroke-width": "0.8", "stroke-opacity": "0.35"}));
    g.appendChild(el("path", {d: phasePath(moon, i / N), fill: color,
                              "fill-opacity": "0.92"}));
    svg.appendChild(g);
  }
  return [div];
}

const BUILDERS = {laurel, water, fire, electric, corona, phases};

/**
 * The ring for one face. `diameter` is the pixel width of the wrapper, and
 * the caller sizes it from spec.rings.radius so the ring stands well clear of
 * the cube — the owner's sketches never let it hug.
 */
export function buildRing(kind, color, diameter) {
  const wrap = document.createElement("div");
  wrap.className = "tmb-ring";
  wrap.style.width = `${diameter}px`;
  wrap.style.height = `${diameter}px`;
  const build = BUILDERS[kind] || BUILDERS.laurel;
  for (const node of build(color)) wrap.appendChild(node);
  return wrap;
}

export const RING_KINDS = Object.keys(BUILDERS);
