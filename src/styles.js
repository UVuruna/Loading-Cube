// The one stylesheet, injected once per document on first mount.
//
// WHY THE CSS LIVES IN JS. A consumer gets Loading Cube by importing one module —
// asking them to also remember a <link> is how a component ends up unstyled
// in somebody's build. The rules are namespaced `lc-` throughout and touch
// nothing outside the mounted element, so dropping them into a host page
// cannot collide with the host's own styles.
//
// EVERY ANIMATION HERE IS COMPOSITOR WORK — transform and opacity only, never
// a property that forces layout. That is what lets the ring keep turning
// while the main thread is busy doing the very work the user is waiting for.
//
// See src/__about/styles.md.
"use strict";

const STYLE_ID = "loading-cube-styles";

const CSS = `
.lc-root{position:relative;display:grid;place-items:center;overflow:hidden;
  border-radius:inherit;--lc-spin:26s;--lc-drift:90s}

/* WITH SKY ON, THE ROOT IS THE FRAME (owner 2026-08-08). The sun and the moon
   ride the frame's edge, so "the frame" has to be something the embedder chose:
   the root fills its host and the cube keeps its own size in the middle. A root
   that sized itself to the cube left the sun a few pixels of travel, which is
   the whole reason it looked stuck behind the cube. */
.lc-root.lc-fill{width:100%;height:100%}

/* NOTHING INSIDE A FILLING ROOT IS IN FLOW, and that is deliberate.
   Two attempts got this wrong in the same way. An in-flow child carrying the
   cube's box (491px) inside a 426px frame made the root 491px tall: its grid row
   is auto-sized to its content, and an auto row only STRETCHES to a definite
   container while there is free space left to give — at 491 in a 426 box there is
   none, so the row kept the larger figure and height:100% resolved against it.
   The frame then clipped the ring, and the sun/moon maths, which trust the root's
   own rect, placed the moon against an edge that was not the visible one.
   Graded 2/10.
   With every child absolute the row's max-content is 0, free space is the whole
   container, and the row stretches to exactly the host. The one case that leaves
   — a host stating no height at all — is not decidable in CSS, so it is decided
   in JS where the measurement already happens (loading-cube.js _measure). */

/* The fit layer holds everything that must stay concentric — the ring and the
   cube — so ONE transform shrinks the whole composition when the host is
   smaller than it wants to be. ABSOLUTE, so it can never push the root around.
   The sun and the moon sit outside it: they ride the real frame and must not
   shrink with the cube. */
.lc-fit{position:absolute;inset:0;display:grid;place-items:center;
  transform-origin:50% 50%}

/* ── backdrops ────────────────────────────────────────────────────────
   Every layer is absolute and behind the stage; the cube's own z-index puts it
   in front without either one needing to know the other's size. */
.lc-scene,.lc-ground-day,.lc-ground-night{position:absolute;inset:0;
  pointer-events:none;z-index:0}
.lc-ground-day{background:linear-gradient(180deg,#8FCDF2,#DCEEF8)}
.lc-ground-night{background:linear-gradient(180deg,#0B0E1A,#2A3145)}

/* A cloud band is TWICE the frame wide and slides exactly half its own width,
   so the pixels it wraps onto are the pixels it left. */
.lc-cloud{position:absolute;left:0;width:200%;pointer-events:none;z-index:0;
  animation:lc-drift var(--lc-drift) linear infinite}
@keyframes lc-drift{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}

/* One element for a whole sky: a REPEATING tile of computed dots, so the field
   covers any frame at any aspect ratio without ever being measured. */
.lc-stars{position:absolute;inset:0;pointer-events:none;z-index:0}

/* The day-cycle backdrop cross-fades the night scene over the day one by
   OPACITY ALONE, written from JS — there is deliberately no CSS transition here.
   One re-armed on every rebuild and travelled from the element's default opacity
   of 1, so noon flashed a starry dusk for most of a second. See backdrop.js.
   (No backticks anywhere below this line: the whole stylesheet is one template
   literal, and a backtick in a CSS comment ends it — which is exactly how this
   file broke the first time it was run.) */

/* Painting order, stated once: backdrop 0, ring 1, sun/moon 2, cube 3. The cube
   is the subject, so nothing ever covers it; the body passes in FRONT of the
   ring, which is what the owner's morning/evening sketches show. */
.lc-stage{position:relative;display:grid;place-items:center;
  transform-style:preserve-3d;z-index:3}
.lc-cube{position:relative;transform-style:preserve-3d;will-change:transform}
.lc-face{position:absolute;inset:0;display:grid;place-items:center;
  backface-visibility:hidden;overflow:hidden}
.lc-emblem{width:44%;height:44%;opacity:.85;position:relative;z-index:1}
.lc-shade,.lc-lit{position:absolute;inset:0;pointer-events:none;z-index:2}

/* ── the core that closes the vertices ───────────────────────────────
   Six rounded faces meeting at 90 degrees leave a triangular notch at each of
   the eight vertices. The core is a SHARP cube of the SAME edge, and the
   rounded shell is pushed 0.6px outside it (--lc-zoff), so every notch looks
   onto the core instead of onto the page. A merely SCALED inner cube cannot do
   this: the notch sits at the outermost point of the silhouette, so an inner
   cube at 94% leaves the last 6% open — a light sliver, which is the defect
   with extra steps.
   The 0.6px offset itself is applied in JS (loading-cube.js SHELL_OFFSET_PX),
   because the same number has to move the face's translateZ and grow its inset
   by the same amount — one constant, not two that can drift. */
.lc-core{position:absolute;inset:0;transform-style:preserve-3d}
.lc-core .lc-face{border-radius:0;box-shadow:none}

/* the sun or the moon, riding the frame's edge */
.lc-body{position:absolute;pointer-events:none;user-select:none;z-index:2;
  filter:drop-shadow(0 0 14px rgba(255,255,255,.18))}

/* ── rings ────────────────────────────────────────────────────────
   Each layer is a DIV so its transform-origin is its own centre. An SVG <g>
   needs transform-box, and getting that wrong makes the ring orbit the page
   instead of spinning in place. */
.lc-ring{position:absolute;pointer-events:none;z-index:1}
.lc-ring-layer{position:absolute;inset:0}
.lc-ring-layer svg{width:100%;height:100%;display:block}

@keyframes lc-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes lc-turn-rev{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}
@keyframes lc-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
@keyframes lc-flicker{0%,100%{opacity:1}45%{opacity:.35}70%{opacity:.8}}
@keyframes lc-twinkle{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes lc-chase{from{stroke-dashoffset:0}to{stroke-dashoffset:-496}}

.lc-spin-slow{animation:lc-turn calc(var(--lc-spin) * 1.6) linear infinite}
.lc-spin-med {animation:lc-turn var(--lc-spin) linear infinite}
.lc-spin-rev {animation:lc-turn-rev calc(var(--lc-spin) * 0.75) linear infinite}
.lc-breathe  {animation:lc-breathe 5.2s ease-in-out infinite}
.lc-flicker  {animation:lc-flicker 1.4s ease-in-out infinite}
.lc-twinkle  {animation:lc-twinkle 2.6s ease-in-out infinite}
.lc-chase    {animation:lc-chase 2.2s linear infinite}

.lc-root.lc-paused .lc-ring-layer,
.lc-root.lc-paused .lc-cloud,
.lc-root.lc-paused .lc-flicker,
.lc-root.lc-paused .lc-twinkle,
.lc-root.lc-paused .lc-chase{animation-play-state:paused}

/* A loading indicator that stands still is a broken loading indicator, so
   reduced motion SLOWS the ornament rather than freezing it. */
@media (prefers-reduced-motion: reduce){
  .lc-root{--lc-spin:78s;--lc-drift:300s}
  .lc-flicker,.lc-twinkle,.lc-chase{animation:none;opacity:.8}
  .lc-breathe{animation-duration:14s}
}
`;

/** Inject the stylesheet once. Safe to call on every mount. */
export function ensureStyles(doc = document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  (doc.head || doc.documentElement).appendChild(style);
}
