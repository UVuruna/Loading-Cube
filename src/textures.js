// The nine finishes — how a face catches light.
//
// EVERY TEXTURE IS COMPUTED, NEVER A PICTURE (root CODE.md, Compute Don't
// Generate). Gradients and SVG feTurbulence only. A bitmap would lock each
// finish to one colour, and the package ships three palettes times six faces
// — eighteen combinations of every finish — so pictures would mean either
// eighteen files per finish or a texture that ignores the palette. Computed
// recipes also keep the whole package in kilobytes, which matters for a thing
// whose job is to appear INSTANTLY.
//
// See src/__about/textures.md.
"use strict";

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

// ═════════════════════ THE NINE FINISHES ═════════════════════
/**
 * Each finish takes one face's colours and returns the inline style for it.
 * Key order matters: `background` is a shorthand and resets background-size,
 * so it is always written before backgroundSize / backgroundBlendMode.
 */
export const FINISHES = {
  matte: c => ({
    background:
      `radial-gradient(120% 120% at 32% 24%, ${c.lit}55, transparent 58%),` +
      `linear-gradient(150deg, ${c.base}, ${c.deep})`,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,.10), inset 0 -18% 34% -14% rgba(0,0,0,.55)"
  }),

  velvet: c => ({
    background:
      `${GRAIN},radial-gradient(90% 90% at 50% 42%, ${c.lit}4D, transparent 66%),` +
      `linear-gradient(160deg, ${c.base}, ${c.deep})`,
    backgroundSize: "140px 140px, cover, cover",
    backgroundBlendMode: "overlay, normal, normal",
    boxShadow: "inset 0 0 34% 8% rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.07)"
  }),

  leather: c => ({
    background:
      `${MOTTLE},${GRAIN},radial-gradient(75% 75% at 46% 40%, ${c.lit}80, transparent 70%),` +
      `linear-gradient(155deg, ${c.base}, ${c.deep})`,
    backgroundSize: "260px 260px, 140px 140px, cover, cover",
    backgroundBlendMode: "soft-light, overlay, normal, normal",
    boxShadow: "inset 0 0 40% 12% rgba(0,0,0,.62), inset 0 0 0 1px rgba(255,255,255,.06)"
  }),

  // The owner's blue leather photograph: a fine crackle web everywhere, the
  // bloom pushed off centre, and a heavy vignette biting the edges.
  leatherdeep: c => ({
    background:
      `${CRACKLE},${MOTTLE},radial-gradient(58% 52% at 54% 46%, ${c.lit}9E, transparent 72%),` +
      `linear-gradient(158deg, ${c.base}, ${c.deep})`,
    backgroundSize: "180px 180px, 260px 260px, cover, cover",
    backgroundBlendMode: "overlay, soft-light, normal, normal",
    boxShadow: "inset 0 0 46% 16% rgba(0,0,0,.78), inset 0 0 0 1px rgba(255,255,255,.05)"
  }),

  // The owner's green-and-gold photograph: watercolour clouds at two scales,
  // paper grain, and a thin gold rule set well in from the edge.
  aquarel: c => ({
    background:
      `${GRAIN},${WASH},${MOTTLE},` +
      `radial-gradient(88% 82% at 44% 38%, ${c.lit}4A, transparent 74%),` +
      `linear-gradient(162deg, ${c.base}, ${c.deep})`,
    backgroundSize: "140px 140px, 340px 340px, 260px 260px, cover, cover",
    backgroundBlendMode: "overlay, soft-light, soft-light, normal, normal",
    boxShadow:
      "inset 0 0 0 7px rgba(0,0,0,0), inset 0 0 0 8.5px rgba(201,162,39,.92)," +
      "inset 0 0 0 10px rgba(0,0,0,.30), inset 0 0 34% 10% rgba(0,0,0,.55)"
  }),

  damask: c => ({
    background:
      `${DAMASK_TILE},radial-gradient(95% 95% at 50% 40%, ${c.lit}3D, transparent 68%),` +
      `linear-gradient(160deg, ${c.base}, ${c.deep})`,
    backgroundSize: "32px 32px, cover, cover",
    backgroundBlendMode: "soft-light, normal, normal",
    boxShadow:
      "inset 0 0 0 3px rgba(201,162,39,.55), inset 0 0 0 5px rgba(0,0,0,.35), " +
      "inset 0 0 30% 8% rgba(0,0,0,.45)"
  }),

  frame: c => ({
    background:
      `radial-gradient(100% 100% at 50% 38%, ${c.lit}40, transparent 68%),` +
      `linear-gradient(160deg, ${c.base}, ${c.deep})`,
    boxShadow:
      "inset 0 0 0 6px rgba(0,0,0,0), inset 0 0 0 7px rgba(201,162,39,.85), " +
      "inset 0 0 0 8px rgba(0,0,0,.4), inset 0 0 26% 6% rgba(0,0,0,.5)"
  }),

  enamel: c => ({
    background:
      "linear-gradient(200deg, rgba(255,255,255,.34) 0%, rgba(255,255,255,.05) 26%, transparent 46%)," +
      `radial-gradient(130% 110% at 28% 18%, ${c.lit}AA, transparent 60%),` +
      `linear-gradient(145deg, ${c.base}, ${c.deep})`,
    boxShadow:
      "inset 0 0 0 2.5px rgba(201,162,39,.9), inset 0 0 0 4px rgba(0,0,0,.45), " +
      "inset 0 -22% 30% -12% rgba(0,0,0,.5)"
  }),

  obsidian: c => ({
    background:
      `radial-gradient(85% 85% at 50% 46%, ${c.lit}2E, transparent 70%),` +
      "linear-gradient(150deg, #12141C, #05060A)",
    boxShadow: `inset 0 0 0 1.5px rgba(201,162,39,.5), inset 0 0 22% 4% ${c.lit}1F`
  })
};

// ══════════════════ CORNER RADIUS PER FINISH ══════════════════
/** Corner rounding per finish — a framed face wants less than a jewelled one. */
export const FINISH_RADIUS = {
  matte: "9%", velvet: "9%", leather: "9%", leatherdeep: "9%",
  aquarel: "6%", damask: "6%", frame: "6%",
  enamel: "11%", obsidian: "11%"
};
