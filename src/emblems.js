// The emblem glyphs — one small mark per face, drawn on a 24x24 grid.
//
// WHY MONOLINE AND NOT FIGURES. A cube 110px across shows each face at about
// 55px, and in a turn that face is foreshortened on top of it. A drawn figure
// becomes a smudge at that size; a single-weight line stays legible from 24px
// to 300px, and being a path it inherits any palette colour for free.
//
// THE FAMILIES. `elements` is the default (owner 2026-08-07): the moon sits
// on amethyst and water on sapphire. That is not a break with the DOMY canon
// where the Moon IS Monday's blue — it is the same idea one layer down, the
// owner's own reading: blue is water and the moon is what pulls it, purple is
// the night the moon hangs in. `elementsDomy` keeps the dial's strict letter
// for anyone who wants it. `planets` and `virtues` are copied from
// Gadgets/DOMY Watch/SYMBOLISM.md, never invented here — if that canon
// changes, this file follows it, not the other way round.
//
// See src/__about/emblems.md.
"use strict";

import { SPEC } from "./spec.js";

// ══════════════════════ THE GLYPH TABLE ══════════════════════
/** name -> SVG inner markup on a 24x24 viewBox, stroked not filled. */
export const GLYPHS = {
  // elements
  sun: `<circle cx="12" cy="12" r="4.4"/><path d="M12 1.6v3M12 19.4v3M1.6 12h3M19.4 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1"/>`,
  moon: `<path d="M16.6 3.2a9.2 9.2 0 1 0 0 17.6 10.6 10.6 0 0 1 0-17.6z"/>`,
  wave: `<path d="M2.4 8.4c2-2.2 3.8-2.2 5.8 0s3.8 2.2 5.8 0 3.8-2.2 5.8 0M2.4 14c2-2.2 3.8-2.2 5.8 0s3.8 2.2 5.8 0 3.8-2.2 5.8 0M2.4 19.6c2-2.2 3.8-2.2 5.8 0"/>`,
  flame: `<path d="M12 2.2c3.4 4.4 5.6 6.8 5.6 9.9a5.6 5.6 0 0 1-11.2 0c0-2 1-3.4 2.2-4.6.2 2 .9 3 1.8 3 1.1 0 1.6-3.6 1.6-8.3z"/>`,
  leaf: `<path d="M3.4 20.6C3.4 11.2 10.6 4 20.4 3.4c.6 9.8-6.6 17-16 17z"/><path d="M3.4 20.6C7 14 11.6 9.4 18 6.2"/>`,
  bolt: `<path d="M13.6 1.8 5.4 13.4h5.2L9.4 22.2l8.4-11.8h-5.4z"/>`,
  star: `<path d="m12 2.4 2.9 6.4 7 .7-5.2 4.7 1.5 6.8-6.2-3.5-6.2 3.5 1.5-6.8L2.1 9.5l7-.7z"/>`,

  // planets, DOMY canon
  jupiter: `<path d="M5.2 8.1c.2-3.1 4.8-3.6 4.8.4v7.9a4.3 4.3 0 0 0 8.6 0"/><path d="M3.6 18h12.2"/>`,
  saturn: `<path d="M7 3.2v12.4a4.1 4.1 0 0 0 8.2 0"/><path d="M3.4 7.6h7.2"/>`,
  mars: `<circle cx="10" cy="14" r="5.4"/><path d="M14.2 9.8 21 3M15.4 3H21v5.6"/>`,
  venus: `<circle cx="12" cy="8.4" r="5"/><path d="M12 13.4v8M8.6 18h6.8"/>`,
  mercury: `<circle cx="12" cy="11.2" r="4.2"/><path d="M12 15.4v6M9 19h6M7.6 2.2a4.4 4.4 0 0 0 8.8 0"/>`,
  luna: `<path d="M16.6 3.2a9.2 9.2 0 1 0 0 17.6 10.6 10.6 0 0 1 0-17.6z"/>`,

  // virtues, DOMY canon
  give: `<path d="M4 12.6c0 4.4 3.6 8 8 8s8-3.6 8-8z"/><path d="M12 8.6v-6M8 9.4 5.4 5.6M16 9.4l2.6-3.8"/>`,
  heart: `<path d="M12 21s-8.2-5.3-8.2-10.6A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.2 3.4C20.2 15.7 12 21 12 21z"/>`,
  eye: `<path d="M1.6 12S5.6 5.2 12 5.2 22.4 12 22.4 12 18.4 18.8 12 18.8 1.6 12 1.6 12z"/><circle cx="12" cy="12" r="2.9"/>`,
  stillwater: `<path d="M15.8 2.8a8.2 8.2 0 1 0 0 15 9.6 9.6 0 0 1 0-15z"/><path d="M2.6 21h18.8"/>`,
  hourglass: `<path d="M6 3h12M6 21h12M7.4 3c0 4 4.6 6 4.6 9s-4.6 5-4.6 9M16.6 3c0 4-4.6 6-4.6 9s4.6 5 4.6 9"/>`,

  // heraldic
  crown: `<path d="M2.8 18.6h18.4l-1.8-11-4.8 4.6L12 4.4 9.4 12.2 4.6 7.6z"/><path d="M4.4 21.4h15.2"/>`,
  anchor: `<circle cx="12" cy="4.2" r="2.4"/><path d="M12 6.6v14.8M6.6 9.4h10.8M3.4 14.4c0 4 3.9 7 8.6 7s8.6-3 8.6-7"/>`,
  key: `<circle cx="7.4" cy="8" r="4.6"/><path d="M10.7 11.3 21 21.6M17.2 17.8l-2.4 2.4M14.2 14.8l-2.4 2.4"/>`,
  laurel: `<path d="M12 21.6V8.4"/><path d="M12 18.6c-4 0-6.6-2.4-6.6-6 3.6 0 6.6 2.2 6.6 6zM12 12.6c-3.4 0-5.6-2-5.6-5 3 0 5.6 1.8 5.6 5zM12 18.6c4 0 6.6-2.4 6.6-6-3.6 0-6.6 2.2-6.6 6zM12 12.6c3.4 0 5.6-2 5.6-5-3 0-5.6 1.8-5.6 5z"/>`,
  shield: `<path d="M12 2.2 20.8 5v7c0 5-4.2 8.2-8.8 9.8C7.4 20.2 3.2 17 3.2 12V5z"/><path d="M12 7.6v8"/>`,

  // ordinal geometry — the mark says WHICH step of the cycle you are on, so it
  // only carries meaning in `continuous` mode
  one: `<circle cx="12" cy="12" r="3.2" fill="currentColor"/>`,
  two: `<path d="M4.4 9h15.2M4.4 15h15.2"/>`,
  three: `<path d="M12 3.6 20.8 19H3.2z"/>`,
  four: `<path d="M4.6 4.6h14.8v14.8H4.6z"/>`,
  five: `<path d="m12 3 8.6 6.2-3.3 10.1H6.7L3.4 9.2z"/>`,
  six: `<path d="m12 2.8 8 4.6v9.2l-8 4.6-8-4.6V7.4z"/>`
};

// ═══════════════════════════ LOOKUP ═══════════════════════════
/** The glyph name a face wears in a given family, or null for `none`. */
export function glyphFor(family, face) {
  if (!family || family === "none") return null;
  const fam = SPEC.emblems.families[family];
  return fam ? fam[face] || null : null;
}

/** A ready `<svg>` element for one face, or null when the family is `none`. */
export function emblemElement(family, face, color) {
  const name = glyphFor(family, face);
  if (!name || !GLYPHS[name]) return null;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", "tmb-emblem");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", color);
  svg.setAttribute("stroke-width", "1.7");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  // the one solid mark (ordinal `one`) paints with currentColor
  svg.style.color = color;
  svg.innerHTML = GLYPHS[name];
  return svg;
}
