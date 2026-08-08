// The nine finishes — how a face catches light — and the corner treatment.
//
// EVERY TEXTURE IS COMPUTED, NEVER A PICTURE (root CODE.md, Compute Don't
// Generate). Gradients and SVG feTurbulence only. A bitmap would lock each
// finish to one colour, and the package ships seven palettes times six faces
// so pictures would mean either dozens of files per finish or a texture that
// ignores the palette. Computed recipes also keep the whole package in
// kilobytes, which matters for a thing whose job is to appear INSTANTLY.
//
// EVERY SHADOW LENGTH IS A LENGTH (owner-approved fix 2026-08-08). `box-shadow`
// accepts NO percentage anywhere — not offset, not blur, not spread — and CSS
// drops the WHOLE declaration when one component is invalid, silently. Every
// one of these nine recipes used percentages for its vignette, so every one of
// them lost its gold rim and its shading too: `enamel`'s cloisonne rim, the
// `frame` finish's entire frame, `aquarel`'s gold rule. Nothing rendered and
// nothing complained. That is why each recipe now takes the cube's `size` and
// computes real pixels, and why tests/test_shadow_lengths.py refuses to let a
// percentage back in.
//
// See src/__about/textures.md.
"use strict";

import { SPEC } from "./spec.js";

// ══════════ NOISE SOURCES — computed, never a bitmap ══════════
// The `#` in url(#filterId) must reach encodeURIComponent LITERAL so it comes
// out as %23 exactly once. Writing %23 here yields %2523 and the filter
// reference dies silently — the tile then renders flat black, which looks
// like a colour bug and is not one.
const svgURI = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const turbulence = (size, frequency, octaves, seed) => svgURI(
  `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
  `<filter id='f'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' ` +
  `numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch'/>` +
  `<feColorMatrix type='saturate' values='0'/></filter>` +
  `<rect width='${size}' height='${size}' filter='url(#f)'/></svg>`
);

// Anisotropy is the whole difference between leather and brushed metal: a
// frequency like `0.012 0.34` streaks, and near-isotropic low frequency
// mottles. GRAIN is fabric/paper; MOTTLE is plaster; WASH is watercolour
// blooms; CRACKLE is the fine web in worn leather.
const GRAIN   = turbulence(140, "0.85", 4, 3);
const MOTTLE  = turbulence(260, "0.021 0.026", 6, 11);
const WASH    = turbulence(340, "0.007 0.009", 7, 23);
const CRACKLE = turbulence(180, "0.55 0.62", 3, 41);

const DAMASK_TILE = svgURI(
  "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>" +
  "<g fill='none' stroke='white' stroke-width='1.6' stroke-opacity='0.5'>" +
  "<path d='M32 8c6 6 6 12 0 18-6-6-6-12 0-18zM32 56c-6-6-6-12 0-18 6 6 6 12 0 18z'/>" +
  "<path d='M8 32c6-6 12-6 18 0-6 6-12 6-18 0zM56 32c-6 6-12 6-18 0 6-6 12-6 18 0z'/>" +
  "<circle cx='32' cy='32' r='4.5'/><circle cx='0' cy='0' r='3'/><circle cx='64' cy='0' r='3'/>" +
  "<circle cx='0' cy='64' r='3'/><circle cx='64' cy='64' r='3'/></g></svg>"
);

// ══════════════════ SHADOW LENGTH HELPERS ══════════════════
/**
 * A fraction of the cube's edge, as a real CSS length.
 *
 * Every number a shadow needs is naturally proportional — a rim is "about 1.5%
 * of the edge", a vignette reaches "a third of the way in" — and the tempting
 * way to write that is `1.5%`. box-shadow does not take percentages, so this
 * turns the proportion into pixels instead. Rounded to two decimals: a face is
 * a few hundred pixels at most, and sub-hundredth precision is noise in the
 * inline style string.
 */
const px = (size, fraction) => `${(size * fraction).toFixed(2)}px`;

/** Inner vignette: dark pulled up from the bottom edge, the standard closer. */
const vignette = (size, blur, spread, alpha) =>
  `inset 0 ${px(size, -0.14)} ${px(size, blur)} ${px(size, -spread)} rgba(0,0,0,${alpha})`;

/** Even inner darkening from every edge — what velvet and leather want. */
const inset = (size, blur, spread, alpha) =>
  `inset 0 0 ${px(size, blur)} ${px(size, spread)} rgba(0,0,0,${alpha})`;

// ═════════════════════ THE NINE FINISHES ═════════════════════
/**
 * Each finish takes one face's colours and the cube's edge in pixels, and
 * returns the inline style for that face.
 *
 * Key order matters: `background` is a shorthand and resets background-size,
 * so it is always written before backgroundSize / backgroundBlendMode.
 */
export const FINISHES = {
  matte: (c, size) => ({
    background:
      `radial-gradient(120% 120% at 32% 24%, ${c.lit}55, transparent 58%),` +
      `linear-gradient(150deg, ${c.base}, ${c.deep})`,
    boxShadow: `inset 0 0 0 1px rgba(255,255,255,.10), ${vignette(size, 0.34, 0.14, 0.55)}`
  }),

  velvet: (c, size) => ({
    background:
      `${GRAIN},radial-gradient(90% 90% at 50% 42%, ${c.lit}4D, transparent 66%),` +
      `linear-gradient(160deg, ${c.base}, ${c.deep})`,
    backgroundSize: "140px 140px, cover, cover",
    backgroundBlendMode: "overlay, normal, normal",
    boxShadow: `${inset(size, 0.34, 0.08, 0.5)}, inset 0 0 0 1px rgba(255,255,255,.07)`
  }),

  leather: (c, size) => ({
    background:
      `${MOTTLE},${GRAIN},radial-gradient(75% 75% at 46% 40%, ${c.lit}80, transparent 70%),` +
      `linear-gradient(155deg, ${c.base}, ${c.deep})`,
    backgroundSize: "260px 260px, 140px 140px, cover, cover",
    backgroundBlendMode: "soft-light, overlay, normal, normal",
    boxShadow: `${inset(size, 0.40, 0.12, 0.62)}, inset 0 0 0 1px rgba(255,255,255,.06)`
  }),

  // The owner's blue leather photograph: a fine crackle web everywhere, the
  // bloom pushed off centre, and a heavy vignette biting the edges.
  leatherdeep: (c, size) => ({
    background:
      `${CRACKLE},${MOTTLE},radial-gradient(58% 52% at 54% 46%, ${c.lit}9E, transparent 72%),` +
      `linear-gradient(158deg, ${c.base}, ${c.deep})`,
    backgroundSize: "180px 180px, 260px 260px, cover, cover",
    backgroundBlendMode: "overlay, soft-light, normal, normal",
    boxShadow: `${inset(size, 0.46, 0.16, 0.78)}, inset 0 0 0 1px rgba(255,255,255,.05)`
  }),

  // The owner's green-and-gold photograph: watercolour clouds at two scales,
  // paper grain, and a thin gold rule set well in from the edge.
  aquarel: (c, size) => ({
    background:
      `${GRAIN},${WASH},${MOTTLE},` +
      `radial-gradient(88% 82% at 44% 38%, ${c.lit}4A, transparent 74%),` +
      `linear-gradient(162deg, ${c.base}, ${c.deep})`,
    backgroundSize: "140px 140px, 340px 340px, 260px 260px, cover, cover",
    backgroundBlendMode: "overlay, soft-light, soft-light, normal, normal",
    boxShadow:
      `inset 0 0 0 ${px(size, 0.044)} rgba(0,0,0,0),` +
      `inset 0 0 0 ${px(size, 0.053)} rgba(201,162,39,.92),` +
      `inset 0 0 0 ${px(size, 0.063)} rgba(0,0,0,.30),` +
      vignette(size, 0.34, 0.10, 0.55)
  }),

  damask: (c, size) => ({
    background:
      `${DAMASK_TILE},radial-gradient(95% 95% at 50% 40%, ${c.lit}3D, transparent 68%),` +
      `linear-gradient(160deg, ${c.base}, ${c.deep})`,
    backgroundSize: "32px 32px, cover, cover",
    backgroundBlendMode: "soft-light, normal, normal",
    boxShadow:
      `inset 0 0 0 ${px(size, 0.019)} rgba(201,162,39,.55),` +
      `inset 0 0 0 ${px(size, 0.031)} rgba(0,0,0,.35),` +
      inset(size, 0.30, 0.08, 0.45)
  }),

  frame: (c, size) => ({
    background:
      `radial-gradient(100% 100% at 50% 38%, ${c.lit}40, transparent 68%),` +
      `linear-gradient(160deg, ${c.base}, ${c.deep})`,
    boxShadow:
      `inset 0 0 0 ${px(size, 0.038)} rgba(0,0,0,0),` +
      `inset 0 0 0 ${px(size, 0.044)} rgba(201,162,39,.85),` +
      `inset 0 0 0 ${px(size, 0.050)} rgba(0,0,0,.4),` +
      inset(size, 0.26, 0.06, 0.5)
  }),

  enamel: (c, size) => ({
    background:
      "linear-gradient(200deg, rgba(255,255,255,.34) 0%, rgba(255,255,255,.05) 26%, transparent 46%)," +
      `radial-gradient(130% 110% at 28% 18%, ${c.lit}AA, transparent 60%),` +
      `linear-gradient(145deg, ${c.base}, ${c.deep})`,
    boxShadow:
      `inset 0 0 0 ${px(size, 0.016)} rgba(201,162,39,.9),` +
      `inset 0 0 0 ${px(size, 0.025)} rgba(0,0,0,.45),` +
      vignette(size, 0.30, 0.12, 0.5)
  }),

  obsidian: (c, size) => ({
    background:
      `radial-gradient(85% 85% at 50% 46%, ${c.lit}2E, transparent 70%),` +
      "linear-gradient(150deg, #12141C, #05060A)",
    boxShadow:
      `inset 0 0 0 ${px(size, 0.010)} rgba(201,162,39,.5),` +
      `inset 0 0 ${px(size, 0.22)} ${px(size, 0.04)} ${c.lit}1F`
  })
};

// ══════════════════ THE CORNER TREATMENT ══════════════════
/**
 * The rounded corners of six faces meeting at 90 degrees leave a triangular
 * NOTCH at each of the eight vertices, and the page shows through it. The
 * chosen `corners` variant (SPEC.corners) decides how that is answered; this
 * function answers only the first half of it, the radius.
 *
 * The variant CAPS the finish's own rounding rather than replacing it, so
 * `bevel` keeps the difference between a framed face (6%) and a jewelled one
 * (11%) while `soft` levels every finish to the same fine edge.
 */
export function cornerRadius(finish, corners) {
  const meta = SPEC.finishes[finish] || SPEC.finishes[SPEC.defaults.finish];
  const variant = SPEC.corners.variants[corners]
               || SPEC.corners.variants[SPEC.corners.default];
  return `${Math.min(meta.radiusPercent, variant.maxRadiusPercent)}%`;
}

/**
 * The gold seam of `corners: "seam"` — a metal edging that owns the rim so
 * there is no rounding left to leak. Returned as a full box-shadow string
 * because it REPLACES the finish's own rim rather than stacking on it.
 */
export const seamShadow = size =>
  `inset 0 0 0 ${px(size, 0.014)} rgba(242,220,155,.95),` +
  `inset 0 0 0 ${px(size, 0.026)} rgba(138,112,32,.92),` +
  `inset 0 0 0 ${px(size, 0.034)} rgba(0,0,0,.55),` +
  vignette(size, 0.30, 0.12, 0.5);

/**
 * The bevel facet seen through a notch — the inner core's material.
 *
 * It must NOT be a hole-coloured black: the whole point of the core is that
 * what shows at a vertex is a FACET of the same object, and a facet has a
 * material. It is derived from the face's OWN colours, so obsidian does not get
 * a silver chamfer and porcelain does not get a black one. Fully opaque on
 * purpose — a translucent stop here would let the notch see straight through to
 * the core's far side, which is the very hole this exists to close.
 */
export const coreFill = c => `linear-gradient(150deg, ${c.deep}, ${c.base})`;
