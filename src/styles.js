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
  border-radius:inherit;--lc-spin:26s}
.lc-root.lc-bg-transparent{background:transparent}
.lc-root.lc-bg-dark{background:#05060A}
.lc-root.lc-bg-light{background:#E8E4DA}

.lc-stage{position:relative;display:grid;place-items:center;transform-style:preserve-3d}
.lc-cube{position:relative;transform-style:preserve-3d;will-change:transform}
.lc-face{position:absolute;inset:0;display:grid;place-items:center;
  backface-visibility:hidden;overflow:hidden}
.lc-emblem{width:44%;height:44%;opacity:.85;position:relative;z-index:1}
.lc-shade,.lc-lit{position:absolute;inset:0;pointer-events:none;z-index:2}

/* the sun or the moon, riding its orbit */
.lc-body{position:absolute;pointer-events:none;user-select:none;z-index:0;
  filter:drop-shadow(0 0 14px rgba(255,255,255,.18))}

/* ── rings ────────────────────────────────────────────────────────────
   Each layer is a DIV so its transform-origin is its own centre. An SVG <g>
   needs transform-box, and getting that wrong makes the ring orbit the page
   instead of spinning in place. */
.lc-ring{position:absolute;pointer-events:none;z-index:0}
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
.lc-root.lc-paused .lc-flicker,
.lc-root.lc-paused .lc-twinkle,
.lc-root.lc-paused .lc-chase{animation-play-state:paused}

/* A loading indicator that stands still is a broken loading indicator, so
   reduced motion SLOWS the ornament rather than freezing it. */
@media (prefers-reduced-motion: reduce){
  .lc-root{--lc-spin:78s}
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
